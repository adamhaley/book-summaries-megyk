# Production Monitoring & Testing Strategy

## Overview
this document establishes a comprehensive monitoring and testing strategy to prevent unintended outages

## 1. Critical E2E Tests for Production

### Priority 1: Critical Path Tests (Must Pass)
These tests should run against production every 5-15 minutes:

#### Test 1: Summary Generation Flow (API Level)
**Purpose:** Catch the exact issue we just experienced
```typescript
// tests/e2e/production/summary-api.spec.ts
import { test, expect } from '@playwright/test'

test('API: Summary generation endpoint is configured', async ({ request }) => {
  const response = await request.post('/api/v1/summary', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TEST_USER_TOKEN}`
    },
    data: {
      book_id: process.env.TEST_BOOK_ID,
      preferences: { style: 'narrative', length: 'short' }
    },
    timeout: 10000 // 10 second timeout for health check
  })

  // Should NOT return 500 with "N8N webhook URL not configured"
  expect(response.status()).not.toBe(500)

  const body = await response.json().catch(() => ({}))
  expect(body.error).not.toContain('N8N webhook URL not configured')

  // Should either succeed (200) or return a different error
  expect([200, 400, 502]).toContain(response.status())
})
```

#### Test 2: Environment Variables Health Check
```typescript
// tests/e2e/production/health-check.spec.ts
test('Health: All required environment variables are configured', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.ok()).toBeTruthy()

  const health = await response.json()

  // Check critical services
  expect(health.n8n).toBe('configured')
  expect(health.supabase).toBe('connected')
  expect(health.status).toBe('healthy')
})
```

#### Test 3: End-to-End Summary Generation (Full Flow)
```typescript
// tests/e2e/production/summary-e2e.spec.ts
test('E2E: Complete summary generation flow', async ({ page }) => {
  // Login
  await page.goto('/auth/signin')
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!)
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!)
  await page.click('button[type="submit"]')

  // Navigate to library
  await page.goto('/dashboard/library')
  await page.waitForLoadState('networkidle')

  // Open generate summary modal
  const generateButton = page.locator('button:has-text("Generate"), button:has-text("Get Summary")').first()
  await generateButton.click()

  // Wait for modal
  await page.waitForSelector('text=Generate Summary')

  // Check for error message (should NOT see N8N error)
  const errorAlert = page.locator('[role="alert"]:has-text("N8N webhook")')
  await expect(errorAlert).not.toBeVisible({ timeout: 5000 })

  // Click generate button
  const modalGenerateButton = page.locator('button:has-text("Generate Summary")')
  await modalGenerateButton.click()

  // Wait for loading state
  await expect(page.locator('text=Generating')).toBeVisible()

  // Should NOT see configuration error
  const configError = page.locator('text=/N8N webhook.*not configured/i')
  await expect(configError).not.toBeVisible({ timeout: 3000 })
})
```

### Priority 2: User Flow Tests (Run every 15-30 minutes)
- Authentication (sign in/sign out)
- Profile preferences loading
- Book library loading
- Summaries page loading
- PDF download

### Test Configuration for Production
```typescript
// playwright.config.production.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/production',

  // Production-specific settings
  timeout: 30000, // 30 seconds per test
  retries: 2, // Retry twice on failure

  use: {
    baseURL: process.env.PRODUCTION_URL || 'https://app.megyk.com',

    // Use test account credentials
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.PROD_TEST_TOKEN}`
    }
  },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/production' }],
    ['junit', { outputFile: 'test-results/production-junit.xml' }],
    // Send failures to monitoring
    ['./reporters/slack-reporter.ts'] // Custom reporter
  ]
})
```

## 2. Health Check Endpoint

Create a comprehensive health check endpoint that validates all dependencies:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
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
    health.checks.n8n = { status: 'ok' }
  }

  // Check Supabase connection
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('books').select('count').limit(1).single()

    if (error) {
      health.checks.supabase = {
        status: 'error',
        message: error.message
      }
      health.status = 'unhealthy'
    } else {
      health.checks.supabase = { status: 'ok' }
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
    health.checks.environment = { status: 'ok' }
  }

  const statusCode = health.status === 'healthy' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
