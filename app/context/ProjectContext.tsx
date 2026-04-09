// 'use client';

// import { createContext, useContext, useState, useEffect } from "react";
// import { useRouter } from 'next/navigation';
// import { useLocalStorage } from '../hooks/useLocalStorage';

// interface Project {
//   id: string;
//   name: string;
//   description: string;
//   type: string;
//   bugId: string;
//   status: 'active';
// }

// interface ProjectContextType {
//   projects: Project[];
//   addProject: (project: Project) => void;
//   deleteProject: (id: string) => void;
//   handleOpenProject: (id: string) => void;
// }

// const ProjectContext = createContext<ProjectContextType | null>(null);

// export function ProjectProvider({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const [isReady, setIsReady] = useState(false);

//   const [projects, setProjects] = useLocalStorage<Project[]>("projects", []);

//   // Define functions BEFORE the early return
//   const addProject = (project: Project) => {
//     setProjects(prev => [...prev, project]);
//   };

//   const deleteProject = (id: string) => {
//     setProjects(prev => prev.filter(d => d.id !== id));
//   };

//   const handleOpenProject = (id: string) => {
//     router.push(`/dashboard/${id}`);
//   };

//   useEffect(() => {
//     setIsReady(true);
//   }, []);

//   if (!isReady) return null;

//   return (
//     <ProjectContext.Provider value={{ projects, addProject, deleteProject, handleOpenProject }}>
//       {children}
//     </ProjectContext.Provider>
//   );
// }

// export const useProjects = () => {
//   const context = useContext(ProjectContext);
//   if (!context) {
//     throw new Error("useProjects must be used within a ProjectProvider");
//   }
//   return context;
// };
'use client';

import { useAuthContext } from "./AuthContext";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (id: string) => Promise<void>;
  handleOpenProject: (id: string) => void;
  clearProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthContext();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) {
        setProjects([]);
        setIsReady(true);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setIsReady(true);
      }
    };

    fetchProjects();
  }, [token]);

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const deleteProject = async (id: string) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleOpenProject = (id: string) => {
    router.push(`/dashboard/${id}`);
  };

  const clearProjects = () => setProjects([]);

  return (
    <ProjectContext.Provider value={{ projects, addProject, deleteProject, handleOpenProject, clearProjects }}>
      {!isReady ? null : children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProjects must be used within a ProjectProvider");
  return context;
};
