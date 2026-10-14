// import { NextRequest, NextResponse } from "next/server";
// import OpenAI from "openai";
// import Fuse from "fuse.js";

// export const runtime = "nodejs";

// type SbcClause = {
//   id: number;
//   title: string;
//   expectedResult?: string;
// };

// type SuggestBody = {
//   description: string;
//   actualResult: string;
//   expectedResult?: string;
//   siteLocation?: string;
//   currentTestCaseId?: string | number | null;
//   clauses: SbcClause[];
// };

// export type SbcSuggestionResponse = {
//   testCaseId: number | null;
//   /** e.g. SBC 801, SBC 201 */
//   sbcCode: string;
//   /** e.g. Section 1005.1, Clause 4.2.3 */
//   sbcSection: string;
//   title: string;
//   reason: string;
//   confidence: "high" | "medium" | "low";
//   suggestedStandard: string;
//   source: "openai" | "fuse" | "none";
// };

// function extractSbcCodeFromText(text: string): { code: string; section: string } {
//   const codeMatch = text.match(/\bSBC\s*(\d{3})(?:\s*[-–]\s*(\d{4}))?\b/i);
//   const sectionMatch = text.match(
//     /\b(?:Section|Sec\.|Clause|Article|Part)\s*[\d]+(?:\.[\d]+)*/i,
//   );
//   const code = codeMatch
//     ? `SBC ${codeMatch[1]}${codeMatch[2] ? `-${codeMatch[2]}` : ""}`
//     : "";
//   return { code, section: sectionMatch?.[0] ?? "" };
// }

// function buildProblemText(body: SuggestBody): string {
//   const parts = [
//     body.siteLocation ? `Site location: ${body.siteLocation}` : "",
//     body.actualResult ? `Site finding: ${body.actualResult}` : "",
//     body.description ? `Detailed finding: ${body.description}` : "",
//     body.expectedResult ? `User-entered required standard: ${body.expectedResult}` : "",
//   ].filter(Boolean);
//   return parts.join("\n").trim();
// }

// function fuseLinkToProjectClause(
//   body: SuggestBody,
//   title: string,
//   suggestedStandard: string,
// ): number | null {
//   if (!body.clauses.length) return null;
//   const probe = `${title}\n${suggestedStandard}\n${buildProblemText(body)}`;
//   const fuse = new Fuse(body.clauses, {
//     keys: ["title", "expectedResult"],
//     threshold: 0.4,
//     includeScore: true,
//   });
//   const [best] = fuse.search(probe);
//   if (!best?.item || best.score === undefined || best.score > 0.5) return null;
//   return best.item.id;
// }

// function fuseSuggest(body: SuggestBody): SbcSuggestionResponse | null {
//   const problem = buildProblemText(body);
//   if (!problem || body.clauses.length === 0) return null;

//   const fuse = new Fuse(body.clauses, {
//     keys: ["title", "expectedResult"],
//     threshold: 0.45,
//     includeScore: true,
//   });

//   const [best] = fuse.search(problem);
//   if (!best?.item || best.score === undefined || best.score > 0.55) {
//     return null;
//   }

//   const confidence: SbcSuggestionResponse["confidence"] =
//     best.score <= 0.25 ? "high" : best.score <= 0.4 ? "medium" : "low";

//   const fromTitle = extractSbcCodeFromText(
//     `${best.item.title} ${best.item.expectedResult ?? ""}`,
//   );

//   return {
//     testCaseId: best.item.id,
//     sbcCode: fromTitle.code,
//     sbcSection: fromTitle.section,
//     title: best.item.title,
//     reason: "Closest match to your finding among this project’s SBC clauses (similarity).",
//     confidence,
//     suggestedStandard: best.item.expectedResult ?? "",
//     source: "fuse",
//   };
// }

// type AiKnowledgePayload = {
//   sbcReference?: string;
//   suggestedStandard?: string;
//   reason?: string;
//   confidence?: string;
//   linkedProjectClauseId?: number | null;
// };

// async function openAiKnowledgeSuggest(
//   body: SuggestBody,
// ): Promise<SbcSuggestionResponse | null> {
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) return null;

//   const problem = buildProblemText(body);
//   if (problem.length < 12) return null;

//   const clauseBlock =
//     body.clauses.length > 0
//       ? body.clauses
//           .map(
//             (c) =>
//               `- id: ${c.id} | ${c.title} | standard: ${(c.expectedResult ?? "").slice(0, 400)}`,
//           )
//           .join("\n")
//       : "";

