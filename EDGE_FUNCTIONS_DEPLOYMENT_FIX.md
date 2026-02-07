# 🚀 Edge Functions Deployment Guide - Error 403 Fix

## 📋 Prerequisite Checklist

Sebelum deploy, pastikan Anda sudah:
- ✅ Install Supabase CLI: `npm install -g supabase`
- ✅ Memiliki akun Supabase aktif
- ✅ Memiliki project Supabase yang sudah running

---

## 🔧 Solusi 1: Re-authenticate & Link Project (RECOMMENDED)

### Step 1: Logout dari Supabase CLI
```bash
npx supabase logout
```

### Step 2: Login kembali (akan membuka browser)
```bash
npx supabase login
```
**NOTE:** Browser akan terbuka otomatis. Login dengan akun **azuranistirah@gmail.com**

### Step 3: Get Project Reference ID
1. Buka: https://app.supabase.com/project/_/settings/general
2. Pilih project: **Broker Website Development**
3. Copy **Reference ID** (contoh format: `abcdefghijklmnop`)

### Step 4: Link Project ke Local
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```
Ganti `YOUR_PROJECT_REF` dengan Reference ID yang sudah di-copy

### Step 5: Verify Link
```bash
npx supabase projects list
```
Pastikan project Anda muncul dengan status "Linked"

### Step 6: Set Environment Secrets (PENTING!)
Edge Functions memerlukan environment variables. Set dengan:
```bash
# Set secrets satu per satu
npx supabase secrets set SUPABASE_URL=https://yourproject.supabase.co
npx supabase secrets set SUPABASE_ANON_KEY=your_anon_key
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
npx supabase secrets set NEWS_API_KEY=your_news_api_key
```

**Cara mendapatkan keys:**
1. Buka: https://app.supabase.com/project/_/settings/api
2. Copy:
   - **URL** → SUPABASE_URL
   - **anon public** → SUPABASE_ANON_KEY
   - **service_role** (⚠️ secret!) → SUPABASE_SERVICE_ROLE_KEY

### Step 7: Deploy Edge Function
```bash
npx supabase functions deploy make-server
```

---

## 🔐 Solusi 2: Menggunakan Access Token Manual

Jika Solusi 1 masih error 403, gunakan personal access token:

### Step 1: Generate Access Token
1. Buka: https://app.supabase.com/account/tokens
2. Klik **"Generate new token"**
3. Beri nama: "Make Server Deploy"
4. Copy token yang dihasilkan (⚠️ hanya muncul sekali!)

### Step 2: Set Access Token di Environment
**Windows (CMD):**
```cmd
set SUPABASE_ACCESS_TOKEN=sbp_your_token_here
```

**Windows (PowerShell):**
```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token_here"
```

**Mac/Linux (Terminal):**
```bash
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here
```

### Step 3: Link Project dengan Token
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Step 4: Deploy
```bash
npx supabase functions deploy make-server
```

---

## 🔍 Solusi 3: Verify Organization Access

Jika masih error, pastikan Anda memiliki permission yang benar:

### Step 1: Check Organization Settings
1. Buka: https://app.supabase.com/org/_/settings
2. Pilih organization: **azuranistirah@gmail.com**
3. Verify role Anda adalah **Owner** atau **Admin**

### Step 2: Check Project Permissions
1. Buka project **Broker Website Development**
2. Settings → Team → Pastikan email Anda listed dengan role **Owner**

---

## 🧪 Testing Deployment

Setelah deployment berhasil, test Edge Function:

### Get Function URL
```bash
npx supabase functions list
```

### Test dengan cURL
```bash
# Health Check
curl https://yourproject.supabase.co/functions/v1/make-server/health

# Get Market Price
curl https://yourproject.supabase.co/functions/v1/make-server/api/market/price/BTCUSD

# Expected response:
# {"symbol":"BTCUSD","price":65123.45,"timestamp":1675958400000}
```

---

## ⚠️ Common Errors & Solutions

### Error: "Failed to link project: 403 Forbidden"
**Solusi:**
- Pastikan Anda sudah login dengan akun yang benar
- Gunakan access token (Solusi 2)
- Check organization permissions

### Error: "Invalid project reference"
**Solusi:**
- Verify Reference ID benar (cek di Project Settings)
- Pastikan tidak ada typo saat copy-paste

### Error: "Missing environment variables"
**Solusi:**
- Set semua secrets dengan `supabase secrets set`
- Verify dengan: `npx supabase secrets list`

### Error: "Function deployment timeout"
**Solusi:**
- Check koneksi internet
- Coba deploy lagi (kadang issue network)
- Reduce function bundle size

---

## 📁 File Structure Verification

Pastikan struktur folder Anda seperti ini:

```
/supabase
  /functions
    /make-server
      - index.ts         ✅ Main function handler
      - kv_store.tsx     ✅ Key-value store utilities
      - deno.json        ✅ Deno configuration
  - config.toml          ✅ Supabase configuration
```

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref YOUR_PROJECT_REF

# List projects
npx supabase projects list

# Set secret
npx supabase secrets set KEY=VALUE

# List secrets
npx supabase secrets list

# Deploy specific function
npx supabase functions deploy make-server

# Deploy all functions
npx supabase functions deploy

# View function logs (real-time)
npx supabase functions logs make-server

# Delete function
npx supabase functions delete make-server
```

---

## 📞 Still Having Issues?

Jika masih mengalami error 403 setelah mencoba semua solusi:

1. **Check Supabase Status:**
   - https://status.supabase.com/

2. **Verify CLI Version:**
   ```bash
   npx supabase --version
   ```
   Update jika versi < 1.150.0:
   ```bash
   npm install -g supabase@latest
   ```

3. **Clear CLI Cache:**
   ```bash
   rm -rf ~/.supabase   # Mac/Linux
   # atau
   rmdir /s %USERPROFILE%\.supabase   # Windows
   ```
   Kemudian login ulang

4. **Contact Supabase Support:**
   - Discord: https://discord.supabase.com/
   - GitHub Issues: https://github.com/supabase/cli/issues

---

## ✅ Success Indicators

Deployment berhasil jika Anda melihat:

```
✅ Deploying Function make-server...
✅ Uploading function bundle...
✅ Function deployed successfully!

Function URL: https://yourproject.supabase.co/functions/v1/make-server
```

Setelah berhasil, test dengan mengakses URL di browser atau Postman!

---

**Created:** 2025-02-07
**Last Updated:** 2025-02-07
**Status:** ✅ Ready to Deploy
