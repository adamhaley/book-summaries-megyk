import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { bookId, preferences } = body

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // TODO: Trigger n8n webhook for summary generation
    // const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    // const response = await fetch(n8nWebhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     userId: user.id,
    //     bookId,
    //     preferences
    //   })
    // })

    // TODO: Log summary request
    // const { data, error } = await supabase
    //   .from('summary_requests')
    //   .insert({
    //     user_id: user.id,
    //     book_id: bookId,
    //     preferences,
    //     status: 'pending'
    //   })

    return NextResponse.json({
      message: 'Summary generation triggered - to be implemented',
      bookId
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
