'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleCreateProject = () => {
    router.push("/createProject");
  };

  const handleOpenProject = () => {
    router.push("/my-projects");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex flex-col">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-100 shadow-sm mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-indigo-700">Welcome to QAFlow</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Building the Future of{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              QA Excellence
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Our mission is to provide an intuitive QA dashboard for software teams, making bug tracking and project monitoring simple, efficient, and beautiful.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started
            </button>
            <a
              href="/features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Header Section */}
      <header className="relative py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100/50 rounded-full mb-4">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-indigo-700">Your Project Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            QAFlow Project Hub
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your QA projects efficiently with powerful tools and seamless workflows.
          </p>
        </div>
      </header>

      {/* Action Cards */}
      <div className="relative px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
          
          {/* Create New Project Card */}
          <div
            onClick={handleCreateProject}
            className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 border border-gray-100 hover:border-indigo-200 hover:-translate-y-2"
          >
            <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Create New Project
            </h2>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Start a fresh QA project with automatic bug tracking, charts, and reports.
            </p>
            <div className="mt-2 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Start Now →
            </div>
          </div>

          {/* Open Existing Project Card */}
          <div
            onClick={handleOpenProject}
            className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-2"
          >
            <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7H3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
              Open Existing Project
            </h2>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Access your saved projects and continue your QA work seamlessly.
            </p>
            <div className="mt-2 text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Browse Projects →
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview Section */}


      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            &copy; 2026 QAFlow Project Hub. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}