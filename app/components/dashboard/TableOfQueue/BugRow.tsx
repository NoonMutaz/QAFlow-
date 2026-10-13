import React from "react";
import type { Priority, Status } from "../../../context/QueueContext";
import PriorityBadge from "./PriorityBadge";
import StatusSelect from "./StatusSelect";
import AssigneeCell from "./AssigneeCell";
import { ChevronIcon, FileIcon } from "./icons";
import { getLinkedTestCase } from "./helpers";
import type { Bug, ProjectMember } from "./types";

interface Props {
  bug: Bug;
  expanded: boolean;
  canEdit: boolean;
  members: ProjectMember[];
  onToggle: () => void;
  onCyclePriority: () => void;
  onStatusChange: (status: Status) => void;
  onAssign: (userId: number | null) => void;
  onDeadlineChange: (value: string) => void;
}

// Interactive cells must not toggle the row when clicked.
const stop = (e: React.MouseEvent) => e.stopPropagation();

/** The collapsed, always-visible row of a bug. */
export default function BugRow({
  bug,
  expanded,
  canEdit,
  members,
  onToggle,
  onCyclePriority,
  onStatusChange,
  onAssign,
  onDeadlineChange,
}: Props) {
  const testCase = getLinkedTestCase(bug);

  return (
    <tr
      onClick={onToggle}
      className={`hover:bg-blue-50/10 transition-colors cursor-pointer group ${expanded ? "bg-blue-50/20" : ""}`}
    >
      <td className="px-4 py-4 text-center">
        <div className="flex items-center justify-center">
          <ChevronIcon
            className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transform transition-transform duration-200 ${
              expanded ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </div>
      </td>

      <td className="px-4 py-4 font-mono text-xs font-bold text-blue-600 whitespace-nowrap">{bug.bugId}</td>

      <td className="px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">{bug.name}</td>

      <td className="px-4 py-4" onClick={stop}>
        <PriorityBadge priority={bug.priority} onClick={onCyclePriority} disabled={!canEdit} />
      </td>

      <td className="px-4 py-4 max-w-[200px] md:max-w-md">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-600 truncate font-medium">
            {bug.description || <span className="text-gray-300 italic">No details written</span>}
          </p>
          {testCase && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-150 max-w-full">
                <FileIcon className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                <span className="truncate"> {testCase.title}</span>
              </span>
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-4" onClick={stop}>
        <StatusSelect status={bug.status} disabled={!canEdit} onChange={onStatusChange} />
      </td>

      <td className="px-4 py-4" onClick={stop}>
        <AssigneeCell
          bug={bug}
          members={members}
          canEdit={canEdit}
          onAssign={onAssign}
          onDeadlineChange={onDeadlineChange}
        />
      </td>
    </tr>
  );
}
