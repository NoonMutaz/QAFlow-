'use client';

import Link from 'next/link';
import { useLanguage } from '../../i18n/LanguageProvider';
import { AiMark } from '../ui/Ai';

/* Home page story sections: facts, the problem, audiences, trust and the closing call to action.
   Every figure here is a fact about the product, not a measured result. */

const Icon = ({ d, className = 'h-5 w-5' }: { d: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{t(eyebrow)}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t(title)}</h2>
      {text && <p className="mt-4 text-slate-600 leading-relaxed">{t(text)}</p>}
    </div>
  );
}

/** Facts strip under the hero. */
export function FactsStrip() {
  const { t } = useLanguage();
  const facts = [
    { value: '28', label: 'SBC 2024 codes recognised' },
    { value: '2', label: 'Languages: Arabic and English' },
    { value: '4', label: 'Steps from site photo to verified fix' },
    { value: '100%', label: 'Of fixes closed with photo evidence and owner approval' },
  ];
  return (
    <section className="border-b border-brand-100 bg-white px-6 py-10">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="text-center">
            <dt className="text-3xl font-bold text-brand-700 md:text-4xl">{f.value}</dt>
            <dd className="mt-1 text-sm text-slate-600">{t(f.label)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** "Why Imtithal?": the problems on site today. */
export function Challenge() {
  const { t } = useLanguage();
  const problems = [
    {
      title: 'Manual code lookup',
      text: 'For every finding, the engineer searches long code volumes for the right clause. It is slow, and the result differs from one engineer to another.',
      icon: 'M12 6.25v13M12 6.25C10.83 5.48 9.25 5 7.5 5S4.17 5.48 3 6.25v13C4.17 18.48 5.75 18 7.5 18s3.33.48 4.5 1.25m0-13C13.17 5.48 14.75 5 16.5 5s3.33.48 4.5 1.25v13C19.83 18.48 18.25 18 16.5 18s-3.33.48-4.5 1.25',
    },
    {
      title: 'Scattered evidence',
      text: 'Site photos sit in phones and chat groups, separated from the finding and from the requirement it breaks.',
      icon: 'M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z M12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
    },
    {
      title: 'Duplicated findings',
      text: 'The same issue is reported more than once by different people, which inflates reports and wastes follow-up time.',
      icon: 'M8 7h10a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z M4 15V5a2 2 0 012-2h10',
    },
    {
      title: 'Closed without proof',
      text: 'A finding is marked as fixed by changing its status, with no evidence of the fix and no one verifying it.',
      icon: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
    },
  ];
  return (
    <section className="bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Why Imtithal?"
          title="Site inspection still runs on paper notes and memory"
          text="Building code compliance decides whether a building is safe to use, yet the inspection work behind it is still largely manual."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Icon d={p.icon} />
              </span>
              <h3 className="mt-5 text-base font-semibold text-slate-900">{t(p.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(p.text)}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-center text-sm font-medium text-brand-900">
          <AiMark className="h-5 w-5 shrink-0 text-brand-600" />
          {t('Imtithal turns each finding into one record: the photo, the description, the exact SBC clause, the person responsible and the proof of the fix.')}
        </p>
      </div>
    </section>
  );
}

/** "Who it's for". */
export function Audiences() {
  const { t } = useLanguage();
  const audiences = [
    {
      title: 'Site engineers and inspectors',
      text: 'Log a finding from a photo in seconds, already linked to the right clause, in Arabic or English.',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
      title: 'Engineering offices and consultants',
      text: 'One verified clause library for all projects, and consistent, traceable inspection records.',
      icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h1m-1 4h1m4-4h1m-1 4h1M9 21v-4h6v4',
    },
    {
      title: 'Contractors',
      text: 'A clear requirement for every finding, and a simple way to submit a photo of the fix.',
      icon: 'M11.4 3.9a2 2 0 013.2 0l.3.5a2 2 0 002 .9l.6-.1a2 2 0 012.3 2.3l-.1.6a2 2 0 00.9 2l.5.3a2 2 0 010 3.2l-.5.3a2 2 0 00-.9 2l.1.6a2 2 0 01-2.3 2.3l-.6-.1a2 2 0 00-2 .9l-.3.5a2 2 0 01-3.2 0l-.3-.5a2 2 0 00-2-.9l-.6.1a2 2 0 01-2.3-2.3l.1-.6a2 2 0 00-.9-2l-.5-.3a2 2 0 010-3.2l.5-.3a2 2 0 00.9-2l-.1-.6A2 2 0 017.5 5.3l.6.1a2 2 0 002-.9l.3-.5zM13 12a1 1 0 11-2 0 1 1 0 012 0z',
    },
    {
      title: 'Project owners',
      text: 'Approve fixes by comparing before and after photos, and follow compliance progress on the dashboard.',
      icon: 'M9 12l2 2 4-4M7.8 4.7a3.4 3.4 0 001.9-.8 3.4 3.4 0 014.6 0 3.4 3.4 0 001.9.8 3.4 3.4 0 013.1 3.1c.1.7.3 1.4.8 1.9a3.4 3.4 0 010 4.6 3.4 3.4 0 00-.8 1.9 3.4 3.4 0 01-3.1 3.1 3.4 3.4 0 00-1.9.8 3.4 3.4 0 01-4.6 0 3.4 3.4 0 00-1.9-.8 3.4 3.4 0 01-3.1-3.1 3.4 3.4 0 00-.8-1.9 3.4 3.4 0 010-4.6c.5-.5.7-1.2.8-1.9a3.4 3.4 0 013.1-3.1z',
    },
  ];
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="Who it's for" title="One platform for everyone on site" />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {audiences.map((a) => (
            <div key={a.title} className="flex gap-5 rounded-2xl border border-slate-200 p-6 transition hover:border-brand-300 hover:shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
                <Icon d={a.icon} className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{t(a.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t(a.text)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** "AI you can trust". */
export function Trust() {
  const { t } = useLanguage();
  const points = [
    { title: 'The engineer decides', text: 'The AI only suggests. Every suggestion is labelled, explained with a reason and a confidence level, and confirmed by an engineer.' },
    { title: 'Verified sources', text: 'Clauses come from a library checked by engineers, with their name and the date. When the AI proposes a clause itself, it is clearly marked as not verified.' },
    { title: 'Proof before closure', text: 'A finding is closed only after a photo of the fix is uploaded and the project owner approves it.' },
    { title: 'Clear roles', text: 'Owners, members and viewers each see and do only what their role allows.' },
  ];
  return (
    <section className="border-y border-brand-100 bg-brand-50/60 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Trust"
          title="AI you can trust on a construction site"
          text="In building safety, a wrong reference is costly. Imtithal is designed so that people stay accountable and every decision has evidence."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, i) => (
            <div key={p.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
              <span className="text-sm font-bold text-gold-500">0{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{t(p.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(p.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Closing call to action. */
export function FinalCta() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-brand-950 px-6 py-20 text-white">
      <div className="bg-hex-pattern pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <AiMark className="h-12 w-12 text-brand-300" />
        <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">{t('Make your next inspection smarter')}</h2>
        <p className="mt-4 text-brand-100/80">
          {t('Start with one project and one team, and see how much faster findings move from the site to a verified fix.')}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/createProject" className="rounded-xl bg-gold-400 px-6 py-3.5 font-semibold text-brand-950 shadow-lg shadow-gold-500/20 transition hover:bg-gold-300">
            {t('Start an inspection project')}
          </Link>
          <Link href="/sbc-library" className="rounded-xl border border-brand-700 bg-brand-900/60 px-6 py-3.5 font-semibold text-brand-100 transition hover:border-brand-500 hover:bg-brand-800">
            {t('Browse the SBC Library')}
          </Link>
        </div>
      </div>
    </section>
  );
}
