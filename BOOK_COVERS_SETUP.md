# Book Covers Setup Guide

Complete guide to adding real book covers to your application using Supabase Storage.

## 📋 Prerequisites

- Supabase project set up
- Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (required for uploads)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

This will install `tsx` which is needed to run the upload script.

### 2. Run Storage Migration

Apply the new storage bucket migration:

```bash
supabase db push
# or manually run: supabase/migrations/006_create_book_covers_bucket.sql
```

This creates a public storage bucket called `book-covers`.

### 3. Add Your Book Covers

Place your book cover images in the `/book-covers` directory.

**Name files by ISBN (recommended):**
```
book-covers/
  ├── 9780735211292.jpg       # Atomic Habits
  ├── 9781455586691.jpg       # Deep Work
  ├── 9780374533557.jpg       # Thinking, Fast and Slow
  └── ...
```

**Or by book title:**
```
book-covers/
  ├── atomic-habits.jpg
  ├── deep-work.png
  └── thinking-fast-and-slow.webp
```

### 4. Upload Covers

Run the upload script:

```bash
npm run upload-covers
```

The script will:
- ✅ Match images to books by ISBN or title
- ✅ Upload to Supabase Storage bucket `book-covers`
- ✅ Update the `books` table with public URLs
- ✅ Show a summary of successful uploads

## 📸 Image Specifications

### Recommended

- **Aspect Ratio:** 2:3 (portrait)
- **Dimensions:** 600x900px (or 400x600px minimum)
- **File Size:** < 500KB per image
- **Format:** JPEG or WebP (best compression)
- **Quality:** High enough for crisp display at 300x450px

### Supported Formats

- `.jpg` / `.jpeg`
- `.png`
- `.webp`

## 🗂️ File Naming

### By ISBN (Recommended)

The script will match files by ISBN from the database:

```
9780735211292.jpg  → Atomic Habits (ISBN: 9780735211292)
9780735211292.png  → Also works with different extensions
```

### By Title

The script will normalize titles (lowercase, remove special chars) and match:

```
atomic-habits.jpg           → "Atomic Habits"
thinking-fast-and-slow.png  → "Thinking, Fast and Slow"
the-lean-startup.webp       → "The Lean Startup"
```

## 📚 Current Books Requiring Covers

Run this SQL query to see which books need covers:

```sql
SELECT title, isbn, cover_image_url 
FROM books 
WHERE cover_image_url IS NULL 
ORDER BY title;
```

### List of Books with ISBNs

1. **Atomic Habits** - `9780735211292`
2. **Deep Work** - `9781455586691`
3. **Thinking, Fast and Slow** - `9780374533557`
4. **The Lean Startup** - `9780307887894`
5. **Sapiens** - `9780062316097`
6. **The Power of Habit** - `9780812981605`
7. **Influence** - `9780061241895`
8. **Start With Why** - `9781591846444`
9. **Zero to One** - `9780804139298`
10. **The 7 Habits of Highly Effective People** - `9780743269513`
11. **Mindset** - `9780345472328`
12. **The 4-Hour Workweek** - `9780307465351`
13. **Educated** - `9780399590504`
14. **Quiet** - `9780307352156`
15. **Daring Greatly** - `9781592408412`

## 🔍 How the Upload Script Works

### Matching Process

1. **Fetch all books** from the database
2. **Scan `/book-covers`** directory for images
3. **For each book:**
   - Try to match by ISBN
   - If no match, try to match by title (normalized)
   - If match found, upload image
4. **Upload to Supabase Storage** as `{book_id}.{ext}`
5. **Update database** with public URL

### Storage Structure

Images are stored in Supabase with clean naming:

```
book-covers/
  ├── {uuid-1}.jpg
  ├── {uuid-2}.jpg
  └── {uuid-3}.png
```

This avoids naming conflicts and ties directly to book IDs.

## 📊 Script Output Example

