import { supabase } from '../lib/supabase';

export interface Summary {
  id: string;
  user_id: string;
  book_id: string;
  book_title?: string;
  book_author?: string;
  style: 'narrative' | 'bullet_points' | 'workbook';
  length: 'short' | 'medium' | 'long';
  file_path: string;
  tokens_spent?: number;
  generation_time?: number;
  created_at: string;
  updated_at: string;
}

export interface FetchSummariesResponse {
  summaries: Summary[];
  total: number;
}

export interface GenerateSummaryRequest {
  book_id: string;
  style: 'narrative' | 'bullet_points' | 'workbook';
  length: 'short' | 'medium' | 'long';
}

/**
 * Fetch user's summaries
 */
export async function fetchSummaries(userId: string): Promise<FetchSummariesResponse> {
  try {
    // Get summaries with book details joined
    const { data, error, count } = await supabase
      .from('summaries')
      .select(`
        *,
        books:book_id (
          title,
          author
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching summaries:', error);
      throw error;
    }

    // Flatten book data
    const summaries = (data || []).map((item: any) => ({
      ...item,
      book_title: item.books?.title,
      book_author: item.books?.author,
    }));

    return {
      summaries,
      total: count || 0,
    };
  } catch (error) {
    console.error('Failed to fetch summaries:', error);
    throw error;
  }
}

/**
 * Generate a new summary (calls API endpoint)
 */
export async function generateSummary(
  request: GenerateSummaryRequest,
  accessToken: string
): Promise<Blob> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3200';

  try {
    const response = await fetch(`${apiUrl}/api/v1/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to generate summary: ${response.statusText}`);
    }

    // Return PDF blob
    return await response.blob();
  } catch (error) {
    console.error('Failed to generate summary:', error);
    throw error;
  }
}

/**
 * Download a summary PDF
 */
export async function downloadSummary(summaryId: string): Promise<string> {
  try {
    const { data: summaryData, error: fetchError } = await supabase
      .from('summaries')
      .select('file_path, user_id')
      .eq('id', summaryId)
      .single();

    if (fetchError || !summaryData) {
      throw new Error('Summary not found');
    }

    // Get public URL for the file
    const { data } = supabase.storage
      .from('summaries')
      .getPublicUrl(summaryData.file_path);

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to download summary:', error);
    throw error;
  }
}

/**
 * Delete a summary
 */
export async function deleteSummary(summaryId: string, userId: string): Promise<void> {
  try {
    // Get file path
    const { data: summaryData, error: fetchError } = await supabase
      .from('summaries')
      .select('file_path')
      .eq('id', summaryId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !summaryData) {
      throw new Error('Summary not found');
    }

    // Delete from storage
    await supabase.storage
      .from('summaries')
      .remove([summaryData.file_path]);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('summaries')
      .delete()
      .eq('id', summaryId)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }
  } catch (error) {
    console.error('Failed to delete summary:', error);
    throw error;
  }
}
