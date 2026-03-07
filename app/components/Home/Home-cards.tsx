import React from 'react'
import { useRouter } from "next/navigation";
export default function HomeCard() {

  const router = useRouter();

  const handleCreateProject = () => {
    router.push("/createProject");
  };

  const handleOpenProject = () => {
    router.push("/my-projects");
  };


  return (
    <div>
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

    </div>
  )
}
