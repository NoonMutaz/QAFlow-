"use client";

import React from "react";

const stats = [
  { label: "Open Bugs", value: 42, trend: "+12% this week", trendType: "neutral" },
  { label: "Assigned Bugs", value: 18, trend: "82% team capacity", trendType: "info" },
  { label: "Overdue Bugs", value: 7, trend: "Requires attention", trendType: "critical" },
  { label: "Critical Bugs", value: 3, trend: "+35% increase", trendType: "critical" },
];

const criticalAlerts = [
  {
    id: 1,
    bugId: "BUG-201",
    title: "Payment page crashes on checkout",
    description: "Ahmed created critical blocker",
    time: "2 min ago",
  },
  {
    id: 2,
    bugId: "BUG-178",
    title: "Face ID login timeout loop",
    description: "Sarah reopened verification task",
    time: "12 min ago",
  },
];

const ownerWarnings = [
  {
    id: 1,
    type: "risk",
    title: "Project Risk Alert",
    description: "7 bugs are overdue by more than 14 days.",
    color: "border-red-200 bg-red-50 text-red-800",
    icon: "⚠️",
  },
  {
    id: 2,
    type: "workload",
    title: "Team Workload Alert",
    description: "Sarah currently owns 18 active bugs.",
    color: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "👤",
  },
  {
    id: 3,
    type: "trend",
    title: "Critical Bug Trend",
    description: "Critical bugs increased by 35% this week.",
    color: "border-blue-200 bg-blue-50 text-blue-800",
    icon: "📈",
  },
];

const timeline = [
  { icon: "🐞", text: "Ahmed created BUG-201", meta: "Payment Gateway", time: "2 min ago" },
  { icon: "🔄", text: "Sarah reopened BUG-178", meta: "Authentication", time: "12 min ago" },
  { icon: "💬", text: "Ali commented on BUG-180", meta: "Android Client", time: "30 min ago" },
  { icon: "👥", text: "Ali joined the project team", meta: "QA Tester Role", time: "1 hour ago" },
  { icon: "🔄", text: "Ahmed reassigned BUG-150", meta: "Ali → Mohammed", time: "2 hours ago" },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 text-gray-600 antialiased">
      <div className="max-w-7xl mx-auto">

        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Owner Activity Center</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Real-time project health matrices, team velocity metrics, and system risks.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Healthy
            </span>
          </div>
        </div>

        {/* High-Impact Stat Micro-Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{item.value}</h2>
              </div>
              <p className={`text-xs font-medium mt-1.5 ${
                item.trendType === 'critical' ? 'text-red-600' : 
                item.trendType === 'info' ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {item.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Core Screen Layout Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column Stack (Operations & Streams) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Critical Real-time Blocker Alert Cards */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-red-50/20 flex items-center justify-between">
                <h2 className="font-bold text-red-700 text-sm flex items-center gap-2">
                  <span>🚨</span> Action Required: Critical Bugs
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                  {criticalAlerts.length} Active
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {criticalAlerts.map((alert) => (
                  <div key={alert.id} className="p-5 hover:bg-slate-50/40 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
                            {alert.bugId}
                          </span>
                          <h3 className="font-bold text-gray-900 text-base">
                            {alert.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          {alert.description}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                        {alert.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all">
                        Inspect
                      </button>
                      <button className="px-3 py-1.5 text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg bg-white transition-all">
                        Delegate
                      </button>
                      <button className="px-3 py-1.5 text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg bg-white transition-all">
                        Deprioritize
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Combined Chronological Activity Pipeline */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span>📜</span> Project Event Stream
                </h2>
              </div>

              <div className="divide-y divide-gray-100 overflow-hidden">
                {timeline.map((item, index) => (
                  <div key={index} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/30 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm text-gray-800 font-medium block truncate">
                          {item.text}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium tracking-wide block uppercase">
                          {item.meta}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-gray-400 whitespace-nowrap font-medium">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column Stack (Insights & Controls) */}
          <div className="space-y-6">

            {/* Strategic Diagnostic Health Distribution Bar */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">
                <span>📊</span> Bug Allocation Matrix
              </h2>

              {/* Stacked Proportions Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex mb-4">
                <div className="h-full bg-blue-500 w-[50%]" title="Open Bugs" />
                <div className="h-full bg-indigo-500 w-[25%]" title="In Progress" />
                <div className="h-full bg-emerald-500 w-[15%]" title="Resolved" />
                <div className="h-full bg-red-500 w-[10%]" title="Overdue" />
              </div>

              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between items-center p-1.5 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 block" />
                    <span>Open Backlog</span>
                  </div>
                  <span className="text-gray-900 font-bold">42</span>
                </div>

                <div className="flex justify-between items-center p-1.5 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500 block" />
                    <span>In Active Triage</span>
                  </div>
                  <span className="text-gray-900 font-bold">18</span>
                </div>

                <div className="flex justify-between items-center p-1.5 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 block" />
                    <span>Resolved States</span>
                  </div>
                  <span className="text-gray-900 font-bold">25</span>
                </div>

                <div className="flex justify-between items-center p-1.5 rounded-lg bg-red-50/50 text-red-700 border border-red-100/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-red-500 block" />
                    <span>Breached Breach Target</span>
                  </div>
                  <span className="font-bold">7</span>
                </div>
              </div>
            </div>

            {/* Strategic Insight Cards */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span>🚨</span> Project Health Risks
                </h2>
              </div>

              <div className="p-4 space-y-3">
                {ownerWarnings.map((warning) => (
                  <div key={warning.id} className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${warning.color}`}>
                    <span className="text-sm shrink-0 mt-0.5">{warning.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5">{warning.title}</h4>
                      <p className="opacity-90 font-medium">{warning.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fast Control Widget Container */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">
                <span>⚡</span> Operational Macros
              </h2>

              <div className="grid grid-cols-1 gap-2 text-xs font-bold">
                <button className="w-full py-2.5 rounded-xl bg-gray-950 text-white hover:bg-gray-900 shadow-sm transition-colors text-center">
                  Review Critical Queue
                </button>

                <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white text-center">
                  Manage Team Thresholds
                </button>

                <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white text-center">
                  Audit Access Invites
                </button>

                <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white text-center">
                  Export Executive Briefing
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}