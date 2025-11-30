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

async function checkFile() {
  // Get the specific summary
  const summaryId = '1b02c840-9a58-42b9-8d63-06d145b025bc'

  const { data: summary, error } = await supabase
    .from('summaries')
    .select('id, book_id, style, length, file_path')
    .eq('id', summaryId)
    .single()

  if (error) {
    console.error('Error fetching summary:', error)
    return
  }

  console.log('Summary record:')
  console.log(JSON.stringify(summary, null, 2))

  if (summary.file_path) {
    const fullPath = join(process.cwd(), summary.file_path)
    console.log('\nFull file path:', fullPath)
    console.log('File exists:', existsSync(fullPath))

    if (!existsSync(fullPath)) {
      console.log('❌ File is missing!')
    }
  } else {
    console.log('\n❌ No file_path stored in database!')
  }
}

checkFile().catch(console.error)
