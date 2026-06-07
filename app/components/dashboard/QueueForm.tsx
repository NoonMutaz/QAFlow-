"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuthContext } from '@/app/context/AuthContext';
import { useQueueContext, DuplicateMatch, Customer } from '@/app/context/QueueContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'High' | 'Medium' | 'Low';

interface NewCustomer {
  name: string;
  priority: Priority;
  url: string;
  expectedResult: string;
  actualResult: string;
  description: string;
  note: string;
  bugId: string;
  testCaseId: string | number | null; // Updated to support dynamic backend parsing safely
  attachment?: File | null;
}

interface QueueFormProps {
  onAdd: (data: any) => Promise<number>;
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
    testCaseId: '', // Keep as string internally for the HTML <select> element
    attachment: null,
  });

  const [duplicate, setDuplicate] = useState<DuplicateMatch | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

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
    setError('');
  }, [currentUserName]);

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

// Find this section inside QueueForm.tsx and update the handleSubmit:
const handleSubmit = async (e: React.FormEvent): Promise<void> => {
  e.preventDefault();
  setUploading(true);
  setError("");

  try {
    const API = process.env.NEXT_PUBLIC_API_URL;
    if (!API) throw new Error("API URL missing");

    const parsedTestCaseId = formData.testCaseId === '' ? null : parseInt(formData.testCaseId, 10);

    // Ensure properties match exactly what your C# models expect
    const submissionPayload = {
      name: formData.name,
      priority: formData.priority,
      url: formData.url,
      expectedResult: formData.expectedResult,
      actualResult: formData.actualResult,
      description: formData.description,
      note: formData.note,
      testCaseId: parsedTestCaseId
    };

    // Returns the fully built bug object from the backend
    const createdBug = await onAdd(submissionPayload);
    const newBugId = createdBug?.id || createdBug;

    if (!newBugId) {
      throw new Error("Failed to create bug");
    }

    if (formData.attachment) {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append('file', formData.attachment);

      const res = await fetch(
        `${API}/api/projects/${projectId}/bugs/${newBugId}/upload`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        }
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
        <h2 className="text-lg font-semibold text-gray-800">Add New Bug</h2>

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
          <label className="text-sm font-medium text-gray-700">Link to Test Case</label>
          <select
            name="testCaseId"
            value={formData.testCaseId}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
            disabled={uploading}
          >
            <option value="">-- No Test Case Linked --</option>
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
          <label className="text-sm font-medium text-gray-700">Priority</label>
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
          <label className="text-sm font-medium text-gray-700">URL <span className="text-red-500">*</span></label>
          <input
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            type="url"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Expected Result <span className="text-red-500">*</span></label>
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
          <label className="text-sm font-medium text-gray-700">Actual Result <span className="text-red-500">*</span></label>
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
          <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
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

        <div>
          <label className="text-sm font-medium text-gray-700">Note</label>
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
          {uploading ? 'Adding Bug...' : 'Add Bug'}
        </button>
      </form>
      
      {duplicate && (
        <div className="p-3.5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl mt-3 animate-in fade-in slide-in-from-top-1 duration-200 shadow-xs">
          ⚠️ Are you sure you want to submit. A similar <span className="font-bold">{duplicate.matchedKey}</span> has already been reported: 
          <p className="text-sm font-bold text-blue-600 mt-1.5 hover:underline cursor-pointer">
            {duplicate.item.bugId}
          </p>
        </div>
      )}
    </div>
  );
}