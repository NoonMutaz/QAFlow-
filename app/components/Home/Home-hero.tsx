'use client';

import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Disable SSR so the canvas doesn't glitch during Next.js hydration
const Lightfall = dynamic(() => import('../Lightfall'), { ssr: false });

export default function HomeHero() {
  const router = useRouter();
  
  const handleCreateProject = () => {
    router.push("/createProject");
  };

  return (
    <div>
      {/* CRITICAL: 'isolate' forces the -z-10 canvas to stay inside this section */}
      <section className="relative isolate overflow-hidden py-20 px-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md shadow-2xl">
        
        {/* Background Canvas */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div style={{ width: '100%', height: 600, position: 'relative' }}>
            <Lightfall
              colors={[ '#10B981', '#059669', '#0284C7' ]}
              mouseForce={28}
              cursorSize={40}
              isViscous
              viscous={37}
              iterationsViscous={34}
              iterationsPoisson={20}
              resolution={0.5}
              isBounce={false}
              autoDemo
              autoSpeed={0.6}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
            />
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800/80 backdrop-blur-md rounded-full border border-emerald-500/30 shadow-sm mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Imtithal Governance Engine
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-6 tracking-tight leading-tight">
            Elevating Standards of{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Regulatory Compliance
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Streamline organizational governance, perform thorough quality audits, and maintain continuous compliance across all operational frameworks.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Initiate New Audit
            </button>
            <a
              href="/aboutUs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-xl font-semibold hover:bg-slate-800 hover:text-white hover:border-slate-600 hover:shadow-lg transition-all duration-300"
            >
              Compliance Guidelines
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}