//   const client = new OpenAI({ apiKey });

//   const completion = await client.chat.completions.create({
//     model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
//     temperature: 0.25,
//     response_format: { type: "json_object" },
//     messages: [
//       {
//         role: "system",
//         content: `You are a Saudi Building Code (SBC) compliance expert. Use your knowledge of SBC (egress, fire, structural, MEP, accessibility, etc.) to analyze inspection findings.

// From the user's form data, suggest:
// 1) The most relevant SBC reference/section title (sbcReference)
// 2) The required standard text they should cite (suggestedStandard) — concise, inspection-ready
// 3) Brief reason tying the finding to that SBC requirement
// 4) confidence: high | medium | low

// If a project clause list is provided and one clearly matches, set linkedProjectClauseId to that id; otherwise null.

// Respond with JSON only:
// {"sbcReference": string, "suggestedStandard": string, "reason": string, "confidence": "high"|"medium"|"low", "linkedProjectClauseId": number|null}`,
//       },
//       {
//         role: "user",
//         content: `${problem}${
//           clauseBlock
//             ? `\n\nProject SBC clauses (optional link):\n${clauseBlock}`
//             : "\n\n(No project clause list — suggest from SBC knowledge only.)"
//         }`,
//       },
//     ],
//   });

//   const raw = completion.choices[0]?.message?.content;
//   if (!raw) return null;

//   let parsed: AiKnowledgePayload;
//   try {
//     parsed = JSON.parse(raw);
//   } catch {
//     return null;
//   }

//   const title = parsed.sbcReference?.trim();
//   const suggestedStandard = parsed.suggestedStandard?.trim();
//   if (!title || !suggestedStandard) return null;

//   const confidence: SbcSuggestionResponse["confidence"] =
//     parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
//       ? parsed.confidence
//       : "medium";

//   let testCaseId: number | null = null;
//   const linked = parsed.linkedProjectClauseId;
//   if (typeof linked === "number" && body.clauses.some((c) => c.id === linked)) {
//     testCaseId = linked;
//   } else {
//     testCaseId = fuseLinkToProjectClause(body, title, suggestedStandard);
//   }

//   return {
//     testCaseId,
//     title,
//     reason: parsed.reason?.trim() || "Based on your site finding and SBC requirements.",
//     confidence,
//     suggestedStandard,
//     source: "openai",
//   };
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = (await req.json()) as SuggestBody;
//     const clauses = Array.isArray(body.clauses) ? body.clauses : [];

//     let suggestion: SbcSuggestionResponse | null = null;

//     try {
//       suggestion = await openAiKnowledgeSuggest({ ...body, clauses });
//     } catch (err) {
//       console.error("OpenAI SBC suggest failed, using fallback:", err);
//     }

//     if (!suggestion && clauses.length > 0) {
//       suggestion = fuseSuggest({ ...body, clauses });
//     }

//     if (!suggestion) {
//       return NextResponse.json({
//         testCaseId: null,
//         title: "",
//         reason: "",
//         confidence: "low",
//         suggestedStandard: "",
//         source: "none",
//       } satisfies SbcSuggestionResponse);
//     }

//     return NextResponse.json(suggestion);
//   } catch (err) {
//     console.error("sbc-suggest route error:", err);
//     return NextResponse.json({ error: "Failed to analyze finding" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { buildClauseIndex, rankClauses } from "./clauseMatcher";
import { apiBase, authProblem, completeWithFallback, fetchProjectDocuments, parseJsonReply, tokenFrom } from "../_lib/server";
import { libraryClauseTitle, type LibraryClause } from "./libraryClause";
import { SBC_CODES, findSbcCode, type SbcCode } from "../../data/sbcCodes";

export const runtime = "nodejs";

// Helps the engineer pick the right option from the form's "SBC Clause" menu.
// Candidates are the project's own clauses plus the shared, engineer-verified SBC
// library (/api/sbc-clauses). The AI only chooses among them; it never invents a
// clause, and when nothing fits with enough confidence it returns no match.

type SbcClause = {
  id: number;
  title: string;
  expectedResult?: string;
};


type SuggestBody = {
  description: string;
  actualResult: string;
  siteLocation?: string;
  clauses: SbcClause[];
  /** optional site photo as a data URL; the AI then also writes the finding from it */
  image?: string;
  /** interface language; the AI writes its text in it */
  lang: "en" | "ar";
  /** project whose drawings the AI compares the finding with */
  projectId?: string;
};

