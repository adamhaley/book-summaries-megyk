# Quick Start: Production Monitoring

This is the TL;DR version. For full details, see [PRODUCTION_MONITORING.md](./PRODUCTION_MONITORING.md).

## The Issue We're Solving
**Solution:** Automated monitoring catches issues within 5-15 minutes.

## Quick Setup (15 minutes)

### Step 1: Deploy Health Check Endpoint (5 min)

```bash
# From your local machine
git add app/api/health/route.ts
git commit -m "Add production health check endpoint"
git push origin master

# SSH to production and redeploy
ssh your-server
cd /path/to/book-summaries-megyk
.scripts/deploy.sh
```

**Verify it works:**
```bash
curl https://app.megyk.com/api/health | jq
```

Expected output:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T...",
  "checks": {
    "n8n": { "status": "ok" },
    "supabase": { "status": "ok" },
    "environment": { "status": "ok" },
    "storage": { "status": "ok" }
  }
}
```

### Step 2: Set Up UptimeRobot (5 min)

1. **Sign up:** https://uptimerobot.com (free, no credit card)

2. **Create Monitor:**
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `Megyk Books - Health Check`
   - URL: `https://app.megyk.com/api/health`
   - Monitoring Interval: `5 minutes`

3. **Add Alert:**
   - Click "Add Alert Contact"
   - Type: Email
   - Email: your-email@example.com

4. **Advanced Settings:**
   - Expected Status Code: `200`
   - Alert When: `Down`
   - Wait: `2 failures` (avoid false alarms)

**Done!** You'll get emailed if the health check fails.

### Step 3: Add Slack Alerts (5 min, optional but recommended)

1. **Create Slack webhook:**
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name: `Megyk Production Alerts`
   - Workspace: Your workspace
   - Enable "Incoming Webhooks"
   - Add webhook to channel (e.g., #alerts)
   - Copy webhook URL

2. **Add to UptimeRobot:**
   - Settings → Add Alert Contact
   - Type: Webhook
   - URL: Your Slack webhook URL
   - POST Value (JSON):
     ```json
     {
       "text": "*alertTypeFriendlyName* - *monitorFriendlyName*",
       "blocks": [
         {
           "type": "section",
           "text": {
             "type": "mrkdwn",
             "text": "*alertDetails*\n\nMonitor URL: *monitorURL*"
           }
         }
       ]
     }
     ```

3. **Test it:**
   - In UptimeRobot, click your monitor → Actions → Send Test Alert
   - Check Slack for the test message

## Test Your Setup

### Test 1: Health Check Endpoint
```bash
curl https://app.megyk.com/api/health
```

Should return `{"status":"healthy",...}`

### Test 2: Break It (Intentionally)
```bash
# SSH to production
ssh your-server

# Temporarily rename the env var
docker exec megyk-books env | grep N8N_WEBHOOK_URL

# Stop container, edit docker-compose, remove N8N_WEBHOOK_URL, restart
# Wait 5-10 minutes
# You should get an alert!

# Put it back:
# Re-add N8N_WEBHOOK_URL to docker-compose.yml
docker compose up -d megyk-books
```

### Test 3: Run Production Tests Locally
```bash
# From your local machine
yarn test:production

# Or with visible browser
yarn test:production:headed
```

## What Happens When Things Break?

### Scenario: N8N_WEBHOOK_URL Goes Missing Again

**Timeline:**
- **T+0 min:** Variable removed during deploy
- **T+5 min:** UptimeRobot detects health check failure (status 503)
- **T+5 min:** Email alert sent: "Megyk Books - Health Check is DOWN"
- **T+5 min:** Slack alert sent (if configured)
- **T+10 min:** Second check confirms it's down
- **T+10 min:** Alert escalated (more urgent)

**You receive:**
```
Subject: [UptimeRobot Alert] Megyk Books - Health Check is DOWN

Monitor: Megyk Books - Health Check
URL: https://app.megyk.com/api/health
Status: DOWN
Reason: HTTP 503
Details: {"status":"unhealthy","checks":{"n8n":{"status":"error","message":"N8N_WEBHOOK_URL not configured"}}}
```

**You fix it:**
```bash
ssh production-server
nano /path/to/docker-compose.yml
# Add: N8N_WEBHOOK_URL=https://n8n.megyk.com/webhook/get_summary_v3
docker compose up -d megyk-books
```

**Timeline continues:**
- **T+15 min:** Health check passes again
- **T+15 min:** "Megyk Books - Health Check is UP" alert sent
- **Total downtime:** 15 minutes instead of 15 hours ✅

## Daily Usage

### Check Production Health
```bash
yarn health:check
```

### View Health in Browser
Open: https://app.megyk.com/api/health

### Run Production Tests
```bash
# Quick smoke test
yarn test:production

# With browser visible (good for debugging)
yarn test:production:headed
```

### Check UptimeRobot Dashboard
Login to https://uptimerobot.com to see:
- Uptime percentage (aim for 99.9%+)
- Response time graphs
- Recent downtime events

## Advanced: GitHub Actions (Optional)

The provided GitHub Actions workflow runs tests automatically:
- Every 15 minutes
- After each deployment
- On manual trigger

**Setup:**
1. Add secrets to your GitHub repo:
   - Settings → Secrets → New repository secret
   - Name: `SLACK_WEBHOOK_URL`
   - Value: Your Slack webhook URL

2. Push the workflow:
   ```bash
   git add .github/workflows/production-tests.yml
   git commit -m "Add automated production testing"
   git push origin master
   ```

3. Check it's running:
   - Go to your repo → Actions tab
   - You should see "Production Smoke Tests" workflow

## Monitoring Checklist

- [x] Health endpoint deployed: `https://app.megyk.com/api/health`
- [ ] UptimeRobot monitor created (5 min interval)
- [ ] Email alerts configured
- [ ] Slack alerts configured (optional)
- [ ] Tested alert by breaking something
- [ ] GitHub Actions workflow added (optional)
- [ ] Bookmarked UptimeRobot dashboard
- [ ] Shared alert channel with team

## Cost

Everything above is **FREE**:
- UptimeRobot: Free plan (50 monitors, 5 min interval)
- Slack: Free plan
- GitHub Actions: Free (2000 minutes/month)

## Support

- **Full guide:** [PRODUCTION_MONITORING.md](./PRODUCTION_MONITORING.md)
- **Test examples:** `tests/e2e/production/`
- **Health endpoint:** `app/api/health/route.ts`

## Pro Tips

1. **Test your alerts monthly** - Break something intentionally to verify alerts work
2. **Monitor the monitors** - Set a calendar reminder to check UptimeRobot once a week
3. **False alarm fatigue** - If you get too many false alarms, increase the "wait for X failures" setting
4. **Response time alerts** - Add alerts for slow response times (>5 seconds) as an early warning
5. **Status page** - Use UptimeRobot's public status page feature so users can check status during outages

---

**Next Steps After Setup:**
1. Test everything works
2. Document your incident response process
3. Share alert channels with your team
4. Schedule monthly alert tests
5. Sleep better knowing you'll catch issues fast 😴
