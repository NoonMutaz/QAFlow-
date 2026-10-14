// Server-only helpers shared by the AI routes (/api/sbc-suggest, /api/drawing-summary).
// The "_lib" folder is private: Next.js does not turn it into a route.
import type { NextRequest } from "next/server";
import OpenAI from "openai";

/** .NET API base. API_URL_INTERNAL lets the server skip the HTTPS dev cert locally (Node does not trust it). */
export const apiBase = () => process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL;

export function tokenFrom(req: NextRequest): string | undefined {
  const header = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return header && header !== "null" ? header : req.cookies.get("token")?.value;
}

/**
 * The AI routes spend your AI key, so only signed-in users may call them.
 * Returns null when the user is signed in, otherwise why not (shown in the UI).
 */
export async function authProblem(token: string | undefined): Promise<string | null> {
  const api = apiBase();
  if (!api) return "NEXT_PUBLIC_API_URL is not set on the server";
  if (!token) return "no login token was sent (log in again)";
  try {
    const res = await fetch(`${api}/api/bugs/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) return null;
    console.error(`AI route auth: ${api}/api/bugs/me returned ${res.status}`);
    return `the .NET API rejected the login token (${res.status}), log in again`;
  } catch (err) {
    const cause = (err as { cause?: { code?: string; message?: string } })?.cause;
    console.error("AI route auth: could not reach the .NET API:", err);
    return `the Next.js server could not reach the .NET API at ${api} (${cause?.code ?? cause?.message ?? String(err)})`;
  }
}

/**
 * AI provider. Google Gemini (free tier) when AI_API_KEY is set, otherwise OpenAI.
 * Gemini speaks the OpenAI request format, so the same SDK works for both.
 * AI_MODEL can list several comma-separated models; the next one is tried when one is busy.
 */
export function aiProvider(): { client: OpenAI; models: string[] } | null {
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

/** Runs a chat request on each configured model in turn until one answers (busy / missing models are skipped). */
export async function completeWithFallback(
  request: (client: OpenAI, model: string) => Promise<OpenAI.Chat.Completions.ChatCompletion>,
  label: string,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const provider = aiProvider();
  if (!provider) throw new Error("no AI key configured");
  let lastError: unknown;
  for (const model of provider.models) {
    try {
      return await request(provider.client, model);
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number }).status;
      console.error(`${label}: model ${model} failed (${status ?? "network"}), trying next`);
      // try the next model when this one is busy, missing or unreachable; stop on real request errors
      if (status !== undefined && status < 500 && status !== 404 && status !== 429) break;
    }
  }
  throw lastError;
}

/** Models sometimes wrap JSON in ```json fences or return a bare array. */
export function parseJsonReply(raw: string): Record<string, unknown> {
  const parsed = JSON.parse(raw.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, ""));
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
}

/** A project drawing as returned by GET /api/projects/{id}/documents. */
export type ProjectDocument = {
  id: number;
  projectId: number;
  fileName: string;
  url: string;
  contentType: string;
  size: number;
  aiSummary?: string | null;
};

/** The project's drawings; empty when there are none or the API is unreachable. */
export async function fetchProjectDocuments(token: string, projectId: string | number): Promise<ProjectDocument[]> {
  try {
    const res = await fetch(`${apiBase()}/api/projects/${encodeURIComponent(String(projectId))}/documents`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as ProjectDocument[];
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.error("could not load project drawings:", err);
    return [];
  }
}
