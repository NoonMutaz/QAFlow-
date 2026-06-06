'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface AnalyticsData {
  openBugs: number;
  fixedBugs: number;
  criticalBugs: number;
  topContributor: string;
  mostActiveTester: string;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const projectId = params?.id;

  useEffect(() => {
    if (projectId) {
      const fetchAnalytics = async () => {
        try {
          const token = localStorage.getItem("token");
          const API = process.env.NEXT_PUBLIC_API_URL ?? '';
          const res = await fetch(`${API}/api/projects/${projectId}/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const result = await res.json();
            setData(result);
          }
        } catch (err) {
          console.error("Failed to load metrics", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [projectId]);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-zinc-900" />;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* 📊 Main Numerical Performance Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        
        {/* Open Bugs Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Open Bugs</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">{data.openBugs}</span>
            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded dark:bg-amber-950/30 dark:text-amber-400">Active</span>
          </div>
        </div>

        {/* Fixed Bugs Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Fixed Bugs</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">{data.fixedBugs}</span>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-950/30 dark:text-emerald-400">Resolved</span>
          </div>
        </div>

        {/* Critical Bugs Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Critical Status</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-600 dark:text-red-500">{data.criticalBugs}</span>
            <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded dark:bg-red-950/30 dark:text-red-400">High Priority</span>
          </div>
        </div>

      </div>

      {/* 🏆 Human Roster Highlights Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-900/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            🥇
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 dark:text-zinc-500">Top Contributor</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{data.topContributor}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-900/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            🔍
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 dark:text-zinc-500">Most Active Tester</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{data.mostActiveTester}</div>
          </div>
        </div>
      </div>
    </div>
  );
}