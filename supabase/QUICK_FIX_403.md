# ⚡ QUICK FIX - Error 403 (5 Menit)

## Masalah
```
Error 403 saat deploy Edge Functions dari Figma Make
```

## Solusi Cepat

### 1️⃣ Buat Token Baru (2 menit)

**Di Supabase Dashboard:**

1. Buka project **"Broker Website Development (Copy)"**
2. **Settings** > **Access Tokens**
3. **Generate new token**
4. Name: `Figma Make Deploy`
5. **⚠️ PENTING: Pilih "All Permissions"** ✅
6. Generate & **COPY token** (dimulai dengan `sbp_...`)

---

### 2️⃣ Dapatkan Project ID (1 menit)

**Masih di Dashboard:**

1. **Settings** > **General**
2. Copy **"Reference ID"**
   - Contoh format: `abcdefghijklmnop` (16-20 karakter)
   - BUKAN URL, BUKAN nama project

---

### 3️⃣ Update Config (30 detik)

**Beri tahu developer Reference ID yang benar dari Step 2**

File `/supabase/config.toml` perlu diupdate:
```toml
project_id = "your-reference-id-here"
```

---

### 4️⃣ Reconnect Figma Make (1 menit)

**Di Figma Make:**

1. Klik icon **Supabase**
2. **Disconnect** (jika sudah connect)
3. **Connect** lagi
4. Pilih: **"Broker Website Development (Copy)"**
5. Masukkan:
   - **Project URL**: `https://[reference-id].supabase.co`
   - **Access Token**: Token dari Step 1 (yang dimulai `sbp_...`)

---

### 5️⃣ Deploy Lagi (30 detik)

Coba deploy Edge Functions lagi dari Figma Make.

---

## ✅ Checklist

- [ ] Token dibuat dengan **"All Permissions"** ✅
- [ ] Reference ID sudah dicopy dengan benar
- [ ] `config.toml` updated dengan Reference ID yang benar
- [ ] Figma Make reconnect dengan token baru
- [ ] Deploy berhasil! 🎉

---

## 🚨 Jika Masih Error

Cek file `/supabase/TROUBLESHOOTING_403_ERROR.md` untuk solusi lengkap.

---

**Platform**: Investoft - Trading Platform
**Time to Fix**: ~5 minutes
