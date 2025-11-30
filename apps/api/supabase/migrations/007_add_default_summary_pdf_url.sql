-- Add default_summary_pdf_url column to books table
-- This stores the URL to pre-generated summary PDFs in Supabase Storage
-- Storage path convention: summaries/{book_id}/default.pdf

ALTER TABLE books
ADD COLUMN default_summary_pdf_url text;

-- Add comment for documentation
COMMENT ON COLUMN books.default_summary_pdf_url IS 'Public or signed URL to pre-generated summary PDF in Supabase Storage (summaries/{book_id}/default.pdf)';

-- Create index for faster lookups when filtering books with/without default summaries
CREATE INDEX idx_books_default_summary_pdf_url ON books(default_summary_pdf_url) WHERE default_summary_pdf_url IS NOT NULL;
