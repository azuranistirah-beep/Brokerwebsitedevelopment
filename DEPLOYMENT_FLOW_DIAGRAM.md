# 🔄 Edge Functions Deployment Flow

## 📊 Visual Troubleshooting Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    START DEPLOYMENT                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Install Supabase CLI       │
        │  npm install -g supabase    │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │   Login to Supabase         │
        │   npx supabase login        │
        └─────────────┬───────────────┘
                      │
                      ▼
                ┌─────┴─────┐
                │  Success? │
                └─────┬─────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
         YES          NO          │
          │           │           │
          │           ▼           │
          │     ┌─────────────────┴──────────┐
          │     │  ERROR: Login Failed        │
          │     │  Solutions:                 │
          │     │  1. Clear browser cache     │
          │     │  2. Try incognito mode      │
          │     │  3. Check internet          │
          │     │  4. Restart terminal        │
          │     └─────────────────────────────┘
          │
          ▼
    ┌─────────────────────────────┐
    │   Get Project Reference     │
    │   From: Project Settings    │
    │   → General → Reference ID  │
    └─────────────┬───────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │   Link Project              │
    │   npx supabase link         │
    │   --project-ref YOUR_REF    │
    └─────────────┬───────────────┘
                  │
                  ▼
            ┌─────┴─────┐
            │  Success? │
            └─────┬─────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
     YES          NO          │
      │           │           │
      │           ▼           │
      │   ┌─────────────────────────────┐
      │   │  ERROR 403: Forbidden       │
      │   │  Try these solutions:       │
      │   │                             │
      │   │  🔧 SOLUTION 1:            │
      │   │  npx supabase logout        │
      │   │  npx supabase login         │
      │   │  Try link again             │
      │   │                             │
      │   │  🔧 SOLUTION 2:            │
      │   │  Generate Access Token:     │
      │   │  https://app.supabase.com/  │
      │   │    account/tokens           │
      │   │                             │
      │   │  Set token:                 │
      │   │  export SUPABASE_ACCESS_    │
      │   │    TOKEN=your_token         │
      │   │  Try link again             │
      │   │                             │
      │   │  🔧 SOLUTION 3:            │
      │   │  Check organization role:   │
      │   │  Must be Owner or Admin     │
      │   │                             │
      │   └─────────────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│   Set Environment Secrets   │
│   npx supabase secrets set  │
│   - SUPABASE_URL            │
│   - SUPABASE_ANON_KEY       │
│   - SUPABASE_SERVICE_ROLE   │
│   - NEWS_API_KEY            │
└─────────────┬───────────────┘
              │
              ▼
        ┌─────┴─────┐
        │  Success? │
        └─────┬─────┘
              │
  ┌───────────┼───────────┐
  │           │           │
 YES          NO          │
  │           │           │
  │           ▼           │
  │   ┌─────────────────────────────┐
  │   │  ERROR: Secrets Failed      │
  │   │  Solutions:                 │
  │   │  1. Verify project linked   │
  │   │  2. Check key spelling      │
  │   │  3. Remove quotes if any    │
  │   │  4. Try one by one          │
  │   └─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│   Verify File Structure     │
│   - index.ts ✓              │
│   - kv_store.tsx ✓          │
│   - deno.json ✓             │
│   - config.toml ✓           │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│   Deploy Edge Function      │
│   npx supabase functions    │
│   deploy make-server        │
└─────────────┬───────────────┘
              │
              ▼
        ┌─────┴─────┐
        │  Success? │
        └─────┬─────┘
              │
  ┌───────────┼───────────────────────┐
  │           │                       │
 YES          NO                      │
  │           │                       │
  │           ▼                       │
  │   ┌─────────────────────────────────────┐
  │   │  DEPLOYMENT ERRORS:                 │
  │   │                                     │
  │   │  🔴 Error 403                      │
  │   │  → Use access token                │
  │   │  → Check permissions               │
  │   │                                     │
  │   │  🔴 Timeout                        │
  │   │  → Check internet                  │
  │   │  → Try again                       │
  │   │  → Check Supabase status           │
  │   │                                     │
  │   │  🔴 Module not found               │
  │   │  → Verify deno.json                │
  │   │  → Check imports                   │
  │   │  → Fix file paths                  │
  │   │                                     │
  │   │  🔴 Missing env vars               │
  │   │  → Re-run Step: Set Secrets        │
  │   │                                     │
  │   └─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│   ✅ DEPLOYMENT SUCCESS!   │
│                             │
│   Function URL:             │
│   https://project.supabase  │
│   .co/functions/v1/         │
│   make-server               │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│   Test Endpoints            │
│   - Health check            │
│   - Market price API        │
│   - View logs               │
└─────────────┬───────────────┘
              │
              ▼
        ┌─────┴─────┐
        │ All Tests │
        │   Pass?   │
        └─────┬─────┘
              │
  ┌───────────┼───────────┐
  │           │           │
 YES          NO          │
  │           │           │
  │           ▼           │
  │   ┌─────────────────────────────┐
  │   │  Debugging:                 │
  │   │  - Check function logs      │
  │   │  - Verify secrets set       │
  │   │  - Test with Postman        │
  │   │  - Check CORS settings      │
  │   └─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│   🎉 PRODUCTION READY!     │
│                             │
│   Next Steps:               │
│   1. Update frontend URLs   │
│   2. Monitor performance    │
│   3. Setup alerts           │
│   4. Celebrate! 🎊          │
└─────────────────────────────┘
```

---

## 🎯 Decision Tree: Choose Your Path

```
START HERE
    │
    ▼
