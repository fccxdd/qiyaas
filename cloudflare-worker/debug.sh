#!/bin/bash
# Complete diagnostic for KV namespace issues

echo "=== Complete KV Diagnostic ==="
echo ""

PROD_ID="68485e1fb39a4686ab168d567274d229"

echo "Production namespace ID: $PROD_ID"
echo ""

# Step 1: List all keys
echo "Step 1: Listing all keys in production..."
KEYS_OUTPUT=$(wrangler kv key list --namespace-id="$PROD_ID" 2>&1)
echo "$KEYS_OUTPUT"
echo ""

# Step 2: Check daily_words_tagged
echo "Step 2: Fetching 'daily_words_tagged' key..."
WORDS_DATA=$(wrangler kv key get --namespace-id="$PROD_ID" "daily_words_tagged" 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Key fetch succeeded"
    echo ""
    
    # Check if it's empty
    if [ -z "$WORDS_DATA" ]; then
        echo "❌ ERROR: Key exists but data is EMPTY"
    else
        # Check size
        SIZE=$(echo "$WORDS_DATA" | wc -c)
        echo "Data size: $SIZE bytes"
        echo ""
        
        # Check first 500 chars
        echo "First 500 characters:"
        echo "$WORDS_DATA" | head -c 500
        echo ""
        echo ""
        
        # Try to parse as JSON
        echo "Validating JSON..."
        if echo "$WORDS_DATA" | jq empty 2>/dev/null; then
            echo "✅ Valid JSON"
            echo ""
            echo "JSON structure:"
            echo "$WORDS_DATA" | jq 'to_entries | map({key: .key, count: (.value | length)})'
        else
            echo "❌ INVALID JSON"
            echo ""
            echo "JSON parse error:"
            echo "$WORDS_DATA" | jq empty 2>&1
        fi
    fi
else
    echo "❌ Key fetch FAILED"
    echo "Error: $WORDS_DATA"
fi

echo ""
echo "Step 3: Checking 'used_words' key..."
USED_DATA=$(wrangler kv key get --namespace-id="$PROD_ID" "used_words" 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Key exists"
    echo "Content: $USED_DATA"
else
    echo "❌ Key not found or error"
    echo "Error: $USED_DATA"
fi

echo ""
echo "Step 4: Checking wrangler.toml binding..."
echo ""

if [ -f "wrangler.toml" ]; then
    echo "wrangler.toml contents:"
    cat wrangler.toml
else
    echo "❌ wrangler.toml not found in current directory!"
fi

echo ""
echo "Step 5: Testing with curl after deployment..."
echo ""
echo "Make sure you've deployed with: wrangler deploy"
echo ""
echo "Then test the endpoint with:"
echo "  curl https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/stats"
echo ""
echo "=== Diagnostic Complete ==="