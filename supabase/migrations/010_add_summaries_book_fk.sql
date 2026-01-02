-- Add foreign key so summaries can join to books
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'summaries_book_id_fkey'
  ) THEN
    ALTER TABLE summaries
      ADD CONSTRAINT summaries_book_id_fkey
      FOREIGN KEY (book_id)
      REFERENCES books(id)
      ON DELETE CASCADE;
  END IF;
END $$;
