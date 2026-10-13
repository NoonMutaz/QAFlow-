import React from "react";
import type { Status } from "../../../context/QueueContext";

const STYLES: Record<string, string> = {
  fixed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "in-progress": "bg-purple-100 text-purple-700 border-purple-200",
  pendingReview: "bg-amber-100 text-amber-700 border-amber-200",
  notFixed: "bg-red-100 text-red-700 border-red-200",
};

interface Props {
  status: Status;
  disabled: boolean;
  onChange: (status: Status) => void;
}

export default function StatusSelect({ status, disabled, onChange }: Props) {
  return (
    <select
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as Status)}
      className={`text-[11px] font-bold border rounded-lg p-1.5 focus:ring-2 focus:ring-blue-400 outline-none ${
        STYLES[status] ?? STYLES.notFixed
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <option value="notFixed">Non-Conformities</option>
      <option value="in-progress">In Progress</option>
      {/* set only by the assignee's evidence upload; the owner decides on the Approvals page */}
      <option value="pendingReview" disabled>Awaiting approval</option>
      <option value="fixed">Verified</option>
    </select>
  );
}
