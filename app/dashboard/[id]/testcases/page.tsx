"use client";
import React, { useState, useEffect, use } from "react";
import CreateTestCase from "./CreateTestCase";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LinkedBug {
  id: number;
  bugId: string;
  status: 'notFixed' | 'in-progress' | 'pendingReview' | 'fixed';
}

const authToken = () =>
  document.cookie.match(/(^| )token=([^;]+)/)?.[2] ?? localStorage.getItem('token') ?? '';

interface TestCase {
  id: number;
  title: string;
  expectedResult: string;
  steps?: string[];
  linkedBugs?: LinkedBug[];
  status?: 'passed' | 'failed' | null; // inspection result when no finding is linked
}

export default function TestCasesPage({ params }: { params: Promise<{ id: string }> }) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCases, setExpandedCases] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const fetchTestCases = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/testcases`,
        { headers: { Authorization: `Bearer ${authToken()}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTestCases(data);
    } catch (err) {
      setError("Failed to load the SBC clauses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTestCases(); }, [projectId]);

  const toggleExpand = (tcId: number) => {
    setExpandedCases((prev) => ({ ...prev, [tcId]: !prev[tcId] }));
  };

  /** Marks a clause with no linked finding as compliant ("passed"); calling it again clears it. */
  const handleStatusChange = async (tc: TestCase, clicked: 'passed' | 'failed') => {
    const previous = tc.status ?? null;
    const next = previous === clicked ? null : clicked;
    setTestCases((prev) => prev.map((t) => (t.id === tc.id ? { ...t, status: next } : t)));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/testcases/${tc.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken()}` },
          body: JSON.stringify({ status: next }),
        }
      );
      if (!res.ok) throw new Error(`Status not saved (${res.status})`);
    } catch (err) {
      console.error(err);
      setTestCases((prev) => prev.map((t) => (t.id === tc.id ? { ...t, status: previous } : t)));
      setError("Could not save the result. Please try again.");
    }
  };

  const handleDelete = async (tcId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/testcases/${tcId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${authToken()}` } }
      );
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setTestCases((prev) => prev.filter((t) => t.id !== tcId));
    } catch (err) {
      console.error(err);
      setError("Could not delete the clause. Please try again.");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">SBC Clauses</h1>
            <p className="text-sm text-gray-500 mt-1.5">The code requirements this project is inspected against, and the findings linked to each.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.back()} className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
              Back
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              + Add SBC clause
            </button>
          </div>
        </div>

        {/* Legend Row */}
        <div className="flex w-fit items-center gap-6 mt-6 px-4 py-2.5 bg-white rounded-lg border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked findings:</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span> Fixed
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> In Progress
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span> Awaiting approval
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span> Not Fixed
            </div>
          </div>
        </div>
      </div>
      
      {/* State Rendering: Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex justify-between items-center">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchTestCases} className="text-xs font-bold underline hover:text-red-800">Retry</button>
        </div>
      )}

      {/* State Rendering: Loading */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((skeleton) => (
            <div key={skeleton} className="h-28 bg-white border border-gray-100 rounded-2xl animate-pulse shadow-sm"></div>
          ))}
        </div>
      ) : testCases.length === 0 && !error ? (
        /* State Rendering: Empty */
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200 border-dashed">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No SBC clauses yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Add the code requirements this project must meet, from the SBC Library or manually. Findings will be linked to them.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-sm transition-colors">
            Add first clause
          </button>
        </div>
      ) : (
        /* State Rendering: Data (Test Cases) */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {testCases.map((tc) => {
            const bugs = tc.linkedBugs ?? [];
            const openBugs = bugs.filter(b => b.status !== 'fixed').length;
            const isFullyFixed = bugs.length > 0 && openBugs === 0;
            
            // done = all linked findings fixed, or no findings and the engineer marked it compliant
            const isCompliant = bugs.length === 0 && tc.status === 'passed';
            const isCompleted = isFullyFixed || isCompliant;

            return (
              <div key={tc.id} className="p-6 transition-colors hover:bg-gray-50/50">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 group cursor-pointer w-fit" onClick={() => toggleExpand(tc.id)}>
                      <button className="p-1 text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-md transition-colors">
                        <svg className={`w-5 h-5 transition-transform duration-200 ${expandedCases[tc.id] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {isCompleted && (
                        <svg className="h-5 w-5 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      <h3 className="font-bold text-lg text-gray-900 transition-colors group-hover:text-blue-700">{tc.title}</h3>
                    </div>
                    
                    <p className="pl-9 text-sm mt-1 text-gray-600">
                      <span className="font-medium text-gray-700">Required:</span> {tc.expectedResult}
                    </p>
                    
                    {bugs.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 pl-9">
                        {bugs.map(bug => (
                          <span 
                            key={bug.id} 
                            className={`text-xs px-2.5 py-1 rounded-md border font-mono font-medium shadow-sm transition-all ${
                              bug.status === 'fixed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : bug.status === 'in-progress'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : bug.status === 'pendingReview'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {bug.status === 'fixed' && '✓ '}{bug.bugId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Bug Summary Status OR Interactive Segment Selector */}
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {bugs.length > 0 ? (
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        isFullyFixed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                        {isFullyFixed ? "✓ All fixed" : `${openBugs} open finding${openBugs === 1 ? '' : 's'}` }
                      </span>
                    ) : isCompliant ? (
                      <span className="flex items-center gap-2">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                          ✓ Compliant
                        </span>
                        <button
                          onClick={() => void handleStatusChange(tc, 'passed')}
                          className="text-xs font-medium text-gray-400 hover:text-gray-700 hover:underline"
                        >
                          Undo
                        </button>
                      </span>
                    ) : (
                      <span className="flex flex-wrap items-center justify-end gap-2">
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
                          Not inspected
                        </span>
                        <button
                          onClick={() => void handleStatusChange(tc, 'passed')}
                          className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Mark compliant
                        </button>
                        <Link
                          href={`/dashboard/${projectId}`}
                          className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Report finding
                        </Link>
                      </span>
                    )}
                    {confirmDelete === tc.id ? (
                      <span className="flex items-center gap-1">
                        <button onClick={() => void handleDelete(tc.id)} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                          Delete
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600">
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(tc.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title={bugs.length ? 'Delete clause (linked findings are kept)' : 'Delete clause'}
                        aria-label="Delete clause"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {expandedCases[tc.id] && (
                  <div className="mt-5 ml-9 p-5 bg-gray-50 rounded-xl border border-gray-100/80 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Inspection checklist</h4>
                    {tc.steps && tc.steps.length > 0 ? (
                      <div className="space-y-2">
                        {tc.steps.map((step, idx) => (
                          <div key={idx} className="flex gap-3 text-sm text-gray-700">
                            <span className="font-semibold text-gray-400 select-none">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No checklist items.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Modal Backdrop Container */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60] transition-opacity" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CreateTestCase 
              projectId={projectId}  
              existingTitles={testCases.map((tc) => tc.title)}
              onSuccess={() => {
                setIsModalOpen(false);
                fetchTestCases();
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}