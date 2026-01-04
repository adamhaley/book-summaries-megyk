#!/bin/bash

echo "=========================================="
echo "Docker Build Pre-Flight Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Check build context directory
echo "1. Checking build context directory..."
BUILD_CONTEXT="/opt/megyk/book-summaries-megyk"
if [ -d "$BUILD_CONTEXT" ]; then
    echo -e "${GREEN}✓ Build context exists: $BUILD_CONTEXT${NC}"
else
    echo -e "${RED}✗ Build context NOT found: $BUILD_CONTEXT${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Check .env.local exists
echo "2. Checking .env.local file..."
if [ -f "$BUILD_CONTEXT/.env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"

    # Check required variables
    echo "   Checking required variables..."

    SITE_URL=$(grep "^NEXT_PUBLIC_SITE_URL=" "$BUILD_CONTEXT/.env.local" | cut -d'=' -f2)
    SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$BUILD_CONTEXT/.env.local" | cut -d'=' -f2)
    ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$BUILD_CONTEXT/.env.local" | cut -d'=' -f2)

    if [ -n "$SITE_URL" ]; then
        echo -e "   ${GREEN}✓ NEXT_PUBLIC_SITE_URL=$SITE_URL${NC}"
        if [ "$SITE_URL" != "https://app.megyk.com" ]; then
            echo -e "   ${YELLOW}⚠ WARNING: Expected https://app.megyk.com${NC}"
        fi
    else
        echo -e "   ${RED}✗ NEXT_PUBLIC_SITE_URL is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi

    if [ -n "$SUPABASE_URL" ]; then
        echo -e "   ${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL${NC}"
    else
        echo -e "   ${RED}✗ NEXT_PUBLIC_SUPABASE_URL is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi

    if [ -n "$ANON_KEY" ]; then
        echo -e "   ${GREEN}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set (${#ANON_KEY} chars)${NC}"
    else
        echo -e "   ${RED}✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ .env.local NOT found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Check Dockerfile
echo "3. Checking Dockerfile..."
if [ -f "$BUILD_CONTEXT/Dockerfile" ]; then
    echo -e "${GREEN}✓ Dockerfile exists${NC}"

    # Check if it copies everything (including .env.local)
    if grep -q "COPY \. \." "$BUILD_CONTEXT/Dockerfile"; then
        echo -e "   ${GREEN}✓ Dockerfile has 'COPY . .' (will include .env.local)${NC}"
    else
        echo -e "   ${YELLOW}⚠ WARNING: Dockerfile doesn't have 'COPY . .'${NC}"
    fi

    # Check if it runs yarn build
    if grep -q "yarn build" "$BUILD_CONTEXT/Dockerfile"; then
        echo -e "   ${GREEN}✓ Dockerfile runs 'yarn build'${NC}"
    else
        echo -e "   ${RED}✗ Dockerfile missing 'yarn build'${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ Dockerfile NOT found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Check package.json
echo "4. Checking package.json..."
if [ -f "$BUILD_CONTEXT/package.json" ]; then
    echo -e "${GREEN}✓ package.json exists${NC}"
else
    echo -e "${RED}✗ package.json NOT found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Check yarn.lock
echo "5. Checking yarn.lock..."
if [ -f "$BUILD_CONTEXT/yarn.lock" ]; then
    echo -e "${GREEN}✓ yarn.lock exists${NC}"
else
    echo -e "${RED}✗ yarn.lock NOT found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. Simulate what will be copied
echo "6. Simulating build context (showing files that will be copied)..."
echo "   Key files that will be included:"
cd "$BUILD_CONTEXT"
for file in .env.local Dockerfile package.json yarn.lock next.config.ts; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✓ $file${NC}"
    else
        echo -e "   ${RED}✗ $file (missing)${NC}"
    fi
done
echo ""

# 7. Check docker-compose.yml
echo "7. Checking docker-compose.yml..."
COMPOSE_FILE="/opt/megyk/n8n-docker-caddy/docker-compose.yml"
if [ -f "$COMPOSE_FILE" ]; then
    echo -e "${GREEN}✓ docker-compose.yml exists${NC}"

    # Check if megyk-books service exists
    if grep -q "megyk-books:" "$COMPOSE_FILE"; then
        echo -e "   ${GREEN}✓ megyk-books service defined${NC}"

        # Check if context is correct
        if grep -A5 "megyk-books:" "$COMPOSE_FILE" | grep -q "context:.*$BUILD_CONTEXT"; then
            echo -e "   ${GREEN}✓ Build context correctly set to $BUILD_CONTEXT${NC}"
        else
            echo -e "   ${YELLOW}⚠ WARNING: Build context might not match expected path${NC}"
        fi
    else
        echo -e "   ${RED}✗ megyk-books service not found${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠ docker-compose.yml not found at expected location${NC}"
    echo "   Looking for it..."
    find /opt/megyk -name "docker-compose.yml" 2>/dev/null | head -5
fi
echo ""

# Summary
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "You're ready to build. Run:"
    echo "  cd /opt/megyk/n8n-docker-caddy"
    echo "  docker compose up -d --build megyk-books"
else
    echo -e "${RED}✗ FOUND $ERRORS ERROR(S)${NC}"
    echo ""
    echo "Please fix the errors above before building."
fi
echo "=========================================="
