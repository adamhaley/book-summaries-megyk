#!/usr/bin/env node

/**
 * Script to consolidate 31 genres into 6 clean categories
 *
 * Categories:
 * 1. Business
 * 2. Self-Improvement
 * 3. Psychology
 * 4. Finance
 * 5. Leadership
 * 6. Fiction
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// New consolidated genres (using IDs 1-6)
const NEW_GENRES = {
  1: 'Business',
  2: 'Self-Improvement',
  3: 'Psychology',
  4: 'Finance',
  5: 'Leadership',
  6: 'Fiction'
};

// Map old genre IDs to new genre IDs
const GENRE_MAPPING = {
  // Business (1)
  3: 1,   // Business -> Business
  5: 1,   // Management -> Business
  9: 1,   // Industrial management -> Business
  14: 1,  // Cost control -> Business
  17: 1,  // Entrepreneurship -> Business
  19: 1,  // Advertising agencies -> Business
  20: 1,  // Digital media -> Business
  21: 1,  // Diffusion of innovations -> Business
  28: 1,  // Success in business -> Business

  // Self-Improvement (2)
  1: 2,   // Productivity -> Self-Improvement
  6: 2,   // Inspirational -> Self-Improvement
  10: 2,  // Buddhism -> Self-Improvement
  12: 2,  // nyt:advice-how-to-and-miscellaneous -> Self-Improvement
  13: 2,  // Self-actualization (Psychology) -> Self-Improvement
  16: 2,  // Conduct of life -> Self-Improvement
  18: 2,  // Self-realization -> Self-Improvement
  22: 2,  // Success- Psychological aspects -> Self-Improvement
  25: 2,  // Meditations -> Self-Improvement
  29: 2,  // Time management -> Self-Improvement
  30: 2,  // Choice (Psychology) -> Self-Improvement
  31: 2,  // Mental work -> Self-Improvement

  // Psychology (3)
  2: 3,   // Psychology -> Psychology
  23: 3,  // Social aspects -> Psychology
  26: 3,  // Technology and civilization (Sapiens) -> Psychology

  // Finance (4)
  15: 4,  // Money -> Finance
  24: 4,  // Wealth -> Finance
  27: 4,  // Rich people -> Finance

  // Leadership (5)
  4: 5,   // Leadership -> Leadership
  7: 5,   // United States (Extreme Ownership) -> Leadership
  11: 5,  // Negotiation -> Leadership

  // Fiction (6)
  8: 6,   // Fiction, romance, general -> Fiction
};

// Books without genres - assign manually by title pattern
const MANUAL_ASSIGNMENTS = {
  '80 Fundamental Models for Business Analysts': 1,  // Business
  'Atomic Habits': 2,                                 // Self-Improvement
  'Authority Content': 1,                            // Business
  'The Almanack of Naval Ravikant': 4,               // Finance (it's about wealth)
};

async function supabaseRequest(path, options = {}) {
  const url = new URL(path, SUPABASE_URL);

  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
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
          reject(new Error(`Invalid JSON: ${data}`));
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

async function main() {
  console.log('🚀 Starting genre consolidation...\n');

  // Step 1: Get all books
  console.log('📚 Fetching all books...');
  const booksRes = await supabaseRequest('/rest/v1/books?select=id,title,book_genre_id');
  if (!Array.isArray(booksRes.data)) {
    console.error('Failed to fetch books:', booksRes.data);
    return;
  }
  const books = booksRes.data;
  console.log(`   Found ${books.length} books\n`);

  // Step 2: Update each book's genre
  console.log('📝 Updating book genres...\n');

  let updated = 0;
  let skipped = 0;
  let manual = 0;

  for (const book of books) {
    let newGenreId = null;

    // Check if book has existing genre that needs mapping
    if (book.book_genre_id && GENRE_MAPPING[book.book_genre_id]) {
      newGenreId = GENRE_MAPPING[book.book_genre_id];
    }
    // Check for manual assignment
    else {
      for (const [titlePattern, genreId] of Object.entries(MANUAL_ASSIGNMENTS)) {
        if (book.title.includes(titlePattern)) {
          newGenreId = genreId;
          manual++;
          break;
        }
      }
    }

    if (newGenreId && newGenreId !== book.book_genre_id) {
      const res = await supabaseRequest(`/rest/v1/books?id=eq.${book.id}`, {
        method: 'PATCH',
        body: { book_genre_id: newGenreId }
      });

      if (res.status === 200) {
        console.log(`   ✅ ${book.title.substring(0, 50)} -> ${NEW_GENRES[newGenreId]}`);
        updated++;
      } else {
        console.log(`   ❌ Failed to update: ${book.title}`);
      }
    } else if (newGenreId === book.book_genre_id) {
      skipped++;
    } else {
      console.log(`   ⚠️  No mapping for: ${book.title} (genre_id: ${book.book_genre_id})`);
    }
  }

  console.log(`\n📊 Book updates: ${updated} updated, ${skipped} already correct, ${manual} manually assigned\n`);

  // Step 3: Update genre names to clean versions
  console.log('🏷️  Updating genre names...');

  for (const [id, name] of Object.entries(NEW_GENRES)) {
    const res = await supabaseRequest(`/rest/v1/book_genres?id=eq.${id}`, {
      method: 'PATCH',
      body: { name }
    });

    if (res.status === 200) {
      console.log(`   ✅ Genre ${id} -> "${name}"`);
    } else {
      // Genre might not exist, try to insert
      const insertRes = await supabaseRequest('/rest/v1/book_genres', {
        method: 'POST',
        body: { id: parseInt(id), name },
        prefer: 'return=representation,resolution=merge-duplicates'
      });
      if (insertRes.status === 201 || insertRes.status === 200) {
        console.log(`   ✅ Genre ${id} created -> "${name}"`);
      } else {
        console.log(`   ❌ Failed to update/create genre ${id}: ${JSON.stringify(insertRes.data)}`);
      }
    }
  }

  // Step 4: Delete unused genres (IDs > 6)
  console.log('\n🗑️  Removing unused genres...');
  const deleteRes = await supabaseRequest('/rest/v1/book_genres?id=gt.6', {
    method: 'DELETE'
  });

  if (deleteRes.status === 200 || deleteRes.status === 204) {
    console.log('   ✅ Removed all genres with ID > 6');
  } else {
    console.log(`   ⚠️  Delete response: ${JSON.stringify(deleteRes.data)}`);
  }

  // Step 5: Verify final state
  console.log('\n📋 Final verification...');
  const finalGenres = await supabaseRequest('/rest/v1/book_genres?select=id,name&order=id');
  console.log('\n=== FINAL GENRES ===');
  if (Array.isArray(finalGenres.data)) {
    finalGenres.data.forEach(g => console.log(`   ${g.id}: ${g.name}`));
  }

  const finalBooks = await supabaseRequest('/rest/v1/books?select=title,book_genre_id&book_genre_id=is.null');
  if (Array.isArray(finalBooks.data) && finalBooks.data.length > 0) {
    console.log('\n=== BOOKS STILL WITHOUT GENRE ===');
    finalBooks.data.forEach(b => console.log(`   ${b.title}`));
  } else {
    console.log('\n✅ All books have genres assigned!');
  }

  console.log('\n🎉 Genre consolidation complete!');
}

main().catch(console.error);
