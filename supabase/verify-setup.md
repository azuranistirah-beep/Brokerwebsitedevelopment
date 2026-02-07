# 🔍 Verify Supabase Setup untuk Figma Make

## Informasi yang Anda Berikan

Berdasarkan error yang terjadi, sistem mencoba deploy ke:
```
Project ID: N0cQmKQIBtKIa5VgEQp7d7
```

Tapi Anda memiliki 3 project di Supabase Dashboard dan ingin connect ke:
```
Project: Broker Website Development (Copy)
```

## ❓ Pertanyaan untuk Verifikasi

Untuk memastikan konfigurasi benar, mohon konfirmasi informasi berikut:

### 1. Project Reference ID

**Dari Supabase Dashboard project "Broker Website Development (Copy)":**
- Pergi ke: **Settings > General**
- Copy: **"Reference ID"**

```
Reference ID Anda: ___________________ (16-20 karakter)
```

Contoh format yang BENAR:
- ✅ `abcdefghijklmnop`
- ✅ `xyzabc1234567890`
- ❌ `N0cQmKQIBtKIa5VgEQp7d7` (ini bukan Reference ID standar)

### 2. Project URL

Format yang benar:
```
https://[reference-id].supabase.co
```

Project URL Anda: ___________________

### 3. Access Token

**Token yang Anda buat harus:**
- ✅ Dimulai dengan `sbp_`
- ✅ Memiliki **All Permissions** atau minimal `functions.write` + `functions.read`
- ✅ Dibuat untuk project "Broker Website Development (Copy)"
- ✅ Belum expired

```
Token Anda dimulai dengan: sbp_______...
```

### 4. Permissions Token

Saat membuat token, apakah Anda memilih:
- [ ] **All Permissions** (RECOMMENDED) ✅
- [ ] Atau minimal: `functions.write`, `functions.read`, `secrets.write`, `secrets.read`

---

## 🔄 Yang Perlu Dilakukan Sekarang

### STEP A: Konfirmasi Reference ID

1. Buka Supabase Dashboard
2. Buka project **"Broker Website Development (Copy)"**
3. **Settings > General**
4. Screenshot atau copy **"Reference ID"**
5. **Beri tahu Reference ID yang benar**

### STEP B: Saya akan Update Config

Setelah Anda beri tahu Reference ID yang benar, saya akan:
1. Update `/supabase/config.toml` dengan `project_id` yang benar
2. Pastikan semua konfigurasi sudah sesuai

### STEP C: Buat Token Baru dengan Full Permissions

1. Di Dashboard project "Broker Website Development (Copy)"
2. **Settings > Access Tokens**
3. **Generate new token**
4. Name: `Figma Make Deployment`
5. **⚠️ PENTING: Select "All Permissions"**
6. Generate & Copy token (dimulai dengan `sbp_...`)

### STEP D: Reconnect di Figma Make

1. Disconnect Supabase di Figma Make (jika sudah connect)
2. Connect lagi
3. Pilih: **"Broker Website Development (Copy)"**
4. Masukkan:
   - Project URL: `https://[reference-id].supabase.co`
   - Access Token: Token baru yang full permissions

---

## 📝 Template Jawaban

Untuk mempermudah, copy template ini dan isi:

```
REFERENCE ID: ___________________
PROJECT URL: https://___________________.supabase.co
TOKEN CREATED: Yes / No
TOKEN HAS ALL PERMISSIONS: Yes / No
TOKEN STARTS WITH: sbp_________...
```

Setelah Anda isi dan beri tahu saya, saya akan langsung:
1. ✅ Update `config.toml` dengan Reference ID yang benar
2. ✅ Verifikasi semua file konfigurasi
3. ✅ Siap untuk deployment

---

## 🎯 Goal

Setelah ini selesai:
- ✅ `config.toml` memiliki `project_id` yang benar
- ✅ Figma Make connect ke project yang benar dengan token yang valid
- ✅ Error 403 teratasi
- ✅ Deploy Edge Functions berhasil

---

**Silakan beri tahu Reference ID dan konfirmasi token sudah dibuat!**
