// Server-only helpers for the verified SBC library, shared by /api/sbc-suggest and /api/drawing-review.
import { apiBase } from "./server";
import { findSbcCode } from "../../data/sbcCodes";
import type { LibraryClause } from "../sbc-suggest/libraryClause";

/** Verified clauses from the shared library; empty when the library is empty or unreachable. */
export async function fetchLibrary(token: string): Promise<{ rows: LibraryClause[]; error?: string }> {
  try {
    const res = await fetch(`${apiBase()}/api/sbc-clauses`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`SBC library: request returned ${res.status}`);
      return { rows: [], error: `${res.status}` };
    }
    const rows = (await res.json()) as LibraryClause[];
    return { rows: Array.isArray(rows) ? rows.slice(0, 1000) : [] };
  } catch (err) {
    console.error("SBC library: could not load the SBC library:", err);
    return { rows: [], error: "unreachable" };
  }
}

/**
 * The AI sometimes proposes a clause that is already in the library (same code and section).
 * Returns that library clause so it is shown as verified instead of "not in the library".
 */
export function libraryClauseFor(title: string, library: LibraryClause[]): LibraryClause | undefined {
  const code = findSbcCode(title.match(/SBC\s*\d{3,4}/i)?.[0]);
  if (!code) return undefined;
  const rest = title.replace(/SBC\s*\d{3,4}/i, "");
  const sections = rest.match(/\d{3,4}(?:\.\d+)*/g) ?? [];
  return library.find((c) => {
    if (findSbcCode(c.codeType)?.code !== code.code) return false;
    const lib = c.sectionNumber.trim();
    return sections.some((s) => s === lib || lib.startsWith(`${s}.`) || s.startsWith(`${lib}.`));
  });
}

/**
 * Removes section / clause numbers from AI text ("Section 1031.3", "§906.1", "المادة 1015.2", "1031.3"),
 * keeping code names like "SBC 801". Unverified suggestions must not show numbers nobody has checked.
 */
export function stripSectionNumbers(text: string): string {
  return text
    .replace(/\(?\s*(?:Sections?|Sec\.?|Clauses?|Articles?|Paragraph)\s*\d{2,4}(?:\.\d+)*\s*\)?/gi, " ")
    .replace(/\(?\s*§+\s*\d{2,4}(?:\.\d+)*\s*\)?/g, " ")
    // Arabic, including the word that introduces it: "وفقًا للمادة 1031.3 من الكود", "حسب البند 906.1"
    .replace(/(?:(?:وفق|طبق)[اًً]*\s*|حسب\s*)?\(?\s*[وفبل]*(?:ال)?(?:مادة|مواد|بند|فقرة|قسم)\s*\(?\d{2,4}(?:\.\d+)*\)?\s*\)?(?:\s*من\s*الكود)?/g, " ")
    .replace(/(?:\b(?:per|under|see|according to|as per|in accordance with)\s+)?\b\d{3,4}(?:\.\d+)+\b/gi, " ")
    .replace(/\s+([،,.:;])/g, "$1")
    .replace(/(\s*[–—-]\s*){2,}/g, " – ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s–—\-:،,]+|[\s–—\-:،,]+$/g, "")
    .trim();
}
