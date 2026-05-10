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

export default function PieChart({ queue }: { queue: Customer[] }) {
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ApexCharts | null>(null);

  useEffect(() => {
    if (!elRef.current) return;

    const notFixed = queue.filter((c) => c.status === "notFixed").length;
    const inProgress = queue.filter((c) => c.status === "in-progress").length;
    const fixed = queue.filter((c) => c.status === "fixed").length;

    // If chart exists, just update it
    if (chartRef.current) {
      chartRef.current.updateSeries([notFixed, inProgress, fixed], true);
      return;
    }

    // First time: create chart
    chartRef.current = new ApexCharts(elRef.current, {
      series: [notFixed, inProgress, fixed],
      labels: ["Not Fixed", "In Progress", "Fixed"],
      colors: ["#F59E0B", "#3B82F6", "#10B981"],
      chart: { type: "pie", height: 380 },
      dataLabels: {
        enabled: true,
        formatter: (val: number, opts: any) => opts.w.config.series[opts.seriesIndex],
      },
      legend: { position: "bottom" },
    });

    chartRef.current.render();

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [queue]); // runs on every queue change, updates in place

  return (
    <div className="max-w-sm w-full bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Status Distribution
      </h2>
      <div ref={elRef} />
    </div>
  );
}