/** Either a clause already in the project (testCaseId) or one from the library (libraryClause). */
export type ClauseMatch = {
  testCaseId?: number;
  libraryClause?: LibraryClause;
  reason: string;
  confidence: "high" | "medium";
};

export type SbcSuggestionResponse = {
  matches: ClauseMatch[];
  source: "openai" | "keywords" | "none";
  /** true when the AI call failed (no credits, bad key, network) and keywords were used instead */
  aiUnavailable?: boolean;
  /** photo analysis only: short site finding and detailed finding written from the photo */
  finding?: string;
  details?: string;
  /** the SBC code document that governs the finding, chosen only from the official list (SBC_CODES) */
  relevantCode?: SbcCode | null;
  /** only when no verified clause matched: a clause the AI proposes from its own knowledge (unverified) */
  newClause?: NewClause | null;
  /** how the finding relates to the project drawings, when the drawings say something about it */
  drawingNote?: string;
  /** size of the SBC library the AI chose from, and why it could not be loaded */
  library?: { count: number; error?: string };
};

/** An AI-proposed clause. Its code is from the official list; the section and text are not verified. */
export type NewClause = {
  /** e.g. "SBC 801 – Section 906.1 Portable fire extinguishers" */
  title: string;
  /** required standard, saved as the clause's expected result */
  standard: string;
  reason: string;
};

/** Verified clauses from the shared library; empty when the library is empty or unreachable. */
async function fetchLibrary(token: string): Promise<{ rows: LibraryClause[]; error?: string }> {
  try {
    const res = await fetch(`${apiBase()}/api/sbc-clauses`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`sbc-suggest: SBC library request returned ${res.status}`);
      return { rows: [], error: `${res.status}` };
    }
    const rows = (await res.json()) as LibraryClause[];
    return { rows: Array.isArray(rows) ? rows.slice(0, 1000) : [] };
  } catch (err) {
    console.error("sbc-suggest: could not load the SBC library:", err);
    return { rows: [], error: "unreachable" };
  }
}

/**
 * The AI sometimes proposes a clause that is already in the library (same code and section).
 * Returns that library clause so it is shown as verified instead of "not in the library".
 */
function libraryClauseFor(title: string, library: LibraryClause[]): LibraryClause | undefined {
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

function sanitizeBody(raw: unknown): SuggestBody {
  const b = (raw ?? {}) as Partial<SuggestBody>;
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const clauses = (Array.isArray(b.clauses) ? b.clauses : [])
    .filter((c) => c && typeof c.id === "number" && typeof c.title === "string")
    .slice(0, 300)
    .map((c) => ({
      id: c.id,
      title: c.title.slice(0, 200),
      expectedResult: typeof c.expectedResult === "string" ? c.expectedResult.slice(0, 400) : undefined,
    }));
  return {
    description: text(b.description, 1500),
    actualResult: text(b.actualResult, 1500),
    siteLocation: text(b.siteLocation, 200),
    clauses,
    lang: (b as { lang?: unknown }).lang === "ar" ? "ar" : "en",
    projectId: /^\d+$/.test(String((b as { projectId?: unknown }).projectId ?? "")) ? String((b as { projectId?: unknown }).projectId) : undefined,
    image:
      typeof b.image === "string" &&
      b.image.length <= 6_000_000 &&
      /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.image)
        ? b.image
        : undefined,
  };
}