```

## 3. Monitoring Services Setup

### Option A: UptimeRobot (Free, Simple)
**Setup:**
1. Sign up at https://uptimerobot.com
2. Create monitors:
   - **HTTP Monitor**: `https://app.megyk.com/api/health` (every 5 min)
   - **Keyword Monitor**: `https://app.megyk.com` - check for "Megyk Books"
   - **API Monitor**: Test summary generation endpoint

**Alert Channels:**
- Email: your@email.com
- Slack webhook (see below)
- SMS (optional)

**Recommended Settings:**
- Check interval: 5 minutes (critical), 15 minutes (non-critical)
- Alert after: 2 consecutive failures
- Expected status code: 200
- Expected keyword: `"status":"healthy"`

### Option B: Better Uptime (Free tier available)
**Advantages:**
- More sophisticated monitoring
- Incident management
- Status page for users

**Setup:**
1. Sign up at https://betteruptime.com
2. Create monitors for:
   - Health endpoint
   - Critical user flows (via API)

### Option C: Pingdom (Paid, but comprehensive)
- Real user monitoring
- Transaction monitoring (multi-step flows)
- Synthetic monitoring

## 4. Error Tracking with Sentry

Add Sentry for real-time error tracking:

```bash
yarn add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  tracesSampleRate: 0.1,

  beforeSend(event, hint) {
    // Add context for missing env vars
    if (event.message?.includes('not configured')) {
      event.tags = {
        ...event.tags,
        category: 'configuration',
        severity: 'critical'
      }
    }
    return event
  }
})
```

**Alert on specific errors:**
- "N8N webhook URL not configured"
- "Supabase.*not configured"
- Any 500 errors on `/api/v1/summary`

## 5. GitHub Actions CI/CD Pipeline

Add automated tests to your deployment pipeline:

```yaml
# .github/workflows/production-tests.yml
name: Production Smoke Tests

on:
  # Run after every deployment
  workflow_run:
    workflows: ["Deploy to Production"]
    types:
      - completed

  # Also run on schedule (every 15 minutes)
  schedule:
    - cron: '*/15 * * * *'

  # Allow manual trigger
  workflow_dispatch:

jobs:
  smoke-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run production smoke tests
        env:
          PRODUCTION_URL: https://app.megyk.com
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
        run: npx playwright test --config=playwright.config.production.ts

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "🚨 Production smoke tests FAILED on app.megyk.com",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Tests Failed*\n\nView details: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                  }
                }
              ]
            }
```

## 6. Slack Alerting Setup

Create a Slack app for alerts:

**Setup:**
1. Go to https://api.slack.com/apps
2. Create new app → "From scratch"
3. Enable Incoming Webhooks
4. Add webhook to workspace
5. Copy webhook URL

**Integration Points:**
- UptimeRobot → Slack webhook
- Sentry → Slack integration
- GitHub Actions → Slack webhook
- Custom health check script → Slack webhook

**Example Slack Alert:**
```javascript
// scripts/health-check-and-alert.js
const https = require('https')

async function checkHealth() {
  const response = await fetch('https://app.megyk.com/api/health')
  const health = await response.json()

  if (health.status !== 'healthy') {
    // Send Slack alert
    const slackMessage = {
      text: '🚨 Production Health Check Failed',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Status*: ${health.status}\n*Timestamp*: ${health.timestamp}`
          }
        },
        {
          type: 'section',
          fields: Object.entries(health.checks).map(([key, value]) => ({
            type: 'mrkdwn',
            text: `*${key}*: ${value.status}\n${value.message || ''}`
          }))
        }
      ]
    }

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    })
  }
}

checkHealth()
```

**Run via cron (on your server):**
```bash
# crontab -e
*/5 * * * * cd /path/to/book-summaries && node scripts/health-check-and-alert.js
```

## 7. Logging & Observability

### Application Logging
```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  // In production, use JSON logs
  ...(process.env.NODE_ENV === 'production'
    ? {}
    : { transport: { target: 'pino-pretty' } }
  )
})

// Usage in API routes
logger.error({
  error: 'N8N_WEBHOOK_URL not configured',
  endpoint: '/api/v1/summary',
  userId: user.id
}, 'Critical configuration missing')
```

### Docker Logs Monitoring
```bash
# Add to docker-compose.yml
services:
  megyk-books:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Monitor logs for errors:**
