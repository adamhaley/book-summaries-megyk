#!/bin/bash
#
# Setup Production Monitoring
# This script helps you configure monitoring for your production environment
#

set -e

echo "🔧 Setting up Production Monitoring for Megyk Books"
echo "=================================================="
echo ""

# Check if running on production server
read -p "Are you running this on the production server? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "ℹ️  This script should be run on the production server."
    echo "   Follow the manual setup instructions in docs/PRODUCTION_MONITORING.md"
    exit 0
fi

# Get Slack webhook URL
echo ""
echo "📱 Slack Webhook Setup"
echo "----------------------"
echo "To receive alerts, you need a Slack webhook URL."
echo "Get one here: https://api.slack.com/apps → Create App → Incoming Webhooks"
echo ""
read -p "Enter your Slack webhook URL (or press Enter to skip): " SLACK_WEBHOOK_URL

# Setup environment variables for health check
echo ""
echo "🔐 Setting up environment variables..."

if [ -n "$SLACK_WEBHOOK_URL" ]; then
    # Add to user's bash/zsh profile
    PROFILE_FILE="$HOME/.bashrc"
    if [ -f "$HOME/.zshrc" ]; then
        PROFILE_FILE="$HOME/.zshrc"
    fi

    if ! grep -q "SLACK_WEBHOOK_URL" "$PROFILE_FILE"; then
        echo "" >> "$PROFILE_FILE"
        echo "# Production monitoring" >> "$PROFILE_FILE"
        echo "export SLACK_WEBHOOK_URL='$SLACK_WEBHOOK_URL'" >> "$PROFILE_FILE"
        echo "export PRODUCTION_URL='https://app.megyk.com'" >> "$PROFILE_FILE"
        echo "✅ Added environment variables to $PROFILE_FILE"
    else
        echo "ℹ️  Environment variables already configured"
    fi

    # Source the profile
    source "$PROFILE_FILE"
fi

# Make health check script executable
echo ""
echo "🔧 Making health check script executable..."
chmod +x scripts/health-check-monitor.js

# Setup cron job
echo ""
echo "⏰ Setting up cron job for health checks"
echo "----------------------------------------"
read -p "Would you like to add a cron job to run health checks every 5 minutes? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    CRON_JOB="*/5 * * * * cd $(pwd) && node scripts/health-check-monitor.js >> /var/log/megyk-health-check.log 2>&1"

    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "health-check-monitor.js"; then
        echo "ℹ️  Cron job already exists"
    else
        # Add to crontab
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo "✅ Cron job added! Health checks will run every 5 minutes."
        echo "   Logs: /var/log/megyk-health-check.log"
    fi
fi

# Test health check
echo ""
echo "🧪 Testing health check..."
echo "-------------------------"
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL" PRODUCTION_URL="https://app.megyk.com" node scripts/health-check-monitor.js
else
    PRODUCTION_URL="https://app.megyk.com" node scripts/health-check-monitor.js
fi

echo ""
echo "=================================================="
echo "✅ Monitoring setup complete!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Deploy the new health endpoint:"
echo "   git add app/api/health/route.ts"
echo "   git commit -m 'Add health check endpoint'"
echo "   git push origin master"
echo ""
echo "2. Set up UptimeRobot (free):"
echo "   - Sign up at https://uptimerobot.com"
echo "   - Add monitor: https://app.megyk.com/api/health"
echo "   - Set to check every 5 minutes"
echo "   - Add Slack webhook for alerts"
echo ""
echo "3. Set up GitHub Actions (optional):"
echo "   - Add SLACK_WEBHOOK_URL secret to your GitHub repo"
echo "   - Push .github/workflows/production-tests.yml"
echo ""
echo "4. View current health:"
echo "   curl https://app.megyk.com/api/health | jq"
echo ""

if [ -n "$SLACK_WEBHOOK_URL" ]; then
    echo "📱 Slack alerts configured and ready!"
else
    echo "⚠️  Slack webhook not configured - you won't receive alerts"
    echo "   Set SLACK_WEBHOOK_URL in your environment to enable alerts"
fi

echo ""
