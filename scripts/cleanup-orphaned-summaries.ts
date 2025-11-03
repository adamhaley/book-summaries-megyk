import { createClient } from '@supabase/supabase-js'
import { existsSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Please source .env.local first.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupOrphaned() {
  const { data: summaries, error } = await supabase
    .from('summaries')
    .select('id, book_id, style, length, file_path, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching summaries:', error)
    return
  }

  console.log(`Checking ${summaries?.length || 0} summaries for orphaned records...\n`)

  const orphanedIds: string[] = []

  for (const summary of summaries || []) {
    const fullPath = join(process.cwd(), summary.file_path)
    const exists = existsSync(fullPath)

    if (!exists) {
      console.log('❌ Found orphaned summary:')
      console.log(`   ID: ${summary.id}`)
      console.log(`   Style: ${summary.style}, Length: ${summary.length}`)
      console.log(`   Path: ${summary.file_path}`)
      console.log(`   Created: ${summary.created_at}`)
      console.log('')
      orphanedIds.push(summary.id)
    }
  }

  if (orphanedIds.length === 0) {
    console.log('✅ No orphaned summaries found!')
    return
  }

  console.log(`\nFound ${orphanedIds.length} orphaned summaries. Deleting...`)

  const { error: deleteError } = await supabase
    .from('summaries')
    .delete()
    .in('id', orphanedIds)

  if (deleteError) {
    console.error('❌ Error deleting orphaned summaries:', deleteError)
    return
  }

  console.log(`✅ Successfully deleted ${orphanedIds.length} orphaned summary records`)
}

cleanupOrphaned().catch(console.error)
