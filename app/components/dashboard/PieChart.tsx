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

export default function PieChart({ queue }: { queue: Customer[] }) {
  const { t } = useLanguage();
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ApexCharts | null>(null);

  useEffect(() => {
    if (!elRef.current) return;

    const series = FINDING_STATUSES.map((st) => queue.filter((c) => c.status === st.value).length);
    const labels = FINDING_STATUSES.map((st) => t(st.label));

    // If chart exists, just update it
    if (chartRef.current) {
      chartRef.current.updateOptions({ labels }, false, false);
      chartRef.current.updateSeries(series, true);
      return;
    }

    //  create chart
    chartRef.current = new ApexCharts(elRef.current, {
      series,
      labels,
      colors: FINDING_STATUSES.map((st) => st.color),
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
  }, [queue, t]); // runs on every queue or language change, updates in place

  return (
    <div className="max-w-sm w-full bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
    {/* //    Status Distribution */}
{t("SBC Compliance Status")}
      </h2>
      <div ref={elRef} />
    </div>
  );
}