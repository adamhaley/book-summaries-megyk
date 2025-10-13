import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // TODO: Implement books fetching with embeddings
    // const { data: books, error } = await supabase
    //   .from('books')
    //   .select('*')

    return NextResponse.json({
      message: 'Books API endpoint - to be implemented',
      status: 'success'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