```bash
# Create alert script
#!/bin/bash
# scripts/monitor-docker-logs.sh

docker logs megyk-books 2>&1 | grep -i "error\|exception\|not configured" | \
while read line; do
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{\"text\": \"🔴 Production Error: $line\"}"
done
```

## 8. Pre-Deployment Checklist

Add this to your deployment script:

```bash
# .scripts/pre-deploy-checks.sh
#!/bin/bash
set -e

echo "🔍 Running pre-deployment checks..."

# Check 1: Environment variables in docker-compose
echo "✓ Checking docker-compose.yml for required env vars..."
COMPOSE_FILE="../n8n-docker-caddy/docker-compose.yml"

if ! grep -q "N8N_WEBHOOK_URL" "$COMPOSE_FILE"; then
  echo "❌ ERROR: N8N_WEBHOOK_URL not found in docker-compose.yml"
  exit 1
fi

# Check 2: Health check endpoint exists
echo "✓ Checking health endpoint exists..."
if [ ! -f "app/api/health/route.ts" ]; then
  echo "❌ ERROR: Health endpoint not found"
  exit 1
fi

# Check 3: Critical tests pass
echo "✓ Running critical path tests..."
npx playwright test tests/e2e/production/ --config=playwright.config.production.ts

echo "✅ All pre-deployment checks passed!"
```

**Update deploy.sh:**
```bash
#!/bin/bash
set -e

# Run pre-deployment checks
./.scripts/pre-deploy-checks.sh

# Continue with deployment...
git pull origin master
# ... rest of deploy script
```

## 9. Recommended Testing Schedule

| Test Type | Frequency | Tools |
|-----------|-----------|-------|
| Health Check API | Every 5 min | UptimeRobot, GitHub Actions |
| Summary Generation | Every 15 min | Playwright E2E |
| Full User Flow | Every 30 min | Playwright E2E |
| Cross-Browser | Daily | Playwright (Chrome, Firefox, Safari) |
| Mobile Tests | Daily | Playwright (iOS, Android) |
| Load Testing | Weekly | k6, Artillery |
| Security Scan | Weekly | OWASP ZAP, Snyk |

## 10. Incident Response Runbook

**When alert fires:**

1. **Check health endpoint**
   ```bash
   curl https://app.megyk.com/api/health | jq
   ```

2. **Check Docker logs**
   ```bash
   ssh production-server
   docker logs megyk-books --tail=100
   ```

3. **Check environment variables**
   ```bash
   docker exec megyk-books env | grep N8N
   ```

4. **Quick fix for missing env var**
   ```bash
   # Edit docker-compose.yml
   nano /path/to/n8n-docker-caddy/docker-compose.yml

   # Add missing variable
   # Restart container
   docker compose up -d megyk-books

   # Verify fix
   curl https://app.megyk.com/api/health
   ```

5. **Post-incident**
   - Document what happened
   - Update runbook
   - Add new test to prevent recurrence

## 11. Quick Wins (Implement First)

**Priority 1 (Today):**
- [ ] Create `/api/health` endpoint
- [ ] Set up UptimeRobot with health check
- [ ] Add Slack webhook for alerts

**Priority 2 (This Week):**
- [ ] Write production smoke tests
- [ ] Set up GitHub Actions scheduled tests
- [ ] Add Sentry error tracking

**Priority 3 (This Month):**
- [ ] Implement comprehensive logging
- [ ] Add pre-deployment checks
- [ ] Set up status page for users

## 12. Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| UptimeRobot | Free (50 monitors) | $0 |
| GitHub Actions | Free (2000 min/month) | $0 |
| Sentry | Developer (5k events/month) | $0 |
| Slack | Free | $0 |
| **Total** | | **$0/month** |

## Summary

This monitoring strategy ensures:
- ✅ **Early detection** - Issues caught within 5-15 minutes
- ✅ **Immediate alerts** - Slack notifications when things break
- ✅ **Root cause analysis** - Logs and error tracking
- ✅ **Prevention** - Pre-deployment checks catch issues before deploy
- ✅ **Zero cost** - All recommended tools have free tiers

The N8N_WEBHOOK_URL incident would have been caught by:
1. Health check endpoint returning 503
2. UptimeRobot alerting within 5 minutes
3. First user attempting summary generation
4. Automated smoke test after deployment
