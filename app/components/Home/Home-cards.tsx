'use client';

import { useRouter } from "next/navigation";

export default function HomeCard() {
    const router = useRouter();

  return (
    <section className="px-6 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">

        {/* Initiate New Audit / Project */}
        <button
          onClick={() => router.push("/createProject")}
          className="group text-left rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-8 shadow-lg
                     hover:shadow-emerald-950/40 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex gap-5 items-start">
            <div className="w-14 h-14 rounded-xl bg-emerald-600/90 group-hover:bg-emerald-500 text-white flex items-center justify-center
                            shadow-md shadow-emerald-900/30 group-hover:scale-105 transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                New Compliance Audit
              </h3>

              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                Initiate a new regulatory review, set compliance criteria, and track policy adherence.
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-400 opacity-0 group-hover:opacity-100 transition-all">
                Start audit process →
              </span>
            </div>
          </div>
        </button>

        {/* Access Active Compliance Dashboard / Projects */}
        <button
          onClick={() => router.push("/my-projects")}
          className="group text-left rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-8 shadow-lg
                     hover:shadow-indigo-950/40 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex gap-5 items-start">
            <div className="w-14 h-14 rounded-xl bg-indigo-600/90 group-hover:bg-indigo-500 text-white flex items-center justify-center
                            shadow-md shadow-indigo-900/30 group-hover:scale-105 transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                Audit & Compliance Records
              </h3>

              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                Review active compliance files, past inspection logs, and non-conformity reports.
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                View records →
              </span>
            </div>
          </div>
        </button>

      </div>
    </section>
  );
}