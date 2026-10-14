import Link from 'next/link';
import { AssignedBug, BugStatus } from './types';
import { formatDate } from './utils';
import PriorityBadge from './PriorityBadge';
import StatusSelect from './StatusSelect';
import CommentThread from './CommentThread';
import { useLanguage } from '../../i18n/LanguageProvider';

interface BugDetailModalProps {
  bug: AssignedBug;
  isUpdating: boolean;
  onClose: () => void;
  onStatusChange: (bug: AssignedBug, status: BugStatus) => void;
  onAddComment: (bug: AssignedBug, text: string, imageUrl?: string) => Promise<void> | void;
  onResolve: (bug: AssignedBug) => void;
}

function isVideoAttachment(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
}

function resolveAttachmentUrl(url: string): string {
  if (url.startsWith('http')) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || '';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function BugDetailModal({ bug, isUpdating, onClose, onStatusChange, onAddComment, onResolve }: BugDetailModalProps) {
  const { t } = useLanguage();
  const resolvedAttachmentUrl = bug.attachmentUrl ? resolveAttachmentUrl(bug.attachmentUrl) : null;
  const isVideo = bug.attachmentUrl ? isVideoAttachment(bug.attachmentUrl) : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 slate-950/7bg-0 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
              {bug.bugId}
            </span>
            <PriorityBadge priority={bug.priority} />
            <StatusSelect
              status={bug.status}
              size="sm"
              disabled={isUpdating}
              onChange={(status) => onStatusChange(bug, status)}
            />
            {isUpdating && <span className="text-[11px] text-emerald-400 animate-pulse ml-1">Saving...</span>}
            {(bug.status === 'notFixed' || bug.status === 'in-progress') && (
              <button
                type="button"
                onClick={() => onResolve(bug)}
                className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
              >
                {t("Mark resolved")}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 p-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm">
          {bug.status === 'notFixed' && bug.reviewComment && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-200">
              <span className="font-bold">{t("Fix rejected by the owner:")}</span> {bug.reviewComment}
            </div>
          )}
          {bug.resolutionEvidenceUrl && bug.status === 'pendingReview' && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                {t("Fix evidence · waiting for approval")}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveAttachmentUrl(bug.resolutionEvidenceUrl)}
                alt="Fix evidence"
                className="w-full max-h-64 rounded-xl border border-slate-800 bg-slate-950 object-contain"
              />
            </div>
          )}
          {/* Reporter & Dates Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Reporter', value: bug.reporterName },
              { label: 'Assigned by', value: bug.assignedByName || '—' },
              { label: 'Created at', value: bug.bugDate ? formatDate(bug.bugDate) : '' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/60 border border-slate-800 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{t(label)}</p>
                <p className="text-xs font-semibold text-slate-200 truncate">{value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t("Description")}</p>
            <div className="text-xs text-slate-300 bg-slate-800/60 border border-slate-800 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed min-h-[48px]">
              {bug.description || <span className="text-slate-500 italic">{t("No description provided.")}</span>}
            </div>
          </div>

          {/* Expected / Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t("Expected Standard")}</p>
              <div className="text-xs text-slate-300 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl min-h-[64px] leading-relaxed">
                {bug.expectedResult || <span className="text-slate-500 italic">{t("Not defined.")}</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t("Actual Finding")}</p>
              <div className="text-xs text-slate-300 bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl min-h-[64px] leading-relaxed">
                {bug.actualResult || <span className="text-slate-500 italic">{t("Not logged.")}</span>}
              </div>
            </div>
          </div>

          {/* URL */}
          {bug.url && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t("Environment URL")}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 truncate flex-1 bg-slate-800/60 border border-slate-800 rounded-lg px-3 py-2 font-mono">
                  {bug.url}
                </span>
                <a
                  href={bug.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-900/40 whitespace-nowrap transition-all"
                >
                  Open ↗
                </a>
              </div>
            </div>
          )}

          {/* Notes */}
          {bug.note && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t("Team Notes")}</p>
              <div className="text-xs text-slate-300 bg-amber-950/20 border border-amber-900/30 p-3 rounded-xl whitespace-pre-wrap leading-relaxed">
                {bug.note}
              </div>
            </div>
          )}

          {/* Attachment */}
          {resolvedAttachmentUrl && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attachment / Evidence</p>
                <a
                  href={resolvedAttachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Open original ↗
                </a>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                {isVideo ? (
                  <video controls className="w-full max-h-80 object-contain bg-black" src={resolvedAttachmentUrl}>
                    {t("Your browser does not support the video tag.")}
                  </video>
                ) : (
                  <a href={resolvedAttachmentUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvedAttachmentUrl}
                      alt="Inspection attachment evidence"
                      className="w-full max-h-80 object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.insertAdjacentHTML(
                          'beforeend',
                          '<div class="p-4 text-xs text-rose-400 text-center">Failed to load attachment.</div>'
                        );
                      }}
                    />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Linked Test Case */}
          {bug.testCase && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t("Linked Requirement")}</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/30 text-emerald-300 text-xs font-bold border border-emerald-900/40">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {bug.testCase.title ?? `ID: ${bug.testCase.id}`}
              </span>
            </div>
          )}

          {/* Communication & Evidence Log */}
          <CommentThread
            comments={bug.comments}
            onAddComment={(text, imageUrl) => onAddComment(bug, text, imageUrl)}
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>
            {t("Audit Project:")}{' '}
            <Link href={`/dashboard/${bug.projectId}`} className="text-emerald-400 font-semibold hover:underline">
              {t("View project")} ↗
            </Link>
          </span>
          {bug.assignedAt && (
            <span>
              {t("Assigned:")} <span className="font-mono text-slate-300">{formatDate(bug.assignedAt)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}