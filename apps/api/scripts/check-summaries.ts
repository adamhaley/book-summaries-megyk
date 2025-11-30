import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Please source .env.local first.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('Checking summaries and books...\n')

  // Get all summaries
  const { data: summaries, error: summariesError } = await supabase
    .from('summaries')
    .select('id, book_id, style, length, created_at')
    .order('created_at', { ascending: false })

  if (summariesError) {
    console.error('Error fetching summaries:', summariesError)
    return
  }

  console.log(`Found ${summaries?.length || 0} summaries:\n`)
  summaries?.forEach(s => {
    console.log(`ID: ${s.id}`)
    console.log(`Book ID: ${s.book_id}`)
    console.log(`Style: ${s.style}, Length: ${s.length}`)
    console.log(`Created: ${s.created_at}`)
    console.log('---')
  })

  // Get all books
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, author')

  if (booksError) {
    console.error('\nError fetching books:', booksError)
    return
  }

  console.log(`\nFound ${books?.length || 0} books:\n`)
  books?.forEach(b => {
    console.log(`ID: ${b.id}`)
    console.log(`Title: ${b.title}`)
    console.log(`Author: ${b.author}`)
    console.log('---')
  })

  // Check for orphaned summaries
  console.log('\nChecking for orphaned summaries (summaries without matching books):\n')
  const bookIds = new Set(books?.map(b => b.id) || [])

  summaries?.forEach(s => {
    if (!bookIds.has(s.book_id)) {
      console.log(`⚠️  Orphaned summary found:`)
      console.log(`   Summary ID: ${s.id}`)
      console.log(`   Book ID: ${s.book_id} (does not exist in books table)`)
      console.log('---')
    }
  })
}

checkData().catch(console.error)
