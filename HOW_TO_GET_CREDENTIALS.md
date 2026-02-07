# 🔑 Cara Mendapatkan Supabase Credentials

## 📍 1. Project Reference ID

**Lokasi:** Project Settings → General
**URL:** https://app.supabase.com/project/_/settings/general

**Langkah:**
1. Login ke Supabase Dashboard
2. Pilih project **"Broker Website Development"**
3. Klik **Settings** (⚙️) di sidebar kiri
4. Klik **General**
5. Scroll ke bagian **"Reference ID"**
6. Copy value (format: `abcdefghijklmnop`)

**Contoh:**
```
Reference ID: ourtzdfyqpytfojlquff
```

---

## 🔐 2. API Keys (URL, Anon, Service Role)

**Lokasi:** Project Settings → API
**URL:** https://app.supabase.com/project/_/settings/api

**Langkah:**
1. Login ke Supabase Dashboard
2. Pilih project **"Broker Website Development"**
3. Klik **Settings** (⚙️) di sidebar kiri
4. Klik **API**
5. Scroll ke bagian **"Project URL"** dan **"Project API keys"**

**Copy 3 values ini:**

### a) SUPABASE_URL
```
URL: https://yourproject.supabase.co
```

### b) SUPABASE_ANON_KEY (anon public)
```
Klik "Reveal" → Copy key panjang
Contoh: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
⚠️ **Public key** - aman untuk frontend

### c) SUPABASE_SERVICE_ROLE_KEY (service_role)
```
Klik "Reveal" → Copy key panjang
Contoh: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
⚠️ **SECRET KEY** - JANGAN share / commit ke Git!

---

## 🎫 3. Personal Access Token (Untuk deployment)

**Lokasi:** Account Settings → Access Tokens
**URL:** https://app.supabase.com/account/tokens

**Langkah:**
1. Login ke Supabase Dashboard
2. Klik avatar Anda di kanan atas
3. Pilih **Account Settings**
4. Klik **Access Tokens** di sidebar
5. Klik **"Generate new token"**
6. Beri nama: `"Investoft Deploy"` (atau nama lain)
7. Copy token yang muncul (⚠️ **hanya muncul sekali!**)

**Format:**
```
sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Cara pakai:**
```bash
# Windows CMD:
set SUPABASE_ACCESS_TOKEN=sbp_your_token_here

# Windows PowerShell:
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token_here"

# Mac/Linux:
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here
```

---

## 📰 4. News API Key (Optional)

**Lokasi:** NewsAPI.org
**URL:** https://newsapi.org/account

**Langkah:**
1. Login ke NewsAPI.org
2. Copy **API Key** dari dashboard
3. Paste saat diminta oleh deployment script

**Format:**
```
1234567890abcdef1234567890abcdef
```

---

## 🎯 Summary - Credentials Checklist

Pastikan Anda sudah punya semua ini sebelum deploy:

- [ ] **Project Reference ID** (dari Project Settings → General)
- [ ] **SUPABASE_URL** (dari Project Settings → API)
- [ ] **SUPABASE_ANON_KEY** (dari Project Settings → API)
- [ ] **SUPABASE_SERVICE_ROLE_KEY** (dari Project Settings → API)
- [ ] **Personal Access Token** (dari Account Settings → Access Tokens)
- [ ] **NEWS_API_KEY** (optional - dari NewsAPI.org)

---

## 🔒 Security Notes

### ✅ AMAN untuk commit ke Git:
- Project Reference ID
- SUPABASE_URL
- SUPABASE_ANON_KEY

### ⛔ JANGAN commit ke Git:
- SUPABASE_SERVICE_ROLE_KEY
- Personal Access Token
- NEWS_API_KEY

**Tips:** Gunakan `.env` file dan tambahkan ke `.gitignore`

---

## 📝 Template .env

Buat file `.env` di root project (jangan commit!):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Secrets (JANGAN commit!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
NEWS_API_KEY=1234567890abcdef1234567890abcdef
```

---

## 🆘 Troubleshooting

### "Invalid API key"
- Pastikan tidak ada space di awal/akhir saat copy
- Klik "Reveal" dulu sebelum copy
- Jangan copy dari "Show" button

### "Project not found"
- Verify Reference ID benar
- Pastikan project masih aktif
- Check apakah Anda login dengan account yang benar

### "Insufficient permissions"
- Verify Anda adalah **Owner** atau **Admin** di organization
- Check di: https://app.supabase.com/org/_/settings

---

**Created:** 2025-02-07
**For:** Investoft Platform
**Account:** azuranistirah@gmail.com
