'use client';

import React from 'react';
import { useLanguage } from '../../i18n/LanguageProvider';

const steps = [
  {
    title: 'Capture',
    text: 'Take a photo on site, or type what you see, in Arabic or English.',
    icon: 'M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z M12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  },
  {
    title: 'AI describes it',
    text: 'AI writes the site finding from the photo and flags similar issues already reported.',
    icon: 'M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z',
  },
  {
    title: 'Link the SBC clause',
    text: 'AI suggests the matching clause from your project; the required standard fills in. The engineer confirms.',
    icon: 'M9 12h6m-6 4h6M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z',
  },
  {
    title: 'Fix & verify',
    text: 'Assign it, track the corrective action with evidence, and report progress on the dashboard.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

/** "How it works" section of the home page. */
export default function CardsHeader() {
  const { t } = useLanguage();
  return (
    <section id="how-it-works" className="scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{t("How it works")}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {t("From the site to a verified fix, in four steps")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            {t("Today the engineer searches the code by hand for every finding. Imtithal finds the clause for them, so they can focus on the site.")}
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={step.icon} />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-slate-300">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-900">{t(step.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(step.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
