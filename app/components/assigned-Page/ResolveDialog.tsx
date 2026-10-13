'use client';

import { useEffect, useState } from 'react';
import { AssignedBug } from './types';

interface ResolveDialogProps {
  bug: AssignedBug;
  onClose: () => void;
  /** uploads the photo and submits the fix; throws with a message on failure */
  onSubmit: (bug: AssignedBug, photo: File) => Promise<void>;
}

/** Assignee uploads a photo of the corrected work; the fix then waits for the owner's approval. */
export default function ResolveDialog({ bug, onClose, onSubmit }: ResolveDialogProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const submit = async () => {
    if (!photo) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(bug, photo);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the fix');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Mark {bug.bugId} as resolved</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Upload a photo of the fix. The project owner reviews it before the finding is closed.
          </p>
        </div>

        <div className="space-y-4 p-5">
          {bug.reviewComment && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              <span className="font-semibold">Previous fix rejected:</span> {bug.reviewComment}
            </div>
          )}

          {preview ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Fix evidence" className="max-h-64 w-full bg-slate-50 object-contain" />
              <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs">
                <span className="truncate text-slate-600">{photo?.name}</span>
                <label className="shrink-0 cursor-pointer font-medium text-blue-600 hover:text-blue-700">
                  Replace
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
              <svg className="h-7 w-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              <span className="text-sm font-medium text-slate-700">Upload a photo of the fix</span>
              <span className="text-xs text-slate-400">Required · JPG, PNG or WebP</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            </label>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        </div>

        <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!photo || submitting}
            className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </button>
        </div>
      </div>
    </div>
  );
}
