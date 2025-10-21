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
  { value: '1pg', label: 'Short', description: 'One sentence per chapter' },
  { value: '5pg', label: 'Medium', description: 'One paragraph per chapter' },
  { value: '15pg', label: 'Long', description: 'One page per chapter' }
] as const

export const DEFAULT_PREFERENCES: UserPreferences = {
  style: 'narrative',
  length: '5pg'
}
