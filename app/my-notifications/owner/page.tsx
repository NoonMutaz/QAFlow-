// 'use client';

// import React, { useEffect, useState, useMemo } from 'react';
// import { useQueueContext } from '../../context/QueueContext';

// export default function ActivityReportPage() {
//   const { activityLogs, loadingLogs, fetchActivityLogs } = useQueueContext();
//   const [filterType, setFilterType] = useState<string>('ALL');

//   // 1. Fetch system audit trails on component mount
//   useEffect(() => {
//     if (fetchActivityLogs) {
//       fetchActivityLogs();
//     }
//   }, [fetchActivityLogs]);

//   // 2. Filter logs based on active selection bar
//   const filteredLogs = useMemo(() => {
//     if (!activityLogs) return [];
//     if (filterType === 'ALL') return activityLogs;
//     return activityLogs.filter((log) => log.actionType === filterType);
//   }, [activityLogs, filterType]);

//   // Helper helper to build user-friendly action text dynamically
//   const renderLogMessage = (log: any) => {
//     switch (log.actionType) {
//       case 'CREATE':
//         return (
//           <>
//             <span className="font-semibold text-slate-800">{log.actorName}</span> created bug{' '}
//             <span className="font-mono text-xs bg-slate-100 border px-1.5 py-0.5 rounded text-blue-600 font-bold">{log.bugId}</span>: 
//             <span className="italic text-slate-600 ml-1">"{log.bugDescription}"</span>
//           </>
//         );
//       case 'ASSIGN':
//         return (
//           <>
//             <span className="font-semibold text-slate-800">{log.actorName}</span> assigned bug{' '}
//             <span className="font-mono text-xs bg-slate-100 border px-1.5 py-0.5 rounded text-blue-600 font-bold">{log.bugId}</span> to{' '}
//             <span className="font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">{log.newValue || 'Unassigned'}</span>
//           </>
//         );
//       case 'STATUS_CHANGE':
//         return (
//           <>
//             <span className="font-semibold text-slate-800">{log.actorName}</span> updated{' '}
//             <span className="font-mono text-xs bg-slate-100 border px-1.5 py-0.5 rounded text-blue-600 font-bold">{log.bugId}</span> status from{' '}
//             <span className="line-through text-slate-400">{log.oldValue || 'none'}</span> to{' '}
//             <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
//               log.newValue === 'fixed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
//               log.newValue === 'in-progress' ? 'bg-purple-50 text-purple-700 border-purple-200' :
//               'bg-red-50 text-red-700 border-red-200'
//             }`}>{log.newValue}</span>
//           </>
//         );
//       default:
//         return <span className="text-slate-600">System modification performed by {log.actorName}</span>;
//     }
//   };

//   const formatLogDate = (dateString: string) => {
//     if (!dateString) return '';
//     const timestamp = isNaN(Number(dateString)) ? Date.parse(dateString) : Number(dateString);
//     if (isNaN(timestamp)) return dateString;

//     return new Date(timestamp).toLocaleString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 font-sans">
//       <div className="mx-auto max-w-4xl space-y-6">
        
//         {/* Header Block */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Report</h1>
//             <p className="mt-1 text-sm text-slate-500">Track structural project edits and bug lifecycle modifications.</p>
//           </div>

//           {/* Filter Bar */}
//           <div className="flex flex-wrap gap-1 bg-slate-200/70 p-1 rounded-lg border border-slate-300/40 text-xs font-medium self-start md:self-center">
//             {['ALL', 'CREATE', 'ASSIGN', 'STATUS_CHANGE'].map((type) => (
//               <button
//                 key={type}
//                 suppressHydrationWarning
//                 onClick={() => setFilterType(type)}
//                 className={`px-3 py-1.5 rounded-md transition-all uppercase tracking-wide text-[11px] ${
//                   filterType === type
//                     ? 'bg-white text-slate-900 shadow-sm font-bold'
//                     : 'text-slate-500 hover:text-slate-900'
//                 }`}
//               >
//                 {type === 'ALL' ? 'All Activity' : type.replace('_', ' ')}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Timeline Logger Container */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           {loadingLogs ? (
//             <div className="p-8 text-center text-sm text-slate-400 animate-pulse">
//               Loading system audit trails...
//             </div>
//           ) : filteredLogs.length === 0 ? (
//             <div className="p-12 text-center text-sm text-slate-400 italic">
//               No historical actions recorded matching this filter.
//             </div>
//           ) : (
//             <ul className="divide-y divide-slate-100">
//               {filteredLogs.map((log) => (
//                 <li key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-600">
//                   <div className="flex items-center gap-3">
//                     {/* Visual Timeline Dot Indication Indicator */}
//                     <span className={`w-2 h-2 rounded-full shrink-0 ${
//                       log.actionType === 'CREATE' ? 'bg-blue-500' :
//                       log.actionType === 'ASSIGN' ? 'bg-purple-500' : 'bg-emerald-500'
//                     }`} />
//                     <div className="leading-relaxed">
//                       {renderLogMessage(log)}
//                     </div>
//                   </div>
//                   <span className="font-mono text-[11px] text-slate-400 self-end sm:self-center bg-slate-50 px-2 py-0.5 border rounded">
//                     {formatLogDate(log.createdAt)}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }rfc
import React from 'react'

export default function page() {
  return (
    <div>
      
    </div>
  )
}
