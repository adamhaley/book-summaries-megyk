# Deployment Verification & Health Checks

## Overview

This document describes the automated health checks and verification steps that run during and after deployment.

## Deployment Flow with Health Checks

### 1. Pre-Deployment Check (Non-Blocking)
**When:** Before pulling new code
**Purpose:** Establish baseline health status
**Result:** Warning if production is already unhealthy

```bash
# Check production health
curl https://app.megyk.com/api/health

# Possible outcomes:
# ✅ 200 - Healthy (normal)
# ⚠️ 503 - Unhealthy (warns, but continues)
# ⚠️ 000 - Unreachable (warns, but continues)
```

### 2. Deployment
**When:** After pre-check passes
**Actions:**
- Pull latest code from master
- Detect changes (code, dependencies, or docs)
- Rebuild Docker container (if needed)
- Restart container

### 3. Post-Deployment Verification (Blocking)
**When:** After container restart
**Purpose:** Verify deployment succeeded
**Result:** Fails deployment if health check doesn't pass

**Steps:**
1. Wait 10 seconds for container warmup
2. Check health endpoint (up to 6 attempts, 10 seconds apart)
3. Display detailed health status on success
4. Exit with error if health check fails

**Max wait time:** 60 seconds (6 attempts × 10 seconds)

### 4. Automated Production Tests (GitHub Actions)
**When:** After deployment workflow completes
**Purpose:** Comprehensive verification
**Tests:**
- Health endpoint returns 200
- N8N webhook URL configured
- Supabase connection working
- All environment variables present
- Storage bucket accessible

**Triggers:**
- After every deployment to master
- Every 15 minutes (scheduled)
- Manual trigger via GitHub Actions UI

## Health Check Details

### Endpoint
`GET https://app.megyk.com/api/health`

### Response (Healthy)
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T22:00:00.000Z",
  "version": "1.0.0",
  "checks": {
    "n8n": {
      "status": "ok",
      "message": "Configured"
    },
    "supabase": {
      "status": "ok",
      "message": "Connected (39 books)"
    },
    "environment": {
      "status": "ok",
      "message": "All required variables present"
    },
    "storage": {
      "status": "ok",
      "message": "Storage bucket accessible"
    }
  }
}
```

### Response (Unhealthy)
```json
{
  "status": "unhealthy",
  "timestamp": "2026-01-22T22:00:00.000Z",
  "checks": {
    "n8n": {
      "status": "error",
      "message": "N8N_WEBHOOK_URL not configured"
    },
    ...
  }
}
```

**HTTP Status Codes:**
- `200` - All systems healthy
- `503` - One or more systems unhealthy

## Deployment Scenarios

### Scenario 1: Successful Deployment
```
📥 Pulling latest changes...
🔨 Code changes detected - FULL REBUILD
⏳ Waiting for container to be ready...
🏥 Running post-deployment health check...
✅ Health check passed!
✅ Deployment verified successfully!
```

**Timeline:**
- T+0: Start deployment
- T+5min: Container rebuilt and restarted
- T+5:10: Health check attempt 1 - SUCCESS
- **Result:** Deployment succeeds ✅

### Scenario 2: Failed Health Check (Missing Env Var)
```
📥 Pulling latest changes...
🔨 Code changes detected - FULL REBUILD
⏳ Waiting for container to be ready...
🏥 Running post-deployment health check...
⚠️ Health check returned status: 503
   Retrying in 10 seconds...
⚠️ Health check returned status: 503
   Retrying in 10 seconds...
[... 4 more attempts ...]
❌ Health check failed after 6 attempts

🔍 Troubleshooting steps:
1. Check container logs: docker logs megyk-books --tail=50
2. Check container status: docker ps -a | grep megyk-books
3. Manually check health: curl https://app.megyk.com/api/health
4. Check environment variables in docker-compose.yml
```

**Timeline:**
- T+0: Start deployment
- T+5min: Container rebuilt and restarted
- T+5:10 to T+6:10: 6 failed health check attempts
- **Result:** Deployment fails ❌
- **Action Required:** Manual investigation

### Scenario 3: Slow Startup (Eventually Healthy)
```
🏥 Running post-deployment health check...
⚠️ Health check returned status: 000
   Retrying in 10 seconds...
⚠️ Health check returned status: 502
   Retrying in 10 seconds...
✅ Health check passed!
✅ Deployment verified successfully!
```

**Timeline:**
- T+5:10: Attempt 1 - Container not ready (000)
- T+5:20: Attempt 2 - Container starting (502)
- T+5:30: Attempt 3 - Health check passes (200)
- **Result:** Deployment succeeds ✅

## GitHub Actions Integration

### Workflow: production-tests.yml

**Triggers:**
1. **After deployment** - Validates deployment succeeded
2. **Scheduled** - Every 15 minutes (continuous monitoring)
3. **Manual** - On-demand testing

**Key Features:**
- Only runs if deployment succeeded
- Retries failed tests 2 times
- Sends Slack alerts on failure
- Sends success notification after deployment

**Slack Alerts:**

**On Failure:**
```
🚨 Production smoke tests FAILED

