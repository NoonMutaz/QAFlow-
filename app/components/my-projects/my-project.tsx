'use client';

import { useState, useEffect, useCallback } from 'react';
import './openProjectAnimation.css';
import { useProjects, type Project } from '../../context/ProjectContext';
import InviteModal from './InviteModal';
import RemoveModal from './RemoveModal';
import { useQueueContext } from '../../context/QueueContext';
import MyProjectHeader from './MyProjectHeader';
import ProjectCard from './ProjectCard';
import { useAuthContext } from '../../context/AuthContext';
import CreateProjectForm from './EditProjectForm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  userId: string;
  email: string;
  role: 'owner' | 'member' | 'viewer';
  joinedAt: string;
}

// ─── SSR-safe token helper ────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

function authHeaders(contentType = false): HeadersInit {
  const token = getToken();
  return {
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyProjects() {
  const {
    projects,
    deleteProject,
    handleOpenProject,
    fetchProjects,
    isLoading,
    updateProject,
    isOpeningProject,
setIsOpeningProject
  } = useProjects();
  const { queue, fetchBugs } = useQueueContext();
  const { user } = useAuthContext();

  const [openModalId, setOpenModalId] = useState<number | null>(null);
  const [inviteModal, setInviteModal] = useState<number | null>(null);
  const [settingsModalProjectId, setSettingsModalProjectId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectForm, setProjectForm] = useState({ name: '', description: '', type: '' });
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});
  const [isProjectSubmitting, setIsProjectSubmitting] = useState(false);

  // Member management
const [projectMembers, setProjectMembers] = useState<Member[]>([]);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const projectTypes = [
    'QA Dashboard',
    'Bug Tracking',
    'Test Management',
    'Performance Testing',
    'Web App',
    'Mobile App',
    'API Project',
  ];

  // ── Fetch members ────────────────────────────────────────────────────────────

  const fetchProjectMembers = useCallback(async (projectId: number): Promise<void> => {
    if (!projectId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/members`,
        { headers: authHeaders() },
      );
      if (res.ok) {
        const members: Member[] = await res.json();
        setProjectMembers(members);
      } else {
        console.error('Failed to fetch members:', await res.text());
      }
    } catch (e) {
      console.error('Network error fetching members:', e);
    }
  }, []);

  // ── Update role ──────────────────────────────────────────────────────────────

  const handleUpdateRole = async (userId: string, role: Member['role']): Promise<void> => {
    if (!inviteModal || !user) return;

    if (String(userId) === String(user.id)) {
      alert('⚠️ You cannot change your own role');
      return;
    }

    setUpdatingMemberId(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/members/${userId}`,
        {
          method: 'PATCH',
          headers: authHeaders(true),
          body: JSON.stringify({ role }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        console.error('API Error:', text);
        alert(`❌ Update failed: ${text}`);
        return;
      }
      await fetchProjectMembers(inviteModal);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // ── Remove member ────────────────────────────────────────────────────────────

  const handleRemoveMember = async (userId: string): Promise<void> => {
    if (!inviteModal) return;
    setRemovingMemberId(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/members/${userId}`,
        { method: 'DELETE', headers: authHeaders() },
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      setProjectMembers((prev) => prev.filter((m) => m.userId !== userId));
      alert('✅ Member removed!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Remove failed:', message);
      alert(`❌ ${message}`);
    } finally {
      setRemovingMemberId(null);
    }
  };

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (inviteModal !== null) {
      void fetchProjectMembers(inviteModal);
    } else {
      setProjectMembers([]);
    }
  }, [inviteModal, fetchProjectMembers]);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach((project) => fetchBugs(String(project.id)));
    }
  }, [projects, fetchBugs]);

 
  const getProjectStatus = (
    projectId: string | number,
  ): { label: string; color: string } => {
    const bugs = (queue?.[projectId] as Array<{ status: string }> | undefined) ?? [];
    const total = bugs.length;
    const fixed = bugs.filter((b) => b.status === 'fixed').length;
    if (total === 0) return { label: 'New', color: 'emerald' };
    if (fixed === total) return { label: 'Closed', color: 'green' };
    return { label: 'Active', color: total > 5 ? 'amber' : 'blue' };
  };

  const isOwner = (projectRole?: string): boolean => projectRole === 'owner';

  const term = searchTerm.toLowerCase();
  const filteredProjects = projects.filter(
    (project) =>
      project.name?.toLowerCase().includes(term) ||
      project.description?.toLowerCase().includes(term) ||
      project.type?.toLowerCase().includes(term),
  );

  // ── Actions ──────────────────────────────────────────────────────────────────

  const openProjectSettings = (project: Project): void => {
    if (!isOwner(project.role)) {
      alert('⚠️ Only owners can edit projects');
      return;
    }
    setSettingsModalProjectId(project.id);
    setProjectForm({
      name: project.name ?? '',
      description: project.description ?? '',
      type: project.type ?? 'QA Dashboard',
    });
    setProjectErrors({});
  };

  const handleDeleteClick = (project: Project): void => {
    if (!isOwner(project.role)) {
      alert('⚠️ Only owners can delete projects');
      return;
    }
    setOpenModalId(project.id);
  };

  const handleInviteClick = (project: Project): void => {
    if (!isOwner(project.role)) {
      alert('⚠️ Only owners can invite members');
      return;
    }
    setInviteModal(project.id);
  };

  const validateProjectForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!projectForm.name.trim()) errs.name = 'Project name is required';
    else if (projectForm.name.length < 3) errs.name = 'At least 3 characters';
    if ((projectForm.description?.length ?? 0) > 100)
      errs.description = 'Max 100 characters';
    setProjectErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateProject = async (): Promise<void> => {
    if (!validateProjectForm()) return;
    setIsProjectSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${settingsModalProjectId}`,
        {
          method: 'PUT',
          headers: authHeaders(true),
          body: JSON.stringify(projectForm),
        },
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }
      const updated: Project = await res.json();
      updateProject(updated);
      setSettingsModalProjectId(null);
      alert(' Project updated!');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update project';
      console.error('Update failed:', message);
      setProjectErrors({ submit: message });
    } finally {
      setIsProjectSubmitting(false);
    }
  };

  const handleSendInvite = async (email: string): Promise<void> => {
    const trimmed = email?.trim();
    if (!trimmed?.includes('@')) {
      alert('⚠️ Invalid email');
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/invite`,
        {
          method: 'POST',
          headers: authHeaders(true),
          body: JSON.stringify({ email: trimmed }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        alert(text.includes('already') ? 'ℹ️ Already invited' : `❌ ${text}`);
        return;
      }
      alert('✅ Invitation sent!');
      setInviteModal(null);
      fetchProjects();
    } catch {
      alert('❌ Network error');
    }
  };

  // ── Derived 

  // No type annotation on the predicate — TypeScript infers Project from context
  const currentProject = projects.find((p) => p.id === settingsModalProjectId);
  const deleteModalProject = projects.find((p) => p.id === openModalId);
  const inviteModalProject = projects.find((p) => p.id === inviteModal);

  const anyModalOpen =
    openModalId !== null || inviteModal !== null || settingsModalProjectId !== null;

useEffect(() => {
  setIsOpeningProject(false);
}, []);
  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60">
      {anyModalOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => {
            setOpenModalId(null);
            setInviteModal(null);
            setSettingsModalProjectId(null);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <MyProjectHeader
          isLoading={isLoading}
          filteredProjects={filteredProjects}
          projects={projects}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

 <ProjectCard
  handleDeleteClick={handleDeleteClick}
  handleInviteClick={handleInviteClick}
  handleOpenProject={(projectId: number) => handleOpenProject(projectId)} //  Fix: explicit number type
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
    
    {/* Background */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

    {/* Center Card */}
    <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 animate-scaleIn">
      
      {/* Spinner */}
      <div className="h-12 w-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />

      {/* Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">Opening project...</p>
        <p className="text-lg font-semibold">Please wait</p>
      </div>

    </div>
  </div>
)}
      </div>

      {/* Delete Modal */}
{/* Delete Modal - FIXED */}
{openModalId !== null && deleteModalProject && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
    <RemoveModal
      removeQueue={async (id: string | number) => {
        await deleteProject(Number(id));  //  Convert to number & make async
      }}
      customer={{ id: Number(deleteModalProject.id), name: deleteModalProject.name }}
      onClose={() => setOpenModalId(null)}
    />
  </div>
)}

      {/* Invite Modal */}
      {inviteModal !== null && inviteModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <InviteModal
            isOpen={true}
            projectId={String(inviteModal)}
            customer={{
              id: String(inviteModal),
              name: inviteModalProject.name,
            }}
            currentUserId={user?.id ?? ''}
            members={projectMembers}
            removingMemberId={removingMemberId}
            updatingMemberId={updatingMemberId}
            setRemovingMemberId={setRemovingMemberId}
            setUpdatingMemberId={setUpdatingMemberId}
            onClose={() => setInviteModal(null)}
            onInvite={handleSendInvite}
            onUpdateMember={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      )}

      {/* Edit Project Modal */}
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