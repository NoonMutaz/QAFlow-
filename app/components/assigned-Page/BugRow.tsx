import Link from 'next/link';
import { AssignedBug, BugStatus } from './types';
import { formatDate } from './utils';
import PriorityBadge from './PriorityBadge';
import StatusSelect from './StatusSelect';
import { useLanguage } from '../../i18n/LanguageProvider';

interface BugRowProps {
  bug: AssignedBug;
  isUpdating: boolean;
  onStatusChange: (bug: AssignedBug, status: BugStatus) => void;
  onView: (bug: AssignedBug) => void;
  onResolve: (bug: AssignedBug) => void;
}

export default function BugRow({ bug, isUpdating, onStatusChange, onView, onResolve }: BugRowProps) {
  const { t } = useLanguage();
  const rowHighlight = bug.priority === 'High' ? 'border-s-4 border-s-red-500' : '';

  return (
    <li
      className={`group relative flex flex-col gap-4 bg-white px-4 py-4 transition-colors hover:bg-slate-50 sm:grid sm:grid-cols-12 sm:items-center sm:gap-0 ${rowHighlight} ${
        isUpdating ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="col-span-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2 pr-2">
        <span className="font-mono text-xs font-medium text-slate-400 min-w-[50px]">{bug.bugId}</span>
        <StatusSelect status={bug.status} disabled={isUpdating} onChange={(status) => onStatusChange(bug, status)} />
      </div>

      <div className="col-span-2 flex items-center">
        <PriorityBadge priority={bug.priority} />
      </div>

      <div className="col-span-4 flex flex-col gap-1.5">
        <p className="truncate font-medium text-slate-900 text-sm sm:text-base">
          {bug.description || t('No description provided')}
        </p>
        {bug.status === 'notFixed' && bug.reviewComment && (
          <p className="rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-700">
            <span className="font-semibold">{t("Fix rejected:")}</span> {bug.reviewComment}
          </p>
        )}
        {bug.status === 'pendingReview' && (
          <p className="text-[11px] text-amber-700">{t("Fix submitted. Waiting for the owner's approval.")}</p>
        )}

        <div className="flex flex-col gap-0.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>
              {t("Assigned by")} <strong className="text-slate-600 font-medium">{bug.assignedByName}</strong>
            </span>
            {bug.assignedAt && (
              <span className="text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded font-mono text-[10px]">
                {formatDate(bug.assignedAt)}
              </span>
            )}
          </div>
          {bug.bugDate && (
            <div className="text-slate-400">
              {t("Opened by")} <strong className="text-slate-600 font-medium">{bug.reporterName}</strong>:{' '}
              <span className="font-mono">{formatDate(bug.bugDate)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-3 flex flex-wrap items-center justify-end gap-2">
        {(bug.status === 'notFixed' || bug.status === 'in-progress') && (
          <button
            type="button"
            onClick={() => onResolve(bug)}
            className="flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
          >
            {t("Mark resolved")}
          </button>
        )}
        <button
          type="button"
          onClick={() => onView(bug)}
          className="flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:ring-slate-300 shadow-sm"
        >
          {t("View finding")}
        </button>

        <Link
          href={`/dashboard/${bug.projectId}`}
          className="flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:ring-slate-300 shadow-sm"
        >
          {t("View project")}
        </Link>
      </div>
    </li>
  );
}