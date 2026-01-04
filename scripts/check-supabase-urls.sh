#!/bin/bash

echo "========================================"
echo "Supabase GoTrue URL Configuration Check"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found in current directory${NC}"
    echo "Please run this script from your Supabase docker directory"
    echo "Example: cd /root/supabase/docker && bash check-supabase-urls.sh"
    exit 1
fi

echo -e "${YELLOW}1. Checking .env file...${NC}"
if [ -f ".env" ]; then
    echo "✓ .env file found"
    echo "Relevant variables:"
    grep -E "SITE_URL|EXTERNAL_HOSTS|GOTRUE_SITE_URL|GOTRUE_MAILER_EXTERNAL_HOSTS|GOTRUE_API_EXTERNAL_URL" .env | grep -v "^#" || echo "  (none found)"
else
    echo "✗ No .env file found"
fi
echo ""

echo -e "${YELLOW}2. Checking docker-compose.yml (raw)...${NC}"
echo "Auth service environment variables:"
docker compose config --no-interpolate | grep -A 30 "^  auth:" | grep -E "(GOTRUE_SITE_URL|GOTRUE_MAILER_EXTERNAL_HOSTS|GOTRUE_API_EXTERNAL_URL)" || echo "  (none found)"
echo ""

echo -e "${YELLOW}3. Checking docker-compose.yml (with substitution)...${NC}"
echo "Resolved values after .env substitution:"
docker compose config | grep -A 30 "^  auth:" | grep -E "(GOTRUE_SITE_URL|GOTRUE_MAILER_EXTERNAL_HOSTS|GOTRUE_API_EXTERNAL_URL)" || echo "  (none found)"
echo ""

echo -e "${YELLOW}4. Checking running auth container...${NC}"
AUTH_CONTAINER=$(docker compose ps -q auth)
if [ -z "$AUTH_CONTAINER" ]; then
    echo -e "${RED}✗ Auth container not running${NC}"
    echo "Start it with: docker compose up -d auth"
    exit 1
else
    echo -e "${GREEN}✓ Auth container running: $AUTH_CONTAINER${NC}"
    echo ""
    echo "Environment variables inside the auth container:"
    docker compose exec -T auth env | grep GOTRUE | grep -E "(SITE_URL|MAILER_EXTERNAL_HOSTS|API_EXTERNAL_URL)" | sort
fi
echo ""

echo -e "${YELLOW}5. Summary - Current Configuration:${NC}"
echo "---"
SITE_URL=$(docker compose exec -T auth env 2>/dev/null | grep "^GOTRUE_SITE_URL=" | cut -d'=' -f2)
EXTERNAL_HOSTS=$(docker compose exec -T auth env 2>/dev/null | grep "^GOTRUE_MAILER_EXTERNAL_HOSTS=" | cut -d'=' -f2)
API_URL=$(docker compose exec -T auth env 2>/dev/null | grep "^GOTRUE_API_EXTERNAL_URL=" | cut -d'=' -f2)

if [ -n "$SITE_URL" ]; then
    echo -e "GOTRUE_SITE_URL: ${GREEN}$SITE_URL${NC}"
else
    echo -e "GOTRUE_SITE_URL: ${RED}NOT SET${NC}"
fi

if [ -n "$EXTERNAL_HOSTS" ]; then
    FIRST_HOST=$(echo "$EXTERNAL_HOSTS" | cut -d',' -f1)
    echo -e "GOTRUE_MAILER_EXTERNAL_HOSTS: ${GREEN}$EXTERNAL_HOSTS${NC}"
    echo -e "  → Email links will use: ${GREEN}https://$FIRST_HOST${NC}"
else
    echo -e "GOTRUE_MAILER_EXTERNAL_HOSTS: ${RED}NOT SET${NC}"
fi

if [ -n "$API_URL" ]; then
    echo -e "GOTRUE_API_EXTERNAL_URL: ${GREEN}$API_URL${NC}"
else
    echo -e "GOTRUE_API_EXTERNAL_URL: ${RED}NOT SET${NC}"
fi

echo ""
echo -e "${YELLOW}6. Expected Configuration for app.megyk.com:${NC}"
echo "---"
echo "GOTRUE_SITE_URL=https://app.megyk.com"
echo "GOTRUE_API_EXTERNAL_URL=https://app.megyk.com"
echo "GOTRUE_MAILER_EXTERNAL_HOSTS=app.megyk.com,megyk.com,supabase.megyk.com,localhost,kong"
echo ""

if [ "$SITE_URL" = "https://app.megyk.com" ] && [ "${FIRST_HOST}" = "app.megyk.com" ]; then
    echo -e "${GREEN}✓ Configuration looks correct!${NC}"
    echo ""
    echo "If emails are still going to wrong URL:"
    echo "1. Test with a NEW signup (old emails have cached URLs)"
    echo "2. Check auth logs: docker compose logs auth --tail=50"
else
    echo -e "${RED}✗ Configuration needs updating${NC}"
    echo ""
    echo "To fix:"
    echo "1. Update .env file or docker-compose.yml with correct values"
    echo "2. Recreate container: docker compose up -d auth"
    echo "3. Run this script again to verify"
fi
echo ""
echo "========================================"
