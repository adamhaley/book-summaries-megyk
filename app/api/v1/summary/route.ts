import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()

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

    const sanitizeFilename = (str: string) => {
      return str
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase()
    }

    const getBookFilename = async (bookId: string, length: string, style: string) => {
      const { data: book } = await supabase
        .from('books')
        .select('title')
        .eq('id', bookId)
        .single()

      const bookTitle = book?.title || 'book'
      const sanitizedTitle = sanitizeFilename(bookTitle)
      return `${sanitizedTitle}_${length}_${style}.pdf`
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
      user_id: userId,
      timestamp: new Date().toISOString()
    }

    try {
      const cacheBustedUrl = `${n8nWebhookUrl}${n8nWebhookUrl.includes('?') ? '&' : '?'}ts=${Date.now()}`

      const webhookResponse = await fetch(cacheBustedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
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

        // Stable storage path per user/book/style/length for idempotency
        const storagePath = `${userId}/${book_id}/${preferences.length}_${preferences.style}.pdf`

        // Upload PDF to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('summaries')
          .upload(storagePath, Buffer.from(pdfBuffer), {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) {
          console.error('Error uploading PDF to storage:', uploadError)
          return NextResponse.json(
            { error: 'Failed to save summary PDF' },
            { status: 500 }
          )
        }

        // Create database record
        const { data: summaryData, error: summaryError } = await supabase
          .from('summaries')
          .upsert({
            user_id: userId,
            book_id,
            style: preferences.style,
            length: preferences.length,
            file_path: storagePath,
            tokens_spent: tokensSpent ? parseInt(tokensSpent) : null,
            generation_time: generationTime ? parseFloat(generationTime) : null,
          }, {
            onConflict: 'user_id,book_id,style,length'
          })
          .select()
          .single()

        if (summaryError) {
          console.error('Error saving summary record:', summaryError)
          // Clean up uploaded file if DB upsert fails
          await supabase.storage.from('summaries').remove([storagePath])
          return NextResponse.json(
            { error: 'Failed to save summary record' },
            { status: 500 }
          )
        }

        const filename = await getBookFilename(book_id, preferences.length, preferences.style)

        // Return PDF with appropriate headers for download
        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
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
