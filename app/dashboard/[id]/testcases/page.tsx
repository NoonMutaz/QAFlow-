// 'use client';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';

// // Mock list of test cases (this will eventually come from your .NET backend API)
// const mockTestCases = [
//   { id: 1, code: 'TC-001', title: 'Verify Login' },
//   { id: 2, code: 'TC-002', title: 'Verify Bug Submission' },
// ];

// export default function TestCasesListPage() {
//   const params = useParams();
//   const projectId = params?.id; // Grabs '9' from the URL

//   return (
//     <div className="p-6 max-w-4xl mx-auto space-y-4">
//       <h1 className="text-2xl font-bold">Project Test Cases</h1>
      
//       <div className="grid gap-3">
//         {mockTestCases.map((tc) => (
//           <Link 
//             key={tc.id} 
//             href={`/dashboard/${projectId}/testcases/${tc.id}`} // Routes to the specific test case page
//             className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-400 transition shadow-xs flex items-center gap-3 dark:bg-zinc-950 dark:border-zinc-800"
//           >
//             <span className="font-mono bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
//               {tc.code}
//             </span>
//             <span className="font-medium text-gray-900 dark:text-gray-100">{tc.title}</span>
//             <span className="ml-auto text-gray-400 text-xs">View Matrix →</span>
//           </Link>
//         ))}
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
