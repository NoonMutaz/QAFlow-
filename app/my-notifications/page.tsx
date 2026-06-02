"use client";

import React, { useState, useMemo } from "react";

const INITIAL_ACTIVITIES = [
  {
    id: 1,
    type: "bug",
    title: "New Bug Created",
    description: "Ahmed created BUG-104",
    details: "Login page crashes after invalid login attempt",
    time: "2 min ago",
    period: "Today",
    unread: true,
  },
  {
    id: 2,
    type: "status",
    title: "Status Updated",
    description: "Sarah changed BUG-104",
    details: "Open → In Progress",
    time: "15 min ago",
    period: "Today",
    unread: true,
  },
  {
    id: 3,
    type: "comment",
    title: "New Comment",
    description: "Ali commented on BUG-104",
    details: "Unable to reproduce on Android device",
    time: "30 min ago",
    period: "Today",
    unread: false,
  },
  {
    id: 4,
    type: "assignment",
    title: "Bug Assigned",
    description: "Ahmed assigned BUG-105 to you",
    details: "Payment gateway timeout issue",
    time: "1 hour ago",
    period: "Today",
    unread: false,
  },
  {
    id: 5,
    type: "invite",
    title: "Project Invitation",
    description: "You were invited to Mobile App QA",
    details: "Join project as QA Tester",
    time: "2 hours ago",
    period: "Today",
    unread: true,
  },
  {
    id: 6,
    type: "resolved",
    title: "Bug Resolved",
    description: "Sarah marked BUG-102 as Fixed",
    details: "Export report issue resolved",
    time: "Yesterday",
    period: "Yesterday",
    unread: false,
  },
];

const TYPE_CONFIG: Record<string, { icon: string; bg: string; text: string }> = {
  bug: { icon: "🐞", bg: "bg-red-50 text-red-700 border-red-100", text: "text-red-700" },
  status: { icon: "🔄", bg: "bg-blue-50 text-blue-700 border-blue-100", text: "text-blue-700" },
  comment: { icon: "💬", bg: "bg-orange-50 text-orange-700 border-orange-100", text: "text-orange-700" },
  assignment: { icon: "🎯", bg: "bg-amber-50 text-amber-700 border-amber-100", text: "text-amber-700" },
  invite: { icon: "✉️", bg: "bg-purple-50 text-purple-700 border-purple-100", text: "text-purple-700" },
  resolved: { icon: "✅", bg: "bg-emerald-50 text-emerald-700 border-emerald-100", text: "text-emerald-700" },
};

