"use client";

import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";
import { useLanguage } from '../../i18n/LanguageProvider';
import { FINDING_STATUSES } from '../../data/findingStatus';


interface Customer {
  id: number;
  name: string;
  priority: string;
  status: string;
}

export default function ServicesStatusChart({ queue }: { queue: Customer[] }) {
  const { t } = useLanguage();
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ApexCharts | null>(null);

  useEffect(() => {
    if (!elRef.current) return;

    // one bar per status for each severity
    const seriesFor = (services: string[]) =>
      FINDING_STATUSES.map((st) => ({
        name: t(st.label),
        data: services.map((s) => queue.filter((c) => c.priority === s && c.status === st.value).length),
      }));

    // If chart exists, just update it
    if (chartRef.current) {
      const services = [...new Set(queue.map((c) => c.priority))];
      chartRef.current.updateOptions({ xaxis: { categories: services.map((s) => t(s)) } }, false, true);
      chartRef.current.updateSeries(seriesFor(services), true);
      return;
    }

    // First time: create chart
    const services = [...new Set(queue.map((c) => c.priority))];

    chartRef.current = new ApexCharts(elRef.current, {
      chart: { type: "bar", height: 380, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 6 } },
      dataLabels: { enabled: false },
      series: seriesFor(services),
      colors: FINDING_STATUSES.map((st) => st.color),
      xaxis: { categories: services.map((s) => t(s)) },
      legend: { position: "top" },
    });

    chartRef.current.render();

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [queue, t]); // runs on every queue or language change, updates in place

  return (
    <div className="w-full bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {/* Bugs Priority and Status Breakdown */}
      {t("Severity and Compliance Breakdown")}
      </h2>
      <div ref={elRef} />
    </div>
  );
}