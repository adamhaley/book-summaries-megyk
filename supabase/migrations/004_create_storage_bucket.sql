-- Create storage bucket for PDF summaries
INSERT INTO storage.buckets (id, name, public)
VALUES ('summaries', 'summaries', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own summaries
CREATE POLICY "Users can upload own summaries"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'summaries' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can read their own summaries
CREATE POLICY "Users can read own summaries"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'summaries' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update their own summaries
CREATE POLICY "Users can update own summaries"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'summaries' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete their own summaries
CREATE POLICY "Users can delete own summaries"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'summaries' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Service role can do anything (for server-side operations)
CREATE POLICY "Service role has full access"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'summaries' AND
    auth.role() = 'service_role'
  );
