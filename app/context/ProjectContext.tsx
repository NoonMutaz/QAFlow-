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
    role?: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (id: number) => Promise<void>;
  handleOpenProject: (id: number) => void;
  clearProjects: () => void;
  fetchProjects: () => Promise<void>; 
  updateProject: (project: Project) => void;
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
// ProjectContext.tsx - Updated fetchProjects
const fetchProjects = async () => {
  if (!token) {
    console.log('❌ No token, skipping projects fetch');
    setProjects([]);
    return;
  }

  setIsLoading(true);
  try {
    console.log(' Fetching projects from:', `${API}/api/projects`); // DEBUG
    console.log('  Token exists:', !!token); // DEBUG

    const res = await fetch(`${API}/api/projects`, {
      method: 'GET', //   Explicit method
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', //   Required for some backends
      },
      cache: 'no-store',
    });

    console.log('  Projects response:', res.status, res.statusText); // DEBUG

    if (res.ok) {
      const data = await res.json();
      setProjects(data);
      console.log(`  Fetched ${data.length} projects`);
    } else if (res.status === 401) {
      console.log('  Unauthorized - token expired');
      // Optionally clear token and redirect to login
      localStorage.removeItem('token');
      router.push('/login');
      setProjects([]);
    } else {
      console.error('❌ Projects fetch failed:', res.status, await res.text());
      setProjects([]);
    }
  } catch (err) {
    console.error("❌ Network error fetching projects:", err);
    setProjects([]);
  } finally {
    setIsLoading(false);
  }
};
  //  INITIAL LOAD   TOKEN CHANGE
  useEffect(() => {
    if (token) {
      fetchProjects();
    }
    setIsReady(true); //  Always ready after first run
  }, [token]);

  //  GLOBAL REFRESH EVENTS
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

const updateProject = (updated: Project) => {
  setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
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
        isLoading, 
        updateProject,
        
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