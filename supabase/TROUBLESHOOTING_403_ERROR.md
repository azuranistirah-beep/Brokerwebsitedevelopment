# 🔧 Troubleshooting Error 403 - Edge Functions Deployment

## Masalah
Error 403 terjadi saat deploy Edge Functions dari Figma Make:
```
Error while deploying: XHR for "/api/integrations/supabase/.../edge_functions/make-server/deploy" failed with status 403
```

## Penyebab Utama
1. **Access Token tidak memiliki permissions yang cukup**
2. **Project ID tidak sesuai dengan project yang diconnect**
3. **Token expired atau invalid**

---

## ✅ SOLUSI LENGKAP

### Step 1: Buat Access Token Baru dengan Permissions yang Tepat

#### Di Supabase Dashboard:

1. **Buka project "Broker Website Development (Copy)"**
   - URL: https://supabase.com/dashboard/project/[your-project-id]

2. **Pergi ke Settings > Access Tokens**
   - Klik hamburger menu (☰) di sidebar kiri
   - Klik **"Settings"** (icon gear/roda gigi)
   - Pilih **"Access Tokens"**

3. **Generate New Token**
   - Klik tombol **"Generate new token"**
   
4. **Set Token Name**
   - Name: `Figma Make Deployment Token`
   - Description: `Token untuk deploy Edge Functions dari Figma Make`

5. **SET PERMISSIONS - INI YANG PALING PENTING! ⚠️**
   
   **Pilih salah satu:**
   
   **OPTION A (RECOMMENDED): Full Access**
   ```
   ✅ Select All Permissions
   ```
   
   **OPTION B: Minimal Permissions**
   - ✅ `functions.write` - Deploy edge functions
   - ✅ `functions.read` - Read edge functions
   - ✅ `secrets.write` - Set environment variables
   - ✅ `secrets.read` - Read environment variables

6. **Generate & Copy Token**
   - Klik **"Generate token"**
   - **COPY TOKEN SEGERA** - Token dimulai dengan `sbp_...`
   - ⚠️ Anda tidak bisa melihatnya lagi setelah menutup dialog!
   - Simpan di tempat aman (misalnya: Notepad)

---

### Step 2: Dapatkan Project Reference ID yang Benar

1. **Masih di Supabase Dashboard project "Broker Website Development (Copy)"**
2. **Pergi ke Settings > General**
3. **Copy "Reference ID"**
   - Ini adalah Project ID yang berbentuk seperti: `abcdefghijklmnop`
   - Format: 16-20 karakter huruf kecil
   - **BUKAN** URL project
   - **BUKAN** project name

4. **Screenshot atau catat:**
   - Project URL: `https://[reference-id].supabase.co`
   - Reference ID: `[reference-id]`

---

### Step 3: Update config.toml dengan Project ID yang Benar

1. **Buka file `/supabase/config.toml` di Figma Make**

2. **Update baris `project_id`** dengan Reference ID yang benar:
   ```toml
   project_id = "your-actual-reference-id"
   ```

3. **Contoh:**
   ```toml
   # BEFORE (salah):
   project_id = "N0cQmKQIBtKIa5VgEQp7d7"
   
   # AFTER (benar):
   project_id = "abcdefghijklmnop"
   ```

---

### Step 4: Disconnect & Reconnect Supabase di Figma Make

1. **Di Figma Make:**
   - Klik icon Supabase di toolbar
   - Klik **"Disconnect"** (jika ada)

2. **Reconnect:**
   - Klik lagi icon Supabase
   - Pilih **"Broker Website Development (Copy)"**
   - Klik **"Connect"**

3. **Enter Credentials:**
   - **Project URL**: `https://[reference-id].supabase.co`
   - **Access Token**: Token yang baru Anda copy (dimulai dengan `sbp_...`)

4. **Verify Connection:**
   - Seharusnya muncul notifikasi "Connected successfully"

---

### Step 5: Deploy Edge Functions

Setelah berhasil connect, coba deploy lagi:

1. **Di Figma Make:**
   - Klik tombol **"Deploy"** atau **"Push to Supabase"**

2. **Jika masih error 403:**
   - Periksa lagi token memiliki **full permissions**
   - Pastikan token **belum expired**
   - Pastikan `project_id` di `config.toml` **benar**

---

## 🔍 Checklist Verifikasi

Sebelum deploy, pastikan semua ini sudah benar:

- [ ] Access token dibuat dengan **Full Permissions** atau minimal `functions.write` + `functions.read`
- [ ] Access token **dicopy dengan benar** (dimulai dengan `sbp_...`)
- [ ] Project URL **sesuai** dengan Reference ID: `https://[reference-id].supabase.co`
- [ ] File `/supabase/config.toml` memiliki `project_id = "reference-id-yang-benar"`
- [ ] Figma Make **connected** ke project "Broker Website Development (Copy)"
- [ ] Token **belum expired** (cek di Supabase Dashboard > Settings > Access Tokens)

---

## 🚨 Jika Masih Error 403

### Solusi Alternatif: Deploy Manual via CLI

Jika Figma Make masih tidak bisa deploy, gunakan deployment manual:

```bash
# Windows
cd path\to\your\project
supabase\deploy-edge-functions.bat

# Mac/Linux
cd path/to/your/project
bash supabase/deploy-edge-functions.sh
```

### Atau Deploy via Supabase CLI:

```bash
# Login ke Supabase
supabase login

# Link project
supabase link --project-ref your-reference-id

# Deploy Edge Functions
supabase functions deploy make-server

# Set secrets
supabase secrets set NEWS_API_KEY=your_newsapi_key
```

---

## 📞 Informasi Tambahan

### Cara Cek Token Masih Valid:

1. Pergi ke Supabase Dashboard > Settings > Access Tokens
2. Lihat list token yang ada
3. Pastikan token "Figma Make Deployment Token" ada dan tidak expired
4. Jika expired atau tidak ada, buat token baru

### Project Reference ID vs Project ID:

- **Reference ID**: 16-20 karakter huruf kecil (ex: `abcdefghijklmnop`)
- **Project ID**: UUID panjang (ex: `550e8400-e29b-41d4-a716-446655440000`)
- **Yang dipakai**: Reference ID

### Format Access Token yang Benar:

- Dimulai dengan: `sbp_`
- Panjang: ~40-50 karakter
- Contoh: `sbp_1234567890abcdefghijklmnopqrstuvwxyz`
- **BUKAN**: Personal Access Token (PAT) dari GitHub
- **BUKAN**: Service Role Key atau Anon Key

---

## ✅ Next Steps Setelah Berhasil Deploy

1. Verify deployment di Supabase Dashboard > Edge Functions
2. Test Edge Functions dengan curl atau Postman
3. Update environment variables jika diperlukan
4. Monitor logs di Dashboard

---

**Last Updated**: February 2026
**Platform**: Investoft Trading Platform
**Environment**: Figma Make + Supabase
