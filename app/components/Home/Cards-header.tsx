import React from 'react';

export default function CardsHeader() {
  return (
    <header className="relative py-8 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Compliance Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Imtithal Compliance & Governance
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-slate-50 tracking-tight mb-3">
          Regulatory & Quality Hub
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Monitor compliance standards, conduct audits, track regulatory requirements, and ensure organization-wide quality management.
        </p>
      </div>
    </header>
  );
}