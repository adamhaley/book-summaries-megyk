-- Enforce one summary per user/book/style/length combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_summaries_user_book_style_length_unique
  ON summaries(user_id, book_id, style, length);
