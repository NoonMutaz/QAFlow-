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
    text: 'Picks the clause from engineer-verified SBC clauses, and names the governing code from the official 28 codes.',
    icon: 'M9 12h6m-6 4h6M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z',
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
            {t('The AI suggests, the engineer decides. Every suggestion is labelled, explained, and linked to a verified source.')}
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
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
