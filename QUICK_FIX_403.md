# 🔧 Quick Fix: Error 403 Supabase Deployment

## ⚡ Solusi Tercepat (3 Menit)

### 1️⃣ Re-login & Link (PALING SERING BERHASIL)

```bash
# Logout & Login ulang
npx supabase logout
npx supabase login

# Link project (ganti YOUR_PROJECT_REF)
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy
npx supabase functions deploy make-server
```

**Cara dapat Project Ref:**
- Buka: https://app.supabase.com/project/_/settings/general
- Copy **Reference ID**

---

### 2️⃣ Gunakan Access Token (Kalau cara 1 gagal)

```bash
# Generate token di: https://app.supabase.com/account/tokens
# Kemudian:

# Windows CMD:
set SUPABASE_ACCESS_TOKEN=sbp_your_token_here

# Windows PowerShell:
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token_here"

# Mac/Linux:
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here

# Link & Deploy
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy make-server
```

---

### 3️⃣ Gunakan Script Otomatis

**Windows:**
```cmd
deploy-edge-functions.bat
```

**Mac/Linux:**
```bash
chmod +x deploy-edge-functions.sh
./deploy-edge-functions.sh
```

---

## ✅ Verify Deployment Berhasil

```bash
# Check function status
npx supabase functions list

# Test endpoint
curl https://yourproject.supabase.co/functions/v1/make-server/health
```

---

## 🆘 Masih Error?

1. **Update Supabase CLI:**
   ```bash
   npm install -g supabase@latest
   ```

2. **Clear cache & login ulang:**
   ```bash
   # Mac/Linux
   rm -rf ~/.supabase
   
   # Windows
   rmdir /s %USERPROFILE%\.supabase
   ```

3. **Baca guide lengkap:** `EDGE_FUNCTIONS_DEPLOYMENT_FIX.md`

---

## 📞 Contact

- Supabase Discord: https://discord.supabase.com/
- GitHub Issues: https://github.com/supabase/cli/issues
