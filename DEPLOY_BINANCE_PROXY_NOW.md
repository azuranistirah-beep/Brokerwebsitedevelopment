# 🚀 Deploy Binance Proxy - Solusi Error HTTP 404

## ❌ Error yang Terjadi
```
HTTP 404
URL: https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy
⚠️ Binance proxy may not be deployed yet
```

## ✅ Solusi: Deploy Edge Function

Edge Function `binance-proxy` sudah dibuat di folder `/supabase/functions/binance-proxy/`, tapi belum di-deploy ke Supabase. Ikuti langkah berikut:

---

## 📋 Langkah 1: Install Supabase CLI

### Windows (PowerShell)
```powershell
# Install menggunakan Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### macOS/Linux
```bash
# Install menggunakan Homebrew
brew install supabase/tap/supabase

# Atau menggunakan npm
npm install -g supabase
```

### Verifikasi Instalasi
```bash
supabase --version
```

---

## 📋 Langkah 2: Login ke Supabase

```bash
supabase login
```

Ini akan membuka browser untuk autentikasi. Login dengan akun Supabase Anda.

---

## 📋 Langkah 3: Link Project

```bash
# Masuk ke folder project
cd [path-to-your-project]

# Link dengan project Supabase Anda
supabase link --project-ref nvocyxqxlxqxdzioxgrw
```

**Catatan:** Ganti `nvocyxqxlxqxdzioxgrw` dengan Project ID Anda jika berbeda.

---

## 📋 Langkah 4: Deploy Edge Function

```bash
# Deploy binance-proxy function
supabase functions deploy binance-proxy

# Atau deploy semua functions sekaligus
supabase functions deploy
```

Output yang diharapkan:
```
✅ Deployed binance-proxy function to production
🔗 https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy
```

---

## 🧪 Langkah 5: Test Edge Function

### Test menggunakan cURL:
```bash
curl https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy
```

### Test di Browser Console:
```javascript
fetch('https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy')
  .then(res => res.json())
  .then(data => console.log('✅ Prices:', data.slice(0, 5)))
  .catch(err => console.error('❌ Error:', err));
```

### Expected Response:
```json
[
  {
    "symbol": "BTCUSDT",
    "price": "52340.50"
  },
  {
    "symbol": "ETHUSDT",
    "price": "3125.80"
  },
  ...
]
```

---

## 🔍 Troubleshooting

### Problem 1: "supabase: command not found"
**Solusi:** Install Supabase CLI terlebih dahulu (Langkah 1)

### Problem 2: "Not logged in"
**Solusi:** Jalankan `supabase login`

### Problem 3: "Project not linked"
**Solusi:** Jalankan `supabase link --project-ref [YOUR_PROJECT_ID]`

### Problem 4: "Failed to deploy function"
**Solusi:** 
1. Cek koneksi internet
2. Pastikan file `/supabase/functions/binance-proxy/index.ts` ada
3. Coba deploy ulang dengan flag verbose:
   ```bash
   supabase functions deploy binance-proxy --debug
   ```

### Problem 5: Masih 404 setelah deploy
**Solusi:**
1. Tunggu 30-60 detik untuk propagasi
2. Clear browser cache
3. Cek logs function:
   ```bash
   supabase functions logs binance-proxy
   ```

---

## 📝 Quick Command Reference

```bash
# Login
supabase login

# Link project
supabase link --project-ref nvocyxqxlxqxdzioxgrw

# Deploy specific function
supabase functions deploy binance-proxy

# Deploy all functions
supabase functions deploy

# View logs
supabase functions logs binance-proxy

# List deployed functions
supabase functions list

# Delete function (jika perlu)
supabase functions delete binance-proxy
```

---

## 🎯 Setelah Deploy Berhasil

1. **Refresh aplikasi** - Hard refresh browser (Ctrl+Shift+R atau Cmd+Shift+R)
2. **Cek console** - Lihat apakah masih ada error
3. **Monitor prices** - Dashboard seharusnya menampilkan harga real-time
4. **Verify TradingView chart** - Chart seharusnya update setiap 2 detik

---

## ✅ Checklist Deployment

- [ ] Supabase CLI terinstall (`supabase --version`)
- [ ] Login ke Supabase (`supabase login`)
- [ ] Project ter-link (`supabase link`)
- [ ] Function deployed (`supabase functions deploy binance-proxy`)
- [ ] Test endpoint berhasil (menggunakan cURL atau browser)
- [ ] Aplikasi berjalan tanpa error 404
- [ ] Harga real-time muncul di dashboard

---

## 📞 Perlu Bantuan?

Jika masih ada masalah setelah mengikuti panduan ini, screenshot error yang muncul dan share:
1. Output dari `supabase functions list`
2. Output dari `supabase functions logs binance-proxy`
3. Error message di browser console

---

**Status:** 🔴 Belum Deploy → Ikuti panduan di atas
**Target:** 🟢 Function Deployed & Working

**Last Updated:** 2026-02-25
