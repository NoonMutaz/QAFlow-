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
  deleteProject: (project: Project) => void;
  handleOpenProject:(project: Project) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
   const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

    const deleteProject = (id: Project) => {
    setProjects(prev => prev.filter(d=> d.id !==id));
  };

  const handleOpenProject = (id: number) => {
    router.push(`/dashboard/${id}`); // Navigate to project dashboard
  };
  return (
    <ProjectContext.Provider value={{ projects, addProject ,deleteProject,handleOpenProject}}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  return context;
};