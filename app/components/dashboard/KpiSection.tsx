'use client';

import React from "react";
import { useLanguage } from '../../i18n/LanguageProvider';
import { countByStatus } from '../../data/findingStatus';

interface Customer {
  id: number;
  name: string;
  priority: string;
  status: string;
  createdAt: number;
}

interface KpiSectionProps {
  queue: Customer[];
}
export default function KpiSection({ queue }:KpiSectionProps) {
  const { t } = useLanguage();
  const cards = [
    { label: t("Total Non-Conformities"), value: queue.length, color: "" },
    // open = not fixed yet and nobody has submitted a fix
    { label: t("open Violation"), value: countByStatus(queue, "notFixed") + countByStatus(queue, "in-progress"), color: "text-red-600" },
    { label: t("Awaiting approval"), value: countByStatus(queue, "pendingReview"), color: "text-amber-600" },
    { label: t("Verified and Compliant"), value: countByStatus(queue, "fixed"), color: "text-green-600" },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">{c.label}</p>
            <h2 className={`text-2xl font-semibold mt-2 ${c.color}`}>{c.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
