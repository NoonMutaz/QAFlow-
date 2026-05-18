'use client';

import { useState, useEffect } from 'react';
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

const isOwner = (role?: string) => role === 'owner';

export default function MyProjects() {
  const { projects, deleteProject, handleOpenProject, isLoading, isOpeningProject, setIsOpeningProject } = useProjects();
  const { queue, fetchBugs } = useQueueContext();
  const { user } = useAuthContext();

  const [openModalId, setOpenModalId] = useState<number | null>(null);
  const [inviteModal, setInviteModal] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getProjectStatus = (projectId: string | number) => {
    const bugs = (queue?.[projectId] as Array<{ status: string }> | undefined) ?? [];
    const total = bugs.length;
    const fixed = bugs.filter((b) => b.status === 'fixed').length;
    if (total === 0) return { label: 'New', color: 'emerald' };
    if (fixed === total) return { label: 'Closed', color: 'green' };
    return { label: 'Active', color: total > 5 ? 'amber' : 'blue' };
  };

  const term = searchTerm.toLowerCase();
  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(term) ||
    p.description?.toLowerCase().includes(term) ||
    p.type?.toLowerCase().includes(term)
  );

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
        <MyProjectHeader isLoading={isLoading} filteredProjects={filteredProjects} projects={projects} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <ProjectCard
          handleDeleteClick={handleDeleteClick}
          handleInviteClick={handleInviteClick}
          handleOpenProject={(projectId: number) => handleOpenProject(projectId)}
          openProjectSettings={openProjectSettings}
          isLoading={isLoading}
          filteredProjects={filteredProjects}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          projects={projects}
          getProjectStatus={getProjectStatus}
          queue={queue}
          isOwner={isOwner}
        />

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