"use client";
import React, { useState, useEffect, use } from "react";
import CreateTestCase from "./CreateTestCase";
import { useRouter } from 'next/navigation';

interface LinkedBug {
  id: number;
  bugId: string;
  status: 'notFixed' | 'in-progress' | 'fixed';
}

interface TestCase {
  id: number;
  title: string;
  expectedResult: string;
  steps?: string[];
  linkedBugs?: LinkedBug[];
  status?: 'passed' | 'failed'; // Added to track execution status when no bugs exist
}

export default function TestCasesPage({ params }: { params: Promise<{ id: string }> }) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCases, setExpandedCases] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const fetchTestCases = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/testcases`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTestCases(data);
    } catch (err) {
      setError("Failed to load test cases. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTestCases(); }, [projectId]);

  const toggleExpand = (tcId: number) => {
    setExpandedCases((prev) => ({ ...prev, [tcId]: !prev[tcId] }));
  };

  // Status Change API Handler for cases without bugs
  const handleStatusChange = async (tcId: number, nextStatus: 'passed' | 'failed') => {
    // Optimistic local UI State update
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === tcId ? { ...tc, status: nextStatus } : tc))
    );

    try {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/testcases/${tcId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
    } catch (err) {
      console.error("Failed to persist status change:", err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Project Test Cases</h1>
            <p className="text-sm text-gray-500 mt-1.5">Manage, trace, and monitor your verification matrix.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.back()} className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
              Back
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Add Test Case
            </button>
          </div>
        </div>

        {/* Legend Row */}
        <div className="flex w-fit items-center gap-6 mt-6 px-4 py-2.5 bg-white rounded-lg border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bug Status:</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span> Fixed
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> In Progress
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
          <h3 className="text-lg font-bold text-gray-900 mb-1">No test cases yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Get started by creating your first test case to start tracking bugs and verification steps.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-sm transition-colors">
            Create First Test Case
          </button>
        </div>
      ) : (
        /* State Rendering: Data (Test Cases) */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {testCases.map((tc) => {
            const bugs = tc.linkedBugs ?? [];
            const openBugs = bugs.filter(b => b.status !== 'fixed').length;
            const isFullyFixed = bugs.length > 0 && openBugs === 0;
            
            // Unified Completion Logic (Fully Fixed bugs OR marked explicitly as Passed)
            const isCompleted = isFullyFixed || (bugs.length === 0 && tc.status === 'passed');

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
                      <h3 className={`font-bold text-lg transition-colors ${isCompleted ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-900 group-hover:text-blue-700'}`}>{tc.title}</h3>
                    </div>
                    
                    {/* Conditionally crossed out Expected Result line if case is completed */}
                    <p className={`pl-9 text-sm mt-1 transition-all ${isCompleted ? 'line-through text-gray-400/70 decoration-gray-300' : 'text-gray-600'}`}>
                      <span className={`font-medium ${isCompleted ? 'text-gray-400' : 'text-gray-700'}`}>Expected:</span> {tc.expectedResult}
                    </p>
                    
                    {bugs.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 pl-9">
                        {bugs.map(bug => (
                          <span 
                            key={bug.id} 
                            className={`text-xs px-2.5 py-1 rounded-md border font-mono font-medium shadow-sm transition-all ${
                              bug.status === 'fixed' 
                                ? 'bg-emerald-50/60 text-emerald-900/70 border-emerald-100 line-through decoration-emerald-700' 
                                : bug.status === 'in-progress'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {bug.bugId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Bug Summary Status OR Interactive Segment Selector */}
                  <div className="flex-shrink-0">
                    {bugs.length > 0 ? (
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        isFullyFixed 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                        {isFullyFixed ? "All Fixed" : `${openBugs} Active Bugs` } 
                      </span>
                    ) : (
                      /* Interactive Pill Toggle for Pass/Fail */
                      <div className="flex items-center gap-0.5 bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
                        <button 
                          onClick={() => handleStatusChange(tc.id, 'passed')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 tracking-wide select-none ${
                            tc.status === 'passed' 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'text-gray-500 hover:text-emerald-600 hover:bg-white/60'
                          }`}
                        >
                          Pass
                        </button>
                        <button 
                          onClick={() => handleStatusChange(tc.id, 'failed')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 tracking-wide select-none ${
                            tc.status === 'failed' 
                              ? 'bg-rose-600 text-white shadow-sm' 
                              : 'text-gray-500 hover:text-rose-600 hover:bg-white/60'
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {expandedCases[tc.id] && (
                  <div className="mt-5 ml-9 p-5 bg-gray-50 rounded-xl border border-gray-100/80 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Execution Steps</h4>
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
                      <p className="text-sm text-gray-400 italic">No execution steps documented.</p>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
            <CreateTestCase 
              projectId={projectId}  
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