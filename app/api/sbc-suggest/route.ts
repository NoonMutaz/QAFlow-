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
import OpenAI from "openai";
import { buildClauseIndex, rankClauses } from "./clauseMatcher";

export const runtime = "nodejs";

// Helps the engineer pick the right option from the form's "SBC Clause" menu.
// `matches` only ever holds ids that are in the menu (the project's clauses);
// when none of them fits, the AI may propose a `newClause` that is not in the menu yet.

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
};

export type ClauseMatch = {
  testCaseId: number;
  reason: string;
  confidence: "high" | "medium" | "low";
};

export type NewClause = {
  /** e.g. "SBC 201 – Section 1010.1.2 Door swing" */
  title: string;
  /** required standard text, saved as the clause's expected result */
  standard: string;
  reason: string;
};

export type SbcSuggestionResponse = {
  matches: ClauseMatch[];
  newClause?: NewClause | null;
  source: "openai" | "keywords" | "none";
  /** true when the OpenAI call failed (no credits, bad key, network) and keywords were used instead */
  aiUnavailable?: boolean;
  /** photo analysis only: short site finding and detailed finding written from the photo */
  finding?: string;
  details?: string;
};

/**
 * The endpoint spends your OpenAI key, so only signed-in users may call it.
 * Returns null when the user is signed in, otherwise why not (shown in the form).
 */
async function authProblem(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const token = header && header !== "null" ? header : req.cookies.get("token")?.value;
  // API_URL_INTERNAL lets the server skip the HTTPS dev cert locally (Node does not trust it)
  const api = process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!api) return "NEXT_PUBLIC_API_URL is not set on the server";
  if (!token) return "no login token was sent (log in again)";
  try {
    const res = await fetch(`${api}/api/bugs/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) return null;
    console.error(`sbc-suggest auth: ${api}/api/bugs/me returned ${res.status}`);
    return `the .NET API rejected the login token (${res.status}), log in again`;
  } catch (err) {
    const cause = (err as { cause?: { code?: string; message?: string } })?.cause;
    console.error("sbc-suggest auth: could not reach the .NET API:", err);
    return `the Next.js server could not reach the .NET API at ${api} (${cause?.code ?? cause?.message ?? String(err)})`;
  }
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

/** Fallback when OpenAI is off or fails: local keyword matcher over the menu's clauses. */
function keywordMatches(body: SuggestBody): ClauseMatch[] {
  const index = buildClauseIndex(
    body.clauses.map((c) => ({ id: c.id, title: c.title, description: c.expectedResult })),
  );
  return rankClauses(index, buildFindingText(body), { max: 3, minScore: 0.5 }).map((r) => ({
    testCaseId: Number(r.id),
    reason: `Shares words with your finding: ${r.matched.slice(0, 5).join(", ")}`,
    confidence: r.score >= 3.5 ? "high" : r.score >= 1.5 ? "medium" : "low",
  }));
}

/**
 * AI provider. Google Gemini (free tier) when AI_API_KEY is set, otherwise OpenAI.
 * Gemini speaks the OpenAI request format, so the same SDK works for both.
 * AI_MODEL can list several comma-separated models; the next one is tried when one is busy.
 */
function aiProvider(): { client: OpenAI; models: string[] } | null {
  const gemini = process.env.AI_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  if (!gemini && !openai) return null;
  const custom = process.env.AI_MODEL?.split(",").map((m) => m.trim()).filter(Boolean);
  return gemini
    ? {
        client: new OpenAI({
          apiKey: gemini,
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
          maxRetries: 0,
        }),
        models: custom?.length ? custom : ["gemini-3.1-flash-lite", "gemini-flash-lite-latest"],
      }
    : {
        client: new OpenAI({ apiKey: openai }),
        models: custom?.length ? custom : [process.env.OPENAI_MODEL ?? "gpt-4o-mini"],
      };
}

/** Models sometimes wrap JSON in ```json fences or return a bare array. */
function parseJsonReply(raw: string): Record<string, unknown> {
  const parsed = JSON.parse(raw.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, ""));
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
}

async function openAiMatches(
  body: SuggestBody,
): Promise<{ matches: ClauseMatch[]; newClause: NewClause | null; finding: string; details: string }> {
  const provider = aiProvider();
  if (!provider) throw new Error("no AI key configured");
  const menu =
    body.clauses
      .map((c) => `- id ${c.id}: ${c.title}${c.expectedResult ? ` | standard: ${c.expectedResult}` : ""}`)
      .join("\n") || "(the project has no clauses yet)";

  const photoTask = body.image
    ? `The engineer attached a site photo. First inspect it for SBC violations (fire safety, means of egress, guards, electrical, structural, accessibility, site safety) and write:
- "finding": one short sentence naming the violation you see, like an inspector's site finding.
- "details": 2-3 sentences describing what is visible and why it is non-compliant. Describe only what is actually visible; do not invent measurements.
If the engineer already wrote text, write in the same language; otherwise use English. If you see no violation, say so in "finding", leave "details" empty, and return no matches and no newClause.
Then use the photo together with any text to choose the clauses below.

`
    : "";
  const userText = `${buildFindingText(body) || "(no text yet, use the photo)"}\n\nSBC clause list:\n${menu}`;

  const request = (model: string) =>
    provider.client.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a Saudi Building Code (SBC) inspection assistant. An engineer wrote a site finding and must link it to ONE clause from their project's SBC clause list.

${photoTask}1) "matches": the clauses from the list that the finding violates, best first (at most 3). Only use ids from the list. Empty array if nothing in the list fits.
2) "newClause": ONLY if no clause in the list fits well, propose the correct SBC clause from your SBC knowledge:
   - "title": SBC code + section + short name, e.g. "SBC 201 – Section 1010.1.2 Door swing". Only include a section number you are sure of; otherwise give just the code and name, e.g. "SBC 801 – Fire extinguishers".
   - "standard": the requirement, concise and inspection-ready, without exact figures you are unsure of.
   - "reason": one short sentence.
   Otherwise set "newClause" to null.
