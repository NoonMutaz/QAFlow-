'use client';

import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/app/context/AuthContext";

type Priority = "High" | "Medium" | "Low";

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
}

export default function QueueForm({ onAdd, projectId }: QueueFormProps) {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState<NewCustomer>({
    name: "",
    priority: "Medium",
    url: "",
    expectedResult: "",
    actualResult: "",
    description: "",
    note: "",
    bugId: "",
    attachment: null,
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  //   Store current user name
  const currentUserName = user?.name || "Current User";

  //  Update formData when user changes
  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      name: currentUserName 
    }));
  }, [currentUserName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (e.target.name === "name") return; // Prevent changing name
    
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      attachment: e.target.files ? e.target.files[0] : null,
    });
  };

  //   Reset function that preserves user name
  const resetForm = useCallback(() => {
    setFormData({
      name: currentUserName,  //   Always use current user
      priority: "Medium",
      url: "",
      expectedResult: "",
      actualResult: "",
      description: "",
      note: "",
      bugId: "",
      attachment: null,
    });
    setError("");
  }, [currentUserName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Reported By is required");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const newBugId = await onAdd({ ...formData, bugId: "" });

      if (formData.attachment && newBugId) {
        const token = localStorage.getItem("token");
        const fd = new FormData();
        fd.append("file", formData.attachment);

        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${newBugId}/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          }
        );
      }

      resetForm(); //   Use reset function
    } catch (err: any) {
      setError(err.message || "Failed to add bug");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">Add New Bug</h2>

        {/* Reported By - READ ONLY */}
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

        {/* Rest of form unchanged... */}
        <div>
          <label className="text-sm font-medium text-gray-700">URL <span className="text-red-500">*</span></label>
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

        <div>
          <label className="text-sm font-medium text-gray-700">Expected Result <span className="text-red-500">*</span></label>
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

        <div>
          <label className="text-sm font-medium text-gray-700">Actual Result <span className="text-red-500">*</span></label>
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

        <div>
          <label className="text-sm font-medium text-gray-700">Screenshot / Video (Optional)</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-full text-sm"
          />
          {formData.attachment && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              {formData.attachment.type.startsWith("video/") ? (
                <video src={URL.createObjectURL(formData.attachment)} controls className="max-h-32 w-full rounded border object-contain" />
              ) : (
                <img src={URL.createObjectURL(formData.attachment)} alt="Preview" className="max-h-32 w-full object-contain rounded border" />
              )}
              <p className="text-xs text-gray-500 mt-1 truncate">{formData.attachment.name}</p>
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
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Adding Bug...
            </span>
          ) : (
            "Add Bug"
          )}
        </button>
      </form>
    </div>
  );
}