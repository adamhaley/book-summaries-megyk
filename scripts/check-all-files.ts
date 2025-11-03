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

async function checkAllFiles() {
  const { data: summaries, error } = await supabase
    .from('summaries')
    .select('id, book_id, style, length, file_path, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching summaries:', error)
    return
  }

  console.log(`Checking ${summaries?.length || 0} summaries...\n`)

  let missingCount = 0
  let existingCount = 0

  summaries?.forEach(summary => {
    const fullPath = join(process.cwd(), summary.file_path)
    const exists = existsSync(fullPath)

    if (!exists) {
      console.log('❌ Missing file:')
      console.log(`   ID: ${summary.id}`)
      console.log(`   Style: ${summary.style}, Length: ${summary.length}`)
      console.log(`   Path: ${summary.file_path}`)
      console.log(`   Created: ${summary.created_at}`)
      console.log('')
      missingCount++
    } else {
      existingCount++
    }
  })

  console.log('\nSummary:')
  console.log(`✅ ${existingCount} files exist`)
  console.log(`❌ ${missingCount} files missing`)
}

checkAllFiles().catch(console.error)
