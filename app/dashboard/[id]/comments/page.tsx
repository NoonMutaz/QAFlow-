'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useQueueContext } from '../../../context/QueueContext';
import { useQuery } from '@tanstack/react-query'; 
import Link from 'next/link';

//  Types 

interface Comment {
  id: number;
  authorName: string;
  authorId: number;
  text: string;
  createdAt: string;
}

//  Sub-components 

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    High: 'bg-red-50 text-red-700 border-red-100 ring-red-500/20',
    Medium: 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20',
  };
  const key = styles[priority] ? priority : 'Low';
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[key]}`}>
      {priority}
    </span>
  );
};

const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-3 p-4 border-b border-slate-100">
    <div className="h-4 w-14 rounded bg-slate-200" />
    <div className="h-4 flex-1 rounded bg-slate-200" />
    <div className="h-6 w-20 rounded bg-slate-200" />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles =
    status === 'fixed'       ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    status === 'in-progress' ? 'bg-purple-50  text-purple-700  border-purple-200'  :
                               'bg-rose-50    text-rose-700    border-rose-200';
  const label =
    status === 'fixed'       ? 'Fixed'       :
    status === 'in-progress' ? 'In Progress' : 'Not Fixed';
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold capitalize ${styles}`}>
      {label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProjectDiscussionsProps {
  projectId: string;
}

export default function ProjectDiscussions({ projectId }: ProjectDiscussionsProps) {
  const { queue, fetchBugs, updateQueue } = useQueueContext();
  const { data: allBugs = [], isLoading: loadingBugs } = useQuery({
    queryKey: ['bugs', projectId],
    queryFn: async () => {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch bugs');
      return res.json();
    },
    enabled: !!projectId && projectId !== 'undefined',
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const assignedBugs = useMemo(() => {
    return [...allBugs]
      .filter((b: any) => b.assignedToUserId ?? b.AssignedToUserId)
      .sort((a: any, b: any) => {
        const score = { High: 3, Medium: 2, Low: 1 };
        return (score[(b.priority ?? b.Priority) as keyof typeof score] ?? 1) -
               (score[(a.priority ?? a.Priority) as keyof typeof score] ?? 1);
      });
  }, [allBugs]);

  // All bugs for this project that have an assignee
 

  const [selectedBugId, setSelectedBugId]   = useState<number | null>(null);
  const [comments, setComments]             = useState<Record<number, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment]         = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [updatingId, setUpdatingId]         = useState<number | null>(null);

  const selectedBug = useMemo(
    () => assignedBugs.find((b: any) => b.id === selectedBugId) ?? null,
    [assignedBugs, selectedBugId]
  );

  // Auto-select first bug when list loads
  useEffect(() => {
    if (assignedBugs.length > 0 && selectedBugId === null) {
      setSelectedBugId((assignedBugs[0] as any).id);
    }
  }, [assignedBugs]);

useEffect(() => {
  if (!projectId || projectId === 'undefined') return;
  fetchBugs(projectId);
}, [projectId, fetchBugs]);

  // Fetch comments whenever selected bug changes
  const fetchComments = useCallback(async (bugId: number) => {
    setLoadingComments(true);
    try {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${bugId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setComments(prev => ({ ...prev, [bugId]: data }));
      }
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoadingComments(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedBugId !== null) {
      fetchComments(selectedBugId);
      setNewComment('');
    }
  }, [selectedBugId, fetchComments]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedBugId) return;
    setSubmitting(true);
    try {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${selectedBugId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        }
      );
      if (res.ok) {
        const created: Comment = await res.json();
        setComments(prev => ({
          ...prev,
          [selectedBugId]: [...(prev[selectedBugId] ?? []), created],
        }));
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (bugId: number, projectIdStr: string, nextStatus: any) => {
    setUpdatingId(bugId);
    try {
      await updateQueue(projectIdStr, bugId, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (value: any) => {
    if (!value) return '';
    const ts = isNaN(Number(value)) ? Date.parse(value) : Number(value);
    if (isNaN(ts)) return String(value);
    return new Date(ts).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const threadComments = selectedBugId ? (comments[selectedBugId] ?? []) : [];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page Header */}
        <div className="border-b border-slate-200 pb-4">
          <p className="text-xs text-slate-400 font-medium mb-1">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            {' / '}
            <Link href={`/dashboard/${projectId}`} className="hover:underline">Project</Link>
            {' / '}
            <span className="text-blue-500 font-semibold">Discussions</span>
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bug Discussions</h1>
              <p className="mt-1 text-sm text-slate-500">
                {assignedBugs.length} assigned {assignedBugs.length === 1 ? 'bug' : 'bugs'} in this project
              </p>
            </div>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
             style={{ height: 'calc(100vh - 220px)', minHeight: '520px' }}>

          {/* ── LEFT PANEL: Bug List ── */}
          <div className="lg:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/40">

            <div className="p-4 border-b border-slate-200 bg-white shrink-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Assigned Bugs ({assignedBugs.length})
              </p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {/* Loading skeleton */}
              {!queue[projectId] && (
                <>{[1,2,3].map(i => <SkeletonRow key={i} />)}</>
              )}

              {/* Empty state */}
              {queue[projectId] && assignedBugs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center px-4">
                  <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                  </svg>
                  <p className="text-sm font-semibold">No assigned bugs yet</p>
                  <p className="text-xs mt-1">Bugs will appear here once assigned to a team member.</p>
                </div>
              )}

              {/* Bug items */}
              {assignedBugs.map((bugItem: any) => {
                const isSelected = bugItem.id === selectedBugId;
                const priority   = bugItem.priority ?? bugItem.Priority;
                const status     = bugItem.status   ?? bugItem.Status;
                const bugRef     = bugItem.bugId    ?? bugItem.BugId;
                const assignee   = bugItem.assignedToEmail ?? bugItem.AssignedToEmail ?? '—';
                const threadLen  = (comments[bugItem.id] ?? []).length;

                return (
                  <button
                    key={bugItem.id}
                    onClick={() => setSelectedBugId(bugItem.id)}
                    className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 relative group ${
                      isSelected
                        ? 'bg-blue-50/60 border-l-4 border-l-blue-500'
                        : 'hover:bg-slate-100/60 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Top row: ref + last activity */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{bugRef}</span>
                      <div className="flex items-center gap-1.5">
                        {threadLen > 0 && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">
                            {threadLen}
                          </span>
                        )}
                        <StatusBadge status={status} />
                      </div>
                    </div>

                    {/* Description */}
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                      {bugItem.description || 'No description'}
                    </p>

                    {/* Assignee row */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                        {assignee[0]?.toUpperCase()}
                      </div>
                      <span className="truncate">{assignee}</span>
                    </div>

                    {/* Priority */}
                    <div className="mt-0.5">
                      <PriorityBadge priority={priority} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT PANEL: Thread ── */}
          <div className="lg:col-span-8 flex flex-col h-full bg-white">

            {!selectedBug ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-2">
                <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-semibold">Select a bug to view its thread</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 shrink-0 bg-slate-50/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-500">
                          {selectedBug.bugId ?? (selectedBug as any).BugId}
                        </span>
                        <PriorityBadge priority={selectedBug.priority ?? (selectedBug as any).Priority} />

                        {/* Status dropdown — tester can update too */}
                        <select
                          value={selectedBug.status ?? (selectedBug as any).Status}
                          disabled={updatingId === selectedBug.id}
                          onChange={(e) => handleStatusChange(
                            selectedBug.id,
                            String(selectedBug.projectId ?? (selectedBug as any).ProjectId ?? projectId),
                            e.target.value
                          )}
                          className={`text-[11px] font-bold border rounded-lg p-1 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer transition-colors ${
                            selectedBug.status === 'fixed'       ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            selectedBug.status === 'in-progress' ? 'bg-purple-100  text-purple-700  border-purple-200'  :
                                                                   'bg-red-100     text-red-700     border-red-200'
                          }`}
                        >
                          <option value="notFixed">Not Fixed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="fixed">Fixed</option>
                        </select>

                        {updatingId === selectedBug.id && (
                          <span className="text-[11px] text-slate-400 animate-pulse">Saving...</span>
                        )}

                        {/* Assignee badge */}
                        <span className="text-[11px] px-2 py-0.5 rounded-lg border font-medium flex items-center gap-1 bg-slate-100 text-slate-700 border-slate-200">
                          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[7px] font-bold">
                            {(selectedBug.assignedToEmail ?? '?')[0]?.toUpperCase()}
                          </div>
                          {selectedBug.assignedToEmail ?? (selectedBug as any).AssignedToEmail ?? 'Assigned'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm font-bold text-slate-800 leading-snug truncate">
                        {selectedBug.description || 'No description'}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                        <span>
                          Reporter: <strong className="text-slate-600">{selectedBug.name ?? (selectedBug as any).Name ?? '—'}</strong>
                        </span>
                        <span>
                          Assigned by: <strong className="text-slate-600">{selectedBug.assignedByName ?? (selectedBug as any).AssignedByName ?? '—'}</strong>
                        </span>
                        {(selectedBug.createdAt ?? (selectedBug as any).CreatedAt) && (
                          <span>
                            Created: <span className="font-mono">{formatDate(selectedBug.createdAt ?? (selectedBug as any).CreatedAt)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/${selectedBug.projectId ?? projectId}`}
                      className="shrink-0 text-[11px] font-semibold text-blue-600 hover:underline whitespace-nowrap"
                    >
                      View project ↗
                    </Link>
                  </div>
                </div>

                {/* Comment stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {loadingComments && (
                    <div className="flex justify-center pt-8 text-slate-400 text-xs animate-pulse">Loading thread...</div>
                  )}

                  {!loadingComments && threadComments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-xs font-semibold">No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation about this bug.</p>
                    </div>
                  )}

                  {!loadingComments && threadComments.map((comment, idx) => (
                    <div key={comment.id ?? idx} className="flex gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {comment.authorName?.charAt(0)?.toUpperCase() ?? 'U'}
                      </div>
                      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-sm">
                        <div className="flex items-baseline justify-between mb-1 gap-2">
                          <span className="text-xs font-bold text-slate-800">{comment.authorName ?? 'Unknown'}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handlePostComment();
                          }
                        }}
                        placeholder={`Reply to thread for ${selectedBug.bugId ?? ''}...`}
                        rows={2}
                        className="w-full text-xs text-slate-800 bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none shadow-inner transition-shadow"
                      />
                    </div>
                    <button
                      onClick={handlePostComment}
                      disabled={!newComment.trim() || submitting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm h-10 flex items-center justify-center shrink-0"
                    >
                      {submitting ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}