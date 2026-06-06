'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface AnalyticsData {
  openBugs: number;
  fixedBugs: number;
  criticalBugs: number;
  topContributor: string;
  mostActiveTester: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // 🔍 Added error state tracking
  
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;

  useEffect(() => {
    if (!projectId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'; // Fallback to local .NET port if env is empty
        
        const res = await fetch(`${API}/api/projects/${projectId}/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("403 Forbidden: You do not have permission to view analytics for this project.");
          }
          if (res.status === 404) {
            throw new Error("404 Not Found: This project does not exist in the database.");
          }
          throw new Error(`Server returned status code code: ${res.status}`);
        }

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        console.error("Failed to load metrics", err);
        setError(err.message || "An unexpected network connectivity error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
          <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
          <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  // 2. Error Visualizer (No more silent empty screens!)
  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-10 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
          <span className="text-3xl">⚠️</span>
          <h2 className="mt-2 font-semibold text-red-800 dark:text-red-400">Dashboard Failed to Load</h2>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">{error}</p>
          <button 
            onClick={() => router.push(`/dashboard/${projectId}`)}
            className="mt-4 text-xs font-medium bg-white px-3 py-1.5 border border-red-300 rounded-md text-red-700 shadow-sm hover:bg-red-50"
          >
            Go Back to Project Workspace
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // 3. Main Operational UI Layout
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <button 
          onClick={() => router.push(`/dashboard/${projectId}`)}
          className="text-xs text-gray-500 hover:text-gray-900 transition flex items-center gap-1 mb-2"
        >
          ← Back to Workspace
        </button>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Project Analytics Dashboard</h1>
      </div>

      {/* 📊 Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Open Bugs</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">{data.openBugs}</span>
            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded dark:bg-amber-950/30 dark:text-amber-400">Active</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Fixed Bugs</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">{data.fixedBugs}</span>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-950/30 dark:text-emerald-400">Resolved</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Critical Status</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-600 dark:text-red-500">{data.criticalBugs}</span>
            <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded dark:bg-red-950/30 dark:text-red-400">High Priority</span>
          </div>
        </div>
      </div>

      {/* 🏆 Roster Highlights Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-900/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">🥇</div>
          <div>
            <div className="text-xs font-medium text-gray-400 dark:text-zinc-500">Top Contributor</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{data.topContributor}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-900/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">🔍</div>
          <div>
            <div className="text-xs font-medium text-gray-400 dark:text-zinc-500">Most Active Tester</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{data.mostActiveTester}</div>
          </div>
        </div>
      </div>
    </div>
  );
}