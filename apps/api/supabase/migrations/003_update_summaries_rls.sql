-- Drop old policies with hardcoded user ID
DROP POLICY IF EXISTS "Users can read own summaries" ON summaries;
DROP POLICY IF EXISTS "Users can delete own summaries" ON summaries;

-- Create new policies using auth.uid()
CREATE POLICY "Users can read own summaries"
  ON summaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries"
  ON summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries"
  ON summaries
  FOR DELETE
  USING (auth.uid() = user_id);
