"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAuthContext } from '@/app/context/AuthContext';
import { useQueueContext, DuplicateMatch, Customer } from '@/app/context/QueueContext';
import { libraryClauseTitle, type LibraryClause } from '@/app/api/sbc-suggest/libraryClause';
import type { SbcCode } from '@/app/data/sbcCodes';
import { useLanguage } from '@/app/i18n/LanguageProvider';

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'High' | 'Medium' | 'Low';

/** Either a clause already in the project (testCaseId) or one from the verified SBC library. */
type ClauseMatch = {
  testCaseId?: number;
  libraryClause?: LibraryClause;
  reason: string;
  confidence: 'high' | 'medium';
};

type SbcSuggestion = {
  matches: ClauseMatch[];
  source: 'openai' | 'keywords' | 'none';
  aiUnavailable?: boolean;
  /** photo analysis only */
  finding?: string;
  details?: string;
  /** governing code document from the official SBC list, even when no clause matched */
  relevantCode?: SbcCode | null;
  /** only when no verified clause matched: a clause the AI proposes itself (unverified) */
  newClause?: NewClause | null;
};

type NewClause = {
  title: string;
  standard: string;
  reason: string;
};

/** Menu values for SBC library clauses; such a clause is copied into the project on submit. */
const LIB_PREFIX = 'lib:';
const isLibraryValue = (value: string) => value.startsWith(LIB_PREFIX);
/** Menu value for the AI-proposed clause; it is also added to the project on submit. */
const AI_NEW_CLAUSE = 'ai-new';

const formatDay = (ms?: number | null) =>
  ms ? new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/** Shrinks a photo to at most 1280px as JPEG so phone pictures upload quickly to the AI. */
async function photoToDataUrl(file: File, maxSide = 1280): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.8);
}

interface NewCustomer {
  name: string;
  priority: Priority;
  url: string;
  expectedResult: string;
  actualResult: string;
  description: string;
  note: string;
  bugId: string;
  testCaseId: string | number | null; 
  attachment?: File | null;
}

interface QueueFormProps {
  onAdd: (data: any) => Promise<any>; // ✨ Widened type to allow safe object/number properties checks
  projectId: string;
  testCases?: any[]; 
  currentUserRole?: 'owner' | 'member' | 'viewer' | string;
  existingBugs?: Customer[];
  /** called after an AI-proposed clause is saved, so the menu can include it */
  onTestCaseCreated?: (testCase: { id: number; title: string; expectedResult: string }) => void;
}

// ─── UI pieces ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:bg-gray-50';
const labelCls = 'text-[13px] font-medium text-gray-700';

function Section({ step, title, hint, children }: { step: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
          {step}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h3>
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
      </div>
      <div className="space-y-4 sm:ps-8">{children}</div>
    </section>
  );
}

function Required() {
  return <span className="text-red-500"> *</span>;
}

function SparkleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zm7 11l.9 2.6 2.6.9-2.6.9L19 20l-.9-2.6-2.6-.9 2.6-.9L19 13z" />
    </svg>
  );
}

function Spinner() {
  return <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />;
}

