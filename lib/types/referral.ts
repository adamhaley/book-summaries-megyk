/**
 * Referral system types and constants
 */

// =============================================
// Constants
// =============================================

export const REFERRAL_CODE_PARAM = 'ref'
export const REFERRAL_CODE_COOKIE = 'megyk_ref_code'
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

export const REFERRAL_REWARDS = {
  referrer_bonus: 1500,
  referred_bonus: 1000,
} as const

// =============================================
// Status Types
// =============================================

export type ReferralStatus = 'pending' | 'completed' | 'expired'
export type ActivationType = 'chat' | 'summary'

// =============================================
// Database Types
// =============================================

export interface ReferralCode {
  id: string
  user_id: string
  code: string
  total_referrals: number
  successful_referrals: number
  created_at: string
  updated_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code_id: string
  status: ReferralStatus
  activation_type: ActivationType | null
  activated_at: string | null
  created_at: string
  updated_at: string
}

// =============================================
// API Types
// =============================================

export interface ReferralStats {
  referral_code: string
  referral_link: string
  pending: number
  successful: number
  total_earned: number
}

export interface ReferralCodeValidation {
  valid: boolean
  code: string
  owner_id?: string
  error?: string
}

export interface ReferralStatsResponse {
  stats: ReferralStats
}

export interface ValidateReferralCodeResponse {
  valid: boolean
  code: string
  error?: string
}

// =============================================
// Component Props Types
// =============================================

export interface ReferralShareSectionProps {
  stats?: ReferralStats | null
  isLoading?: boolean
}

// =============================================
// Helper Functions
// =============================================

/**
 * Generate the full referral link for a given code
 */
export function generateReferralLink(code: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/auth/signup?${REFERRAL_CODE_PARAM}=${code}`
}

/**
 * Extract referral code from URL search params
 */
export function extractReferralCode(searchParams: URLSearchParams): string | null {
  return searchParams.get(REFERRAL_CODE_PARAM)
}

/**
 * Validate referral code format (8 alphanumeric chars, no confusing chars)
 */
export function isValidReferralCodeFormat(code: string): boolean {
  return /^[A-HJ-NP-Z2-9]{8}$/i.test(code)
}

/**
 * Format credits earned for display
 */
export function formatReferralCredits(amount: number): string {
  return `${amount.toLocaleString()} MC`
}
