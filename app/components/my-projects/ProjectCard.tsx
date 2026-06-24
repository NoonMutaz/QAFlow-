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
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-8 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <h3 className="mt-5 text-base font-semibold text-slate-900">No projects yet</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
            Get started by creating your first project to track issues and collaborate with your team.
          </p>
          <button
            type="button"
            // onClick={handleCreateProject} // TODO: Wire this up to your context/modal
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Project
          </button>
        </div>
      );
    }

    if (filteredProjects.length === 0 && searchTerm) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-24 text-center shadow-sm">
          <div className="mb-4 rounded-full bg-slate-50 p-4 ring-1 ring-slate-100">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-900">No results for &quot;{searchTerm}&quot;</p>
          <p className="mt-2 text-sm text-slate-500">
            We couldn&apos;t find anything matching your search. Try adjusting your keywords.
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="mt-6 font-medium text-primary hover:text-primary/80 focus:outline-none focus:underline"
          >
            Clear Search Filter
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
            className="flex h-[340px] animate-pulse flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-1/2 rounded-md bg-slate-100" />
                <div className="h-3 w-1/3 rounded-md bg-slate-50" />
              </div>
              <div className="h-6 w-16 rounded-md bg-slate-50" />
            </div>
            <div className="mt-6 space-y-2.5">
              <div className="h-3 w-full rounded-md bg-slate-50" />
              <div className="h-3 w-5/6 rounded-md bg-slate-50" />
            </div>
            <div className="mt-8 flex h-14 rounded-xl border border-slate-100 bg-slate-50/50" />
            <div className="mt-auto flex gap-2 border-t border-slate-100 pt-5">
              <div className="h-10 flex-1 rounded-lg bg-slate-100" />
              <div className="h-10 w-10 rounded-lg bg-slate-50" />
              <div className="h-10 w-10 rounded-lg bg-slate-50" />
            </div>
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
          const isComplete = fixedPercent === 100 && bugCount > 0;
          
          const statusVariant = ['green', 'amber', 'blue'].includes(status.color) 
            ? (status.color as 'green' | 'amber' | 'blue') 
            : 'slate';

          return (
            <article
              key={project.id}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 text-lg font-bold text-slate-700 shadow-sm">
                    {project.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold tracking-tight text-slate-900">
                      {project.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-500">
                        {project.type ?? 'General'}
                      </p>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        project.role === 'owner' ? 'text-purple-600' : 'text-slate-500'
                      }`}>
                        {project.role || 'Member'}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge label={status.label} variant={statusVariant} />
              </div>

              {/* Description */}
              <p className="mt-5 min-h-[2.5rem] text-sm leading-relaxed text-slate-600 line-clamp-2">
                {project.description ?? <span className="italic text-slate-400">No description provided.</span>}
              </p>

              {/* Minimalist Integrated Metrics */}
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center divide-x divide-slate-200/60">
                  <div className="flex flex-1 flex-col pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</span>
                    <span className="mt-0.5 text-lg font-bold text-slate-900">{bugCount}</span>
                  </div>
                  <div className="flex flex-1 flex-col px-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Open</span>
                    <span className={`mt-0.5 text-lg font-bold ${openCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      {openCount}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col pl-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fixed</span>
                    <span className={`mt-0.5 text-lg font-bold ${fixedCount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {fixedCount}
                    </span>
                  </div>
                </div>

                {/* Progress Bar inside the metrics container for cohesion */}
                <div className="mt-4 pt-4 border-t border-slate-200/60">
                  <div className="flex items-end justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-500 text-[11px]">Progress</span>
                    <span className={isComplete ? 'text-emerald-600' : 'text-slate-700'}>
                      {bugCount === 0 ? '0%' : `${fixedPercent}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-slate-900'
                      }`}
                      style={{ width: `${fixedPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-auto pt-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenProject(project.id)}
                  className="flex flex-1 items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 active:scale-[0.98]"
                >
                  View Board
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <ActionBtn
                    label="Invite Team"
                    disabled={!owner}
                    onClick={() => handleInviteClick(project)}
                    icon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.665 0v.11a2.25 2.25 0 01-2.25 2.25h-8.16a2.25 2.25 0 01-2.25-2.25z" />
                      </svg>
                    }
                  />
                  <ActionBtn
                    label="Settings"
                    disabled={!owner}
                    onClick={() => openProjectSettings(project)}
                    icon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
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
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
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

function Badge({ label, variant }: { label: string; variant: 'green' | 'amber' | 'blue' | 'purple' | 'slate' }) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    slate: 'bg-slate-50 text-slate-700 ring-slate-600/20',
  }[variant];

  return (
    <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${styles}`}>
      {label}
    </span>
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
      // Added `tabIndex={-1}` for disabled buttons so screen readers don't get trapped
      tabIndex={disabled ? -1 : 0}
      className={`group flex h-10 w-10 items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
        disabled
          ? 'cursor-not-allowed bg-slate-50/50 text-slate-300'
          : danger
          ? 'bg-white text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200 shadow-sm hover:shadow'
          : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 border border-slate-200 shadow-sm hover:shadow'
      }`}
    >
      <span className={`flex items-center justify-center leading-none transition-transform ${!disabled && 'group-hover:scale-105 group-active:scale-95'}`}>
        {icon}
      </span>
    </button>
  );
}