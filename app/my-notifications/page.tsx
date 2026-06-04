'use client';

import React, { useEffect } from 'react';
import { useQueueContext } from '../context/QueueContext';
import Link from 'next/link';

export default function Page() {
  const { myAssignedBugs, loadingMyBugs, fetchMyAssignedBugs } = useQueueContext();

  useEffect(() => {
    fetchMyAssignedBugs();
  }, [fetchMyAssignedBugs]);

  if (loadingMyBugs) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Safe client filter accounting for property naming variations
  const openBugs = myAssignedBugs.filter(b => {
    const currentStatus = b.status ?? (b as any).Status;
    return currentStatus !== 'fixed';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/40 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Assigned Tasks</h1>
            <p className="text-xs text-gray-500 font-medium">Bugs currently routed to your queue across all projects.</p>
          </div>
          <div className="px-4 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold shadow-sm">
            Total Open: {openBugs.length}
          </div>
        </div>

        {/* Task Grid / List layout */}
        {myAssignedBugs.length === 0 ? (
          <div className="bg-white border rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-20 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold tracking-widest uppercase text-gray-700">Inbox Zero!</p>
            <p className="text-xs text-gray-400 mt-1">You don't have any bugs assigned to you right now.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {myAssignedBugs.map((bug) => {
                // Handle mixed-case property serialization safely
                const bugIdentifier = bug.bugId ?? (bug as any).BugId;
                const priority = bug.priority ?? (bug as any).Priority;
                const status = bug.status ?? (bug as any).Status;
                const description = bug.description ?? (bug as any).Description;
                const url = bug.url ?? (bug as any).Url;
                const projectId = bug.projectId ?? (bug as any).ProjectId;
                
                // Assignment tracking properties
                const assignedByName = bug.assignedByName ?? (bug as any).AssignedByName;
                const assignedAt = bug.assignedAt ?? (bug as any).AssignedAt;

                return (
                  <div key={bug.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    
                    {/* Left Metadata Side */}
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {bugIdentifier}
                        </span>
                        
                        {/* Priority Badge */}
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm ${
                          priority === 'High' ? 'bg-red-500 text-white' : 
                          priority === 'Medium' ? 'bg-amber-400 text-amber-950' : 'bg-emerald-500 text-white'
                        }`}>
                          {priority}
                        </span>

                        {/* Status Badge */}
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border rounded-md ${
                          status == 'fixed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          status == 'in-progress' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {status === 'notFixed' ? 'Not Fixed' : status}
                        </span>
                      </div>

                      {/* Bug Description Summaries */}
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-1">
                        {description || "No description provided"}
                      </h3>
                      
                      {/* URL context link tracker */}
                      {url && (
                        <p className="text-[11px] text-gray-400 truncate max-w-md">
                          URL: <span className="text-blue-500 italic hover:underline">{url}</span>
                        </p>
                      )}

                      {/* NEW: Live Assignment Footer Context Metadata Row */}
                      {assignedByName && (
                        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 pt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded text-gray-600">
                            👤 Assigned by: <strong className="text-gray-800">{assignedByName}</strong>
                          </span> .
                          {assignedAt && (
                            <span className="text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                              📅 {new Date(assignedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Navigation Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link 
                        href={`/dashboard/${projectId}`}
                        className="px-4 py-2 text-[11px] font-black tracking-wider uppercase text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all group-hover:border-blue-200 group-hover:text-blue-600"
                      >
                        View Project ↗
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}