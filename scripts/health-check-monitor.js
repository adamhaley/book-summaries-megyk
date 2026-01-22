#!/usr/bin/env node
/**
 * Production Health Check Monitor
 *
 * Checks the /api/health endpoint and sends Slack alerts on failure.
 * Run via cron: */5 * * * * node /path/to/scripts/health-check-monitor.js
 */

const https = require('https')

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://app.megyk.com'
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

async function checkHealth() {
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/health`)
    const health = await response.json()

    console.log(`[${new Date().toISOString()}] Health check: ${health.status}`)

    if (health.status === 'unhealthy') {
      const failedChecks = Object.entries(health.checks)
        .filter(([_, check]) => check.status === 'error')
        .map(([name, check]) => `• *${name}*: ${check.message}`)

      await sendSlackAlert({
        status: '🚨 UNHEALTHY',
        checks: failedChecks.join('\n'),
        timestamp: health.timestamp
      })

      // Exit with error code for cron monitoring
      process.exit(1)
    } else {
      // Check for warnings
      const warnings = Object.entries(health.checks)
        .filter(([_, check]) => check.status === 'warning')

      if (warnings.length > 0) {
        console.warn('⚠️  Warnings detected:', warnings)
      }
    }
  } catch (error) {
    console.error('❌ Health check failed:', error.message)

    if (SLACK_WEBHOOK_URL) {
      await sendSlackAlert({
        status: '❌ FAILED',
        checks: `Health check request failed: ${error.message}`,
        timestamp: new Date().toISOString()
      })
    }

    process.exit(1)
  }
}

async function sendSlackAlert({ status, checks, timestamp }) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('⚠️  SLACK_WEBHOOK_URL not configured, skipping alert')
    return
  }

  const message = {
    text: `${status} - Production Health Check`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${status} - app.megyk.com`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Failed Checks:*\n${checks}`
          },
          {
            type: 'mrkdwn',
            text: `*Timestamp:*\n${timestamp}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${PRODUCTION_URL}/api/health|View Health Endpoint>`
        }
      }
    ]
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })

    if (!response.ok) {
      console.error('Failed to send Slack alert:', response.statusText)
    } else {
      console.log('✅ Slack alert sent')
    }
  } catch (error) {
    console.error('Failed to send Slack alert:', error.message)
  }
}

// Run the check
checkHealth()
