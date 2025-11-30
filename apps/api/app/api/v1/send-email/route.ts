import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Initialize Resend at runtime (not build time) to access env vars
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    // Verify request is from Supabase (optional but recommended)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { to, subject, html, text } = body

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and html or text' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Book Summaries <noreply@megyk.com>',
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
    })

    if (error) {
      console.error('Resend API error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id
    })
  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