The finding may be in Arabic or English; write "reason" in the same language as the finding.

Respond with JSON only:
{${body.image ? `"finding": string, "details": string, ` : ""}"matches": [{"id": number, "reason": string, "confidence": "high"|"medium"|"low"}], "newClause": {"title": string, "standard": string, "reason": string} | null}`,
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
  });

  let completion: Awaited<ReturnType<typeof request>> | null = null;
  let lastError: unknown;
  for (const model of provider.models) {
    try {
      completion = await request(model);
      break;
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number }).status;
      console.error(`sbc-suggest: model ${model} failed (${status ?? "network"}), trying next`);
      if (status !== 404 && status !== 429 && status !== 500 && status !== 503) break;
    }
  }
  if (!completion) throw lastError;

  const parsed = parseJsonReply(completion.choices[0]?.message?.content ?? "{}") as {
    matches?: { id?: unknown; reason?: unknown; confidence?: unknown }[];
    newClause?: { title?: unknown; standard?: unknown; reason?: unknown } | null;
    finding?: unknown;
    details?: unknown;
  };
  const valid = new Set(body.clauses.map((c) => c.id));
  const matches: ClauseMatch[] = (Array.isArray(parsed.matches) ? parsed.matches : [])
    .filter((m) => typeof m.id === "number" && valid.has(m.id))
    .slice(0, 3)
    .map((m) => ({
      testCaseId: m.id as number,
      reason: typeof m.reason === "string" ? m.reason.trim() : "",
      confidence: m.confidence === "high" || m.confidence === "low" ? m.confidence : "medium",
    }));

  const nc = parsed.newClause;
  const title = typeof nc?.title === "string" ? nc.title.trim().slice(0, 200) : "";
  const standard = typeof nc?.standard === "string" ? nc.standard.trim().slice(0, 800) : "";
  const newClause =
    title && standard
      ? { title, standard, reason: typeof nc?.reason === "string" ? nc.reason.trim() : "" }
      : null;

  const finding = typeof parsed.finding === "string" ? parsed.finding.trim().slice(0, 500) : "";
  const details = typeof parsed.details === "string" ? parsed.details.trim().slice(0, 1500) : "";

  return { matches, newClause, finding, details };
}

export async function POST(req: NextRequest) {
  try {
    const problem = await authProblem(req);
    if (problem) {
      return NextResponse.json({ error: `Unauthorized: ${problem}` }, { status: 401 });
    }

    const body = sanitizeBody(await req.json());
    if (!body.image && buildFindingText(body).length < 12) {
      return NextResponse.json({ matches: [], source: "none" } satisfies SbcSuggestionResponse);
    }

    let aiUnavailable = !process.env.AI_API_KEY && !process.env.OPENAI_API_KEY;
    if (!aiUnavailable) {
      try {
        const { matches, newClause, finding, details } = await openAiMatches(body);
        return NextResponse.json({
          matches,
          newClause,
          source: "openai",
          ...(body.image ? { finding, details } : {}),
        } satisfies SbcSuggestionResponse);
      } catch (err) {
        aiUnavailable = true;
        console.error("OpenAI SBC suggest failed, using keyword matcher:", err);
      }
    }

    const matches = body.clauses.length && buildFindingText(body) ? keywordMatches(body) : [];
    return NextResponse.json({
      matches,
      source: matches.length ? "keywords" : "none",
      aiUnavailable,
    } satisfies SbcSuggestionResponse);
  } catch (err) {
    console.error("sbc-suggest route error:", err);
    return NextResponse.json({ error: "Failed to analyze finding" }, { status: 500 });
  }
}
