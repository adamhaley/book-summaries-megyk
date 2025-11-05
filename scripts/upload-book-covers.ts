/**
 * Upload Book Covers Script
 * 
 * This script uploads book cover images from the /book-covers directory
 * to Supabase Storage and updates the books table with the URLs.
 * 
 * Usage:
 *   1. Place your book cover images in /book-covers directory
 *   2. Name them by ISBN (e.g., 9780735211292.jpg) or book title
 *   3. Run: npx tsx scripts/upload-book-covers.ts
 * 
 * Supported formats: .jpg, .jpeg, .png, .webp
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BOOK_COVERS_DIR = path.join(process.cwd(), 'book-covers')
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp']

interface Book {
  id: string
  title: string
  isbn: string | null
  cover_image_url: string | null
}

async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('id, title, isbn, cover_image_url')
    .order('title')

  if (error) {
    console.error('❌ Error fetching books:', error)
    process.exit(1)
  }

  return data || []
}

function findCoverForBook(book: Book, availableFiles: string[]): string | null {
  // Try to match by ISBN first
  if (book.isbn) {
    const isbnMatch = availableFiles.find(file => {
      const fileNameWithoutExt = path.basename(file, path.extname(file))
      return fileNameWithoutExt === book.isbn || fileNameWithoutExt === book.isbn.replace(/-/g, '')
    })
    if (isbnMatch) return isbnMatch
  }

  // Try to match by title (normalize: lowercase, remove special chars)
  const normalizeString = (str: string) => 
    str.toLowerCase().replace(/[^a-z0-9]/g, '')

  const normalizedTitle = normalizeString(book.title)
  const titleMatch = availableFiles.find(file => {
    const fileNameWithoutExt = path.basename(file, path.extname(file))
    return normalizeString(fileNameWithoutExt) === normalizedTitle
  })
  
  return titleMatch || null
}

async function uploadCover(filePath: string, bookId: string): Promise<string | null> {
  const fileName = path.basename(filePath)
  const fileExt = path.extname(filePath)
  const storagePath = `${bookId}${fileExt}` // Store as {book_id}.jpg

  try {
    // Read file
    const fileBuffer = fs.readFileSync(filePath)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('book-covers')
      .upload(storagePath, fileBuffer, {
        contentType: `image/${fileExt.slice(1)}`,
        upsert: true // Overwrite if exists
      })

    if (error) {
      console.error(`   ❌ Upload failed for ${fileName}:`, error.message)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('book-covers')
      .getPublicUrl(storagePath)

    return urlData.publicUrl
  } catch (err) {
    console.error(`   ❌ Error uploading ${fileName}:`, err)
    return null
  }
}

async function updateBookCover(bookId: string, coverUrl: string): Promise<boolean> {
  const { error } = await supabase
    .from('books')
    .update({ cover_image_url: coverUrl })
    .eq('id', bookId)

  if (error) {
    console.error(`   ❌ Failed to update database:`, error.message)
    return false
  }

  return true
}

async function main() {
  console.log('📚 Book Cover Upload Script\n')

  // Check if book-covers directory exists
  if (!fs.existsSync(BOOK_COVERS_DIR)) {
    console.error(`❌ Directory not found: ${BOOK_COVERS_DIR}`)
    console.error('Please create the directory and add your book cover images')
    process.exit(1)
  }

  // Get all image files in the directory
  const allFiles = fs.readdirSync(BOOK_COVERS_DIR)
  const imageFiles = allFiles.filter(file => 
    SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())
  )

  console.log(`📁 Found ${imageFiles.length} image(s) in /book-covers\n`)

  if (imageFiles.length === 0) {
    console.log('ℹ️  No images found. Please add book cover images to /book-covers directory')
    console.log('   Supported formats: .jpg, .jpeg, .png, .webp')
    console.log('   Name files by ISBN (e.g., 9780735211292.jpg) or book title')
    process.exit(0)
  }

  // Get all books from database
  console.log('🔍 Fetching books from database...')
  const books = await getBooks()
  console.log(`   Found ${books.length} books in database\n`)

  let successCount = 0
  let skippedCount = 0
  let failedCount = 0

  // Process each book
  for (const book of books) {
    const coverFile = findCoverForBook(book, imageFiles)

    if (!coverFile) {
      console.log(`⏭️  ${book.title}`)
      console.log(`   No matching cover found`)
      skippedCount++
      continue
    }

    console.log(`📖 ${book.title}`)
    console.log(`   Matched: ${coverFile}`)

    // Upload cover
    const filePath = path.join(BOOK_COVERS_DIR, coverFile)
    const coverUrl = await uploadCover(filePath, book.id)

    if (!coverUrl) {
      failedCount++
      continue
    }

    console.log(`   ✅ Uploaded: ${coverUrl}`)

    // Update database
    const updated = await updateBookCover(book.id, coverUrl)
    if (updated) {
      console.log(`   ✅ Database updated`)
      successCount++
    } else {
      failedCount++
    }

    console.log('')
  }

  // Summary
  console.log('━'.repeat(60))
  console.log('📊 Summary:')
  console.log(`   ✅ Successfully uploaded: ${successCount}`)
  console.log(`   ⏭️  Skipped (no match): ${skippedCount}`)
  console.log(`   ❌ Failed: ${failedCount}`)
  console.log('━'.repeat(60))

  if (successCount > 0) {
    console.log('\n🎉 Book covers uploaded successfully!')
    console.log('   Visit your app to see the covers in action')
  }
}

main().catch(console.error)

