#!/bin/bash
# Setup script for Cloudflare Workers KV namespace

echo "=== Qiyaas Daily Puzzle - Cloudflare Workers Setup ==="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found!"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI found"
echo ""

# Login to Cloudflare (if not already logged in)
echo "Step 1: Logging in to Cloudflare..."
wrangler login

echo ""
echo "Step 2: Creating KV namespace..."

# Create production KV namespace
echo "Creating production namespace..."
PROD_OUTPUT=$(wrangler kv namespace create "PUZZLE_DATA" 2>&1)
echo "$PROD_OUTPUT"
PROD_ID=$(echo "$PROD_OUTPUT" | grep -oP 'id = "\K[^"]+' | head -1)

# Create preview KV namespace
echo ""
echo "Creating preview namespace..."
PREVIEW_OUTPUT=$(wrangler kv namespace create "PUZZLE_DATA" --preview 2>&1)
echo "$PREVIEW_OUTPUT"
PREVIEW_ID=$(echo "$PREVIEW_OUTPUT" | grep -oP 'id = "\K[^"]+' | head -1)

echo ""
echo "Step 3: Updating wrangler.toml..."

# Update wrangler.toml with the IDs
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/YOUR_KV_NAMESPACE_ID/$PROD_ID/" wrangler.toml
    sed -i '' "s/YOUR_PREVIEW_KV_NAMESPACE_ID/$PREVIEW_ID/" wrangler.toml
else
    # Linux
    sed -i "s/YOUR_KV_NAMESPACE_ID/$PROD_ID/" wrangler.toml
    sed -i "s/YOUR_PREVIEW_KV_NAMESPACE_ID/$PREVIEW_ID/" wrangler.toml
fi

echo "✅ wrangler.toml updated with KV namespace IDs"
echo ""

echo "Step 4: Uploading initial data to KV..."
echo ""
echo "Now you need to upload your word database."
echo "Run this command with your actual JSON file:"
echo ""
echo "  wrangler kv key put --namespace-id=$PROD_ID "daily_words_tagged" --path=qiyaas/data/intmed/daily_words_tagged.json"
echo ""
echo "Initialize empty used words:"
echo ""
# 1. Create a file with the initial data
echo '{"used_words": []}' > used_words_init.json

# 2. Upload it
wrangler kv key put --namespace-id=YOUR_ACTUAL_ID "used_words" --path=used_words_init.json

# 3. Clean up
rm used_words_init.json
echo ""

echo "Step 5: Deploy the worker..."
echo ""
echo "After uploading the data, deploy with:"
echo "  wrangler deploy"
echo ""

echo "=== Setup Complete! ==="
echo ""
echo "KV Namespace IDs:"
echo "  Production: $PROD_ID"
echo "  Preview: $PREVIEW_ID"
echo ""
echo "Next steps:"
echo "1. Upload your word database (see commands above)"
echo "2. Run 'wrangler deploy' to deploy the worker"
echo "3. Test with: curl https://qiyaas-daily-puzzle.YOUR_SUBDOMAIN.workers.dev/puzzle"
echo ""