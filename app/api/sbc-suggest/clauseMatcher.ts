// Deterministic clause matcher (no network, no key). Arabic + English.
// The inspector always makes the final choice; this only ranks candidates.

export interface ClauseLike {
  id: number | string;
  title?: string;
  description?: string;
  keywords?: string[] | string;
  code?: string;
}

export interface ClauseSuggestion {
  id: string;
  title: string;
  score: number;
  matched: string[]; // query words that triggered the match (for "why")
}

interface IndexedClause {
  id: string;
  title: string;
  fields: { tokens: string[]; weight: number }[];
  numbers: string[];
}

export interface ClauseIndex {
  clauses: IndexedClause[];
  idf: Map<string, number>;
}

const STOP = new Set([
  'the', 'a', 'an', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'is', 'are', 'was', 'were', 'be', 'for', 'with',
  'not', 'no', 'there', 'this', 'that', 'it', 'by', 'from', 'as', 'has', 'have', 'had', 'found', 'sbc',
  'في', 'من', 'على', 'الى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تم', 'ان', 'او', 'و', 'لا', 'ما', 'هناك', 'كان', 'يوجد',
]);

export function normalizeText(input: string): string {
  return (input ?? '')
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '') // diacritics, tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/(\d)\.(?=\d)/g, '$1_DOT_') // keep clause numbers like 5.2
    .replace(/[^\p{L}\p{N}_\s]/gu, ' ')
    .replace(/_DOT_/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

function stem(w: string): string {
  if (/^[a-z]+$/.test(w)) {
    if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    return w;
  }
  if (w.length > 4 && w.startsWith('ال')) w = w.slice(2);
  if (w.length > 4 && /^[وبلف]ال/.test(w)) w = w.slice(3);
  if (w.length > 4 && (w.endsWith('ات') || w.endsWith('ون') || w.endsWith('ين'))) w = w.slice(0, -2);
  return w;
}

export function tokenize(input: string): string[] {
  return normalizeText(input)
    .split(' ')
    .filter((w) => w.length >= 2 && !STOP.has(w) && !/^\d+$/.test(w))
    .map(stem);
}

function numbersIn(input: string): string[] {
  return normalizeText(input).match(/\d+(?:\.\d+)+/g) ?? [];
}

function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : b.slice(i + 1) === a.slice(i);
}

function tokenMatch(q: string, t: string): number {
  if (q === t) return 1;
  if (q.length >= 4 && t.length >= 4 && (t.startsWith(q) || q.startsWith(t))) return 0.7;
  if (withinOneEdit(q, t)) return 0.6;
  return 0;
}

export function buildClauseIndex(clauses: ClauseLike[]): ClauseIndex {
  const df = new Map<string, number>();
  const indexed: IndexedClause[] = clauses.map((c) => {
    const kw = Array.isArray(c.keywords) ? c.keywords.join(' ') : c.keywords ?? '';
    const title = c.title ?? '';
    const fields = [
      { tokens: tokenize(`${title} ${c.code ?? ''}`), weight: 3 },
      { tokens: tokenize(kw), weight: 3 },
      { tokens: tokenize(c.description ?? ''), weight: 1 },
    ];
    new Set(fields.flatMap((f) => f.tokens)).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1));
    return {
      id: String(c.id),
      title,
      fields,
      numbers: numbersIn(`${title} ${c.code ?? ''} ${kw} ${c.description ?? ''}`),
    };
  });
  const n = Math.max(indexed.length, 1);
  const idf = new Map<string, number>();
  df.forEach((d, t) => idf.set(t, Math.log(1 + (n - d + 0.5) / (d + 0.5))));
  return { clauses: indexed, idf };
}

export interface RankOptions {
  max?: number;
  minScore?: number;
  relativeCutoff?: number;
}

export function rankClauses(index: ClauseIndex, query: string, opts: RankOptions = {}): ClauseSuggestion[] {
  const { max = 3, minScore = 0.9, relativeCutoff = 0.45 } = opts;
  const qTokens = Array.from(new Set(tokenize(query)));
  const qNumbers = numbersIn(query);
  if (!qTokens.length && !qNumbers.length) return [];

  const scored: ClauseSuggestion[] = [];
  for (const c of index.clauses) {
    let score = 0;
    const matched: string[] = [];
    for (const q of qTokens) {
      let best = 0;
      for (const f of c.fields) {
        for (const t of f.tokens) {
          const m = tokenMatch(q, t);
          if (m > 0) best = Math.max(best, m * f.weight);
        }
      }
      if (best > 0) {
        const idf = index.idf.get(q) ?? 0.5;
        score += (best / (best + 1.5)) * 2 * Math.max(idf, 0.3); // saturating, BM25-like
        matched.push(q);
      }
    }
    for (const num of qNumbers) {
      if (c.numbers.some((x) => x === num || x.startsWith(num + '.'))) {
        score += 3;
        matched.push(num);
      }
    }
    if (score > 0) scored.push({ id: c.id, title: c.title, score, matched });
  }
  scored.sort((a, b) => b.score - a.score);
  if (!scored.length || scored[0].score < minScore) return [];
  const top = scored[0].score;
  return scored.filter((s) => s.score >= minScore && s.score >= top * relativeCutoff).slice(0, max);
}
