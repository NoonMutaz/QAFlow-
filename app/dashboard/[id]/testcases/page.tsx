"use client";
import React, { useState, useEffect, use } from "react";
import CreateTestCase from "./CreateTestCase";

interface LinkedBug {
  id: number;
  bugId: string;
  status: 'notFixed' | 'in-progress' | 'fixed';
}

interface TestCase {
  id: number;
  title: string;
  expectedResult: string;
  steps?: string[]; // Added to match backend schema
  linkedBugs?: LinkedBug[];
}

export default function TestCasesPage({ params }: { params: Promise<{ id: string }> }) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Tracks which test cases have their steps expanded
  const [expandedCases, setExpandedCases] = useState<Record<number, boolean>>({});
  
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const fetchTestCases = async () => {
    if (!id) return;
    try {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/testcases`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setTestCases(data);
      }
    } catch (error) {
      console.error("Error fetching test cases:", error);
    }
  };

  useEffect(() => { 
    fetchTestCases(); 
  }, [id]);

  const toggleExpand = (tcId: number) => {
    setExpandedCases((prev) => ({
      ...prev,
      [tcId]: !prev[tcId],
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Project Test Cases</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, trace, and monitor bug-to-test verification matrices.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-blue-600/10 hover:bg-blue-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Test Case
        </button>
      </div>

      {/* List of Test Cases Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 divide-y divide-gray-100 overflow-hidden">
        {testCases.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-gray-50 rounded-2xl text-gray-400 mb-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium text-base">No test cases found</p>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">Get started by building your first structured test script suite workflow scenario.</p>
          </div>
        ) : (
          testCases.map((tc) => {
            const bugs = tc.linkedBugs ?? [];
            const totalBugs = bugs.length;
            const openBugs = bugs.filter(b => b.status !== 'fixed').length;
            const isFullyFixed = totalBugs > 0 && openBugs === 0;
            const isExpanded = expandedCases[tc.id] || false;

            return (
              <div 
                key={tc.id} 
                className="p-6 flex flex-col hover:bg-gray-50/60 transition-colors duration-150"
              >
                {/* Top Main Info row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-1.5 max-w-3xl flex-1">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleExpand(tc.id)}
                        className="p-1 -ml-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={isExpanded ? "Hide Steps" : "Show Steps"}
                      >
                        <svg 
                          className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <h3 
                        onClick={() => toggleExpand(tc.id)}
                        className="font-semibold text-lg text-gray-900 tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        {tc.title}
                      </h3>
                    </div>
                    
                    <div className="pl-7 flex gap-2 items-start text-gray-600 text-sm">
                      <span className="font-semibold text-gray-400 shrink-0 select-none mt-0.5">Expected:</span>
                      <p className="text-gray-600 leading-relaxed">{tc.expectedResult}</p>
                    </div>
                    
                    {/* Micro Bug Badges List */}
                    {totalBugs > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 pl-7">
                        {bugs.map(bug => (
                          <span 
                            key={bug.id} 
                            className={`inline-flex items-center text-xs font-mono px-2 py-0.5 rounded-md border tracking-wide font-medium shadow-2xs ${
                              bug.status === 'fixed' 
                                ? 'bg-emerald-50/60 text-emerald-700 border-emerald-200/60 line-through' 
                                : bug.status === 'in-progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {bug.bugId || `#${bug.id}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Indicator Status Pills */}
                  <div className="flex items-center shrink-0 self-start md:self-center pl-7 md:pl-0">
                    {totalBugs === 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full font-medium border border-gray-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        No Linked Bugs
                      </span>
                    ) : isFullyFixed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full font-semibold border border-emerald-200/50">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        All Bugs Fixed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full font-semibold border border-amber-200/50">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        {openBugs} Active {openBugs === 1 ? 'Bug' : 'Bugs'} Remaining
                      </span>
                    )}
                  </div>
                </div>

                {/* Dropdown Action Step Workflow Sequence */}
                {isExpanded && (
                  <div className="mt-5 pl-7 pr-4 py-4 bg-gray-50/80 rounded-xl border border-gray-200/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Execution Steps Sequence
                    </h4>
                    {tc.steps && tc.steps.length > 0 ? (
                      <div className="space-y-2.5">
                        {tc.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-5 h-5 bg-white border border-gray-200 text-gray-500 font-mono text-[11px] font-bold rounded-md shrink-0 shadow-2xs mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-sm text-gray-700 leading-relaxed pt-0.5">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No instructions specified for this test case.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Backdrop Container */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl ring-1 ring-black/5">
            <CreateTestCase 
              projectId={id} 
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