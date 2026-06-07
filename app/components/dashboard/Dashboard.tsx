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
  const [testCases, setTestCases] = useState([]);
  const { projects } = useProjects();
  const { addQueue, removeQueue, updateQueue, updatePriorityQueue } = useQueueContext();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [select, setSelect] = useState<Status | "">("");
  const [selectP, setSelectP] = useState<Priority | "">("");
  const [members, setMembers] = useState<any[]>([]);

  //  React Query handles polling - no useEffect needed
  const { data: projectQueue = [] } = useQuery({
    queryKey: ['bugs', id],
    queryFn: () => {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2]; // ← cookie
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/bugs`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
    },
    refetchInterval: 9000,
    refetchIntervalInBackground: false,
    staleTime: 5000,
    enabled: !!id,
  });

  const handleUpdateQueue = async (projectId: string, bugId: number, status: Status) => {
    //   Optimistic update - instant UI response
    queryClient.setQueryData(['bugs', id], (old: any[]) =>
      old?.map((bug) => bug.id === bugId ? { ...bug, status } : bug) ?? []
    );
    // Then hit the API in background
    await updateQueue(projectId, bugId, status);
  };

  const handleRemoveQueue = async (projectId: string, bugId: number) => {
    // Optimistic update
    queryClient.setQueryData(['bugs', id], (old: any[]) =>
      old?.filter((bug) => bug.id !== bugId) ?? []
    );
    await removeQueue(projectId, bugId);
    // Refetch to confirm
    queryClient.invalidateQueries({ queryKey: ['bugs', id] });
  };

  const handleUpdatePriority = async (projectId: string, bugId: number, priority: Priority) => {
    //   Optimistic update - instant UI response
    queryClient.setQueryData(['bugs', id], (old: any[]) =>
      old?.map((bug) => bug.id === bugId ? { ...bug, priority } : bug) ?? []
    );
    await updatePriorityQueue(projectId, bugId, priority);
  };

  //   Fetch members once
  useEffect(() => {
    if (!id) return;
    const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then(setMembers);
  }, [id]);

  // Fetch Test Cases once 
  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/testcases`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("Dashboard fetched test cases successfully:", data);
          setTestCases(data); 
        } else {
          console.error(`Failed to fetch test cases. Status: ${res.status}`);
        }
      } catch (error) {
        console.error("Error fetching test cases:", error);
      }
    };
    
    if (id) fetchTestCases();
  }, [id]);
  
  //   Invalidate React Query cache when a bug is updated locally
  useEffect(() => {
    const handleBugUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', id] });
    };
    window.addEventListener("bug-updated", handleBugUpdated as any);
    return () => window.removeEventListener("bug-updated", handleBugUpdated as any);
  }, [id, queryClient]);

  const filteredQueue = useMemo(() => {
    if (!Array.isArray(projectQueue)) return [];
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

    worksheet['!cols'] = [
      { wch: 10 }, 
      { wch: 15 }, 
      { wch: 30 }, 
      { wch: 10 }, 
      { wch: 40 }, 
      { wch: 30 }, 
      { wch: 30 }, 
      { wch: 12 }, 
      { wch: 20 }, 
      { wch: 20 }, 
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bugs");
    XLSX.writeFile(workbook, "QAFlow-Bugs.xlsx");
  };

  const project = projects.find((p) => p.id.toString() === id);

  if (!projects.length) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-lg">Loading project...</p></div>;
  }
  
  if (!project) {
    return (
      <div className="min-h-[85vh] w-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner dark:bg-blue-950/30 dark:text-blue-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 1.5V7.5A2.25 2.25 0 0 1 4.5 5.25h15A2.25 2.25 0 0 1 21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight dark:text-gray-50">Project Not found</h3>
          <p className="mt-2.5 text-sm text-gray-500 leading-relaxed dark:text-gray-400">
           This project doesn't exist or you don't have permission to view it. Double-check your workspace ID or return to your active dashboard.
          </p>
          <div className="mt-6">
            <button onClick={() => window.location.href = '/my-projects'} className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-gray-800 transition dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Return to projects 
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-8 space-y-8">
      <DashboardHeader project={project} queue={{ [id]: projectQueue }} id={project.id} members={members} />
      <KpiSection queue={projectQueue} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border flex flex-col gap-6 border-gray-100 p-6">
            <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
              Export to Excel
            </button>
            <Chart queue={projectQueue} />
            <PieChart queue={projectQueue} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <QueueForm
              testCases={testCases} // ◄ ADDED THIS PROP HERE TO SEND DATA DOWN
              projectId={String(project.id)}
              currentUserRole={project.role}
              existingBugs={projectQueue}
              onAdd={async (customer) => {
                const newBugId = await addQueue(String(project.id), customer);
                await queryClient.invalidateQueries({ queryKey: ['bugs', id] });
                return newBugId;
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
          updateQueue={handleUpdateQueue}
          removeQueue={handleRemoveQueue}
          updatePriorityQueue={handleUpdatePriority}
          currentUserRole={project.role}
        />
      </div>
    </div>
  );
}