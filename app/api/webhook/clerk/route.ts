import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const headers = {
    'webhook-id': request.headers.get('webhook-id') || '',
    'webhook-timestamp': request.headers.get('webhook-timestamp') || '',
    'webhook-signature': request.headers.get('webhook-signature') || '',
  }

  let payload: any
  try {
    const wh = new Webhook(webhookSecret)
    payload = wh.verify(body, headers)
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (payload.type === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name } = payload.data
    const email = email_addresses?.[0]?.email_address

    // Generate a UUID for user_id to maintain compatibility with existing Supabase data
    const userId = crypto.randomUUID()

    const supabase = createClient()
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        clerk_id: clerkId,
        preferences: { style: 'narrative', length: 'medium' },
      })

    if (error) {
      console.error('Error creating user profile:', error)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    // Forward to N8N webhook
    const n8nWebhookUrl = process.env.N8N_SIGNUP_WEBHOOK_URL
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-idempotency-key': clerkId,
          },
          body: JSON.stringify({
            event: 'user_created',
            email,
            user_id: userId,
            clerk_id: clerkId,
            first_name,
            last_name,
          }),
        })
      } catch (webhookError) {
        console.error('N8N webhook failed:', webhookError)
      }
    }
  }

  return NextResponse.json({ received: true })
}
