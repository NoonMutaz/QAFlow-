import React from 'react'

export default function ProjectCard({handleDeleteClick,handleInviteClick,handleOpenProject,openProjectSettings,isLoading,filteredProjects,searchTerm,setSearchTerm,projects,getProjectStatus,queue,isOwner}) {
  return (
    <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {isLoading ? (
                  Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="h-56 bg-white/70 rounded-2xl animate-pulse border border-gray-100 shadow-sm" />
                  ))
                ) : filteredProjects.length === 0 && searchTerm ? (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-gray-500 text-lg font-medium">No results for "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm("")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Clear</button>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">No Projects Yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Create your first project to get started</p>
                  </div>
                ) : (
                  filteredProjects.map(project => {
                    const status = getProjectStatus(project.id);
                    const bugCount = queue?.[project.id]?.length ?? 0;
                    const fixedCount = (queue?.[project.id] || []).filter((b: any) => b.status === 'fixed').length;
                    const isProjectOwner = isOwner(project.role);
      
                    return (
                      <div
                        key={project.id}
                        className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                              {(project.name || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 truncate">{project.name}</h3>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{project.description || 'No description'}</p>
                            </div>
                          </div>
                          
                          {/*   Role Badge */}
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isProjectOwner 
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {isProjectOwner ? 'Owner' : '👤Member'}
                          </span>
                        </div>
      
                        {/* Status pill */}
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold mb-5 block ${
                          status.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                          status.color === 'green' ? 'bg-green-100 text-green-700' :
                          status.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {status.label}
                        </span>
      
                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                            <p className="text-xl font-bold text-gray-900">{bugCount}</p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                          <div className="bg-red-50 rounded-xl p-2.5 text-center">
                            <p className="text-xl font-bold text-red-600">{bugCount - fixedCount}</p>
                            <p className="text-xs text-red-400">Open</p>
                          </div>
                          <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                            <p className="text-xl font-bold text-emerald-600">{fixedCount}</p>
                            <p className="text-xs text-emerald-400">Fixed</p>
                          </div>
                        </div>
      
                        {/* Type badge */}
                        <div className="mb-5">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                            {project.type || 'General'}
                          </span>
                        </div>
      
                        {/*   OWNER-ONLY Actions */}
                        <div className="mt-auto flex flex-wrap gap-1.5">
                          <button
                            onClick={() => handleOpenProject(project.id)}
                            className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[60px]"
                          >
                            Open
                          </button>
                          
                   {/* ✅ Owner/Member buttons - ALWAYS SHOW, DISABLED for members */}
      <div className="mt-auto flex flex-wrap gap-1.5">
       
        
        {/*   ALWAYS SHOW - Disabled for non-owners */}
        <button
          onClick={() => handleInviteClick(project)}
          disabled={!isProjectOwner}
          className={`p-2 rounded-xl transition-all flex items-center justify-center hover:scale-110 ${
            isProjectOwner
              ? 'text-gray-500 hover:text-purple-600 hover:bg-purple-50 shadow-sm hover:shadow-md'
              : 'text-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
          }`}
          title={isProjectOwner ? "Invite members" : "Only owners can invite members"}
        >
          👥
        </button>
        
        <button
          onClick={() => openProjectSettings(project)}
          disabled={!isProjectOwner}
          className={`p-2 rounded-xl transition-all flex items-center justify-center hover:scale-110 ${
            isProjectOwner
              ? 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm hover:shadow-md'
              : 'text-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
          }`}
          title={isProjectOwner ? "Edit project" : "Only owners can edit projects"}
        >
          ⚙️
        </button>
        
        <button
          onClick={() => handleDeleteClick(project)}
          disabled={!isProjectOwner}
          className={`p-2 rounded-xl transition-all flex items-center justify-center hover:scale-110 ${
            isProjectOwner
              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50 shadow-sm hover:shadow-md'
              : 'text-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
          }`}
          title={isProjectOwner ? "Delete project" : "Only owners can delete projects"}
        >
          🗑️
        </button>
      </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
   
  )
}
