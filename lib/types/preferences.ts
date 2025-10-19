/**
 * User preference types for personalized book summaries
 */

export type SummaryStyle = 'narrative' | 'bullet_points' | 'workbook'
export type SummaryLength = '1pg' | '5pg' | '15pg'

export interface UserPreferences {
  style: SummaryStyle
  length: SummaryLength
}

export interface UserProfile {
  id: string
  user_id: string
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

export const SUMMARY_STYLE_OPTIONS = [
  { value: 'narrative', label: 'Narrative', description: 'Story-like flow with connected ideas' },
  { value: 'bullet_points', label: 'Bullet Points', description: 'Quick, scannable key points' },
  { value: 'workbook', label: 'Workbook', description: 'Interactive exercises and reflections' }
] as const

export const SUMMARY_LENGTH_OPTIONS = [
  { value: '1pg', label: '1 Page', description: 'Quick overview (~250 words)' },
  { value: '5pg', label: '5 Pages', description: 'Moderate depth (~1,250 words)' },
  { value: '15pg', label: '15 Pages', description: 'Comprehensive analysis (~3,750 words)' }
] as const

export const DEFAULT_PREFERENCES: UserPreferences = {
  style: 'narrative',
  length: '5pg'
}
