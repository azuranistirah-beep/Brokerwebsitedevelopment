# ⚡ Command Cheat Sheet - Supabase Edge Functions

## 🚀 Essential Commands (Copy-Paste Ready)

### Authentication
```bash
# Login to Supabase
npx supabase login

# Logout from Supabase
npx supabase logout

# Check login status (list projects)
npx supabase projects list
```

---

### Project Management
```bash
# Link project (replace YOUR_PROJECT_REF)
npx supabase link --project-ref YOUR_PROJECT_REF

# Unlink project
npx supabase unlink

# Show current project info
cat .supabase/config.toml
```

**Get Project Ref:** https://app.supabase.com/project/_/settings/general

---

### Deployment
```bash
# Deploy specific function
npx supabase functions deploy make-server

# Deploy all functions
npx supabase functions deploy

# Deploy without JWT verification
npx supabase functions deploy make-server --no-verify-jwt

# Deploy with debug output
npx supabase functions deploy make-server --debug
```

---

### Function Management
```bash
# List all functions
npx supabase functions list

# Delete a function (⚠️ CAREFUL!)
npx supabase functions delete make-server

# Get function details
npx supabase functions inspect make-server
```

---

### Secrets Management
```bash
# Set a secret
npx supabase secrets set KEY="VALUE"

# Set multiple secrets at once
npx supabase secrets set KEY1="VALUE1" KEY2="VALUE2"

# List all secret keys (values hidden)
npx supabase secrets list

# Unset a secret
npx supabase secrets unset KEY
```

**Common secrets to set:**
```bash
npx supabase secrets set SUPABASE_URL="https://yourproject.supabase.co"
npx supabase secrets set SUPABASE_ANON_KEY="your_anon_key"
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_key"
npx supabase secrets set NEWS_API_KEY="your_news_key"
```

---

### Logging & Monitoring
```bash
# View recent logs
npx supabase functions logs make-server

# View logs in real-time (tail)
npx supabase functions logs make-server --tail

# View only error logs
npx supabase functions logs make-server --level error

# View logs with timestamp
npx supabase functions logs make-server --timestamp
```

---

### Local Development
```bash
# Start local Supabase
npx supabase start

# Serve function locally
npx supabase functions serve make-server

# Serve with env file
npx supabase functions serve make-server --env-file .env

# Stop local Supabase
npx supabase stop
```

**Test locally:**
```bash
curl http://localhost:54321/functions/v1/make-server/health
```

---

### Testing & Debugging
```bash
# Test health endpoint
curl https://yourproject.supabase.co/functions/v1/make-server/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://yourproject.supabase.co/functions/v1/make-server/api/endpoint

# Test POST request
curl -X POST https://yourproject.supabase.co/functions/v1/make-server/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

---

### CLI Maintenance
```bash
# Check CLI version
npx supabase --version

# Update CLI to latest
npm install -g supabase@latest

# Get help
npx supabase help

# Get help for specific command
npx supabase functions --help
```

---

## 🔧 Troubleshooting Commands

### Error 403 Fix
```bash
# Method 1: Re-authenticate
npx supabase logout
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

# Method 2: Use access token (Windows CMD)
set SUPABASE_ACCESS_TOKEN=sbp_your_token
npx supabase link --project-ref YOUR_PROJECT_REF

# Method 2: Use access token (Windows PowerShell)
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token"
npx supabase link --project-ref YOUR_PROJECT_REF

# Method 2: Use access token (Mac/Linux)
export SUPABASE_ACCESS_TOKEN=sbp_your_token
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Clear Cache & Reset
```bash
# Mac/Linux - Remove Supabase cache
rm -rf ~/.supabase

# Windows CMD - Remove Supabase cache
rmdir /s %USERPROFILE%\.supabase

# Remove local project link
rm -rf .supabase

# Complete reset workflow
npx supabase logout
rm -rf ~/.supabase
rm -rf .supabase
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Verify Setup
```bash
# Check if logged in
npx supabase projects list

# Check if project is linked
cat .supabase/config.toml

# Check functions status
npx supabase functions list

# Check secrets are set
npx supabase secrets list

# View recent logs for errors
npx supabase functions logs make-server --level error
```

---

## 🎯 Common Workflows

### First-Time Deployment
```bash
# 1. Install CLI (if needed)
npm install -g supabase

# 2. Login
npx supabase login

# 3. Link project
npx supabase link --project-ref YOUR_PROJECT_REF

# 4. Set secrets
npx supabase secrets set SUPABASE_URL="your_url"
npx supabase secrets set SUPABASE_ANON_KEY="your_key"
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_key"

# 5. Deploy
npx supabase functions deploy make-server

# 6. Test
curl https://yourproject.supabase.co/functions/v1/make-server/health
```

### Update Existing Function
```bash
# 1. Make code changes

# 2. Deploy
npx supabase functions deploy make-server

# 3. View logs to verify
npx supabase functions logs make-server --tail

