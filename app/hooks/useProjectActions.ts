import { useState } from 'react';
import { useProjects, type Project } from '../context/ProjectContext';

function authHeaders(contentType = false): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useProjectActions() {
  const { updateProject, fetchProjects, deleteProject } = useProjects();

  const [settingsModalProjectId, setSettingsModalProjectId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', type: '' });
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});
  const [isProjectSubmitting, setIsProjectSubmitting] = useState(false);

  const validateProjectForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!projectForm.name.trim()) errs.name = 'Project name is required';
    else if (projectForm.name.length < 3) errs.name = 'At least 3 characters';
    if ((projectForm.description?.length ?? 0) > 100) errs.description = 'Max 100 characters';
    setProjectErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateProject = async (): Promise<void> => {
    if (!validateProjectForm()) return;
    setIsProjectSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${settingsModalProjectId}`,
        { method: 'PUT', headers: authHeaders(true), body: JSON.stringify(projectForm) }
      );
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
      updateProject(await res.json());
      setSettingsModalProjectId(null);
      alert('✅ Project updated!');
    } catch (e: unknown) {
      setProjectErrors({ submit: e instanceof Error ? e.message : 'Failed to update' });
    } finally {
      setIsProjectSubmitting(false);
    }
  };

  const handleSendInvite = async (inviteModal: number | null, email: string): Promise<void> => {
    const trimmed = email?.trim();
    if (!trimmed?.includes('@')) { alert('⚠️ Invalid email'); return; }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/invite`,
        { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ email: trimmed }) }
      );
      if (!res.ok) {
        const text = await res.text();
        alert(text.includes('already') ? 'ℹ️ Already invited' : `❌ ${text}`);
        return;
      }
      alert('✅ Invitation sent!');
      fetchProjects();
    } catch {
      alert('❌ Network error');
    }
  };

  return {
    settingsModalProjectId,
    setSettingsModalProjectId,
    projectForm,
    setProjectForm,
    projectErrors,
    isProjectSubmitting,
    handleUpdateProject,
    handleSendInvite,
  };
}