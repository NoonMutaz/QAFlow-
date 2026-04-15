'use client';

import { useRouter } from "next/navigation";

export default function HomeCard() {
  const router = useRouter();

  return (
    <section className="px-6 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">

        {/* Create Project */}
        <button
          onClick={() => router.push("/createProject")}
          className="group text-left rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 p-8 shadow-sm
                     hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex gap-5 items-start">

            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white
                            group-hover:scale-105 transition-transform">
              +
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Create New Project
              </h3>

              <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                Start a fresh QA project with bug tracking, analytics, and reports.
              </p>

              <span className="mt-3 inline-block text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition">
                Start now →
              </span>
            </div>

          </div>
        </button>

        {/* Open Projects */}
        <button
          onClick={() => router.push("/my-projects")}
          className="group text-left rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 p-8 shadow-sm
                     hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <div className="flex gap-5 items-start">

            <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center text-white
                            group-hover:scale-105 transition-transform">
              →
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                Open Existing Project
              </h3>

              <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                Continue working on your saved QA projects anytime.
              </p>

              <span className="mt-3 inline-block text-sm font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition">
                Browse projects →
              </span>
            </div>

          </div>
        </button>

      </div>
    </section>
  );
}