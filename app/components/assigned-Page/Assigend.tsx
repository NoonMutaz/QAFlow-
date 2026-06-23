'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueueContext } from '../../context/QueueContext';
import { AssignedBug, BugStatus, RawAssignedBug } from './types';
import { normalizeBug, sortAssignedBugs } from './utils';
import SkeletonRow from './SkeletonRow';
import BugRow from './BugRow';
import BugDetailModal from './BugDetailModal';
import { CheckCircleIcon } from './Icons';

export default function Assigned() {
  const { myAssignedBugs, loadingMyBugs, fetchMyAssignedBugs, updateQueue } = useQueueContext();

  const [selectedBugId, setSelectedBugId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyAssignedBugs();
  }, [fetchMyAssignedBugs]);

  // NOTE: myAssignedBugs is cast to RawAssignedBug[] here because QueueContext
  // doesn't currently export a typed shape for it. Once it does, this cast
  // can be dropped in favor of typing the context value directly.
  const allBugs = useMemo<AssignedBug[]>(
    () => ((myAssignedBugs ?? []) as RawAssignedBug[]).map(normalizeBug),
    [myAssignedBugs]
  );

  const visibleBugs = useMemo(() => sortAssignedBugs(allBugs), [allBugs]);

  // Looked up from the full (unfiltered) list so the modal stays open and
  // shows live status even if a bug becomes "fixed" and drops off the list.
  const selectedBug = useMemo(
    () => allBugs.find((bug) => bug.id === selectedBugId) ?? null,
    [allBugs, selectedBugId]
  );

  const handleStatusChange = async (bug: AssignedBug, nextStatus: BugStatus) => {
    if (!updateQueue) return;
    try {
      setUpdatingId(bug.id);
      await updateQueue(bug.projectId, bug.id, nextStatus);
      await fetchMyAssignedBugs();
    } catch (err) {
      console.error('Failure updating task status context:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddComment = async (bug: AssignedBug, text: string) => {
    // TODO: Connect your backend API interaction here
    // await addCommentToBug(bug.id, text);
    console.log(`Submitting comment for bug ${bug.id}:`, text);
    // Refresh logic or context payload re-fetch goes here
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 font-sans relative">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Queue</h1>
            <p className="mt-1 text-sm text-slate-500">You have {visibleBugs.length} active assignments.</p>
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
              {[1, 2, 3].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loadingMyBugs && visibleBugs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-slate-50 p-4 ring-1 ring-slate-100">
                <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">All caught up!</h3>
            </div>
          )}

          {/* List View */}
          {!loadingMyBugs && visibleBugs.length > 0 && (
            <ul className="divide-y divide-slate-100" role="list">
              {visibleBugs.map((bug) => (
                <BugRow
                  key={bug.id}
                  bug={bug}
                  isUpdating={updatingId === bug.id}
                  onStatusChange={handleStatusChange}
                  onView={(viewedBug) => setSelectedBugId(viewedBug.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bug detail overlay */}
      {selectedBug && (
        <BugDetailModal
          bug={selectedBug}
          isUpdating={updatingId === selectedBug.id}
          onClose={() => setSelectedBugId(null)}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}