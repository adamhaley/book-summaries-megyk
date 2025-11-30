import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: summaryId } = await params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the summary to verify ownership and get file path
    const { data: summary, error: fetchError } = await supabase
      .from('summaries')
      .select('id, user_id, file_path')
      .eq('id', summaryId)
      .single()

    if (fetchError || !summary) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (summary.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete the file from Supabase Storage if it exists
    if (summary.file_path) {
      try {
        const { error: storageError } = await supabase.storage
          .from('summaries')
          .remove([summary.file_path])

        if (storageError) {
          console.error('Error deleting file from storage:', storageError)
          // Continue with database deletion even if file deletion fails
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('summaries')
      .delete()
      .eq('id', summaryId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json(
      { message: 'Summary deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting summary:', error)
    return NextResponse.json(
      { error: 'Failed to delete summary' },
      { status: 500 }
    )
  }
}