function buildFindingText(body: SuggestBody): string {
  return [
    body.siteLocation ? `Site location: ${body.siteLocation}` : "",
    body.actualResult ? `Site finding: ${body.actualResult}` : "",
    body.description ? `Detailed finding: ${body.description}` : "",
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

/**
 * One list the AI and the keyword matcher choose from. Keys are "p<id>" for project
 * clauses and "l<id>" for library clauses. A library clause already copied into the
 * project (same title) is offered only once, as the project clause.
 */
type Candidate = { key: string; title: string; text: string; match: Omit<ClauseMatch, "reason" | "confidence"> };

function buildCandidates(body: SuggestBody, library: LibraryClause[]): Candidate[] {
  const projectTitles = new Set(body.clauses.map((c) => c.title.trim().toLowerCase()));
  return [
    ...body.clauses.map((c) => ({
      key: `p${c.id}`,
      title: c.title,
      text: c.expectedResult ?? "",
      match: { testCaseId: c.id },
    })),
    ...library
      .filter((c) => !projectTitles.has(libraryClauseTitle(c).toLowerCase()))
      .map((c) => ({
        key: `l${c.id}`,
        title: libraryClauseTitle(c),
        text: c.requirementText.slice(0, 400),
        match: { libraryClause: c },
      })),
  ];
}

/** Fallback when the AI is off or fails: local keyword matcher over the same candidates. */
function keywordMatches(body: SuggestBody, candidates: Candidate[]): ClauseMatch[] {
  const index = buildClauseIndex(candidates.map((c) => ({ id: c.key, title: c.title, description: c.text })));
  const byKey = new Map(candidates.map((c) => [c.key, c]));
  return rankClauses(index, buildFindingText(body), { max: 3, minScore: 1.5 }).flatMap((r) => {
    const candidate = byKey.get(r.id);
    return candidate
      ? [{
          ...candidate.match,
          reason: `Shares words with your finding: ${r.matched.slice(0, 5).join(", ")}`,
          confidence: r.score >= 3.5 ? ("high" as const) : ("medium" as const),
        }]
      : [];
  });
}

async function aiMatches(
  body: SuggestBody,
  candidates: Candidate[],
  drawings: string,
): Promise<{ matches: ClauseMatch[]; finding: string; details: string; relevantCode: SbcCode | null; newClause: NewClause | null; drawingNote: string }> {
  const list =
    candidates.map((c) => `- ${c.key}: ${c.title}${c.text ? ` | requirement: ${c.text}` : ""}`).join("\n") ||
    "(no clauses available)";

  const photoTask = body.image
    ? `The engineer attached a site photo. First inspect it for SBC violations (fire safety, means of egress, guards, electrical, structural, accessibility, site safety) and write:
- "finding": one short sentence naming the violation you see, like an inspector's site finding.
- "details": 2-3 sentences describing what is visible and why it is non-compliant. Describe only what is actually visible; do not invent measurements.
Write "finding" and "details" in ${body.lang === "ar" ? "Arabic" : "English"}. If you see no violation, say so in "finding", leave "details" empty, and return no matches.
Then use the photo together with any text to choose clauses from the list below.

`
    : "";
  const userText = `${buildFindingText(body) || "(no text yet, use the photo)"}\n\nVerified SBC clause list:\n${list}${
    drawings ? `\n\nProject drawings (design summary written when the drawings were uploaded):\n${drawings}` : ""
  }`;

  const completion = await completeWithFallback(
    (client, model) =>
      client.chat.completions.create({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a Saudi Building Code (SBC) inspection assistant. An engineer wrote a site finding and must link it to a clause from a list of engineer-verified SBC clauses.

${photoTask}"matches": the clauses from the list that this finding actually violates, best first, at most 3. Use only keys from the list (like "p12" or "l5"). Never invent a clause, code or section number.
Only include a clause when its requirement clearly applies to the finding: "high" when it directly covers it, "medium" when it very likely applies. A clause counts even when it is worded differently or written in another language than the finding. If nothing in the list applies with that confidence, return an empty array.
"relevantCode": the code document from the official SBC 2024 list below that governs this finding, even when no clause above matches; null if it is not a building-code matter. Use only a code from this list:
${SBC_CODES.map((c) => `${c.code}: ${c.nameEn}`).join("\n")}
"newClause": ONLY when "matches" is empty, propose the clause from your own SBC knowledge, otherwise null:
   - "title": the relevantCode, then a section number ONLY if you are sure of it, then a short name, e.g. "SBC 801 – Section 906.1 Portable fire extinguishers" or "SBC 801 – Portable fire extinguishers".
   - "standard": the requirement, concise and inspection-ready, without exact figures you are unsure of.
   - "reason": one short sentence.
"drawingNote": only if project drawings are given and they say something about this finding, one or two sentences comparing the site with the design (e.g. the drawing shows the exit door opening outward but on site it opens inward); otherwise "".
The finding may be in Arabic or English; write "reason" and "drawingNote" in ${body.lang === "ar" ? "Arabic" : "English"}.

Respond with JSON only:
{${body.image ? `"finding": string, "details": string, ` : ""}"matches": [{"key": string, "reason": string, "confidence": "high"|"medium"}], "relevantCode": string | null, "newClause": {"title": string, "standard": string, "reason": string} | null, "drawingNote": string}`,
        },
        {
          role: "user",
          content: body.image
            ? [
                { type: "text", text: userText },
                { type: "image_url", image_url: { url: body.image } },
              ]
            : userText,
        },
      ],
    }),
    "sbc-suggest",
  );

  const parsed = parseJsonReply(completion.choices[0]?.message?.content ?? "{}") as {
    matches?: { key?: unknown; reason?: unknown; confidence?: unknown }[];
    finding?: unknown;
    details?: unknown;
    relevantCode?: unknown;
    newClause?: { title?: unknown; standard?: unknown; reason?: unknown } | null;
    drawingNote?: unknown;
  };
  const byKey = new Map(candidates.map((c) => [c.key, c]));
  const matches: ClauseMatch[] = (Array.isArray(parsed.matches) ? parsed.matches : [])
    // low or unknown confidence is dropped: better "no match" than an unconfirmed clause
    .filter((m) => typeof m.key === "string" && byKey.has(m.key) && (m.confidence === "high" || m.confidence === "medium"))
    .slice(0, 3)
    .map((m) => ({
      ...byKey.get(m.key as string)!.match,
      reason: typeof m.reason === "string" ? m.reason.trim() : "",
      confidence: m.confidence as "high" | "medium",
    }));

  const finding = typeof parsed.finding === "string" ? parsed.finding.trim().slice(0, 500) : "";
  const details = typeof parsed.details === "string" ? parsed.details.trim().slice(0, 1500) : "";

  const relevantCode = typeof parsed.relevantCode === "string" ? findSbcCode(parsed.relevantCode) ?? null : null;

  // AI-proposed clause: only when nothing verified matched, and its code must be on the official list
  const nc = parsed.newClause;
  const title = typeof nc?.title === "string" ? nc.title.trim().slice(0, 200) : "";
  const standard = typeof nc?.standard === "string" ? nc.standard.trim().slice(0, 800) : "";
  const codeInTitle = findSbcCode(title.match(/SBC\s*\d{3,4}/i)?.[0]);
  let newClause: NewClause | null =
    matches.length === 0 && title && standard && codeInTitle
      ? { title, standard, reason: typeof nc?.reason === "string" ? nc.reason.trim() : "" }
      : null;
  if (newClause) {
    const library = candidates.flatMap((c) => (c.match.libraryClause ? [c.match.libraryClause] : []));
    const known = libraryClauseFor(newClause.title, library);
    if (known) {
      matches.push({ libraryClause: known, reason: newClause.reason, confidence: "medium" });
      newClause = null;
    }
  }

  const drawingNote = drawings && typeof parsed.drawingNote === "string" ? parsed.drawingNote.trim().slice(0, 600) : "";

  return { matches, finding, details, relevantCode, newClause, drawingNote };
}

export async function POST(req: NextRequest) {
  try {
    const token = tokenFrom(req);
    const problem = await authProblem(token);
    if (problem || !token) {
      return NextResponse.json({ error: `Unauthorized: ${problem}` }, { status: 401 });
    }

    const body = sanitizeBody(await req.json());
    if (!body.image && buildFindingText(body).length < 12) {
      return NextResponse.json({ matches: [], source: "none" } satisfies SbcSuggestionResponse);
    }

    const [{ rows: library, error: libraryError }, documents] = await Promise.all([
      fetchLibrary(token),
      body.projectId ? fetchProjectDocuments(token, body.projectId) : Promise.resolve([]),
    ]);
    const candidates = buildCandidates(body, library);
    const drawings = documents
      .filter((d) => d.aiSummary)
      .map((d) => `[${d.fileName}]\n${d.aiSummary}`)
      .join("\n\n")
      .slice(0, 12000);

    let aiUnavailable = !process.env.AI_API_KEY && !process.env.OPENAI_API_KEY;
    if (!aiUnavailable) {
      try {
        const { matches, finding, details, relevantCode, newClause, drawingNote } = await aiMatches(body, candidates, drawings);
        return NextResponse.json({
          matches,
          relevantCode,
          newClause,
          ...(drawingNote ? { drawingNote } : {}),
          library: { count: library.length, ...(libraryError ? { error: libraryError } : {}) },
          source: "openai",
          ...(body.image ? { finding, details } : {}),
        } satisfies SbcSuggestionResponse);
      } catch (err) {
        aiUnavailable = true;
        console.error("AI SBC suggest failed, using keyword matcher:", err);
      }
    }

    const matches = candidates.length && buildFindingText(body) ? keywordMatches(body, candidates) : [];
    return NextResponse.json({
      matches,
      source: matches.length ? "keywords" : "none",
      aiUnavailable,
      library: { count: library.length, ...(libraryError ? { error: libraryError } : {}) },
    } satisfies SbcSuggestionResponse);
  } catch (err) {
    console.error("sbc-suggest route error:", err);
    return NextResponse.json({ error: "Failed to analyze finding" }, { status: 500 });
  }
}
