-- Add book_genre_id foreign key to books table
-- Note: This column may already exist in production (created manually)
-- This migration documents the schema for version control

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'book_genre_id'
  ) THEN
    ALTER TABLE books ADD COLUMN book_genre_id INTEGER;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'books_book_genre_id_fkey'
  ) THEN
    ALTER TABLE books
    ADD CONSTRAINT books_book_genre_id_fkey
    FOREIGN KEY (book_genre_id) REFERENCES book_genres(id);
  END IF;
END $$;

-- Create index for fast genre lookups
CREATE INDEX IF NOT EXISTS idx_books_book_genre_id ON books(book_genre_id);

-- Migrate existing genre text data to book_genre_id where possible
-- This updates books that have a genre text but no book_genre_id
UPDATE books b
SET book_genre_id = bg.id
FROM book_genres bg
WHERE b.genre IS NOT NULL
  AND b.book_genre_id IS NULL
  AND LOWER(b.genre) = LOWER(bg.name);