Environment: app.megyk.com
Workflow: Production Smoke Tests
Run: [View Details]

Triggered by: workflow_run
```

**On Deployment Success:**
```
✅ Deployment verified - Production tests passed

✅ All post-deployment health checks passed
🌐 Environment: app.megyk.com
```

## Manual Testing

### Test Deployment Locally
```bash
# Run production tests
yarn test:production

# With visible browser
yarn test:production:headed

# Check health manually
curl https://app.megyk.com/api/health | jq
```

### Test Deploy Script Changes
```bash
# SSH to production
ssh production-server

# Test deploy script (doesn't actually deploy)
cd /opt/megyk/book-summaries-megyk
bash -x .scripts/deploy.sh  # Debug mode
```

### Simulate Health Check Failure
```bash
# Temporarily break N8N_WEBHOOK_URL
# Edit docker-compose.yml, comment out N8N_WEBHOOK_URL
docker compose up -d megyk-books

# Wait 30 seconds, then check health
curl https://app.megyk.com/api/health

# Should return 503 with error message

# Fix it
# Uncomment N8N_WEBHOOK_URL in docker-compose.yml
docker compose up -d megyk-books
```

## Troubleshooting Failed Deployments

### Step 1: Check Deploy Script Output
Look for the last successful step:
- ✅ Pre-deployment health check
- ✅ Pulled latest changes
- ✅ Container rebuilt
- ❌ Post-deployment health check failed

### Step 2: Check Container Status
```bash
# Is container running?
docker ps | grep megyk-books

# Check recent logs
docker logs megyk-books --tail=100

# Check for errors
docker logs megyk-books 2>&1 | grep -i error
```

### Step 3: Check Health Endpoint Manually
```bash
# Get detailed health status
curl -v https://app.megyk.com/api/health | jq

# Check specific systems
curl -s https://app.megyk.com/api/health | jq '.checks'
```

### Step 4: Verify Environment Variables
```bash
# Check if N8N_WEBHOOK_URL is set
docker exec megyk-books env | grep N8N

# Check all required vars
docker exec megyk-books env | grep -E "N8N|SUPABASE|SITE_URL"
```

### Step 5: Check Docker Compose Config
```bash
# View current config
cat /path/to/n8n-docker-caddy/docker-compose.yml | grep -A 20 megyk-books

# Verify environment section
```

## Rollback Procedure

If deployment fails and you need to rollback:

```bash
# SSH to production
ssh production-server
cd /opt/megyk/book-summaries-megyk

# Check git log
git log --oneline -5

# Rollback to previous commit
git reset --hard HEAD~1

# Redeploy previous version
.scripts/deploy.sh

# Verify health
curl https://app.megyk.com/api/health
```

## Monitoring Dashboard

### UptimeRobot (Recommended)
- Monitor: `https://app.megyk.com/api/health`
- Interval: Every 5 minutes
- Alert on: Status != 200
- Integrations: Email, Slack

### GitHub Actions
- View test results: GitHub repo → Actions tab
- View scheduled runs: Filter by "Production Smoke Tests"
- Manual trigger: Actions → Production Smoke Tests → Run workflow

### Manual Monitoring
```bash
# Quick health check
yarn health:check

# Continuous monitoring (every 5 minutes)
yarn health:check:watch
```

## Best Practices

1. **Always check health before deploying**
   - Establishes baseline
   - Catches pre-existing issues

2. **Wait for post-deployment verification**
   - Don't assume deployment succeeded
   - Check logs if verification fails

3. **Monitor automated tests**
   - Review GitHub Actions results
   - Investigate flaky tests

4. **Test intentional failures**
   - Monthly: Break something and verify alerts work
   - Builds confidence in monitoring system

5. **Document incidents**
   - What broke?
   - How was it detected?
   - How long to fix?
   - Prevention steps added?

## Related Documentation

- **Setup Guide:** [QUICK_START_MONITORING.md](./QUICK_START_MONITORING.md)
- **Full Monitoring Guide:** [PRODUCTION_MONITORING.md](./PRODUCTION_MONITORING.md)
- **Health Endpoint:** `app/api/health/route.ts`
- **Production Tests:** `tests/e2e/production/`
- **Deploy Script:** `.scripts/deploy.sh`
- **GitHub Workflow:** `.github/workflows/production-tests.yml`

## Change Log

### 2026-01-22 - Initial Implementation
- Added health check endpoint
- Added pre/post deployment verification
- Added automated production tests
- Added GitHub Actions integration
- Added Slack notifications

**Motivation:** Prevent 15-hour outage from missing environment variable
**Result:** Detection time reduced from 15 hours to 5-15 minutes
