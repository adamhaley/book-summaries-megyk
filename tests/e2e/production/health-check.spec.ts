import { test, expect } from '@playwright/test'

test.describe('Production Health Checks', () => {
  test('Health endpoint returns healthy status', async ({ request }) => {
    const response = await request.get('/api/health')

    // Should return 200 for healthy or 503 for unhealthy (but not 404 or 500)
    expect([200, 503]).toContain(response.status())

    const health = await response.json()

    // Validate structure
    expect(health).toHaveProperty('status')
    expect(health).toHaveProperty('timestamp')
    expect(health).toHaveProperty('checks')

    // Log results for debugging
    console.log('Health check results:', JSON.stringify(health, null, 2))

    // If unhealthy, fail the test
    if (health.status === 'unhealthy') {
      const failedChecks = Object.entries(health.checks)
        .filter(([_, check]: [string, any]) => check.status === 'error')
        .map(([name, check]: [string, any]) => `${name}: ${check.message}`)

      throw new Error(`Health check failed:\n${failedChecks.join('\n')}`)
    }

    expect(health.status).toBe('healthy')
  })

  test('N8N webhook URL is configured', async ({ request }) => {
    const response = await request.get('/api/health')
    const health = await response.json()

    expect(health.checks.n8n).toBeDefined()
    expect(health.checks.n8n.status).toBe('ok')
    expect(health.checks.n8n.message).not.toContain('not configured')
  })

  test('Supabase connection is working', async ({ request }) => {
    const response = await request.get('/api/health')
    const health = await response.json()

    expect(health.checks.supabase).toBeDefined()
    expect(health.checks.supabase.status).toBe('ok')
  })

  test('All required environment variables are present', async ({ request }) => {
    const response = await request.get('/api/health')
    const health = await response.json()

    expect(health.checks.environment).toBeDefined()
    expect(health.checks.environment.status).toBe('ok')
    expect(health.checks.environment.message).not.toContain('Missing')
  })

  test('Storage bucket is accessible', async ({ request }) => {
    const response = await request.get('/api/health')
    const health = await response.json()

    expect(health.checks.storage).toBeDefined()
    expect(['ok', 'warning']).toContain(health.checks.storage.status)
  })
})