# 4. Test
curl https://yourproject.supabase.co/functions/v1/make-server/health
```

### Debug Deployment Issues
```bash
# 1. Check authentication
npx supabase projects list

# 2. Check project link
cat .supabase/config.toml

# 3. Check secrets
npx supabase secrets list

# 4. View error logs
npx supabase functions logs make-server --level error

# 5. Try re-deploy with debug
npx supabase functions deploy make-server --debug
```

---

## 🔐 Security Commands

### Generate Access Token
```bash
# Open browser to generate token
# URL: https://app.supabase.com/account/tokens

# Set token in environment
# Windows CMD:
set SUPABASE_ACCESS_TOKEN=sbp_your_token

# Windows PowerShell:
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token"

# Mac/Linux:
export SUPABASE_ACCESS_TOKEN=sbp_your_token
```

### Rotate Secrets
```bash
# 1. Generate new keys in Supabase Dashboard
# 2. Update secrets
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="new_key"

# 3. Redeploy function
npx supabase functions deploy make-server

# 4. Verify
curl https://yourproject.supabase.co/functions/v1/make-server/health
```

---

## 📊 Monitoring Commands

### Real-time Monitoring
```bash
# Watch logs continuously
npx supabase functions logs make-server --tail

# Watch only errors
npx supabase functions logs make-server --tail --level error

# Watch with grep filter
npx supabase functions logs make-server --tail | grep "ERROR"
```

### Performance Check
```bash
# Check function response time
time curl https://yourproject.supabase.co/functions/v1/make-server/health

# Load test with curl (100 requests)
for i in {1..100}; do
  curl https://yourproject.supabase.co/functions/v1/make-server/health &
done
```

---

## 🎨 Pretty Print & Formatting

### JSON Pretty Print
```bash
# Pretty print JSON response
curl https://yourproject.supabase.co/functions/v1/make-server/health | jq .

# Extract specific field
curl https://yourproject.supabase.co/functions/v1/make-server/api/market/price/BTCUSD | jq .price
```

### Save Response
```bash
# Save response to file
curl https://yourproject.supabase.co/functions/v1/make-server/health > response.json

# Save logs to file
npx supabase functions logs make-server > logs.txt
```

---

## 🚦 Status Checks

### Quick Health Check
```bash
# Check if function is responding
curl -I https://yourproject.supabase.co/functions/v1/make-server/health

# Expected output: HTTP/1.1 200 OK
```

### Full System Check
```bash
# 1. Check CLI
npx supabase --version

# 2. Check authentication
npx supabase projects list

# 3. Check project link
cat .supabase/config.toml

# 4. Check functions
npx supabase functions list

# 5. Check secrets
npx supabase secrets list

# 6. Test endpoint
curl https://yourproject.supabase.co/functions/v1/make-server/health
```

---

## 🔗 Quick Links

### Supabase Dashboard
```bash
# Project Dashboard
https://app.supabase.com/project/ourtzdfyqpytfojlquff

# Project Settings - General (for Project Ref)
https://app.supabase.com/project/_/settings/general

# Project Settings - API Keys
https://app.supabase.com/project/_/settings/api

# Account Settings - Access Tokens
https://app.supabase.com/account/tokens

# Organization Settings
https://app.supabase.com/org/_/settings
```

---

## 💾 Environment Variables

### Set in Terminal Session

**Windows CMD:**
```cmd
set SUPABASE_ACCESS_TOKEN=sbp_your_token
set SUPABASE_URL=https://yourproject.supabase.co
set SUPABASE_ANON_KEY=your_anon_key
```

**Windows PowerShell:**
```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token"
$env:SUPABASE_URL="https://yourproject.supabase.co"
$env:SUPABASE_ANON_KEY="your_anon_key"
```

**Mac/Linux:**
```bash
export SUPABASE_ACCESS_TOKEN=sbp_your_token
export SUPABASE_URL=https://yourproject.supabase.co
export SUPABASE_ANON_KEY=your_anon_key
```

---

## 🎯 One-Liner Shortcuts

```bash
# Quick redeploy
npx supabase functions deploy make-server && curl https://yourproject.supabase.co/functions/v1/make-server/health

# Deploy and watch logs
npx supabase functions deploy make-server && npx supabase functions logs make-server --tail

# Complete reset and redeploy
npx supabase logout && npx supabase login && npx supabase link --project-ref YOUR_REF && npx supabase functions deploy make-server

# Check status of everything
npx supabase projects list && npx supabase functions list && npx supabase secrets list
```

---

## 📝 Notes

- Replace `YOUR_PROJECT_REF` with your actual Project Reference ID
- Replace `yourproject` in URLs with your actual project subdomain
- Replace `YOUR_TOKEN` with your actual authentication token
- Commands prefixed with `npx` don't require global installation

---

**🔖 Bookmark This Page for Quick Reference!**

---

*Cheat Sheet Version: 1.0*
*Created: 2025-02-07*
*For: Investoft Platform*
