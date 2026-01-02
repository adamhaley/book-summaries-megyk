import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Number.parseInt(limitParam, 10) : null

    if (limit !== null && (!Number.isFinite(limit) || limit < 1 || limit > 100)) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Fetch summaries for the user with book data in a single query
    const summariesQuery = supabase
      .from('summaries')
      .select('*, book:books(id, title, author, cover_image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const { data: summaries, error: summariesError } = limit
      ? await summariesQuery.limit(limit)
      : await summariesQuery

    if (summariesError) {
      console.error('Error fetching summaries:', summariesError)
      return NextResponse.json(
        { error: 'Failed to fetch summaries' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summaries: summaries || [] })
  } catch (error) {
    console.error('Error in summaries endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
