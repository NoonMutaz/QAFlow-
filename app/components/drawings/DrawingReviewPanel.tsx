'use client';

import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useAuthContext } from '../../context/AuthContext';
import type { DrawingReview, DrawingReviewItem } from '../../api/drawing-review/types';

/** A new finding as POSTed to /api/projects/{id}/bugs. */
export type DrawingFinding = {
  name: string;
  url: string;
  actualResult: string;
  description: string;
  expectedResult: string;
  note: string;
  priority: 'High' | 'Medium';
  testCaseId?: number;
};

/** Parses ProjectDocument.aiReview; null when missing or not valid JSON. */
export function parseDrawingReview(raw: string | null | undefined): DrawingReview | null {
  if (!raw) return null;
  try {
    const review = JSON.parse(raw) as DrawingReview;
    return Array.isArray(review?.items) ? review : null;
  } catch {
    return null;
  }
}

/**
 * The AI's comparison of one drawing with the SBC: possible violations first, then points the
 * drawing does not show clearly. Each point can be turned into a finding the team follows up.
 */
export default function DrawingReviewPanel({
  review,
  fileName,
  reviewedAt,
  onAddFinding,
}: {
  review: DrawingReview;
  fileName: string;
  reviewedAt?: number | null;
  /** creates a finding in the project; omitted for viewers */
  onAddFinding?: (finding: DrawingFinding) => Promise<number>;
}) {
  const { t, lang } = useLanguage();
  const { user } = useAuthContext();
  const [added, setAdded] = useState<Record<number, 'saving' | 'done' | 'error'>>({});

  const issues = review.items.filter((i) => i.status === 'issue').length;
  const checks = review.items.length - issues;

  const addFinding = async (index: number, item: DrawingReviewItem) => {
    if (!onAddFinding) return;
    setAdded((prev) => ({ ...prev, [index]: 'saving' }));
    const clauseTitle = item.libraryClause
      ? `${item.libraryClause.codeType} §${item.libraryClause.sectionNumber} – ${item.libraryClause.title}`
      : item.testCaseTitle ?? (item.code ? `${item.code} – ${item.topic}` : item.topic);
    try {
      const id = await onAddFinding({
        name: user?.name ?? '',
        url: `${t('Drawing')}: ${fileName}`,
        actualResult: item.topic,
        description: item.observation,
        expectedResult: item.libraryClause?.requirementText ?? item.requirement,
        note: [item.action, `${t('Source: AI comparison of the drawing with the code')} (${clauseTitle})`].filter(Boolean).join('\n'),
        priority: item.status === 'issue' ? 'High' : 'Medium',
        ...(item.testCaseId ? { testCaseId: item.testCaseId } : {}),
      });
      setAdded((prev) => ({ ...prev, [index]: id ? 'done' : 'error' }));
    } catch {
      setAdded((prev) => ({ ...prev, [index]: 'error' }));
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-brand-100 bg-brand-50/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">{t('Comparison with the code')}</span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
          {t('{n} possible violations', { n: issues })}
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
          {t('{n} to verify', { n: checks })}
        </span>
        {review.compliant.length > 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            {t('{n} appear compliant', { n: review.compliant.length })}
          </span>
        )}
        {reviewedAt ? (
          <span className="ms-auto text-[11px] text-slate-400">
            {new Date(reviewedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB')}
          </span>
        ) : null}
      </div>
      {review.drawing && <p className="text-xs text-slate-600">{review.drawing}</p>}

      {review.items.length === 0 ? (
        <p className="rounded-lg bg-white px-3 py-2 text-xs text-slate-600">{t('The AI found nothing to flag on this drawing.')}</p>
      ) : (
        <ul className="space-y-2">
          {review.items.map((item, i) => {
            const state = added[i];
            return (
              <li key={i} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      item.status === 'issue' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {item.status === 'issue' ? t('Possible violation') : t('Needs verification')}
                  </span>
                  {item.code && (
                    <span className="rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand-300">{item.code}</span>
                  )}
                  <span className="text-sm font-semibold text-slate-900">{item.topic}</span>
                </div>
                <dl className="mt-2 space-y-1 text-xs leading-relaxed">
                  <div>
                    <dt className="inline font-semibold text-slate-700">{t('In the drawing')}: </dt>
                    <dd className="inline text-slate-600">{item.observation}</dd>
                  </div>
                  {item.requirement && (
                    <div>
                      <dt className="inline font-semibold text-slate-700">{t('The code requires')}: </dt>
                      <dd className="inline text-slate-600">{item.requirement}</dd>
                    </div>
                  )}
                  {item.action && (
                    <div>
                      <dt className="inline font-semibold text-slate-700">{t('Recommended action')}: </dt>
                      <dd className="inline text-slate-600">{item.action}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {item.libraryClause ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      ✓ {t('Verified clause')}: {item.libraryClause.codeType} §{item.libraryClause.sectionNumber} – {item.libraryClause.title}
                    </span>
                  ) : item.testCaseTitle ? (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
                      {t('Project clause')}: {item.testCaseTitle}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {t('AI suggestion · confirm against the code text')}
                    </span>
                  )}
                  {onAddFinding && (
                    <button
                      type="button"
                      disabled={state === 'saving' || state === 'done'}
                      onClick={() => void addFinding(i, item)}
                      className={`ms-auto rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                        state === 'done'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-60'
                      }`}
                    >
                      {state === 'done'
                        ? t('Added to findings ✓')
                        : state === 'saving'
                          ? t('Adding…')
                          : state === 'error'
                            ? t('Failed, try again')
                            : t('+ Add as finding')}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {review.compliant.length > 0 && (
        <details className="rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
          <summary className="cursor-pointer font-semibold text-emerald-700">{t('Appears compliant')}</summary>
          <ul className="mt-1.5 list-disc space-y-0.5 ps-5">
            {review.compliant.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-[11px] leading-relaxed text-slate-500">
        {t('A first screening by AI to speed up the review. It does not replace the review of a licensed engineer or the official code text.')}
      </p>
    </div>
  );
}
