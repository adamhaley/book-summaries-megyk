import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
      user_id: user.id,
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
        // Get generation metrics from response headers if available
        const tokensSpent = webhookResponse.headers.get('x-tokens-spent')
        const generationTime = webhookResponse.headers.get('x-generation-time')

        // Stream PDF binary directly to browser
        const pdfBuffer = await webhookResponse.arrayBuffer()

        // Generate unique filename
        const timestamp = Date.now()
        const filename = `summary-${book_id}-${timestamp}.pdf`
        const filePath = join(process.cwd(), 'files', filename)

        // Save PDF to local filesystem
        await writeFile(filePath, Buffer.from(pdfBuffer))

        // Create database record
        const { data: summaryData, error: summaryError } = await supabase
          .from('summaries')
          .insert({
            user_id: user.id,
            book_id,
            style: preferences.style,
            length: preferences.length,
            file_path: `files/${filename}`,
            tokens_spent: tokensSpent ? parseInt(tokensSpent) : null,
            generation_time: generationTime ? parseFloat(generationTime) : null,
          })
          .select()
          .single()

        if (summaryError) {
          console.error('Error saving summary record:', summaryError)
          // Continue even if DB insert fails - user still gets their PDF
        }

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
