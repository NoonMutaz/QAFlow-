'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useAuthContext } from '../../context/AuthContext';
import type { LibraryClause } from '../../api/sbc-suggest/libraryClause';
import { SBC_CODES, SBC_EDITION, findSbcCode } from '../../data/sbcCodes';
import { useLanguage } from '../../i18n/LanguageProvider';

const API = process.env.NEXT_PUBLIC_API_URL;

/** Columns of the import template, in order. */
const COLUMNS = ['CodeType', 'CodeVersion', 'SectionNumber', 'Title', 'RequirementText', 'SourceUrl', 'VerifiedBy'] as const;
type ClauseInput = Record<(typeof COLUMNS)[number], string>;

const EMPTY: ClauseInput = {
  CodeType: 'SBC 201',
  CodeVersion: SBC_EDITION,
  SectionNumber: '',
  Title: '',
  RequirementText: '',
  SourceUrl: '',
  VerifiedBy: '',
};

/** Arabic header names accepted in imported sheets, mapped to the template columns. */
const HEADER_ALIASES: Record<string, (typeof COLUMNS)[number]> = {
  'نوع الكود': 'CodeType',
  'الكود': 'CodeType',
  'الإصدار': 'CodeVersion',
  'رقم البند': 'SectionNumber',
  'رقم المادة': 'SectionNumber',
  'العنوان': 'Title',
  'النص': 'RequirementText',
  'المتطلب': 'RequirementText',
  'المصدر': 'SourceUrl',
  'تم التحقق بواسطة': 'VerifiedBy',
  'المراجع': 'VerifiedBy',
};

const inputCls =
  'w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500';

const formatDay = (ms?: number | null) =>
  ms ? new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/** Converts a sheet row (English or Arabic headers, any case) to a clause. */
function rowToClause(row: Record<string, unknown>): ClauseInput {
  const out: ClauseInput = { ...EMPTY, CodeType: '', CodeVersion: '' };
  for (const [header, value] of Object.entries(row)) {
    const key = header.trim();
    const column =
      COLUMNS.find((c) => c.toLowerCase() === key.replace(/\s+/g, '').toLowerCase()) ?? HEADER_ALIASES[key];
    if (column) out[column] = String(value ?? '').trim();
  }
  out.CodeType = findSbcCode(out.CodeType)?.code ?? out.CodeType;
  return out;
}

const toDto = (c: ClauseInput) => ({
  codeType: c.CodeType,
  codeVersion: c.CodeVersion,
  sectionNumber: c.SectionNumber,
  title: c.Title,
  requirementText: c.RequirementText,
  sourceUrl: c.SourceUrl || null,
  verifiedBy: c.VerifiedBy || null,
});

