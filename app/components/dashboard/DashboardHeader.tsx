import React from 'react'

export default function DashboardHeader({project,id,queue}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {project.name || "QA Dashboard"}
            </h1>
            <div className="w-full">
              <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1 leading-snug break-words">
                {project.description ||
                  "Monitor bugs, test cases, and status in real time"}
              </p>
            </div>
           
 </div>
           <div className="flex items-center gap-3">
       
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-2xl font-bold text-purple-600">
                {(queue[id] || []).filter((c) => c.status === "in-progress").length}
              </p>
            </div>
          </div>
    </div>
  )
}
