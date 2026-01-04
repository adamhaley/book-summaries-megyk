export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export const UTM_COOKIE_NAME = 'utm_tracking'
export const UTM_COOKIE_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 days

export function parseUTMFromSearchParams(searchParams: URLSearchParams): UTMParams {
  return {
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
  }
}

export function hasUTMParams(utmParams: UTMParams): boolean {
  return Object.values(utmParams).some(value => value !== undefined)
}

export function setUTMCookie(utmParams: UTMParams): string {
  const cookieValue = JSON.stringify(utmParams)
  const expires = new Date(Date.now() + UTM_COOKIE_EXPIRY)
  
  return `${UTM_COOKIE_NAME}=${encodeURIComponent(cookieValue)}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax`
}
