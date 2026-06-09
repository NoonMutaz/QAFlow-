'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQueueContext } from '../../context/QueueContext';
import Link from 'next/link';

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles = {
    High: 'bg-red-50 text-red-700 border-red-100 ring-red-500/20',
    Medium: 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20',
  };

  const styleKey = Object.keys(styles).includes(priority) ? priority : 'Low';

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[styleKey as keyof typeof styles]}`}>
      {priority}
    </span>
  );
};

const SkeletonRow = () => (
  <div className="animate-pulse flex items-center space-x-4 border-b border-slate-100 p-4">
    <div className="h-4 w-16 rounded bg-slate-200" />
    <div className="h-4 w-20 rounded bg-slate-200" />
    <div className="h-4 flex-1 rounded bg-slate-200" />
    <div className="h-8 w-24 rounded bg-slate-200" />
  </div>
);

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// --- Main Component ---
export default function Assigned() {
  const { myAssignedBugs, loadingMyBugs, fetchMyAssignedBugs, updateQueue } = useQueueContext();
  
  const [selectedBug, setSelectedBug] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  // State for communication notes/comments
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchMyAssignedBugs();
  }, [fetchMyAssignedBugs]);

  const handleStatusUpdate = async (projectId: string, bugId: number, nextStatus: any) => {
    if (!updateQueue) return;
    try {
      setUpdatingId(bugId);
      await updateQueue(projectId, bugId, nextStatus);
      
      if (selectedBug && selectedBug.id === bugId) {
        setSelectedBug((prev: any) => prev ? { ...prev, status: nextStatus } : null);
      }
      
      await fetchMyAssignedBugs();
    } catch (err) {
      console.error("Failure updating task status context:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddComment = async (bugId: number) => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    
    try {
      // TODO: Connect your backend API interaction here
      // await addCommentToBug(bugId, newComment);
      console.log(`Submitting comment for bug ${bugId}:`, newComment);
      
      setNewComment("");
      // Refresh logic or context payload re-fetch goes here
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getStatusStyles = (status: string) => {
    if (status === 'fixed') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'in-progress') return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  // --- Data Processing ---
  const formatDate = (value: any) => {
    if (!value) return '';
    if (typeof value === 'string' && isNaN(Number(value)) && value.includes(',')) return value;
    
    const timestamp = isNaN(Number(value)) ? Date.parse(value) : Number(value);
    if (isNaN(timestamp)) return String(value);

    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const processedBugs = useMemo(() => {
    if (!myAssignedBugs) return [];
    
    const sorted = [...myAssignedBugs].filter(b => {
      const currentStatus = b.status ?? (b as any).Status;
      return currentStatus !== 'fixed';
    });

    sorted.sort((a, b) => {
      const pA = a.priority ?? (a as any).Priority;
      const pB = b.priority ?? (b as any).Priority;
      const priorityScore = { High: 3, Medium: 2, Low: 1 };
      return (priorityScore[pB as keyof typeof priorityScore] || 1) - (priorityScore[pA as keyof typeof priorityScore] || 1);
    });

    return sorted;
  }, [myAssignedBugs]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 font-sans relative">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Queue</h1>
            <p className="mt-1 text-sm text-slate-500">You have {processedBugs.length} active assignments.</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 border-b border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-3">Task & Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-4">Details</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Loading State */}
          {loadingMyBugs && (
             <div className="divide-y divide-slate-100">
               {[1,2,3].map(i => <SkeletonRow key={i} />)}
             </div>
          )}

          {/* Empty State */}
          {!loadingMyBugs && processedBugs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-slate-50 p-4 ring-1 ring-slate-100">
                <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">All caught up!</h3>
            </div>
          )}

          {/* List View */}
          {!loadingMyBugs && processedBugs.length > 0 && (
            <ul className="divide-y divide-slate-100" role="list">
              {processedBugs.map((bugItem) => {
                const bug = bugItem as any;
                const bugId = bug.bugId ?? bug.BugId;
                const priority = bug.priority ?? bug.Priority;
                const status = bug.status ?? bug.Status;
                const description = bug.description ?? bug.Description;
                const projectId = bug.projectId ?? bug.ProjectId;
                
                const actualBugDate = bug.bugDate ?? bug.bugCreatedAt ?? bug.reportedAt ?? bug.createdAt ?? bug.BugDate;
                const assignmentDate = bug.assignedAt ?? bug.assignDate ?? bug.assignedDate ?? bug.AssignedAt;
                
                const rowHighlight = priority === 'High' ? 'border-l-4 border-l-red-500' : '';
                const isRowUpdating = updatingId === bug.id;

                return (
                  <li key={bug.id} className={`group relative flex flex-col gap-4 bg-white px-4 py-4 transition-colors hover:bg-slate-50 sm:grid sm:grid-cols-12 sm:items-center sm:gap-0 ${rowHighlight} ${isRowUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                    
                    <div className="col-span-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2 pr-2">
                      <span className="font-mono text-xs font-medium text-slate-400 min-w-[50px]">{bugId}</span>
                      
                      <select
                        value={status}
                        onChange={(e) => handleStatusUpdate(projectId, bug.id, e.target.value)}
                        disabled={isRowUpdating}
                        className={`text-[11px] font-bold border rounded-lg p-1.5 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer transition-colors max-w-[125px] sm:w-auto ${getStatusStyles(status)}`}
                      >
                        <option value="notFixed">Not Fixed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <PriorityBadge priority={priority} />
                    </div>

                    <div className="col-span-4 flex flex-col gap-1.5">
                      <p className="truncate font-medium text-slate-900 text-sm sm:text-base">
                        {description || "No description provided"}
                      </p>
                      
                      <div className="flex flex-col gap-0.5 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>Assigned by <strong className="text-slate-600 font-medium">{bug.assignedByName ?? bug.AssignedByName}</strong></span>
                          {assignmentDate && (
                            <span className="text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded font-mono text-[10px]">
                               {formatDate(assignmentDate)}
                            </span>
                          )}
                        </div>
                        {actualBugDate && (
                          <div className="text-slate-400">
                            Bug Opened by <strong className="text-slate-600 font-medium">{bug.name}</strong>: <span className="font-mono">{formatDate(actualBugDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBug(bugItem)}
                        className="flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:ring-slate-300 shadow-sm"
                      >
                        View bug
                      </button>
                      
                      <Link
                        href={`/dashboard/${projectId}`}
                        className="flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:ring-slate-300 shadow-sm"
                      >
                        View project
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* OVERLAY PANEL MODAL */}
      {selectedBug && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setSelectedBug(null)}
        >
          <div 
            className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  {selectedBug.bugId ?? (selectedBug as any).BugId}
                </span>
                <PriorityBadge priority={selectedBug.priority ?? (selectedBug as any).Priority} />
                <select
                  value={selectedBug.status ?? (selectedBug as any).Status}
                  disabled={updatingId === selectedBug.id}
                  onChange={(e) => handleStatusUpdate(
                    selectedBug.projectId ?? (selectedBug as any).ProjectId,
                    selectedBug.id,
                    e.target.value
                  )}
                  className={`text-[11px] font-bold border rounded-lg p-1 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer transition-colors ${getStatusStyles(selectedBug.status ?? (selectedBug as any).Status)}`}
                >
                  <option value="notFixed">Not Fixed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="fixed">Fixed</option>
                </select>
                {updatingId === selectedBug.id && (
                  <span className="text-[11px] text-slate-400 animate-pulse ml-1">Saving...</span>
                )}
              </div>
              <button
                onClick={() => setSelectedBug(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto p-6 space-y-6 text-sm">

              {/* Reporter & Dates Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Reporter", value: selectedBug.name ?? (selectedBug as any).Name },
                  { label: "Assigned by", value: selectedBug.assignedByName ?? (selectedBug as any).AssignedByName ?? "—" },
                  { label: "Created at", value: formatDate(selectedBug.bugDate ?? selectedBug.createdAt ?? selectedBug.bugCreatedAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</p>
                <div className="text-xs text-slate-700 bg-slate-50 border border-slate-100 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed min-h-[48px]">
                  {selectedBug.description ?? (selectedBug as any).Description ?? (
                    <span className="text-slate-400 italic">No description provided.</span>
                  )}
                </div>
              </div>

              {/* Expected / Actual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Expected Result</p>
                  <div className="text-xs text-slate-700 bg-emerald-50/40 border border-emerald-100 p-3 rounded-xl min-h-[64px] leading-relaxed">
                    {selectedBug.expectedResult ?? (selectedBug as any).ExpectedResult ?? (
                      <span className="text-slate-400 italic">Not defined.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Actual Result</p>
                  <div className="text-xs text-slate-700 bg-rose-50/40 border border-rose-100 p-3 rounded-xl min-h-[64px] leading-relaxed">
                    {selectedBug.actualResult ?? (selectedBug as any).ActualResult ?? (
                      <span className="text-slate-400 italic">Not logged.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* URL */}
              {(selectedBug.url ?? (selectedBug as any).Url) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Environment URL</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 truncate flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 font-mono">
                      {selectedBug.url ?? (selectedBug as any).Url}
                    </span>
                    <a
                      href={selectedBug.url ?? (selectedBug as any).Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 whitespace-nowrap transition-all"
                    >
                      Open ↗
                    </a>
                  </div>
                </div>
              )}

              {/* Notes */}
              {(selectedBug.note ?? (selectedBug as any).Note) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Team Notes</p>
                  <div className="text-xs text-slate-700 bg-amber-50/40 border border-amber-100 p-3 rounded-xl whitespace-pre-wrap leading-relaxed">
                    {selectedBug.note ?? (selectedBug as any).Note}
                  </div>
                </div>
              )}

              {/* Inline Attachment Viewer Block */}
              {(selectedBug.attachmentUrl ?? (selectedBug as any).AttachmentUrl) && (() => {
                const rawUrl = selectedBug.attachmentUrl ?? (selectedBug as any).AttachmentUrl;
                const fullUrl = rawUrl.startsWith('http') 
                  ? rawUrl 
                  : `${process.env.NEXT_PUBLIC_API_URL || ''}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                  
                const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(rawUrl);

                return (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attachment</p>
                      <a 
                        href={fullUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Open original ↗
                      </a>
                    </div>
                    
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100/50 shadow-inner">
                      {isVideo ? (
                        <video 
                          controls 
                          className="w-full max-h-80 object-contain bg-black"
                          src={fullUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                          <img
                            src={fullUrl}
                            alt="Bug Reproduction Attachment"
                            className="w-full max-h-80 object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement?.insertAdjacentHTML('beforeend', '<div class="p-4 text-xs text-red-500 text-center">Failed to load attachment.</div>');
                            }}
                          />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Linked Test Case */}
              {(selectedBug.testCaseId ?? (selectedBug as any).TestCaseId ?? selectedBug.TestCase) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Linked Test Case</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {selectedBug.testCase?.title ?? selectedBug.TestCase?.title ?? selectedBug.TestCase?.Title ?? `ID: ${selectedBug.testCaseId ?? (selectedBug as any).TestCaseId}`}
                  </span>
                </div>
              )}

              {/* Communication (Dev & Tester Comments) */}
              <div className="pt-4 border-t border-slate-100 mt-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Communication</p>
                
                <div className="space-y-4 mb-4">
                  {(selectedBug.comments || selectedBug.Comments || []).map((comment: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {(comment.authorName || comment.AuthorName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl rounded-tl-none p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-700">{comment.authorName || comment.AuthorName || 'Unknown User'}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt || comment.CreatedAt)}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{comment.text || comment.Text}</p>
                      </div>
                    </div>
                  ))}

                  {/* Empty Comments State */}
                  {!(selectedBug.comments || selectedBug.Comments)?.length && (
                    <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                      <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation! <span className="text-red-600 font-bold">(Feature in development)</span></p>
                    </div>
                  )}
                </div>

                {/* New Comment Submission Input */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                    You
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask a question or provide an update..."
                      className="w-full text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none min-h-[80px] shadow-sm transition-shadow"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleAddComment(selectedBug.id)}
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                      >
                        {isSubmittingComment ? 'Sending...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
              <span>
                Project: <Link href={`/dashboard/${selectedBug.projectId ?? (selectedBug as any).ProjectId}`} className="text-blue-600 font-semibold hover:underline">
                  View project ↗
                </Link>
              </span>
              {(selectedBug.assignedAt ?? selectedBug.assignDate) && (
                <span>Assigned: <span className="font-mono text-slate-500">{formatDate(selectedBug.assignedAt ?? selectedBug.assignDate)}</span></span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}