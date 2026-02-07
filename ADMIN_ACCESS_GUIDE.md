# 🔐 ADMIN ACCESS GUIDE - Investoft Platform

## 🎯 **CARA AKSES ADMIN PANEL (HIDDEN LOGIN)**

Admin Panel di Investoft **TERSEMBUNYI** dan hanya bisa diakses dengan cara khusus:

### **📍 LOKASI: Footer Website (Titik Setelah "Investoft")**

```
© 2026 Investoft. All rights reserved.
               ↑
           KLIK TITIK INI!
```

**Cara Akses:**

1. **Scroll ke bawah** sampai ke footer website
2. **Cari teks:** "© 2026 Investoft. All rights reserved."
3. **Klik TITIK (.)** yang ada **setelah kata "Investoft"**
4. **Modal Admin Login** akan muncul dengan tampilan merah (berbeda dari member login)
5. **Masukkan email dan password admin**
6. **Klik "Login as Admin"**
7. **✅ Masuk ke Admin Panel!**

---

## 🔧 **CARA CREATE ADMIN ACCOUNT (PERTAMA KALI)**

### **STEP 1: Create Table di Supabase**

Buka **Supabase SQL Editor** dan jalankan:

```sql
-- Create kv_store table
CREATE TABLE IF NOT EXISTS kv_store_20da1dab (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kv_store_value ON kv_store_20da1dab USING GIN (value);
```

---

### **STEP 2: Create Admin via Browser Console**

1. **Buka website Investoft:** http://localhost:5173

2. **Tekan F12** (Developer Tools)

3. **Pilih tab "Console"**

4. **Copy-paste kode JavaScript ini:**

```javascript
fetch('https://fwzrhkclhstobppnuxfz.supabase.co/functions/v1/make-server-20da1dab/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3enJoa2NsaHN0b2JwcG51eGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MjkzMzcsImV4cCI6MjA1MjIwNTMzN30.y2OqhBi4_daBSZz_FS51PabI_z9y9D17jbPF44MxXoc'
  },
  body: JSON.stringify({
    email: 'admin@investoft.com',
    password: 'Admin123456',
    name: 'Super Admin',
    role: 'admin'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ RESULT:', data);
  if (data.success) {
    console.log('🎉 ADMIN CREATED! LOGIN DENGAN:');
    console.log('Email: admin@investoft.com');
    console.log('Password: Admin123456');
  } else {
    console.error('❌ ERROR:', data.error);
  }
})
.catch(err => console.error('❌ FETCH ERROR:', err));
```

5. **Tekan ENTER**

6. **Tunggu response**

**Expected Output:**
```
✅ RESULT: {success: true, user: {...}}
🎉 ADMIN CREATED! LOGIN DENGAN:
Email: admin@investoft.com
Password: Admin123456
```

---

### **STEP 3: Login ke Admin Panel**

1. **Scroll ke footer**
2. **Klik titik** setelah "Investoft."
3. **Masukkan:**
   - Email: `admin@investoft.com`
   - Password: `Admin123456`
4. **Klik "Login as Admin"**
5. **🎉 Berhasil masuk ke Admin Panel!**

---

## 🎨 **PERBEDAAN ADMIN LOGIN vs MEMBER LOGIN**

| Feature | Member Login | Admin Login |
|---------|-------------|-------------|
| **Lokasi** | Header (Button "Log In") | Footer (Hidden dot) |
| **Warna** | Blue theme | Red theme 🔴 |
| **Icon** | Lock biasa | Lock dengan background merah |
| **Title** | "Welcome Back" | "Admin Access" |
| **Akses** | Public | Hidden/Secret |
| **Verifikasi** | Normal | Cek role = admin |
| **Warning** | - | "Restricted area" |

---

## 🔍 **VERIFY ADMIN SUDAH DIBUAT**

Di Supabase SQL Editor, jalankan:

```sql
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as confirmed,
  kv.value::jsonb->>'name' as name,
  kv.value::jsonb->>'role' as role,
  kv.value::jsonb->>'balance' as balance
FROM auth.users au
LEFT JOIN kv_store_20da1dab kv ON kv.key = 'user:' || au.id::text
WHERE au.email = 'admin@investoft.com';
```

**Expected Result:**
```
| id       | email                  | confirmed | name        | role  | balance |
|----------|------------------------|-----------|-------------|-------|---------|
| abc123.. | admin@investoft.com    | true      | Super Admin | admin | 10000   |
```

✅ **Kalau hasil seperti ini, admin sudah siap digunakan!**

---

## 🛡️ **SECURITY FEATURES**

1. **Hidden Access Point** - Titik di footer tidak terlihat jelas sebagai button
2. **Role Verification** - Login ditolak jika user bukan admin
3. **Auto Logout** - Admin yang login di member modal akan di-logout
4. **Red Theme** - Membedakan dengan jelas dari member area
5. **Access Denied Message** - Member tidak bisa akses admin panel

---

## ❓ **TROUBLESHOOTING**

### **Problem: "Invalid login credentials"**

**Solution:**
```sql
-- Reset password admin
UPDATE auth.users
SET encrypted_password = crypt('Admin123456', gen_salt('bf'))
WHERE email = 'admin@investoft.com';
```

### **Problem: "Access denied - Admin privileges required"**

**Solution:**
```sql
-- Pastikan role = admin
SELECT id FROM auth.users WHERE email = 'admin@investoft.com';
-- Copy ID yang muncul, lalu:
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:PASTE_USER_ID_DISINI';
```

### **Problem: Titik di footer tidak bisa diklik**

**Solution:**
- Refresh halaman (Ctrl+R atau Cmd+R)
- Clear browser cache
- Pastikan JavaScript enabled
- Coba browser lain (Chrome/Firefox/Edge)

### **Problem: "Email already exists"**

**Solution:**
Admin sudah pernah dibuat. Langsung login saja atau reset password dengan SQL di atas.

---

## 📋 **ADMIN CREDENTIALS (DEFAULT)**

```
Email: admin@investoft.com
Password: Admin123456
```

**⚠️ PENTING:** Ganti password setelah first login!

---

## 🔐 **BEST PRACTICES**

1. **Jangan share** credentials admin ke siapapun
2. **Ganti password** default setelah setup
3. **Jangan tambahkan** link/button admin di UI public
4. **Monitor** admin activities via logs
5. **Backup** database secara regular
6. **Gunakan email perusahaan** untuk admin account

---

## 🚀 **ADMIN PANEL FEATURES**

Setelah login, admin akan punya akses ke:

- ✅ **Overview Dashboard** - Statistics & Analytics
- ✅ **Members Management** - View/Edit/Suspend users
- ✅ **KYC Verification** - Approve/Reject documents
- ✅ **Withdrawals Management** - Process withdrawal requests
- ✅ **Deposits Management** - Monitor deposits
- ✅ **Trading Management** - Monitor all trades
- ✅ **Assets Configuration** - Add/Edit trading assets
- ✅ **System Settings** - Platform configuration

---

## 📞 **SUPPORT**

Kalau masih ada masalah setelah mengikuti guide ini, hubungi developer atau check console browser (F12) untuk error details.

**Happy Admin-ing!** 🎉
