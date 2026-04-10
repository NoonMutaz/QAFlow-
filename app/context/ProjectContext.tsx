'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./AuthContext";
import { useQueueContext } from "./QueueContext";
interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (id: number) => Promise<void>;
  handleOpenProject: (id: number) => void;
  clearProjects: () => void;
  fetchProjects: () => Promise<void>; 
  isLoading: boolean;  
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthContext();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  
const { queue, fetchQueue } = useQueueContext();
  const API = process.env.NEXT_PUBLIC_API_URL!;

  const fetchProjects = async () => {
    if (!token) {
      setProjects([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store', // ✅ Always fresh
      });

      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        console.log(`✅ Fetched ${data.length} projects`);
      } else {
        console.error('Projects fetch failed:', res.status);
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 1. INITIAL LOAD + TOKEN CHANGE
  useEffect(() => {
    if (token) {
      fetchProjects();
    }
    setIsReady(true); // ✅ Always ready after first run
  }, [token]);

  // ✅ 2. GLOBAL REFRESH EVENTS
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Event refresh');
      fetchProjects();
       fetchQueue();
    };

    window.addEventListener('projects-refresh', handleRefresh);
    return () => window.removeEventListener('projects-refresh', handleRefresh);
  }, []);

  //   BACKGROUND POLLING (tab visible only)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && token) {
        fetchProjects();
      }
    }, 30000); // 30s

    return () => clearInterval(interval);
  }, [token]);

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const deleteProject = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleOpenProject = (id: number) => {
    router.push(`/dashboard/${id}`);
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
        isLoading, // ✅ Expose loading
      }}
    >
      {children} {/* ✅ Always render - no isReady gate */}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within provider");
  return ctx;
};