# 🎯 QUICK SOLUTION: Invalid Login Credentials

## ❌ Problem
```
Supabase auth error: Invalid login credentials
```

## ✅ FASTEST FIX (3 Steps - 2 Minutes)

### UNTUK ADMIN (Setup Pertama Kali):

#### Step 1: Buka Admin Setup Page
1. **Scroll ke footer** aplikasi Investoft (paling bawah)
2. **Klik titik (.)** setelah kata "Investoft"
3. AdminSetupPage akan muncul

#### Step 2: Create Admin Account
Gunakan default credentials ini:
```
Email: admin@investoft.com
Password: Admin123456  
Name: Super Admin
```

Atau buat custom dengan minimal:
- Email valid
- Password minimal 6 karakter
- Name tidak boleh kosong

#### Step 3: Klik "Create Admin Account"
- Tunggu proses selesai
- System akan auto-login
- Anda langsung masuk ke Admin Panel ✅

---

### UNTUK MEMBER (User Biasa):

#### Problem: Member Tidak Bisa Login Setelah Sign Up?

**Penyebab**: Member baru memiliki status **"pending"** dan harus di-approve admin dulu!

#### Cara Approve Member:

**Admin Login > Admin Panel > Members Management**

1. Lihat section "Pending Members"
2. Find member yang mau di-approve
3. Klik tombol **"Approve"** (hijau)
4. Member sekarang bisa login! ✅

---

## 🔧 TROUBLESHOOTING

### Error: "Admin sudah pernah dibuat"

**Solusi**: Admin sudah ada, langsung login!

1. Di AdminSetupPage, klik tab **"Login"**
2. Masukkan email & password yang pernah dibuat
3. Login

### Error: Lupa Password Admin

**Solusi**: Reset via Supabase Dashboard

1. Buka: https://supabase.com/dashboard/project/nvocyxqxlxqxdzioxgrw
2. **Authentication > Users**
3. Cari user dengan email admin
4. Klik user > **Reset Password**
5. Set password baru
6. Login dengan password baru

### Error: Member Sudah Approved Tapi Masih Tidak Bisa Login

**Solusi**: Check status manual

1. **Admin Panel** > **Members Management**
2. Cari member di list
3. Pastikan badge status = **"Active"** (hijau)
4. Jika masih "Pending", approve lagi
5. Jika member lupa password, minta member untuk reset

---

## 🧪 DIAGNOSTIC TOOL

Jika masih bingung, gunakan Auth Diagnostic Tool:

```typescript
// Add to App.tsx for testing:
import { AuthDiagnostic } from './components/AuthDiagnostic';

// Show AuthDiagnostic instead of main app temporarily
<AuthDiagnostic />
```

Tool ini akan check:
- ✅ Apakah user exists di Supabase Auth
- ✅ Apakah profile ada di backend
- ✅ Apakah Edge Functions running
- ✅ Status user (pending/active/rejected)

---

## 📋 CHECKLIST

Untuk memastikan login berhasil:

**Untuk Admin:**
- [ ] AdminSetupPage accessible (klik titik di footer)
- [ ] Create admin dengan credentials lengkap
- [ ] Auto-login setelah create berhasil

**Untuk Member:**
- [ ] Sign up berhasil
- [ ] Admin sudah approve (status = "active")
- [ ] Login dengan email & password yang correct

**Jika Masih Error:**
- [ ] Check browser console (F12) untuk detailed error
- [ ] Check Supabase Dashboard > Authentication > Users
- [ ] Check Edge Functions logs
- [ ] Verify user status di Admin Panel

---

## 🚨 LAST RESORT: Manual Create Admin

Jika AdminSetupPage tidak work:

1. **Supabase Dashboard** > **Authentication** > **Users**
2. **Add User**:
   ```
   Email: admin@investoft.com
   Password: Admin123456
   Auto Confirm User: ✅ PENTING!
   ```
3. **Copy User ID** yang baru dibuat
4. **Table Editor** > Select table **"kv_store_20da1dab"**
5. **Insert Row**:
   ```json
   {
     "key": "user:[paste-user-id-here]",
     "value": {
       "id": "[paste-user-id-here]",
       "email": "admin@investoft.com",
       "name": "Super Admin",
       "role": "admin",
       "status": "active",
       "balance": 10000,
       "createdAt": "2026-02-07T00:00:00.000Z"
     }
   }
   ```
6. Save
7. Login di aplikasi ✅

---

## 📞 Files & Resources

- **Full troubleshooting**: `/FIX_INVALID_LOGIN.md`
- **Diagnostic component**: `/src/app/components/AuthDiagnostic.tsx`
- **Edge Functions**: `/supabase/functions/server/index.tsx`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/nvocyxqxlxqxdzioxgrw

---

**Platform**: Investoft Trading Platform  
**Last Updated**: February 2026
