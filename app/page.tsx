'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleCreateProject = () => {
    // Navigate to the dashboard (your current project page)
    router.push("/createProject"); // Adjust this route as per your project
  };

  const handleOpenProject = () => {
    // For now, navigate to dashboard too; can be extended to open project list
    router.push("/my-projects");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4">
      {/* Logo / Header */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-indigo-900 mb-2">QAFlow Project Hub</h1>
        <p className="text-lg text-indigo-700">Manage your QA projects efficiently</p>
      </header>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Create New Project */}
        <div
          onClick={handleCreateProject}
          className="cursor-pointer bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center justify-center gap-4 hover:shadow-2xl hover:scale-105 transition-transform"
        >
          <div className="w-16 h-16 flex items-center justify-center bg-indigo-100 rounded-full">
            <svg
              className="w-8 h-8 text-indigo-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-indigo-900">Create New Project</h2>
          <p className="text-sm text-indigo-600 text-center">
            Start a fresh QA project with automatic bug tracking, charts, and reports.
          </p>
        </div>

        {/* Open Existing Project */}
        <div
          onClick={handleOpenProject}
          className="cursor-pointer bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center justify-center gap-4 hover:shadow-2xl hover:scale-105 transition-transform"
        >
          <div className="w-16 h-16 flex items-center justify-center bg-purple-100 rounded-full">
            <svg
              className="w-8 h-8 text-purple-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7H3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-purple-900">Open Existing Project</h2>
          <p className="text-sm text-purple-600 text-center">
            Access your saved projects and continue your QA work seamlessly.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-sm text-indigo-500">
        &copy; 2026 QAFlow Project Hub. All rights reserved.
      </footer>
    </div>
  );
}