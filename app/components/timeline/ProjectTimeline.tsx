'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../i18n/LanguageProvider';

const API = process.env.NEXT_PUBLIC_API_URL;
const authToken = () =>
  document.cookie.match(/(^| )token=([^;]+)/)?.[2] ?? localStorage.getItem('token') ?? '';

/** A project SBC clause as returned by GET /api/projects/{id}/testcases. */
export interface TimelineClause {
  id: number;
  title: string;
  status?: string | null;
  linkedBugs?: { id: number; bugId: string; status: string }[];
}

interface Phase {
  id: number;
  name: string;
  description?: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  clauseIds: number[];
  closedAt?: number | null;
  closedByName?: string | null;
}

/** closed: closed by the owner · overdue: end date passed but not closed (still locked) */
type PhaseState = 'closed' | 'overdue' | 'current' | 'upcoming';
type Draft = { id: number | null; name: string; description: string; startDate: string; endDate: string; clauseIds: number[] };

const DAY = 24 * 60 * 60 * 1000;
const toTime = (d: string) => new Date(`${d}T00:00:00`).getTime();
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const daysBetween = (a: string, b: string) => Math.round((toTime(b) - toTime(a)) / DAY);

/** A clause is done when all its findings are fixed, or it has none and was marked compliant. */
function clauseState(c: TimelineClause | undefined): 'done' | 'open' | 'todo' {
  if (!c) return 'todo';
  const bugs = c.linkedBugs ?? [];
  if (bugs.length > 0) return bugs.every((b) => b.status === 'fixed') ? 'done' : 'open';
  return c.status === 'passed' ? 'done' : 'todo';
}

/**
 * Project schedule: phases with dates and the SBC clauses worked on in each, the current phase,
 * a visual timeline with a "today" marker, and progress per phase.
 */
