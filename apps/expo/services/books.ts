import { supabase } from '../lib/supabase';

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre?: string;
  publication_year?: number;
  cover_image_url?: string;
  has_default_summary?: boolean;
  live?: boolean;
}

export interface BooksResponse {
  books: Book[];
  total: number;
}

export interface FetchBooksParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'title' | 'author' | 'genre' | 'publication_year';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch books from the library
 */
export async function fetchBooks(params: FetchBooksParams = {}): Promise<BooksResponse> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'title',
    sortOrder = 'asc',
  } = params;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // Get total count
    const { count } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('live', true);

    // Get paginated books
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('live', true)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Error fetching books:', error);
      throw error;
    }

    return {
      books: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Failed to fetch books:', error);
    throw error;
  }
}

/**
 * Fetch a single book by ID
 */
export async function fetchBook(bookId: string): Promise<Book | null> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('live', true)
      .single();

    if (error) {
      console.error('Error fetching book:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch book:', error);
    return null;
  }
}
