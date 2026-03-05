"use client";

import { useState } from "react";
 

interface InviteModalProps {
   customer: {
    id: number;
    name: string;
    bugId: string;
  };
 
  onClose: () => void;
  isOpen: boolean;
 
  onSend: (email: string, projectType: string) => void;
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

  if (!isOpen) return null;

  const handleSend = () => {
    if (!email) {
      alert("Please enter an email!");
      return;
    }
    onSend(email, projectType);
    setEmail("");
    setProjectType(projectTypes[0] || "");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50">
      <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Send Project Invitation</h2>
   <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700">Project ID:</span>
              <span className="font-mono text-sm text-gray-900 bg-gray-200 px-2 py-0.5 rounded">
                {customer.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Project name :</span>
              <span className="text-sm text-gray-900 font-medium">
                {customer.name}
              </span>
            </div>
          </div>
        

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="example@domain.com"
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Project Type
        </label>
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {projectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}