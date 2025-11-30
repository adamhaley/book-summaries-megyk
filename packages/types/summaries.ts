/**
 * Summary record types for generated book summaries
 */

export interface Summary {
  id: string
  user_id: string
  book_id: string
  style: string
  length: string
  file_path: string
  tokens_spent: number | null
  generation_time: number | null
  created_at: string
  updated_at: string
}

export interface SummaryWithBook extends Summary {
  book?: {
    id: string
    title: string
    author: string
  }
}
