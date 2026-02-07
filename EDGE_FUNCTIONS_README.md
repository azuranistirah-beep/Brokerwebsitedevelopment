# 🚀 Investoft Edge Functions - Deployment Guide

## 📁 Dokumentasi Lengkap

Panduan ini akan membantu Anda mengatasi error 403 dan deploy Edge Functions dengan sukses.

---

## 🎯 Start Here

### Untuk Deployment Cepat (< 5 menit):
1. **Baca:** [`QUICK_FIX_403.md`](./QUICK_FIX_403.md) - Solusi tercepat
2. **Jalankan:** `deploy-edge-functions.bat` (Windows) atau `deploy-edge-functions.sh` (Mac/Linux)

### Untuk Panduan Lengkap:
1. **Baca:** [`EDGE_FUNCTIONS_DEPLOYMENT_FIX.md`](./EDGE_FUNCTIONS_DEPLOYMENT_FIX.md) - Troubleshooting detail
2. **Ikuti:** [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
3. **Referensi:** [`HOW_TO_GET_CREDENTIALS.md`](./HOW_TO_GET_CREDENTIALS.md) - Cara dapatkan API keys

---

## 📚 Daftar File Dokumentasi

| File | Deskripsi | Kapan Digunakan |
|------|-----------|-----------------|
| **QUICK_FIX_403.md** | Solusi cepat error 403 | Untuk quick fix |
| **EDGE_FUNCTIONS_DEPLOYMENT_FIX.md** | Panduan lengkap troubleshooting | Untuk pemahaman mendalam |
| **DEPLOYMENT_CHECKLIST.md** | Checklist interaktif | Untuk deployment terstruktur |
| **HOW_TO_GET_CREDENTIALS.md** | Cara mendapatkan credentials | Saat butuh API keys |
| **deploy-edge-functions.bat** | Script otomatis Windows | Deploy di Windows |
| **deploy-edge-functions.sh** | Script otomatis Mac/Linux | Deploy di Mac/Linux |

---

## 🔥 Quick Start (3 Langkah)

### Windows:
```cmd
REM 1. Login
npx supabase login

REM 2. Link project (ganti YOUR_PROJECT_REF)
npx supabase link --project-ref YOUR_PROJECT_REF

REM 3. Deploy
npx supabase functions deploy make-server
```

### Mac/Linux:
```bash
# 1. Login
npx supabase login

# 2. Link project (ganti YOUR_PROJECT_REF)
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Deploy
npx supabase functions deploy make-server
```

**Cara dapat Project Ref:** Buka https://app.supabase.com/project/_/settings/general

---

## ⚡ Automated Deployment

### Option 1: Gunakan Script Otomatis

**Windows (CMD/PowerShell):**
```cmd
deploy-edge-functions.bat
```

**Mac/Linux (Terminal):**
```bash
chmod +x deploy-edge-functions.sh
./deploy-edge-functions.sh
```

Script ini akan:
- ✅ Install/verify Supabase CLI
- ✅ Login & authenticate
- ✅ Link project
- ✅ Set environment secrets
- ✅ Deploy Edge Function
- ✅ Verify deployment

---

## 🎯 Common Issues & Solutions

### 🔴 Error 403: Forbidden

**Penyebab:** Authentication/permission issue

**Solusi:**
1. Re-login: `npx supabase logout && npx supabase login`
2. Gunakan access token (lihat [`QUICK_FIX_403.md`](./QUICK_FIX_403.md))
3. Verify permissions di organization settings

---

### 🔴 Error: Invalid Project Reference

**Penyebab:** Salah Project Ref ID

**Solusi:**
1. Buka: https://app.supabase.com/project/_/settings/general
2. Copy **Reference ID** yang benar
3. Pastikan tidak ada space/typo

---

### 🔴 Error: Missing Environment Variables

**Penyebab:** Secrets belum di-set

**Solusi:**
```bash
npx supabase secrets set SUPABASE_URL="your_url"
npx supabase secrets set SUPABASE_ANON_KEY="your_key"
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_key"
```

Cara dapat keys: Lihat [`HOW_TO_GET_CREDENTIALS.md`](./HOW_TO_GET_CREDENTIALS.md)

---

## 📂 File Structure

```
/supabase
  /functions
    /make-server
      - index.ts              # Main Edge Function handler
      - kv_store.tsx          # Key-value store utilities
      - deno.json             # Deno configuration
  - config.toml               # Supabase configuration

/deploy-edge-functions.bat   # Windows deployment script
/deploy-edge-functions.sh    # Mac/Linux deployment script

# Documentation
/QUICK_FIX_403.md                      # Quick fix guide
/EDGE_FUNCTIONS_DEPLOYMENT_FIX.md     # Complete troubleshooting
/DEPLOYMENT_CHECKLIST.md              # Interactive checklist
/HOW_TO_GET_CREDENTIALS.md            # Credentials guide
/EDGE_FUNCTIONS_README.md             # This file
```

---

## 🧪 Testing After Deployment

### 1. Verify Function is Live
```bash
npx supabase functions list
```

### 2. Test Health Endpoint
```bash
curl https://yourproject.supabase.co/functions/v1/make-server/health
```

**Expected:**
```json
{"status":"ok","timestamp":1675958400000}
```

### 3. Test Market Price API
```bash
curl https://yourproject.supabase.co/functions/v1/make-server/api/market/price/BTCUSD
```

**Expected:**
```json
{"symbol":"BTCUSD","price":65123.45,"timestamp":1675958400000}
```

### 4. View Real-time Logs
```bash
npx supabase functions logs make-server --tail
```

---

## 🔐 Security Checklist

### ✅ Aman untuk Public
- Project Reference ID
- SUPABASE_URL
- SUPABASE_ANON_KEY

### ⛔ Harus Rahasia (Jangan commit ke Git!)
- SUPABASE_SERVICE_ROLE_KEY
- Personal Access Token
- NEWS_API_KEY

**Tips:** Gunakan `.env` dan `.gitignore`

---

## 🎓 Learning Path

### Beginner (Pertama kali deploy):
1. Baca [`QUICK_FIX_403.md`](./QUICK_FIX_403.md)
2. Jalankan script otomatis
3. Follow on-screen instructions

### Intermediate (Sudah pernah deploy):
1. Baca [`EDGE_FUNCTIONS_DEPLOYMENT_FIX.md`](./EDGE_FUNCTIONS_DEPLOYMENT_FIX.md)
2. Manual deployment dengan CLI
3. Troubleshoot sendiri

### Advanced (Development/Debugging):
1. Baca semua dokumentasi
2. Customize Edge Functions
3. Setup local development environment
4. Integrate dengan CI/CD

---

## 📊 Success Metrics

Deployment berhasil jika:
- ✅ Function status "Active"
- ✅ Health check returns 200 OK
- ✅ Market API returns valid data
- ✅ No errors in logs
- ✅ Frontend dapat connect

---

## 🆘 Get Help

### Self-Help Resources:
1. 📖 [`EDGE_FUNCTIONS_DEPLOYMENT_FIX.md`](./EDGE_FUNCTIONS_DEPLOYMENT_FIX.md) - Detailed guide
2. ✅ [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) - Step-by-step
3. 🔑 [`HOW_TO_GET_CREDENTIALS.md`](./HOW_TO_GET_CREDENTIALS.md) - API keys
4. ⚡ [`QUICK_FIX_403.md`](./QUICK_FIX_403.md) - Quick fixes

### Community Support:
- 💬 **Supabase Discord:** https://discord.supabase.com/
- 🐛 **GitHub Issues:** https://github.com/supabase/cli/issues
- 📚 **Docs:** https://supabase.com/docs/guides/functions

### Professional Support:
- 🎫 **Supabase Support:** https://supabase.com/support
- 📧 **Email:** support@supabase.io (untuk paid plans)

---

## 🔄 Update & Maintenance

### Update Supabase CLI:
```bash
npm install -g supabase@latest
```

### Redeploy Function:
```bash
npx supabase functions deploy make-server
```

### View Function Status:
```bash
npx supabase functions list
```

### Delete Function (if needed):
```bash
npx supabase functions delete make-server
```

---

## 🎉 Next Steps After Deployment

1. **Update Frontend API URL:**
   - Edit `src/app/lib/supabaseClient.ts`
   - Update Edge Function URL

2. **Test Full Integration:**
   - Test trading functionality
   - Verify real-time prices
   - Check news API integration

3. **Monitor Performance:**
   - Setup logging alerts
   - Monitor function invocations
   - Track error rates

4. **Setup CI/CD (Optional):**
   - GitHub Actions for auto-deploy
   - Automated testing
   - Staging environment

---

## 📞 Contact & Credits

**Platform:** Investoft Trading Platform
**Account:** azuranistirah@gmail.com
**Project:** Broker Website Development
**Deployment Date:** 2025-02-07

**Powered by:**
- ⚡ Supabase Edge Functions
- 🦕 Deno Runtime
- 🔥 Hono Framework
- ⚛️ React Frontend

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-02-07 | Initial deployment guide created |
| | | - Added automated scripts |
| | | - Complete troubleshooting docs |
| | | - Error 403 solutions |

---

## ✨ Quick Reference Commands

```bash
# Authentication
npx supabase login
npx supabase logout

# Project Management
npx supabase link --project-ref YOUR_REF
npx supabase projects list

# Secrets Management
npx supabase secrets set KEY=VALUE
npx supabase secrets list
npx supabase secrets unset KEY

# Function Deployment
npx supabase functions deploy make-server
npx supabase functions deploy --no-verify-jwt
npx supabase functions list

# Monitoring
npx supabase functions logs make-server
npx supabase functions logs make-server --tail
npx supabase functions logs make-server --level error

# Cleanup
npx supabase functions delete make-server
```

---

**🚀 Ready to Deploy? Start with [`QUICK_FIX_403.md`](./QUICK_FIX_403.md) or run the automated script!**

---

*Last updated: 2025-02-07 | For: Investoft Platform | Status: ✅ Production Ready*
