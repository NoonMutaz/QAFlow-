'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useProjects } from "../../context/ProjectContext";
import InviteModal from "../../components/InviteModal";
import RemoveModal from '../../components/RemoveModal';
import { useQueueContext } from "../../context/QueueContext";

export default function MyProjects() {
  const router = useRouter();
  const { projects, deleteProject, handleOpenProject, fetchProjects, isLoading } = useProjects();
  const { queue, fetchBugs } = useQueueContext();
  const [openModalId, setOpenModalId] = useState<number | null>(null);
  const [inviteModal, setInviteModal] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter projects based on search
  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const projectTypes = ["Web App", "Mobile App", "API Project"];

  const handleCreateProject = () => {
    router.push('/createProject');
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => fetchBugs(String(project.id)));
    }
  }, [projects]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
          <p className="text-gray-600">
            {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
            {isLoading && <span className="ml-2 text-green-600">• loading</span>}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:flex-row">
          <div className="relative flex-1 sm:w-72">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <svg 
              className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={handleCreateProject}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : filteredProjects.length === 0 && searchTerm ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-gray-500">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No results for "{searchTerm}"</h3>
            <p className="mb-6">Try a different search term</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-gray-500">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l6 6 6-6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p>Create your first project to get started</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              {/* Project Avatar */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {(project.name || '?')[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{project.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{project.description || 'No description'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Bugs</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {queue?.[project.id]?.length ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="px-3 py-1 bg-gray-100 text-xs font-medium rounded-full">
                    {project.type || 'General'}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`w-fit px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
                (queue?.[project.id]?.length ?? 0) === 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(queue?.[project.id]?.length ?? 0) === 0 ? 'New' : `${queue?.[project.id]?.length} Active`}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleOpenProject(project.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Open Project
                </button>
                <button
                  onClick={() => setInviteModal(project.id)}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Invite Team"
                >
                  👥
                </button>
                <button
                  onClick={() => setOpenModalId(project.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              {/* Modals */}
              {openModalId === project.id && (
                <RemoveModal
                  removeQueue={deleteProject}
                  customer={project}
                  onClose={() => setOpenModalId(null)}
                />
              )}
              {inviteModal === project.id && (
                <InviteModal
                  isOpen={true}
                  customer={project}
                  projectTypes={projectTypes}
                  onClose={() => setInviteModal(null)}
                  onSend={async (email) => {
                    const trimmedEmail = email?.trim();
                    if (!trimmedEmail || !trimmedEmail.includes('@')) {
                      alert('⚠️ Please enter valid email!');
                      return;
                    }
                    try {
                      const token = localStorage.getItem('token');
                      const API = process.env.NEXT_PUBLIC_API_URL!;
                      const res = await fetch(`${API}/api/projects/${project.id}/invite`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ email: trimmedEmail }),
                      });
                      if (res.status !== 200) {
                        const text = await res.text();
                        if (text.includes('already')) {
                          alert('ℹ️ User already invited');
                        } else {
                          alert(`❌ ${res.status}: ${text}`);
                        }
                        return;
                      }
                      alert('✅ Invite sent successfully!');
                      setInviteModal(null);
                    } catch (error) {
                      alert('❌ Network error');
                    }
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}