import { cookies } from 'next/headers'
import { UTM_COOKIE_NAME, UTMParams } from './utm'

export async function getUTMFromCookies(): Promise<UTMParams | null> {
  try {
    const cookieStore = await cookies()
    const utmCookie = cookieStore.get(UTM_COOKIE_NAME)
    console.log(`[UTM] Cookie name: ${UTM_COOKIE_NAME}`)
    console.log(`[UTM] Cookie found:`, utmCookie ? 'yes' : 'no')
    if (utmCookie?.value) {
      console.log(`[UTM] Cookie value:`, utmCookie.value)
      const parsed = JSON.parse(utmCookie.value)
      console.log(`[UTM] Parsed UTM:`, parsed)
      return parsed
    }
  } catch (error) {
    console.error('[UTM] Error parsing UTM from cookies:', error)
  }
  console.log('[UTM] Returning null (no UTM data)')
  return null
}
