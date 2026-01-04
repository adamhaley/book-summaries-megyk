import { cookies } from 'next/headers'
import { UTM_COOKIE_NAME, UTMParams } from './utm'

export async function getUTMFromCookies(): Promise<UTMParams | null> {
  try {
    const cookieStore = await cookies()
    const utmCookie = cookieStore.get(UTM_COOKIE_NAME)
    if (utmCookie?.value) {
      return JSON.parse(utmCookie.value)
    }
  } catch (error) {
    console.error('Error parsing UTM from cookies:', error)
  }
  return null
}
