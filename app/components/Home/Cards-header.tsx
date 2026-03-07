import React from 'react'

export default function CardsHeader() {
  return (
    <div>
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
    </div>
  )
}
