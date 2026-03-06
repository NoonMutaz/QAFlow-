'use client';

import { useState } from "react";
import React from "react";

type Priority = "High" | "Medium" | "Low";

interface NewCustomer {
  name: string;
  priority: Priority;
  url: string;
  expectedResult: string;
  actualResult: string;
  description: string;
  note: string;
  bugId:string;
  attachment?: File | null;
}

interface QueueFormProps {
  onAdd: (data: NewCustomer) => void;
}

export default function QueueForm({ onAdd }: QueueFormProps) {
  const [formData, setFormData] = useState<NewCustomer>({
    name: "",
    priority: "Medium",
    url: "",
    expectedResult: "",
    actualResult: "",
    description: "",
    note: "",
     bugId:"",
    attachment: null,
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      attachment: e.target.files ? e.target.files[0] : null,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Reported By is required");
      return;
    }

 const bugId = `BUG-${Date.now()}`;

  onAdd({
    ...formData,
    bugId,
    
  });


    // reset form
   
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-5">

        <h2 className="text-lg font-semibold text-gray-800">
          Add New Bug
        </h2>

        {/* Reported By */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Reported By
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            placeholder="Enter reporter name"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* URL */}
        <div>
          <label className="text-sm font-medium text-gray-700">URL</label>
          <input
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            type="url"
            placeholder="Enter page URL"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* Expected Result */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Expected Result
          </label>
          <textarea
            name="expectedResult"
            value={formData.expectedResult}
            onChange={handleChange}
            rows={2}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* Actual Result */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Actual Result
          </label>
          <textarea
            name="actualResult"
            value={formData.actualResult}
            onChange={handleChange}
            rows={2}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* Note */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Note
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={2}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* Attachment */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Image / Video
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="mt-1 text-sm"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
   
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
        >
          Add Bug
        </button>
      </form>
    </div>
  );
}