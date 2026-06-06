'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface AnalyticsData {
  topContributor: string;
  mostActiveTester: string;
}

interface DashboardHeaderProps {
  project: Project;
  id: string | number;
  queue: Queue;
  members?: Member[];
}

export default function DashboardHeader({ project, id, queue, members = [] }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTester, setActiveTester] = useState<string>('Loading...');
  const [topDev, setTopDev] = useState<string>('Loading...'); 

  const activeCount = (queue[id] ?? []).filter(
    (c) => c.status === 'in-progress',
  ).length;

  //   Auto-fetch analytics data directly on header load
  useEffect(() => {
    if (!id) return;

    const fetchAnalytics = async () => {
      try {
        //   Read the token from cookies instead of localStorage
        const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
        const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
        
        const res = await fetch(`${API}/api/projects/${id}/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const result: AnalyticsData = await res.json();
          setActiveTester(result.mostActiveTester || 'None');
          setTopDev(result.topContributor || 'None'); 
        } else {
          setActiveTester('N/A');
          setTopDev('N/A');
        }
      } catch (err) {
        console.error("Error loading header analytics", err);
        setActiveTester('N/A');
        setTopDev('N/A');
      }
    };

    fetchAnalytics();
  }, [id]);

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
              {members.slice(0, 3).map((member) => {
                const initialLetter = (member.name || member.email || 'U')[0].toUpperCase();
                return (
                  <div
                    key={member.userId}
                    title={`${member.name || 'User'} - ${member.email} (${member.role})`}
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-105 transition-transform dark:border-zinc-950 ${getRoleColor(member.role)}`}
                  >
                    {initialLetter}
                  </div>
                );
              })}
              {members.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-105 transition-transform bg-gradient-to-br from-purple-400 to-purple-600 cursor-pointer dark:border-zinc-950">
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
                  {members.map((member) => {
                    const fallbackLetter = (member.name || member.email || 'U')[0].toUpperCase();
                    return (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors border-b border-gray-50 dark:border-zinc-900/50 last:border-b-0"
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 ${getRoleColor(member.role)}`}>
                          {fallbackLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-semibold text-gray-900 truncate dark:text-gray-100">
                              {member.name || 'Anonymous User'}
                            </p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {member.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate dark:text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action and Metric Stats Area */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 mt-2 md:mt-0">
        
        {/* Activity Log Button */}
        <Link
          href={`/dashboard/${id}/activity`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
        >
          <svg className="h-4 w-4 text-gray-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          Activity Log
        </Link>

        <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-zinc-800" />

        {/* Top Contributor */}
        {/* <div className="text-right min-w-[120px]">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider dark:text-zinc-500 flex items-center justify-end gap-1">
            <svg className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.48 3.499c.151-.39.71-.39.862 0l2.394 6.128 6.562.338c.42.022.588.54.262.858l-4.97 4.834 1.624 6.4c.104.414-.352.746-.71.535L12 18.732l-5.632 3.454c-.358.22-.814-.112-.71-.535l1.624-6.4-4.97-4.834c-.326-.317-.158-.836.262-.858l6.562-.338 2.394-6.128z" />
            </svg>
            Top Contributor:
          </p>
          <p className="text-sm font-semibold text-zinc-800 truncate max-w-[130px] mt-0.5 dark:text-zinc-200" title={topDev}>
            {topDev}
          </p>
        </div> */}

        <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-zinc-800" />

        {/* Top Tester */}
        <div className="text-right min-w-[120px]">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider dark:text-zinc-500 flex items-center justify-end gap-1">
              <svg className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.48 3.499c.151-.39.71-.39.862 0l2.394 6.128 6.562.338c.42.022.588.54.262.858l-4.97 4.834 1.624 6.4c.104.414-.352.746-.71.535L12 18.732l-5.632 3.454c-.358.22-.814-.112-.71-.535l1.624-6.4-4.97-4.834c-.326-.317-.158-.836.262-.858l6.562-.338 2.394-6.128z" />
            </svg>
            Top Contributor:
          </p>
          <p className="text-sm font-semibold text-zinc-800 truncate max-w-[130px] mt-0.5 dark:text-zinc-200" title={activeTester}>
            {activeTester}
          </p>
        </div>

        <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-zinc-800" />

        {/* Active Bugs Counter */}
        <div className="text-right min-w-[70px]">
          <p className="text-xs text-gray-500 dark:text-zinc-400">Active Bugs</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activeCount}</p>
        </div>
      </div>
    </div>
  );
}