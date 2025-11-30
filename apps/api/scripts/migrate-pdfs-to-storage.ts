/**
 * Migration Script: Migrate Local PDF Files to Supabase Storage
 *
 * This script migrates existing PDF files from the local `/files` directory
 * to Supabase Storage bucket 'summaries'.
 *
 * Usage:
 *   set -a && source .env.local && set +a && npx tsx scripts/migrate-pdfs-to-storage.ts
 *
 * What it does:
 * 1. Finds all summaries with local file paths (files/summary-*.pdf)
 * 2. Checks if the file exists locally
 * 3. Uploads the file to Supabase Storage with new path: user_id/summary_id.pdf
 * 4. Updates the database record with the new storage path
 * 5. Optionally deletes the local file after successful migration
 */

import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync, unlinkSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Please source .env.local first.')
  console.error('Usage: set -a && source .env.local && set +a && npx tsx scripts/migrate-pdfs-to-storage.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface Summary {
  id: string
  user_id: string
  book_id: string
  file_path: string
}

async function migratePDFs() {
  console.log('🚀 Starting PDF migration to Supabase Storage...\n')

  // Fetch all summaries with local file paths
  const { data: summaries, error: fetchError } = await supabase
    .from('summaries')
    .select('id, user_id, book_id, file_path')
    .like('file_path', 'files/%')
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.error('❌ Error fetching summaries:', fetchError)
    return
  }

  if (!summaries || summaries.length === 0) {
    console.log('✅ No local files found to migrate. All summaries are already using Supabase Storage!')
    return
  }

  console.log(`Found ${summaries.length} summaries with local file paths\n`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const summary of summaries as Summary[]) {
    console.log(`Processing summary ${summary.id}...`)
    console.log(`  Local path: ${summary.file_path}`)

    // Check if file exists locally
    const localPath = join(process.cwd(), summary.file_path)
    if (!existsSync(localPath)) {
      console.log(`  ⚠️  File not found locally, skipping`)
      skipCount++
      continue
    }

    try {
      // Read file from local filesystem
      const fileBuffer = readFileSync(localPath)

      // Generate new storage path
      const storagePath = `${summary.user_id}/${summary.id}.pdf`
      console.log(`  Target storage path: ${storagePath}`)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('summaries')
        .upload(storagePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (uploadError) {
        console.error(`  ❌ Upload failed:`, uploadError.message)
        errorCount++
        continue
      }

      // Update database record
      const { error: updateError } = await supabase
        .from('summaries')
        .update({ file_path: storagePath })
        .eq('id', summary.id)

      if (updateError) {
        console.error(`  ❌ Database update failed:`, updateError.message)
        // Try to clean up uploaded file
        await supabase.storage.from('summaries').remove([storagePath])
        errorCount++
        continue
      }

      console.log(`  ✅ Migrated successfully`)

      // Optionally delete local file (commented out for safety)
      // Uncomment the line below if you want to delete local files after migration
      // unlinkSync(localPath)
      // console.log(`  🗑️  Deleted local file`)

      successCount++
    } catch (error) {
      console.error(`  ❌ Error:`, error)
      errorCount++
    }

    console.log('')
  }

  console.log('\n📊 Migration Summary:')
  console.log(`✅ Successfully migrated: ${successCount}`)
  console.log(`⚠️  Skipped (file not found): ${skipCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log(`📝 Total: ${summaries.length}`)

  if (successCount > 0) {
    console.log('\n💡 Note: Local files have NOT been deleted automatically.')
    console.log('   To delete them, uncomment the unlinkSync() line in the script and run again.')
  }
}

migratePDFs().catch(console.error)
