'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuthContext } from '@/app/context/AuthContext';

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
  // Role comes from the project, not the user object
  currentUserRole?: 'owner' | 'member' | 'viewer' | string;
}

// ─── SSR-safe token helper ────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QueueForm({
  onAdd,
  projectId,
  currentUserRole = 'viewer',
}: QueueFormProps) {
  const { user } = useAuthContext();

  const currentUserName = user?.name ?? 'Current User';

  //   Only owner and member can add bugs — viewer cannot
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

  // Keep name in sync with authenticated user
  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: currentUserName }));
  }, [currentUserName]);

  // Stable object-URL for attachment preview — revoked on cleanup
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
    if (e.target.name === 'name') return; // name is read-only
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
    if (!canAddBug) return; // extra safety guard

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
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${newBugId}/upload`,
          {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          },
        );
      }

      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add bug';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  // ── Viewer blocked state ──────────────────────────────────────────────────

  if (!canAddBug) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center gap-3 min-h-[200px] text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          {/* <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7a4 4 0 00-8 0v4H3a1 1 0 00-1 1v6a1 1 0 001 1h14a1 1 0 001-1v-6a1 1 0 00-1-1h-1V7a4 4 0 00-4-4z" />
          </svg> */}
          !
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">View Only</p>
          <p className="text-xs text-gray-400 mt-1">
            Only owners and members can add bugs.
          </p>
        </div>
      </div>
    );
  }

  // ── Form (owner / member) ─────────────────────────────────────────────────

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">Add New Bug</h2>

        {/* Reported By — read-only */}
        <div>
          <label className="text-sm font-medium text-gray-700">Reported By</label>
          <input
            name="name"
            value={formData.name}
            readOnly
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 cursor-not-allowed border-gray-300 font-medium"
            placeholder="Loading..."
          />
          <p className="text-xs text-gray-500 mt-1">Auto-filled with current user</p>
        </div>

        {/* Priority */}
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

        {/* URL */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            type="url"
            placeholder="https://example.com/broken-page"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        {/* Expected Result */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Expected Result <span className="text-red-500">*</span>
          </label>
          <textarea
            name="expectedResult"
            required
            value={formData.expectedResult}
            onChange={handleChange}
            rows={2}
            placeholder="What should happen..."
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm resize-vertical focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        {/* Actual Result */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Actual Result <span className="text-red-500">*</span>
          </label>
          <textarea
            name="actualResult"
            required
            value={formData.actualResult}
            onChange={handleChange}
            rows={2}
            placeholder="What actually happened..."
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm resize-vertical focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Detailed steps to reproduce..."
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm resize-vertical focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        {/* Note */}
        <div>
          <label className="text-sm font-medium text-gray-700">Note</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={2}
            placeholder="Additional notes..."
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm resize-vertical focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        {/* Screenshot / Video */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Screenshot / Video (Optional)
          </label>
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
                <video
                  src={previewSrc}
                  controls
                  className="max-h-32 w-full rounded border object-contain"
                />
              ) : (
                <div className="relative w-full h-32">
                  <Image
                    src={previewSrc}
                    alt="Preview"
                    fill
                    className="object-contain rounded border"
                    sizes="(max-width: 640px) 100vw, 400px"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1 truncate">
                {formData.attachment.name}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding Bug...
            </span>
          ) : (
            'Add Bug'
          )}
        </button>
      </form>
    </div>
  );
}