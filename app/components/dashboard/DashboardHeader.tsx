'use client';
import { useState } from 'react';
import Link from 'next/link'; // Import Link for routing

export interface Project {
  id: number;
  name: string;
  description?: string;
  role?: 'owner' | 'member' | 'viewer';
  type?: string;
}

interface Member {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'member' | 'viewer';
}

interface QueueItem {
  status: string;
}

type Queue = Record<string | number, QueueItem[]>;

interface DashboardHeaderProps {
  project: Project;
  id: string | number;
  queue: Queue;
  members?: Member[];
}

export default function DashboardHeader({ project, id, queue, members = [] }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeCount = (queue[id] ?? []).filter(
    (c) => c.status === 'in-progress',
  ).length;

  const getRoleColor = (role: Member['role']) => {
    return role === 'owner'
      ? 'bg-gradient-to-br from-red-400 to-red-600'
      : role === 'member'
      ? 'bg-gradient-to-br from-blue-400 to-blue-600'
      : 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5 dark:border-zinc-900">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight dark:text-gray-50">
          {project.name || 'QA Dashboard'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-snug break-words dark:text-gray-400">
          {project.description || 'Monitor bugs, test cases, and status in real time'}
        </p>

        {/* Team Avatars */}
        {members.length > 0 && (
          <div className="flex items-center gap-2 mt-2 relative">
            <span className="text-xs text-gray-400 font-medium">Team:</span>
            <div 
              className="flex -space-x-2 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {members.slice(0, 3).map((member) => (
                <div
                  key={member.userId}
                  title={`${member.email} (${member.role})`}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-105 transition-transform dark:border-zinc-950 ${
                    getRoleColor(member.role)
                  }`}
                >
                  {member.email[0]?.toUpperCase()}
                </div>
              ))}
              {members.length > 3 && (
                <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-105 transition-transform bg-gradient-to-br from-purple-400 to-purple-600 cursor-pointer dark:border-zinc-950`}>
                  +{members.length - 3}
                </div>
              )}
            </div>

            {/* Members Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-14 left-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dark:bg-zinc-950 dark:border-zinc-800">
                <div className="p-3 border-b border-gray-100 dark:border-zinc-900">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Team Members ({members.length})
                  </h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors border-b border-gray-50 dark:border-zinc-900/50 last:border-b-0"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${getRoleColor(member.role)}`}>
                        {member.email[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 capitalize dark:text-gray-400">{member.role}</p>
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{member.name}</p>
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Area (Activity Logs Button & Active Count Metrics) */}
      <div className="flex items-center justify-between sm:justify-start gap-4 mt-2 md:mt-0">
        
        {/* ADDED: Activity Log Button */}
        <Link
          href={`/dashboard/${id}/activity`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
        >
          <svg 
            className="h-4 w-4 text-gray-500 dark:text-zinc-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="2" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          Activity Log
        </Link>

        <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-zinc-800" />

        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-zinc-400">Active Bugs</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activeCount}</p>
        </div>
      </div>
    </div>
  );
}