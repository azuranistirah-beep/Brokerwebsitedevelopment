# 🎯 Quick Deploy Commands

## 🚀 Deploy Binance Proxy dalam 3 Command

```bash
# 1. Login
supabase login

# 2. Link Project
supabase link --project-ref nvocyxqxlxqxdzioxgrw

# 3. Deploy
supabase functions deploy binance-proxy --no-verify-jwt
```

---

## 📋 All Commands Reference

### Authentication
```bash
# Login to Supabase
supabase login

# Logout
supabase logout

# Check login status
supabase projects list
```

### Project Management
```bash
# Link project
supabase link --project-ref nvocyxqxlxqxdzioxgrw

# Check current project
supabase status

# Unlink project
supabase unlink
```

### Functions Deployment
```bash
# Deploy single function
supabase functions deploy binance-proxy

# Deploy without JWT verification (for public functions)
supabase functions deploy binance-proxy --no-verify-jwt

# Deploy all functions
supabase functions deploy

# Deploy with debug mode
supabase functions deploy binance-proxy --debug
```

### Functions Management
```bash
# List all deployed functions
supabase functions list

# View function logs (live)
supabase functions logs binance-proxy

# View function logs (with limit)
supabase functions logs binance-proxy --limit 100

# Delete function
supabase functions delete binance-proxy

# Download function
supabase functions download binance-proxy
```

### Testing
```bash
# Test function with cURL
curl https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy

# Test with specific symbols
curl "https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy?symbols=BTCUSDT,ETHUSDT"

# Test with verbose output
curl -v https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy

# Test and save response
curl https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy > test-response.json
```

### Database (if needed)
```bash
# Reset database
supabase db reset

# Apply migrations
supabase db push

# Generate migration
supabase db diff -f migration_name
```

---

## 🔧 Troubleshooting Commands

```bash
# Check Supabase CLI version
supabase --version

# View all project info
supabase status --output=json

# Check function health
curl -I https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy

# View real-time logs
supabase functions logs binance-proxy --tail

# Check function environment variables
supabase functions list --output=json
```

---

## 🎨 Using Scripts

### Windows
```cmd
deploy-binance-proxy.bat
```

### macOS/Linux
```bash
chmod +x deploy-binance-proxy.sh
./deploy-binance-proxy.sh
```

---

## 📞 Quick Help

```bash
# General help
supabase --help

# Function-specific help
supabase functions --help

# Deploy help
supabase functions deploy --help
```

---

## ✅ Success Indicators

After successful deployment, you should see:
```
✅ Deployed binance-proxy function to production
🔗 https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy
```

Test should return:
```json
[
  {"symbol":"BTCUSDT","price":"52340.50"},
  {"symbol":"ETHUSDT","price":"3125.80"}
]
```

Application console should show:
```
✅ [Success] Binance Proxy working! Fetched X prices.
📊 Total available: 2000+ symbols from Binance
```

---

**Last Updated:** 2026-02-25
