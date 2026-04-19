'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useProjects } from "../../context/ProjectContext";
import InviteModal from "./InviteModal";
import RemoveModal from './RemoveModal';
import { useQueueContext } from "../../context/QueueContext";
import MyProjectHeader from './MyProjectHeader';
import ProjectCard from './ProjectCard';
import { useAuthContext } from "../../context/AuthContext";
import CreateProjectForm from './CreateProjectForm';

interface Member {
  id: string;
  userId: string;
  email: string;
  role: 'owner' | 'member' | 'viewer';
  joinedAt: string;
}

interface Project {
  id: number | string;
  name: string;
  description?: string;
  role: 'owner' | 'member' | 'viewer' | string;
  type?: string;
}

export default function MyProjects() {
  const router = useRouter();
  const { projects, deleteProject, handleOpenProject, fetchProjects, isLoading, updateProject } = useProjects();
  const { queue, fetchBugs } = useQueueContext();

  const [openModalId, setOpenModalId] = useState<number | null>(null);
  const [inviteModal, setInviteModal] = useState<number | null>(null);
  const [settingsModalProjectId, setSettingsModalProjectId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [projectForm, setProjectForm] = useState({ name: '', description: '', type: '' });
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});
  const [isProjectSubmitting, setIsProjectSubmitting] = useState<boolean>(false);
  const { user, isReady } = useAuthContext();

  // Member management states
  const [projectMembers, setProjectMembers] = useState<Member[]>([]);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [membersLoading, setMembersLoading] = useState<boolean>(false);

  const projectTypes = [
    "QA Dashboard",
    "Bug Tracking",
    "Test Management",
    "Performance Testing",
    "Web App",
    "Mobile App",
    "API Project",
  ];

  const fetchProjectMembers = async (projectId: number): Promise<void> => {
    if (!projectId) return;
    setMembersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/members`,
        { headers: { Authorization: `Bearer ${token ?? ''}` } }
      );
      if (res.ok) {
        const members: Member[] = await res.json() as Member[];
        setProjectMembers(members);
      } else {
        console.error('Failed to fetch members:', await res.text());
      }
    } catch (e) {
      console.error('Network error fetching members:', e);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: Member['role']): Promise<void> => {
    if (!inviteModal || !user) return;

    if (String(userId) === String(user.id)) {
      alert("⚠️ You cannot change your own role");
      return;
    }

    setUpdatingMemberId(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/members/${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? ''}`,
          },
          body: JSON.stringify({ role }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("❌ API Error:", text);
        alert(`❌ Update failed: ${text}`);
        return;
      }
      await fetchProjectMembers(inviteModal);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveMember = async (userId: string): Promise<void> => {
    if (!inviteModal) return;
    setRemovingMemberId(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/members/${userId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      setProjectMembers((prev) => prev.filter((m) => m.userId !== userId));
      alert('✅ Member removed!');
    } catch (error) {
      const err = error as Error;
      console.error('Remove failed:', err);
      alert(`❌ ${err.message}`);
    } finally {
      setRemovingMemberId(null);
    }
  };

  useEffect(() => {
    if (inviteModal !== null) {
      void fetchProjectMembers(inviteModal);
    } else {
      setProjectMembers([]);
    }
  }, [inviteModal]);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach((project) => fetchBugs(project.id.toString()));
    }
  }, [projects]);

  const getProjectStatus = (projectId: number | string): { label: string; color: string } => {
    const bugs = (queue?.[projectId] ?? []) as Array<{ status: string }>;
    const total = bugs.length;
    const fixed = bugs.filter((b) => b.status === 'fixed').length;
    if (total === 0) return { label: 'New', color: 'emerald' };
    if (fixed === total) return { label: 'Closed', color: 'green' };
    return { label: 'Active', color: total > 5 ? 'amber' : 'blue' };
  };

  const isOwner = (projectRole?: string): boolean => projectRole === 'owner';

  const filteredProjects = projects.filter(
    (project: Project) =>
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openProjectSettings = (project: Project): void => {
    if (!isOwner(project.role)) {
      alert('⚠️ Only owners can edit projects');
      return;
    }
    setSettingsModalProjectId(project.id as number);
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
    setOpenModalId(project.id as number);
  };

  const handleInviteClick = (project: Project): void => {
    if (!isOwner(project.role)) {
      alert('⚠️ Only owners can invite members');
      return;
    }
    setInviteModal(project.id as number);
  };

  const validateProjectForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!projectForm.name.trim()) errs.name = "Project name is required";
    else if (projectForm.name.length < 3) errs.name = "At least 3 characters";
    if ((projectForm.description?.length ?? 0) > 100) errs.description = "Max 100 characters";
    setProjectErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateProject = async (): Promise<void> => {
    if (!validateProjectForm()) return;
    setIsProjectSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${settingsModalProjectId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(projectForm),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const updated: Project = await res.json() as Project;
      updateProject(updated);
      setSettingsModalProjectId(null);
      alert('✅ Project updated!');
    } catch (error) {
      const err = error as Error;
      console.error('Update failed:', err);
      setProjectErrors({ submit: err.message || 'Failed to update project' });
    } finally {
      setIsProjectSubmitting(false);
    }
  };

  const currentProject = projects.find((p: Project) => p.id === settingsModalProjectId);
  const anyModalOpen =
    openModalId !== null || inviteModal !== null || settingsModalProjectId !== null;

  // Suppress unused variable warning for router/isReady if not yet used
  void router;
  void isReady;
  void membersLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60">
      {/* Backdrop */}
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
          handleOpenProject={handleOpenProject}
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
      </div>

      {/* Delete Modal */}
      {openModalId !== null && projects.find((p: Project) => p.id === openModalId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <RemoveModal
            removeQueue={deleteProject}
            customer={projects.find((p: Project) => p.id === openModalId)!}
            onClose={() => setOpenModalId(null)}
            currentUserId={user?.id ?? ""}
            currentUserEmail={user?.email ?? ""}
          />
        </div>
      )}

      {/* Invite Modal */}
      {inviteModal !== null && projects.find((p: Project) => p.id === inviteModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <InviteModal
            isOpen={true}
            projectId={String(inviteModal)}
            customer={{
              id: inviteModal.toString(),
              name: projects.find((p: Project) => p.id === inviteModal)?.name ?? 'Project',
            }}
            currentUserId={user?.id ?? ""}
            members={projectMembers}
            removingMemberId={removingMemberId}
            updatingMemberId={updatingMemberId}
            setRemovingMemberId={setRemovingMemberId}
            setUpdatingMemberId={setUpdatingMemberId}
            onClose={() => setInviteModal(null)}
            onInvite={async (email: string) => {
              const trimmed = email?.trim();
              if (!trimmed?.includes('@')) {
                alert('⚠️ Invalid email');
                return;
              }
              try {
                const token = localStorage.getItem('token');
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/invite`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token ?? ''}`,
                    },
                    body: JSON.stringify({ email: trimmed }),
                  }
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
            }}
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
        currentProject={currentProject}
        isOwner={isOwner}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        setSettingsModalProjectId={setSettingsModalProjectId}
      />
    </div>
  );
}