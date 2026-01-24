-- Create book_genres table for normalized genre storage
-- Note: This table may already exist in production (created manually)
-- This migration documents the schema for version control

CREATE TABLE IF NOT EXISTS book_genres (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast name lookups
CREATE INDEX IF NOT EXISTS idx_book_genres_name ON book_genres(name);

-- Enable Row Level Security
ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read genres (public reference data)
DROP POLICY IF EXISTS "Anyone can read book_genres" ON book_genres;
CREATE POLICY "Anyone can read book_genres"
  ON book_genres
  FOR SELECT
  USING (true);

-- Policy: Only service role can manage genres
DROP POLICY IF EXISTS "Service role can manage book_genres" ON book_genres;
CREATE POLICY "Service role can manage book_genres"
  ON book_genres
  FOR ALL
  USING (auth.role() = 'service_role');

-- Insert default genres if they don't exist
INSERT INTO book_genres (id, name) VALUES
  (1, 'Productivity'),
  (2, 'Psychology'),
  (3, 'Business'),
  (4, 'Leadership'),
  (5, 'Management'),
  (6, 'Self-Help'),
  (7, 'History'),
  (8, 'Memoir')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to max id + 1 to avoid conflicts
SELECT setval('book_genres_id_seq', COALESCE((SELECT MAX(id) FROM book_genres), 0) + 1, false);
