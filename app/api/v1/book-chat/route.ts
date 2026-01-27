import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth';

const getWebhookUrl = () => {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nWebhookUrl) return null;

  const normalized = n8nWebhookUrl.replace(/\/+$/, '');
  const lastSlash = normalized.lastIndexOf('/');
  const base = lastSlash === -1 ? `${normalized}/` : normalized.slice(0, lastSlash + 1);

  return `${base}book_chat`;
};

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { book_id: bookId, message } = body || {};

    if (!bookId || !message) {
      return NextResponse.json(
        { error: 'Book ID and message are required' },
        { status: 400 }
      );
    }

    const webhookUrl = getWebhookUrl();
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'N8N webhook URL not configured' },
        { status: 500 }
      );
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        book_id: bookId,
        message,
      }),
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch chat response' },
        { status: 502 }
      );
    }

    const contentType = webhookResponse.headers.get('content-type') || '';
    let data: unknown = null;
    let textFallback = '';

    if (contentType.includes('application/json')) {
      data = await webhookResponse.json().catch(() => null);
    } else {
      textFallback = await webhookResponse.text();
    }

    return NextResponse.json({
      reply: data ?? textFallback,
      data,
    });
  } catch (error) {
    console.error('Error in book chat webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
