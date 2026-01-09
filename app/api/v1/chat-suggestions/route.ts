import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getChatSuggestionsUrl = () => {
  const explicit = process.env.N8N_CHAT_SUGGESTIONS_URL;
  if (explicit) return explicit;

  // Prefer deriving from N8N_WEBHOOK_URL (keeps environments consistent with other routes)
  const baseEnv = process.env.N8N_WEBHOOK_URL;
  if (baseEnv) {
    const normalized = baseEnv.replace(/\/+$/, '');
    const lastSlash = normalized.lastIndexOf('/');
    const base = lastSlash === -1 ? `${normalized}/` : normalized.slice(0, lastSlash + 1);
    return `${base}chat_suggestions`;
  }

  // Default (user-provided)
  return 'https://n8n.megyk.com/webhook/chat_suggestions';
};

const safeParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const coerceStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((x) => typeof x === 'string') as string[];
  if (typeof value === 'string') {
    const parsed = safeParseJson(value);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string') as string[];
  }
  return [];
};

const pickQuestions = (payload: unknown): string[] => {
  if (!payload) return [];

  // n8n often returns: [{ output: "[\"q1\", \"q2\", \"q3\"]" }]
  if (Array.isArray(payload)) {
    const direct = payload.filter((x) => typeof x === 'string') as string[];
    if (direct.length) return direct.slice(0, 3);

    const firstObj = payload.find((x) => x && typeof x === 'object') as Record<string, unknown> | undefined;
    if (firstObj) {
      const fromOutput = coerceStringArray(firstObj.output);
      if (fromOutput.length) return fromOutput.slice(0, 3);

      const fromQuestions = coerceStringArray(firstObj.questions ?? firstObj.suggestions);
      if (fromQuestions.length) return fromQuestions.slice(0, 3);
    }
  }

  if (typeof payload === 'object') {
    const data = payload as Record<string, unknown>;

    const candidates = [
      data.questions,
      data.suggestions,
      data.items,
      data.data,
      data.result,
      data.output,
    ];

    for (const candidate of candidates) {
      const arr = coerceStringArray(candidate);
      if (arr.length) return arr.slice(0, 3);
    }
  }

  return [];
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const bookId = typeof body?.book_id === 'string' ? body.book_id : null;

    if (!bookId) {
      return NextResponse.json({ error: 'Missing book_id' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const webhookUrl = getChatSuggestionsUrl();
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        { error: 'Failed to fetch chat suggestions', details: text },
        { status: 502 }
      );
    }

    const payload = await response.json().catch(() => ({}));
    const questions = pickQuestions(payload);

    return NextResponse.json({ questions });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: isAbort ? 'Chat suggestions request timed out' : 'Internal server error' },
      { status: isAbort ? 504 : 500 }
    );
  }
}

