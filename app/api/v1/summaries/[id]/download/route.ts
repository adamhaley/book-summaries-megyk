import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const summaryId = params.id

    // For MVP: Use hardcoded user_id
    const userId = 'bfb1e2f2-353c-4cf7-807e-4be63ed7cfff'

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

    // Read the file from local filesystem
    const filePath = join(process.cwd(), summary.file_path)

    try {
      const fileBuffer = await readFile(filePath)

      // Return PDF with appropriate headers for download
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="summary-${summary.book_id}.pdf"`,
          'Content-Length': fileBuffer.byteLength.toString(),
        },
      })
    } catch (fileError) {
      console.error('Error reading file:', fileError)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error in download endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
