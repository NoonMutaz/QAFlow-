"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "../header/Header";
import { useProjects } from "../../context/ProjectContext";
import { useQueueContext } from "../../context/QueueContext";
import QueueForm from "./QueueForm";
import { QueueData } from "../../data/QueueData";
import TableOfQueue from "./TableOfQueue";
import Chart from "./Chart";
import PieChart from "./PieChart";
// import { useQueue } from "../../hooks/useQueue";
import KpiSection from "./KpiSection";
import { useSearch } from "@/app/context/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DashboardSearchBar from "./DashboardSearchBar";

import { useParams } from "next/navigation";
import DashboardHeader from "./DashboardHeader";

type Status = "notFixed" | "in-progress" | "fixed";
type Priority = "High" | "Medium" | "Low";

interface Customer {
  id: number;
  name: string;
  priority: Priority;
  status: Status;
  createdAt: number;
  bugId: string;
  url: string;
  expectedResult: string;
  actualResult: string;
  description: string;
  note: string;
}

interface NewCustomer {
  name: string;
  priority: Priority;
  bugId: string;
}

export default function Dashboard() {
  // const id = Array.isArray(params.id) ? params.id[0] : params.id;
  // add fetchBugs to your destructuring

  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const { projects } = useProjects();
  const { queue, addQueue, removeQueue, updateQueue, updatePriorityQueue, fetchBugs } =
    useQueueContext();

  const projectQueue = queue[id] || [];

  // const { queue, addQueue, updateQueue, removeQueue, updatePriorityQueue } =
  //     useQueue(QueueData);

  // const { searchTerm } = useSearch();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [select, setSelect] = useState<Status | "">("");
  const [selectP, setSelectP] = useState<Priority | "">("");

  //  must run BEFORE any conditional return
  useEffect(() => {
    if (id) {
      fetchBugs(id);
    }
  }, [id]);

  // Compute filtered queue
  const filteredQueue = useMemo(() => {
    return projectQueue.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.bugId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = select === "" || customer.status === select;
      const matchesPriority = selectP === "" || customer.priority === selectP;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projectQueue, searchTerm, select, selectP]);

  // Excel export
  const exportToExcel = () => {
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

  // Find project
  const project = projects.find((p) => p.id.toString() === id);

  //  return AFTER all hooks
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-xl">Project not found.</p>
      </div>
    );
  }

  // Priority color mapping
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "notFixed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "in-progress":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "fixed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      <div className="min-h-screen px-4 md:px-8 lg:px-12 py-8 space-y-8">
        {/* Page Header */}
  
      <DashboardHeader project={project} queue={queue} id={project.id}/>

       

        {/* KPI Section */}
        <KpiSection queue={queue[id] || []} />

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
              <Chart queue={queue[id] || []} />
              <PieChart queue={queue[id] || []} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <QueueForm
  projectId={String(project.id)}
  onAdd={(customer) => addQueue(String(project.id), customer)}
/>

            </div>
          </div>
        </div>

        {/* search bar */}
        <DashboardSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Queue Management</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Showing {filteredQueue.length} of {projectQueue.length} items
              </span>
              {(select || selectP) && (
                <button
                  onClick={() => {
                    setSelect("");
                    setSelectP("");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div> */}

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
    </>
  );
}