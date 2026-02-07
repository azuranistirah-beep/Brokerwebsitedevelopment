# 🔧 FIX: Invalid Login Credentials - Investoft Platform

## ❌ Error yang Terjadi
```
Supabase auth error: Invalid login credentials
```

## 🔍 Penyebab Umum

1. **Admin belum dibuat** - Pertama kali setup
2. **Member pending approval** - User baru belum di-approve admin
3. **Password salah** - Typo saat input
4. **User tidak ada di Supabase Auth** - Data tidak tersync

---

## ✅ SOLUSI LENGKAP

### 🎯 **UNTUK ADMIN** (Pertama Kali Setup)

#### Step 1: Akses Admin Setup Page

1. **Buka aplikasi Investoft**
2. **Scroll ke footer** (bagian paling bawah halaman)
3. **Klik titik (.) setelah kata "Investoft"** di footer
   - Ini adalah hidden admin access
   - Akan muncul AdminSetupPage

#### Step 2: Create Admin Account

Di AdminSetupPage, gunakan default credentials atau custom:

**Default Credentials:**
```
Email: admin@investoft.com
Password: Admin123456
Name: Super Admin
```

**Atau buat custom:**
```
Email: [your-email]
Password: [your-password] (minimal 6 karakter)
Name: [your-name]
```

#### Step 3: Klik "Create Admin Account"

- System akan create admin di Supabase Auth
- Admin akan **auto-active** (tidak perlu approval)
- System akan auto-login setelah berhasil

#### Step 4: Jika Muncul "Admin sudah pernah dibuat"

Berarti admin sudah ada, klik tab **"Login"** di bawah dan login dengan credentials yang sudah dibuat.

---

### 👤 **UNTUK MEMBER** (User Biasa)

#### Kenapa Member Tidak Bisa Login?

Member yang baru sign up memiliki status **"pending"** dan harus di-approve admin terlebih dahulu.

#### Cara Member Sign Up:

1. Klik tombol **"Sign Up"** di homepage
2. Isi form:
   ```
   Email: your@email.com
   Password: YourPassword123
   Name: Your Name
   ```
3. Klik **"Sign Up"**
4. **TUNGGU APPROVAL dari Admin**

#### Cara Admin Approve Member:

1. **Login sebagai admin**
2. **Buka Admin Panel** > **Members Management**
3. **Lihat list "Pending Members"**
4. **Klik "Approve"** pada member yang ingin di-approve
5. **Member sekarang bisa login!**

---

## 🐛 TROUBLESHOOTING ADVANCED

### Problem 1: Admin Sudah Dibuat Tapi Lupa Password

**Solusi: Reset Password via Supabase Dashboard**

1. **Buka Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/nvocyxqxlxqxdzioxgrw

2. **Pergi ke Authentication > Users**

3. **Cari user dengan email admin** (misal: admin@investoft.com)

4. **Klik user** > **Reset Password**

5. **Set password baru**

6. **Login dengan password baru**

---

### Problem 2: "Invalid login credentials" Padahal Password Benar

**Kemungkinan: Email belum ter-confirm**

**Solusi A: Via Edge Function (Automatic)**
Edge function sudah set `email_confirm: true`, jadi seharusnya otomatis.

**Solusi B: Manual Confirm di Dashboard**

1. **Supabase Dashboard** > **Authentication** > **Users**
2. **Cari user yang error**
3. **Pastikan kolom "Confirmed At" terisi**
4. **Jika kosong**, klik user > klik **"Confirm Email"**

---

### Problem 3: Member Login Tapi Ditolak Masuk Dashboard

**Penyebab: Status masih "pending"**

**Cara Check Status:**

1. **Login sebagai admin**
2. **Admin Panel** > **Members Management**
3. **Cari member** di list "Pending Members"
4. **Klik "Approve"**

**Atau via Supabase Dashboard:**

1. **Supabase Dashboard** > **Table Editor**
2. **Cari key** yang dimulai dengan `user:[user-id]`
3. **Check field `status`**:
   - `pending` = Belum approved ❌
   - `active` = Sudah approved ✅
   - `rejected` = Ditolak ❌

---

## 🧪 TEST LOGIN CREDENTIALS

### Cara Test Apakah User Exists:

1. **Buka Browser Console** (F12)

2. **Run script ini:**

```javascript
// Test if user exists in Supabase Auth
const testLogin = async (email, password) => {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabase = createClient(
    'https://nvocyxqxlxqxdzioxgrw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52b2N5eHF4bHhxeGR6aW94Z3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTEwNDEsImV4cCI6MjA4NTk4NzA0MX0.sX2W4mtOsHsVBBeLdcSSQAwrjKmvYwvRTq5aHBqJRpc'
  );
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
  
  if (error) {
    console.error('❌ Login failed:', error.message);
  } else {
    console.log('✅ Login successful!');
    console.log('User:', data.user);
    console.log('Session:', data.session);
  }
};

// Test with your credentials
testLogin('admin@investoft.com', 'Admin123456');
```

---

## 📋 CHECKLIST DEBUGGING

Jika masih error, check list ini:

- [ ] **Edge Functions deployed?** - Check di Supabase Dashboard > Edge Functions
- [ ] **User exists?** - Check di Authentication > Users
- [ ] **Email confirmed?** - Check "Confirmed At" column tidak kosong
- [ ] **Password benar?** - Coba reset password
- [ ] **Member approved?** - Check status = "active" (bukan "pending")
- [ ] **Network error?** - Check browser console untuk error network
- [ ] **CORS issue?** - Check Edge Functions logs

---

## 🎯 QUICK FIX SUMMARY

### Untuk Admin (Pertama Kali):
1. Klik titik (.) setelah "Investoft" di footer
2. Create admin account
3. Login

### Untuk Member:
1. Sign up
2. Tunggu admin approve
3. Login setelah di-approve

### Lupa Password:
1. Buka Supabase Dashboard
2. Authentication > Users
3. Reset password

---

## 🔧 MANUAL FIX: Create Admin via Supabase Dashboard

Jika AdminSetupPage tidak bekerja, create manual:

1. **Supabase Dashboard** > **Authentication** > **Users**
2. **Klik "Add User"**
3. **Fill form:**
   ```
   Email: admin@investoft.com
   Password: Admin123456
   Auto Confirm User: ✅ (PENTING!)
   ```
4. **Click "Create User"**
5. **Copy User ID** yang baru dibuat
6. **Table Editor** > **Select "kv_store_20da1dab" table**
7. **Insert Row:**
   ```
   key: user:[user-id-yang-dicopy]
   value: {
     "id": "[user-id]",
     "email": "admin@investoft.com",
     "name": "Super Admin",
     "role": "admin",
     "status": "active",
     "balance": 10000,
     "createdAt": "2026-02-07T00:00:00.000Z"
   }
   ```
8. **Save**
9. **Sekarang bisa login!**

---

## 📞 Still Need Help?

Jika masih error setelah semua solusi di atas:

1. **Screenshot error message** (full console log)
2. **Check Supabase Edge Functions logs**:
   - Dashboard > Edge Functions > make-server > Logs
3. **Check browser console** (F12) untuk detailed error

---

**Last Updated**: February 2026  
**Platform**: Investoft Trading Platform  
**Auth Provider**: Supabase Auth
