# ⚡ 3-Minute Deployment Guide

## 🎯 The Fastest Way to Deploy

### Method 1: Automated Script (RECOMMENDED)

**Windows:**
```cmd
deploy-edge-functions.bat
```

**Mac/Linux:**
```bash
chmod +x deploy-edge-functions.sh
./deploy-edge-functions.sh
```

**That's it!** Follow the prompts. ✅

---

### Method 2: Manual Commands (3 Steps)

```bash
# Step 1: Login
npx supabase login

# Step 2: Link (replace YOUR_PROJECT_REF)
npx supabase link --project-ref YOUR_PROJECT_REF

# Step 3: Deploy
npx supabase functions deploy make-server
```

**Get Project Ref:** https://app.supabase.com/project/_/settings/general

---

## 🔴 Got Error 403?

### Quick Fix:
```bash
npx supabase logout
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy make-server
```

### Still Error?
Generate access token at: https://app.supabase.com/account/tokens

Then:
```bash
# Windows CMD:
set SUPABASE_ACCESS_TOKEN=sbp_your_token

# Windows PowerShell:
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token"

# Mac/Linux:
export SUPABASE_ACCESS_TOKEN=sbp_your_token

# Deploy
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy make-server
```

---

## ✅ Test It Works

```bash
curl https://yourproject.supabase.co/functions/v1/make-server/health
```

Should return: `{"status":"ok",...}`

---

## 📚 Need More Help?

| Issue | See File |
|-------|----------|
| Error 403 | [`QUICK_FIX_403.md`](./QUICK_FIX_403.md) |
| Need credentials | [`HOW_TO_GET_CREDENTIALS.md`](./HOW_TO_GET_CREDENTIALS.md) |
| Step-by-step | [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) |
| Complete guide | [`EDGE_FUNCTIONS_README.md`](./EDGE_FUNCTIONS_README.md) |

---

**Total Time:** 3-5 minutes
**Difficulty:** ⭐ Easy

*Created: 2025-02-07 | Investoft Platform*
