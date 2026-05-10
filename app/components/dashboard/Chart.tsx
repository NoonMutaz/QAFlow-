"use client";

import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

type Status = "notFixed" | "in-progress" | "fixed";

interface Customer {
  id: number;
  name: string;
  priority: string;
  status: Status;
}

export default function ServicesStatusChart({ queue }: { queue: Customer[] }) {
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ApexCharts | null>(null);

  useEffect(() => {
    if (!elRef.current) return;

    // If chart exists, just update it
    if (chartRef.current) {
      const services = [...new Set(queue.map((c) => c.priority))];
      chartRef.current.updateOptions({ xaxis: { categories: services } }, false, true);
      chartRef.current.updateSeries([
        { name: "Not Fixed", data: services.map((s) => queue.filter((c) => c.priority === s && c.status === "notFixed").length) },
        { name: "In Progress", data: services.map((s) => queue.filter((c) => c.priority === s && c.status === "in-progress").length) },
        { name: "Fixed", data: services.map((s) => queue.filter((c) => c.priority === s && c.status === "fixed").length) },
      ], true);
      return;
    }

    // First time: create chart
    const services = [...new Set(queue.map((c) => c.priority))];

    chartRef.current = new ApexCharts(elRef.current, {
      chart: { type: "bar", height: 380, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 6 } },
      dataLabels: { enabled: false },
      series: [
        { name: "Not Fixed", data: services.map((s) => queue.filter((c) => c.priority === s && c.status === "notFixed").length) },
        { name: "In Progress", data: services.map((s) => queue.filter((c) => c.priority === s && c.status === "in-progress").length) },
        { name: "Fixed", data: services.map((s) => queue.filter((c) => c.priority === s && c.status === "fixed").length) },
      ],
      colors: ["#F59E0B", "#3B82F6", "#10B981"],
      xaxis: { categories: services },
      legend: { position: "top" },
    });

    chartRef.current.render();

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [queue]); //  runs on every queue change, updates in place

  return (
    <div className="w-full bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Bugs Priority and Status Breakdown
      </h2>
      <div ref={elRef} />
    </div>
  );
}