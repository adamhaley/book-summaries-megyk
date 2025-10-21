-- Create summaries table for storing generated book summaries
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  style VARCHAR(50) NOT NULL,
  length VARCHAR(50) NOT NULL,
  file_path TEXT NOT NULL,
  tokens_spent INTEGER,
  generation_time NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_summaries_book_id ON summaries(book_id);
CREATE INDEX idx_summaries_created_at ON summaries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own summaries
CREATE POLICY "Users can read own summaries"
  ON summaries
  FOR SELECT
  USING (user_id::text = 'bfb1e2f2-353c-4cf7-807e-4be63ed7cfff'::text);

-- Policy: Service role can insert summaries
CREATE POLICY "Service role can insert summaries"
  ON summaries
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can delete their own summaries
CREATE POLICY "Users can delete own summaries"
  ON summaries
  FOR DELETE
  USING (user_id::text = 'bfb1e2f2-353c-4cf7-807e-4be63ed7cfff'::text);

-- Trigger to update updated_at on every update
CREATE TRIGGER update_summaries_updated_at
  BEFORE UPDATE ON summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
