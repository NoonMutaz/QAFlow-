import { BugStatus } from './types';
import { useLanguage } from '../../i18n/LanguageProvider';

const STATUS_STYLES: Record<BugStatus, string> = {
  fixed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'in-progress': 'bg-purple-100 text-purple-700 border-purple-200',
  pendingReview: 'bg-amber-100 text-amber-700 border-amber-200',
  notFixed: 'bg-red-100 text-red-700 border-red-200',
};

interface StatusSelectProps {
  status: BugStatus;
  onChange: (status: BugStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Assignee's status control. "Resolved" is not an option here: a finding is
 * closed only by uploading a photo of the fix (see ResolveDialog) and the
 * owner's approval. While waiting for that, the status is read-only.
 */
export default function StatusSelect({ status, onChange, disabled, size = 'md' }: StatusSelectProps) {
  const { t } = useLanguage();
  const padding = size === 'sm' ? 'p-1' : 'p-1.5';

  if (status === 'pendingReview' || status === 'fixed') {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold border rounded-lg px-2 ${padding} ${STATUS_STYLES[status]}`}>
        {status === 'pendingReview' ? t('Awaiting approval') : t('Resolved')}
      </span>
    );
  }

  return (
    <select
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as BugStatus)}
      className={`text-[11px] font-bold border rounded-lg ${padding} focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer transition-colors max-w-[125px] sm:w-auto ${STATUS_STYLES[status]}`}
    >
      <option value="notFixed">{t("Non-conformity")}</option>
      <option value="in-progress">{t("In Progress")}</option>
    </select>
  );
}
