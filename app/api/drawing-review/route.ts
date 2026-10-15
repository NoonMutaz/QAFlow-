import { NextRequest, NextResponse } from "next/server";
import { apiBase, authProblem, completeWithFallback, fetchProjectDocuments, parseJsonReply, tokenFrom } from "../_lib/server";
import { fetchLibrary, libraryClauseFor, stripSectionNumbers } from "../_lib/sbcLibrary";
import { SBC_CODES, findSbcCode } from "../../data/sbcCodes";
import type { DrawingReview, DrawingReviewItem } from "./types";

export const runtime = "nodejs";
// Reading a multi-page PDF can take close to a minute.
export const maxDuration = 120;

const MAX_BYTES = 20 * 1024 * 1024;
const MAX_ITEMS = 15;

type ProjectClause = { id: number; title: string; expectedResult?: string };

/** The project's own SBC clauses (test cases); empty when unreachable. */
async function fetchProjectClauses(token: string, projectId: string): Promise<ProjectClause[]> {
  try {
    const res = await fetch(`${apiBase()}/api/projects/${projectId}/testcases`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as ProjectClause[];
    return Array.isArray(rows) ? rows.slice(0, 300) : [];
  } catch {
    return [];
  }
}

const text = (v: unknown, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Compares one project drawing with the Saudi Building Code: what in the design appears to break
 * the code, and what the drawing does not show clearly enough to judge. It is a first screening
 * for the engineer, not an approval. The result is stored on the drawing.
 *
 * Like /api/sbc-suggest, clause references are verified only when they match the SBC Library
 * or the project's clauses; everything else is shown without section numbers.
 *
 * POST { projectId, documentId, lang } -> DrawingReview
 */
export async function POST(req: NextRequest) {
  try {
    const token = tokenFrom(req);
    const problem = await authProblem(token);
    if (problem || !token) return NextResponse.json({ error: `Unauthorized: ${problem}` }, { status: 401 });

    const body = (await req.json()) as { projectId?: unknown; documentId?: unknown; lang?: unknown };
    const projectId = String(body.projectId ?? "");
    const documentId = Number(body.documentId);
    const lang = body.lang === "ar" ? "ar" : "en";
    if (!/^\d+$/.test(projectId) || !Number.isInteger(documentId)) {
      return NextResponse.json({ error: "projectId and documentId are required" }, { status: 400 });
    }

    // the document list also checks that the user is a member of the project
    const doc = (await fetchProjectDocuments(token, projectId)).find((d) => d.id === documentId);
    if (!doc) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });

    const [file, { rows: library }, projectClauses] = await Promise.all([
      fetch(`${apiBase()}${doc.url}`, { cache: "no-store" }),
      fetchLibrary(token),
      fetchProjectClauses(token, projectId),
    ]);
    if (!file.ok) return NextResponse.json({ error: `Could not download the drawing (${file.status})` }, { status: 502 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > MAX_BYTES) return NextResponse.json({ error: "The drawing is larger than 20 MB" }, { status: 413 });
    const dataUrl = `data:${doc.contentType || "application/pdf"};base64,${bytes.toString("base64")}`;

    // verified references the AI may cite by key
    const clauseList = [
      ...projectClauses.map((c) => `p${c.id}: ${c.title}${c.expectedResult ? ` — ${c.expectedResult}` : ""}`),
      ...library.map((c) => `l${c.id}: ${c.codeType} ${c.sectionNumber} ${c.title} — ${c.requirementText}`),
    ]
      .map((line) => line.slice(0, 400))
      .join("\n");

    const completion = await completeWithFallback(
      (client, model) =>
        client.chat.completions.create({
          model,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a building-code reviewer. Compare the attached construction drawing with the Saudi Building Code (SBC 2024) and list what an engineer should look at before construction.

Look at: means of egress (exits, exit door swing, travel distance, corridor and stair widths), stairs, guards and handrails, fire protection (extinguishers, hose reels, sprinklers, alarms, fire-rated walls and doors), accessibility (ramps, accessible toilets and parking), structure notes, electrical and plumbing items shown.

Rules:
- Only report what the drawing actually shows or clearly fails to show. Never invent dimensions; read them only when written on the drawing.
- "status": "issue" when the drawing appears to break a requirement, "check" when the drawing does not show enough to judge (missing dimension, unclear symbol).
- "code": the governing code, ONLY one of: ${SBC_CODES.map((c) => c.code).join(", ")}.
  Egress, stairs, guards, accessibility and fire-rated construction are in SBC 201; fire protection systems in SBC 801; structure in SBC 301–306; electrical in SBC 401; mechanical in SBC 501; plumbing in SBC 701; SBC 1101/1102 only for residential buildings.
- "clauseKey": the key of a clause from the list below that states the requirement, or "" when none does. Never make up a key.
- Write "topic", "observation", "requirement", "action" with NO section or clause numbers.
- "sectionGuess": your best guess of the section number, or "". It is never shown to users.
- "compliant": short points the drawing appears to meet (at most 8).
- At most ${MAX_ITEMS} items, most serious first. If the file is not a construction drawing, return no items and say so in "drawing".
Write all text in ${lang === "ar" ? "Arabic" : "English"}.

Return JSON only:
{"drawing": string, "items": [{"status": "issue"|"check", "topic": string, "observation": string, "requirement": string, "action": string, "code": string, "clauseKey": string, "sectionGuess": string}], "compliant": [string]}

Clauses you may cite by key:
${clauseList || "(none)"}`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Drawing file: ${doc.fileName}${doc.aiSummary ? `\nEarlier reading of this drawing:\n${doc.aiSummary.slice(0, 3000)}` : ""}`,
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      "drawing-review",
    );

    const parsed = parseJsonReply(completion.choices[0]?.message?.content ?? "{}");
    const rawItems = Array.isArray(parsed.items) ? (parsed.items as Record<string, unknown>[]) : [];

    const items: DrawingReviewItem[] = rawItems.slice(0, MAX_ITEMS).flatMap((raw) => {
      const topic = text(raw.topic, 160);
      const observation = text(raw.observation);
      if (!topic || !observation) return [];
      const code = typeof raw.code === "string" ? findSbcCode(raw.code)?.code : undefined;
      const key = text(raw.clauseKey, 20);
      const project = key.startsWith("p") ? projectClauses.find((c) => `p${c.id}` === key) : undefined;
      const verified =
        (key.startsWith("l") ? library.find((c) => `l${c.id}` === key) : undefined) ??
        (code ? libraryClauseFor(`${code} ${text(raw.sectionGuess, 30)}`, library) : undefined);
      const item: DrawingReviewItem = {
        status: raw.status === "issue" ? "issue" : "check",
        topic,
        observation,
        requirement: text(raw.requirement),
        action: text(raw.action),
        ...(code ? { code } : {}),
        ...(verified ? { libraryClause: verified } : {}),
        ...(project ? { testCaseId: project.id, testCaseTitle: project.title } : {}),
      };
      // nobody checked a section number the AI wrote itself
      if (!verified && !project) {
        item.topic = stripSectionNumbers(item.topic);
        item.observation = stripSectionNumbers(item.observation);
        item.requirement = stripSectionNumbers(item.requirement);
        item.action = stripSectionNumbers(item.action);
      }
      return [item];
    });
    items.sort((a, b) => (a.status === b.status ? 0 : a.status === "issue" ? -1 : 1));

    const review: DrawingReview = {
      drawing: stripSectionNumbers(text(parsed.drawing, 300)),
      items,
      compliant: (Array.isArray(parsed.compliant) ? parsed.compliant : [])
        .map((c) => stripSectionNumbers(text(c, 300)))
        .filter(Boolean)
        .slice(0, 8),
      lang,
    };

    const saved = await fetch(`${apiBase()}/api/projects/${projectId}/documents/${documentId}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ review: JSON.stringify(review) }),
    });
    if (!saved.ok) return NextResponse.json({ error: `Could not save the review (${saved.status})` }, { status: 502 });

    return NextResponse.json(review);
  } catch (err) {
    console.error("drawing-review route error:", err);
    const status = (err as { status?: number }).status;
    return NextResponse.json(
      { error: status === 429 || status === 503 ? "The AI is busy right now, try again in a minute" : "Could not compare the drawing with the code" },
      { status: 500 },
    );
  }
}
