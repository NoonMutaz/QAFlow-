'use client';

import React, { useState,useMemo } from "react";
import FilterByStatus from "./FilterByStatus";
import RemoveModal from "./RemoveModal";
import FilterByPriority from "./FilterByPriority"; 
import Link from "next/link";

type Status = "notFixed" | "in-progress" | "fixed";
type Priority = "High" | "Medium" | "Low";

interface Customer {
  id: number;
  bugId: string; 
  name: string;
  priority: Priority;
  status: Status;
  createdAt: number;
  url:string;
  expectedResult:string;
  actualResult:string;
  description:string;
  note:string
}

interface TableProps {
  filteredQueue: Customer[];
  updateQueue: (id: number, status: Status) => void;
  removeQueue: (id: number) => void;
  select: Status | "";
  setSelect: React.Dispatch<React.SetStateAction<Status | "">>;
  selectP: Priority | "";
  setSelectP: React.Dispatch<React.SetStateAction<Priority | "">>;
  updatePriorityQueue: (id: number, newPriority: Priority) => void;
}
interface Column {
  key: string;
  label: string;
}
export default function TableOfQueue({
  filteredQueue,
  updateQueue,
  removeQueue,
  select,
  setSelect,
  selectP,
  setSelectP,
  updatePriorityQueue,
}: TableProps) {
  const [openModalId, setOpenModalId] = useState<number | null>(null);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High":
        return "bg-red-700 text-red-700 border-red-700";
      case "Medium":
        return "bg-yellow-200 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-700 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "notFixed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "in-progress":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "fixed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handlePriorityToggle = (id: number, currentPriority: Priority) => {
    const priorityOrder: Priority[] = ["High", "Medium", "Low"];
    const currentIndex = priorityOrder.indexOf(currentPriority);
    const nextPriority = priorityOrder[(currentIndex + 1) % priorityOrder.length];
    updatePriorityQueue(id, nextPriority);
  };
const columns: Column[] = [
  { key: "bugId", label: "Bug ID" },
  { key: "name", label: "Reported By" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created At" },
];

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10; // 10 bugs per page
const paginatedQueue = useMemo(() => {
  // sort newest first without reverse()
  const sortedQueue = [...filteredQueue].sort((a, b) => b.createdAt - a.createdAt);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return sortedQueue.slice(startIndex, endIndex);
}, [filteredQueue, currentPage]);




  return (    <div>
    <div className="overflow-x-auto rounded-xl  shadow-md bg-white border border-gray-200">
      <div className="px-4 flex gap-4 flex-wrap items-center m-4">
        <FilterByStatus select={select} setSelect={setSelect} />
        <FilterByPriority setSelectP={setSelectP} selectP={selectP} />
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <tr>
            {[
              "Bug ID",
              "Reported By",
              "Priority",
              "URL",
              "Expected Result",
              "Actual Result",
              "Description",
              "Status",
              "Created At",
              "Note",
              "img/vid",
              "Remove",
            ].map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {filteredQueue.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-6 py-8 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-12 h-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm">No test cases or users found</p>
                </div>
              </td>
            </tr>
          ) : (
            paginatedQueue.map((customer, idx) => (
              <tr
                key={customer.id}
               
                  
               
              >
                {/* Bug ID */}
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {customer.bugId}
                  </span>
                </td>

                {/* Reported By */}
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {customer.name}
                </td>

                {/* Priority */}
                <td className="px-4 py-3 text-sm font-medium relative group">
                  <button
                    onClick={() => handlePriorityToggle(customer.id, customer.priority)}
                    className={`px-3 py-1 rounded-full text-white text-xs font-semibold border ${getPriorityColor(
                      customer.priority
                    )} transition-all hover:scale-125`}
                  >
                    {customer.priority}
                  </button>
                  <span className="absolute bottom-16   left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Click to change priority
                  </span>
                </td>

                {/* URL */}
                <td >
           <Link
  href={customer.url}
  target="_blank"
  className="block"
>
  <input value= {customer.url} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
   
  </input>
</Link>
                </td>

                {/* Expected Result */}
                <td className="px-4 py-3">
                  <textarea
                    value= {customer.expectedResult}
                    readOnly
                    placeholder="Expected Result"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm transition-all"
                  />
                </td>

                {/* Actual Result */}
                <td className="px-4 py-3">
                  <textarea
                      value= {customer.actualResult}
                      readOnly
                    placeholder="Actual Result"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm transition-all"
                  />
                </td>

                {/* Description */}
                <td className="px-4 py-3">
                  <textarea
                       value= {customer.description}
                       readOnly
                    placeholder="Description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm transition-all"
                  />
                </td>

                {/* Status */}
                <td className=" py-3">
                  <select
                    value={customer.status}
                    onChange={(e) =>
                      updateQueue(customer.id, e.target.value as Status)
                    }
                    className={`w-full   py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm bg-white transition-all ${getStatusColor(
                      customer.status
                    )}`}
                  >
                    {/* <option value="" disabled hidden>
                      Change status
                    </option> */}
                    <option value="notFixed"> not fixed</option>
                    <option value="in-progress">In-progress</option>
                    <option value="fixed">fixed</option>
                  </select>
                </td>

                {/* Created At */}
                <td className="px-4 py-3 text-sm text-gray-700  ">
                  {new Date(customer.createdAt ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                      

                {/* Note */}
                <td className=" ">
                  <textarea
                      value= {customer.note}
                      readOnly
                    placeholder="Add note"
                    className="w-full   py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm transition-all"
                  />
                </td>
{/* Attachment */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        
                      />
                      <div className="flex items-center gap-1 px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs text-gray-600 truncate max-w-[80px]">
                          {/* {fileInputs[customer.id] || "Attach"} */}
                        </span>
                      </div>
                    </label>
                  </div>
                </td>

                {/* Remove */}
               <td className="px-4 py-3 text-sm">
  <button
    className="w-full p-2 flex justify-center items-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-md transition-all hover:shadow-sm"
    onClick={() => setOpenModalId(customer.id)}
    title="Remove customer"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  </button>

  
  {openModalId === customer.id && (
    <RemoveModal
      removeQueue={removeQueue}
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
      <div className="flex justify-between mt-4">
  <button
    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
    disabled={currentPage === 1}
    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
  >
    Prev
  </button>

  <span>
    Page {currentPage} of {Math.ceil(filteredQueue.length / itemsPerPage)}
  </span>

  <button
    onClick={() =>
      setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredQueue.length / itemsPerPage)))
    }
    disabled={currentPage === Math.ceil(filteredQueue.length / itemsPerPage)}
    className="px-3 py-1 bg-blue-200 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>
    </div>
  );
}