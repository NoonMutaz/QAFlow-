"use client";
import React, { useRef } from "react";
import { CalendarIcon } from "./icons";
import { getDeadlineInfo, todayISO, type DeadlineTone } from "./helpers";

const TONES: Record<DeadlineTone, string> = {
  none: "bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600",
  ok: "bg-gray-50 text-gray-700 border-gray-200",
  soon: "bg-amber-50 text-amber-700 border-amber-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface Props {
  deadline?: string | null;
  status: string;
  canEdit: boolean;
  onChange: (value: string) => void;
}

type PickerInput = HTMLInputElement & { showPicker?: () => void };

export default function DeadlineButton({ deadline, status, canEdit, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const info = getDeadlineInfo(deadline, status);

  if (!canEdit && info.tone === "none") return null;

  const openPicker = () => {
    const input = inputRef.current as PickerInput | null;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        /* fall through */
      }
    }
    input.focus();
    input.click();
  };

  const rawDate = deadline ? deadline.slice(0, 10) : "";

  return (
    <div className="relative flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={openPicker}
        disabled={!canEdit}
        title={info.title}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all disabled:cursor-default ${TONES[info.tone]}`}
      >
        <CalendarIcon className="w-3 h-3" />
        {/* التعديل هنا: إذا وُجد تاريخ يعرضه (مثل 15 Oct)، وإذا لم يوجد يعرض كلمة Deadline */}
        <span>{rawDate ? info.label : "Deadline"}</span>
      </button>

      <input
        ref={inputRef}
        type="date"
        min={todayISO()}
        value={rawDate}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />

      {canEdit && deadline && (
        <button
          type="button"
          onClick={() => onChange("")}
          title="Clear deadline"
          aria-label="Clear deadline"
          className="text-xs leading-none text-gray-300 hover:text-red-500 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}