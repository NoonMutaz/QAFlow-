'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQueueContext } from '../context/QueueContext';
import Link from 'next/link';

// --- UI Utilities ---

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

export default function Page() {
  const { myAssignedBugs, loadingMyBugs, fetchMyAssignedBugs, updateQueue } = useQueueContext();
  
  const [selectedBug, setSelectedBug] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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
                // Cast to any to bypass strict 'Customer' key checks during mapping loops
                const bug = bugItem as any;

                const bugId = bug.bugId ?? bug.BugId;
                const priority = bug.priority ?? bug.Priority;
                const status = bug.status ?? bug.Status;
                const description = bug.description ?? bug.Description;
                const projectId = bug.projectId ?? bug.ProjectId;
                
                // 1. True Bug Creation Date
                const actualBugDate = bug.bugDate ?? bug.bugCreatedAt ?? bug.reportedAt ?? bug.createdAt ?? bug.BugDate;
                
                // 2. Queue Assignment Timestamp
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
                      
                      {/* Meta timestamps row */}
                      <div className="flex flex-col gap-0.5 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>Assigned by <strong className="text-slate-600 font-medium">{bug.assignedByName ?? bug.AssignedByName}</strong></span>
                          {assignmentDate && (
                            <span className="text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded font-mono text-[10px]">
                              Assigned: {formatDate(assignmentDate)}
                            </span>
                          )}
                        </div>
                        {actualBugDate && (
                          <div className="text-slate-400">
                            Bug Opened: <span className="font-mono">{formatDate(actualBugDate)}</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedBug(null)}
        >
          <div 
            className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-transform max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold tracking-tight text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    {selectedBug.bugId ?? (selectedBug as any).BugId}
                  </span>
                  <PriorityBadge priority={selectedBug.priority ?? (selectedBug as any).Priority} />
                  
                  <select
                    value={selectedBug.status ?? (selectedBug as any).Status}
                    disabled={updatingId === selectedBug.id}
                    onChange={(e) => handleStatusUpdate(selectedBug.projectId ?? (selectedBug as any).ProjectId, selectedBug.id, e.target.value)}
                    className={`text-[11px] font-bold border rounded-lg p-1 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer transition-colors ${getStatusStyles(selectedBug.status ?? (selectedBug as any).Status)}`}
                  >
                    <option value="notFixed">Not Fixed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="fixed">Fixed</option>
                  </select>

                  {updatingId === selectedBug.id && (
                    <span className="text-[11px] font-medium text-slate-400 animate-pulse ml-2">
                      Saving...
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-2">Extended Assignment Diagnostics</h2>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedBug(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200/80 p-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Core Description Summary</h4>
                <p className="text-slate-700 bg-slate-50 border border-slate-100 p-3.5 rounded-xl font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedBug.description ?? (selectedBug as any).Description ?? "No core description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expected Blueprint Outcome</h4>
                  <div className="text-xs text-slate-700 bg-emerald-50/30 border border-emerald-100/60 p-3 rounded-xl min-h-[70px] leading-relaxed">
                    {selectedBug.expectedResult ?? (selectedBug as any).ExpectedResult ?? (
                      <span className="text-slate-400 italic">No expected metrics defined.</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Observed Actual Failure Trace</h4>
                  <div className="text-xs text-slate-700 bg-rose-50/30 border border-rose-100/60 p-3 rounded-xl min-h-[70px] leading-relaxed">
                    {selectedBug.actualResult ?? (selectedBug as any).ActualResult ?? (
                      <span className="text-slate-400 italic">No execution failure footprints logged.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-400 px-5">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span>Assigned by: <strong className="text-slate-700 font-semibold">{selectedBug.assignedByName ?? (selectedBug as any).AssignedByName ?? 'System'}</strong></span>
                {(selectedBug.assignedAt || selectedBug.assignDate || selectedBug.assignedDate || (selectedBug as any).AssignedAt) && (
                  <span className="text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">
                    Assigned: {formatDate(selectedBug.assignedAt ?? selectedBug.assignDate ?? selectedBug.assignedDate ?? (selectedBug as any).AssignedAt)}
                  </span>
                )}
              </div>
              
              {(selectedBug.bugDate || selectedBug.bugCreatedAt || selectedBug.reportedAt || selectedBug.createdAt) && (
                <div className="text-[11px] text-slate-400 text-left">
                  Bug Reported: <span className="font-mono">
                    {formatDate(selectedBug.bugDate ?? selectedBug.bugCreatedAt ?? selectedBug.reportedAt ?? selectedBug.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}