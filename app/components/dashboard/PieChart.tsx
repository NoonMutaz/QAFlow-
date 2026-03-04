"use client";

import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

type Status = "notFixed" | "in-progress" | "fixed";

interface Customer {
  id: number;
  name: string;
  priority: string;
  status: Status;
}

interface ServicesPieChartProps {
  queue: Customer[];
}

export default function PieChart({ queue }: ServicesPieChartProps) {
  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);

    const  notFixedColor =
      computedStyle.getPropertyValue("--color-fg-brand")?.trim() || "#F59E0B";

    const progressColor =
      computedStyle.getPropertyValue("--color-fg-brand-subtle")?.trim() ||
      "#3B82F6";

    const doneColor =
      computedStyle.getPropertyValue("--color-fg-brand-strong")?.trim() ||
      "#10B981";

    const neutralPrimaryColor =
      computedStyle.getPropertyValue("--color-neutral-primary")?.trim() ||
      "#ffffff";

    // Count by STATUS
    const  notFixedCount = queue.filter((c) => c.status === "notFixed").length;
    const inProgressCount = queue.filter(
      (c) => c.status === "in-progress",
    ).length;
    const doneCount = queue.filter((c) => c.status === "fixed").length;

    const options = {
      series: [ notFixedCount, inProgressCount, doneCount],
      labels: ["not fixed", "In Progress", "fixed"],
      colors: [ notFixedColor, progressColor, doneColor],
      chart: {
        type: "pie",
        height: 380,
      },
      stroke: {
        colors: [neutralPrimaryColor],
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number, opts: any) {
          return opts.w.config.series[opts.seriesIndex];
        },
      },
      legend: {
        position: "bottom",
      },
    };

    const chartEl = document.getElementById("services-pie");

    let chart: ApexCharts | null = null;

    if (chartEl) {
      chart = new ApexCharts(chartEl, options);
      chart.render();
    }

    return () => {
      if (chart) chart.destroy();
    };
  }, [queue]);

  return (
    <div className="max-w-sm w-full bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
         Status Distribution
      </h2>
      <div id="services-pie" className="w-full"></div>
    </div>
  );
}
