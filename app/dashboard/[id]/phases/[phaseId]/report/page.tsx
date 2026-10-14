'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../../../../i18n/LanguageProvider';

const API = process.env.NEXT_PUBLIC_API_URL;
const authToken = () => document.cookie.match(/(^| )token=([^;]+)/)?.[2] ?? localStorage.getItem('token') ?? '';
const media = (path?: string | null) => (!path ? null : path.startsWith('http') ? path : `${API}${path}`);

interface Finding {
  id: number;
  bugId: string;
  status: string;
  priority: string;
  url?: string;
  actualResult?: string;
  description?: string;
  createdAt?: number;
  createdByName?: string | null;
  assignedToEmail?: string | null;
  deadline?: string | null;
  attachmentUrl?: string | null;
  resolutionEvidenceUrl?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: number | null;
}
interface Clause {
  id: number;
  title: string;
  expectedResult?: string;
  status?: string | null;
  findings: Finding[];
}
interface Report {
  project: { id: number; name: string } | null;
  phase: { id: number; name: string; description?: string | null; startDate: string; endDate: string; closedAt?: number | null; closedByName?: string | null };
  clauses: Clause[];
}

/** Printable phase report: clauses, findings, before/after evidence, who fixed and who approved. */
export default function PhaseReportPage({ params }: { params: Promise<{ id: string; phaseId: string }> }) {
  const { id, phaseId } = use(params);
  const { t, lang } = useLanguage();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/projects/${id}/phases/${phaseId}/report`, { headers: { Authorization: `Bearer ${authToken()}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        setReport(await res.json());
      })
      .catch(() => setError(t('Could not load the phase report.')));
  }, [id, phaseId, t]);

  const fmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const date = (v?: string | number | null) => (v == null || v === '' ? '—' : fmt.format(typeof v === 'number' ? new Date(v) : new Date(`${v}T00:00:00`)));

  if (error) return <p className="p-10 text-center text-sm text-red-700">{error}</p>;
  if (!report) return <p className="p-10 text-center text-sm text-slate-400">{t('Loading…')}</p>;

  const { project, phase, clauses } = report;
  const findings = clauses.flatMap((c) => c.findings);
  const fixed = findings.filter((f) => f.status === 'fixed').length;
  const done = clauses.filter((c) =>
    c.findings.length ? c.findings.every((f) => f.status === 'fixed') : c.status === 'passed',
  ).length;

  const statusLabel = (s: string) =>
    s === 'fixed' ? t('Fixed') : s === 'pendingReview' ? t('Awaiting approval') : s === 'in-progress' ? t('In Progress') : t('Not Fixed');

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-4 flex max-w-4xl items-center justify-between">
        <Link href={`/dashboard/${id}`} className="text-sm font-semibold text-brand-700 hover:underline">
          {t('Back to project')}
        </Link>
        <button type="button" onClick={() => window.print()} className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
          {t('Print / save as PDF')}
        </button>
      </div>

      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:shadow-none">
        {/* heading */}
        <header className="flex items-start justify-between gap-4 border-b-2 border-brand-700 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{t('Phase report')}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{phase.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {project?.name} · {date(phase.startDate)} – {date(phase.endDate)}
            </p>
            {phase.description && <p className="mt-1 text-sm text-slate-500">{phase.description}</p>}
          </div>
          <Image src="/logo.png" alt="Imtithal" width={64} height={64} className="h-16 w-16 object-contain" />
        </header>

        {/* summary */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t('Phase status'), value: phase.closedAt ? t('Closed') : t('Open') },
            { label: t('Clauses done'), value: `${done} / ${clauses.length}` },
            { label: t('Findings fixed'), value: `${fixed} / ${findings.length}` },
            { label: t('Closed on'), value: phase.closedAt ? `${date(phase.closedAt)}` : '—' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] text-slate-500">{s.label}</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </section>
        {phase.closedAt && (
          <p className="mt-3 text-sm text-emerald-800">
            ✓ {t('Closed by {name} on {date}', { name: phase.closedByName ?? '—', date: date(phase.closedAt) })}
          </p>
        )}

        {/* clauses */}
        {clauses.map((c, i) => (
          <section key={c.id} className="mt-8 break-inside-avoid-page">
            <h2 className="text-base font-bold text-slate-900">
              {i + 1}. {c.title}
            </h2>
            {c.expectedResult && (
              <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="font-semibold">{t('Required:')}</span> {c.expectedResult}
              </p>
            )}
            {c.findings.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">
                {c.status === 'passed' ? t('No findings · marked compliant') : t('No findings recorded')}
              </p>
            ) : (
              c.findings.map((f) => (
                <div key={f.id} className="mt-3 break-inside-avoid rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-semibold text-white">{f.bugId}</span>
                    <span className="font-semibold text-slate-900">{f.actualResult || f.description}</span>
                    <span className={`ms-auto rounded-full px-2 py-0.5 text-xs font-semibold ${f.status === 'fixed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                      {statusLabel(f.status)}
                    </span>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 sm:grid-cols-3">
                    <div><dt className="inline font-semibold">{t('Site location')}: </dt><dd className="inline">{f.url || '—'}</dd></div>
                    <div><dt className="inline font-semibold">{t('Risk level')}: </dt><dd className="inline">{t(f.priority)}</dd></div>
                    <div><dt className="inline font-semibold">{t('Reported by')}: </dt><dd className="inline">{f.createdByName || '—'} · {date(f.createdAt)}</dd></div>
                    <div><dt className="inline font-semibold">{t('Assigned to')}: </dt><dd className="inline">{f.assignedToEmail || '—'}</dd></div>
                    <div><dt className="inline font-semibold">{t('Deadline')}: </dt><dd className="inline">{date(f.deadline)}</dd></div>
                    <div><dt className="inline font-semibold">{t('Approved by')}: </dt><dd className="inline">{f.reviewedByName ? `${f.reviewedByName} · ${date(f.reviewedAt)}` : '—'}</dd></div>
                  </dl>
                  {(f.attachmentUrl || f.resolutionEvidenceUrl) && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {[
                        { label: t('Before'), src: media(f.attachmentUrl) },
                        { label: t('After'), src: media(f.resolutionEvidenceUrl) },
                      ].map((ph) => (
                        <figure key={ph.label} className="overflow-hidden rounded-lg border border-slate-200">
                          <figcaption className="bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">{ph.label}</figcaption>
                          {ph.src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ph.src} alt={ph.label} className="h-40 w-full object-contain" />
                          ) : (
                            <div className="flex h-40 items-center justify-center text-xs text-slate-400">{t('No photo')}</div>
                          )}
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>
        ))}

        <footer className="mt-10 border-t border-slate-200 pt-3 text-[11px] text-slate-400">
          {t('Generated by Imtithal on {date}', { date: date(Date.now()) })}
        </footer>
      </article>
    </div>
  );
}
