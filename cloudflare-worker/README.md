# Qiyaas Daily Puzzle - Cloudflare Workers Deployment

This directory contains everything you need to deploy your daily puzzle generator as a Cloudflare Worker with automatic daily updates.

## 📋 Prerequisites

1. A Cloudflare account (free tier works!)
2. Node.js installed (v16+)
3. Wrangler CLI: `npm install -g wrangler`

## 🚀 Quick Start

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Run the Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- Log you into Cloudflare
- Create KV namespaces for production and preview
- Update `wrangler.toml` with the namespace IDs

### 3. Upload Your Word Database

Replace the path with your actual file location:

```bash
# Get your KV namespace ID from wrangler.toml
KV_ID="your-kv-namespace-id"

# Upload the word database
wrangler kv key put --namespace-id=$KV_ID "daily_words_tagged" \
  --path=$HOME/repos/qiyaas/qiyaas/data/intmed/daily_words_tagged.json

# Initialize empty used words
echo '{"used_words": []}' | wrangler kv key put --namespace-id=$KV_ID "used_words" --
```

### 4. Deploy the Worker

```bash
wrangler deploy
```

Your worker will be live at: `https://qiyaas-daily-puzzle.YOUR_SUBDOMAIN.workers.dev`

## ⏰ Cron Schedule

The worker is configured to run at **midnight Eastern Time** every day:
- **EST** (Nov-Mar): 5:00 AM UTC
- **EDT** (Mar-Nov): 4:00 AM UTC

The current configuration uses `0 5 * * *` (5 AM UTC). If you need to adjust for daylight saving time, modify the cron expression in `wrangler.toml`.

### Adjusting the Schedule

Edit `wrangler.toml`:

```toml
[triggers]
crons = ["0 5 * * *"]  # Midnight EST (5 AM UTC)
```

Cron format: `minute hour day month weekday`

Examples:
- `0 4 * * *` - 4 AM UTC (midnight EDT)
- `0 12 * * *` - Noon UTC
- `30 5 * * *` - 5:30 AM UTC

## 🔌 API Endpoints

Once deployed, your worker exposes these endpoints:

### GET `/puzzle` or `/`
Returns the current daily puzzle

```bash
curl https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/puzzle
```

Response:
```json
{
  "date": "2024-01-15",
  "clues": [
    {
      "type": "NOUN",
      "word": "apple",
      "rule": "length_rule",
      "number": 5,
      "length_category": "short",
      "word_length": 5
    },
    // ... more clues
  ]
}
```

### POST `/generate`
Manually trigger puzzle generation (useful for testing)

```bash
curl -X POST https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/generate
```

### GET `/stats`
View statistics about used words

```bash
curl https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/stats
```

Response:
```json
{
  "totalUsedWords": 42,
  "lastUpdate": "2024-01-15T05:00:00.000Z"
}
```

## 🔧 Manual Operations

### View KV Data

```bash
# List all keys
wrangler kv key list --namespace-id=$KV_ID

# Get current puzzle
wrangler kv key get --namespace-id=$KV_ID "current_puzzle"

# Get used words
wrangler kv key get --namespace-id=$KV_ID "used_words"
```

### Update Word Database

```bash
wrangler kv key put --namespace-id=$KV_ID "daily_words_tagged" \
  --path=path/to/new/daily_words_tagged.json
```

### Reset Used Words

```bash
echo '{"used_words": []}' | wrangler kv key put --namespace-id=$KV_ID "used_words" --
```

### Trigger Cron Manually

Unfortunately, Cloudflare doesn't provide a way to manually trigger cron jobs. Instead, use the `/generate` endpoint:

```bash
curl -X POST https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/generate
```

## 📊 Monitoring

### View Logs

```bash
wrangler tail
```

This shows real-time logs from your worker, including cron executions.

### Check Cron Status

Go to your Cloudflare Dashboard:
1. Workers & Pages
2. Select your worker
3. Click on "Triggers" tab
4. View "Cron Triggers" section

