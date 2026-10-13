"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SBC_CODES, findSbcCode } from "../../../data/sbcCodes";
import { libraryClauseTitle, type LibraryClause } from "../../../api/sbc-suggest/libraryClause";

const API = process.env.NEXT_PUBLIC_API_URL;
const authToken = () =>
  document.cookie.match(/(^| )token=([^;]+)/)?.[2] ?? localStorage.getItem("token") ?? "";

const inputCls =
  "w-full mt-1.5 px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";
const labelCls = "block text-[13px] font-medium text-gray-700";

/** Reads a useful message from an error response (JSON validation errors or plain text). */
async function errorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const data = JSON.parse(text);
    if (data?.errors) return Object.values(data.errors).flat().join(" ");
    return data?.title || data?.message || text;
  } catch {
    return text || `Server returned ${res.status}`;
  }
}

/** Adds an SBC clause to the project, picked from the shared SBC Library or written manually. */
export default function CreateTestCase({
  projectId,
  onSuccess,
  onCancel,
  existingTitles = [],
}: {
  projectId: string;
  onSuccess: () => void;
  onCancel?: () => void;
  /** titles already in the project, to warn about duplicates */
  existingTitles?: string[];
}) {
  const [mode, setMode] = useState<"library" | "manual">("library");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // library mode
  const [library, setLibrary] = useState<LibraryClause[] | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<LibraryClause | null>(null);

  // manual mode
  const [code, setCode] = useState("SBC 201");
  const [section, setSection] = useState("");
  const [title, setTitle] = useState("");
  const [standard, setStandard] = useState("");
  const [steps, setSteps] = useState([""]);

  useEffect(() => {
    fetch(`${API}/api/sbc-clauses`, { headers: { Authorization: `Bearer ${authToken()}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: LibraryClause[]) => {
        setLibrary(rows);
        if (rows.length === 0) setMode("manual");
      })
      .catch(() => {
        setLibrary([]);
        setMode("manual");
      });
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = library ?? [];
    return (q
      ? rows.filter((c) => [c.codeType, c.sectionNumber, c.title, c.requirementText].join(" ").toLowerCase().includes(q))
      : rows
    ).slice(0, 50);
  }, [library, query]);

  const fullTitle =
    mode === "library"
      ? picked ? libraryClauseTitle(picked) : ""
      : title.trim() ? `${code}${section.trim() ? ` §${section.trim()}` : ""} – ${title.trim()}` : "";
  const isDuplicate = !!fullTitle && existingTitles.some((t) => t.trim().toLowerCase() === fullTitle.toLowerCase());

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const expectedResult = mode === "library" ? picked?.requirementText ?? "" : standard.trim();
    if (!fullTitle || !expectedResult) {
      setError(mode === "library" ? "Pick a clause from the library." : "Fill in the title and the required standard.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/testcases`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken()}` },
        body: JSON.stringify({
          title: fullTitle,
          steps: mode === "manual" ? steps.filter((s) => s.trim() !== "") : [],
          expectedResult,
        }),
      });
      if (!res.ok) throw new Error(await errorMessage(res));
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the clause.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Add SBC clause</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Clauses this project is inspected against. Findings are linked to them.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleCreate} className="space-y-5 px-6 py-5">
        {/* Mode switch */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 text-sm font-semibold">
          {(
            [
              ["library", `From SBC Library${library ? ` (${library.length})` : ""}`],
              ["manual", "Write manually"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setError("");
              }}
              className={`rounded-md py-2 transition ${mode === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "library" ? (
          <div className="space-y-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code, section, title or text…"
              className={inputCls}
            />
            {library === null ? (
              <p className="py-6 text-center text-sm text-gray-400">Loading the library…</p>
            ) : library.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                The SBC Library is empty.{" "}
                <a href="/sbc-library" target="_blank" className="font-semibold text-blue-600 hover:underline">
                  Add verified clauses
                </a>{" "}
                or write this one manually.
              </div>
            ) : (
              <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                {matches.map((c) => {
                  const selected = picked?.id === c.id;
                  const inProject = existingTitles.some((t) => t.toLowerCase() === libraryClauseTitle(c).toLowerCase());
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setPicked(c)}
                        disabled={inProject}
                        className={`w-full px-3 py-2.5 text-left transition ${
                          selected ? "bg-blue-50" : inProject ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                            {c.codeType} §{c.sectionNumber}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{c.title}</span>
                          {selected && <span className="ml-auto text-xs font-semibold text-blue-700">Selected ✓</span>}
                          {inProject && <span className="ml-auto text-[11px] text-gray-500">Already in project</span>}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{c.requirementText}</p>
                        {c.verifiedBy && <p className="mt-0.5 text-[10px] text-blue-700">✓ Verified by {c.verifiedBy}</p>}
                      </button>
                    </li>
                  );
                })}
                {matches.length === 0 && <li className="p-4 text-center text-sm text-gray-400">No clause matches your search.</li>}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className={`${labelCls} sm:col-span-2`}>
                Code
                <select value={code} onChange={(e) => setCode(e.target.value)} className={inputCls}>
                  {SBC_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} · {c.nameEn}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[11px] text-gray-500" dir="rtl">{findSbcCode(code)?.nameAr}</span>
              </label>
              <label className={labelCls}>
                Section
                <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. 1010.1.9" className={inputCls} />
              </label>
            </div>

            <label className={labelCls}>
              Title <span className="text-red-500">*</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Door operations" className={inputCls} />
            </label>

            <label className={labelCls}>
              Required standard <span className="text-red-500">*</span>
              <textarea
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                rows={3}
                placeholder="What the code requires, e.g. egress doors open from the inside without a key"
                className={`${inputCls} resize-none`}
              />
            </label>

            <div>
              <span className={labelCls}>Inspection checklist (optional)</span>
              <div className="mt-1.5 space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-5 text-center text-xs font-semibold text-gray-400">{index + 1}</span>
                    <input
                      value={step}
                      onChange={(e) => setSteps(steps.map((s, i) => (i === index ? e.target.value : s)))}
                      placeholder="What to check on site"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSteps(steps.length === 1 ? [""] : steps.filter((_, i) => i !== index))}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSteps([...steps, ""])}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add checklist item
              </button>
            </div>
          </div>
        )}

        {/* Preview of what will be saved */}
        {fullTitle && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Will be saved as <span className="font-semibold text-gray-900">{fullTitle}</span>
            {isDuplicate && <span className="ml-1 font-semibold text-amber-700">· already in this project</span>}
          </p>
        )}

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isDuplicate}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Add clause"}
          </button>
        </div>
      </form>
    </div>
  );
}
