'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuthContext } from '@/app/context/AuthContext';
import { useQueueContext } from '@/app/context/QueueContext'; // Added context

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
  attachment?: File | null;
}

interface QueueFormProps {
  onAdd: (data: NewCustomer) => Promise<number>;
  projectId: string;
  currentUserRole?: 'owner' | 'member' | 'viewer' | string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

export default function QueueForm({
  onAdd,
  projectId,
  currentUserRole = 'viewer',
}: QueueFormProps) {
  const { user } = useAuthContext();
  const { fetchBugs } = useQueueContext(); // Used to refresh the table after upload

  const currentUserName = user?.name ?? 'Current User';
  const canAddBug = currentUserRole === 'owner' || currentUserRole === 'member';

  const [formData, setFormData] = useState<NewCustomer>({
    name: currentUserName,
    priority: 'Medium',
    url: '',
    expectedResult: '',
    actualResult: '',
    description: '',
    note: '',
    bugId: '',
    attachment: null,
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

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
      attachment: null,
    });
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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!canAddBug) return;

    if (!formData.name.trim()) {
      setError('Reported By is required');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const newBugId = await onAdd({ ...formData, bugId: '' });

      if (formData.attachment && newBugId) {
        const token = getToken();
        const fd = new FormData();
        fd.append('file', formData.attachment);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${newBugId}/upload`,
          {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          },
        );

        if (res.ok) {
          // CRITICAL FIX: Refresh context so the table sees the new attachmentUrl
          await fetchBugs(projectId);
        }
      }

      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add bug';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  if (!canAddBug) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center gap-3 min-h-[200px] text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">!</div>
        <div>
          <p className="text-sm font-semibold text-gray-700">View Only</p>
          <p className="text-xs text-gray-400 mt-1">Only owners and members can add bugs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">Add New Bug</h2>

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
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
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

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50"
        >
          {uploading ? 'Adding Bug...' : 'Add Bug'}
        </button>
      </form>
    </div>
  );
}