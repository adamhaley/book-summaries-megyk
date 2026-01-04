#!/bin/bash
set -e

echo "=========================================="
echo "Deploying megyk-books..."
echo "=========================================="

# Store the current commit before pulling
BEFORE_COMMIT=$(git rev-parse HEAD)

# Pull latest changes
echo "📥 Pulling latest changes from master..."
git pull origin master

# Get the new commit
AFTER_COMMIT=$(git rev-parse HEAD)

# Check if anything actually changed
if [ "$BEFORE_COMMIT" = "$AFTER_COMMIT" ]; then
  echo "ℹ️  No new changes to deploy"
  exit 0
fi

# Check if dependencies or Dockerfile changed
CHANGED_FILES=$(git diff --name-only $BEFORE_COMMIT $AFTER_COMMIT)
echo "📝 Changed files:"
echo "$CHANGED_FILES"
echo ""

if echo "$CHANGED_FILES" | grep -qE "\.(ts|tsx|js|jsx)$"; then
  echo "🔨 Code changes detected - FULL REBUILD (~5 min)"
  docker compose -f ../n8n-docker-caddy/docker-compose.yml up -d --build megyk-books
elif echo "$CHANGED_FILES" | grep -qE "Dockerfile|package.json|yarn.lock"; then
  echo "🔨 Dependencies or Dockerfile changed - FULL REBUILD (~5 min)"
  docker compose -f ../n8n-docker-caddy/docker-compose.yml up -d --build megyk-books
else
  echo "⚡ Non-code changes only (docs/scripts) - QUICK RESTART (~30 sec)"
  docker compose -f ../n8n-docker-caddy/docker-compose.yml up -d megyk-books
fi

echo ""
echo "=========================================="
echo "✅ Deploy complete!"
echo "=========================================="
