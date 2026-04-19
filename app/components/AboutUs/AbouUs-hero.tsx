import React from "react";

export default function AboutUsHero() {
  return (
    <section className="relative py-4 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT - Message */}
        <div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            QA Workflow Platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
            A simpler way to manage{" "}
            <span className="text-blue-600">bugs and QA workflows</span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
            QAFlow helps teams track bugs, assign work, and monitor progress without spreadsheets, chaos, or lost context.
          </p>

          {/* Proof points */}
          <div className="mt-6 grid grid-cols-3 gap-4 max-w-md">
            <Stat value="Fast" label="Workflow" />
            <Stat value="Real-time" label="Tracking" />
            <Stat value="Clean" label="UI" />
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href="/signup"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-center"
            >
              Get Started
            </a>

            <a
              href="/contactus"
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-center"
            >
              Talk to us
            </a>
          </div>

          {/* Micro trust line */}
          <p className="mt-4 text-xs text-gray-400">
            Built for frontend teams, QA engineers, and product teams.
          </p>

        </div>

        {/* RIGHT - Product framing (not just image) */}
        <div className="relative">

          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
            <img
              src="https://datafloq.com/wp-content/uploads/2021/12/blog_pictures2FQuality_Assurance_Testing_8xXpzGg.jpg"
              alt="QA dashboard preview"
              className="w-full object-cover"
            />
          </div>

          {/* Floating context card (adds meaning to image) */}
          <div className="absolute -bottom-6 -left-6 bg-white border border-gray-100 shadow-lg rounded-xl p-4 w-48">
            <p className="text-xs text-gray-500">Live projects</p>
            <p className="text-lg font-semibold text-gray-900">QAFlow</p>
          </div>

        </div>

      </div>
    </section>
  );
}

/* --- small reusable piece --- */
function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}