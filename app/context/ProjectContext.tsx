'use client';

import { createContext, useContext, useState } from "react";
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
  deleteProject: (id: string) => void;
  handleOpenProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(d => d.id !== id));
  };

  const handleOpenProject = (id: string) => {
    router.push(`/dashboard/${id}`);
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, deleteProject, handleOpenProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};