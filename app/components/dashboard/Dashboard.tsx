"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useQueueContext } from "../../context/QueueContext";
import QueueForm from "./QueueForm";
import TableOfQueue from "./TableOfQueue";
import Chart from "./Chart";
import PieChart from "./PieChart";
import KpiSection from "./KpiSection";
import DashboardSearchBar from "./DashboardSearchBar";
import DashboardHeader from "./DashboardHeader";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useParams } from "next/navigation";

export default function Dashboard() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");
  const { projects } = useProjects();
  const { findDuplicates, queue, addQueue, removeQueue, updateQueue, updatePriorityQueue, fetchBugs } = useQueueContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [select, setSelect] = useState("");
  const [selectP, setSelectP] = useState("");

  const projectQueue = queue[id] ?? [];
  const project = projects.find((p) => p.id.toString() === id);

  useEffect(() => {
    if (id) fetchBugs(id);
  }, [id, fetchBugs]);

  const filteredQueue = useMemo(() => {
    return projectQueue.filter((customer) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = customer.name.toLowerCase().includes(term) || customer.bugId.toLowerCase().includes(term) || customer.description.toLowerCase().includes(term);
      const matchesStatus = select === "" || customer.status === select;
      const matchesPriority = selectP === "" || customer.priority === selectP;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projectQueue, searchTerm, select, selectP]);

  if (!project) return <div className="min-h-screen flex items-center justify-center">Project not found.</div>;

  return (
    <div className="min-h-screen px-4 py-8 space-y-8">
      <DashboardHeader project={project} queue={queue} id={project.id} />
      <KpiSection queue={projectQueue} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
             <Chart queue={projectQueue} />
             <PieChart queue={projectQueue} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <QueueForm  projectId={id} currentUserRole={project.role} onAdd={(bug) => addQueue(id, bug)} />
        </div>
      </div>
      <DashboardSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <TableOfQueue 
        projectId={id} 
        filteredQueue={filteredQueue} 
        projectQueue={projectQueue}
        select={select} setSelect={setSelect} 
        selectP={selectP} setSelectP={setSelectP}
        updateQueue={updateQueue} 
        removeQueue={removeQueue} 
        updatePriorityQueue={updatePriorityQueue} 
        currentUserRole={project.role}
      />
    </div>
  );
}