/** Shared library of engineer-verified SBC clauses that the AI suggests from. */
export default function SbcLibrary() {
  const { t, lang } = useLanguage();
  const { token } = useAuthContext();
  const [clauses, setClauses] = useState<LibraryClause[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<{ id: number | null; value: ClauseInput } | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string; details?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const headers = useMemo(
    () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }),
    [token],
  );

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/sbc-clauses`, { headers });
      if (!res.ok) throw new Error(`Could not load the library (${res.status})`);
      setClauses(await res.json());
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Could not load the library' });
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clauses;
    return clauses.filter((c) =>
      [c.codeType, c.codeVersion, c.sectionNumber, c.title, c.requirementText].join(' ').toLowerCase().includes(q),
    );
  }, [clauses, query]);

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/sbc-clauses${editing.id ? `/${editing.id}` : ''}`, {
        method: editing.id ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(toDto(editing.value)),
      });
      if (!res.ok) throw new Error((await res.text()) || `Save failed (${res.status})`);
      setEditing(null);
      setMessage({ kind: 'ok', text: t('Clause saved.') });
      await load();
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/sbc-clauses/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
    } finally {
      setBusy(false);
    }
  };

  const importFile = async (file: File) => {
    setBusy(true);
    setMessage(null);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' }).map(rowToClause);
      if (rows.length === 0) throw new Error('The file has no rows under the header.');

      const res = await fetch(`${API}/api/sbc-clauses/import`, {
        method: 'POST',
        headers,
        body: JSON.stringify(rows.map(toDto)),
      });
      if (!res.ok) throw new Error((await res.text()) || `Import failed (${res.status})`);
      const result = (await res.json()) as { created: number; updated: number; errors: string[] };
      setMessage({
        kind: result.errors.length ? 'error' : 'ok',
        text: t('Imported {created} new and updated {updated} clauses.', { created: result.created, updated: result.updated }) +
          (result.errors.length ? ` ${t('{n} rows skipped.', { n: result.errors.length })}` : ''),
        details: result.errors.slice(0, 10),
      });
      await load();
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Import failed' });
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => {
    const sheet = XLSX.utils.json_to_sheet<ClauseInput>(
      [
        {
          CodeType: 'SBC 201',
          CodeVersion: '2024',
          SectionNumber: '1010.1.2',
          Title: 'Door swing',
          RequirementText: 'Write the verified requirement here (official text or your verified summary).',
          SourceUrl: 'https://www.sbc.gov.sa',
          VerifiedBy: 'Eng. Name',
        },
      ],
      { header: [...COLUMNS] },
    );
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'SBC clauses');
    XLSX.writeFile(book, 'imtithal-sbc-clauses-template.xlsx');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("SBC Library")}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {t("Verified Saudi Building Code clauses. The AI suggests from this library and each project's own clauses first; a clause it proposes itself is clearly marked as not verified.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadTemplate}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("Download template")}
            </button>
            <label className={`cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
              {t("Import Excel / CSV")}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) void importFile(file);
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setEditing({ id: null, value: { ...EMPTY } })}
              className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t("+ Add clause")}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.kind === 'ok' ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <p className="font-medium">{message.text}</p>
            {message.details && message.details.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-xs">
                {message.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Search + count */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search by code, section, title or text…")}
            className={`${inputCls} mt-0 sm:max-w-sm`}
          />
          <span className="text-xs text-slate-500">
            {t("{shown} of {total} clauses", { shown: filtered.length, total: clauses.length })}
          </span>
        </div>

        {/* List */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-10 text-center text-sm text-slate-400">{t("Loading…")}</p>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-semibold text-slate-800">
                {clauses.length === 0 ? t('The library is empty') : t('No clause matches your search')}
              </p>
              {clauses.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {t("Download the template, fill in the clauses your engineer verified, and import it.")}
                </p>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-300">
                        {c.codeType} §{c.sectionNumber}
                      </span>
                      {c.codeVersion && <span className="text-[11px] text-slate-500">{t("{version} edition", { version: c.codeVersion })}</span>}
                      {findSbcCode(c.codeType) && (
                        <span className="text-[11px] text-slate-500" dir="rtl">{findSbcCode(c.codeType)!.nameAr}</span>
                      )}
                      <span className="text-sm font-semibold text-slate-900">{c.title}</span>
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-600">{c.requirementText}</p>
                    <p className="flex flex-wrap gap-x-3 text-[11px] text-slate-400">
                      {c.verifiedBy && (
                        <span className="text-blue-700">
                          ✓ {t("Verified by")} {c.verifiedBy}
                          {c.lastVerifiedAt ? ` · ${formatDay(c.lastVerifiedAt)}` : ''}
                        </span>
                      )}
                      {c.sourceUrl && (
                        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                          {t("Source ↗")}
                        </a>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 text-xs font-semibold">
                    {confirmDelete === c.id ? (
                      <>
                        <button type="button" onClick={() => void remove(c.id)} disabled={busy} className="rounded-md bg-red-600 px-2.5 py-1.5 text-white hover:bg-red-700">
                          {t("Delete")}
                        </button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-600">
                          {t("Cancel")}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              id: c.id,
                              value: {
                                CodeType: c.codeType,
                                CodeVersion: c.codeVersion,
                                SectionNumber: c.sectionNumber,
                                Title: c.title,
                                RequirementText: c.requirementText,
                                SourceUrl: c.sourceUrl ?? '',
                                VerifiedBy: c.verifiedBy ?? '',
                              },
                            })
                          }
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50"
                        >
                          {t("Edit")}
                        </button>
                        <button type="button" onClick={() => setConfirmDelete(c.id)} className="rounded-md border border-red-200 px-2.5 py-1.5 text-red-700 hover:bg-red-50">
                          {t("Delete")}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Add / edit dialog */}
      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">{editing.id ? t('Edit clause') : t('Add verified clause')}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{t("Check the clause against the official SBC text before saving.")}</p>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              <label className="text-xs font-medium text-slate-700 sm:col-span-3">
                {t("Code")}
                <select
                  value={editing.value.CodeType}
                  onChange={(e) => setEditing({ ...editing, value: { ...editing.value, CodeType: e.target.value } })}
                  className={inputCls}
                >
                  {!findSbcCode(editing.value.CodeType) && editing.value.CodeType && (
                    <option value={editing.value.CodeType}>{editing.value.CodeType}</option>
                  )}
                  {SBC_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} · {lang === 'ar' ? c.nameAr : `${c.nameEn} · ${c.nameAr}`}
                    </option>
                  ))}
                </select>
              </label>
              {(
                [
                  ['CodeVersion', 'Edition', SBC_EDITION, 1],
                  ['SectionNumber', 'Section', '1010.1.2', 1],
                  ['Title', 'Title', 'Door swing', 1],
                ] as const
              ).map(([key, label, placeholder, span]) => (
                <label key={key} className={`text-xs font-medium text-slate-700 ${span === 1 ? '' : 'sm:col-span-3'}`}>
                  {t(label)}
                  <input
                    value={editing.value[key]}
                    placeholder={placeholder}
                    onChange={(e) => setEditing({ ...editing, value: { ...editing.value, [key]: e.target.value } })}
                    className={inputCls}
                  />
                </label>
              ))}
              <label className="text-xs font-medium text-slate-700 sm:col-span-3">
                {t("Requirement")}
                <textarea
                  rows={4}
                  value={editing.value.RequirementText}
                  placeholder={t("The verified requirement (official text, or your verified summary)")}
                  onChange={(e) => setEditing({ ...editing, value: { ...editing.value, RequirementText: e.target.value } })}
                  className={inputCls}
                />
              </label>
              <label className="text-xs font-medium text-slate-700 sm:col-span-2">
                {t("Source link")}
                <input
                  value={editing.value.SourceUrl}
                  placeholder="https://www.sbc.gov.sa/…"
                  onChange={(e) => setEditing({ ...editing, value: { ...editing.value, SourceUrl: e.target.value } })}
                  className={inputCls}
                />
              </label>
              <label className="text-xs font-medium text-slate-700">
                {t("Verified by")}
                <input
                  value={editing.value.VerifiedBy}
                  placeholder={t("You, if empty")}
                  onChange={(e) => setEditing({ ...editing, value: { ...editing.value, VerifiedBy: e.target.value } })}
                  className={inputCls}
                />
              </label>
            </div>
            <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700">
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={busy}
                className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {busy ? t('Saving…') : t('Save clause')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
