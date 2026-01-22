import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const health = {
    status: 'healthy' as 'healthy' | 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    checks: {} as Record<string, { status: string; message?: string }>
  }

  // Check N8N webhook URL
  if (!process.env.N8N_WEBHOOK_URL) {
    health.checks.n8n = {
      status: 'error',
      message: 'N8N_WEBHOOK_URL not configured'
    }
    health.status = 'unhealthy'
  } else {
    health.checks.n8n = {
      status: 'ok',
      message: 'Configured'
    }
  }

  // Check Supabase connection
  try {
    const supabase = await createClient()
    const { error, count } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })

    if (error) {
      health.checks.supabase = {
        status: 'error',
        message: error.message
      }
      health.status = 'unhealthy'
    } else {
      health.checks.supabase = {
        status: 'ok',
        message: `Connected (${count} books)`
      }
    }
  } catch (error) {
    health.checks.supabase = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
    health.status = 'unhealthy'
  }

  // Check required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL',
    'N8N_WEBHOOK_URL'
  ]

  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key])

  if (missingEnvVars.length > 0) {
    health.checks.environment = {
      status: 'error',
      message: `Missing: ${missingEnvVars.join(', ')}`
    }
    health.status = 'unhealthy'
  } else {
    health.checks.environment = {
      status: 'ok',
      message: 'All required variables present'
    }
  }

  // Check Supabase Storage
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.storage.getBucket('summaries')

    if (error || !data) {
      health.checks.storage = {
        status: 'warning',
        message: 'Could not verify storage bucket'
      }
    } else {
      health.checks.storage = {
        status: 'ok',
        message: 'Storage bucket accessible'
      }
    }
  } catch (error) {
    health.checks.storage = {
      status: 'warning',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  const statusCode = health.status === 'healthy' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
