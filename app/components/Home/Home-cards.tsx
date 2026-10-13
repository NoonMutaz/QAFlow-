'use client';

import Link from "next/link";
import { useLanguage } from "../../i18n/LanguageProvider";

const actions = [
  {
    href: "/createProject",
    title: "New inspection project",
    text: "Set up a project, add its SBC clauses, and invite your team.",
    cta: "Create project",
    icon: "M12 5v14m7-7H5",
    accent: "bg-brand-600 group-hover:bg-brand-500",
    ring: "hover:border-brand-400",
  },
  {
    href: "/my-projects",
    title: "My projects",
    text: "Open active projects, log findings, and follow non-conformities to closure.",
    cta: "Open projects",
    icon: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
    accent: "bg-slate-900 group-hover:bg-slate-800",
    ring: "hover:border-slate-400",
  },
];

/** Quick actions into the app, shown at the bottom of the home page. */
export default function HomeCard() {
  const { t } = useLanguage();
  return (
    <section className="border-t border-slate-200 bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{t("Get to work")}</h2>
          <p className="mt-3 text-slate-600">{t("Jump straight into a project.")}</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`group flex items-start gap-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${a.ring} focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white transition ${a.accent}`}>
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={a.icon} />
                </svg>
              </span>
              <span className="flex-1">
                <span className="block text-lg font-semibold text-slate-900">{t(a.title)}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-600">{t(a.text)}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  {t(a.cta)}
                  <span aria-hidden="true" className="transition group-hover:translate-x-0.5 rtl:rotate-180">→</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
