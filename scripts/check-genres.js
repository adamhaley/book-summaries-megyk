#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function query(path) {
  const url = new URL(path, SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // Get all genres
  const genres = await query('/rest/v1/book_genres?select=id,name&order=id');
  console.log('=== ALL GENRES ===');
  genres.forEach(g => console.log(`  ${g.id}: ${g.name}`));
  console.log(`\nTotal genres: ${genres.length}\n`);

  // Get all books with their genre info
  const books = await query('/rest/v1/books?select=id,title,book_genre_id&order=title');

  if (!Array.isArray(books)) {
    console.log('Books response:', books);
    return;
  }

  const withGenreId = books.filter(b => b.book_genre_id);
  const noGenre = books.filter(b => !b.book_genre_id);

  console.log('=== BOOKS WITH book_genre_id ===');
  withGenreId.forEach(b => {
    const genreName = genres.find(g => g.id === b.book_genre_id)?.name || 'UNKNOWN';
    console.log(`  [${b.book_genre_id}] ${b.title.substring(0,55)} -> ${genreName}`);
  });
  console.log(`\nCount: ${withGenreId.length}\n`);

  console.log('=== BOOKS WITHOUT GENRE ===');
  noGenre.forEach(b => console.log(`  ${b.title}`));
  console.log(`\nCount: ${noGenre.length}\n`);

  console.log('=== SUMMARY ===');
  console.log(`Total books: ${books.length}`);
  console.log(`With genre: ${withGenreId.length}`);
  console.log(`Without genre: ${noGenre.length}`);
}

main().catch(console.error);
