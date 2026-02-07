# 🔧 FIX: CARA BUAT ADMIN ACCOUNT YANG BENAR

## ❌ KENAPA SQL GAGAL?

Error yang anda lihat:
```
ERROR: 42P01: relation "public.users" does not exist
```

**Penyebab:** Platform Investoft **TIDAK menggunakan table `public.users`**!  
Platform ini menggunakan **KV Store** (key-value storage) untuk menyimpan user data.

---

## ✅ SOLUSI: 2 CARA BUAT ADMIN ACCOUNT

---

### **CARA 1: VIA SIGNUP UI (RECOMMENDED - PALING MUDAH)** 🚀

Ini cara paling simple dan aman:

#### **Step 1: Sign Up via UI**

1. Buka aplikasi Investoft di browser
2. Klik **"Sign Up"** button
3. Isi form:
   ```
   Name: Admin Test
   Email: admin@test.com
   Password: admin123
   ```
4. Klik **"Sign Up"**
5. Anda akan otomatis login sebagai **member**

#### **Step 2: Promote ke Admin via KV Store**

Sekarang kita perlu ubah role dari "member" jadi "admin":

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih project Investoft**
3. **Klik "SQL Editor"** di sidebar
4. **Copy-paste SQL ini:**

```sql
-- STEP 1: Get your user ID
-- Replace 'admin@test.com' with your actual email
SELECT 
    au.id as user_id,
    au.email,
    au.raw_user_meta_data->>'name' as name
FROM auth.users au
WHERE au.email = 'admin@test.com';
```

5. **Run query** → Catat **user_id** yang muncul (contoh: `abc123-def456-...`)

6. **Sekarang update role via KV Store**:

```sql
-- STEP 2: Update role to admin in KV Store
-- Replace 'YOUR_USER_ID_HERE' with the actual user_id from step 1
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:YOUR_USER_ID_HERE';

-- Example (if your user_id is abc123-def456-789):
-- UPDATE kv_store_20da1dab
-- SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
-- WHERE key = 'user:abc123-def456-789';
```

7. **Run query** → Success! ✅

#### **Step 3: Logout dan Login Lagi**

1. Di aplikasi, **logout** dari current session
2. **Login lagi** dengan:
   ```
   Email: admin@test.com
   Password: admin123
   ```
3. **BOOM!** 🎉 Anda masuk ke **Admin Panel**

---

### **CARA 2: VIA SQL DIRECT (ADVANCED)** 🛠️

Cara ini lebih manual tapi faster kalau anda familiar dengan SQL:

#### **Step 1: Create Auth User**

```sql
-- Create admin user in Supabase Auth
INSERT INTO auth.users (
  instance_id, 
  id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at, 
  raw_user_meta_data
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 
  'authenticated',
  'admin@investoft.com',
  crypt('AdminPass123!', gen_salt('bf')),
  now(), 
  now(), 
  now(), 
  '{"name": "Super Admin"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
```

#### **Step 2: Create User Profile in KV Store**

```sql
-- Store admin profile in KV Store
INSERT INTO kv_store_20da1dab (key, value)
VALUES (
  'user:22222222-2222-2222-2222-222222222222',
  jsonb_build_object(
    'id', '22222222-2222-2222-2222-222222222222',
    'email', 'admin@investoft.com',
    'name', 'Super Admin',
    'balance', 50000,
    'createdAt', now()::text,
    'role', 'admin'
  )
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;
```

#### **Step 3: Login**

1. Buka aplikasi → Klik **"Log In"**
2. Masukkan:
   ```
   Email: admin@investoft.com
   Password: AdminPass123!
   ```
3. **Login** → Masuk ke **Admin Panel** ✅

---

## 🔍 VERIFY ADMIN ACCOUNT

### **Check via SQL:**

```sql
-- 1. Check auth user exists
SELECT id, email, email_confirmed_at, raw_user_meta_data
FROM auth.users
WHERE email = 'admin@test.com';

-- 2. Check KV Store has admin role
SELECT key, value
FROM kv_store_20da1dab
WHERE key LIKE 'user:%'
AND value::jsonb->>'email' = 'admin@test.com';

-- Should show: role = "admin"
```

### **Check via Table Editor:**

1. Supabase → **Table Editor**
2. Select table: **kv_store_20da1dab**
3. Filter where `key` contains `user:`
4. Find your user row
5. Expand `value` column → Check `role` = `"admin"`

---

## 🎯 QUICK REFERENCE

### **Cara 1 (UI + SQL):**
```
1. Sign Up via UI → member created
2. SQL: Get user_id
3. SQL: UPDATE kv_store role to "admin"
4. Logout → Login → Admin Panel ✅
```

### **Cara 2 (Pure SQL):**
```
1. SQL: INSERT INTO auth.users
2. SQL: INSERT INTO kv_store_20da1dab
3. Login → Admin Panel ✅
```

---

## ⚠️ TROUBLESHOOTING

### **Problem: "Login berhasil tapi masuk Member Dashboard"**

**Penyebab:** Role di KV Store masih "member"

**Fix:**
```sql
-- Find your user
SELECT key, value FROM kv_store_20da1dab WHERE value::jsonb->>'email' = 'your@email.com';

-- Update role (replace USER_ID with actual id)
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:USER_ID';
```

### **Problem: "User not found in KV Store"**

**Penyebab:** Account dibuat manual di auth.users tapi belum ada di KV Store

**Fix:**
```sql
-- Get user ID from auth
SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Insert to KV Store (replace USER_ID)
INSERT INTO kv_store_20da1dab (key, value)
VALUES (
  'user:USER_ID',
  jsonb_build_object(
    'id', 'USER_ID',
    'email', 'your@email.com',
    'name', 'Your Name',
    'balance', 10000,
    'createdAt', now()::text,
    'role', 'admin'
  )
);
```

### **Problem: "Cannot find user_id"**

**Fix:**
```sql
-- List all auth users
SELECT id, email, raw_user_meta_data->>'name' as name
FROM auth.users
ORDER BY created_at DESC;
```

---

## 🎉 SUCCESS CHECKLIST

Setelah setup, verify dengan:

- [ ] ✅ User exists di `auth.users` table
- [ ] ✅ User exists di `kv_store_20da1dab` dengan prefix `user:`
- [ ] ✅ Role di KV Store = `"admin"` (lowercase, dengan quotes!)
- [ ] ✅ Login berhasil
- [ ] ✅ Redirect ke Admin Dashboard (bukan Member Dashboard)
- [ ] ✅ Sidebar kiri muncul dengan 11 menu items
- [ ] ✅ Topbar muncul dengan search, notifications, profile

---

## 📚 NEXT STEPS

Setelah admin account ready:

1. **Explore Admin Panel:**
   - Overview → Stats & queues
   - Members → Manage users
   - KYC → Review documents
   - Withdrawals → Process requests

2. **Create Test Member:**
   - Sign up dengan email lain
   - Test member dashboard
   - Test trading features

3. **Test Admin Functions:**
   - Approve member
   - Review KYC
   - Process withdrawal

---

**Ready to proceed!** 🚀

Pilih **Cara 1** (recommended) atau **Cara 2** (advanced) dan follow step-by-step.

Kalau ada masalah, check Troubleshooting section! 😊
