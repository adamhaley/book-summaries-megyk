import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Book } from '@/lib/types/books'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    console.log(`[Books API] Supabase client created in ${Date.now() - startTime}ms`)

    // Parse parameters
    const url = new URL(request.url)
    const all = url.searchParams.get('all') === 'true'
    const featured = url.searchParams.get('featured') === 'true'
    const limitParam = url.searchParams.get('limit')
    
    // Handle featured books for carousel (simple limit, no pagination)
    if (featured && limitParam) {
      const limit = parseInt(limitParam, 10)
      if (limit < 1 || limit > 50) {
        return NextResponse.json(
          { error: 'Invalid limit parameter for featured books' },
          { status: 400 }
        )
      }

      const queryStart = Date.now()
      const { data: books, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false }) // Most recent first for featured
        .limit(limit)

      console.log(`[Books API] Featured books query completed in ${Date.now() - queryStart}ms`)

      if (error) {
        console.error('Error fetching featured books:', error)
        return NextResponse.json(
          { error: 'Failed to fetch featured books' },
          { status: 500 }
        )
      }

      console.log(`[Books API] Success. Fetched ${books?.length || 0} featured books. Total time: ${Date.now() - startTime}ms`)

      return NextResponse.json({
        books: books as Book[] || []
      })
    }
    
    if (all) {
      // Return all books for client-side sorting
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

      console.log(`[Books API] Success. Fetched all ${books?.length || 0} books. Total time: ${Date.now() - startTime}ms`)

      return NextResponse.json({
        books: books as Book[] || [],
        total: count || 0
      })
    }

    // Existing pagination logic for backwards compatibility
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)
    const offset = (page - 1) * limit
    
    // Parse sorting parameters
    const sortBy = url.searchParams.get('sortBy') || 'title'
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'
    
    // Define allowed sort columns
    const allowedSortColumns = ['title', 'author', 'genre', 'publication_year', 'page_count']
    const validSortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'title'
    const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc'

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    // Fetch paginated and sorted books from the database
    const queryStart = Date.now()
    const { data: books, error, count } = await supabase
      .from('books')
      .select('*', { count: 'exact' })
      .order(validSortColumn, { ascending: validSortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    console.log(`[Books API] Database query completed in ${Date.now() - queryStart}ms`)

    if (error) {
      console.error('Error fetching books:', error)
      return NextResponse.json(
        { error: 'Failed to fetch books' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    console.log(`[Books API] Success. Fetched ${books?.length || 0} books (page ${page}/${totalPages}, sorted by ${validSortColumn} ${validSortOrder}). Total time: ${Date.now() - startTime}ms`)

    return NextResponse.json({
      books: books as Book[] || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      sorting: {
        sortBy: validSortColumn,
        sortOrder: validSortOrder
      }
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
