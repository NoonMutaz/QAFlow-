import React from 'react'
import { useRouter } from 'next/navigation';


interface Props {
  isLoading: boolean;
  filteredProjects: any[];
  projects: any[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}



export default function MyProjectHeader({
  isLoading,
  filteredProjects,
  projects,
  searchTerm,
  setSearchTerm,
}: Props) {     const router = useRouter();
  return (
    <div>
       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5 text-blue-600">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  Loading...
                </span>
              ) : (
                `${filteredProjects.length} of ${projects.length} project${projects.length !== 1 ? 's' : ''}`
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
              />
            </div>

            <button
              onClick={() => router.push('/createProject')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              + New Project
            </button>
          </div>
        </div>
    </div>
  )
}
