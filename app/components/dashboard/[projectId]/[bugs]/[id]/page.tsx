'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface BugDetail {
  id: number;
  bugId: string;
  description: string;
  expectedResult?: string;
  actualResult?: string;
  note?: string;
  url?: string;
  status: string;
  priority: string;
  assignedByName?: string;
  assignedAt?: number;
  projectId: number;
}

export default function BugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bug, setBug] = useState<BugDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = params?.projectId;
  const bugId = params?.id;

  useEffect(() => {
    if (!bugId) return;

    async function fetchBugDetails() {
      try {
        setLoading(true);
        // Adjust endpoint URL string to match your .NET routing structure
        const response = await fetch(`/api/projects/${projectId}/bugs/${bugId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load tracking exceptions detail context.');
        }
        
        const data = await response.json();
        
        // Normalize mixed case property responses from API mapping
        setBug({
          id: data.id,
          bugId: data.bugId ?? data.BugId,
          description: data.description ?? data.Description,
          expectedResult: data.expectedResult ?? data.ExpectedResult,
          actualResult: data.actualResult ?? data.ActualResult,
          note: data.note ?? data.Note,
          url: data.url ?? data.Url,
          status: data.status ?? data.Status,
          priority: data.priority ?? data.Priority,
          assignedByName: data.assignedByName ?? data.AssignedByName,
          assignedAt: data.assignedAt ?? data.AssignedAt,
          projectId: data.projectId ?? data.ProjectId,
        });
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching details.');
      } finally {
        setLoading(false);
      }
    }

    fetchBugDetails();
  }, [projectId, bugId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Assembling issue matrix...</p>
        </div>
      </div>
    );
  }

  if (error || !bug) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500 border border-red-100">
            ⚠️
          </div>
          <h3 className="text-base font-bold text-slate-800">Unable to retrieve item</h3>
          <p className="text-xs text-slate-400 mt-2">{error || "The requested item couldn't be located within this workflow."}</p>
          <button 
            onClick={() => router.back()}
            className="mt-5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            ← Back to Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumbs / Back Layout */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
          <Link href={`/dashboard/${bug.projectId}`} className="hover:text-blue-600 transition-colors">Workspace</Link>
          <span>/</span>
          <span className="text-slate-600 font-mono font-bold">{bug.bugId}</span>
        </div>

        {/* Action Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-tight text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                {bug.bugId}
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wide ${
                bug.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : 
                bug.priority === 'Medium' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-slate-50 text-slate-600 border border-slate-200'
              }`}>
                {bug.priority} Priority
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl mt-1">{bug.description}</h1>
          </div>
          
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl shadow-sm transition-all"
          >
            ← Close View
          </button>
        </div>

        {/* Master Detail Split Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Context Conditions Block */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Core Summary Description</h3>
                <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {bug.description || "No expanded summary provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Blueprint Result</h4>
                  <div className="text-sm text-slate-700 bg-emerald-50/40 border border-emerald-100/60 p-3.5 rounded-xl leading-relaxed min-h-[80px]">
                    {bug.expectedResult ? bug.expectedResult : <span className="text-slate-400 italic text-xs">No explicit expectations defined.</span>}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observed Actual Runtime behavior</h4>
                  <div className="text-sm text-slate-700 bg-rose-50/40 border border-rose-100/60 p-3.5 rounded-xl leading-relaxed min-h-[80px]">
                    {bug.actualResult ? bug.actualResult : <span className="text-slate-400 italic text-xs">No runtime logs specified.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Engineer Notes Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Diagnostic Notes & Context</h3>
              <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 border border-slate-100 p-4 rounded-xl min-h-[100px]">
                {bug.note ? bug.note : <span className="text-slate-400 italic text-xs">No administrative comments or debugging logs have been appended yet.</span>}
              </div>
            </div>

          </div>

          {/* Configuration Parameters Sidebar (Right 1 Column) */}
          <div className="space-y-6">
            
            {/* Status Tracking Metric Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exception Life Cycle</h3>
              
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">State Target</label>
                <div className={`w-full text-center py-2 px-3 text-xs font-bold uppercase rounded-xl border ${
                  bug.status === 'fixed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  bug.status === 'in-progress' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  {bug.status === 'notFixed' ? 'Not Fixed' : bug.status}
                </div>
              </div>

              {bug.url && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Source Destination URL</label>
                  <a 
                    href={bug.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-600 font-medium break-all hover:underline flex items-center gap-1 bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl"
                  >
                    <span className="truncate">{bug.url}</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Assignment Lifecycle Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Origin Signatures</h3>
              
              <div className="space-y-3 text-xs font-medium">
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <span className="text-slate-400 text-[11px]">Assigned By</span>
                  <span className="text-slate-800 font-bold">{bug.assignedByName ?? 'System Automated'}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <span className="text-slate-400 text-[11px]">Routed Date</span>
                  <span className="text-slate-700 font-semibold">
                    {bug.assignedAt ? new Date(bug.assignedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}