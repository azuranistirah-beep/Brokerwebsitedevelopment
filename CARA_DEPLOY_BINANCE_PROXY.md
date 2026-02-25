# 🚀 Cara Deploy Binance Proxy (BAHASA INDONESIA)

## ❌ Masalah yang Terjadi

Error HTTP 404 pada endpoint Binance Proxy:
```
https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy
```

**Penyebab:** Edge Function belum di-deploy ke Supabase.

---

## ✅ Solusi Tercepat (3 Langkah)

### Langkah 1: Install Supabase CLI

**Windows (dengan Scoop):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**macOS (dengan Homebrew):**
```bash
brew install supabase/tap/supabase
```

**Atau dengan npm (semua OS):**
```bash
npm install -g supabase
```

**Cek instalasi:**
```bash
supabase --version
```

---

### Langkah 2: Login ke Supabase

```bash
supabase login
```

Browser akan terbuka untuk login. Masuk dengan akun Supabase Anda.

---

### Langkah 3: Deploy Function

**Cara A - Menggunakan Script Otomatis:**

**Windows:**
```cmd
deploy-binance-proxy.bat
```

**macOS/Linux:**
```bash
chmod +x deploy-binance-proxy.sh
./deploy-binance-proxy.sh
```

**Cara B - Manual:**
```bash
# 1. Link project
supabase link --project-ref nvocyxqxlxqxdzioxgrw

# 2. Deploy function
supabase functions deploy binance-proxy --no-verify-jwt
```

---

## 🎉 Selesai!

Setelah deploy berhasil, Anda akan melihat:

```
✅ Deployed binance-proxy function to production
🔗 https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy
```

---

## 🧪 Test Function

**Test di Browser Console:**
```javascript
fetch('https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Binance Proxy Working!');
    console.log('Sample Prices:', data.slice(0, 5));
  })
  .catch(err => console.error('❌ Error:', err));
```

**Expected Output:**
```json
[
  { "symbol": "BTCUSDT", "price": "52340.50" },
  { "symbol": "ETHUSDT", "price": "3125.80" },
  { "symbol": "BNBUSDT", "price": "365.20" }
]
```

---

## 🔄 Langkah Selanjutnya

1. **Refresh aplikasi** - Tekan Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
2. **Lihat console** - Seharusnya tidak ada error lagi
3. **Cek dashboard** - Harga real-time akan muncul setiap 2 detik
4. **Monitor logs** (opsional):
   ```bash
   supabase functions logs binance-proxy
   ```

---

## ❓ Troubleshooting

### "supabase: command not found"
**Solusi:** Install Supabase CLI (Langkah 1)

### "Not logged in"
**Solusi:** Jalankan `supabase login`

### Masih 404 setelah deploy
**Solusi:**
1. Tunggu 30 detik
2. Clear cache browser (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+Shift+R)
4. Cek logs: `supabase functions logs binance-proxy`

### Deploy gagal
**Solusi:**
1. Pastikan koneksi internet stabil
2. Pastikan sudah login: `supabase login`
3. Coba deploy ulang dengan debug:
   ```bash
   supabase functions deploy binance-proxy --debug
   ```

---

## 📞 Butuh Bantuan?

Jika masih ada masalah:
1. Screenshot error yang muncul
2. Share output dari: `supabase functions list`
3. Share output dari: `supabase functions logs binance-proxy`

---

## ✅ Checklist Deployment

- [ ] Supabase CLI terinstall
- [ ] Login ke Supabase berhasil
- [ ] Project ter-link
- [ ] Function ter-deploy
- [ ] Test endpoint berhasil
- [ ] Aplikasi running tanpa error 404
- [ ] Harga real-time muncul di dashboard

---

**Waktu Deploy:** ~2-3 menit  
**Kesulitan:** ⭐ Mudah

**Status Saat Ini:** 🔴 Function Belum Deploy  
**Target:** 🟢 Function Deploy & Harga Real-Time Bekerja

---

**Dibuat:** 2026-02-25  
**Platform:** Investoft Trading Platform