export default function ProjectTimeline({
  projectId,
  clauses,
  canEdit,
  isOwner = false,
}: {
  projectId: string | number;
  clauses: TimelineClause[];
  canEdit: boolean;
  /** only the owner (consultant) closes phases */
  isOwner?: boolean;
}) {
  const { t, lang } = useLanguage();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [closing, setClosing] = useState<number | null>(null);
  const [phaseError, setPhaseError] = useState<{ id: number; text: string } | null>(null);

  const today = todayIso();
  const clauseById = useMemo(() => new Map(clauses.map((c) => [c.id, c])), [clauses]);
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { day: 'numeric', month: 'short' }),
    [lang],
  );
  const fmtDate = (d: string) => fmt.format(new Date(`${d}T00:00:00`));

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/phases`, { headers: { Authorization: `Bearer ${authToken()}` } });
      if (res.ok) setPhases(await res.json());
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const stateOf = (p: Phase): PhaseState =>
    p.closedAt ? 'closed' : p.endDate < today ? 'overdue' : p.startDate > today ? 'upcoming' : 'current';
  const progressOf = (p: Phase) => {
    const total = p.clauseIds.length;
    const done = p.clauseIds.filter((id) => clauseState(clauseById.get(id)) === 'done').length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  };

  const current = phases.find((p) => stateOf(p) === 'current');
  const next = phases.find((p) => stateOf(p) === 'upcoming');

  // overall range for the bar
  const rangeStart = phases.length ? phases.reduce((m, p) => (p.startDate < m ? p.startDate : m), phases[0].startDate) : today;
  const rangeEnd = phases.length ? phases.reduce((m, p) => (p.endDate > m ? p.endDate : m), phases[0].endDate) : today;
  const rangeDays = Math.max(1, daysBetween(rangeStart, rangeEnd) + 1);
  const pos = (d: string) => Math.min(100, Math.max(0, (daysBetween(rangeStart, d) / rangeDays) * 100));

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/phases${draft.id ? `/${draft.id}` : ''}`, {
        method: draft.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          startDate: draft.startDate,
          endDate: draft.endDate,
          clauseIds: draft.clauseIds,
        }),
      });
      if (!res.ok) throw new Error((await res.text()) || `${res.status}`);
      setDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Could not save the phase.'));
    } finally {
      setSaving(false);
    }
  };

  /** Owner closes the phase; the API refuses (409) while clauses are open, so the phase stays locked. */
  const setClosed = async (p: Phase, close: boolean) => {
    setClosing(p.id);
    setPhaseError(null);
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/phases/${p.id}/${close ? 'close' : 'reopen'}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        const open: string[] = data?.openClauses ?? [];
        setPhaseError({ id: p.id, text: t('Still open: {list}', { list: open.join('، ') }) });
        return;
      }
      if (!res.ok) throw new Error((await res.text()) || `${res.status}`);
      await load();
    } catch (err) {
      setPhaseError({ id: p.id, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setClosing(null);
    }
  };

  const remove = async (id: number) => {
    const res = await fetch(`${API}/api/projects/${projectId}/phases/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken()}` },
    });
    setConfirmDelete(null);
    if (res.ok) setPhases((prev) => prev.filter((p) => p.id !== id));
  };

  const newDraft = (): Draft => {
    const start = phases.length ? phases[phases.length - 1].endDate : today;
    const startDate = new Date(toTime(start) + (phases.length ? DAY : 0));
    const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { id: null, name: '', description: '', startDate: iso(startDate), endDate: iso(new Date(startDate.getTime() + 29 * DAY)), clauseIds: [] };
  };

  const stateStyle: Record<PhaseState, { bar: string; pill: string; label: string }> = {
    closed: { bar: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700', label: t('Closed') },
    overdue: { bar: 'bg-amber-500', pill: 'bg-amber-50 text-amber-800', label: t('Ended · not closed') },
    current: { bar: 'bg-brand-600', pill: 'bg-brand-600 text-white', label: t('In progress') },
    upcoming: { bar: 'bg-slate-300', pill: 'bg-slate-100 text-slate-600', label: t('Upcoming') },
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('Project timeline')}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{t('Phases of the project and the SBC clauses the team works on in each.')}</p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setDraft(newDraft())}
            className="rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800"
          >
            {t('+ Add phase')}
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">{t('Loading…')}</p>
      ) : phases.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          {t('No phases yet. Split the project into phases so everyone knows what is being worked on now.')}
        </p>
      ) : (
        <>
          {/* current phase banner */}
          {current ? (
            <CurrentPhase
              phase={current}
              today={today}
              progress={progressOf(current)}
              clauses={current.clauseIds.map((id) => clauseById.get(id)).filter((c): c is TimelineClause => !!c)}
              fmtDate={fmtDate}
            />
          ) : (
            <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {next
                ? t('No phase is running today. Next: "{name}" starts in {n} days.', { name: next.name, n: daysBetween(today, next.startDate) })
                : t('All phases are completed.')}
            </p>
          )}

          {/* timeline bar */}
          <div className="mt-6">
            <div className="relative h-8 rounded-lg bg-slate-100">
              {phases.map((p) => {
                const s = stateOf(p);
                return (
                  <div
                    key={p.id}
                    className={`absolute top-1 bottom-1 overflow-hidden rounded-md ${stateStyle[s].bar} ${s === 'upcoming' ? 'opacity-70' : ''}`}
                    style={{ insetInlineStart: `${pos(p.startDate)}%`, width: `${Math.max(1.5, pos(p.endDate) - pos(p.startDate) + 100 / rangeDays)}%` }}
                    title={`${p.name}: ${fmtDate(p.startDate)} – ${fmtDate(p.endDate)}`}
                  >
                    <span className="block truncate px-2 text-[10px] font-semibold leading-6 text-white">{p.name}</span>
                  </div>
                );
              })}
              {today >= rangeStart && today <= rangeEnd && (
                <div className="absolute -top-1 -bottom-1 w-0.5 bg-gold-500" style={{ insetInlineStart: `${pos(today)}%` }}>
                  <span className="absolute -top-4 -translate-x-1/2 rounded bg-gold-500 px-1 text-[9px] font-bold text-white rtl:translate-x-1/2">
                    {t('Today')}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-slate-400">
              <span>{fmtDate(rangeStart)}</span>
              <span>{fmtDate(rangeEnd)}</span>
            </div>
          </div>

          {/* phase list */}
          <ol className="mt-5 space-y-2">
            {phases.map((p, i) => {
              const s = stateOf(p);
              const pr = progressOf(p);
              return (
                <li key={p.id} className={`rounded-xl border p-3.5 ${s === 'current' ? 'border-brand-300 bg-brand-50/50' : 'border-slate-200'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">{i + 1}</span>
                    <span className="font-semibold text-slate-900">{p.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${stateStyle[s].pill}`}>{stateStyle[s].label}</span>
                    <span className="text-xs text-slate-500">
                      {fmtDate(p.startDate)} – {fmtDate(p.endDate)} · {t('{n} days', { n: daysBetween(p.startDate, p.endDate) + 1 })}
                    </span>
                    {canEdit && (
                      <span className="ms-auto flex gap-2 text-xs font-semibold">
                        {confirmDelete === p.id ? (
                          <>
                            <button type="button" onClick={() => void remove(p.id)} className="text-red-600 hover:underline">{t('Delete')}</button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="text-slate-500 hover:underline">{t('Cancel')}</button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setDraft({ id: p.id, name: p.name, description: p.description ?? '', startDate: p.startDate, endDate: p.endDate, clauseIds: p.clauseIds })}
                              className="text-brand-700 hover:underline"
                            >
                              {t('Edit')}
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(p.id)} className="text-slate-400 hover:text-red-600">✕</button>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  {p.description && <p className="mt-1.5 text-xs text-slate-600">{p.description}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${pr.percent === 100 ? 'bg-emerald-500' : 'bg-brand-600'}`} style={{ width: `${pr.percent}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">
                      {t('{done} of {total} clauses done', { done: pr.done, total: pr.total })}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                    {p.closedAt ? (
                      <span className="font-medium text-emerald-700">
                        ✓ {t('Closed by {name} on {date}', { name: p.closedByName ?? '—', date: fmt.format(new Date(p.closedAt)) })}
                      </span>
                    ) : pr.total > 0 && pr.done === pr.total ? (
                      <span className="font-medium text-emerald-700">{t('All clauses done · ready to close')}</span>
                    ) : (
                      <span className="flex items-center gap-1 font-medium text-amber-800">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="5" y="11" width="14" height="10" rx="2" />
                          <path d="M8 11V7a4 4 0 018 0v4" />
                        </svg>
                        {pr.total === 0
                          ? t('Locked · add clauses to this phase')
                          : t('Locked until {n} open clauses are done', { n: pr.total - pr.done })}
                      </span>
                    )}
                    <span className="ms-auto flex items-center gap-2">
                      <Link
                        href={`/dashboard/${projectId}/phases/${p.id}/report`}
                        className="rounded-md border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {t('Phase report')}
                      </Link>
                      {isOwner &&
                        (p.closedAt ? (
                          <button type="button" onClick={() => void setClosed(p, false)} disabled={closing === p.id}
                            className="rounded-md px-2.5 py-1 font-semibold text-slate-500 hover:text-slate-800">
                            {t('Reopen')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void setClosed(p, true)}
                            disabled={closing === p.id || pr.total === 0 || pr.done < pr.total}
                            title={pr.done < pr.total ? t('Locked until {n} open clauses are done', { n: pr.total - pr.done }) : undefined}
                            className="rounded-md bg-brand-700 px-2.5 py-1 font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            {closing === p.id ? t('Closing…') : t('Close phase')}
                          </button>
                        ))}
                    </span>
                  </div>
                  {phaseError?.id === p.id && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{phaseError.text}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}

      {/* add / edit dialog */}
      {draft && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={() => setDraft(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">{draft.id ? t('Edit phase') : t('Add phase')}</h3>
            </div>
            <div className="space-y-4 p-5">
              <label className="block text-xs font-medium text-slate-700">
                {t('Phase name')}
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder={t('e.g. Structure and concrete works')}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-slate-700">
                  {t('Start date')}
                  <input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
                </label>
                <label className="block text-xs font-medium text-slate-700">
                  {t('End date')}
                  <input type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
                </label>
              </div>
              <label className="block text-xs font-medium text-slate-700">
                {t('Description (optional)')}
                <textarea
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </label>
              <div>
                <span className="text-xs font-medium text-slate-700">{t('SBC clauses in this phase')}</span>
                {clauses.length === 0 ? (
                  <p className="mt-1 text-xs text-slate-500">{t('Add SBC clauses to the project first, then assign them to phases.')}</p>
                ) : (
                  <ul className="mt-1.5 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
                    {clauses.map((c) => (
                      <li key={c.id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={draft.clauseIds.includes(c.id)}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                clauseIds: e.target.checked ? [...draft.clauseIds, c.id] : draft.clauseIds.filter((id) => id !== c.id),
                              })
                            }
                            className="accent-brand-700"
                          />
                          <span className="text-slate-800">{c.title}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
            </div>
            <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
              <button type="button" onClick={() => setDraft(null)} className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700">
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || !draft.name.trim() || !draft.startDate || !draft.endDate}
                className="flex-1 rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
              >
                {saving ? t('Saving…') : t('Save phase')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** Banner for the phase running today. */
function CurrentPhase({
  phase,
  today,
  progress,
  clauses,
  fmtDate,
}: {
  phase: Phase;
  today: string;
  progress: { done: number; total: number; percent: number };
  clauses: TimelineClause[];
  fmtDate: (d: string) => string;
}) {
  const { t } = useLanguage();
  const day = daysBetween(phase.startDate, today) + 1;
  const total = daysBetween(phase.startDate, phase.endDate) + 1;
  const left = daysBetween(today, phase.endDate);

  return (
    <div className="mt-5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-900 to-brand-700 p-5 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-300">{t('Current phase')}</p>
          <p className="mt-1 text-xl font-bold">{phase.name}</p>
          <p className="mt-0.5 text-xs text-brand-100/80">
            {fmtDate(phase.startDate)} – {fmtDate(phase.endDate)} · {t('Day {day} of {total}', { day, total })} ·{' '}
            {left === 0 ? t('Last day') : t('{n} days left', { n: left })}
          </p>
        </div>
        <div className="text-end">
          <p className="text-3xl font-bold">{progress.percent}%</p>
          <p className="text-[11px] text-brand-100/80">{t('{done} of {total} clauses done', { done: progress.done, total: progress.total })}</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-gold-400" style={{ width: `${Math.min(100, (day / total) * 100)}%` }} />
      </div>
      {clauses.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {clauses.map((c) => {
            const s = clauseState(c);
            const open = (c.linkedBugs ?? []).filter((b) => b.status !== 'fixed').length;
            return (
              <li
                key={c.id}
                className={`rounded-lg px-2.5 py-1 text-xs ${
                  s === 'done' ? 'bg-emerald-400/20 text-emerald-100' : s === 'open' ? 'bg-rose-400/25 text-rose-100' : 'bg-white/10 text-brand-50'
                }`}
              >
                {s === 'done' ? '✓ ' : ''}
                {c.title}
                {s === 'open' && ` · ${t(open === 1 ? '{n} open finding' : '{n} open findings', { n: open })}`}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
