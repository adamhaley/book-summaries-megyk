import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: summaryId } = await params

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Fetch the summary record
    const { data: summary, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('id', summaryId)
      .eq('user_id', userId)
      .single()

    if (error || !summary) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      )
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('summaries')
      .download(summary.file_path)

    if (downloadError || !fileData) {
      console.error('Error downloading file from storage:', downloadError)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Fetch book title for filename
    const { data: book } = await supabase
      .from('books')
      .select('title')
      .eq('id', summary.book_id)
      .single()

    // Sanitize filename: replace spaces/special chars with underscores, lowercase
    const sanitizeFilename = (str: string) => {
      return str
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase()
    }

    const bookTitle = book?.title || 'book'
    const sanitizedTitle = sanitizeFilename(bookTitle)
    const filename = `${sanitizedTitle}_${summary.length}_${summary.style}.pdf`

    // Convert blob to array buffer
    const fileBuffer = await fileData.arrayBuffer()

    // Return PDF with appropriate headers for download
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Error in download endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
