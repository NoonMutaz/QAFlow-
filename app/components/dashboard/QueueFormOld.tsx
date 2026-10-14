"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAuthContext } from '@/app/context/AuthContext';
import { useQueueContext, DuplicateMatch, Customer } from '@/app/context/QueueContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'High' | 'Medium' | 'Low';

type SbcSuggestion = {
  testCaseId: number | null;
  sbcCode: string;
  sbcSection: string;
  title: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  suggestedStandard: string;
  source: 'openai' | 'fuse' | 'none';
};

function formatStandardWithCode(suggestion: SbcSuggestion): string {
  const cite = [suggestion.sbcCode, suggestion.sbcSection].filter(Boolean).join(' — ');
  const body = suggestion.suggestedStandard.trim();
  if (!cite) return body;
  if (body.toLowerCase().includes(suggestion.sbcCode.toLowerCase())) return body;
  return `${cite}: ${body}`;
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
}

export default function QueueForm({
  onAdd,
  projectId,
  testCases = [], 
  currentUserRole = 'viewer',
  existingBugs = [],  
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
  const [dismissedSuggestionKey, setDismissedSuggestionKey] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);

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
    setDismissedSuggestionKey(null);
    setError('');
  }, [currentUserName]);

  const buildSuggestionContextKey = useCallback((): string => {
    return [
      formData.url.trim(),
      formData.actualResult.trim(),
      formData.description.trim(),
      formData.expectedResult.trim(),
    ].join('|');
  }, [formData.url, formData.actualResult, formData.description, formData.expectedResult]);

  const isSuggestionRelevant = useCallback(
    (suggestion: SbcSuggestion): boolean => {
      if (suggestion.source === 'none' || suggestion.confidence === 'low') return false;
      if (!suggestion.title.trim() && !suggestion.suggestedStandard.trim()) return false;

      const sameClause =
        suggestion.testCaseId != null &&
        String(suggestion.testCaseId) === formData.testCaseId;
      const sameStandard =
        suggestion.suggestedStandard.trim().toLowerCase() ===
        formData.expectedResult.trim().toLowerCase();

      if (sameClause && sameStandard) return false;
      if (!suggestion.testCaseId && sameStandard) return false;

      return true;
    },
    [formData.testCaseId, formData.expectedResult],
  );

  const fetchSbcSuggestion = useCallback(
    async (signal?: AbortSignal): Promise<SbcSuggestion | null> => {
      const res = await fetch('/api/sbc-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          description: formData.description,
          actualResult: formData.actualResult,
          expectedResult: formData.expectedResult,
          siteLocation: formData.url,
          currentTestCaseId: formData.testCaseId || null,
          clauses: testCases.map(
            (tc: { id: number; title: string; expectedResult?: string }) => ({
              id: tc.id,
              title: tc.title,
              expectedResult: tc.expectedResult,
            }),
          ),
        }),
      });

      if (!res.ok) return null;
      return (await res.json()) as SbcSuggestion;
    },
    [
      formData.description,
      formData.actualResult,
      formData.expectedResult,
      formData.url,
      formData.testCaseId,
      testCases,
    ],
  );

  // AI analyzes form fields while user types — before submit
  useEffect(() => {
    const contextKey = buildSuggestionContextKey();
    const findingLen =
      formData.actualResult.trim().length + formData.description.trim().length;

    if (findingLen < 20) {
      setAiSuggestion(null);
      return;
    }

    if (dismissedSuggestionKey === contextKey) {
      return;
    }

    const timer = window.setTimeout(() => {
      suggestAbortRef.current?.abort();
      const controller = new AbortController();
      suggestAbortRef.current = controller;

      void (async () => {
        setCheckingAi(true);
        try {
          const suggestion = await fetchSbcSuggestion(controller.signal);
          if (controller.signal.aborted) return;
          if (suggestion && isSuggestionRelevant(suggestion)) {
            setAiSuggestion(suggestion);
          } else {
            setAiSuggestion(null);
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setAiSuggestion(null);
        } finally {
          if (!controller.signal.aborted) setCheckingAi(false);
        }
      })();
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    buildSuggestionContextKey,
    dismissedSuggestionKey,
    fetchSbcSuggestion,
    formData.actualResult,
    formData.description,
    isSuggestionRelevant,
  ]);

  const performSubmit = async (
    overrides?: Partial<typeof formData>,
  ): Promise<void> => {
    setUploading(true);
    setError('');

    const payload = { ...formData, ...overrides };

    try {
      const API = process.env.NEXT_PUBLIC_API_URL;
      if (!API) throw new Error('API URL missing');

      const parsedTestCaseId =
        payload.testCaseId === '' ? null : parseInt(payload.testCaseId, 10);

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
        const token = localStorage.getItem('token');
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

  const handleAcceptSuggestion = (): void => {
    if (!aiSuggestion) return;
    setFormData((prev) => ({
      ...prev,
      ...(aiSuggestion.testCaseId != null
        ? { testCaseId: String(aiSuggestion.testCaseId) }
        : {}),
      ...(aiSuggestion.suggestedStandard.trim()
        ? { expectedResult: aiSuggestion.suggestedStandard }
        : {}),
    }));
    setDismissedSuggestionKey(buildSuggestionContextKey());
    setAiSuggestion(null);
  };

  const handleDismissSuggestion = (): void => {
    setDismissedSuggestionKey(buildSuggestionContextKey());
    setAiSuggestion(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void => {
    if (e.target.name === 'name') return;
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData((prev) => ({
      ...prev,
      attachment: e.target.files?.[0] ?? null,
    }));
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
            {testCases.map((tc: any) => (
              <option key={tc.id} value={tc.id}>
                {tc.title}
              </option>
            ))}
          </select>
        </div>

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

        {(checkingAi || aiSuggestion) && (
          <div className="space-y-2">
            {checkingAi && !aiSuggestion && (
              <p className="text-xs text-indigo-600 font-medium animate-pulse">
                AI is reviewing your finding against SBC…
              </p>
            )}
            {aiSuggestion && aiSuggestion.source !== 'none' && (
              <div className="p-4 bg-indigo-50/90 border border-indigo-200 rounded-xl space-y-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">
                    AI SBC suggestion
                  </span>
                  <span className="text-[10px] bg-indigo-200/80 px-2 py-0.5 rounded-md text-indigo-900 font-bold capitalize">
                    {aiSuggestion.confidence} confidence
                  </span>
                  <span className="text-[10px] text-indigo-700/80 font-medium">
                    {aiSuggestion.source === 'openai' ? 'From SBC knowledge' : 'Matched project clause'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{aiSuggestion.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{aiSuggestion.reason}</p>
                {aiSuggestion.suggestedStandard && (
                  <div className="text-xs bg-white/80 border border-indigo-100 rounded-lg p-2.5 text-gray-700">
                    <span className="font-bold text-gray-500 block mb-1">Suggested required standard</span>
                    {aiSuggestion.suggestedStandard}
                  </div>
                )}
                {aiSuggestion.testCaseId != null && (
                  <p className="text-[11px] text-indigo-800">
                    Can link to project clause:{' '}
                    {testCases.find((tc: { id: number }) => tc.id === aiSuggestion.testCaseId)?.title ??
                      `#${aiSuggestion.testCaseId}`}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAcceptSuggestion}
                    disabled={uploading}
                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Use this suggestion
                  </button>
                  <button
                    type="button"
                    onClick={handleDismissSuggestion}
                    disabled={uploading}
                    className="flex-1 bg-white border border-gray-300 text-gray-800 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Keep my entry
                  </button>
                </div>
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