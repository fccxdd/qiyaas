#!/bin/bash
# Test script for validating the worker setup

echo "=== Qiyaas Daily Puzzle - Pre-Deployment Tests ==="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if wrangler is installed
echo "Test 1: Checking Wrangler CLI..."
if command -v wrangler &> /dev/null; then
    echo -e "${GREEN}✓${NC} Wrangler CLI found ($(wrangler --version))"
else
    echo -e "${RED}✗${NC} Wrangler CLI not found"
    echo "Install with: npm install -g wrangler"
    exit 1
fi
echo ""

# Test 2: Check if wrangler.toml exists
echo "Test 2: Checking configuration..."
if [ -f "wrangler.toml" ]; then
    echo -e "${GREEN}✓${NC} wrangler.toml found"
    
    # Check if KV namespace IDs are configured
    if grep -q "YOUR_KV_NAMESPACE_ID" wrangler.toml; then
        echo -e "${YELLOW}⚠${NC} KV namespace IDs not configured yet"
        echo "Run ./setup.sh to configure"
    else
        echo -e "${GREEN}✓${NC} KV namespace IDs configured"
    fi
else
    echo -e "${RED}✗${NC} wrangler.toml not found"
    exit 1
fi
echo ""

# Test 3: Check if worker.js exists
echo "Test 3: Checking worker script..."
if [ -f "worker.js" ]; then
    echo -e "${GREEN}✓${NC} worker.js found"
    
    # Basic syntax check
    if node -c worker.js 2>/dev/null; then
        echo -e "${GREEN}✓${NC} worker.js syntax valid"
    else
        echo -e "${RED}✗${NC} worker.js has syntax errors"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} worker.js not found"
    exit 1
fi
echo ""

# Test 4: Check if logged in to Cloudflare
echo "Test 4: Checking Cloudflare authentication..."
if wrangler whoami &> /dev/null; then
    echo -e "${GREEN}✓${NC} Logged in to Cloudflare"
    wrangler whoami | head -3
else
    echo -e "${YELLOW}⚠${NC} Not logged in to Cloudflare"
    echo "Run: wrangler login"
fi
echo ""

# Test 5: Validate cron syntax
echo "Test 5: Validating cron trigger..."
if grep -q "crons = " wrangler.toml; then
    CRON=$(grep "crons = " wrangler.toml | cut -d'"' -f2)
    echo -e "${GREEN}✓${NC} Cron trigger configured: $CRON"
    echo "   This runs at 5 AM UTC (midnight EST)"
else
    echo -e "${RED}✗${NC} Cron trigger not found in wrangler.toml"
fi
echo ""

# Test 6: Check for word database
echo "Test 6: Checking for word database..."
WORD_DB="../qiyaas/data/intmed/daily_words_tagged.json"
if [ -f "$WORD_DB" ]; then
    echo -e "${GREEN}✓${NC} Word database found at $WORD_DB"
    
    # Validate JSON
    if python3 -c "import json; json.load(open('$WORD_DB'))" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Word database is valid JSON"
    else
        echo -e "${RED}✗${NC} Word database is not valid JSON"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} Word database not found at $WORD_DB"
    echo "Update the path or create the file"
fi
echo ""

# Summary
echo "=== Summary ==="
echo ""
echo "Ready to deploy? Run these commands:"
echo ""
echo "1. If KV not set up yet:"
echo "   ${GREEN}./setup.sh${NC}"
echo ""
echo "2. Upload word database:"
echo "   ${GREEN}wrangler kv:key put --namespace-id=YOUR_KV_ID \"daily_words_tagged\" --path=$WORD_DB${NC}"
echo ""
echo "3. Initialize used words:"
echo "   ${GREEN}echo '{\"used_words\": []}' | wrangler kv:key put --namespace-id=YOUR_KV_ID \"used_words\" --${NC}"
echo ""
echo "4. Deploy:"
echo "   ${GREEN}wrangler deploy${NC}"
echo ""
echo "5. Test:"
echo "   ${GREEN}curl https://your-worker.workers.dev/puzzle${NC}"
echo ""
