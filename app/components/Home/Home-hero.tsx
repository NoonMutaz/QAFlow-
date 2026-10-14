'use client';

import Link from "next/link";
import { useLanguage } from "../../i18n/LanguageProvider";
import { AiBadge, AiMark } from "../ui/Ai";
import dynamic from 'next/dynamic';

// Disable SSR so the canvas doesn't glitch during Next.js hydration
const Lightfall = dynamic(() => import('../Lightfall'), { ssr: false });

export default function HomeHero() {
  const { t } = useLanguage();
  return (
    <section className="relative isolate overflow-hidden bg-brand-950 text-slate-100">
      {/* Background canvas + glow */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Lightfall
            colors={['#1f777c', '#2a9297', '#d2a045']}
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
      <div className="bg-hex-pattern pointer-events-none absolute inset-0 -z-10" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(50rem 28rem at 80% 0%, rgba(42,146,151,0.28), transparent 60%), radial-gradient(30rem 20rem at 10% 100%, rgba(210,160,69,0.12), transparent 60%), linear-gradient(to bottom, rgba(10,38,41,0) 60%, rgba(10,38,41,0.95))',
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr]">
        {/* Copy */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-brand-900/70 py-1 pe-3 ps-1 text-xs font-semibold text-gold-200 backdrop-blur">
            <AiBadge />
            {t("AI-assisted inspection for the Saudi Building Code")}
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
            {t("From site photo to")}{' '}
            <span className="bg-gradient-to-r from-brand-300 via-brand-200 to-gold-300 bg-clip-text text-transparent">
              {t("SBC clause")}
            </span>{' '}
            {t("in seconds")}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100/80">
            {t("Imtithal helps site engineers log non-conformities faster. Snap a photo, let AI describe the finding and suggest the matching Saudi Building Code clause, then track it to a verified fix.")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/createProject"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 font-semibold text-brand-950 shadow-lg shadow-gold-500/20 transition hover:bg-gold-300"
            >
              {t("Start an inspection project")}
              <span aria-hidden="true" className="rtl:rotate-180">→</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-brand-700 bg-brand-900/60 px-6 py-3.5 font-semibold text-brand-100 transition hover:border-brand-500 hover:bg-brand-800"
            >
              {t("See how it works")}
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-200/70">
            {['Arabic & English', 'Linked to SBC clauses', 'Evidence-backed closure'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gold-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
                </svg>
                {t(item)}
              </li>
            ))}
          </ul>
        </div>

        {/* Product preview */}
        <AiPreview />
      </div>
    </section>
  );
}

/** Illustrative preview of the AI suggestion, built in markup so it needs no image asset. */
function AiPreview() {
  const { t } = useLanguage();
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gold-400/10 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-brand-700/80 bg-brand-950/90 shadow-2xl backdrop-blur">
        {/* window bar */}
        <div className="flex items-center gap-1.5 border-b border-brand-800 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="ms-3 text-xs text-slate-500">{t("Log SBC non-conformity")}</span>
        </div>

        <div className="space-y-4 p-5">
          {/* photo + AI finding */}
          <div className="flex gap-3">
            <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-gradient-to-br from-slate-700 to-slate-800">
              <svg className="h-8 w-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="6" y="3" width="12" height="18" rx="1" />
                <circle cx="15" cy="12" r="0.8" fill="currentColor" />
                <path d="M3 21h18" />
              </svg>
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-400">
                <AiMark className="h-3.5 w-3.5 text-brand-300" /> {t("AI finding")}
              </p>
              <p className="text-sm font-medium text-slate-100">{t("Emergency exit door is padlocked")}</p>
              <p className="text-xs leading-relaxed text-slate-400">
                {t("The exit door is chained shut and opens inward, blocking the escape route.")}
              </p>
            </div>
          </div>

          {/* suggested clause */}
          <div className="rounded-xl border border-gold-400/30 bg-gold-400/5 p-3.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("Suggested SBC clause")}</p>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">SBC 201 · {t("Exit doors")}</p>
                <p className="mt-0.5 text-xs text-slate-400">{t("Must open from inside without a key, in the direction of egress.")}</p>
                <span className="mt-2 inline-block rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
                  {t("High confidence")}
                </span>
              </div>
              <span className="shrink-0 rounded-md bg-gold-400 px-2.5 py-1 text-[11px] font-semibold text-brand-950">
                {t("Selected ✓")}
              </span>
            </div>
          </div>

          {/* risk */}
          <div className="flex items-center justify-between rounded-lg border border-brand-800 px-3 py-2.5">
            <span className="text-xs text-slate-400">{t("Risk level")}</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-300">
              <span className="h-2 w-2 rounded-full bg-red-500" /> {t("High")}
            </span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-brand-300/60">{t("Illustrative preview")}</p>
    </div>
  );
}
