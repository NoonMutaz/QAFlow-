"use client";
import React, { useState, useEffect } from "react";
import { patchBugField } from "./api";
import type { UpdateBugInState } from "./types";

interface Props {
  value?: string;
  field: string;
  bugId: number;
  projectId: string | number;
  canEdit: boolean;
  updateBugInState?: UpdateBugInState;
  placeholder?: string;
}

/** Click-to-edit text cell that saves through the generic PATCH endpoint. */
export default function EditableCell({ value, field, bugId, projectId, canEdit, updateBugInState, placeholder }: Props) {
  const [local, setLocal] = useState(value);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const save = async () => {
    if (!canEdit || local === value) {
      setEditing(false);
      return;
    }
    setLoading(true);
    const ok = await patchBugField(projectId, bugId, field, local as string);
    if (ok) updateBugInState?.(projectId, bugId, { [field]: local });
    else setLocal(value);
    setLoading(false);
    setEditing(false);
  };

  return (
    <div className="min-w-[150px] relative">
      {editing ? (
        <textarea
          autoFocus
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
          }}
          className="w-full p-2 text-xs border-2 border-blue-400 rounded-lg shadow-inner focus:outline-none bg-white z-20 relative"
          rows={2}
        />
      ) : (
        <div
          onClick={() => canEdit && setEditing(true)}
          className={`p-2 text-xs border border-transparent rounded-lg line-clamp-2 transition-all ${
            canEdit ? "hover:bg-gray-100 hover:border-gray-200 cursor-text" : "cursor-default"
          }`}
        >
          {local || <span className="text-gray-300 italic">{placeholder}</span>}
        </div>
      )}
      {loading && (
        <div className="absolute -top-10 right-0 flex items-center gap-1 px-3 py-1.5 bg-blue-100 border border-blue-200 text-blue-800 text-xs rounded-full shadow-lg z-10">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          Saving...
        </div>
      )}
    </div>
  );
}
