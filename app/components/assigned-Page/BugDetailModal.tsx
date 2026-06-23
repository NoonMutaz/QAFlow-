import Link from 'next/link';
import { AssignedBug, BugStatus } from './types';
import { formatDate } from './utils';
import PriorityBadge from './PriorityBadge';
import StatusSelect from './StatusSelect';
import CommentThread from './CommentThread';

interface BugDetailModalProps {
  bug: AssignedBug;
  isUpdating: boolean;
  onClose: () => void;
  onStatusChange: (bug: AssignedBug, status: BugStatus) => void;
  onAddComment: (bug: AssignedBug, text: string) => Promise<void> | void;
}

function isVideoAttachment(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
}

function resolveAttachmentUrl(url: string): string {
  if (url.startsWith('http')) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || '';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function BugDetailModal({ bug, isUpdating, onClose, onStatusChange, onAddComment }: BugDetailModalProps) {
  const resolvedAttachmentUrl = bug.attachmentUrl ? resolveAttachmentUrl(bug.attachmentUrl) : null;
  const isVideo = bug.attachmentUrl ? isVideoAttachment(bug.attachmentUrl) : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              {bug.bugId}
            </span>
            <PriorityBadge priority={bug.priority} />
            <StatusSelect
              status={bug.status}
              size="sm"
              disabled={isUpdating}
              onChange={(status) => onStatusChange(bug, status)}
            />
            {isUpdating && <span className="text-[11px] text-slate-400 animate-pulse ml-1">Saving...</span>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm">
          {/* Reporter & Dates Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Reporter', value: bug.reporterName },
              { label: 'Assigned by', value: bug.assignedByName || '—' },
              { label: 'Created at', value: bug.bugDate ? formatDate(bug.bugDate) : '' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                <p className="text-xs font-semibold text-slate-700 truncate">{value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</p>
            <div className="text-xs text-slate-700 bg-slate-50 border border-slate-100 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed min-h-[48px]">
              {bug.description || <span className="text-slate-400 italic">No description provided.</span>}
            </div>
          </div>

          {/* Expected / Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Expected Result</p>
              <div className="text-xs text-slate-700 bg-emerald-50/40 border border-emerald-100 p-3 rounded-xl min-h-[64px] leading-relaxed">
                {bug.expectedResult || <span className="text-slate-400 italic">Not defined.</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Actual Result</p>
              <div className="text-xs text-slate-700 bg-rose-50/40 border border-rose-100 p-3 rounded-xl min-h-[64px] leading-relaxed">
                {bug.actualResult || <span className="text-slate-400 italic">Not logged.</span>}
              </div>
            </div>
          </div>

          {/* URL */}
          {bug.url && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Environment URL</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 truncate flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 font-mono">
                  {bug.url}
                </span>
                <a
                  href={bug.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 whitespace-nowrap transition-all"
                >
                  Open ↗
                </a>
              </div>
            </div>
          )}

          {/* Notes */}
          {bug.note && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Team Notes</p>
              <div className="text-xs text-slate-700 bg-amber-50/40 border border-amber-100 p-3 rounded-xl whitespace-pre-wrap leading-relaxed">
                {bug.note}
              </div>
            </div>
          )}

          {/* Attachment */}
          {resolvedAttachmentUrl && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attachment</p>
                <a
                  href={resolvedAttachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Open original ↗
                </a>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100/50 shadow-inner">
                {isVideo ? (
                  <video controls className="w-full max-h-80 object-contain bg-black" src={resolvedAttachmentUrl}>
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <a href={resolvedAttachmentUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvedAttachmentUrl}
                      alt="Bug reproduction attachment"
                      className="w-full max-h-80 object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.insertAdjacentHTML(
                          'beforeend',
                          '<div class="p-4 text-xs text-red-500 text-center">Failed to load attachment.</div>'
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Linked Test Case</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
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

          {/* Communication */}
          <CommentThread comments={bug.comments} onAddComment={(text) => onAddComment(bug, text)} />
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
          <span>
            Project:{' '}
            <Link href={`/dashboard/${bug.projectId}`} className="text-blue-600 font-semibold hover:underline">
              View project ↗
            </Link>
          </span>
          {bug.assignedAt && (
            <span>
              Assigned: <span className="font-mono text-slate-500">{formatDate(bug.assignedAt)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}