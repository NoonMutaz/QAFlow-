"use client";
import Image from "next/image";
import React, { useId } from "react";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Brand mark (shield + check). Same artwork as the header and /logo.svg.     */
/* -------------------------------------------------------------------------- */
function LogoMark({ className = "w-15 h-15  " }: { className?: string }) {
  //const gid = `imt-${useId().replace(/:/g, "")}`;
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
            <LogoMark className="h-72 w-72" />
            <div className="leading-none">
              <p className="text-2xl font-extrabold text-slate-900">امتثال</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Imtithal
              </p>
            </div>
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Inspection &amp; compliance platform for the Saudi Building Code
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
            Close every stage on <span className="text-emerald-600">verified evidence</span>, not on a status change
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Imtithal turns Saudi Building Code requirements into stage checklists. Every non-conformity is tied to its
            requirement, resolved with evidence, and verified by the inspector before a stage can close.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-emerald-600 px-6 py-3 text-center font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
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
    { name: "Door clear opening", state: "verified" },
    { name: "Corridor clear height", state: "pending" },
    { name: "Exit signage placement", state: "nonconformity" },
  ] as const;

  const styles = {
    verified: { label: "Verified", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pending: { label: "Pending verification", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200" },
    nonconformity: { label: "Non-conformity", dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200" },
  } as const;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-3">
          <div className="flex items-center gap-2 text-slate-100">
            <LogoMark className="h-5 w-5" />
            <span className="text-sm font-semibold">Architectural handover</span>
          </div>
          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-300">
            Stage 2
          </span>
        </div>

        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const s = styles[item.state];
            return (
              <li key={item.name} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  <span className="text-sm font-medium text-slate-800">{item.name}</span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.chip}`}>{s.label}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <svg className="h-5 w-5 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path strokeLinecap="round" d="M8 11V8a4 4 0 118 0v3" />
          </svg>
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Stage locked.</span> Mandatory items are still open.
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
      title: "Define",
      text: "Turn selected Saudi Building Code requirements into stage checklists, prepared and reviewed by engineers.",
    },
    {
      title: "Inspect",
      text: "Record a non-conformity against the exact checklist item, with its location and supporting evidence.",
    },
    {
      title: "Resolve",
      text: "The responsible party corrects the issue and uploads proof. Changing a status alone never closes it.",
    },
    {
      title: "Verify",
      text: "The inspector re-checks and closes. A stage locks only when its mandatory items are closed.",
    },
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="How it works" title="One traceable path, from requirement to closure" />
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-emerald-400">
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
      title: "Code-linked checklists",
      text: "Every inspection item points to the requirement it verifies, so findings stay tied to the code.",
    },
    {
      title: "Verified closure",
      text: "Evidence and inspector approval are required before an observation closes. Roles control who can do what.",
    },
    {
      title: "Similar-observation alerts",
      text: "While you write a finding, Imtithal flags similar ones already recorded, so teams avoid duplicate reports.",
    },
    {
      title: "Documented stage reports",
      text: "Results, corrective actions and evidence are compiled into a stage report with dates and names.",
    },
  ];

  return (
    <section className="border-y border-slate-200 bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Capabilities" title="Built around closure you can defend" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-2 bg-white p-6">
              <span className="mb-1 h-1 w-8 rounded-full bg-emerald-500" />
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
      text: "A project workflow where a stage is closed because it was verified, and where the record can be reviewed by anyone who needs it.",
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
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
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
              <span className="text-sm font-semibold text-emerald-600">0{i + 1}</span>
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
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow="Team" title="Built by a focused engineering team" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {members.map((m) => (
            <div
              key={m.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-gradient-to-br from-emerald-50 to-slate-100 text-xl font-bold text-emerald-700"
                aria-hidden="true"
              >
                {initials(m.name)}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{m.name}</h3>
              <p className="text-sm text-slate-500">{m.role}</p>
              <a
                href={m.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-9 items-center rounded-md bg-slate-100 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                LinkedIn
              </a>
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
        <LogoMark className="h-32 w-32" />
        <h2 className="text-2xl font-bold text-white md:text-3xl">Run your next inspection stage on Imtithal</h2>
        <p className="max-w-xl text-slate-400">
          Start with one stage, one checklist and one team, and see every item through to verified closure.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
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
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{title}</h2>
    </div>
  );
}