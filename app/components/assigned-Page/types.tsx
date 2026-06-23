export type BugStatus = 'notFixed' | 'in-progress' | 'fixed';
export type BugPriority = 'High' | 'Medium' | 'Low';

export interface BugComment {
  authorName: string;
  createdAt: string;
  text: string;
}

export interface TestCaseRef {
  id?: number;
  title?: string;
}

/**
 * Normalized shape used everywhere in the UI. All the
 * `bug.foo ?? bug.Foo` guessing from the API lives in `normalizeBug`
 * (see utils.ts), so components below never have to deal with it.
 */
export interface AssignedBug {
  id: number;
  bugId: number | string;
  projectId: string;
  priority: BugPriority;
  status: BugStatus;
  description: string;
  reporterName: string;
  assignedByName: string;
  bugDate?: string;
  assignedAt?: string;
  expectedResult?: string;
  actualResult?: string;
  url?: string;
  note?: string;
  attachmentUrl?: string;
  testCase?: TestCaseRef;
  comments: BugComment[];
}

/**
 * Raw shape as it currently comes back from the API. Some endpoints
 * return PascalCase, others camelCase - this type documents both
 * until the backend response shape is unified. Update this (and
 * normalizeBug in utils.ts) if/when QueueContext's data shape changes.
 */
export interface RawAssignedBug {
  id: number;
  bugId?: number | string;
  BugId?: number | string;
  projectId?: string;
  ProjectId?: string;
  priority?: string;
  Priority?: string;
  status?: string;
  Status?: string;
  description?: string;
  Description?: string;
  name?: string;
  Name?: string;
  assignedByName?: string;
  AssignedByName?: string;
  bugDate?: string;
  bugCreatedAt?: string;
  reportedAt?: string;
  createdAt?: string;
  BugDate?: string;
  assignedAt?: string;
  assignDate?: string;
  assignedDate?: string;
  AssignedAt?: string;
  expectedResult?: string;
  ExpectedResult?: string;
  actualResult?: string;
  ActualResult?: string;
  url?: string;
  Url?: string;
  note?: string;
  Note?: string;
  attachmentUrl?: string;
  AttachmentUrl?: string;
  testCaseId?: number;
  TestCaseId?: number;
  testCase?: { title?: string };
  TestCase?: { title?: string; Title?: string };
  comments?: RawComment[];
  Comments?: RawComment[];
}

export interface RawComment {
  authorName?: string;
  AuthorName?: string;
  createdAt?: string;
  CreatedAt?: string;
  text?: string;
  Text?: string;
}