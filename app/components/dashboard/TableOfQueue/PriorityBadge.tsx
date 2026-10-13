import React from "react";
import type { Priority } from "../../../context/QueueContext";

const STYLES: Record<Priority, string> = {
  High: "bg-red-500 text-white shadow-red-200",
  Medium: "bg-amber-400 text-amber-900 shadow-amber-100",
  Low: "bg-emerald-500 text-white shadow-emerald-200",
};

interface Props {
  priority: Priority;
  onClick: () => void;
  disabled: boolean;
}

export default function PriorityBadge({ priority, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all active:scale-90 ${STYLES[priority]} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:brightness-110"
      }`}
    >
      {priority}
    </button>
  );
}