const RISK_STYLES: Record<Priority, { active: string; dot: string }> = {
  High: { active: 'border-red-500 bg-red-50 text-red-700', dot: 'bg-red-500' },
  Medium: { active: 'border-amber-500 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  Low: { active: 'border-emerald-500 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
};

export default function QueueForm({
  onAdd,
  projectId,
  testCases = [], 
  currentUserRole = 'viewer',
  existingBugs = [],  
  onTestCaseCreated,
}: QueueFormProps) {
  const { user } = useAuthContext();
  const { t, lang } = useLanguage();
  const { fetchBugs, findDuplicates } = useQueueContext();

  const currentUserName = user?.name ?? 'Current User';
  const canAddBug = currentUserRole === 'owner' || currentUserRole === 'member';

  const [formData, setFormData] = useState<Omit<NewCustomer, 'testCaseId'> & { testCaseId: string }>({
    name: currentUserName,
    priority: 'Medium',
    url: '',
    expectedResult: '',
    actualResult: '',
    description: '',
    note: '',
    bugId: '',
    testCaseId: '', 
    attachment: null,
  });

  const [duplicate, setDuplicate] = useState<DuplicateMatch | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [checkingAi, setCheckingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<SbcSuggestion | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [chosenLibraryClause, setChosenLibraryClause] = useState<LibraryClause | null>(null);
  const [chosenNewClause, setChosenNewClause] = useState<NewClause | null>(null);
  const [dismissedSuggestionKey, setDismissedSuggestionKey] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);
  const photoFilledKeyRef = useRef<string | null>(null);
  /** the "SBC Required Standard" text last filled from a clause, so a clause change can replace it */
  const [autoStandard, setAutoStandard] = useState<string | null>(null);

  // ─── Smart Duplicate Check Logic ───────────────────────────────────────────
  useEffect(() => {
    const description = formData.description?.trim();
    const actualResult = formData.actualResult?.trim();

    if (description && description.length >= 3) {
      const match = findDuplicates(existingBugs, description, "description");
      if (match) {
        setDuplicate(match);
        return;
      }
    }

    if (actualResult && actualResult.length >= 3) {
      const match = findDuplicates(existingBugs, actualResult, "actualResult");
      if (match) {
        setDuplicate(match);
        return;
      }
    }

    setDuplicate(null);
  }, [formData.description, formData.actualResult, existingBugs, findDuplicates]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: currentUserName }));
  }, [currentUserName]);

  useEffect(() => {
    if (!formData.attachment) {
      setPreviewSrc(null);
      return;
    }
    const url = URL.createObjectURL(formData.attachment);
    setPreviewSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [formData.attachment]);

  const resetForm = useCallback((): void => {
    setFormData({
      name: currentUserName,
      priority: 'Medium',
      url: '',
      expectedResult: '',
      actualResult: '',
      description: '',
      note: '',
      bugId: '',
      testCaseId: '', 
      attachment: null,
    });
    setDuplicate(null);
    setAiSuggestion(null);
    setAiNotice(null);
    setChosenLibraryClause(null);
    setChosenNewClause(null);
    setDismissedSuggestionKey(null);
    setPhotoNotice(null);
    photoFilledKeyRef.current = null;
    setAutoStandard(null);
    setError('');
  }, [currentUserName]);

  // Only the finding text drives the suggestion; picking a clause must not re-trigger it.
  const suggestionKey = [
    formData.url.trim(),
    formData.actualResult.trim(),
    formData.description.trim(),
  ].join('|');

  /** POSTs the finding (and optionally a photo) to the SBC suggestion route. */
  const requestSuggestion = async (
    extra: { image?: string },
    signal?: AbortSignal,
  ): Promise<SbcSuggestion> => {
    const token =
      document.cookie.match(/(^| )token=([^;]+)/)?.[2] ?? localStorage.getItem('token');
    const res = await fetch('/api/sbc-suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal,
      body: JSON.stringify({
        description: formData.description,
        actualResult: formData.actualResult,
        siteLocation: formData.url,
        clauses: testCases.map(
          (tc: { id: number; title: string; expectedResult?: string }) => ({
            id: tc.id,
            title: tc.title,
            expectedResult: tc.expectedResult,
          }),
        ),
        lang,
        ...extra,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error ?? `${res.status} ${res.statusText}`);
    }
    return (await res.json()) as SbcSuggestion;
  };

  const noticeFor = (suggestion: SbcSuggestion): string | null =>
    suggestion.aiUnavailable
      ? t('AI is unavailable right now (check the AI API key), so these are keyword matches.')
      : suggestion.matches.length === 0 && !suggestion.relevantCode && !suggestion.newClause
        ? t('No SBC clause matched with enough confidence. Pick one manually, or add it to the SBC Library.')
        : null;

  // AI suggests which "SBC Clause" menu option fits what the engineer typed
  useEffect(() => {
    // text the photo analysis just wrote already has its suggestion, don't ask again
    if (photoFilledKeyRef.current === suggestionKey) return;

    const findingLen =
      formData.actualResult.trim().length + formData.description.trim().length;

    if (findingLen < 20 || dismissedSuggestionKey === suggestionKey) {
      suggestAbortRef.current?.abort();
      setCheckingAi(false);
      setAiSuggestion(null);
      setAiNotice(null);
      return;
    }

    const timer = window.setTimeout(() => {
      suggestAbortRef.current?.abort();
      const controller = new AbortController();
      suggestAbortRef.current = controller;

      void (async () => {
        setCheckingAi(true);
        try {
          const suggestion = await requestSuggestion({}, controller.signal);
          if (controller.signal.aborted) return;
          setAiSuggestion(suggestion);
          setAiNotice(noticeFor(suggestion));
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setAiSuggestion(null);
          setAiNotice(
            `${t('AI suggestion request failed:')} ${err instanceof Error ? err.message : t('unknown error')}`,
          );
        } finally {
          if (suggestAbortRef.current === controller) setCheckingAi(false);
        }
      })();
    }, 900);

    return () => {
      window.clearTimeout(timer);
      suggestAbortRef.current?.abort(); // drop a stale in-flight answer when the text changes
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestionKey, dismissedSuggestionKey, testCases]);

  /** Adds a library or AI-proposed clause to the project (same endpoint as the test cases page) and returns its id. */
  const createClause = async (API: string, clause: { title: string; standard: string }): Promise<number> => {
    const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2] ?? localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const url = `${API}/api/projects/${projectId}/testcases`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: clause.title, steps: [], expectedResult: clause.standard }),
    });
    if (!res.ok) throw new Error(`Could not add the SBC clause to the project (${res.status})`);

    const created = await res.json().catch(() => null);
    let id: number | undefined = created?.id ?? created?.Id;
    if (typeof id !== 'number') {
      // the API did not return the new row, so look it up by title
      const list = await fetch(url, { headers }).then((r) => (r.ok ? r.json() : []));
      const found = (list as { id: number; title: string }[])
        .filter((tc) => tc.title === clause.title)
        .sort((a, b) => b.id - a.id)[0];
      id = found?.id;
    }
    if (typeof id !== 'number') throw new Error('Added the SBC clause but could not link it');

    onTestCaseCreated?.({ id, title: clause.title, expectedResult: clause.standard });
    return id;
  };

  const performSubmit = async (
    overrides?: Partial<typeof formData>,
  ): Promise<void> => {
    setUploading(true);
    setError('');

    const payload = { ...formData, ...overrides };

    try {
      const API = process.env.NEXT_PUBLIC_API_URL;
      if (!API) throw new Error('API URL missing');

      let parsedTestCaseId =
        payload.testCaseId === '' ? null : parseInt(payload.testCaseId, 10);

      if (isLibraryValue(payload.testCaseId)) {
        if (!chosenLibraryClause) throw new Error('SBC clause missing, pick it again');
        parsedTestCaseId = await createClause(API, {
          title: libraryClauseTitle(chosenLibraryClause),
          standard: chosenLibraryClause.requirementText,
        });
      }
      if (payload.testCaseId === AI_NEW_CLAUSE) {
        if (!chosenNewClause) throw new Error('AI clause missing, pick it again');
        parsedTestCaseId = await createClause(API, chosenNewClause);
      }

      const submissionPayload = {
        name: payload.name,
        priority: payload.priority,
        url: payload.url,
        expectedResult: payload.expectedResult,
        actualResult: payload.actualResult,
        description: payload.description,
        note: payload.note,
        testCaseId: parsedTestCaseId,
      };

      const createdBug = await onAdd(submissionPayload);
      const newBugId =
        createdBug && typeof createdBug === 'object' ? createdBug.id : createdBug;

      if (!newBugId) {
        throw new Error('Failed to create bug');
      }

      if (payload.attachment) {
        const cookieToken = document.cookie.match(/(^| )token=([^;]+)/)?.[2] ?? null;
        const token = cookieToken ?? localStorage.getItem('token');
        const fd = new FormData();
        fd.append('file', payload.attachment);

        const res = await fetch(
          `${API}/api/projects/${projectId}/bugs/${newBugId}/upload`,
          {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          },
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Upload failed: ${text}`);
        }
      }

      await fetchBugs(projectId);
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add bug';
      console.error(err);
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Links the clause and fills "SBC Required Standard" with its standard.
   * Text the engineer typed is kept; text we filled earlier is replaced when the clause changes.
   */
  const applyClause = (testCaseId: string, standard: string): void => {
    const untouched = !formData.expectedResult.trim() || formData.expectedResult === autoStandard;
    if (untouched) setAutoStandard(standard);
    setFormData((prev) => ({ ...prev, testCaseId, ...(untouched ? { expectedResult: standard } : {}) }));
  };

  const standardOf = (testCaseId: string): string =>
    testCases.find((tc: { id: number }) => String(tc.id) === testCaseId)?.expectedResult ?? '';

  const handleSelectClause = (testCaseId: number): void => {
    applyClause(String(testCaseId), standardOf(String(testCaseId)));
  };

  const handleSelectLibraryClause = (clause: LibraryClause): void => {
    setChosenLibraryClause(clause);
    applyClause(`${LIB_PREFIX}${clause.id}`, clause.requirementText);
  };

  const handleSelectNewClause = (clause: NewClause): void => {
    setChosenNewClause(clause);
    applyClause(AI_NEW_CLAUSE, clause.standard);
  };

  // the AI-proposed clause in the menu: the one already picked wins over a newer proposal
  const menuNewClause =
    formData.testCaseId === AI_NEW_CLAUSE ? chosenNewClause : aiSuggestion?.newClause ?? null;

  // the AI clause shown in the menu: the one already picked wins over a newer proposal
  // library clauses shown in the menu: the AI's library picks plus the one already chosen
  const menuLibraryClauses = [
    ...(chosenLibraryClause && isLibraryValue(formData.testCaseId) ? [chosenLibraryClause] : []),
    ...(aiSuggestion?.matches.flatMap((m) => (m.libraryClause ? [m.libraryClause] : [])) ?? []),
  ].filter((c, i, all) => all.findIndex((x) => x.id === c.id) === i);
  const aiMatchedIds = new Set(aiSuggestion?.matches.flatMap((m) => (m.testCaseId != null ? [m.testCaseId] : [])) ?? []);

  const handleDismissSuggestion = (): void => {
    setDismissedSuggestionKey(suggestionKey);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void => {
    if (e.target.name === 'name') return;
    if (e.target.name === 'testCaseId' && e.target.value === AI_NEW_CLAUSE && menuNewClause) {
      handleSelectNewClause(menuNewClause);
      return;
    }
    if (e.target.name === 'testCaseId' && isLibraryValue(e.target.value)) {
      const clause = menuLibraryClauses.find((c) => `${LIB_PREFIX}${c.id}` === e.target.value);
      if (clause) handleSelectLibraryClause(clause);
      return;
    }
    if (e.target.name === 'testCaseId') {
      applyClause(e.target.value, standardOf(e.target.value));
      return;
    }
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData((prev) => ({
      ...prev,
      attachment: e.target.files?.[0] ?? null,
    }));
    setPhotoNotice(null);
    e.target.value = '';
  };

  /** AI looks at the attached photo, writes the finding, and suggests the SBC clause. */
  const handleAnalyzePhoto = async (): Promise<void> => {
    const file = formData.attachment;
    if (!file || !file.type.startsWith('image/')) return;
    setAnalyzingPhoto(true);
    setPhotoNotice(null);
    suggestAbortRef.current?.abort(); // the photo answer replaces any typing suggestion in flight
    try {
      const result = await requestSuggestion({ image: await photoToDataUrl(file) });

      const actualResult = formData.actualResult.trim() || result.finding || '';
      const description = formData.description.trim() || result.details || '';
      photoFilledKeyRef.current = [formData.url.trim(), actualResult.trim(), description.trim()].join('|');
      setFormData((prev) => ({ ...prev, actualResult, description }));

      setDismissedSuggestionKey(null);
      setAiSuggestion(result);
      setAiNotice(noticeFor(result));
      setPhotoNotice(
        result.aiUnavailable
          ? t('AI could not analyze the photo right now. Describe the finding yourself.')
          : result.finding && formData.actualResult.trim()
            ? t('AI sees: "{finding}" (your text was kept). The suggested SBC clause is above.', { finding: result.finding })
            : result.finding
              ? t('AI filled in the Site Finding and Detailed finding from the photo. Check them, then pick the SBC clause above.')
              : t('AI did not find a violation in this photo.'),
      );
    } catch (err) {
      setPhotoNotice(`${t('Photo analysis failed:')} ${err instanceof Error ? err.message : t('unknown error')}`);
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    await performSubmit();
  };

  if (!canAddBug) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{t("View-only access")}</p>
          <p className="mt-1 text-xs text-gray-500">{t("Only project owners and members can log non-conformities.")}</p>
        </div>
      </div>
    );
  }

  const isImage = formData.attachment?.type.startsWith('image/') ?? false;
  const showSuggestions =
    !checkingAi && aiSuggestion && (aiSuggestion.matches.length > 0 || !!aiSuggestion.newClause);

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-7">
      {/* ─── HEADER ─── */}
      <header className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{t("Log SBC non-conformity")}</h2>
          <p className="mt-0.5 text-xs text-gray-500">{t("Photo → finding → SBC clause. AI helps at each step.")}</p>
        </div>
        <span
          className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600"
          title={t("Reported by")}
        >
          {formData.name}
        </span>
      </header>

      {/* ─── 1. EVIDENCE ─── */}
      <Section step={1} title={t("Evidence")} hint={t("A site photo lets AI write the finding for you.")}>
        {!formData.attachment ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
            <svg className="h-7 w-7 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{t("Upload a site photo or video")}</span>
            <span className="text-xs text-gray-400">{t("JPG, PNG, WebP or MP4 · optional")}</span>
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={uploading} className="sr-only" />
          </label>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            {previewSrc && (
              <div className="relative h-44 w-full bg-gray-900/5">
                {isImage ? (
                  <Image src={previewSrc} alt="Site photo" fill className="object-contain" sizes="420px" />
                ) : (
                  <video src={previewSrc} controls className="h-full w-full object-contain" />
                )}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-white px-3 py-2">
              <span className="truncate text-xs text-gray-600">{formData.attachment.name}</span>
              <div className="flex shrink-0 gap-3 text-xs font-medium">
                <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                  {t("Replace")}
                  <input type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={uploading} className="sr-only" />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, attachment: null }));
                    setPhotoNotice(null);
                  }}
                  disabled={uploading}
                  className="text-gray-500 hover:text-red-600"
                >
                  {t("Remove")}
                </button>
              </div>
            </div>
          </div>
        )}

        {isImage && (
          <button
            type="button"
            onClick={() => void handleAnalyzePhoto()}
            disabled={uploading || analyzingPhoto}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
          >
            {analyzingPhoto ? <Spinner /> : <SparkleIcon />}
            {analyzingPhoto ? t('Analyzing photo…') : t('Analyze photo with AI')}
          </button>
        )}
        {photoNotice && (
          <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-800">{photoNotice}</p>
        )}
      </Section>

      {/* ─── 2. FINDING ─── */}
      <Section step={2} title={t("Finding")} hint={t("What did you see on site?")}>
        <div>
          <label className={labelCls}>{t("Site location")}<Required /></label>
          <input
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            placeholder={t("e.g. Block B, ground floor, east stairwell")}
            className={inputCls}
            disabled={uploading}
          />
        </div>

        <div>
          <label className={labelCls}>{t("Site finding")}<Required /></label>
          <textarea
            name="actualResult"
            required
            value={formData.actualResult}
            onChange={handleChange}
            rows={2}
            placeholder={t("One line, e.g. Emergency exit door is padlocked")}
            className={inputCls}
            disabled={uploading}
          />
        </div>

        <div>
          <label className={labelCls}>{t("Detailed finding")}<Required /></label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder={t("What is visible, where, and why it is non-compliant")}
            className={inputCls}
            disabled={uploading}
          />
        </div>

        {duplicate && (
          <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2L1 21h22L12 2zm0 6l7.5 13h-15L12 8zm-1 4v4h2v-4h-2zm0 5v2h2v-2h-2z" />
            </svg>
            <div className="text-xs text-amber-900">
              <p className="font-semibold">{t("Possible duplicate")}</p>
              <p className="mt-0.5">
                {t("A similar finding was already reported as")}{' '}
                <span className="font-semibold">{duplicate.item.bugId}</span>. {t("Check it before submitting.")}
              </p>
            </div>
          </div>
        )}

        {/* AI status + suggestions */}
        {checkingAi && (
          <p className="flex items-center gap-2 text-xs font-medium text-indigo-600">
            <Spinner /> {t("AI is matching this finding to an SBC clause…")}
          </p>
        )}
        {!checkingAi && aiNotice && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{aiNotice}</p>
        )}

        {!checkingAi && aiSuggestion?.relevantCode && aiSuggestion.matches.length === 0 && !aiSuggestion.newClause && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
            <p className="text-xs font-semibold text-amber-900">{t("Governing code")}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {aiSuggestion.relevantCode.code} · {lang === 'ar' ? aiSuggestion.relevantCode.nameAr : aiSuggestion.relevantCode.nameEn}
            </p>
            {lang !== 'ar' && <p className="text-sm text-gray-700" dir="rtl">{aiSuggestion.relevantCode.nameAr}</p>}
            <p className="mt-1.5 text-xs text-amber-900">
              {t("No verified clause from this code is in the SBC Library yet, so no section is suggested.")}{' '}
              <a href="/sbc-library" target="_blank" className="font-semibold underline">{t("Add one to the library")}</a>
            </p>
          </div>
        )}

        {showSuggestions && (
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-white p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
                <SparkleIcon className="h-3.5 w-3.5 text-indigo-500" /> {t("Suggested SBC clause")}
              </span>
              <button type="button" onClick={handleDismissSuggestion} className="text-[11px] font-medium text-gray-500 hover:text-gray-700">
                {t("Dismiss")}
              </button>
            </div>

            {aiSuggestion.matches.map((m) => {
              const lib = m.libraryClause;
              const value = lib ? `${LIB_PREFIX}${lib.id}` : String(m.testCaseId);
              const projectClause = lib ? null : testCases.find((tc: { id: number }) => tc.id === m.testCaseId);
              const selected = formData.testCaseId === value;
              return (
                <div
                  key={value}
                  className={`flex items-start justify-between gap-3 rounded-lg border bg-white p-3 transition ${
                    selected ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-200'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    {lib ? (
                      <>
                        <p className="text-[11px] font-semibold text-indigo-700">
                          {lib.codeType}
                          {lib.codeVersion && ` · ${t('{version} edition', { version: lib.codeVersion })}`} · §{lib.sectionNumber}
                        </p>
                        <p className="text-sm font-medium text-gray-900">{lib.title}</p>
                        <p className="line-clamp-3 text-xs leading-relaxed text-gray-700">{lib.requirementText}</p>
                      </>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{projectClause?.title ?? `#${m.testCaseId}`}</p>
                    )}
                    {m.reason && <p className="text-xs leading-relaxed text-gray-500">{m.reason}</p>}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          m.confidence === 'high' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {m.confidence === 'high' ? t('High confidence') : t('Medium confidence')}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                        {lib ? t('SBC library') : t('Project clause')}
                      </span>
                      {lib?.verifiedBy && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          ✓ {t('Verified by')} {lib.verifiedBy}
                          {lib.lastVerifiedAt ? ` · ${formatDay(lib.lastVerifiedAt)}` : ''}
                        </span>
                      )}
                      {lib?.sourceUrl && (
                        <a
                          href={lib.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-indigo-600 hover:underline"
                        >
                          {t('Source')} ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => (lib ? handleSelectLibraryClause(lib) : m.testCaseId != null && handleSelectClause(m.testCaseId))}
                    disabled={uploading || selected}
                    className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      selected ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {selected ? t('Selected ✓') : t('Select')}
                  </button>
                </div>
              );
            })}

            {aiSuggestion.newClause && (
              <div
                className={`flex items-start justify-between gap-3 rounded-lg border border-dashed bg-white p-3 ${
                  formData.testCaseId === AI_NEW_CLAUSE ? 'border-emerald-300' : 'border-indigo-300'
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-gray-900">{aiSuggestion.newClause.title}</p>
                  <p className="text-xs leading-relaxed text-gray-700">{aiSuggestion.newClause.standard}</p>
                  {aiSuggestion.newClause.reason && (
                    <p className="text-xs text-gray-500">{aiSuggestion.newClause.reason}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      {t('AI suggestion')}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {t('Not verified · not in the library')}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => aiSuggestion.newClause && handleSelectNewClause(aiSuggestion.newClause)}
                  disabled={uploading || formData.testCaseId === AI_NEW_CLAUSE}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    formData.testCaseId === AI_NEW_CLAUSE
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {formData.testCaseId === AI_NEW_CLAUSE ? t('Selected ✓') : t('Select')}
                </button>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ─── 3. SBC COMPLIANCE ─── */}
      <Section step={3} title={t("SBC compliance")} hint={t("Pick the clause; the required standard fills in.")}>
        <div>
          <label className={labelCls}>{t("SBC clause")}</label>
          <select
            name="testCaseId"
            value={formData.testCaseId}
            onChange={handleChange}
            className={inputCls}
            disabled={uploading}
          >
            <option value="">{t("No clause linked")}</option>
            {menuNewClause && (
              <option value={AI_NEW_CLAUSE}>✨ {menuNewClause.title} ({t("AI suggestion")})</option>
            )}
            {menuLibraryClauses.map((c) => (
              <option key={`${LIB_PREFIX}${c.id}`} value={`${LIB_PREFIX}${c.id}`}>
                ✨ {libraryClauseTitle(c)} ({t("AI suggestion")} · {t("SBC library")})
              </option>
            ))}
            {testCases.map((tc: any) => (
              <option key={tc.id} value={tc.id}>
                {aiMatchedIds.has(tc.id) ? `✨ ${tc.title} (${t('AI suggestion')})` : tc.title}
              </option>
            ))}
          </select>
          {isLibraryValue(formData.testCaseId) && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-indigo-700">
              {t("From the verified SBC library. It will be added to this project's clauses when you submit.")}
            </p>
          )}
          {formData.testCaseId === AI_NEW_CLAUSE && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-indigo-700">
              {t("AI-suggested clause, not verified. It will be added to this project's clauses when you submit. Check it against the SBC text.")}
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>{t("SBC required standard")}<Required /></label>
          <textarea
            name="expectedResult"
            required
            value={formData.expectedResult}
            onChange={handleChange}
            rows={2}
            placeholder={t("Filled from the selected clause, or type it")}
            className={`${inputCls} ${formData.expectedResult && formData.expectedResult === autoStandard ? 'bg-blue-50/40' : ''}`}
            disabled={uploading}
          />
          {formData.expectedResult && formData.expectedResult === autoStandard && (
            <p className="mt-1 text-[11px] text-gray-500">{t("From the selected SBC clause. You can edit it.")}</p>
          )}
        </div>
      </Section>

      {/* ─── 4. RISK & ACTION ─── */}
      <Section step={4} title={t("Risk & action")}>
        <div>
          <span className={labelCls}>{t("Risk level")}</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("Risk level")}>
            {(['High', 'Medium', 'Low'] as Priority[]).map((level) => {
              const active = formData.priority === level;
              return (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFormData((prev) => ({ ...prev, priority: level }))}
                  disabled={uploading}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                    active ? RISK_STYLES[level].active : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${RISK_STYLES[level].dot}`} />
                  {t(level)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("Corrective action plan")}</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={2}
            placeholder={t("Optional: what should be done to fix it")}
            className={inputCls}
            disabled={uploading}
          />
        </div>
      </Section>

      {/* ─── SUBMIT ─── */}
      <div className="space-y-3 border-t border-gray-100 pt-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading && <Spinner />}
          {uploading ? t('Saving…') : t('Log non-conformity')}
        </button>
      </div>
    </form>
  );
}
