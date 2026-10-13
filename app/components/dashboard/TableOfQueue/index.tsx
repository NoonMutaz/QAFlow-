"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useQueueContext, type Status, type Priority } from "../../../context/QueueContext";
import RemoveModal from "../RemoveModal";
import FilterByStatus from "../FilterByStatus";
import FilterByPriority from "../FilterByPriority";
import BugRow from "./BugRow";
import BugDetails from "./BugDetails";
import MediaPreview from "./MediaPreview";
import Pagination from "./Pagination";
import { FileIcon } from "./icons";
import { patchBugField } from "./api";
import { nextPriority } from "./helpers";
import { useAttachmentUpload } from "./useAttachmentUpload";
import type { Bug } from "./types";

const PAGE_SIZE = 10;
const COLUMNS = ["ID", "Reporter", "Risk level", "Detailed finding", "Status", "Assigned To"];
const TH = "px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap";

interface Props {
  filteredQueue: Bug[];
  projectId: string | number;
  updateQueue: (projectId: any, bugId: number, status: Status) => void;
  removeQueue: (projectId: any, bugId: number) => void;
  updatePriorityQueue: (projectId: any, bugId: number, priority: Priority) => void;
  currentUserRole: string;
  // Filter state is owned by the parent page.
  select: any;
  setSelect: any;
  selectP: any;
  setSelectP: any;
}

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
  setSelectP,
}: Props) {
  const { updateBugInState, projectMembers, fetchProjectMembers, assignBug } = useQueueContext();

  const [removeId, setRemoveId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);

  const { uploadingIds, upload } = useAttachmentUpload(projectId, updateBugInState);

  const canEdit = ["owner", "member"].includes(currentUserRole);
  const canDelete = currentUserRole === "owner";

  useEffect(() => {
    if (projectId) fetchProjectMembers(projectId.toString());
  }, [projectId, fetchProjectMembers]);

  // Back to the first page whenever the filtered list changes size.
  useEffect(() => {
    setPage(1);
  }, [filteredQueue.length]);

  const totalPages = Math.max(1, Math.ceil(filteredQueue.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filteredQueue.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredQueue, page]
  );

  const toggleRow = (bugId: number) => setExpanded((prev) => ({ ...prev, [bugId]: !prev[bugId] }));

  const setDeadline = async (bugId: number, value: string) => {
    const ok = await patchBugField(projectId, bugId, "deadline", value);
    if (ok) updateBugInState?.(projectId, bugId, { deadline: value || null });
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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-4"></th>
                {COLUMNS.map((title) => (
                  <th key={title} className={TH}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((bug) => (
                <React.Fragment key={bug.id}>
                  <BugRow
                    bug={bug}
                    expanded={!!expanded[bug.id]}
                    canEdit={canEdit}
                    members={projectMembers}
                    onToggle={() => toggleRow(bug.id)}
                    onCyclePriority={() => updatePriorityQueue(projectId, bug.id, nextPriority(bug.priority))}
                    onStatusChange={(status) => updateQueue(projectId, bug.id, status)}
                    onAssign={(userId) => assignBug(projectId, bug.id, userId)}
                    onDeadlineChange={(value) => setDeadline(bug.id, value)}
                  />
                  {expanded[bug.id] && (
                    <BugDetails
                      bug={bug}
                      projectId={projectId}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      updateBugInState={updateBugInState}
                      uploading={!!uploadingIds[bug.id]}
                      onUpload={(file) => upload(file, bug.id)}
                      onPreview={setPreviewUrl}
                      onRemove={() => setRemoveId(bug.id)}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {filteredQueue.length === 0 && (
            <div className="py-20 flex flex-col items-center text-gray-400">
              <FileIcon className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm font-bold tracking-widest uppercase">No Bugs Found</p>
            </div>
          )}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {removeId !== null && (
        <RemoveModal
          customer={filteredQueue.find((b) => b.id === removeId)}
          onClose={() => setRemoveId(null)}
          removeQueue={() => removeQueue(projectId, removeId)}
        />
      )}

      {previewUrl && <MediaPreview url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}
