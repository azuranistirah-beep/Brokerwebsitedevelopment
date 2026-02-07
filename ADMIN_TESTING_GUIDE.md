# 🧪 Admin Panel Testing Guide

## 📋 Cara Testing Setelah Fix JWT

### Step 1: Logout dari Admin Panel

1. Buka Admin Panel (jika sedang login)
2. Klik tombol "Logout" di sidebar
3. Pastikan Anda kembali ke halaman landing page

### Step 2: Clear Browser Data (Recommended)

1. Buka Developer Tools (F12)
2. Pergi ke tab "Application" (Chrome) atau "Storage" (Firefox)
3. Clear:
   - ✅ Local Storage
   - ✅ Session Storage
   - ✅ Cookies
4. Reload halaman

### Step 3: Login Ulang ke Admin

1. **Cara Login Admin (Hidden Trick):**
   - Scroll ke bawah halaman
   - Di footer, cari tulisan "Investoft"
   - Klik titik **(.)** setelah kata "Investoft"
   - Modal admin login akan muncul

2. **Login dengan Credentials Admin:**
   ```
   Email: admin@investoft.com
   Password: [password admin Anda]
   ```
   
3. Klik "Login"

### Step 4: Testing Setiap Fitur

#### ✅ **1. Overview Page**
- [ ] Dashboard loads tanpa error
- [ ] Stats cards menampilkan angka real-time
- [ ] Pending counts sesuai dengan data
- [ ] Click "View Details" pada stats cards navigasi dengan benar
- [ ] Loading state works properly

**Expected Result:**
- Dashboard menampilkan total members, pending KYC, deposits, withdrawals
- Tidak ada error di console
- Data loading smooth

#### ✅ **2. Members Page**
- [ ] Halaman loads dan menampilkan list members
- [ ] Tabs (Pending/Active/Rejected) berfungsi
- [ ] Search members by name/email works
- [ ] Klik "Approve" pada pending member berhasil
- [ ] Klik "Reject" dengan reason berhasil
- [ ] Adjust balance member works
- [ ] Modal details tampil dengan benar

**Test Flow:**
1. Buat member baru via sign up (akan pending)
2. Refresh Members page
3. Member baru muncul di tab "Pending"
4. Approve member tersebut
5. Member pindah ke tab "Active"
6. Adjust balance member
7. Balance berubah sesuai input

#### ✅ **3. KYC Page**
- [ ] Halaman loads dan menampilkan KYC submissions
- [ ] Tabs (Pending/Approved/Rejected) berfungsi
- [ ] Klik "Review" membuka modal details
- [ ] Document images (ID Front/Back/Selfie) tampil
- [ ] Klik image untuk zoom works
- [ ] Approve KYC berhasil
- [ ] Reject KYC dengan reason berhasil

**Note:** 
- Jika tidak ada KYC submissions, data akan kosong (normal)
- KYC submission harus dibuat dari member dashboard

#### ✅ **4. Deposits Page**
- [ ] Halaman loads dan menampilkan deposits
- [ ] Filter tabs (All/Pending/Approved/Rejected) works
- [ ] Stats cards menampilkan counts dengan benar
- [ ] Klik "View" membuka deposit details
- [ ] Payment proof image tampil (jika ada)
- [ ] **CRITICAL:** Approve deposit berhasil
- [ ] **CRITICAL:** Balance member bertambah setelah approve
- [ ] Reject deposit dengan reason berhasil
- [ ] Refresh button works

**Test Flow:**
1. Login sebagai member di incognito window
2. Submit deposit request
3. Kembali ke admin panel
4. Refresh Deposits page
5. Deposit baru muncul dengan status "Pending"
6. Check balance member sebelum approve
7. Approve deposit
8. Check balance member lagi - **harus bertambah!**

#### ✅ **5. Withdrawals Page**
- [ ] Halaman loads dan menampilkan withdrawals
- [ ] Filter tabs (Pending/Approved/Rejected) works
- [ ] Stats cards menampilkan amounts dengan benar
- [ ] Klik "Process/View" membuka withdrawal details
- [ ] Payment details (bank/wallet) tampil dengan benar
- [ ] Approve withdrawal berhasil
- [ ] Reject withdrawal dengan reason berhasil
- [ ] Refresh button works

