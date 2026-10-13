import type { Priority } from "../../../context/QueueContext";
import type { Bug } from "./types";

/* ------------------------------ Media / misc ------------------------------ */

export const isVideo = (url?: string): boolean => !!url && /\.(mp4|webm|ogg|mov|avi)$/i.test(url);

const PRIORITY_ORDER: Priority[] = ["High", "Medium", "Low"];
export const nextPriority = (current: Priority): Priority =>
  PRIORITY_ORDER[(PRIORITY_ORDER.indexOf(current) + 1) % PRIORITY_ORDER.length];

/** Linked test case / checklist item, whichever casing the API used. */
export function getLinkedTestCase(bug: Bug): { id: unknown; title: string } | null {
  const tc = bug.testCase ?? bug.TestCase;
  const id = bug.testCaseId ?? bug.TestCaseId ?? bug.testcaseId ?? bug.TestCaseID ?? tc?.id ?? tc?.Id;
  const hasId = id !== undefined && id !== null && id !== "";
  if (!hasId && !tc) return null;
  return { id, title: tc?.title || tc?.Title || `ID: ${id}` };
}

/* -------------------------------- Deadlines ------------------------------- */

export type DeadlineTone = "none" | "ok" | "soon" | "overdue" | "done";

const DAY_MS = 86_400_000;

/** Local "YYYY-MM-DD" for today (used as the minimum of the date picker). */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parses "YYYY-MM-DD" (or the date part of an ISO string) as a local calendar day. */
function parseDay(value?: string | null): Date | null {
  const m = value?.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function getDeadlineInfo(value: string | null | undefined, status: string) {
  const due = parseDay(value);
  if (!due) return { tone: "none" as DeadlineTone, label: "Deadline", title: "Set a deadline" };

  // تنسيق التاريخ ليظهر صراحة على الزر (مثال: "15 Oct" أو "15 Oct 2026")
  const short = due.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  const full = due.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  // إذا تم توثيق وحل البند
  if (status === "fixed") {
    return { tone: "done" as DeadlineTone, label: short, title: `Deadline ${full} · verified` };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((due.getTime() - today.getTime()) / DAY_MS);

  if (daysLeft < 0) {
    return { tone: "overdue" as DeadlineTone, label: short, title: `Deadline ${full} · overdue by ${-daysLeft}d` };
  }
  if (daysLeft === 0) {
    return { tone: "soon" as DeadlineTone, label: short, title: `Deadline ${full} · Due today` };
  }
  return {
    tone: (daysLeft <= 2 ? "soon" : "ok") as DeadlineTone,
    label: short,
    title: `Deadline ${full} · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
  };
}