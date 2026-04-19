'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./AuthContext";
import { useQueueContext } from "./QueueContext";

// interface Project {
//   id: number;
//   name: string;
//   description: string;
//   type: string;
//   role?: string;
// }
export interface Project {
  id: number ;
  name: string;
  description?: string;
  role?: "owner" | "member" | "viewer";
  type?: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: any) => void;
  deleteProject: (id: number) => Promise<void>;
  handleOpenProject: (id: number) => void;
  clearProjects: () => void;
  fetchProjects: () => Promise<void>;
  updateProject: (project: any) => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthContext();
  const { fetchQueue } = useQueueContext();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL!;

  // ✅ NORMALIZER (single source of truth)
 // ✅ NORMALIZER (single source of truth) - FIXED
const normalizeProject = (p: any): Project | null => {
  // Convert ID to number safely
  const id = Number(p?.id ?? p?.projectId ?? p?.project?.id);
  const role = p?.role ?? p?.project?.role;

const safeRole: Project["role"] =
  role === "owner" || role === "member" || role === "viewer"
    ? role
    : "viewer";
  const normalized: Project = {
    id: isNaN(id) ? 0 : id,  // Ensure it's a valid number
    name: p?.name ?? p?.project?.name ?? "",
    description: p?.description ?? p?.project?.description ?? "",
    type: p?.type ?? p?.project?.type ?? "",
    role: safeRole,
  };

  // Check for valid numeric ID
  if (normalized.id === 0 || normalized.id == null || isNaN(normalized.id)) {
    console.error("❌ Invalid project ID from API:", p);
    return null;
  }

  return normalized;
};

  // ✅ FETCH PROJECTS (SAFE)
  const fetchProjects = async () => {
    if (!token) {
      setProjects([]);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const raw = await res.json();

        const list = Array.isArray(raw)
          ? raw
          : raw.projects || [];

        const normalized = list
          .map(normalizeProject)
          .filter(Boolean) as Project[];

        setProjects(normalized);

        console.log("✅ Projects loaded:", normalized);
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        setProjects([]);
      } else {
        console.error("❌ Fetch failed:", await res.text());
        setProjects([]);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    if (token) fetchProjects();
  }, [token]);

  // ✅ GLOBAL REFRESH
  useEffect(() => {
    const handleRefresh = () => {
      fetchProjects();
      fetchQueue();
    };

    window.addEventListener("projects-refresh", handleRefresh);
    return () => window.removeEventListener("projects-refresh", handleRefresh);
  }, []);

  // ✅ POLLING
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && token) {
        fetchProjects();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

const addProject = (project: any) => {
  console.log(" Raw project from API:", JSON.stringify(project, null, 2));
  const normalized = normalizeProject(project);
  if (!normalized) return;
  setProjects(prev => [...prev, normalized]);
};

  //  SAFE UPDATE
  const updateProject = (updated: any) => {
    const normalized = normalizeProject(updated);
    if (!normalized) return;

    setProjects(prev =>
      prev.map(p => (p.id === normalized.id ? normalized : p))
    );
  };

  // ✅ DELETE
  const deleteProject = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

const handleOpenProject = (id: number | string) => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (!numericId || isNaN(numericId)) return;
  router.push(`/dashboard/${numericId}`);
};
  const clearProjects = () => setProjects([]);

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

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within provider");
  return ctx;
};