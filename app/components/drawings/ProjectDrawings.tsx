'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageProvider';
import { AiMark } from '../ui/Ai';

const API = process.env.NEXT_PUBLIC_API_URL;
export const DRAWING_ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';
const MAX_BYTES = 20 * 1024 * 1024;

const authToken = () =>
  (typeof document !== 'undefined' && document.cookie.match(/(^| )token=([^;]+)/)?.[2]) ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('token')) ||
  '';

interface Doc {
  id: number;
  fileName: string;
  url: string;
  contentType: string;
  size: number;
  aiSummary?: string | null;
}

type Step = 'uploading' | 'reading' | 'done' | 'error';
interface Job {
  key: string;
  name: string;
  step: Step;
  error?: string;
}

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Project drawings: upload plans (PDF or images), let the AI read each one once, and show what it understood.
 * The AI then compares site findings with these drawings.
 */
export default function ProjectDrawings({
  projectId,
  pendingFiles,
  canEdit = true,
  onJobsDone,
}: {
  projectId: string | number;
  /** files picked before the project existed (Create Project); uploaded once on mount */
  pendingFiles?: File[];
  canEdit?: boolean;
  onJobsDone?: () => void;
}) {
  const { t, lang } = useLanguage();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [error, setError] = useState('');
  const started = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/documents`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (res.ok) setDocs(await res.json());
    } catch {
      /* the list just stays as it is */
    }
  }, [projectId]);

  const setJob = (key: string, patch: Partial<Job>) =>
    setJobs((prev) => prev.map((j) => (j.key === key ? { ...j, ...patch } : j)));

  /** Has the AI read a drawing that is already uploaded. */
  const read = useCallback(
    async (docId: number, key?: string) => {
      if (key) setJob(key, { step: 'reading' });
      const res = await fetch('/api/drawing-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
        body: JSON.stringify({ projectId: String(projectId), documentId: docId, lang }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `${res.status}`);
      }
    },
    [projectId, lang],
  );

  const uploadAll = useCallback(
    async (files: File[]) => {
      const batch = files.map((f, i) => ({ key: `${Date.now()}-${i}-${f.name}`, name: f.name, step: 'uploading' as Step, file: f }));
      setJobs((prev) => [...prev, ...batch.map(({ file: _file, ...job }) => job)]);

      for (const job of batch) {
        try {
          if (job.file.size > MAX_BYTES) throw new Error(t('The file is larger than 20 MB.'));
          const body = new FormData();
          body.append('file', job.file);
          const res = await fetch(`${API}/api/projects/${projectId}/documents`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${authToken()}` },
            body,
          });
          if (!res.ok) throw new Error((await res.text().catch(() => '')) || `${res.status}`);
          const doc = (await res.json()) as Doc;
          await load();
          await read(doc.id, job.key);
          setJob(job.key, { step: 'done' });
          await load();
        } catch (err) {
          setJob(job.key, { step: 'error', error: err instanceof Error ? err.message : String(err) });
        }
      }
      onJobsDone?.();
    },
    [projectId, load, read, onJobsDone, t],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (pendingFiles?.length && !started.current) {
      started.current = true;
      void uploadAll(pendingFiles);
    }
  }, [pendingFiles, uploadAll]);

  const remove = async (docId: number) => {
    setError('');
    const res = await fetch(`${API}/api/projects/${projectId}/documents/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken()}` },
    });
    if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== docId));
    else setError(t('Could not delete the drawing.'));
  };

  const reread = async (docId: number) => {
    setError('');
    const key = `re-${docId}-${Date.now()}`;
    const doc = docs.find((d) => d.id === docId);
    setJobs((prev) => [...prev, { key, name: doc?.fileName ?? '', step: 'reading' }]);
    try {
      await read(docId);
      setJob(key, { step: 'done' });
      await load();
    } catch (err) {
      setJob(key, { step: 'error', error: err instanceof Error ? err.message : String(err) });
    }
  };

  const busy = jobs.some((j) => j.step === 'uploading' || j.step === 'reading');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <AiMark className="h-5 w-5 text-brand-600" /> {t('Project drawings')}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {t('The AI reads each drawing once and compares site findings with the design.')}
          </p>
        </div>
        {canEdit && (
          <label className={`cursor-pointer rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800 hover:bg-brand-100 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            {t('+ Add drawings')}
            <input
              type="file"
              multiple
              accept={DRAWING_ACCEPT}
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = '';
                if (files.length) void uploadAll(files);
              }}
            />
          </label>
        )}
      </div>

      {jobs.filter((j) => j.step !== 'done').length > 0 && (
        <ul className="space-y-1.5">
          {jobs
            .filter((j) => j.step !== 'done')
            .map((j) => (
              <li key={j.key} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                {j.step === 'error' ? (
                  <span className="text-red-600">✕</span>
                ) : (
                  <AiMark className="h-4 w-4 text-brand-600" spin />
                )}
                <span className="truncate font-medium text-slate-700">{j.name}</span>
                <span className={`ms-auto shrink-0 ${j.step === 'error' ? 'text-red-600' : 'text-brand-700'}`}>
                  {j.step === 'uploading' && t('Uploading…')}
                  {j.step === 'reading' && t('AI is reading the drawing… (up to a minute)')}
                  {j.step === 'error' && `${t('Failed')}: ${j.error}`}
                </span>
              </li>
            ))}
        </ul>
      )}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      {docs.length === 0 && jobs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500">
          {t('No drawings yet. Add plans (PDF or images) so the AI can check findings against the design.')}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {docs.map((d) => (
            <li key={d.id} className="px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                  {d.contentType === 'application/pdf' ? 'PDF' : 'IMG'}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={`${API}${d.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-slate-900 hover:text-brand-700"
                  >
                    {d.fileName}
                  </a>
                  <p className="text-[11px] text-slate-500">
                    {formatSize(d.size)} ·{' '}
                    {d.aiSummary ? (
                      <span className="text-brand-700">{t('Read by AI')}</span>
                    ) : (
                      <span className="text-amber-700">{t('Not read yet')}</span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs font-semibold">
                  {d.aiSummary && (
                    <button type="button" onClick={() => setOpen(open === d.id ? null : d.id)} className="text-brand-700 hover:underline">
                      {open === d.id ? t('Hide') : t('What the AI read')}
                    </button>
                  )}
                  {canEdit && !d.aiSummary && (
                    <button type="button" onClick={() => void reread(d.id)} disabled={busy} className="text-brand-700 hover:underline disabled:opacity-50">
                      {t('Read with AI')}
                    </button>
                  )}
                  {canEdit && (
                    <button type="button" onClick={() => void remove(d.id)} className="text-slate-400 hover:text-red-600" aria-label={t('Delete')}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
              {open === d.id && d.aiSummary && (
                <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-brand-50/60 p-3 font-sans text-xs leading-relaxed text-slate-700">
                  {d.aiSummary}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
