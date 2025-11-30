import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Fetch summaries for the user
    const { data: summaries, error: summariesError } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (summariesError) {
      console.error('Error fetching summaries:', summariesError)
      return NextResponse.json(
        { error: 'Failed to fetch summaries' },
        { status: 500 }
      )
    }

    // Fetch book data separately for each summary
    const summariesWithBooks = await Promise.all(
      (summaries || []).map(async (summary) => {
        const { data: book } = await supabase
          .from('books')
          .select('id, title, author, cover_image_url')
          .eq('id', summary.book_id)
          .single()

        return {
          ...summary,
          book: book || undefined
        }
      })
    )

    return NextResponse.json({ summaries: summariesWithBooks })
  } catch (error) {
    console.error('Error in summaries endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
