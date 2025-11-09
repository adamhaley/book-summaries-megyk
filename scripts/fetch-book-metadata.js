#!/usr/bin/env node

/**
 * Script to fetch and update book metadata from Open Library API
 * Usage: node scripts/fetch-book-metadata.js
 */

const https = require('https');

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Invalid JSON response from ${url}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Make Supabase API request
 */
async function supabaseRequest(path, options = {}) {
  const url = new URL(path, SUPABASE_URL);
  
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: result });
        } catch (err) {
          reject(new Error(`Invalid JSON response from Supabase: ${data}`));
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Fetch book metadata from Open Library API
 */
async function fetchBookMetadata(isbn) {
  try {
    console.log(`📚 Fetching metadata for ISBN: ${isbn}`);
    
    // Clean ISBN (remove hyphens, spaces)
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    // Try ISBN API first
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
    const response = await makeRequest(url);
    
    const bookData = response[`ISBN:${cleanIsbn}`];
    if (!bookData) {
      console.log(`⚠️  No data found for ISBN: ${isbn}`);
      return null;
    }

    // Extract metadata
    const metadata = {
      genre_name: null
    };

    // No publication year, page count, or cover images in current schema

    // Extract genre/subjects - Open Library uses subjects
    if (bookData.subjects && bookData.subjects.length > 0) {
      // Find the most relevant subject (avoid overly specific ones)
      const relevantSubjects = bookData.subjects
        .map(s => s.name)
        .filter(subject => 
          subject.length < 50 && // Not too long
          !subject.includes('--') && // Not hierarchical
          !subject.match(/^\d/) // Not starting with numbers
        );
      
      if (relevantSubjects.length > 0) {
        metadata.genre_name = relevantSubjects[0];
      }
    }

    return metadata;
    
  } catch (error) {
    console.error(`❌ Error fetching metadata for ISBN ${isbn}:`, error.message);
    return null;
  }
}

/**
 * Find or create genre in book_genres table
 */
async function findOrCreateGenre(genreName) {
  try {
    // First, try to find existing genre (case insensitive)
    const searchResponse = await supabaseRequest(`/rest/v1/book_genres?name=ilike.${encodeURIComponent(genreName)}`);
    
    if (searchResponse.status === 200 && searchResponse.data && searchResponse.data.length > 0) {
      console.log(`📂 Found existing genre: ${genreName} (ID: ${searchResponse.data[0].id})`);
      return searchResponse.data[0].id;
    }

    // Genre doesn't exist, create it
    const createResponse = await supabaseRequest('/rest/v1/book_genres', {
      method: 'POST',
      body: { name: genreName }
    });

    if (createResponse.status === 201 && createResponse.data && createResponse.data.length > 0) {
      console.log(`📂 Created new genre: ${genreName} (ID: ${createResponse.data[0].id})`);
      return createResponse.data[0].id;
    }

    console.error(`❌ Failed to create genre: ${genreName}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Error handling genre ${genreName}:`, error.message);
    return null;
  }
}

/**
 * Update book in database
 */
async function updateBookMetadata(bookId, metadata) {
  try {
    // Only update fields that have values and are currently null/empty
    const updates = {};
    
    // Handle genre - need to get genre_id from book_genres table
    if (metadata.genre_name) {
      const genreId = await findOrCreateGenre(metadata.genre_name);
      if (genreId) {
        updates.book_genre_id = genreId;
      }
    }
    
    
    if (Object.keys(updates).length === 0) {
      console.log(`⚠️  No new metadata to update for book ${bookId}`);
      return false;
    }

    const response = await supabaseRequest(`/rest/v1/books?id=eq.${bookId}`, {
      method: 'PATCH',
      body: updates
    });

    if (response.status === 200) {
      console.log(`✅ Updated book ${bookId}:`, updates);
      return true;
    } else {
      console.error(`❌ Failed to update book ${bookId}:`, response.data);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error updating book ${bookId}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting book metadata fetch...\n');
  
  try {
    // Fetch books that have ISBNs but missing metadata
    const response = await supabaseRequest('/rest/v1/books?select=id,title,author,isbn,book_genre_id&isbn=not.is.null');
    
    if (response.status !== 200) {
      console.error('Supabase response:', response);
      throw new Error(`Failed to fetch books: ${JSON.stringify(response.data)}`);
    }

    const books = response.data || [];
    console.log(`📖 Found ${books.length} books with ISBNs\n`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const book of books) {
      // Check if book already has complete metadata
      const hasMetadata = book.book_genre_id;
      
      if (hasMetadata) {
        console.log(`⏭️  Skipping "${book.title}" - already has metadata`);
        skipped++;
        continue;
      }

      console.log(`\n📚 Processing: "${book.title}" by ${book.author}`);
      
      // Fetch metadata from Open Library
      const metadata = await fetchBookMetadata(book.isbn);
      
      if (metadata) {
        const success = await updateBookMetadata(book.id, metadata);
        if (success) {
          updated++;
        } else {
          failed++;
        }
      } else {
        failed++;
      }
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📖 Total: ${books.length}`);
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();