import { BugStatus } from './types';

const STATUS_STYLES: Record<BugStatus, string> = {
  fixed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'in-progress': 'bg-purple-100 text-purple-700 border-purple-200',
  notFixed: 'bg-red-100 text-red-700 border-red-200',
};

interface StatusSelectProps {
  status: BugStatus;
  onChange: (status: BugStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusSelect({ status, onChange, disabled, size = 'md' }: StatusSelectProps) {
  const padding = size === 'sm' ? 'p-1' : 'p-1.5';

  return (
    <select
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as BugStatus)}
      className={`text-[11px] font-bold border rounded-lg ${padding} focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer transition-colors max-w-[125px] sm:w-auto ${STATUS_STYLES[status]}`}
    >
      <option value="notFixed">Not Fixed</option>
      <option value="in-progress">In Progress</option>
      <option value="fixed">Fixed</option>
    </select>
  );
}