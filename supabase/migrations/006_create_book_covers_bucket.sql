-- Create storage bucket for book cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read book covers (public access)
CREATE POLICY "Anyone can view book covers"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'book-covers');

-- Policy: Only service role can upload book covers (admin only)
CREATE POLICY "Service role can upload book covers"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'book-covers' AND
    auth.role() = 'service_role'
  );

-- Policy: Only service role can update book covers
CREATE POLICY "Service role can update book covers"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'book-covers' AND
    auth.role() = 'service_role'
  );

-- Policy: Only service role can delete book covers
CREATE POLICY "Service role can delete book covers"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'book-covers' AND
    auth.role() = 'service_role'
  );