Is this your FIRST deployment?
    │
    ├── YES ──────────────────► Use Automated Script
    │                            - deploy-edge-functions.bat (Windows)
    │                            - deploy-edge-functions.sh (Mac/Linux)
    │                            ↓
    │                           Follow on-screen prompts
    │                            ↓
    │                           DONE ✅
    │
    └── NO ──────────────────► Have you deployed before?
            │
            ├── YES, worked before ──► Something changed?
            │                           │
            │                           ├── Organization/Account ──► Re-authenticate
            │                           │                            - logout & login
            │                           │                            - use access token
            │                           │
            │                           ├── New project ──────────► Get new Project Ref
            │                           │                            - link new project
            │                           │
            │                           └── Code changes ──────────► Just redeploy
            │                                                        - supabase functions deploy
            │
            └── YES, had error 403 ──► Follow Error 403 Flow (below)


ERROR 403 FLOW:
    │
    ▼
Try Solution 1: Re-authenticate
    - npx supabase logout
    - npx supabase login
    - npx supabase link --project-ref YOUR_REF
    - npx supabase functions deploy make-server
    │
    ▼
Still 403?
    │
    ├── NO ──► SUCCESS! ✅
    │
    └── YES ──► Try Solution 2: Access Token
                - Generate at: https://app.supabase.com/account/tokens
                - export SUPABASE_ACCESS_TOKEN=token
                - npx supabase link --project-ref YOUR_REF
                - npx supabase functions deploy make-server
                │
                ▼
            Still 403?
                │
                ├── NO ──► SUCCESS! ✅
                │
                └── YES ──► Try Solution 3: Check Permissions
                            - Verify organization role (Owner/Admin)
                            - Check project permissions
                            - Contact Supabase support
                            - See: EDGE_FUNCTIONS_DEPLOYMENT_FIX.md
```

---

## 🚦 Status Indicators

### ✅ Green Light (All Good)
```
Login successful ────────────► ✅
Project linked ──────────────► ✅
Secrets set ─────────────────► ✅
Deployment successful ───────► ✅
Health check returns 200 ────► ✅
```

### ⚠️ Yellow Light (Warnings)
```
CLI version old ─────────────► ⚠️  Update recommended
Secrets not set ─────────────► ⚠️  Set before deployment
Project not linked ──────────► ⚠️  Link required
```

### 🔴 Red Light (Errors)
```
Error 403 ───────────────────► 🔴 Follow Error 403 Flow
Login failed ────────────────► 🔴 Re-authenticate
Timeout ─────────────────────► 🔴 Check network/retry
Module not found ────────────► 🔴 Fix imports
```

---

## ⏱️ Estimated Time

| Task | Time | Difficulty |
|------|------|------------|
| **First Time (Manual)** | 15-20 min | ⭐⭐⭐ |
| **First Time (Script)** | 5-10 min | ⭐ |
| **Re-deployment** | 2-3 min | ⭐ |
| **Troubleshoot 403** | 5-15 min | ⭐⭐ |
| **Complete Reset** | 10-15 min | ⭐⭐ |

---

## 📋 Quick Troubleshooting Matrix

| Error | Cause | Solution | Time | Doc |
|-------|-------|----------|------|-----|
| 403 | Auth issue | Re-login or use token | 5 min | QUICK_FIX_403.md |
| Invalid ref | Wrong Project ID | Get correct ref | 2 min | HOW_TO_GET_CREDENTIALS.md |
| Timeout | Network/server | Retry or check status | 5 min | DEPLOYMENT_CHECKLIST.md |
| Module error | Import issue | Fix imports | 10 min | EDGE_FUNCTIONS_DEPLOYMENT_FIX.md |
| Missing vars | Secrets not set | Set secrets | 5 min | DEPLOYMENT_CHECKLIST.md |

---

## 🎮 Interactive Commands

### Diagnostic Commands
```bash
# Check if logged in
npx supabase projects list

# Check CLI version
npx supabase --version

# Check current project
cat .supabase/config.toml

# List functions
npx supabase functions list

# Check secrets (keys only, no values)
npx supabase secrets list
```

### Fix Commands
```bash
# Quick reset
npx supabase logout && npx supabase login

# Complete reset
rm -rf .supabase && npx supabase login

# Update CLI
npm install -g supabase@latest

# Re-link project
npx supabase link --project-ref YOUR_REF

# Deploy with no JWT verify
npx supabase functions deploy make-server --no-verify-jwt
```

---

## 🎯 Success Checklist

Copy this and check off as you go:

```
PRE-DEPLOYMENT:
[ ] Supabase CLI installed
[ ] Logged in successfully
[ ] Project Reference ID ready
[ ] All credentials copied
[ ] Files verified (index.ts, kv_store.tsx, deno.json)

DEPLOYMENT:
[ ] Project linked without errors
[ ] Environment secrets set
[ ] Function deployed successfully
[ ] No 403 or 500 errors

POST-DEPLOYMENT:
[ ] Function shows as "Active"
[ ] Health check returns 200
[ ] Market API returns data
[ ] Logs show no errors
[ ] Frontend can connect

PRODUCTION:
[ ] Monitoring setup
[ ] Alerts configured
[ ] Documentation updated
[ ] Team notified
```

---

**For detailed steps, see:**
- 📖 [`EDGE_FUNCTIONS_README.md`](./EDGE_FUNCTIONS_README.md) - Main guide
- ⚡ [`QUICK_FIX_403.md`](./QUICK_FIX_403.md) - Quick solutions
- ✅ [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) - Full checklist

---

*Diagram created: 2025-02-07 | Investoft Platform | Version 1.0*