**Test Flow:**
1. Login sebagai member
2. Request withdrawal
3. Kembali ke admin panel
4. Refresh Withdrawals page
5. Withdrawal request muncul
6. Process (approve/reject) withdrawal

### Step 5: Testing Token Auto-Refresh

#### Test Scenario 1: Long Session
1. Login ke admin panel
2. Biarkan browser open selama 10-15 menit
3. **Jangan** refresh halaman
4. Setelah 10-15 menit, coba navigate ke page lain
5. Click fetch data atau perform action

**Expected Result:**
- ✅ Token auto-refresh di background
- ✅ Tidak ada error 401
- ✅ Action berhasil tanpa logout
- ✅ Console log menampilkan "🔄 Refreshing token..." (jika < 5 min expiry)

#### Test Scenario 2: Multiple Actions
1. Navigate ke Members page
2. Fetch users
3. Langsung navigate ke Deposits page
4. Fetch deposits
5. Langsung navigate ke Withdrawals
6. Fetch withdrawals
7. Kembali ke Overview

**Expected Result:**
- ✅ Semua page loads dengan benar
- ✅ Tidak ada error JWT di console
- ✅ Data fetching smooth di setiap page

### Step 6: Testing Error Handling

#### Test Expired Session
1. Login ke admin panel
2. Open Developer Tools → Application
3. Clear "Local Storage" dan "Session Storage"
4. Kembali ke browser dan coba navigate atau fetch data

**Expected Result:**
- ✅ Error "Session expired" muncul
- ✅ Auto-logout dan redirect ke landing page
- ✅ User diminta login ulang

### Step 7: Check Console Logs

Selama testing, monitor console untuk:

**✅ Good Logs (Normal):**
```
🔍 Fetching users from backend...
📡 Response status: 200
✅ Users fetched: 5
🔑 Token expires in: 3200 seconds
```

**❌ Bad Logs (Error):**
```
❌ Error getting session: ...
❌ 401 Unauthorized - Token may be invalid
❌ Fetch failed: 401
```

**If you see bad logs:**
1. Logout
2. Clear browser data
3. Login ulang
4. Test again

### 📊 Testing Checklist Summary

- [ ] Logout dan clear browser data
- [ ] Login ulang via hidden footer trick
- [ ] Overview page loads dengan stats real-time
- [ ] Members page - approve/reject/adjust balance works
- [ ] KYC page - review/approve/reject works
- [ ] Deposits page - approve adds balance correctly
- [ ] Withdrawals page - process works
- [ ] Token auto-refresh works (test dengan long session)
- [ ] No JWT errors di console
- [ ] Error handling works (auto-logout saat session invalid)
- [ ] Navigate antar pages smooth tanpa error

### 🎯 Success Criteria

✅ **ALL FEATURES WORKING** jika:
1. Tidak ada error "Invalid JWT (401)" di console
2. Semua admin pages loads dengan benar
3. CRUD operations (approve/reject/adjust) berfungsi
4. Balance member bertambah saat deposit approved
5. Token auto-refresh bekerja di background
6. Session tetap valid selama aktif
7. Auto-logout hanya saat session benar-benar invalid

### 🚨 Troubleshooting

#### Problem: Still getting JWT errors
**Solution:**
1. Pastikan sudah logout dan clear browser data
2. Login ulang
3. Check console untuk error details
4. Pastikan backend edge functions sudah deployed

#### Problem: Token refresh tidak otomatis
**Solution:**
1. Check console logs saat navigate
2. Pastikan `getValidAccessToken()` dipanggil
3. Verify Supabase session masih valid

#### Problem: Data tidak muncul
**Solution:**
1. Check backend edge functions running
2. Check console untuk error response
3. Verify API endpoints di backend
4. Check network tab untuk response details

---

## 📞 Hasil Testing

Setelah selesai testing, verifikasi bahwa:

✅ **SUKSES** - Semua fitur berfungsi tanpa error JWT
❌ **GAGAL** - Masih ada error JWT atau feature tidak berfungsi

Jika masih ada issue, copy paste error dari console untuk debugging lebih lanjut.

---

**Happy Testing! 🧪✨**
