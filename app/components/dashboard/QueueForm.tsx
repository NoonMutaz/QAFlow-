"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAuthContext } from '@/app/context/AuthContext';
import { useQueueContext, DuplicateMatch, Customer } from '@/app/context/QueueContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'High' | 'Medium' | 'Low';

type ClauseMatch = {
  testCaseId: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
};

type NewClause = {
  title: string;
  standard: string;
  reason: string;
};

type SbcSuggestion = {
  matches: ClauseMatch[];
  /** a clause the AI proposes that is not in the project's menu yet */
  newClause?: NewClause | null;
  source: 'openai' | 'keywords' | 'none';
  aiUnavailable?: boolean;
  /** photo analysis only */
  finding?: string;
  details?: string;
};

/** menu value for the AI-proposed clause; it is saved to the project on submit */
const AI_NEW_CLAUSE = 'ai-new';

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

export default function QueueForm({
  onAdd,
  projectId,
  testCases = [], 
  currentUserRole = 'viewer',
  existingBugs = [],  
  onTestCaseCreated,
}: QueueFormProps) {
  const { user } = useAuthContext();
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
  const [chosenNewClause, setChosenNewClause] = useState<NewClause | null>(null);
  const [dismissedSuggestionKey, setDismissedSuggestionKey] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);
  const photoFilledKeyRef = useRef<string | null>(null);

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
    setChosenNewClause(null);
    setDismissedSuggestionKey(null);
    setPhotoNotice(null);
    photoFilledKeyRef.current = null;
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
      ? 'AI is unavailable right now (check the AI API key), so these are keyword matches.'
      : suggestion.matches.length === 0 && !suggestion.newClause
        ? 'AI could not find an SBC clause for this finding. Pick one manually.'
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
            `AI suggestion request failed: ${err instanceof Error ? err.message : 'unknown error'}`,
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

  /** Saves an AI-proposed clause to the project (same endpoint as the test cases page) and returns its id. */
  const createClause = async (API: string, clause: NewClause): Promise<number> => {
    const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2] ?? localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const url = `${API}/api/projects/${projectId}/testcases`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: clause.title, steps: [], expectedResult: clause.standard }),
    });
    if (!res.ok) throw new Error(`Could not save the AI SBC clause (${res.status})`);

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
    if (typeof id !== 'number') throw new Error('Saved the AI SBC clause but could not link it');

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

      if (payload.testCaseId === AI_NEW_CLAUSE) {
        if (!chosenNewClause) throw new Error('AI clause missing, pick the SBC clause again');
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

  const handleSelectClause = (testCaseId: number): void => {
    setFormData((prev) => ({ ...prev, testCaseId: String(testCaseId) }));
  };

  const handleSelectNewClause = (clause: NewClause): void => {
    setChosenNewClause(clause);
    setFormData((prev) => ({
      ...prev,
      testCaseId: AI_NEW_CLAUSE,
      expectedResult: prev.expectedResult.trim() ? prev.expectedResult : clause.standard,
    }));
  };

  // the AI clause shown in the menu: the one already picked wins over a newer proposal
  const menuNewClause =
    formData.testCaseId === AI_NEW_CLAUSE ? chosenNewClause : aiSuggestion?.newClause ?? null;
  const aiMatchedIds = new Set(aiSuggestion?.matches.map((m) => m.testCaseId) ?? []);

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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData((prev) => ({
      ...prev,
      attachment: e.target.files?.[0] ?? null,
    }));
    setPhotoNotice(null);
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
          ? 'AI could not analyze the photo right now. Describe the finding yourself.'
          : result.finding && formData.actualResult.trim()
            ? `AI sees: "${result.finding}" (your text was kept). The suggested SBC clause is above.`
            : result.finding
              ? 'AI filled in the Site Finding and Detailed finding from the photo. Check them, then pick the SBC clause above.'
              : 'AI did not find a violation in this photo.',
      );
    } catch (err) {
      setPhotoNotice(`Photo analysis failed: ${err instanceof Error ? err.message : 'unknown error'}`);
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
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center gap-3 min-h-[200px] text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">!</div>
        <div>
          <p className="text-sm font-semibold text-gray-700">View Only Mode</p>
          <p className="text-xs text-gray-400 mt-1">Only owners and members have permission to report a new bug.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">Log SBC Non-Conformity</h2>

        {/* ─── SIMILARITY ALERT BOX ─── */}
        {duplicate && (
          <div className="p-3.5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl animate-in fade-in slide-in-from-top-1 duration-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider">
                Similarity Alert 
              </span>
              <span className="text-[10px] bg-amber-200/70 px-2 py-0.5 rounded-md text-amber-900 font-bold border border-amber-300/40">
                Matched: {duplicate.matchedKey}
              </span>
            </div>
            <p className="text-sm font-bold text-blue-600 mt-1.5 hover:underline cursor-pointer">
               {duplicate.item.bugId}
            </p>
          </div>
        )}

      

        <div>
          <label className="text-sm font-medium text-gray-700">Reported By</label>
          <input
            name="name"
            value={formData.name}
            readOnly
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 cursor-not-allowed border-gray-300 font-medium"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Risk Level</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Site Location <span className="text-red-500">*</span></label>
          <input
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            // type="url"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">SBC Required Standard <span className="text-red-500">*</span></label>
          <textarea
            name="expectedResult"
            required
            value={formData.expectedResult}
            onChange={handleChange}
            rows={2}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Site Finding <span className="text-red-500">*</span></label>
          <textarea
            name="actualResult"
            required
            value={formData.actualResult}
            onChange={handleChange}
            rows={2}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Detailed finding <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>
  {/* ─── LINK TO TEST CASE DROPDOWN ─── */}
        <div>
          <label className="text-sm font-medium text-gray-700">SBC Clause</label>
          <select
            name="testCaseId"
            value={formData.testCaseId}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
            disabled={uploading}
          >
            <option value="">-- No SBC Clause Linked --</option>
            {menuNewClause && (
              <option value={AI_NEW_CLAUSE}>✨ {menuNewClause.title} (AI suggestion)</option>
            )}
            {testCases.map((tc: any) => (
              <option key={tc.id} value={tc.id}>
                {aiMatchedIds.has(tc.id) ? `✨ ${tc.title} (AI suggestion)` : tc.title}
              </option>
            ))}
          </select>
          {formData.testCaseId === AI_NEW_CLAUSE && (
            <p className="text-[11px] text-indigo-700 mt-1">
              AI-suggested clause, not in this project yet. It will be added to the project&apos;s SBC clauses when you submit. Verify it against the SBC text.
            </p>
          )}
        </div>
        {checkingAi && (
          <p className="text-xs text-indigo-600 font-medium animate-pulse">
            AI is finding the SBC clause for this issue…
          </p>
        )}

        {!checkingAi && aiNotice && (
          <p className="text-xs text-amber-700 font-medium">{aiNotice}</p>
        )}

        {!checkingAi && aiSuggestion && (aiSuggestion.matches.length > 0 || aiSuggestion.newClause) && (
          <div className="p-4 bg-indigo-50/90 border border-indigo-200 rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">
                Suggested SBC clause
              </span>
              <button
                type="button"
                onClick={handleDismissSuggestion}
                className="text-[11px] text-indigo-700 hover:underline"
              >
                Hide
              </button>
            </div>
            {aiSuggestion.matches.map((m) => {
              const clause = testCases.find((tc: { id: number }) => tc.id === m.testCaseId);
              const selected = formData.testCaseId === String(m.testCaseId);
              return (
                <div
                  key={m.testCaseId}
                  className="flex items-start justify-between gap-3 bg-white/80 border border-indigo-100 rounded-lg p-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {clause?.title ?? `#${m.testCaseId}`}
                    </p>
                    {m.reason && <p className="text-xs text-gray-600 mt-0.5">{m.reason}</p>}
                    <span className="text-[10px] text-indigo-800 font-bold capitalize">
                      {m.confidence} confidence
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectClause(m.testCaseId)}
                    disabled={uploading || selected}
                    className="shrink-0 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:bg-green-600 disabled:opacity-100"
                  >
                    {selected ? 'Selected ✓' : 'Select'}
                  </button>
                </div>
              );
            })}
            {aiSuggestion.newClause && (
              <div className="flex items-start justify-between gap-3 bg-white/80 border border-dashed border-indigo-300 rounded-lg p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {aiSuggestion.newClause.title}{' '}
                    <span className="text-[10px] font-bold text-indigo-700">(AI suggestion, not in this project)</span>
                  </p>
                  <p className="text-xs text-gray-700 mt-0.5">{aiSuggestion.newClause.standard}</p>
                  {aiSuggestion.newClause.reason && (
                    <p className="text-xs text-gray-500 mt-0.5">{aiSuggestion.newClause.reason}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => aiSuggestion.newClause && handleSelectNewClause(aiSuggestion.newClause)}
                  disabled={uploading || formData.testCaseId === AI_NEW_CLAUSE}
                  className="shrink-0 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:bg-green-600 disabled:opacity-100"
                >
                  {formData.testCaseId === AI_NEW_CLAUSE ? 'Selected ✓' : 'Select'}
                </button>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Corrective Action Plan</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={2}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Screenshot / Video (Optional)</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-full text-sm"
          />

          {formData.attachment && previewSrc && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              {formData.attachment.type.startsWith('video/') ? (
                <video src={previewSrc} controls className="max-h-32 w-full rounded border object-contain" />
              ) : (
                <div className="relative w-full h-32">
                  <Image src={previewSrc} alt="Preview" fill className="object-contain rounded border" sizes="400px" />
                </div>
              )}
            </div>
          )}

          {formData.attachment?.type.startsWith('image/') && (
            <button
              type="button"
              onClick={() => void handleAnalyzePhoto()}
              disabled={uploading || analyzingPhoto}
              className="mt-2 w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              {analyzingPhoto ? 'AI is analyzing the photo…' : '✨ Analyze photo with AI'}
            </button>
          )}
          {photoNotice && <p className="text-xs text-indigo-700 font-medium mt-2">{photoNotice}</p>}
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">{error}</div>}
   
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Adding ...' : 'Add Non-Conformity'}
        </button>
      </form>
      
      {duplicate && (
        <div className="p-3.5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl mt-3 text-xs text-amber-950">
          ⚠️ Are you sure you want to submit? A similar <span className="font-bold">{duplicate.matchedKey}</span> has already been reported: 
          <p className="text-sm font-bold text-blue-600 mt-1.5 hover:underline cursor-pointer">
            {duplicate.item.bugId}
          </p>
        </div>
      )}
    </div>
  );
}