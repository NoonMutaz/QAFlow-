// 'use client';
// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';

// interface Bug {
//   id: number;
//   title: string;
//   status: string;
// }

// interface TestCaseDetails {
//   id: number;
//   code: string;
//   title: string;
//   steps: string;
//   expectedResult: string;
//   linkedBugs: Bug[];
// }

// public default function TestCaseDetailsPage() {
//   const params = useParams();
//   const projectId = params?.id;
//   const testCaseId = params?.testCaseId;

//   const [testCase, setTestCase] = useState<TestCaseDetails | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Simulated fetch call matching your model architecture
//     // Replace with actual fetch: `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/testcases/${testCaseId}`
//     setTestCase({
//       id: 1,
//       code: "TC-001",
//       title: "Verify Login",
//       steps: "1. Open Login Page\n2. Enter valid credentials\n3. Click Login",
//       expectedResult: "Dashboard opens without console errors.",
//       linkedBugs: [
//         { id: 104, title: "Auth token fails to save in LocalStorage on Firefox", status: "in-progress" }
//       ]
//     });
//     setLoading(false);
//   }, [projectId, testCaseId]);

//   if (loading) return <div className="p-6 text-sm text-gray-500 animate-pulse">Loading execution matrix...</div>;
//   if (!testCase) return <div className="p-6 text-sm text-red-500">Test Case configuration records not found.</div>;

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       {/* Test Case Meta Header */}
//       <div className="border-b border-gray-100 pb-4 dark:border-zinc-800">
//         <span className="text-xs font-mono font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
//           {testCase.code}
//         </span>
//         <h1 className="text-2xl font-bold text-gray-900 mt-2 dark:text-gray-50">{testCase.title}</h1>
//       </div>

//       {/* Steps Execution Content Card */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2 space-y-4">
//           <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm dark:bg-zinc-950 dark:border-zinc-900">
//             <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Reproduction Steps</h3>
//             <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed dark:text-zinc-300">
//               {testCase.steps}
//             </p>
//           </div>

//           <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm dark:bg-zinc-950 dark:border-zinc-900">
//             <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Expected Outcome</h3>
//             <p className="text-sm text-emerald-600 font-medium dark:text-emerald-400">
//               {testCase.expectedResult}
//             </p>
//           </div>
//         </div>

//         {/* 🔗 Linked Bugs Sidebar Panel */}
//         <div className="space-y-4">
//           <div className="bg-gray-50 border border-gray-200/60 p-4 rounded-xl dark:bg-zinc-900/30 dark:border-zinc-800/80">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
//                 Linked Bugs ({testCase.linkedBugs.length})
//               </h3>
//               {/* Action trigger button to bind an existing bug tracking log */}
//               <button className="text-xs text-purple-600 font-semibold hover:underline dark:text-purple-400">
//                 + Link Bug
//               </button>
//             </div>

//             {testCase.linkedBugs.length === 0 ? (
//               <p className="text-xs text-gray-400 italic">No defects linked to this scenario execution.</p>
//             ) : (
//               <div className="space-y-2">
//                 {testCase.linkedBugs.map((bug) => (
//                   <div 
//                     key={bug.id} 
//                     className="p-2.5 bg-white border border-gray-100 rounded-lg text-xs shadow-xs flex flex-col gap-1 dark:bg-zinc-950 dark:border-zinc-900"
//                   >
//                     <span className="font-mono text-gray-400">#BUG-{bug.id}</span>
//                     <p className="font-medium text-gray-800 truncate dark:text-zinc-200">{bug.title}</p>
//                     <span className="self-start mt-1 px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
//                       {bug.status}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from 'react'

export default function page() {
  return (
    <div>
      
    </div>
  )
}
