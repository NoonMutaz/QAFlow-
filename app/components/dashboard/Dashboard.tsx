"use client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from "react";
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

type Status = "notFixed" | "in-progress" | "fixed";
type Priority = "High" | "Medium" | "Low";

export default function Dashboard() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const { projects } = useProjects();
  const { addQueue, removeQueue, updateQueue, updatePriorityQueue } = useQueueContext();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [select, setSelect] = useState<Status | "">("");
  const [selectP, setSelectP] = useState<Priority | "">("");
  const [members, setMembers] = useState<any[]>([]);

  // ✅ React Query handles polling - no useEffect needed
  const { data: projectQueue = [] } = useQuery({
    queryKey: ['bugs', id],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/bugs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }).then((r) => r.json()),
    refetchInterval: 9000,
    refetchIntervalInBackground: false,
    staleTime: 5000,
    enabled: !!id,
  });

  // ✅ Fetch members once
  useEffect(() => {
    if (!id) return;
    const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then(setMembers);
  }, [id]);

  // ✅ Invalidate React Query cache when a bug is updated locally
  useEffect(() => {
    const handleBugUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', id] });
    };
    window.addEventListener("bug-updated", handleBugUpdated as any);
    return () => window.removeEventListener("bug-updated", handleBugUpdated as any);
  }, [id, queryClient]);

  const filteredQueue = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return projectQueue.filter((customer: any) => {
      const matchesSearch =
        (customer.name ?? "").toLowerCase().includes(term) ||
        (customer.priority ?? "").toLowerCase().includes(term) ||
        String(customer.bugId ?? "").toLowerCase().includes(term) ||
        (customer.description ?? "").toLowerCase().includes(term);
      const matchesStatus = select === "" || (customer.status ?? "").toLowerCase() === select.toLowerCase();
      const matchesPriority = selectP === "" || (customer.priority ?? "").toLowerCase() === selectP.toLowerCase();
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projectQueue, searchTerm, select, selectP]);

  const exportToExcel = (): void => {
    const data = projectQueue.map((customer: any) => ({
      "Bug ID": customer.bugId,
      "Reported By": customer.name,
      Description: customer.description,
      Priority: customer.priority,
      URL: customer.url,
      "Expected Result": customer.expectedResult,
      "Actual Result": customer.actualResult,
      Status: customer.status,
      Note: customer.note,
      "Created At": new Date(customer.createdAt).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Queue");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "Queue.xlsx");
  };

  const project = projects.find((p) => p.id.toString() === id);

  if (!projects.length) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-lg">Loading project...</p></div>;
  }
  if (!project) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500 text-lg">Project not found</p></div>;
  }

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-8 space-y-8">
      {/* ✅ all use projectQueue from React Query */}
      <DashboardHeader project={project} queue={{ [id]: projectQueue }} id={project.id} members={members} />
      <KpiSection queue={projectQueue} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border flex flex-col gap-6 border-gray-100 p-6">
            <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
              Export to Excel
            </button>
            {/* ✅ charts get stable React Query data */}
            <Chart queue={projectQueue} />
            <PieChart queue={projectQueue} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <QueueForm
              projectId={String(project.id)}
              currentUserRole={project.role}
          onAdd={async (customer) => {
  const newBugId = await addQueue(String(project.id), customer); //  capture id
  queryClient.invalidateQueries({ queryKey: ['bugs', id] });
  return newBugId; //  return it so QueueForm can use it for upload
}}
            />
          </div>
        </div>
      </div>

      <DashboardSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
    </div>
  );
}