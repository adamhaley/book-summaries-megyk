import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Book } from '@/lib/types/books'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    console.log(`[Books API] Supabase client created in ${Date.now() - startTime}ms`)

    // Fetch all books from the database
    const queryStart = Date.now()
    const { data: books, error, count } = await supabase
      .from('books')
      .select('*', { count: 'exact' })
      .order('title', { ascending: true })

    console.log(`[Books API] Database query completed in ${Date.now() - queryStart}ms`)

    if (error) {
      console.error('Error fetching books:', error)
      return NextResponse.json(
        { error: 'Failed to fetch books' },
        { status: 500 }
      )
    }

    console.log(`[Books API] Success. Fetched ${books?.length || 0} books. Total time: ${Date.now() - startTime}ms`)

    return NextResponse.json({
      books: books as Book[] || [],
      count: count || 0
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    console.log(`[Books API] Error occurred. Total time: ${Date.now() - startTime}ms`)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
