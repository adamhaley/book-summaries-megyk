import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCreditService } from '@/lib/services/credits';
import { getChatMessageCreditCost } from '@/lib/types/credits';

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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

    // Check credit balance before processing chat message
    const creditService = createCreditService(supabase);
    const chatCost = getChatMessageCreditCost();
    const creditCheck = await creditService.checkChatAffordability(user.id);

    if (!creditCheck.has_sufficient_credits) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required_credits: creditCheck.required_credits,
          current_balance: creditCheck.current_balance,
          remaining_messages: 0,
        },
        { status: 402 }
      );
    }

    // Get or create chat session for tracking
    const chatSession = await creditService.getOrCreateChatSession(user.id, bookId);

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
        user_id: user.id,
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

    // Deduct credits after successful webhook call
    // We deduct here because the stream has started successfully
    const creditTransaction = await creditService.deductForChat(
      user.id,
      bookId,
      chatSession?.id
    );

    if (!creditTransaction) {
      console.error('Failed to deduct credits for chat message, but message was processed');
      // Note: We don't fail the request here since the chat has already started
      // This should be monitored and resolved manually if it occurs
    }

    // Stream the response from n8n to enable real-time updates
    // n8n sends NDJSON (newline-delimited JSON) for streaming responses
    if (webhookResponse.body) {
      return new Response(webhookResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Fallback for responses without a body
    return NextResponse.json({
      reply: '',
      data: null,
    });
  } catch (error) {
    console.error('Error in book chat webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
