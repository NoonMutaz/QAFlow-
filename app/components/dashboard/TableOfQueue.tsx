"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import FilterByStatus from "./FilterByStatus";
import RemoveModal from "./RemoveModal";
import FilterByPriority from "./FilterByPriority";
import Link from "next/link";

type Status = "notFixed" | "in-progress" | "fixed";
type Priority = "High" | "Medium" | "Low";
type UserRole = "owner" | "member" | "viewer";

interface Customer {
  id: number;
  bugId: string;
  name: string;
  priority: Priority;
  status: Status;
  createdAt: number;
  url: string;
  expectedResult: string;
  actualResult: string;
  description: string;
  note: string;
  attachmentUrl?: string;
}

interface TableProps {
  filteredQueue: Customer[];
  projectId: string;
  updateQueue: (projectId: string, id: number, status: Status) => void;
  removeQueue: (projectId: string, id: number) => void;
  select: Status | "";
  setSelect: React.Dispatch<React.SetStateAction<Status | "">>;
  selectP: Priority | "";
  setSelectP: React.Dispatch<React.SetStateAction<Priority | "">>;
  updatePriorityQueue: (projectId: string, id: number, newPriority: Priority) => void;
  currentUserRole?: UserRole;
}

export default function TableOfQueue({
  filteredQueue,
  select,
  setSelect,
  selectP,
  setSelectP,
  projectId,
  updateQueue,
  removeQueue,
  updatePriorityQueue,
  currentUserRole = "viewer",
}: TableProps) {
  const [openModalId, setOpenModalId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

const canEditTextareas = ["owner", "member"].includes(currentUserRole); //   Viewer NO
const canEditStatus = ["owner", "member", "viewer"].includes(currentUserRole);  //  Viewer YES
const canChangePriority = ["owner", "member"].includes(currentUserRole);        //  Viewer NO  
const canUpload = ["owner", "member"].includes(currentUserRole);               //  Viewer NO
const canDelete = ["owner"].includes(currentUserRole);  
  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredQueue.length, select, selectP]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredQueue.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQueue = useMemo(() => {
    return filteredQueue.slice(startIndex, endIndex);
  }, [filteredQueue, currentPage]);

  // Color helpers
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High": return "bg-red-600 text-white border-red-600";
      case "Medium": return "bg-yellow-200 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-600 text-white border-green-600";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "notFixed": return "bg-blue-100 text-blue-700";
      case "in-progress": return "bg-purple-100 text-purple-700";
      case "fixed": return "bg-emerald-100 text-emerald-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handlePriorityToggle = (id: number, currentPriority: Priority) => {
    if (!canChangePriority) return;
    const priorityOrder: Priority[] = ["High", "Medium", "Low"];
    const nextPriority = priorityOrder[(priorityOrder.indexOf(currentPriority) + 1) % priorityOrder.length];
    updatePriorityQueue(projectId, id, nextPriority);
  };

  const handleUpload = async (file: File, bugId: number) => {
    if (!canUpload) return;
    
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${bugId}/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

      if (res.ok) {
        window.location.reload();
      } else {
        const text = await res.text();
        alert("Upload failed: " + text);
      }
    } catch (error) {
      alert("Upload failed");
    }
  };

  // Pagination handlers
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPage = (page: number) => page >= 1 && page <= totalPages && setCurrentPage(page);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Editable Textarea Component
  const EditableTextarea = React.memo(({
    value,
    field,
    customerId,
    placeholder = "",
    maxWidth = "max-w-xs",
    rows = 2
  }: {
    value: string;
    field: keyof Customer;
    customerId: number;
    placeholder?: string;
    maxWidth?: string;
    rows?: number;
  }) => {
    const [localValue, setLocalValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const saveChanges = useCallback(async () => {
      if (!canEditTextareas || localValue === value) {
        setIsEditing(false);
        return;
      }

      setSaving(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${customerId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ [field]: localValue }),
          }
        );

        if (res.ok) {
          // Notify parent component
          window.dispatchEvent(new CustomEvent("bug-updated", { 
            detail: { customerId, field: field as string, value: localValue } 
          }));
        } else {
          alert(`Failed to save ${field}`);
          setLocalValue(value);
        }
      } catch (error) {
        console.error("Save failed:", error);
        alert("Save failed");
        setLocalValue(value);
      } finally {
        setSaving(false);
        setIsEditing(false);
      }
    }, [localValue, value, customerId, field, projectId]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        saveChanges();
      }
      if (e.key === "Escape") {
        setLocalValue(value);
        setIsEditing(false);
      }
    };

    return (
      <div className={`relative ${maxWidth}`}>
        {isEditing ? (
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={saveChanges}
            onKeyDown={handleKeyDown}
            rows={rows}
            className="w-full px-3 py-2 border-2 border-blue-300 rounded-md text-xs resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white transition-all"
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <div
            className={`group w-full px-3 py-2 border rounded-md text-xs bg-gray-50 hover:bg-gray-100 min-h-[3.5rem] flex items-center transition-all ${
              canEditTextareas 
                ? "hover:border-blue-300 hover:shadow-sm cursor-pointer border-gray-200" 
                : "border-gray-200 cursor-not-allowed opacity-70"
            }`}
            onClick={() => canEditTextareas && setIsEditing(true)}
            title={canEditTextareas ? "Click to edit (Enter=save, Esc=cancel)" : "Read-only"}
          >
            <span className="block truncate leading-relaxed flex-1">
              {localValue || placeholder || "No content"}
            </span>
            {canEditTextareas && (
              <svg 
                className="w-4 h-4 ml-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </div>
        )}
        {saving && (
          <div className="absolute -top-7 right-0 flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            Saving...
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="space-y-4">
      {/* Filters & Role Info */}
      <div className="px-6 py-4 flex gap-4 flex-wrap items-center bg-gray-50 rounded-t-xl border-b border-gray-200">
        <FilterByStatus select={select} setSelect={setSelect} />
        <FilterByPriority setSelectP={setSelectP} selectP={selectP} />
        <div className="ml-auto flex items-center gap-3 text-sm text-gray-600">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredQueue.length)} of {filteredQueue.length}
          </span>
          <span className="px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-xs font-medium rounded-full capitalize border">
            {currentUserRole}
          </span>
        </div>
      </div>
      {/* UPDATED Role Legend */}
      <div className="px-6 py-3 bg-gradient-to-r from-emerald-50 to-indigo-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold shadow-sm border border-emerald-200"> Owner: Full access</span>
          <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full font-semibold shadow-sm border border-indigo-200"> Member: Edit + Priority + Upload</span>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full font-semibold shadow-sm border border-blue-200"> Viewer: status only</span>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              {["ID", "Reporter", "Priority", "URL", "Expected", "Actual", "Description", "Status", "Created", "Note", "Attachment", "Actions"].map((header, i) => (
                <th key={i} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedQueue.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">No bugs found</p>
                      <p className="text-xs text-gray-400">Try adjusting filters</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedQueue.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Bug ID */}
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-semibold text-gray-900">
                    {customer.bugId}
                  </td>

                  {/* Reporter */}
                  <td className="px-6 py-4 font-medium text-sm text-gray-900">
                    {customer.name}
                  </td>

                  {/* Priority - MEMBERS CAN CHANGE */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      disabled={!canChangePriority}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium ${
                        getPriorityColor(customer.priority)
                      }`}
                     onClick={() => handlePriorityToggle(customer.id, customer.priority)}
                      title={canChangePriority ? "Cycle priority (High→Medium→Low)" : "No permission"}
                    >
                      {customer.priority}
                    </button>
                  </td>

                  {/* URL */}
                  <td className="px-6 py-4 w-48">
                    <Link href={customer.url} target="_blank" className="block">
                      <input
                        value={customer.url}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs bg-gray-50 hover:bg-gray-100 cursor-pointer transition text-ellipsis overflow-hidden"
                      />
                    </Link>
                  </td>

                  {/* Expected Result - EDITABLE */}
                  <td className="px-6 py-4">
                    <EditableTextarea
                      value={customer.expectedResult}
                      field="expectedResult"
                      customerId={customer.id}
                      placeholder="Expected result..."
                    />
                  </td>

                  {/* Actual Result - EDITABLE */}
                  <td className="px-6 py-4">
                    <EditableTextarea
                      value={customer.actualResult}
                      field="actualResult"
                      customerId={customer.id}
                      placeholder="What happened..."
                    />
                  </td>

                  {/* Description - EDITABLE */}
                  <td className="px-6 py-4">
                    <EditableTextarea
                      value={customer.description}
                      field="description"
                      customerId={customer.id}
                      placeholder="Describe the bug..."
                      maxWidth="max-w-lg"
                    />
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={customer.status}
                      onChange={(e) => canEditStatus && updateQueue(projectId, customer.id, e.target.value as Status)}
                      disabled={!canEditStatus}
                      className={`w-32 py-2 px-3 border rounded-md text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 ${getStatusColor(customer.status)}`}
                    >
                      <option value="notFixed">Not Fixed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(customer.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  {/* Note - EDITABLE */}
                  <td className="px-6 py-4">
                    <EditableTextarea
                      value={customer.note || ""}
                      field="note"
                      customerId={customer.id}
                      placeholder="Team notes..."
                    />
                  </td>

                  {/* Attachment - MEMBERS CAN UPLOAD */}
                  <td className="px-6 py-4 max-w-[160px]">
                    <div className="flex flex-col items-start gap-2">
                      {customer.attachmentUrl && (
                        customer.attachmentUrl.match(/\.(mp4|webm|mov)$/i) ? (
                          <video
                            src={`${process.env.NEXT_PUBLIC_API_URL}${customer.attachmentUrl}`}
                            controls
                            className="max-w-[120px] max-h-[80px] rounded-lg border shadow-sm"
                          />
                        ) : (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${customer.attachmentUrl}`}
                            alt="Attachment"
                            className="max-w-[120px] max-h-[80px] object-cover rounded-lg border shadow-sm hover:opacity-90 transition cursor-zoom-in"
                            onClick={() => setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}${customer.attachmentUrl}`)}
                          />
                        )
                      )}
                      {canUpload ? (
                        <label className="cursor-pointer w-full">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                                                        onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(file, customer.id);
                            }}
                          />
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-xs bg-white shadow-sm w-full justify-center">
                            <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-gray-600 font-medium">
                              {customer.attachmentUrl ? "Replace" : "Attach"}
                            </span>
                          </div>
                        </label>
                      ) : (
                        <div className="w-full px-3 py-2 text-xs text-gray-500 bg-gray-100 rounded-lg text-center font-medium">
                          No upload access
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      disabled={!canDelete}
                      className="w-full p-2.5 flex justify-center items-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-all hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      onClick={() => canDelete && setOpenModalId(customer.id)}
                      title={canDelete ? "Delete bug" : "No delete permission"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    {openModalId === customer.id && canDelete && (
                      <RemoveModal
                        removeQueue={(id) => removeQueue(projectId, id)}
                        customer={customer}
                        onClose={() => setOpenModalId(null)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(endIndex, filteredQueue.length)}</span> of{' '}
              <span className="font-semibold">{filteredQueue.length}</span> results
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 bg-white border-gray-300 shadow-sm hover:shadow-md flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Prev
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white border-gray-300 hover:bg-gray-100 hover:shadow-md hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 bg-white border-gray-300 shadow-sm hover:shadow-md flex items-center gap-1"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Fullscreen Preview */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[95vh] bg-black/50 rounded-2xl shadow-2xl backdrop-blur-sm p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-4 right-0 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:scale-105 transition-all border border-white/20 flex items-center gap-2 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
            <img
              src={previewUrl}
              alt="Full preview"
              className="max-w-full max-h-[95vh] object-contain rounded-xl shadow-2xl"
              onError={() => setPreviewUrl(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}