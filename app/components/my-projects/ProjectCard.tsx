'use client';

import React from 'react';

export default function ProjectCard({
  handleDeleteClick,
  handleInviteClick,
  handleOpenProject,
  openProjectSettings,
  isLoading,
  filteredProjects,
  searchTerm,
  setSearchTerm,
  projects,
  getProjectStatus,
  queue,
  isOwner,
}) {

  const renderEmptyState = () => {
    if (projects.length === 0) {
      return (
        <div className="col-span-full py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
           
          </div>
          <h3 className="text-lg font-semibold text-gray-700">
            No Projects Yet
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Create your first project to start tracking bugs
          </p>
        </div>
      );
    }

    if (filteredProjects.length === 0 && searchTerm) {
      return (
        <div className="col-span-full py-20 text-center">
          <p className="text-gray-500 font-medium">
            No results for “{searchTerm}”
          </p>

          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
          >
            Clear search
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

      {isLoading &&
        Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 rounded-2xl bg-white border border-gray-100 animate-pulse"
          />
        ))}

      {!isLoading && renderEmptyState()}

      {!isLoading &&
        filteredProjects.map((project) => {
          const status = getProjectStatus(project.id);
          const bugCount = queue?.[project.id]?.length ?? 0;
          const fixedCount =
            queue?.[project.id]?.filter((b) => b.status === "fixed").length ?? 0;

          const owner = isOwner(project.role);

          return (
            <div
              key={project.id}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm
                         hover:shadow-md hover:-translate-y-1 transition-all flex flex-col"
            >

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                    {project.name?.[0]?.toUpperCase() || "?"}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {project.description || "No description"}
                    </p>
                  </div>
                </div>

     {/* ✅ FIXED Role Badge - Shows ALL 3 roles */}
<div className="flex items-center gap-2">
  <span
    className={`text-xs px-2 py-1 rounded-full font-medium ${
      project.role === 'owner'
        ? 'bg-red-100 text-red-800 border border-red-200'
        : project.role === 'member'
        ? 'bg-blue-100 text-blue-800 border border-blue-200'
        : 'bg-gray-100 text-gray-800 border border-gray-200'
    }`}
  >
    {project.role ? project.role.charAt(0).toUpperCase() + project.role.slice(1) : 'Member'}
  </span>
</div>
              </div>

              {/* Status */}
              <div className="mt-4">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    status.color === "green"
                      ? "bg-green-100 text-green-700"
                      : status.color === "amber"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {status.label}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Metric label="Bugs" value={bugCount} />
                <Metric label="Open" value={bugCount - fixedCount} danger />
                <Metric label="Fixed" value={fixedCount} success />
              </div>

              {/* Type */}
              <div className="mt-4">
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  {project.type || "General"}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-2">

                <button
                  onClick={() => handleOpenProject(project.id)}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold
                             hover:bg-blue-700 transition"
                >
                  Open
                </button>

                <ActionBtn
                  label="Invite"
                  icon="👥"
                  disabled={!owner}
                  onClick={() => handleInviteClick(project)}
                />

                <ActionBtn
                  label="Settings"
                  icon="⚙️"
                
                  disabled={!owner}
                  onClick={() => openProjectSettings(project)}
                />

                <ActionBtn
                  label="Delete"
                  icon="🗑️"
                  disabled={!owner}
                  danger
                  onClick={() => handleDeleteClick(project)}
                />

              </div>
            </div>
          );
        })}
    </div>
  );
}

/* ---------- small reusable UI pieces ---------- */

function Metric({ label, value, danger, success }) {
  return (
    <div className="bg-gray-50 rounded-xl p-2 text-center">
      <p
        className={`text-lg font-bold ${
          danger ? "text-red-600" : success ? "text-green-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function ActionBtn({ label, icon, onClick, disabled, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition
        ${
          disabled
            ? "bg-gray-300 text-gray-300 cursor-not-allowed opacity-47"
            : "danger bg-gray-300"
            ? " hover:bg-gray-200 bg-red-50 hover:text-red-600 text-gray-600"
            : "hover:bg-gray-600 text-gray-600"
        }`}
    >
      {icon}
    </button>
  );
}