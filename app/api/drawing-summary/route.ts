import { NextRequest, NextResponse } from "next/server";
import { apiBase, authProblem, completeWithFallback, fetchProjectDocuments, tokenFrom } from "../_lib/server";

export const runtime = "nodejs";
// Reading a multi-page PDF can take close to a minute.
export const maxDuration = 120;

const MAX_BYTES = 20 * 1024 * 1024;

/**
 * Reads one project drawing with the AI and stores a short "design summary": the facts an
 * inspector can check on site. /api/sbc-suggest later compares findings with these summaries,
 * so the (slow) drawing is read once instead of on every suggestion.
 *
 * POST { projectId, documentId, lang } -> { summary }
 */
export async function POST(req: NextRequest) {
  try {
    const token = tokenFrom(req);
    const problem = await authProblem(token);
    if (problem || !token) return NextResponse.json({ error: `Unauthorized: ${problem}` }, { status: 401 });

    const body = (await req.json()) as { projectId?: unknown; documentId?: unknown; lang?: unknown };
    const projectId = String(body.projectId ?? "");
    const documentId = Number(body.documentId);
    const lang = body.lang === "ar" ? "Arabic" : "English";
    if (!/^\d+$/.test(projectId) || !Number.isInteger(documentId)) {
      return NextResponse.json({ error: "projectId and documentId are required" }, { status: 400 });
    }

    // the document list also checks that the user is a member of the project
    const doc = (await fetchProjectDocuments(token, projectId)).find((d) => d.id === documentId);
    if (!doc) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });

    const file = await fetch(`${apiBase()}${doc.url}`, { cache: "no-store" });
    if (!file.ok) return NextResponse.json({ error: `Could not download the drawing (${file.status})` }, { status: 502 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > MAX_BYTES) return NextResponse.json({ error: "The drawing is larger than 20 MB" }, { status: 413 });
    const dataUrl = `data:${doc.contentType || "application/pdf"};base64,${bytes.toString("base64")}`;

    const completion = await completeWithFallback(
      (client, model) =>
        client.chat.completions.create({
          model,
          temperature: 0,
          messages: [
            {
              role: "system",
              content: `You review construction drawings for a site inspector who checks work against the Saudi Building Code (SBC).
From the attached drawing, list the design facts an inspector can verify on site, as short bullet points ("- ..."), at most 30:
- what the drawing is (floor / section / elevation, building, level) on the first line;
- exits, exit doors and their swing direction, corridors and stairs;
- stairs, landings, guards and handrails;
- fire protection: extinguishers, hose reels, sprinklers, alarms, fire-rated walls and doors;
- accessibility: ramps, accessible toilets and parking;
- electrical / mechanical items shown, and any dimension or note written on the drawing.
Only state what the drawing actually shows; never guess dimensions. If something is unclear, say so.
Write in ${lang}. Plain text only.`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Drawing file: ${doc.fileName}` },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      "drawing-summary",
    );

    const summary = (completion.choices[0]?.message?.content ?? "").trim().slice(0, 6000);
    if (!summary) return NextResponse.json({ error: "The AI returned an empty summary" }, { status: 502 });

    const saved = await fetch(`${apiBase()}/api/projects/${projectId}/documents/${documentId}/summary`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ summary }),
    });
    if (!saved.ok) return NextResponse.json({ error: `Could not save the summary (${saved.status})` }, { status: 502 });

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("drawing-summary route error:", err);
    const status = (err as { status?: number }).status;
    return NextResponse.json(
      { error: status === 429 || status === 503 ? "The AI is busy right now, try again in a minute" : "Could not read the drawing" },
      { status: 500 },
    );
  }
}
