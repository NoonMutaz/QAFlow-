import { BugPriority } from './types';

const PRIORITY_STYLES: Record<BugPriority, string> = {
  High: 'bg-red-50 text-red-700 border-red-100 ring-red-500/20',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20',
};

interface PriorityBadgeProps {
  priority: BugPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.Low;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {priority}
    </span>
  );
}