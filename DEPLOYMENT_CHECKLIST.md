# ✅ Deployment Checklist - Error 403 Resolution

Ikuti checklist ini step-by-step untuk mengatasi error 403 pada Supabase Edge Functions deployment.

---

## 🎯 Pre-Deployment Checklist

### Phase 1: Environment Setup
- [ ] Supabase CLI terinstall (`npm install -g supabase`)
- [ ] Node.js version >= 18.x (`node --version`)
- [ ] npm/pnpm terinstall dan updated
- [ ] Git terinstall (optional, untuk backup)

### Phase 2: Credentials Ready
- [ ] Project Reference ID sudah di-copy
- [ ] SUPABASE_URL sudah di-copy
- [ ] SUPABASE_ANON_KEY sudah di-copy
- [ ] SUPABASE_SERVICE_ROLE_KEY sudah di-copy
- [ ] Personal Access Token sudah generated (jika perlu)
- [ ] NEWS_API_KEY sudah ready (optional)

📚 **Cara mendapatkan:** Lihat file `HOW_TO_GET_CREDENTIALS.md`

---

## 🔧 Deployment Steps

### Step 1: Authentication ✓
```bash
npx supabase logout
npx supabase login
```

**Verify:**
- [ ] Browser terbuka otomatis
- [ ] Login berhasil dengan azuranistirah@gmail.com
- [ ] Terminal menampilkan "Logged in"

**Jika gagal:**
- Coba clear browser cookies
- Gunakan incognito mode
- Restart terminal

---

### Step 2: Project Linking ✓
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

**Verify:**
- [ ] Terminal menampilkan "Linked project"
- [ ] File `.supabase/config.toml` terbuat
- [ ] Command `npx supabase projects list` menampilkan project

**Jika gagal:**
- Verify Reference ID benar (tidak ada space/typo)
- Coba dengan access token (lihat Step 2b)

---

### Step 2b: Link dengan Access Token (Alternative) ✓
```bash
# Windows CMD:
set SUPABASE_ACCESS_TOKEN=sbp_your_token

# Windows PowerShell:
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token"

# Mac/Linux:
export SUPABASE_ACCESS_TOKEN=sbp_your_token

# Then link:
npx supabase link --project-ref YOUR_PROJECT_REF
```

**Verify:**
- [ ] Token di-set dengan benar
- [ ] Link berhasil
- [ ] Tidak ada error 403

---

### Step 3: Set Environment Secrets ✓
```bash
npx supabase secrets set SUPABASE_URL="https://yourproject.supabase.co"
npx supabase secrets set SUPABASE_ANON_KEY="your_anon_key"
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_key"
npx supabase secrets set NEWS_API_KEY="your_news_key"
```

**Verify:**
- [ ] Semua secrets ter-set tanpa error
- [ ] Command `npx supabase secrets list` menampilkan keys (tanpa values)
- [ ] Tidak ada typo pada key names

**Jika gagal:**
- Pastikan project sudah linked
- Check quotes pada values
- Pastikan tidak ada newline di values

---

### Step 4: Verify File Structure ✓

**Check files exist:**
- [ ] `/supabase/config.toml` ✓
- [ ] `/supabase/functions/make-server/index.ts` ✓
- [ ] `/supabase/functions/make-server/kv_store.tsx` ✓
- [ ] `/supabase/functions/make-server/deno.json` ✓

**Verify content:**
```bash
# Check index.ts starts with import statements
cat supabase/functions/make-server/index.ts | head -10

# Check kv_store.tsx has exports
cat supabase/functions/make-server/kv_store.tsx | grep "export"

# Check deno.json is valid JSON
cat supabase/functions/make-server/deno.json
```

---

### Step 5: Deploy! 🚀
```bash
npx supabase functions deploy make-server --no-verify-jwt
```

**Expected Output:**
```
✅ Deploying Function make-server...
✅ Uploading function bundle...
✅ Function deployed successfully!

Function URL: https://yourproject.supabase.co/functions/v1/make-server
```

**Verify:**
- [ ] Deployment completed without errors
- [ ] Function URL displayed
- [ ] No 403, 401, or 500 errors

---

## 🧪 Post-Deployment Testing

### Test 1: Health Check ✓
```bash
curl https://yourproject.supabase.co/functions/v1/make-server/health
```

**Expected:**
```json
{"status":"ok","timestamp":1675958400000}
```

- [ ] Returns 200 OK
- [ ] JSON response valid

