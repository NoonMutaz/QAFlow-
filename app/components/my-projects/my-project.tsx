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
import { useQueries } from '@tanstack/react-query';

const projectTypes = ['QA Dashboard', 'Bug Tracking'];
const ITEMS_PER_PAGE = 6;

const isOwner = (role?: string) => role === 'owner';

export function useProjectsQueue(projects: Project[]) {
  return useQueries({
    queries: projects.map((project) => ({
      queryKey: ['bugs', project.id],
      queryFn: async () => {
        const res = await fetch(`/api/projects/${project.id}/bugs`);
        if (!res.ok) throw new Error('Failed to fetch bugs');
        return res.json();
      },
      refetchInterval: 5000,
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

  useEffect(() => { setIsOpeningProject(false); }, [setIsOpeningProject]);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-50/80 to-indigo-50/40 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Modal Overlay */}
      {anyModalOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => { setOpenModalId(null); setInviteModal(null); setSettingsModalProjectId(null); }}
        />
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-8">
        
        {/* Header Segment */}
        <div className="shrink-0">
          <MyProjectHeader 
            isLoading={isLoading} 
            filteredProjects={filteredProjects} 
            projects={projects} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
        </div>
        
        {/* Cards Grid Segment - Allows cards to grow and fill available space */}
        <div className="flex-1">
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
        </div>

        {/* Enhanced Pagination UI */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between border border-slate-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-sm">
            
            {/* Mobile Pagination Buttons */}
            <div className="flex w-full sm:hidden justify-between gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} // FIXED BUG HERE
                disabled={currentPage === totalPages}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                Next
              </button>
            </div>

            {/* Desktop Pagination Layout */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-900">{filteredProjects.length === 0 ? 0 : startIndexDisplay}</span> to{' '}
                  <span className="font-semibold text-slate-900">{endIndexDisplay}</span> of{' '}
                  <span className="font-semibold text-slate-900">{filteredProjects.length}</span> projects
                </p>
              </div>
              
              <div>
                <nav className="isolate inline-flex items-center gap-1.5" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-xl bg-white p-2 text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          aria-current={currentPage === pageNumber ? 'page' : undefined}
                          className={`relative inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            currentPage === pageNumber
                              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                              : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-xl bg-white p-2 text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
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
      </div>

      {/* Opening Project Loading Overlay */}
      {isOpeningProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md transition-opacity" />
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 border border-white/50 animate-in fade-in zoom-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping opacity-20"></div>
              <div className="h-14 w-14 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-slate-900 tracking-tight">Opening Workspace</p>
              <p className="text-sm font-medium text-slate-500">Preparing your project board...</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals Container */}
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