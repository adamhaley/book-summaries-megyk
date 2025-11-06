# Book Covers Directory

Place your book cover images in this directory before uploading to Supabase Storage.

## File Naming

Name your files by either:

### Option 1: ISBN (Recommended)
```
9780735211292.jpg    → Atomic Habits
9781455586691.jpg    → Deep Work
9780374533557.jpg    → Thinking, Fast and Slow
```

### Option 2: Book Title
```
atomic-habits.jpg
deep-work.png
thinking-fast-and-slow.webp
```

## Supported Formats

- `.jpg` / `.jpeg`
- `.png`
- `.webp`

## Recommended Specifications

- **Dimensions:** 600x900px or similar 2:3 aspect ratio
- **File size:** < 500KB per image
- **Format:** JPEG or WebP for best compression
- **Quality:** High enough for crisp display at 300x450px

## Upload Process

1. Place your cover images in this directory
2. Make sure they're named correctly (by ISBN or title)
3. Run the upload script:
   ```bash
   npm run upload-covers
   # or
   npx tsx scripts/upload-book-covers.ts
   ```

## Current Books Needing Covers

Run this query to see which books need covers:
```sql
SELECT title, isbn, cover_image_url 
FROM books 
WHERE cover_image_url IS NULL 
ORDER BY title;
```

## Books in Database (with ISBNs)

1. Atomic Habits - `9780735211292`
2. Deep Work - `9781455586691`
3. Thinking, Fast and Slow - `9780374533557`
4. The Lean Startup - `9780307887894`
5. Sapiens - `9780062316097`
6. The Power of Habit - `9780812981605`
7. Influence - `9780061241895`
8. Start With Why - `9781591846444`
9. Zero to One - `9780804139298`
10. The 7 Habits of Highly Effective People - `9780743269513`
11. Mindset - `9780345472328`
12. The 4-Hour Workweek - `9780307465351`
13. Educated - `9780399590504`
14. Quiet - `9780307352156`
15. Daring Greatly - `9781592408412`

## After Upload

The script will:
- ✅ Upload images to Supabase Storage bucket `book-covers`
- ✅ Update the `books` table with public URLs
- ✅ Make covers available immediately in the app

## Troubleshooting

**No matches found?**
- Check file names match ISBN or title exactly
- Remove special characters from title-based names
- Use lowercase for title-based names

**Upload fails?**
- Verify Supabase credentials in `.env.local`
- Make sure bucket migration has been run
- Check file permissions

**Images not showing?**
- Clear browser cache
- Check Storage bucket is public
- Verify URLs in database

