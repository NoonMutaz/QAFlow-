"use client";

import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

type Status = " notFixed" | "in-progress" | "done";

interface Customer {
  id: number;
  name: string;
  priority: string;
  status: Status;
}

interface ServicesStatusChartProps {
  queue: Customer[];
}

export default function ServicesStatusChart({
  queue,
}: ServicesStatusChartProps) {
  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);

    const  notFixedColor =
      computedStyle.getPropertyValue("--color-fg-brand")?.trim() || "#1447E6";

    const progressColor =
      computedStyle.getPropertyValue("--color-fg-brand-subtle")?.trim() ||
      "#90B4F8";

    const doneColor =
      computedStyle.getPropertyValue("--color-fg-brand-strong")?.trim() ||
      "#1E3A8A";

    const services = [...new Set(queue.map((c) => c.priority))];

    const  notFixedData = services.map(
      (service) =>
        queue.filter((c) => c.priority === service && c.status === " notFixed")
          .length,
    );

    const progressData = services.map(
      (service) =>
        queue.filter((c) => c.priority === service && c.status === "in-progress")
          .length,
    );

    const doneData = services.map(
      (service) =>
        queue.filter((c) => c.priority === service && c.status === "done")
          .length,
    );

    const options = {
      chart: {
        type: "bar",
        height: 380,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%",
          borderRadius: 6,
        },
      },
      dataLabels: { enabled: false },
      series: [
        {
          name: " notFixed",
          data:  notFixedData,
        },
        {
          name: "In Progress",
          data: progressData,
        },
        {
          name: "Done",
          data: doneData,
        },
      ],
      colors: [ notFixedColor, progressColor, doneColor],
      xaxis: {
        categories: services,
      },
      legend: {
        position: "top",
      },
    };

    const chartEl = document.getElementById("services-status-chart");
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
    <div className="w-full bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Bugs priority and Status Breakdown
      </h2>
      <div id="services-status-chart"></div>
    </div>
  );
}
