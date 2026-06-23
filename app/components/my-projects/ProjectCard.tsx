'use client';

import type { ReactNode } from 'react';
import { type Project } from '../../context/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Status {
  label: string;
  color: 'green' | 'amber' | 'blue' | string;
}

interface QueueItem {
  status: string;
}

type Queue = Record<string | number, QueueItem[]>;

interface ProjectCardProps {
  handleDeleteClick: (project: Project) => void;
  handleInviteClick: (project: Project) => void;
  handleOpenProject: (projectId: number) => void;
  openProjectSettings: (project: Project) => void;
  isLoading: boolean;
  filteredProjects: Project[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  projects: Project[];
  getProjectStatus: (id: string | number) => Status;
  queue: Queue | null;
  isOwner: (role: string) => boolean;
}

interface MetricProps {
  label: string;
  value: number;
  danger?: boolean;
  success?: boolean;
}

interface ActionBtnProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

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
}: ProjectCardProps) {
  
  const renderEmptyState = (): ReactNode => {
    if (projects.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-8 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-bold text-slate-400 shadow-sm ring-1 ring-slate-200">
            +
          </div>
          <h3 className="mt-5 text-sm font-semibold text-slate-900">No projects yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Add your first project to start tracking work and collaborating with your team.
          </p>
        </div>
      );
    }

    if (filteredProjects.length === 0 && searchTerm) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-20 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">No results for &quot;{searchTerm}&quot;</p>
          <p className="mt-1 text-sm text-slate-500">
            Try another keyword or clear the search to see all projects.
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Clear search
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {isLoading &&
        Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[340px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-slate-100" />
                <div className="h-3 w-1/4 rounded bg-slate-50" />
              </div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="h-3 w-full rounded bg-slate-50" />
              <div className="h-3 w-4/5 rounded bg-slate-50" />
            </div>
            <div className="mt-auto grid grid-cols-3 gap-3">
              <div className="h-16 rounded-xl bg-slate-50" />
              <div className="h-16 rounded-xl bg-slate-50" />
              <div className="h-16 rounded-xl bg-slate-50" />
            </div>
            <div className="h-10 w-full rounded-lg bg-slate-100 mt-2" />
          </div>
        ))}

      {!isLoading && renderEmptyState()}

      {!isLoading &&
        filteredProjects.map((project) => {
          const status = getProjectStatus(project.id);
          const projectQueue: QueueItem[] = queue?.[project.id] ?? [];
          const bugCount = projectQueue.length;
          const fixedCount = projectQueue.filter((item) => item.status === 'fixed').length;
          const openCount = bugCount - fixedCount;
          const fixedPercent = bugCount === 0 ? 0 : Math.round((fixedCount / bugCount) * 100);
          const owner = isOwner(project.role ?? '');
          
          const statusVariant = ['green', 'amber', 'blue'].includes(status.color) 
            ? (status.color as 'green' | 'amber' | 'blue') 
            : 'slate';

          return (
            <article
              key={project.id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-slate-100 text-lg font-bold text-slate-700 shadow-sm">
                    {project.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-slate-900">
                      {project.name}
                    </h3>
                    <p className="truncate text-xs font-medium text-slate-500">
                      {project.type ?? 'General'}
                    </p>
                  </div>
                </div>
                <Badge label={status.label} variant={statusVariant} />
              </div>

              {/* Description */}
              <p className="mt-4 min-h-[2.5rem] text-sm text-slate-600 line-clamp-2">
                {project.description ?? <span className="italic text-slate-400">No description provided.</span>}
              </p>

              {/* Metrics Grid */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Metric label="Total" value={bugCount} />
                <Metric label="Open" value={openCount} danger />
                <Metric label="Fixed" value={fixedCount} success />
              </div>

              {/* Progress Bar */}
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>Progress</span>
                  <span className={fixedPercent === 100 ? 'text-emerald-600' : ''}>
                    {bugCount === 0 ? 'No issues' : `${fixedPercent}%`}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${fixedPercent}%` }}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => handleOpenProject(project.id)}
                  className="flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  View Board
                </button>
                <div className="flex items-center gap-1.5">
                  <ActionBtn
                    label="Invite Team"
                    disabled={!owner}
                    onClick={() => handleInviteClick(project)}
                    icon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.665 0v.11a2.25 2.25 0 01-2.25 2.25h-8.16a2.25 2.25 0 01-2.25-2.25z" />
                      </svg>
                    }
                  />
                  <ActionBtn
                    label="Settings"
                    disabled={!owner}
                    onClick={() => openProjectSettings(project)}
                    icon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />
                  <ActionBtn
                    label="Delete Project"
                    disabled={!owner}
                    danger
                    onClick={() => handleDeleteClick(project)}
                    icon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    }
                  />
                </div>
              </div>
            </article>
          );
        })}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({
  label,
  variant,
}: {
  label: string;
  variant: 'green' | 'amber' | 'blue' | 'purple' | 'slate';
}) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    slate: 'bg-slate-50 text-slate-700 ring-slate-600/20',
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}>
      {label}
    </span>
  );
}

function Metric({ label, value, danger, success }: MetricProps) {
  return (
    <div className="flex flex-col items-start justify-center rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p
        className={`text-lg font-semibold leading-none tracking-tight ${
          danger ? 'text-red-600' : success ? 'text-emerald-600' : 'text-slate-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ActionBtn({ label, icon, onClick, disabled, danger }: ActionBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
        disabled
          ? 'cursor-not-allowed bg-slate-50 text-slate-300'
          : danger
          ? 'bg-white text-slate-400 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200'
          : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
      }`}
    >
      <span className="flex items-center justify-center leading-none">{icon}</span>
    </button>
  );
}