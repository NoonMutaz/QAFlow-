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

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "notFixed" | "in-progress" | "fixed";
type Priority = "High" | "Medium" | "Low";

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const { projects } = useProjects();
  const {
    queue,
    addQueue,
    removeQueue,
    updateQueue,
    updatePriorityQueue,
    fetchBugs,
  } = useQueueContext();

  const projectQueue = queue[id] ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [select, setSelect] = useState<Status | "">("");
  const [selectP, setSelectP] = useState<Priority | "">("");

  // fetchBugs wrapped in useCallback inside QueueContext so it's stable
  const stableFetchBugs = useCallback(() => {
    if (id) void fetchBugs(id);
  }, [id, fetchBugs]);

  useEffect(() => {
    stableFetchBugs();
  }, [stableFetchBugs]);

  const filteredQueue = useMemo(() => {
    return projectQueue.filter((customer) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        customer.name.toLowerCase().includes(term) ||
        customer.priority.toLowerCase().includes(term) ||
        customer.bugId.toLowerCase().includes(term) ||
        customer.description.toLowerCase().includes(term);

      const matchesStatus = select === "" || customer.status === select;
      const matchesPriority = selectP === "" || customer.priority === selectP;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projectQueue, searchTerm, select, selectP]);

  const exportToExcel = (): void => {
    const data = projectQueue.map((customer) => ({
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

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Queue.xlsx");
  };

  const project = projects.find((p) => p.id.toString() === id);

 
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-xl">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-8 space-y-8">
      {/* Page Header */}
      <DashboardHeader project={project} queue={queue} id={project.id} />

      {/* KPI Section */}
      <KpiSection queue={queue[id] ?? []} />

      {/* Charts + Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border flex flex-col gap-6 border-gray-100 p-6">
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Export to Excel
            </button>
            <Chart queue={queue[id] ?? []} />
            <PieChart queue={queue[id] ?? []} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <QueueForm
              projectId={String(project.id)}
              currentUserRole={project.role}
              onAdd={(customer) => addQueue(String(project.id), customer)}
            />
          </div>
        </div>
      </div>

      {/* Search */}
      <DashboardSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <TableOfQueue
          projectId={String(project.id)}
          filteredQueue={filteredQueue}
          select={select}
          setSelect={setSelect}
          selectP={selectP}
          setSelectP={setSelectP}
          updateQueue={updateQueue}
          removeQueue={removeQueue}
          updatePriorityQueue={updatePriorityQueue}
          currentUserRole={project.role}
          projectQueue={projectQueue}
        />
      </div>
    </div>
  );
}
