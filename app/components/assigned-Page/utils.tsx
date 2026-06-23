import {
  AssignedBug,
  BugComment,
  BugPriority,
  BugStatus,
  RawAssignedBug,
  RawComment,
  TestCaseRef,
} from './types.js';

const PRIORITY_VALUES: readonly BugPriority[] = ['High', 'Medium', 'Low'];
const STATUS_VALUES: readonly BugStatus[] = ['notFixed', 'in-progress', 'fixed'];

function toBugPriority(value: unknown): BugPriority {
  return typeof value === 'string' && (PRIORITY_VALUES as readonly string[]).includes(value)
    ? (value as BugPriority)
    : 'Low';
}

function toBugStatus(value: unknown): BugStatus {
  return typeof value === 'string' && (STATUS_VALUES as readonly string[]).includes(value)
    ? (value as BugStatus)
    : 'notFixed';
}

function normalizeComment(raw: RawComment): BugComment {
  return {
    authorName: raw.authorName ?? raw.AuthorName ?? 'Unknown User',
    createdAt: raw.createdAt ?? raw.CreatedAt ?? '',
    text: raw.text ?? raw.Text ?? '',
  };
}

function normalizeTestCase(raw: RawAssignedBug): TestCaseRef | undefined {
  const testCase = raw.testCase ?? raw.TestCase;
  const testCaseId = raw.testCaseId ?? raw.TestCaseId;

  if (!testCase && testCaseId === undefined) return undefined;

  return {
    id: testCaseId,
    title: testCase?.title ?? (testCase as { Title?: string } | undefined)?.Title,
  };
}

/** Converts a raw API bug (PascalCase or camelCase) into the normalized shape. */
export function normalizeBug(raw: RawAssignedBug): AssignedBug {
  return {
    id: raw.id,
    bugId: raw.bugId ?? raw.BugId ?? raw.id,
    projectId: raw.projectId ?? raw.ProjectId ?? '',
    priority: toBugPriority(raw.priority ?? raw.Priority),
    status: toBugStatus(raw.status ?? raw.Status),
    description: raw.description ?? raw.Description ?? '',
    reporterName: raw.name ?? raw.Name ?? '',
    assignedByName: raw.assignedByName ?? raw.AssignedByName ?? '',
    bugDate: raw.bugDate ?? raw.bugCreatedAt ?? raw.reportedAt ?? raw.createdAt ?? raw.BugDate,
    assignedAt: raw.assignedAt ?? raw.assignDate ?? raw.assignedDate ?? raw.AssignedAt,
    expectedResult: raw.expectedResult ?? raw.ExpectedResult,
    actualResult: raw.actualResult ?? raw.ActualResult,
    url: raw.url ?? raw.Url,
    note: raw.note ?? raw.Note,
    attachmentUrl: raw.attachmentUrl ?? raw.AttachmentUrl,
    testCase: normalizeTestCase(raw),
    comments: (raw.comments ?? raw.Comments ?? []).map(normalizeComment),
  };
}

/**
 * Formats a date value for display. Accepts an ISO string, a unix
 * timestamp (number or numeric string), or an already-formatted
 * string (e.g. one containing a comma), which is passed through as-is.
 */
export function formatDate(value: string | number | undefined | null): string {
  if (!value) return '';

  if (typeof value === 'string' && Number.isNaN(Number(value)) && value.includes(',')) {
    return value;
  }

  const timestamp = Number.isNaN(Number(value)) ? Date.parse(String(value)) : Number(value);
  if (Number.isNaN(timestamp)) return String(value);

  return new Date(timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Active (not-fixed) bugs, ordered High -> Medium -> Low priority. */
export function sortAssignedBugs(bugs: AssignedBug[]): AssignedBug[] {
  const priorityScore: Record<BugPriority, number> = { High: 3, Medium: 2, Low: 1 };
  return [...bugs]
    .filter((bug) => bug.status !== 'fixed')
    .sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);
}