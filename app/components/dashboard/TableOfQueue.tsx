"use client";
import React, { useState, useMemo, useEffect } from "react";
import FilterByStatus from "./FilterByStatus";
import RemoveModal from "./RemoveModal";
import FilterByPriority from "./FilterByPriority";
import Link from "next/link";
import { useQueueContext } from "../../context/QueueContext";

type Status = "notFixed" | "in-progress" | "fixed";
type Priority = "High" | "Medium" | "Low";

interface Customer {
  id: number;
  bugId: string;
  name: string;
  priority: Priority;
  status: Status;
  createdAt: number;
  url: string;
  expectedResult: string;
  actualResult: string;
  description: string;
  note: string;
  attachmentUrl?: string; // ← added
}

interface TableProps {
  filteredQueue: Customer[];
  projectId: string;
  updateQueue: (projectId: string, id: number, status: Status) => void;
  removeQueue: (projectId: string, id: number) => void;
  select: Status | "";
  setSelect: React.Dispatch<React.SetStateAction<Status | "">>;
  selectP: Priority | "";
  setSelectP: React.Dispatch<React.SetStateAction<Priority | "">>;
  updatePriorityQueue: (projectId: string, id: number, newPriority: Priority) => void;
}

export default function TableOfQueue({
  filteredQueue,
  select,
  setSelect,
  selectP,
  setSelectP,
  projectId,
}: TableProps) {
  const [openModalId, setOpenModalId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // ← fullscreen preview
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { removeQueue, updateQueue, updatePriorityQueue, fetchBugs } = useQueueContext();

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredQueue]);

  const paginatedQueue = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQueue.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQueue, currentPage]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High": return "bg-red-600 text-white border-red-600";
      case "Medium": return "bg-yellow-200 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-600 text-white border-green-600";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "notFixed": return "bg-blue-100 text-blue-700";
      case "in-progress": return "bg-purple-100 text-purple-700";
      case "fixed": return "bg-emerald-100 text-emerald-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handlePriorityToggle = (id: number, currentPriority: Priority) => {
    const priorityOrder: Priority[] = ["High", "Medium", "Low"];
    const nextPriority = priorityOrder[(priorityOrder.indexOf(currentPriority) + 1) % priorityOrder.length];
    updatePriorityQueue(projectId, id, nextPriority);
  };

  const handleUpload = async (file: File, bugId: number) => {
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/bugs/${bugId}/upload`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }
    );

    if (res.ok) {
      fetchBugs(projectId); // refresh bugs to show new image
    } else {
      const text = await res.text();
      alert("Upload failed: " + text);
    }
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-xl shadow-md bg-white border border-gray-200">
        <div className="px-4 flex gap-4 flex-wrap items-center m-4">
          <FilterByStatus select={select} setSelect={setSelect} />
          <FilterByPriority setSelectP={setSelectP} selectP={selectP} />
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              {["Bug ID", "Reported By", "Priority", "URL", "Expected Result",
                "Actual Result", "Description", "Status", "Created At", "Note", "img/vid", "Remove"]
                .map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {header}
                  </th>
                ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {filteredQueue.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">No bugs found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedQueue.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">

                  {/* Bug ID */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-semibold text-gray-900">{customer.bugId}</span>
                  </td>

                  {/* Reported By */}
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>

                  {/* Priority */}
                  <td className="px-4 py-3 text-sm font-medium relative group">
                    <button
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(customer.priority)} transition-all hover:scale-110`}
                      onClick={() => handlePriorityToggle(customer.id, customer.priority)}
                    >
                      {customer.priority}
                    </button>
                    <span className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Click to change
                    </span>
                  </td>

                  {/* URL */}
                  <td className="px-4 py-3">
                    <Link href={customer.url} target="_blank" className="block">
                      <input
                        value={customer.url}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                      />
                    </Link>
                  </td>

                  {/* Expected Result */}
                  <td className="px-4 py-3">
                    <textarea value={customer.expectedResult} readOnly rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
                  </td>

                  {/* Actual Result */}
                  <td className="px-4 py-3">
                    <textarea value={customer.actualResult} readOnly rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3">
                    <textarea value={customer.description} readOnly rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-2">
                    <select
                      value={customer.status}
                      onChange={(e) => updateQueue(projectId, customer.id, e.target.value as Status)}
                      className={`w-full py-2 px-2 border border-gray-300 rounded-md text-sm ${getStatusColor(customer.status)}`}
                    >
                      <option value="notFixed">Not Fixed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </td>

                  {/* Created At */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {new Date(customer.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>

                  {/* Note */}
                  <td className="px-4 py-3">
                    <textarea value={customer.note} readOnly rows={2}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-sm resize-none" />
                  </td>

                  {/* Attachment */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-2">

                      {/* Show thumbnail — click to fullscreen */}
                      {customer.attachmentUrl && (
                        customer.attachmentUrl.match(/\.(mp4|webm)$/i) ? (
                          <video
                            src={`${process.env.NEXT_PUBLIC_API_URL}${customer.attachmentUrl}`}
                            controls
                            className="max-w-[120px] rounded border"
                          />
                        ) : (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${customer.attachmentUrl}`}
                            alt="attachment"
                            className="max-w-[120px] max-h-[80px] object-cover rounded border hover:opacity-80 transition cursor-zoom-in"
                            onClick={() => setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}${customer.attachmentUrl}`)}
                          />
                        )
                      )}

                      {/* Upload / Replace button */}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(file, customer.id);
                          }}
                        />
                        <div className="flex items-center gap-1 px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-600">
                            {customer.attachmentUrl ? "Replace" : "Attach"}
                          </span>
                        </div>
                      </label>

                    </div>
                  </td>

                  {/* Remove */}
                  <td className="px-4 py-3">
                    <button
                      className="w-full p-2 flex justify-center items-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-md transition-all"
                      onClick={() => setOpenModalId(customer.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    {openModalId === customer.id && (
                      <RemoveModal
                        removeQueue={(id) => removeQueue(projectId, id)}
                        customer={customer}
                        onClose={() => setOpenModalId(null)}
                      />
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
          Prev
        </button>
        <span>Page {currentPage} of {Math.ceil(filteredQueue.length / itemsPerPage)}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(filteredQueue.length / itemsPerPage)))}
          disabled={currentPage === Math.ceil(filteredQueue.length / itemsPerPage)}
          className="px-3 py-1 bg-blue-200 rounded disabled:opacity-50">
          Next
        </button>
      </div>

      {/* Fullscreen image preview — outside table, fixed overlay */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)} // click outside to close
        >
          <div
            className="relative max-w-5xl max-h-full"
            onClick={(e) => e.stopPropagation()} // prevent close when clicking image
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white text-sm font-medium hover:text-gray-300 flex items-center gap-1"
            >
              ✕ Close
            </button>
            <img
              src={previewUrl}
              alt="Full preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}