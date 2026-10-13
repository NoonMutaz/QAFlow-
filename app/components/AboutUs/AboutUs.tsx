"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Brand mark (shield + check). Same artwork as the header and /logo.svg.     */
/* -------------------------------------------------------------------------- */
function LogoMark({ className = "h-12 w-12" }: { className?: string }) {
  return (
       <div
      className={`relative rounded-xl overflow-hidden    flex items-center justify-center     ${className}`}
    >
      <Image
        src="/logo.png"
        alt="Imtithal Logo"
        width={180}
        height={180}
        className="w-full h-full object-contain  "
        priority
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function AboutUs() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Hero />
      <HowItWorks />
      <Capabilities />
      <MissionVision />
      <Values />
      <Team />
      <CallToAction />
    </main>
  );
}

/* ------------------------------- 1. Hero ---------------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(60rem 30rem at 85% -10%, rgba(16,185,129,0.12), transparent 60%), radial-gradient(40rem 24rem at -5% 110%, rgba(15,23,42,0.06), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <LogoMark className="h-16 w-16" />
            <div className="leading-none">
              <p className="text-2xl font-extrabold text-slate-900">امتثال</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Imtithal
              </p>
            </div>
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Inspection &amp; compliance platform for the Saudi Building Code
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
            Every finding linked to its <span className="text-brand-600">SBC clause</span>, every fix backed by evidence
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Imtithal is an inspection platform for the Saudi Building Code. Engineers log site findings from a photo or
            a few words, AI suggests the matching SBC clause, and each non-conformity is tracked until it is fixed and
            verified with evidence.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-brand-600 px-6 py-3 text-center font-semibold text-white shadow-sm shadow-brand-900/10 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Get started
            </Link>
            <Link
              href="/contactus"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              Talk to us
            </Link>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Built for inspectors, consultants, contractors and project managers.
          </p>
        </div>

        <StagePreview />
      </div>
    </section>
  );
}

/** Illustrative product preview, built in markup so it needs no image asset. */
function StagePreview() {
  const items = [
    { name: "Exit door padlocked", clause: "SBC 201 · Exit doors", state: "notFixed" },
    { name: "Missing stair handrail", clause: "SBC 201 · Guards", state: "inProgress" },
    { name: "Extinguisher blocked", clause: "SBC 801 · Fire extinguishers", state: "fixed" },
  ] as const;

  const styles = {
    fixed: { label: "Fixed", dot: "bg-brand-500", chip: "bg-brand-50 text-brand-700 border-brand-200" },
    inProgress: { label: "In progress", dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700 border-violet-200" },
    notFixed: { label: "Not fixed", dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200" },
  } as const;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-3">
          <div className="flex items-center gap-2 text-slate-100">
            <LogoMark className="h-5 w-5" />
            <span className="text-sm font-semibold">Block B · Site inspection</span>
          </div>
          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-300">
            3 findings
          </span>
        </div>

        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const s = styles[item.state];
            return (
              <li key={item.name} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">{item.name}</span>
                    <span className="block text-xs text-slate-500">{item.clause}</span>
                  </span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.chip}`}>{s.label}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <svg className="h-5 w-5 shrink-0 text-brand-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2z" />
          </svg>
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Clauses suggested by AI,</span> confirmed by the engineer.
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-400">Illustrative preview</p>
    </div>
  );
}

/* ---------------------------- 2. How it works ----------------------------- */
function HowItWorks() {
  const steps = [
    {
      title: "Set up",
      text: "Create a project, add the SBC clauses that apply to it, and invite the team with the right roles.",
    },
    {
      title: "Capture",
      text: "On site, take a photo or describe the issue. AI writes the finding and flags similar ones already reported.",
    },
    {
      title: "Link",
      text: "AI suggests the matching SBC clause and its required standard. The engineer confirms or picks another.",
    },
    {
      title: "Resolve",
      text: "The responsible person fixes the issue and uploads evidence; progress shows on the project dashboard.",
    },
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="How it works" title="One traceable path, from site to closure" />
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-brand-400">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ----------------------------- 3. Capabilities ---------------------------- */
function Capabilities() {
  const items = [
    {
      title: "AI clause suggestions",
      text: "As you write a finding, AI ranks the project's SBC clauses and proposes the right one, in Arabic or English.",
    },
    {
      title: "Photo analysis",
      text: "Upload a site photo and AI describes the violation, ready for the engineer to review.",
    },
    {
      title: "Similar-finding alerts",
      text: "Imtithal flags findings that were already recorded, so teams avoid duplicate reports.",
    },
    {
      title: "Dashboards & export",
      text: "Status and risk charts per project, role-based access, and export to Excel for reporting.",
    },
  ];

  return (
    <section className="border-y border-slate-200 bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Capabilities" title="Less lookup, more inspection" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-2 bg-white p-6">
              <span className="mb-1 h-1 w-8 rounded-full bg-brand-500" />
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- 4. Mission & vision -------------------------- */
function MissionVision() {
  const cards = [
    {
      title: "Our mission",
      text: "To make engineering inspection traceable and verifiable: every finding linked to its requirement, every closure backed by evidence.",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      title: "Our vision",
      text: "A construction workflow where every non-conformity is closed because it was verified, and the record can be reviewed by anyone who needs it.",
      icon: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Purpose" title="Why Imtithal exists" />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- 5. Values ------------------------------- */
function Values() {
  const values = [
    {
      title: "Traceability",
      text: "From requirement to inspection item to finding to closure, nothing loses its context.",
    },
    {
      title: "Accountability",
      text: "Clear roles and a recorded history of who raised, fixed and verified each item.",
    },
    {
      title: "Clarity",
      text: "One shared record for the inspector, the contractor and the project manager.",
    },
  ];

  return (
    <section className="border-t border-slate-200 bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Values" title="Principles behind the product" align="left" />
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {values.map((v, i) => (
            <div key={v.title} className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-brand-600">0{i + 1}</span>
              <h3 className="text-lg font-semibold text-slate-900">{v.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{v.text}</p>
              <div className="mt-1 h-px w-12 bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- 6. Team -------------------------------- */
function Team() {
  const members = [
    {
      name: "Noon Almutaz",
      role: "Software Engineer",
      link: "https://www.linkedin.com/in/noon-almutaz-059a61267",
    },
    {
      name: "Madawi Altimyat",
      role: "QA Engineer",
      link: "https://www.linkedin.com/ ",
    },
        {
      name: "Lina Mohamed",
      role: "Architecture Engineer",
      link: "https://www.linkedin.com/ ",
    },
  ];

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Team" title="Software, QA and architecture, in one team" />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {members.map((m) => (
            <div
              key={m.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-brand-200 bg-gradient-to-br from-brand-50 to-slate-100 text-xl font-bold text-brand-700"
                aria-hidden="true"
              >
                {initials(m.name)}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{m.name}</h3>
              <p className="text-sm text-slate-500">{m.role}</p>
              {m.link.includes("/in/") && (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-9 items-center rounded-md bg-slate-100 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  LinkedIn
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- CTA ---------------------------------- */
function CallToAction() {
  return (
    <section className="bg-slate-900 px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <LogoMark className="h-14 w-14" />
        <h2 className="text-2xl font-bold text-white md:text-3xl">Run your next site inspection on Imtithal</h2>
        <p className="max-w-xl text-slate-400">
          Start with one project and one team, and see every finding through to a verified fix.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          >
            Get started
          </Link>
          <Link
            href="/contactus"
            className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Shared pieces ----------------------------- */
function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{title}</h2>
    </div>
  );
}