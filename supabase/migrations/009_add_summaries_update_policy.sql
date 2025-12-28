-- Allow users to update their own summaries (required for upsert)
CREATE POLICY "Users can update own summaries"
  ON summaries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
