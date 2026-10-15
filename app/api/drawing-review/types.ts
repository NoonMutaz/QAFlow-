import type { LibraryClause } from "../sbc-suggest/libraryClause";

/** One point of the AI's comparison of a drawing with the SBC. */
export type DrawingReviewItem = {
  /** "issue": the drawing appears to break the code; "check": not shown clearly enough to judge */
  status: "issue" | "check";
  /** short topic, e.g. "Exit door swing" */
  topic: string;
  /** what the drawing shows (or fails to show) */
  observation: string;
  /** what the code requires, in plain words */
  requirement: string;
  /** what the designer / engineer should do */
  action: string;
  /** governing code from the official list, e.g. "SBC 201" */
  code?: string;
  /** set when the point matches a verified clause from the SBC Library */
  libraryClause?: LibraryClause;
  /** set when the point matches one of the project's clauses */
  testCaseId?: number;
  testCaseTitle?: string;
};

/** Stored on the drawing (ProjectDocument.AiReview) as JSON. */
export type DrawingReview = {
  /** what the drawing is, e.g. "Ground floor plan, Building B" */
  drawing: string;
  items: DrawingReviewItem[];
  /** items the drawing appears to meet */
  compliant: string[];
  lang: "en" | "ar";
};
