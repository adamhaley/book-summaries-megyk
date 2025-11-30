/**
 * Type-safe API route helpers for Next.js backend
 */

import type { Summary, UserProfile, UserPreferences } from '@megyk/types';
import type { ApiError } from './api';

export interface SummaryGenerationRequest {
  bookId: string;
  style: 'narrative' | 'bullet_points' | 'workbook';
  length: '1pg' | '5pg' | '15pg';
}

export interface SummaryGenerationResponse {
  summaryId: string;
  fileUrl: string;
  tokensSpent?: number;
  generationTime?: number;
}

/**
 * API routes for Megyk Books backend
 */
export function createRoutes(apiClient: ReturnType<typeof import('./api').createApiClient>) {
  return {
    /**
     * Summaries API
     */
    summaries: {
      /**
       * Generate a new book summary
       */
      generate: (data: SummaryGenerationRequest) =>
        apiClient.post<SummaryGenerationResponse>('/api/v1/summary', data),

      /**
       * Get all summaries for current user
       */
      list: () =>
        apiClient.get<Summary[]>('/api/v1/summaries'),

      /**
       * Download a summary PDF
       */
      download: (id: string) =>
        apiClient.get<Blob>(`/api/v1/summaries/${id}/download`),

      /**
       * Delete a summary
       */
      delete: (id: string) =>
        apiClient.delete<{ success: boolean }>(`/api/v1/summaries/${id}`),
    },

    /**
     * Profile API
     */
    profile: {
      /**
       * Get user profile
       */
      get: () =>
        apiClient.get<UserProfile>('/api/v1/profile'),

      /**
       * Update user profile
       */
      update: (data: Partial<UserProfile>) =>
        apiClient.put<UserProfile>('/api/v1/profile', data),

      /**
       * Update user preferences
       */
      updatePreferences: (preferences: UserPreferences) =>
        apiClient.put<UserProfile>('/api/v1/profile', { preferences }),
    },

    /**
     * Books API (future implementation)
     */
    books: {
      /**
       * Get all books
       */
      list: () =>
        apiClient.get<any[]>('/api/v1/books'),

      /**
       * Get a single book
       */
      get: (id: string) =>
        apiClient.get<any>(`/api/v1/books/${id}`),
    },
  };
}
