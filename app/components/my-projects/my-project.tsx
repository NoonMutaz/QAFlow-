'use client';

import { useState, useEffect, useMemo } from 'react';
import './openProjectAnimation.css';
import { useProjects, type Project } from '../../context/ProjectContext';
import { useQueueContext } from '../../context/QueueContext';
import { useAuthContext } from '../../context/AuthContext';
import { useProjectMembers } from '../../hooks/useProjectMembers';
import { useProjectActions } from '../../hooks/useProjectActions';
import InviteModal from './InviteModal';
import RemoveModal from './RemoveModal';
import MyProjectHeader from './MyProjectHeader';
import ProjectCard from './ProjectCard';
import CreateProjectForm from './EditProjectForm';

const projectTypes = ['QA Dashboard', 'Bug Tracking'];
const ITEMS_PER_PAGE = 6; // Adjust this number to change projects per page

const isOwner = (role?: string) => role === 'owner';
import { useQueries } from '@tanstack/react-query';

export function useProjectsQueue(projects: Project[]) {
  return useQueries({
    queries: projects.map((project) => ({
      queryKey: ['bugs', project.id],
      queryFn: async () => {
        const res = await fetch(`/api/projects/${project.id}/bugs`);
        if (!res.ok) throw new Error('Failed to fetch bugs');
        return res.json();
      },
      // ⏱️ Safely poll in the background every 5 seconds (or whatever interval you prefer)
      refetchInterval: 5000, 
      // Only run the query if we actually have projects loaded
      enabled: !!project.id,
    })),
  });
}
export default function MyProjects() {
  const { projects, deleteProject, handleOpenProject, isLoading, isOpeningProject, setIsOpeningProject } = useProjects();
  const { queue, fetchBugs } = useQueueContext();
  const { user } = useAuthContext();

  const [openModalId, setOpenModalId] = useState<number | null>(null);
  const [inviteModal, setInviteModal] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const {
    projectMembers, removingMemberId, updatingMemberId,
    setRemovingMemberId, setUpdatingMemberId,
    handleUpdateRole, handleRemoveMember,
  } = useProjectMembers(inviteModal);

  const {
    settingsModalProjectId, setSettingsModalProjectId,
    projectForm, setProjectForm, projectErrors,
    isProjectSubmitting, handleUpdateProject, handleSendInvite,
  } = useProjectActions();

  useEffect(() => { setIsOpeningProject(false); }, []);

  useEffect(() => {
    if (projects.length > 0) projects.forEach((p) => fetchBugs(String(p.id)));
  }, [projects, fetchBugs]);

  // Reset pagination to page 1 whenever the search filter terms alter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getProjectStatus = (projectId: string | number) => {
    const bugs = (queue?.[projectId] as Array<{ status: string }> | undefined) ?? [];
    const total = bugs.length;
    const fixed = bugs.filter((b) => b.status === 'fixed').length;
    if (total === 0) return { label: 'New', color: 'emerald' };
    if (fixed === total) return { label: 'Closed', color: 'green' };
    return { label: 'Active', color: total > 5 ? 'amber' : 'blue' };
  };

  const term = searchTerm.toLowerCase();
  
  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.type?.toLowerCase().includes(term)
    );
  }, [projects, term]);

  // Pagination Math calculations
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const startIndexDisplay = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndexDisplay = Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length);

  const openProjectSettings = (project: Project) => {
    if (!isOwner(project.role)) { alert('⚠️ Only owners can edit projects'); return; }
    setSettingsModalProjectId(project.id);
    setProjectForm({ name: project.name ?? '', description: project.description ?? '', type: project.type ?? 'QA Dashboard' });
  };

  const handleDeleteClick = (project: Project) => {
    if (!isOwner(project.role)) { alert('⚠️ Only owners can delete projects'); return; }
    setOpenModalId(project.id);
  };

  const handleInviteClick = (project: Project) => {
    if (!isOwner(project.role)) { alert('⚠️ Only owners can invite members'); return; }
    setInviteModal(project.id);
  };

  const currentProject = projects.find((p) => p.id === settingsModalProjectId);
  const deleteModalProject = projects.find((p) => p.id === openModalId);
  const inviteModalProject = projects.find((p) => p.id === inviteModal);
  const anyModalOpen = openModalId !== null || inviteModal !== null || settingsModalProjectId !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60">
      {anyModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => { setOpenModalId(null); setInviteModal(null); setSettingsModalProjectId(null); }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <MyProjectHeader  isLoading={isLoading} filteredProjects={filteredProjects} projects={projects} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        {/* Swapped filteredProjects directly with paginatedProjects slice mapping array */}
        <ProjectCard
          handleDeleteClick={handleDeleteClick}
          handleInviteClick={handleInviteClick}
          handleOpenProject={(projectId: number) => handleOpenProject(projectId)}
          openProjectSettings={openProjectSettings}
          isLoading={isLoading}
          filteredProjects={paginatedProjects}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          projects={projects}
          getProjectStatus={getProjectStatus}
          queue={queue}
          isOwner={isOwner}
        />

        {/* Pagination UI Controls Block Component layout */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200/60 bg-white/60 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm mt-4">
            {/* Mobile layout step elements buttons */}
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev - 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>

            {/* Desktop Full Pagination Layout Structure View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredProjects.length === 0 ? 0 : startIndexDisplay}</span> to{' '}
                  <span className="font-semibold text-gray-900">{endIndexDisplay}</span> of{' '}
                  <span className="font-semibold text-gray-900">{filteredProjects.length}</span> projects
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-xl shadow-xs gap-1" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-xl bg-white px-3 py-2 text-gray-400 border border-gray-200 hover:bg-gray-50 focus:z-20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        aria-current={currentPage === pageNumber ? 'page' : undefined}
                        className={`relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-600 text-white shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:z-20'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-xl bg-white px-3 py-2 text-gray-400 border border-gray-200 hover:bg-gray-50 focus:z-20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {isOpeningProject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 animate-scaleIn">
              <div className="h-12 w-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm text-gray-500">Opening project...</p>
                <p className="text-lg font-semibold">Please wait</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {openModalId !== null && deleteModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <RemoveModal
            removeQueue={async (id: string | number) => { await deleteProject(Number(id)); }}
            customer={{ id: Number(deleteModalProject.id), name: deleteModalProject.name }}
            onClose={() => setOpenModalId(null)}
          />
        </div>
      )}

      {inviteModal !== null && inviteModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <InviteModal
            isOpen={true}
            projectId={String(inviteModal)}
            customer={{ id: String(inviteModal), name: inviteModalProject.name }}
            currentUserId={user?.id ?? ''}
            members={projectMembers}
            removingMemberId={removingMemberId}
            updatingMemberId={updatingMemberId}
            setRemovingMemberId={setRemovingMemberId}
            setUpdatingMemberId={setUpdatingMemberId}
            onClose={() => setInviteModal(null)}
            onInvite={(email) => handleSendInvite(inviteModal, email)}
            onUpdateMember={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      )}

      <CreateProjectForm
        handleUpdateProject={handleUpdateProject}
        projectTypes={projectTypes}
        isProjectSubmitting={isProjectSubmitting}
        projectErrors={projectErrors}
        settingsModalProjectId={settingsModalProjectId}
        currentProject={currentProject}
        isOwner={isOwner}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        setSettingsModalProjectId={setSettingsModalProjectId}
      />
    </div>
  );
}