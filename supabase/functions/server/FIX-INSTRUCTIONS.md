# 🔧 Fix Backend Corruption - Instructions

## Problem
The `index.tsx` file has corrupt code (lines 842-1108) that prevents deployment:
- Syntax Error: `Expression expected at line 905`
- Duplicate route definitions
- Mixed news code in deposits route

## Solution

### Option 1: Using Deno Script (Recommended)

```bash
cd supabase/functions/server
deno run --allow-read --allow-write fix-corruption.ts
```

This will:
✅ Remove lines 842-1108 (corrupt code)  
✅ Keep lines 1-841 (clean code before corruption)  
✅ Keep lines 1109-end (clean code after corruption, includes crypto-markets route)  
✅ Create backup: `index.tsx.backup`

### Option 2: Using Bash Script

```bash
cd supabase/functions/server
chmod +x fix-index.sh
./fix-index.sh
```

### Option 3: Manual Fix

```bash
cd supabase/functions/server

# Backup
cp index.tsx index.tsx.backup

# Fix
head -n 841 index.tsx > index-temp.tsx
tail -n +1109 index.tsx >> index-temp.tsx
mv index-temp.tsx index.tsx
```

## Verification

After running the fix:

```bash
# Check file size (should be ~1940 lines, down from 2207)
wc -l index.tsx

# Verify no corrupt code remains
grep -n "getMockNewsArticles" index.tsx
# Should return: no matches

# Verify crypto-markets route exists
grep -n "crypto-markets" index.tsx
# Should return: ~line 903 (after fix)
```

## What Gets Removed

**Lines 842-1108** (267 lines total):
- Corrupt `/make-server-20da1dab/deposits/create` route (duplicate #1) with mixed news code
- `getMockNewsArticles()` function with syntax errors
- All references to NewsAPI (which was already removed from frontend)

## What Stays

**Lines 1-841**: All working routes including:
- Health, signup, profile
- Assets, price, trades
- Admin routes, approvals, etc.

**Lines 1109-end**: All working routes including:
- ✅ Real `/deposits/create` route (correct one)
- ✅ Withdrawals endpoints
- ✅ KYC endpoints  
- ✅ `/crypto-markets` proxy route (NEW!)
- ✅ Wallet management
- ✅ Deno.serve() at the end

## After Fix

Deploy should work:
```bash
# From project root
npm run deploy
# or
supabase functions deploy
```

---

**Created**: 2026-02-13  
**Issue**: Backend corruption causing deployment failure  
**Fix**: Remove corrupt lines 842-1108
