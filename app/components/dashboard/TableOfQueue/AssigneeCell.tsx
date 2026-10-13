import React from "react";
import DeadlineButton from "./DeadlineButton";
import type { Bug, ProjectMember } from "./types";

interface Props {
  bug: Bug;
  members: ProjectMember[];
  canEdit: boolean;
  onAssign: (userId: number | null) => void;
  onDeadlineChange: (value: string) => void;
}

/** Assignee picker, avatar, and (once someone is assigned) the deadline button. */
export default function AssigneeCell({ bug, members, canEdit, onAssign, onDeadlineChange }: Props) {
  const isAssigned = bug.assignedToUserId != null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={bug.assignedToUserId ?? ""}
        onChange={(e) => onAssign(e.target.value ? Number(e.target.value) : null)}
        disabled={!canEdit}
        className="text-[11px] font-bold border border-gray-200 rounded-lg p-1 focus:ring-2 focus:ring-blue-400 outline-none bg-white min-w-[125px] disabled:opacity-50 transition-all cursor-pointer hover:border-gray-300"
      >
        <option value="">Unassigned</option>
        {members.map((member) => (
          <option key={member.userId} value={member.userId}>
            {member.name}
          </option>
        ))}
      </select>

      {bug.assignedToEmail && (
        <div className="flex items-center gap-1 shrink-0" title={bug.assignedToEmail}>
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold shadow-sm">
            {bug.assignedToEmail[0]?.toUpperCase()}
          </div>
        </div>
      )}

      {isAssigned && (
        <DeadlineButton
          deadline={bug.deadline}
          status={bug.status}
          canEdit={canEdit}
          onChange={onDeadlineChange}
        />
      )}
    </div>
  );
}