export default function Page() {
  const [feed, setFeed] = useState(INITIAL_ACTIVITIES);
  const [filter, setFilter] = useState("all");

  const stats = useMemo(() => {
    return {
      total: feed.length,
      unread: feed.filter((x) => x.unread).length,
    };
  }, [feed]);

  const handleMarkAllRead = () => {
    setFeed((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const markAsRead = (id: number) => {
    setFeed((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)));
  };

  // Separate Action Items from Informational Logs
  const processedGroups = useMemo(() => {
    const currentFeed = filter === "all" ? feed : feed.filter((x) => x.type === filter);

    // 1. High priority items needing immediate human action loops
    const actionInbox = currentFeed.filter((x) => x.type === "invite" || x.type === "assignment");
    
    // 2. Timeline history data split down by chronology periods
    const timelineItems = currentFeed.filter((x) => x.type !== "invite" && x.type !== "assignment");
    
    const chronologicalGroups: Record<string, typeof timelineItems> = {};
    timelineItems.forEach((item) => {
      if (!chronologicalGroups[item.period]) chronologicalGroups[item.period] = [];
      chronologicalGroups[item.period].push(item);
    });

    return { actionInbox, chronologicalGroups };
  }, [feed, filter]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-600 antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Dashboard Area */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inbox & Updates</h1>
            <p className="text-sm text-gray-500 mt-0.5">Stay on top of critical requests and systemic logs.</p>
          </div>
          <div className="flex items-center gap-2">
            {stats.unread > 0 && (
              <span className="text-xs px-2.5 py-1 font-semibold bg-blue-100 text-blue-800 rounded-lg">
                {stats.unread} unread
              </span>
            )}
            <button
              onClick={handleMarkAllRead}
              disabled={stats.unread === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm"
            >
              Mark All Read
            </button>
          </div>
        </div>

        {/* Dynamic Filter Pill Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 border-b border-gray-200/60">
          {[
            { v: "all", l: "All Activity" },
            { v: "invite", l: "Invites" },
            { v: "assignment", l: "Assignments" },
            { v: "bug", l: "Bugs" },
            { v: "comment", l: "Comments" },
            { v: "status", l: "Status Logs" }
          ].map((tab) => (
            <button
              key={tab.v}
              onClick={() => setFilter(tab.v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === tab.v
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              {tab.l}
            </button>
          ))}
        </div>

        {/* SECTION 1: Action Required Inbox (Pins Invitations and Direct Assignments) */}
        {processedGroups.actionInbox.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              ⚡ Action Required
            </h2>
            <div className="space-y-2.5">
              {processedGroups.actionInbox.map((item) => {
                const config = TYPE_CONFIG[item.type];
                return (
                  <div
                    key={item.id}
                    onClick={() => item.unread && markAsRead(item.id)}
                    className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      item.unread ? "border-l-4 border-l-purple-500 border-y-gray-200 border-r-gray-200 bg-purple-50/5" : "border-gray-200/80"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg shrink-0 ${config.bg}`}>
                        {config.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">{item.description}</h4>
                          {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.details}</p>
                        <span className="text-[10px] font-medium text-gray-400 mt-1 block">{item.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 sm:self-center self-end">
                      {item.type === "invite" ? (
                        <>
                          <button className="px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-all">
                            Accept
                          </button>
                          <button className="px-3 py-1.5 text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg bg-white transition-all">
                            Decline
                          </button>
                        </>
                      ) : (
                        <button className="px-3 py-1.5 text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg bg-white transition-all">
                          Claim Task
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: System Activity Timeline Logs */}
        {Object.keys(processedGroups.chronologicalGroups).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(processedGroups.chronologicalGroups).map(([period, items]) => (
              <div key={period}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  {period}
                </h2>
                
                {/* Clean, low-profile stacked timeline layout */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm divide-y divide-gray-100 overflow-hidden">
                  {items.map((item) => {
                    const config = TYPE_CONFIG[item.type];
                    return (
                      <div
                        key={item.id}
                        onClick={() => item.unread && markAsRead(item.id)}
                        className={`p-3.5 flex items-start justify-between gap-4 group transition-all cursor-pointer ${
                          item.unread ? "bg-blue-50/20" : "hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-base mt-0.5 block shrink-0">{config.icon}</span>
                          <div>
                            <p className="text-sm text-gray-700 font-medium leading-tight">
                              <span className="text-gray-900 font-semibold">{item.description.split(" ")[0]}</span>
                              {item.description.substring(item.description.indexOf(" "))}
                              {item.details && (
                                <span className="text-gray-400 font-normal ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                  {item.details}
                                </span>
                              )}
                            </p>
                            <span className="text-[10px] text-gray-400 font-normal mt-1 block">{item.time}</span>
                          </div>
                        </div>

                        {item.unread && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 self-center shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          processedGroups.actionInbox.length === 0 && (
            /* Shared Clean Empty Fallback Component Frame */
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <span className="text-3xl block mb-2">✨</span>
              <h3 className="text-sm font-bold text-gray-900">Workspace looks perfectly clean</h3>
              <p className="text-xs text-gray-400 mt-1">No activities found under the current dashboard configurations.</p>
            </div>
          )
        )}

      </div>
    </div>
  );
}