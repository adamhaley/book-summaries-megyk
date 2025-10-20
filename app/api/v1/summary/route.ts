import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // For MVP: Skip auth check since auth is TBD
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    const { book_id, preferences } = body

    if (!book_id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    if (!preferences || !preferences.style || !preferences.length) {
      return NextResponse.json(
        { error: 'Preferences (style and length) are required' },
        { status: 400 }
      )
    }

    // Trigger n8n webhook for summary generation
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'N8N webhook URL not configured' },
        { status: 500 }
      )
    }

    const webhookPayload = {
      book_id,
      preferences: {
        style: preferences.style,
        length: preferences.length
      },
      user_id: 'bfb1e2f2-353c-4cf7-807e-4be63ed7cfff', // Hardcoded for MVP - TODO: Replace with real user_id when auth is implemented
      timestamp: new Date().toISOString()
    }

    try {
      const webhookResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      })

      if (!webhookResponse.ok) {
        console.error('n8n webhook failed:', webhookResponse.status, webhookResponse.statusText)
        return NextResponse.json(
          { error: 'Failed to trigger summary generation' },
          { status: 502 }
        )
      }

      // Check if response is PDF binary
      const contentType = webhookResponse.headers.get('content-type') || ''

      if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
        // Stream PDF binary directly to browser
        const pdfBuffer = await webhookResponse.arrayBuffer()

        // TODO: Log summary request in database when schema is ready
        // const { data, error } = await supabase
        //   .from('summary_requests')
        //   .insert({
        //     user_id: 'bfb1e2f2-353c-4cf7-807e-4be63ed7cfff',
        //     book_id,
        //     preferences,
        //     status: 'completed'
        //   })

        // Return PDF with appropriate headers for download
        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="book-summary-${book_id}.pdf"`,
            'Content-Length': pdfBuffer.byteLength.toString(),
          },
        })
      }

      // If not PDF, handle as JSON response
      const webhookData = await webhookResponse.json().catch(() => ({}))

      // TODO: Log summary request in database when schema is ready
      // const { data, error } = await supabase
      //   .from('summary_requests')
      //   .insert({
      //     user_id: 'bfb1e2f2-353c-4cf7-807e-4be63ed7cfff',
      //     book_id,
      //     preferences,
      //     status: 'pending'
      //   })

      return NextResponse.json({
        message: 'Summary generation triggered successfully',
        book_id,
        preferences,
        webhook_response: webhookData
      })
    } catch (webhookError) {
      console.error('Error calling n8n webhook:', webhookError)
      return NextResponse.json(
        { error: 'Failed to trigger summary generation' },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('Error in summary generation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
