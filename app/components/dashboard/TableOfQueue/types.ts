import type { Status, Priority } from "../../../context/QueueContext";

export interface Bug {
  id: number;
  bugId: string;
  name: string;
  priority: Priority;
  status: Status;
  description?: string;
  expectedResult?: string;
  actualResult?: string;
  url?: string;
  note?: string;
  attachmentUrl?: string;
  assignedToUserId?: number | null;
  assignedToEmail?: string | null;
  /** Due date of the assignment, "YYYY-MM-DD" (a full ISO string is also accepted). */
  deadline?: string | null;
  createdAt: string;
  // The API sometimes returns C#-cased keys (TestCase, TestCaseId...), so stay permissive.
  [key: string]: any;
}

export interface ProjectMember {
  userId: number;
  name: string;
  [key: string]: any;
}

export type UpdateBugInState = (projectId: any, bugId: number, patch: Partial<Bug>) => void;
