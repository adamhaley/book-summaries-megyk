/**
 * @megyk/types
 * Shared TypeScript types for Megyk Books platform
 * Used across API backend and Expo frontend
 */

// Export all book types
export type { Book, BooksResponse } from './books'

// Export all preference types
export type {
  SummaryStyle,
  SummaryLength,
  UserPreferences,
  UserProfile
} from './preferences'

export {
  SUMMARY_STYLE_OPTIONS,
  SUMMARY_LENGTH_OPTIONS,
  DEFAULT_PREFERENCES
} from './preferences'

// Export all summary types
export type { Summary, SummaryWithBook } from './summaries'
