'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ type: 'access' | 'not_found' | 'generic'; message: string } | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;

  useEffect(() => {
    if (projectId) {
      load();
    }
  }, [projectId]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const API = process.env.NEXT_PUBLIC_API_URL ?? '';

      const res = await fetch(
        `${API}/api/projects/${projectId}/activity`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle 403 Forbidden (User is not the owner)
      if (res.status === 403) {
        setError({
          type: 'access',
          message: 'Access Denied. Only the project owner is authorized to view the system activity logs.'
        });
        return;
      }

      // Handle 404 Not Found (Project does not exist)
      if (res.status === 404) {
        setError({
          type: 'not_found',
          message: `Project #${projectId} could not be found. It may have been deleted or never existed.`
        });
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error(err);
      setError({
        type: 'generic',
        message: 'Something went wrong while trying to load the activity stream.'
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── UI LOADING STATE ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="space-y-3">
            <div className="h-20 rounded-xl bg-gray-100 dark:bg-zinc-900" />
            <div className="h-20 rounded-xl bg-gray-100 dark:bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  // ─── UI ERROR STATES (ACCESS / NOT FOUND) ──────────────────────────────────
  if (error) {
    return (
      <div className="mx-auto max-w-md p-6 my-12 text-center">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {/* SVG Warning Icon Dynamic Colors */}
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            error.type === 'access' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
          }`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              {error.type === 'access' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              )}
            </svg>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
            {error.type === 'access' ? 'Owner Security Restriction' : 'Target Not Found'}
          </h3>
          
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {error.message}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => router.push(`/dashboard/${projectId}`)}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Back to Project Workspace
            </button>
            <button
              onClick={load}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── UI MAIN ACTIVITY FEED STATE ───────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-gray-100 p-5 dark:border-zinc-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
            Project Audit Logs
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real time infrastructure operations for Project Context Target <span className="font-mono bg-gray-100 text-gray-700 px-1 py-0.5 rounded dark:bg-zinc-800 dark:text-zinc-300">#{projectId}</span>
          </p>
        </div>

        <div className="p-5">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400 dark:text-zinc-500">
              No recent administrative actions have been captured in the system database.
            </div>
          ) : (
            <div className="relative border-l border-gray-200 pl-6 space-y-6 dark:border-zinc-800">
              {activities.map((item) => (
                <div key={item.id} className="relative group">
                  
                  {/* Custom Timeline Bullet Point Indicator */}
                  <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-blue-500 bg-white ring-4 ring-white transition group-hover:scale-110 dark:bg-zinc-950 dark:ring-zinc-950" />
                  
                  <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition hover:bg-gray-50 dark:border-zinc-900 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {item.user?.name ?? item.user?.email ?? 'System Identity'}
                      </span>
                  <span className="text-[10px] text-gray-400 font-mono dark:text-zinc-500">
  {/* The regex replaces any space with 'T' and appends 'Z' if it's missing to force proper UTC localization */}
  {new Date(item.createdAt.endsWith('Z') ? item.createdAt : `${item.createdAt.replace(' ', 'T')}Z`).toLocaleString()}
</span>
                    </div>

                    <div className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700 uppercase dark:bg-blue-950/50 dark:text-blue-400">
                      {item.action}
                    </div>

                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                      {item.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}