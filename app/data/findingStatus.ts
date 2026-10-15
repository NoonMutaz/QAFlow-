import type { Status } from '../context/QueueContext';

/**
 * The four states of a finding, in workflow order, with the label (English key for t()) and
 * chart colour used by the filter, the KPI cards and the charts. Colours match StatusSelect.
 */
export const FINDING_STATUSES: { value: Status; label: string; color: string }[] = [
  { value: 'notFixed', label: 'Open', color: '#EF4444' },
  { value: 'in-progress', label: 'In progress', color: '#8B5CF6' },
  { value: 'pendingReview', label: 'Awaiting approval', color: '#F59E0B' },
  { value: 'fixed', label: 'Verified', color: '#10B981' },
];

export const countByStatus = (items: { status?: string }[], status: Status) =>
  items.filter((i) => i.status === status).length;
