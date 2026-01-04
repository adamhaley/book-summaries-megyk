import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const webhookUrl = process.env.N8N_SIGNUP_WEBHOOK_URL

    if (!webhookUrl) {
      console.error('N8N_SIGNUP_WEBHOOK_URL not configured')
      return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 })
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': body.user_id || '',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}