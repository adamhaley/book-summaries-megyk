export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  publication_year?: number
  genre?: string
  description?: string
  cover_image_url?: string
  page_count?: number
  created_at: string
  updated_at: string
}

export interface BooksResponse {
  books: Book[]
  count: number
}
