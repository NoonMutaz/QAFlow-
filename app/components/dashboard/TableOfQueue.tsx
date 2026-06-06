"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useQueueContext, Status, Priority } from "../../context/QueueContext";
import RemoveModal from "./RemoveModal";
import FilterByStatus from "./FilterByStatus";
import FilterByPriority from "./FilterByPriority";

//Helpers 
const isVideo = (url?: string): boolean => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
};

const PriorityBadge = ({ priority, onClick, disabled }: { priority: Priority; onClick: () => void; disabled: boolean }) => {
  const styles = {
    High: "bg-red-500 text-white shadow-red-200",
    Medium: "bg-amber-400 text-amber-900 shadow-amber-100",
    Low: "bg-emerald-500 text-white shadow-emerald-200"
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm transition-transform active:scale-90 ${styles[priority]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}`}
    >
      {priority}
    </button>
  );
};

// Main Component
export default function TableOfQueue({ 
  filteredQueue, 
  projectId, 
  updateQueue, 
  removeQueue, 
  updatePriorityQueue, 
  currentUserRole, 
  select, 
  setSelect, 
  selectP, 
  setSelectP 
}: any) {
  const { fetchBugs, updateBugInState, projectMembers, fetchProjectMembers, assignBug } = useQueueContext();
  
  const [openModalId, setOpenModalId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- Track upload states per bug ID ---
  const [uploadingBugIds, setUploadingBugIds] = useState<{ [key: number]: boolean }>({});

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const canEdit = ["owner", "member"].includes(currentUserRole);
  const canEditViwer = ["viewer", "member"].includes(currentUserRole);
  const canDelete = currentUserRole === "owner";

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredQueue.length]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredQueue.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQueue.slice(start, start + pageSize);
  }, [filteredQueue, currentPage]);

  const handleUpload = async (file: File, bugId: number) => {
    const fd = new FormData();
    fd.append("file", file);
    const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
    
    // Set loading to true for this specific bug row
    setUploadingBugIds(prev => ({ ...prev, [bugId]: true }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${bugId}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        
        if (typeof updateBugInState === 'function') {
          updateBugInState(projectId, bugId, { attachmentUrl: data.attachmentUrl });
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      // Clear loading state for this bug row
      setUploadingBugIds(prev => ({ ...prev, [bugId]: false }));
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectMembers(projectId.toString());
    }
  }, [projectId, fetchProjectMembers]);

  return (
    <div className="space-y-4 font-sans">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border">
        <div className="flex items-center gap-3">
          <FilterByStatus select={select} setSelect={setSelect} />
          <FilterByPriority selectP={selectP} setSelectP={setSelectP} />
        </div>
        <div className="px-4 py-1.5 bg-white border rounded-full text-[11px] font-bold shadow-sm">
          ROLE: <span className="text-blue-600 uppercase">{currentUserRole}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                {["ID", "Reporter", "Priority", "URL", "Expected", "Actual", "Description", "Status", "Created", "Note", "Attachment", "Actions","Assigend to"].map((h) => (
                  <th key={h} className="px-4 py-4 text-[10px] font-black uppercase text-gray-600 tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((bug: any) => (
                <tr key={bug.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-4 font-mono text-xs font-bold text-blue-600">{bug.bugId}</td>
                  <td className="px-4 py-4 text-xs font-semibold text-gray-700">{bug.name}</td>
                  <td className="px-4 py-4" title="click to change">
                    <PriorityBadge
                      priority={bug.priority} 
                      onClick={() => {
                        const order: Priority[] = ["High", "Medium", "Low"];
                        updatePriorityQueue(projectId, bug.id, order[(order.indexOf(bug.priority) + 1) % 3]);
                      }}
                      disabled={!canEdit}
                    />
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <EditableCell value={bug.url} field="url" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} />
                      <a href={bug.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 font-bold hover:underline">OPEN ↗</a>
                    </div>
                  </td>

                  <td className="px-4 py-4"><EditableCell value={bug.expectedResult} field="expectedResult" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} /></td>
                  <td className="px-4 py-4"><EditableCell value={bug.actualResult} field="actualResult" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} /></td>
                  <td className="px-4 py-4"><EditableCell value={bug.description} field="description" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} /></td>
                  
                  <td className="px-4 py-4">
                    <select
                      value={bug.status}
                      onChange={(e) => updateQueue(projectId, bug.id, e.target.value as Status)}
                      className={`text-[11px] font-bold border rounded-lg p-1.5 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer ${bug.status === 'fixed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : bug.status === 'in-progress' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                    >
                      <option value="notFixed">Not Fixed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </td>

                  <td className="px-4 py-4 text-[10px] text-gray-500 font-medium whitespace-nowrap">
                   {new Date(bug.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  <td className="px-4 py-4"><EditableCell value={bug.note || ""} field="note" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} placeholder="Team notes..." /></td>
                  
                  {/* Attachment Column with New Upload Indicator */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2 relative min-w-[80px]">
                      {bug.attachmentUrl && !uploadingBugIds[bug.id] && (
                        <div className="relative w-12 h-10 rounded-lg border overflow-hidden bg-black cursor-pointer shadow-sm hover:scale-110 transition-transform" onClick={() => setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}${bug.attachmentUrl}`)}>
                          {isVideo(bug.attachmentUrl) ? (
                            <div className="flex items-center justify-center h-full text-white"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/></svg></div>
                          ) : (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL}${bug.attachmentUrl}`} className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                      
                      {canEdit && !uploadingBugIds[bug.id] && (
                        <label className="text-[9px] font-black text-blue-600 cursor-pointer uppercase hover:underline">
                          Upload <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], bug.id)} />
                        </label>
                      )}

                      {/* Dynamic Saving Indicator */}
                      {uploadingBugIds[bug.id] && (
                        <div className="flex items-center gap-1 text-blue-600 text-[10px] font-bold animate-pulse">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                          Saving...
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <button onClick={() => setOpenModalId(bug.id)} disabled={!canDelete} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-20">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>

                  <td className="px-4 py-4">
                    <select
                      value={bug.assignedToUserId ?? ""}
                      onChange={async (e) => {
                        const val = e.target.value;
                        const targetUserId = val ? Number(val) : null;
                        await assignBug(projectId, bug.id, targetUserId);
                      }}
                      disabled={!canEdit}
                      className="text-[11px] font-bold border border-gray-200 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-400 outline-none bg-white min-w-[140px] disabled:opacity-50 transition-all cursor-pointer hover:border-gray-300"
                    >
                      <option value="">Unassigned</option>
                      {projectMembers.map((member: any) => (
                        <option key={member.userId} value={member.userId}>
                          {member.name}
                        </option>
                      ))}
                    </select>

                    {bug.assignedToEmail && (
                      <div className="flex items-center gap-1 mt-1.5 transition-all">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold shadow-sm">
                          {bug.assignedToEmail[0]?.toUpperCase()}
                        </div>
                        <span className="text-[9px] text-gray-500 font-medium truncate max-w-[90px]" title={bug.assignedToEmail}>
                          {bug.assignedToEmail.split('@')[0]}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredQueue.length === 0 && (
            <div className="py-20 flex flex-col items-center text-gray-400">
              <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-sm font-bold tracking-widest uppercase">No Bugs Found</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm mt-4">
          <div className="text-xs text-gray-500 font-bold uppercase">
            Page <span className="text-blue-600">{currentPage}</span> of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-[10px] font-black bg-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-200 transition-all uppercase tracking-widest"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-[10px] font-black bg-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-200 transition-all uppercase tracking-widest"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {openModalId && <RemoveModal customer={filteredQueue.find((b:any)=>b.id === openModalId)} onClose={() => setOpenModalId(null)} removeQueue={() => removeQueue(projectId, openModalId)} />}
      
      {previewUrl && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
          <div className="max-w-5xl w-full flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            {isVideo(previewUrl) ? <video src={previewUrl} controls autoPlay className="max-h-[80vh] rounded-lg shadow-2xl" /> : <img src={previewUrl} className="max-h-[80vh] rounded-lg shadow-2xl" alt="Preview" />}
            <button onClick={() => setPreviewUrl(null)} className="bg-white px-8 py-2 rounded-full font-bold text-black hover:bg-gray-200 transition-colors">CLOSE PREVIEW</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Editable Cell Sub-component ---
function EditableCell({ value, field, bugId, projectId, canEdit, updateBugInState, placeholder }: any) {
  const [local, setLocal] = useState(value);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setLocal(value); }, [value]);

  const save = async () => {
    if (!canEdit || local === value) { setEditing(false); return; }
    setLoading(true);
    try {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${bugId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ field: field.toLowerCase(), value: local }),
      });
   
      if (res.ok) {
        if (typeof updateBugInState === 'function') {
          updateBugInState(projectId, bugId, { [field]: local });
        }
      } else {
        setLocal(value);
      }
    } catch (e) {
      setLocal(value);
    } finally {
      setLoading(false);
      setEditing(false);
    }
  };

  return (
    <div className="min-w-[150px] relative">
      {editing ? (
        <textarea 
          autoFocus 
          value={local} 
          onChange={e => setLocal(e.target.value)} 
          onBlur={save}
          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); } }}
          className="w-full p-2 text-xs border-2 border-blue-400 rounded-lg shadow-inner focus:outline-none bg-white z-20 relative" 
          rows={2} 
        />
      ) : (
        <div 
          onClick={() => canEdit && setEditing(true)}
          className={`p-2 text-xs border border-transparent rounded-lg line-clamp-2 transition-all ${canEdit ? 'hover:bg-gray-100 hover:border-gray-200 cursor-text' : 'cursor-default'}`}
        >
          {local || <span className="text-gray-300 italic">{placeholder}</span>}
        </div>
      )}
      {loading && (
        <div className="absolute -top-10 right-0 flex items-center gap-1 px-3 py-1.5 bg-blue-100 border border-blue-200 text-blue-800 text-xs rounded-full shadow-lg z-10">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          Saving...
        </div>
      )}
    </div>
  );
}