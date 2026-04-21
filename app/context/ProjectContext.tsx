'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthContext';
import { useQueueContext } from './QueueContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  description?: string;
  role?: 'owner' | 'member' | 'viewer';
  type?: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: unknown) => void;
  //   Accepts string | number so ProjectCard's prop type is satisfied
  deleteProject: (id: number) => Promise<void>;
handleOpenProject: (id: string | number) => void;
  clearProjects: () => void;
  fetchProjects: () => Promise<void>;
  updateProject: (project: unknown) => void;
  isLoading: boolean;
}

// ─── SSR-safe localStorage ────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('token');
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalizeProject(p: unknown): Project | null {
  if (!p || typeof p !== 'object') return null;
  const raw = p as Record<string, unknown>;

  const id = Number(
    raw.id ?? raw.projectId ?? (raw.project as Record<string, unknown>)?.id,
  );

  if (!id || isNaN(id)) {
    console.error('❌ Invalid project ID from API:', p);
    return null;
  }

  const roleRaw =
    raw.role ?? (raw.project as Record<string, unknown> | undefined)?.role;
  const safeRole: Project['role'] =
    roleRaw === 'owner' || roleRaw === 'member' || roleRaw === 'viewer'
      ? roleRaw
      : 'viewer';

  const proj = (raw.project as Record<string, unknown> | undefined) ?? {};

  return {
    id,
    name: String(raw.name ?? proj.name ?? ''),
    description:
      raw.description != null
        ? String(raw.description)
        : proj.description != null
        ? String(proj.description)
        : undefined,
    type:
      raw.type != null
        ? String(raw.type)
        : proj.type != null
        ? String(proj.type)
        : undefined,
    role: safeRole,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthContext();
  const { fetchQueue } = useQueueContext();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL ?? '';

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async (): Promise<void> => {
    if (!token) {
      setProjects([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const raw: unknown = await res.json();
        const list: unknown[] = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as Record<string, unknown>).projects)
          ? ((raw as Record<string, unknown>).projects as unknown[])
          : [];

        const normalized = list
          .map(normalizeProject)
          .filter((p): p is Project => p !== null);

        setProjects(normalized);
      } else if (res.status === 401) {
        removeStoredToken();
        router.push('/login');
        setProjects([]);
      } else {
        console.error('❌ Fetch failed:', await res.text());
        setProjects([]);
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, API, router]);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (token) void fetchProjects();
  }, [token, fetchProjects]);

  useEffect(() => {
    const handleRefresh = (): void => {
      void fetchProjects();
      fetchQueue();
    };
    window.addEventListener('projects-refresh', handleRefresh);
    return () => window.removeEventListener('projects-refresh', handleRefresh);
  }, [fetchProjects, fetchQueue]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && token) {
        void fetchProjects();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [token, fetchProjects]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addProject = (project: unknown): void => {
    const normalized = normalizeProject(project);
    if (!normalized) return;
    setProjects((prev) => [...prev, normalized]);
  };

  const updateProject = (updated: unknown): void => {
    const normalized = normalizeProject(updated);
    if (!normalized) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === normalized.id ? normalized : p)),
    );
  };

  const deleteProject = async (id: number): Promise<void> => {
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token ?? getToken() ?? ''}` },
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('❌ Delete failed:', err);
    }
  };

  //   Accepts string | number — converts to number internally
  const handleOpenProject = (id: string | number): void => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!numericId || isNaN(numericId)) return;
    router.push(`/dashboard/${numericId}`);
  };

  const clearProjects = (): void => setProjects([]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        deleteProject,
        handleOpenProject,
        clearProjects,
        fetchProjects,
        updateProject,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = (): ProjectContextType => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
};