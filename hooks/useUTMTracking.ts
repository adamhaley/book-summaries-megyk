'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { UTMParams, parseUTMFromSearchParams, hasUTMParams, UTM_COOKIE_NAME, UTM_COOKIE_EXPIRY } from '@/lib/utils/utm'

export function useUTMTracking() {
  const searchParams = useSearchParams()
  const [utmParams, setUTMParams] = useState<UTMParams | null>(null)

  useEffect(() => {
    // Parse UTM parameters from current URL
    const currentUTM = parseUTMFromSearchParams(searchParams)
    console.log('[UTM] current URL params:', Object.fromEntries(searchParams.entries()))
    
    // If we have UTM parameters in the URL, store them
    if (hasUTMParams(currentUTM)) {
      console.log('[UTM] found in URL, storing:', currentUTM)
      setUTMParams(currentUTM)
      
      // Store in cookies for persistence
      const cookieValue = JSON.stringify(currentUTM)
      const expires = new Date(Date.now() + UTM_COOKIE_EXPIRY)
      document.cookie = `${UTM_COOKIE_NAME}=${encodeURIComponent(cookieValue)}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax`
      console.log('[UTM] cookie set:', UTM_COOKIE_NAME)
    } else {
      // No UTM in URL, check if we have stored UTM in cookies
      try {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${UTM_COOKIE_NAME}=`))
          ?.split('=')[1]
        
        if (cookieValue) {
          const storedUTM = JSON.parse(decodeURIComponent(cookieValue))
          console.log('[UTM] loaded from cookie:', storedUTM)
          setUTMParams(storedUTM)
        } else {
          console.log('[UTM] no UTM in URL or cookie')
        }
      } catch (error) {
        console.error('Error parsing UTM from cookies:', error)
      }
    }
  }, [searchParams])

  const clearUTM = () => {
    setUTMParams(null)
    document.cookie = `${UTM_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    console.log('[UTM] cleared cookie:', UTM_COOKIE_NAME)
  }

  return { utmParams, clearUTM }
}