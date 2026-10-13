import React from "react";
import EditableCell from "./EditableCell";
import EvidenceUpload from "./EvidenceUpload";
import { TrashIcon } from "./icons";
import { getLinkedTestCase } from "./helpers";
import type { Bug, UpdateBugInState } from "./types";

interface Props {
  bug: Bug;
  projectId: string | number;
  canEdit: boolean;
  canDelete: boolean;
  updateBugInState?: UpdateBugInState;
  uploading: boolean;
  onUpload: (file: File) => void;
  onPreview: (url: string) => void;
  onRemove: () => void;
}

const LABEL = "text-[10px] text-gray-400 font-bold uppercase block mb-1";

/** The expanded panel shown under a bug row. */
export default function BugDetails({
  bug,
  projectId,
  canEdit,
  canDelete,
  updateBugInState,
  uploading,
  onUpload,
  onPreview,
  onRemove,
}: Props) {
  const testCase = getLinkedTestCase(bug);

  // Every editable field shares the same wiring.
  const cell = (field: string, value?: string, placeholder?: string) => (
    <EditableCell
      value={value}
      field={field}
      bugId={bug.id}
      projectId={projectId}
      canEdit={canEdit}
      updateBugInState={updateBugInState}
      placeholder={placeholder}
    />
  );

  return (
    <tr className="bg-slate-50/60">
      <td colSpan={7} className="px-8 py-6 border-l-4 border-blue-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: finding details (2/3 width) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Reproduction & Environment
              </h4>
              {testCase ? (
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  TEST CASE: <span className="text-gray-700 font-medium font-sans">{testCase.title}</span>
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 italic">No Test Case Linked</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className={LABEL}>SBC Required Standard</span>
                {cell("expectedResult", bug.expectedResult)}
              </div>
              <div>
                <span className={LABEL}>Site Finding</span>
                {cell("actualResult", bug.actualResult)}
              </div>
            </div>

            <div className="pt-1">
              <span className={LABEL}>Detailed finding</span>
              {cell("description", bug.description)}
            </div>

            <div className="pt-1">
              <span className={LABEL}>Environment Testing URL</span>
              <div className="flex items-center gap-2">
                <div className="flex-1">{cell("url", bug.url)}</div>
                {bug.url && (
                  <a
                    href={bug.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 whitespace-nowrap transition-all"
                  >
                    Open location ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: evidence, notes, metadata, actions (1/3 width) */}
          <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b pb-1">
              Media Files & Notes
            </h4>

            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Evidence Attachment</span>
              <EvidenceUpload
                attachmentUrl={bug.attachmentUrl}
                uploading={uploading}
                canEdit={canEdit}
                onUpload={onUpload}
                onPreview={onPreview}
              />
            </div>

            <div>
              <span className={LABEL}>Internal Team Notes</span>
              {cell("note", bug.note || "", "Add comments/notes...")}
            </div>

            <div className="text-[10px] text-gray-400 pt-1 flex justify-between items-center">
              <span>Created At:</span>
              <span className="font-semibold text-gray-600">
                {new Date(bug.createdAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex justify-between items-center border-t pt-3 mt-2">
              <span className="text-[9px] uppercase tracking-wider text-gray-400">Database Tools:</span>
              <button
                onClick={onRemove}
                disabled={!canDelete}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 disabled:opacity-20 transition-all"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Remove Bug</span>
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
