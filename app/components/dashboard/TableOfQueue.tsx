"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useQueueContext, Status, Priority } from "../../context/QueueContext";
import RemoveModal from "./RemoveModal";
import FilterByStatus from "./FilterByStatus";
import FilterByPriority from "./FilterByPriority";

// Helper function to detect video file extensions
const isVideo = (url?: string): boolean => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
};

// Priority Badge Component
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
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all active:scale-90 ${styles[priority]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}`}
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

  // Track expanded row IDs
  const [expandedBugIds, setExpandedBugIds] = useState<{ [key: number]: boolean }>({});

  // Track upload state per bug ID
  const [uploadingBugIds, setUploadingBugIds] = useState<{ [key: number]: boolean }>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const canEdit = ["owner", "member"].includes(currentUserRole);
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

  // Toggle open/closed row details
  const toggleRowExpansion = (bugId: number) => {
    setExpandedBugIds(prev => ({
      ...prev,
      [bugId]: !prev[bugId]
    }));
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3">
          <FilterByStatus select={select} setSelect={setSelect} />
          <FilterByPriority selectP={selectP} setSelectP={setSelectP} />
        </div>
        <div className="px-4 py-1.5 bg-white border border-gray-150 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          ROLE: <span className="text-blue-600 uppercase">{currentUserRole}</span>
        </div>
      </div>

      {/* Clean Table Grid Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-4"></th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap">ID</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap">Reporter</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap">Priority</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap">Summary / Description</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((bug: any) => {
                const isExpanded = !!expandedBugIds[bug.id];
                return (
                  <React.Fragment key={bug.id}>
                    
                    {/* Collapsed/Primary Row */}
                    <tr 
                      onClick={() => toggleRowExpansion(bug.id)}
                      className={`hover:bg-blue-50/10 transition-colors cursor-pointer group ${isExpanded ? 'bg-blue-50/20' : ''}`}
                    >
                      {/* Accordion Arrow Dropdown Hook */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <svg 
                            className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </td>

                      {/* Bug ID */}
                      <td className="px-4 py-4 font-mono text-xs font-bold text-blue-600 whitespace-nowrap">
                        {bug.bugId}
                      </td>

                      {/* Name / Reporter */}
                      <td className="px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                        {bug.name}
                      </td>

                      {/* Priority Component */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <PriorityBadge
                          priority={bug.priority} 
                          onClick={() => {
                            const order: Priority[] = ["High", "Medium", "Low"];
                            updatePriorityQueue(projectId, bug.id, order[(order.indexOf(bug.priority) + 1) % 3]);
                          }}
                          disabled={!canEdit}
                        />
                      </td>
                      
                      {/* Truncated Description Snippet */}
                      <td className="px-4 py-4 max-w-[200px] md:max-w-md">
                        <p className="text-xs text-gray-600 truncate font-medium">
                          {bug.description || <span className="text-gray-300 italic">No details written</span>}
                        </p>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={bug.status}
                          onChange={(e) => updateQueue(projectId, bug.id, e.target.value as Status)}
                          className={`text-[11px] font-bold border rounded-lg p-1.5 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer ${
                            bug.status === 'fixed' 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : bug.status === 'in-progress' 
                                ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                : 'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="notFixed">Not Fixed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </td>

                      {/* Member Assignment Section */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <select
                            value={bug.assignedToUserId ?? ""}
                            onChange={async (e) => {
                              const val = e.target.value;
                              const targetUserId = val ? Number(val) : null;
                              await assignBug(projectId, bug.id, targetUserId);
                            }}
                            disabled={!canEdit}
                            className="text-[11px] font-bold border border-gray-200 rounded-lg p-1 focus:ring-2 focus:ring-blue-400 outline-none bg-white min-w-[125px] disabled:opacity-50 transition-all cursor-pointer hover:border-gray-300"
                          >
                            <option value="">Unassigned</option>
                            {projectMembers.map((member: any) => (
                              <option key={member.userId} value={member.userId}>
                                {member.name}
                              </option>
                            ))}
                          </select>

                          {bug.assignedToEmail && (
                            <div className="flex items-center gap-1 shrink-0" title={bug.assignedToEmail}>
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold shadow-sm">
                                {bug.assignedToEmail[0]?.toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Embedded Details Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={7} className="px-8 py-6 border-l-4 border-blue-500">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Left Side: Reproductions and URL strings (2/3 width) */}
                            <div className="space-y-4 lg:col-span-2">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b pb-1">Reproduction & Environment</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Expected Result</span>
                                  <EditableCell value={bug.expectedResult} field="expectedResult" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} />
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Actual Result</span>
                                  <EditableCell value={bug.actualResult} field="actualResult" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} />
                                </div>
                              </div>

                              <div className="pt-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Full Long-form Description</span>
                                <EditableCell value={bug.description} field="description" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} />
                              </div>

                              <div className="pt-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Environment Testing URL</span>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <EditableCell value={bug.url} field="url" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} />
                                  </div>
                                  {bug.url && (
                                    <a href={bug.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 whitespace-nowrap transition-all">
                                      Open URL ↗
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Attachments, notes, timelines and actions (1/3 width) */}
                            <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b pb-1">Media Files & Notes</h4>
                              
                              {/* Attachments Section */}
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Evidence Attachment</span>
                                <div className="flex items-center gap-3">
                                  {bug.attachmentUrl && !uploadingBugIds[bug.id] && (
                                    <div 
                                      className="relative w-16 h-12 rounded-lg border overflow-hidden bg-black cursor-pointer shadow-sm hover:scale-105 transition-all shrink-0" 
                                      onClick={() => setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}${bug.attachmentUrl}`)}
                                    >
                                      {isVideo(bug.attachmentUrl) ? (
                                        <div className="flex items-center justify-center h-full text-white bg-slate-900">
                                          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
                                          </svg>
                                        </div>
                                      ) : (
                                        <img src={`${process.env.NEXT_PUBLIC_API_URL}${bug.attachmentUrl}`} className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                  )}

                                  <div className="flex flex-col gap-1">
                                    {canEdit && !uploadingBugIds[bug.id] && (
                                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer text-xs font-semibold text-gray-600 transition-colors">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        <span>Upload File</span>
                                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], bug.id)} />
                                      </label>
                                    )}

                                    {uploadingBugIds[bug.id] && (
                                      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold animate-pulse">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                        Saving file...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Collaborative notes */}
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Internal Team Notes</span>
                                <EditableCell value={bug.note || ""} field="note" bugId={bug.id} projectId={projectId} canEdit={canEdit} updateBugInState={updateBugInState} placeholder="Add comments/notes..." />
                              </div>

                              {/* Auditing Metadata timestamps */}
                              <div className="text-[10px] text-gray-400 pt-1 flex justify-between items-center">
                                <span>Created At:</span>
                                <span className="font-semibold text-gray-600">
                                  {new Date(bug.createdAt).toLocaleString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              {/* Actions / Operations */}
                              <div className="flex justify-between items-center border-t pt-3 mt-2">
                                <span className="text-[9px] uppercase tracking-wider text-gray-400">Database Tools:</span>
                                <button 
                                  onClick={() => setOpenModalId(bug.id)} 
                                  disabled={!canDelete} 
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 disabled:opacity-20 transition-all"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span>Remove Bug</span>
                                </button>
                              </div>

                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
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

      {/* Modals & Media Zoom Viewers */}
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