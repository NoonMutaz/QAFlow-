"use client";
import { useState, useMemo, useEffect } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useQueueContext } from "../../context/QueueContext";
import QueueForm from "./QueueForm";
import TableOfQueue from "./TableOfQueue";
import KpiSection from "./KpiSection";
import DashboardSearchBar from "./DashboardSearchBar";
import DashboardHeader from "./DashboardHeader";
import { useParams } from "next/navigation";

export default function Dashboard() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");
  const { projects } = useProjects();
  const { queue, addQueue, removeQueue, updateQueue, updatePriorityQueue, fetchBugs } = useQueueContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [select, setSelect] = useState("");
  const [selectP, setSelectP] = useState("");

  const projectQueue = queue[id] ?? [];
  const project = projects.find((p) => p.id.toString() === id);

  useEffect(() => {
    if (id) fetchBugs(id);
  }, [id, fetchBugs]);

  const filteredQueue = useMemo(() => {
    return projectQueue.filter((bug) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        term === "" || 
        bug.name.toLowerCase().includes(term) || 
        bug.bugId.toLowerCase().includes(term) || 
        (bug.description && bug.description.toLowerCase().includes(term));

      const matchesStatus = select === "" || bug.status === select;
      const matchesPriority = selectP === "" || bug.priority === selectP;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projectQueue, searchTerm, select, selectP]);

  if (!project) return <div className="h-screen flex items-center justify-center font-bold">Project Not Found</div>;

  return (
    <div className="min-h-screen px-4 py-8 space-y-8 bg-gray-50/30">
      <DashboardHeader project={project} queue={queue} id={project.id} />
      <KpiSection queue={projectQueue} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <DashboardSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <TableOfQueue 
            projectId={id} 
            filteredQueue={filteredQueue} 
            select={select} setSelect={setSelect} 
            selectP={selectP} setSelectP={setSelectP}
            searchTerm={searchTerm}
            updateQueue={updateQueue} 
            removeQueue={removeQueue} 
            updatePriorityQueue={updatePriorityQueue} 
            currentUserRole={project.role}
          />
        </div>
        
        <div className="lg:col-span-1">
          {/* We pass projectQueue (the full list) for duplicate detection */}
          <QueueForm 
            projectId={id} 
            projectQueue={projectQueue} 
            currentUserRole={project.role} 
            onAdd={(bug: any) => addQueue(id, bug)} 
          />
        </div>
      </div>
    </div>
  );
}