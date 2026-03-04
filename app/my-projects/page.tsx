'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProjects } from "../context/ProjectContext"
import RemoveModal from "../components/RemoveModal"
interface Project {
  id: number;
  projectName: string;
  bugs: number;
  status: 'active' | 'archived';
  lastUpdated: string;
}

export default function Page() {
  const router = useRouter();
  const { projects } = useProjects();
     const { deleteProject } = useProjects();
    const { handleOpenProject } = useProjects();
    const [openModalId, setOpenModalId] = useState<number | null>(null);
  
    const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("QA Dashboard");
    const [newProject, setNewproject] = useState([]);
//   const [projects, setProjects] = useState<Project[]>([ ...newProject,
//     { id: 1, projectName: 'QA Dashboard', bugs: 12, status: 'active', lastUpdated: '2026-03-03' },
//     { id: 2, projectName: 'Mobile App Tests', bugs: 5, status: 'active', lastUpdated: '2026-02-28' },
//     { id: 3, projectName: 'Website Redesign', bugs: 8, status: 'archived', lastUpdated: '2026-01-20' },
//   ]);



//   const handleDeleteProject = (id: number) => {
//     setProjects(projects.filter(p => p.id !== id));
//   };

  const handleCreateProject = () => {
    router.push('/createProject');
  };

  return (
    <div className="min-h-screen  p-6">
      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Existing Projects</h1>
        <button
          onClick={handleCreateProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create New Project
        </button>
      </div>

      {/* Project Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bugs</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Updated</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No projects found. Create a new project to get started.
                </td>
              </tr>
            ) : (
              projects.map((project,id) => (
                <tr key={project.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                  <td className="px-6 py-4">{project.bugs||0}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {project.status|| 'new'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{project.lastUpdated || '-'}</td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenProject(project.id)}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                    >
                      Open
                    </button>
                    <button
                    onClick={() => setOpenModalId(project.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                      {openModalId === project.id && (
                        <RemoveModal
                          removeQueue={deleteProject}
                          customer={project}
                          onClose={() => setOpenModalId(null)}
                        />
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}