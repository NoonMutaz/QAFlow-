"use client";

import { useState, FormEvent } from "react"; // ✅ Add FormEvent

interface InviteModalProps {
  customer: {
    id: string;
    name: string;
  };
  onClose: () => void;
  isOpen: boolean;
  onSend: (email: string) => Promise<void>;
  projectTypes: string[];
}

export default function InviteModal({
  isOpen,
  onClose,
  onSend,
  projectTypes,
  customer
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState(projectTypes[0] || "");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;
const handleSend = async (e?: FormEvent) => {
  if (e) e.preventDefault();
  
  if (!email.trim()) {
    alert("⚠️ Please enter an email!");
    return;
  }

  setIsSending(true);
  try {
    await onSend(email.trim()); 
    setEmail("");
    setProjectType(projectTypes[0] || "");
    onClose();
  } catch (error) {
    console.error("Invite failed:", error);
     
  } finally {
    setIsSending(false);
  }
};

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-96 p-8 shadow-2xl border max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            Invite to <span className="text-blue-600">{customer.name}</span>
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl p-2 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
            disabled={isSending}
          >
            ×
          </button>
        </div>

        {/* Project Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {customer.name[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="font-semibold text-lg text-gray-900 truncate max-w-[200px]">
                {customer.name}
              </div>
              <div className="text-sm text-gray-500 font-mono bg-white px-3 py-1 rounded-lg border">
                ID: {customer.id}
              </div>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Team Member Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@company.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={isSending}
          />
        </div>

        {/* Project Type */}
        <div className="mb-8">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Project Type
          </label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            disabled={isSending}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!email.trim() || isSending}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invite"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}