---

### Test 2: Market Price API ✓
```bash
curl https://yourproject.supabase.co/functions/v1/make-server/api/market/price/BTCUSD
```

**Expected:**
```json
{"symbol":"BTCUSD","price":65123.45,"timestamp":1675958400000}
```

- [ ] Returns 200 OK
- [ ] Price is valid number
- [ ] Symbol matches request

---

### Test 3: View Logs ✓
```bash
npx supabase functions logs make-server --tail
```

**Verify:**
- [ ] Logs displaying in real-time
- [ ] No error messages
- [ ] Requests being logged

---

## 🔴 Error Resolution Matrix

### Error: "403 Forbidden - Insufficient permissions"

**Try in order:**
1. [ ] Re-login: `npx supabase logout && npx supabase login`
2. [ ] Use access token (Step 2b above)
3. [ ] Verify organization role (must be Owner/Admin)
4. [ ] Check project permissions at https://app.supabase.com/project/_/settings/team
5. [ ] Generate new access token
6. [ ] Contact Supabase support

---

### Error: "Invalid project reference"

**Try:**
1. [ ] Copy Reference ID again (dari Project Settings → General)
2. [ ] Remove spaces/newlines
3. [ ] Verify project is active
4. [ ] Try with different project if you have multiple

---

### Error: "Function deployment timeout"

**Try:**
1. [ ] Check internet connection
2. [ ] Deploy again (might be temporary network issue)
3. [ ] Reduce bundle size
4. [ ] Check Supabase status: https://status.supabase.com/

---

### Error: "Missing environment variables"

**Try:**
1. [ ] Re-run Step 3 (Set secrets)
2. [ ] Verify with: `npx supabase secrets list`
3. [ ] Check key spelling (case-sensitive!)
4. [ ] Re-deploy after setting secrets

---

### Error: "Module not found" / Import errors

**Try:**
1. [ ] Verify `deno.json` exists
2. [ ] Check import paths in `index.ts`
3. [ ] Update imports to use correct Deno format
4. [ ] Check file extensions (.ts vs .tsx)

---

## 🎉 Success Criteria

Your deployment is successful when ALL of these are true:

- [x] `npx supabase functions list` shows make-server as "Active"
- [x] Health check endpoint returns 200 OK
- [x] Market price endpoint returns valid data
- [x] Logs show no errors
- [x] Frontend can call the API successfully
- [x] No 403, 401, or 500 errors in production

---

## 📊 Performance Monitoring

After successful deployment, monitor:

### Daily Checks:
- [ ] Function response time < 2s
- [ ] Error rate < 1%
- [ ] Uptime > 99%

### Weekly Review:
- [ ] Check logs for unusual patterns
- [ ] Review function invocation count
- [ ] Monitor cost/usage

### Access Monitoring:
```bash
# View real-time logs
npx supabase functions logs make-server --tail

# View recent errors only
npx supabase functions logs make-server --level error
```

---

## 🆘 Still Stuck?

### Quick Commands to Try:

```bash
# Complete reset & redeploy
npx supabase logout
rm -rf .supabase
npx supabase login
npx supabase link --project-ref YOUR_REF
npx supabase secrets set SUPABASE_URL="your_url"
npx supabase secrets set SUPABASE_ANON_KEY="your_key"
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_key"
npx supabase functions deploy make-server --no-verify-jwt
```

### Automated Scripts:
- **Windows:** Run `deploy-edge-functions.bat`
- **Mac/Linux:** Run `./deploy-edge-functions.sh`

### Get Help:
1. 📖 Read full guide: `EDGE_FUNCTIONS_DEPLOYMENT_FIX.md`
2. 🔑 Verify credentials: `HOW_TO_GET_CREDENTIALS.md`
3. ⚡ Quick fix: `QUICK_FIX_403.md`
4. 💬 Supabase Discord: https://discord.supabase.com/
5. 🐛 GitHub Issues: https://github.com/supabase/cli/issues

---

## 📅 Maintenance Schedule

### Monthly:
- [ ] Update Supabase CLI: `npm install -g supabase@latest`
- [ ] Review and rotate access tokens
- [ ] Check for new Supabase features/updates

### Quarterly:
- [ ] Security audit of service role key usage
- [ ] Performance optimization review
- [ ] Cost analysis and optimization

---

**Created:** 2025-02-07
**Version:** 1.0
**Status:** Ready for Production 🚀
