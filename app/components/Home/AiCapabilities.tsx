'use client';

import { useLanguage } from '../../i18n/LanguageProvider';
import { AiMark } from '../ui/Ai';

const capabilities = [
  {
    title: 'Reads site photos',
    text: 'Describes the violation it sees in a site photo and writes the finding, ready for the engineer to review.',
    icon: 'M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z M12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  },
  {
    title: 'Matches the right SBC clause',
    text: "Picks the matching clause from engineer-verified SBC clauses and the project's own clauses, and fills in the required standard.",
    icon: 'M9 12h6m-6 4h6M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z',
  },
  {
    title: 'Names the governing code',
    text: 'Even when no clause matches, it identifies the right code from the official list of the 28 SBC 2024 codes.',
    icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h1m-1 4h1m4-4h1m-1 4h1',
  },
  {
    title: 'Arabic and English',
    text: 'Understands findings written in either language, and writes its descriptions in the language of the interface.',
    icon: 'M3 5h12M9 3v2m1.05 9.5A18 18 0 016.4 9m6.1 9h7M11 21l5-10 5 10M12.75 5C11.78 10.77 8.07 15.61 3 18.13',
  },
  {
    title: 'Explains every suggestion',
    text: 'Each suggestion comes with a short reason and a confidence level, so the engineer can judge it in seconds.',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  {
    title: 'Spots duplicates',
    text: 'Flags findings that were already reported, so the same issue is not logged twice.',
    icon: 'M8 7h10a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z M4 15V5a2 2 0 012-2h10',
  },
];

/** Home section that presents Imtithal AI and what it does. */
export default function AiCapabilities() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-brand-900 px-6 py-20 text-white">
      <div className="bg-hex-pattern pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-800 ring-1 ring-gold-400/30">
            <AiMark className="h-8 w-8 text-brand-300" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{t('Imtithal AI')}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t('An inspection assistant that understands the code')}</h2>
          <p className="mt-4 max-w-2xl text-brand-100/80">
            {t('The AI suggests, the engineer decides. Every suggestion is labelled, explained, and confirmed by an engineer.')}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title} className="rounded-2xl border border-brand-700/70 bg-brand-950/50 p-6 backdrop-blur">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={c.icon} />
                </svg>
              </span>
              <h3 className="mt-5 text-base font-semibold">{t(c.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-100/75">{t(c.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
