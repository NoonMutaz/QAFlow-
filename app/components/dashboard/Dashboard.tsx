"use client";

import { useState, useMemo } from "react";
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
}

export default function Dashboard() {
  const params = useParams();

  const id = params.id;
  const { projects } = useProjects();
  const { queue, addQueue, removeQueue, updateQueue,updatePriorityQueue  } = useQueueContext();
  
//   const { queue, addQueue, updateQueue, removeQueue, updatePriorityQueue } =
//     useQueue(QueueData);

  //const { searchTerm } = useSearch();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [select, setSelect] = useState<Status | "">("");
  const [selectP, setSelectP] = useState<Priority | "">("");
  //const [priority, setPriority] = useState<Priority>("");
  //const [description, setDescription] = useState<Priority>("");

 const filteredQueue = useMemo(() => {
  const projectQueue = queue[id] || []; // <-- get the array for this project
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
}, [queue, id, searchTerm, select, selectP]);
  // const [queue, setQueue] = useState<Customer[]>([]);
  const exportToExcel = () => {
    const data = queue.map((customer) => ({
      "Bug ID": customer.bugId,
      "Reported By": customer.name,
      Priority: customer.priority,
      Status: customer.status,
      URL: customer.url,
      "Expected Result": customer.expectedResult,
      "Actual Result": customer.actualResult,
      Description: customer.description,
      Note: customer.note,
      "Created At": new Date(customer.createdAt).toLocaleString(),
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Queue");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save file
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Queue.xlsx");
  };
  // Compute next bug ID dynamically
//   const getNextBugId = () => {
//     if (queue.length === 0) return "BUG-001";
//     const lastBug = queue[queue.length - 1].bugId; // e.g., "BUG-007"
//     const number = parseInt(lastBug!.split("-")[1]) + 1;
//     return `BUG-${String(number).padStart(3, "0")}`; // "BUG-008"
//   };
  const project = projects.find((p) => p.id.toString() === id);

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
      <div className="min-h-screen   px-4 md:px-8 lg:px-12 py-8 space-y-8">
        {/* Page Header */}
        {/* <Header  searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {project.name || "QA Dashboard"}
            </h1>
   <div className="w-full">
  <p
    className="
      text-xs
      sm:text-sm
      md:text-base
      text-gray-500
      mt-1
      leading-snug
      break-words
    "
  >
    {project.description ||
      "Monitor bugs, test cases, and status in real time"}
  </p>
</div>

          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Queue</p>
              <p className="text-2xl font-bold text-gray-900">{queue.length}</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-2xl font-bold text-purple-600">
                {/* {queue.filter((c) => c.status === "in-progress").length} */}
                 {(queue[id] || []).filter((c) => c.status === "in-progress").length}
              </p>
            </div>
          </div>
        </div>

        {/* KPI Section */}
        <KpiSection queue={queue[id] || []}/>

        {/* Charts + Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border flex flex-col gap-6 border-gray-100 p-6">
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Export to Excel
              </button>{" "}
              <Chart queue={queue[id] || []} />
              <PieChart queue={queue[id] || []}/>
            </div>
            {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <PieChart queue={queue} />
            </div> */}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <QueueForm
              onAdd={(customer) => addQueue(project.id, customer)} 
                priority={priority}
                setPriority={setPriority}
              />
            </div>
          </div>
        </div>

        {/* search bar */}
        <DashboardSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <div></div>
        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Queue Management
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Showing {filteredQueue.length} of {queue.length} items
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
          </div>

          <TableOfQueue
           projectId={project.id}
            filteredQueue={filteredQueue}
            updateQueue={updateQueue}
            removeQueue={removeQueue}
            setSelect={setSelect}
            select={select}
            setSelectP={setSelectP}
            selectP={selectP}
            updatePriorityQueue={updatePriorityQueue}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </div>
      </div>
    </>
  );
}