## 🌐 Custom Domain (Optional)

To use a custom domain like `puzzle.yourdomain.com`:

1. Add your domain to Cloudflare
2. Uncomment and edit in `wrangler.toml`:

```toml
routes = [
  { pattern = "puzzle.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

3. Deploy: `wrangler deploy`

## 💰 Costs

**Free Tier Limits:**
- 100,000 requests/day
- 100,000 cron triggers/day
- 1 GB KV storage
- 1,000 KV reads/day
- 1,000 KV writes/day

**How We Stay FREE Even With High Traffic:**

This worker uses **aggressive edge caching** on the `/puzzle` endpoint:
- Cache duration: 1 hour
- First request in each hour → hits KV storage (counts toward 1,000 free reads/day)
- All subsequent requests → served from Cloudflare's edge cache (FREE, unlimited)
- New puzzle at midnight → automatically invalidates cache (new date = new response)

**Real-world usage:**
- Daily cron trigger: 1/day
- KV writes (puzzle + used words): 2-3/day
- KV reads: ~24/day (one per hour when cache expires)
- **Total cost: $0** ✅

**Even with millions of visitors:**
- 1 million requests/day = ~24 KV reads/day (rest from cache)
- 10 million requests/day = ~24 KV reads/day (rest from cache)
- **Still FREE!** 🎉

Your daily puzzle generator will use:
- 1 cron trigger/day
- ~2-3 KV writes/day (puzzle + used words)
- ~24 KV reads/day (with caching)

**This should be FREE indefinitely, even with viral traffic!**

## 🐛 Troubleshooting

### Puzzle Not Updating

1. Check cron logs: `wrangler tail`
2. Verify the cron trigger is active in Cloudflare Dashboard
3. Manually trigger: `curl -X POST https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/generate`

### Cache Not Working

To verify cache is working, check response headers:

```bash
curl -I https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/puzzle
```

Look for:
```
Cache-Control: public, max-age=3600, s-maxage=3600
CF-Cache-Status: HIT  # or MISS on first request
```

- `MISS` = First request, fetched from KV
- `HIT` = Cached response, not hitting KV (FREE!)
- `EXPIRED` = Cache expired, will fetch fresh from KV

After the first request, subsequent requests within 1 hour should show `HIT`.

### Testing Cache Invalidation

The puzzle automatically updates at midnight. To test cache behavior:

```bash
# First request (will be MISS or EXPIRED)
curl -I https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/puzzle

# Second request within 1 hour (should be HIT)
curl -I https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/puzzle

# Generate new puzzle (invalidates cache because date changes)
curl -X POST https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/generate

# Next request will be MISS again with new puzzle
curl https://qiyaas-daily-puzzle.fatima-hussein.workers.dev/puzzle
```

### "Word database not found" Error

Your word database wasn't uploaded to KV. Upload it:

```bash
wrangler kv key put --namespace-id=$KV_ID "daily_words_tagged" \
  --path=path/to/daily_words_tagged.json
```

### Time Zone Issues

The worker uses `America/New_York` timezone. If you need a different timezone, modify this line in `worker.js`:

```javascript
const todayET = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
```

Change `'America/New_York'` to your desired timezone (e.g., `'America/Los_Angeles'`, `'America/Chicago'`, etc.)

## 🔄 Updating the Worker

After making changes to `worker.js`:

```bash
wrangler deploy
```

Changes deploy instantly!

## 📝 Local Development

Test locally before deploying:

```bash
wrangler dev
```

This starts a local server at `http://localhost:8787`

Note: KV data access requires being online and authenticated to Cloudflare.

## 🆘 Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [KV Storage Docs](https://developers.cloudflare.com/workers/runtime-apis/kv/)

## 📄 File Structure

```
.
├── worker.js          # Main Worker script
├── wrangler.toml      # Configuration file
├── setup.sh           # Automated setup script
└── README.md          # This file
```

---

**Happy puzzling! 🧩**
