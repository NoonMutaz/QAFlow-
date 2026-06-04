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

const StatusPill = ({ status }: { status: string }) => {
  const displayStatus = status === 'notFixed' ? 'Open' : status;
  
  const styles = {
    fixed: 'bg-slate-100 text-slate-500',
    'in-progress': 'bg-indigo-50 text-indigo-600',
    open: 'bg-slate-900 text-white',
  };

  const styleKey = Object.keys(styles).includes(status) ? status : 'open';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[styleKey as keyof typeof styles]}`}>
      {displayStatus}
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

function StatCard({ label, value, color }: { label: string, value: number, color: 'slate' | 'red' | 'indigo' }) {
  const colorClasses = {
    slate: 'text-slate-900',
    red: 'text-red-600',
    indigo: 'text-indigo-600',
  };
  
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className={`mt-1 text-3xl font-semibold tracking-tight ${colorClasses[color]}`}>
        {value}
      </dd>
    </div>
  );
}

// --- Main Component ---

export default function Page() {
  const { myAssignedBugs, loadingMyBugs, fetchMyAssignedBugs } = useQueueContext();
  
  // Track currently inspected row data locally for immediate overlay injection
  const [selectedBug, setSelectedBug] = useState<any | null>(null);

  useEffect(() => {
    fetchMyAssignedBugs();
  }, [fetchMyAssignedBugs]);

  // --- Data Processing ---

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

  const stats = useMemo(() => {
    return {
      total: processedBugs.length,
      high: processedBugs.filter(b => (b.priority ?? (b as any).Priority) === 'High').length,
      inProgress: processedBugs.filter(b => (b.status ?? (b as any).Status) === 'in-progress').length,
    };
  }, [processedBugs]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 font-sans relative">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Queue</h1>
            <p className="mt-1 text-sm text-slate-500">You have {stats.total} active assignments.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Open" value={stats.total} color="slate" />
          <StatCard label="Critical Priority" value={stats.high} color="red" />
          <StatCard label="In Progress" value={stats.inProgress} color="indigo" />
        </div>

        {/* Main Content Area */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 border-b border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-2">Task</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-5">Details</div>
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
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                You have no active bugs assigned to your queue.
              </p>
            </div>
          )}

          {/* List View */}
          {!loadingMyBugs && processedBugs.length > 0 && (
            <ul className="divide-y divide-slate-100" role="list">
              {processedBugs.map((bug) => {
                const bugId = bug.bugId ?? (bug as any).BugId;
                const priority = bug.priority ?? (bug as any).Priority;
                const status = bug.status ?? (bug as any).Status;
                const description = bug.description ?? (bug as any).Description;
                const projectId = bug.projectId ?? (bug as any).ProjectId;
                
                const rowHighlight = priority === 'High' ? 'border-l-4 border-l-red-500' : '';

                return (
                  <li key={bug.id} className={`group relative flex flex-col gap-4 bg-white px-4 py-4 transition-colors hover:bg-slate-50 sm:grid sm:grid-cols-12 sm:items-center sm:gap-0 ${rowHighlight}`}>
                    
                    <div className="col-span-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <span className="font-mono text-xs font-medium text-slate-500">{bugId}</span>
                      <StatusPill status={status} />
                    </div>

                    <div className="col-span-2 flex items-center">
                      <PriorityBadge priority={priority} />
                    </div>

                    <div className="col-span-5 flex flex-col gap-1">
                      <p className="truncate font-medium text-slate-900 text-sm sm:text-base">
                        {description || "No description provided"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Assigned by {bug.assignedByName ?? (bug as any).AssignedByName}</span>
                      </div>
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-2">
                      {/* Interactive Button targeting state data projection instantly */}
                      <button
                        type="button"
                        onClick={() => setSelectedBug(bug)}
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

      {/* OVERLAY PANEL MODAL: Reveals deep fields straight from table record context */}
      {selectedBug && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedBug(null)}
        >
          <div 
            className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-transform max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Content parameters */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tracking-tight text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                    {selectedBug.bugId ?? (selectedBug as any).BugId}
                  </span>
                  <PriorityBadge priority={selectedBug.priority ?? (selectedBug as any).Priority} />
                  <StatusPill status={selectedBug.status ?? (selectedBug as any).Status} />
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

            {/* Scrollable Context Fields layout */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5"> Description Summary</h4>
                <p className="text-slate-700 bg-slate-50 border border-slate-100 p-3.5 rounded-xl font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedBug.description ?? (selectedBug as any).Description ?? "No core description provided."}
                </p>
              </div>

              {/* Functional Expected vs Actual Blocks configuration */}
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

              {/* Developer notes section */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Administrative Patch Notes</h4>
                <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl min-h-[60px]">
                  {selectedBug.note ?? (selectedBug as any).Note ?? (
                    <span className="text-slate-400 italic">No developer comments added.</span>
                  )}
                </div>
              </div>

              {/* Dynamic Target URLs configuration block */}
              {(selectedBug.url || (selectedBug as any).Url) && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Origin Context Location URL</h4>
                  <a 
                    href={selectedBug.url ?? (selectedBug as any).Url}
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-600 bg-blue-50/50 border border-blue-100 rounded-xl p-2.5 flex items-center justify-between font-medium hover:underline truncate"
                  >
                    <span>{selectedBug.url ?? (selectedBug as any).Url}</span>
                    <span className="text-[10px] pl-2 text-blue-400">Target ↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Panel operations layout footer row */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 px-5">
              <span>Assigned by: <strong className="text-slate-700 font-semibold">{selectedBug.assignedByName ?? (selectedBug as any).AssignedByName ?? 'System'}</strong></span>
              <button 
                type="button"
                onClick={() => setSelectedBug(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}