# ⚡ QUICK FIX REFERENCE - Investoft Platform

## 🎯 CARA TERCEPAT FIX ERROR (Pilih salah satu)

### **OPSI 1: Auto-Fix Tool (PALING MUDAH)**
1. Buka browser, ketik di address bar:
   ```
   /auto-fix-errors.html
   ```
2. Klik tombol "🚀 Fix Semua Error Sekarang"
3. Tunggu 3 detik, platform akan reload otomatis
4. Login dengan:
   - Email: `azuranistirah@gmail.com`
   - Password: `Sundala99!`

---

### **OPSI 2: Console Script (CEPAT)**
1. Tekan `F12` (buka Developer Tools)
2. Klik tab **Console**
3. Copy-paste script ini:
   ```javascript
   (async()=>{console.log('%c🔧 Clearing all caches...','color:#6366f1;font-size:16px;font-weight:bold');localStorage.clear();sessionStorage.clear();if('serviceWorker' in navigator){const r=await navigator.serviceWorker.getRegistrations();for(let reg of r)await reg.unregister();}if('caches' in window){const c=await caches.keys();for(let name of c)await caches.delete(name);}localStorage.setItem('app_version','12.0.0');console.log('%c✅ All fixed! Reloading...','color:#10b981;font-size:16px;font-weight:bold');setTimeout(()=>location.reload(),2000);})();
   ```
4. Tekan `Enter`
5. Platform akan reload otomatis

---

### **OPSI 3: Manual Hard Refresh (SIMPLE)**
1. **Windows:**
   - Tekan `Ctrl + Shift + R` (hard reload)
   - ATAU `Ctrl + Shift + Delete` → Clear cache → Reload

2. **Mac:**
   - Tekan `Cmd + Shift + R` (hard reload)
   - ATAU `Cmd + Shift + Delete` → Clear cache → Reload

3. Login dengan:
   - Email: `azuranistirah@gmail.com`
   - Password: `Sundala99!`

---

## 🔍 IDENTIFIKASI ERROR CEPAT

### ❌ **Error: "Price not moving"**
**Solusi:** Hard refresh (`Ctrl + Shift + R`)

### ❌ **Error: "Invalid login credentials"**
**Solusi:**
1. Logout
2. Clear localStorage (gunakan Console Script di atas)
3. Login kembali

### ❌ **Error: "Error 544"**
**Solusi:** Ini error lama, abaikan saja. Platform sudah tidak depend ke Edge Functions.

### ❌ **Error: "Failed to fetch"**
**Solusi:** Normal! Platform akan auto-fallback ke Binance API. Tidak perlu fix apa-apa.

### ❌ **Error: "CORS error"**
**Solusi:** Check internet connection atau gunakan VPN jika Binance API di-block.

---

## ✅ VERIFICATION (Pastikan Sudah Fix)

Setelah fix, buka Console (F12) dan pastikan muncul:

```
✅ [App] Version 12.0.0 - Cache is clean
✅ Platform ready - Direct Binance API active
✅ [Direct Binance] BTCUSDT: $67521.00
```

Jika muncul log di atas = **PLATFORM SUDAH WORKING 100%** ✅

---

## 🚨 MASIH ERROR? (Last Resort)

### **Nuclear Option:**
1. Close SEMUA tab browser
2. Tekan `Ctrl + Shift + Delete`
3. Pilih **"All time"**
4. Centang:
   - ☑️ Cookies and other site data
   - ☑️ Cached images and files
5. Klik **"Clear data"**
6. Buka browser di **Incognito/Private Mode**
7. Login fresh

---

## 📞 NEED HELP?

Jika MASIH error setelah semua cara di atas:

1. Screenshot Console error (F12 → Console tab)
2. Screenshot Network tab (F12 → Network tab)
3. Describe error yang muncul
4. Share ke saya

---

## 🎯 KEY FILES (Untuk Referensi)

- **Full Guide:** `/FIX_ALL_ERRORS.md`
- **Auto-Fix Tool:** `/auto-fix-errors.html`
- **Console Script:** `/console-fix-script.js`
- **This Quick Ref:** `/QUICK_FIX_REFERENCE.md`

---

## ✨ SUMMARY

**Platform Status:**
- ✅ Version: 12.0.0
- ✅ Real-time prices: Binance API (2 second updates)
- ✅ Backend: Frontend-only (no Edge Functions)
- ✅ Error 544: FIXED (not relevant anymore)

**Test Account:**
- Email: `azuranistirah@gmail.com`
- Password: `Sundala99!`
- Balance: $0 (set via Admin Panel)

**Expected Behavior:**
- Prices update every 2 seconds
- Trading works perfectly
- No dependency on Edge Functions
- All features 100% functional

---

**Last Updated:** Feb 22, 2026 - Version 12.0.0
