'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { PendingReview, REVIEWS_CHANGED, usePendingReviews } from '../../hooks/usePendingReviews';
import { useLanguage } from '../../i18n/LanguageProvider';

const mediaUrl = (path?: string | null) =>
  !path ? null : path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_API_URL}${path}`;

const formatDate = (ms?: number | null) =>
  ms ? new Date(ms).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

/** Owner's queue of submitted fixes: compare before/after photos, then approve or reject. */
export default function Approvals() {
  const { t } = useLanguage();
  const { reviews, loading } = usePendingReviews();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("Approvals")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("Fixes submitted with a photo in your projects. Approve to close the finding, or reject to send it back.")}
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">{t("Loading…")}</div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-900">{t("Nothing to review")}</p>
            <p className="mt-1 text-xs text-slate-500">{t("Submitted fixes will appear here.")}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: PendingReview }) {
  const { t } = useLanguage();
  const { token } = useAuthContext();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const before = mediaUrl(review.attachmentUrl);
  const after = mediaUrl(review.resolutionEvidenceUrl);

  const decide = async (approve: boolean) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${review.projectId}/bugs/${review.id}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ approve, comment: approve ? null : reason.trim() }),
        },
      );
      if (!res.ok) throw new Error((await res.text().catch(() => '')) || `Failed (${res.status})`);
      window.dispatchEvent(new CustomEvent(REVIEWS_CHANGED));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Something went wrong'));
      setBusy(false);
    }
  };

  return (
    <li className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
            {review.bugId}
          </span>
          <Link href={`/dashboard/${review.projectId}`} className="font-semibold text-slate-900 hover:text-emerald-700">
            {review.projectName}
          </Link>
          {review.testCaseTitle && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              {review.testCaseTitle}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {t("Submitted")} {formatDate(review.submittedForReviewAt)}
          {review.assignedToEmail ? ` ${t("by")} ${review.assignedToEmail}` : ''}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm font-medium text-slate-900">{review.actualResult || review.description}</p>
          {review.url && <p className="mt-0.5 text-xs text-slate-500">{review.url}</p>}
          {review.expectedResult && (
            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">{t("Required:")} </span>
              {review.expectedResult}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Photo label={t("Before · reported finding")} src={before} />
          <Photo label={t("After · submitted fix")} src={after} highlight />
        </div>

        {rejecting && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            autoFocus
            placeholder={t("Why is the fix not accepted? The assignee will see this.")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {rejecting ? (
            <>
              <button
                type="button"
                onClick={() => setRejecting(false)}
                disabled={busy}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={() => void decide(false)}
                disabled={busy || !reason.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy ? t('Sending…') : t('Reject and send back')}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={busy}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                {t("Reject")}
              </button>
              <button
                type="button"
                onClick={() => void decide(true)}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy ? t('Approving…') : t('Approve fix')}
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function Photo({ label, src, highlight = false }: { label: string; src: string | null; highlight?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className={`overflow-hidden rounded-xl border ${highlight ? 'border-emerald-200' : 'border-slate-200'}`}>
      <p className={`px-3 py-1.5 text-[11px] font-semibold ${highlight ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'}`}>
        {label}
      </p>
      {src ? (
        <a href={src} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} className="h-56 w-full bg-slate-50 object-contain" loading="lazy" />
        </a>
      ) : (
        <div className="flex h-56 items-center justify-center bg-slate-50 text-xs text-slate-400">{t("No photo")}</div>
      )}
    </div>
  );
}