```
📚 Book Cover Upload Script

📁 Found 15 image(s) in /book-covers

🔍 Fetching books from database...
   Found 15 books in database

📖 Atomic Habits
   Matched: 9780735211292.jpg
   ✅ Uploaded: https://...supabase.co/storage/v1/object/public/book-covers/abc-123.jpg
   ✅ Database updated

📖 Deep Work
   Matched: deep-work.png
   ✅ Uploaded: https://...supabase.co/storage/v1/object/public/book-covers/def-456.png
   ✅ Database updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary:
   ✅ Successfully uploaded: 15
   ⏭️  Skipped (no match): 0
   ❌ Failed: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Book covers uploaded successfully!
   Visit your app to see the covers in action
```

## ✅ Verification

### 1. Check Supabase Storage

Go to your Supabase Dashboard → Storage → `book-covers` bucket

You should see your uploaded images.

### 2. Check Database

```sql
SELECT title, cover_image_url 
FROM books 
WHERE cover_image_url IS NOT NULL;
```

### 3. Check the App

- Visit `/dashboard/library`
- Book carousel on homepage
- All books should show real covers instead of placeholders

## 🔧 Troubleshooting

### "No matching cover found"

**Problem:** Script can't match image to book

**Solutions:**
- Check file naming matches ISBN or title exactly
- For title-based: remove special characters, use lowercase
- Check the console output for normalized title format

### "Upload failed"

**Problem:** Can't upload to Supabase Storage

**Solutions:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check storage bucket exists (run migration)
- Check image file is valid and not corrupted
- Verify file size < 50MB (Supabase limit)

### "Failed to update database"

**Problem:** Upload succeeded but database update failed

**Solutions:**
- Check RLS policies on `books` table
- Verify service role has permission to update
- Check book ID exists in database

### Images not showing in app

**Problem:** URLs in database but images don't display

**Solutions:**
- Check storage bucket is `public` (should be by default)
- Verify URLs are correct (should be publicly accessible)
- Clear browser cache
- Check browser console for CORS errors

## 🎨 Image Optimization Tips

### Compress Before Upload

Use tools like:
- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [Squoosh](https://squoosh.app/) - Modern formats & compression
- ImageOptim (Mac) - Bulk optimization

### Convert to WebP

WebP offers better compression than JPEG/PNG:

```bash
# Install cwebp
brew install webp

# Convert images
cwebp -q 80 input.jpg -o output.webp
```

### Batch Processing

For bulk conversion/optimization:

```bash
# Convert all JPGs to WebP
for file in book-covers/*.jpg; do
  cwebp -q 80 "$file" -o "${file%.jpg}.webp"
done
```

## 🔄 Re-running the Script

The script uses `upsert: true`, so you can:

- **Update existing covers:** Just re-run with new images
- **Add more covers:** Place new images and run again
- **Replace covers:** Use same filename, script will overwrite

## 📝 Alternative: Manual Upload

If you prefer manual control:

1. Go to Supabase Dashboard → Storage → `book-covers`
2. Click "Upload File"
3. Upload your images
4. Copy the public URL
5. Update the book record:
   ```sql
   UPDATE books 
   SET cover_image_url = 'https://...your-url.jpg'
   WHERE id = 'book-uuid';
   ```

## 🚀 Production Considerations

### CDN Caching

Supabase Storage includes CDN caching by default for public buckets.

### Image Optimization

Consider using Next.js Image component (already in use):

```tsx
<Image
  src={book.cover_image_url}
  alt={book.title}
  width={300}
  height={450}
  // Next.js will optimize automatically
/>
```

### Backup

Your covers are stored in Supabase, which handles backups. But consider:
- Keep original high-res versions locally
- Version control your source images (private repo)

## 📚 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
- Book cover sources:
  - [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers)
  - [Google Books API](https://developers.google.com/books)

---

**Need Help?** Check the troubleshooting section or review the script output for specific error messages.

