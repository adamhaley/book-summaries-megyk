import { NextRequest, NextResponse } from 'next/server'
import { parseUTMFromSearchParams, hasUTMParams, setUTMCookie } from '@/lib/utils/utm'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = await request.json()
    
    if (!searchParams) {
      return NextResponse.json({ error: 'Missing searchParams' }, { status: 400 })
    }

    const urlSearchParams = new URLSearchParams(searchParams)
    const utmParams = parseUTMFromSearchParams(urlSearchParams)
    
    if (!hasUTMParams(utmParams)) {
      return NextResponse.json({ message: 'No UTM parameters found' })
    }

    const response = NextResponse.json({ 
      success: true, 
      utm: utmParams 
    })
    
    // Set the UTM cookie
    response.headers.set('Set-Cookie', setUTMCookie(utmParams))
    
    return response
  } catch (error) {
    console.error('UTM tracking error:', error)
    return NextResponse.json({ error: 'Failed to process UTM parameters' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'UTM tracking endpoint' })
}