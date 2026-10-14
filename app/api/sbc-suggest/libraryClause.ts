/** A verified clause from the shared SBC library (.NET SbcClauses table). */
export type LibraryClause = {
  id: number;
  codeType: string;
  codeVersion: string;
  sectionNumber: string;
  title: string;
  requirementText: string;
  sourceUrl?: string | null;
  verifiedBy?: string | null;
  lastVerifiedAt?: number | null;
};

/** How a library clause is titled when it is copied into a project, e.g. "SBC 201 (2024) §1010.1.2 – Door swing". */
export function libraryClauseTitle(c: LibraryClause): string {
  return `${c.codeType}${c.codeVersion ? ` (${c.codeVersion})` : ""} §${c.sectionNumber} – ${c.title}`;
}
