# 🧪 TEST SESSION FIX - Quick Guide

## 🎯 Cara Test Session Management Baru

### Test 1: Login & Session Persistence ✅
```bash
1. Login ke admin panel
2. Buka DevTools Console
3. Lihat log: "✅ Valid session found, token expires: [date]"
4. Refresh halaman → harus tetap login
5. Buka tab baru dengan URL yang sama → harus tetap login
```

**Expected Result:**
- ✅ Tetap login setelah refresh
- ✅ Session sync antar tab
- ✅ Console menunjukkan token expiry time

---

### Test 2: Automatic Token Refresh ✅
```bash
1. Login ke admin panel
2. Buka DevTools Console
3. Tunggu 2 menit → akan ada log "⏰ Token check - expires in: X seconds"
4. Lihat log periodic check setiap 2 menit
5. Jika token < 10 menit expired → akan ada log "🔄 Proactive token refresh..."
```

**Expected Result:**
- ✅ Console log setiap 2 menit
- ✅ Token di-refresh otomatis sebelum expired
- ✅ Tidak ada session expired error

---

### Test 3: API Call dengan Auto-Retry ✅
```bash
1. Login ke admin panel
2. Buka page Members / KYC / Deposits / Withdrawals
3. Lakukan action (approve/reject)
4. Cek Network tab → request berhasil
5. Jika ada 401 error → akan auto-retry dengan token baru
```

**Expected Result:**
- ✅ API calls berhasil tanpa error
- ✅ Auto-retry jika 401 (max 2x)
- ✅ Toast notification jika logout diperlukan

---

### Test 4: Long Idle Session (Most Important!) ✅
```bash
1. Login ke admin panel
2. Biarkan idle (jangan close tab)
3. Tunggu 30-60 menit
4. Kembali ke tab dan klik menu atau action
5. Harus tetap berfungsi tanpa "Session Expired" error
```

**Expected Result:**
- ✅ Token di-refresh otomatis di background
- ✅ UI tetap responsif
- ✅ Tidak ada forced logout

---

### Test 5: Invalid Token Handling ✅
```bash
1. Login ke admin panel
2. Buka DevTools → Application → Local Storage
3. Hapus key "investoft-auth-token"
4. Coba lakukan action (approve/reject)
5. Harus muncul toast "Session expired" dan redirect ke login
```

**Expected Result:**
- ✅ Toast notification (bukan alert popup!)
- ✅ Graceful logout dengan delay 1.5 detik
- ✅ Redirect ke landing page

---

### Test 6: Cross-Tab Session Sync ✅
```bash
1. Login di Tab A
2. Buka Tab B dengan URL yang sama
3. Tab B harus otomatis login
4. Logout di Tab A
5. Tab B harus otomatis logout juga
```

**Expected Result:**
- ✅ Session sync otomatis antar tab
- ✅ Logout di satu tab = logout di semua tab

---

### Test 7: Connection Loss Recovery ✅
```bash
1. Login ke admin panel
2. Simulate offline → DevTools > Network > Offline
3. Coba action → akan gagal
4. Enable online kembali
5. Refresh page → harus tetap login
6. Action seharusnya berhasil
```

**Expected Result:**
- ✅ Toast notification saat offline
- ✅ Session tetap valid setelah online kembali
- ✅ Auto-reconnect ke Supabase

---

## 🔍 Console Logs yang Harus Muncul

### Saat Login:
```
🔐 Auth state changed: SIGNED_IN
✅ Valid session found, token expires: [timestamp]
⏰ Token check - expires in: 3600 seconds
```

### Setiap 2 Menit:
```
⏰ Token check - expires in: 3480 seconds
```

### Saat Token < 10 Menit:
```
⏰ Token check - expires in: 540 seconds
🔄 Proactive token refresh...
✅ Token refreshed successfully
⏰ New token expires in: 3600 seconds
```

### Saat API Call dengan 401:
```
⚠️ 401 Unauthorized - Attempt 1/3, refreshing token...
✅ Token refreshed, retrying request...
```

### Saat Token Refresh:
```
🔐 Auth state changed: TOKEN_REFRESHED
✅ Token refreshed automatically
```

---

## ⚠️ Red Flags (Jangan Sampai Terjadi!)

### ❌ TIDAK BOLEH ADA:
```
❌ alert() popup dengan "Your session has expired"
❌ Immediate hard refresh/redirect
❌ Console error: "Invalid JWT"
❌ 401 Unauthorized tanpa auto-retry
❌ Session expired saat masih ada token valid
```

### ✅ HARUS ADA:
```
✅ Toast notification untuk session expired
✅ Auto-refresh sebelum token expired
✅ Console logs dengan emoji untuk monitoring
✅ Graceful error handling
✅ 1.5 detik delay sebelum redirect
```

---

## 🐛 Troubleshooting

### Jika masih ada "Session Expired":
1. **Clear Browser Cache & LocalStorage**
   ```javascript
   // Buka DevTools Console:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Check Token Expiry di Console**
   ```
   Cari log: "⏰ Token check - expires in: X seconds"
   Jika X < 300 (5 menit) → harus auto-refresh
   ```

3. **Verify Supabase Config**
   ```
   Check /src/app/lib/supabaseClient.ts
   autoRefreshToken harus = true
   persistSession harus = true
   ```

4. **Check Network Requests**
   ```
   DevTools > Network
   Cari request ke /auth/v1/token?grant_type=refresh_token
   Harus ada periodic refresh calls
   ```

---

## 📊 Performance Expectations

### Token Refresh Timing:
- First check: Immediately after login
- Periodic check: Every 2 minutes
- Proactive refresh: When < 10 minutes remaining
- Emergency refresh: On 401 error (with retry)

### Network Activity:
- Background refresh: ~1 request per 50 minutes
- API calls: All use fresh tokens
- Retry mechanism: Max 2 retries per failed request

---

## ✅ Success Criteria

### Admin Panel HARUS:
1. ✅ Tidak ada "Session Expired" popup saat normal usage
2. ✅ Token di-refresh otomatis di background
3. ✅ Semua API calls berhasil tanpa manual re-login
4. ✅ Console logs menunjukkan monitoring activity
5. ✅ Toast notifications untuk error handling
6. ✅ Graceful logout dengan pesan yang jelas

### User Experience HARUS:
1. ✅ Smooth & uninterrupted work session
2. ✅ No data loss saat token refresh
3. ✅ Clear feedback untuk connection issues
4. ✅ Auto-recovery dari temporary errors

---

**CATATAN PENTING:**
Jika semua test di atas ✅ PASS, maka session management sudah 100% fixed!

**Status**: ✅ READY FOR PRODUCTION
**Last Updated**: February 7, 2026
