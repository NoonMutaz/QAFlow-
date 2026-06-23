import Image from "next/image";

export default function AboutUsHero() {
  return (
    // Removed bg-white so the -z-10 background is actually visible
    // Added overflow-hidden to prevent canvas scrollbar issues
    <section className="relative py-4 px-6 overflow-hidden">
      
 

      <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
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

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href="/login"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-center"
            >
              Get Started
            </a>

            <a
              href="/contactus"
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-center backdrop-blur-sm bg-white/50" // Added slight blur/bg for readability over the canvas
            >
              Talk to us
            </a>
          </div>

          {/* Micro trust line */}
          <p className="mt-4 text-xs text-gray-400">
            Built for frontend teams, QA engineers, and product teams.
          </p>
        </div>

        {/* RIGHT - Product framing */}
        <div className="relative">
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
            <Image
              src="/QAdashboard.png"
              alt="QA dashboard preview"
              className="w-full object-cover"
              width={500}
              height={400}
              priority
            />
          </div>

          {/* Floating context card */}
          <div className="absolute -bottom-6 -left-6 bg-white border border-gray-100 shadow-lg rounded-xl p-4 w-48">
            <p className="text-xs text-gray-500">Live projects</p>
            <p className="text-lg font-semibold text-gray-900">QAFlow</p>
          </div>
        </div>

      </div>
    </section>
  );
}