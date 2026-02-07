# 🔧 FIX: Invalid Login Credentials

## ❌ PROBLEM
Error: `AuthApiError: Invalid login credentials`

**Penyebab:**
- Admin account belum berhasil dibuat di database
- SQL mungkin tidak berjalan sempurna
- Ada conflict atau error saat insert

---

## ✅ SOLUSI LENGKAP

### **STEP 1: VERIFY - Cek Apakah Admin Sudah Ada**

Jalankan SQL ini untuk cek:

```sql
-- Check auth users
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'admin@investoft.com';
```

**Hasil yang diharapkan:**
```
| id            | email                | email_confirmed_at | created_at |
|---------------|----------------------|-------------------|------------|
| 22222222-...  | admin@investoft.com  | (timestamp)       | (timestamp)|
```

**Jika TIDAK ADA hasil:**
→ Admin belum dibuat, lanjut ke STEP 2

**Jika ADA hasil tapi email_confirmed_at NULL:**
→ Email belum confirmed, lanjut ke STEP 3

---

### **STEP 2: CREATE ADMIN (Versi yang Pasti Work)**

Copy-paste SQL ini **SATU PER SATU** (jangan sekaligus):

#### **2a. Delete existing (kalau ada yang corrupt):**

```sql
-- Clean up any existing corrupt data
DELETE FROM kv_store_20da1dab WHERE key = 'user:22222222-2222-2222-2222-222222222222';
DELETE FROM auth.users WHERE email = 'admin@investoft.com';
```

#### **2b. Create auth user:**

```sql
-- Create admin in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'admin@investoft.com',
  crypt('AdminPass123!', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Super Admin"}'::jsonb,
  false,
  null
);
```

**Klik RUN** → Harus muncul "Success"

#### **2c. Create KV Store profile:**

```sql
-- Create admin profile in KV Store
INSERT INTO kv_store_20da1dab (key, value)
VALUES (
  'user:22222222-2222-2222-2222-222222222222',
  '{"id":"22222222-2222-2222-2222-222222222222","email":"admin@investoft.com","name":"Super Admin","balance":50000,"createdAt":"'||now()::text||'","role":"admin"}'::jsonb
);
```

**Klik RUN** → Harus muncul "Success"

---

### **STEP 3: VERIFY - Cek Lagi Setelah Create**

```sql
-- Verify auth user
SELECT 
  id, 
  email, 
  email_confirmed_at IS NOT NULL as email_confirmed,
  raw_user_meta_data->>'name' as name
FROM auth.users 
WHERE email = 'admin@investoft.com';
```

**Expected:**
- ✅ `email_confirmed` = `true`
- ✅ `name` = `Super Admin`

```sql
-- Verify KV Store
SELECT key, value 
FROM kv_store_20da1dab 
WHERE key = 'user:22222222-2222-2222-2222-222222222222';
```

**Expected:**
- ✅ `role` = `"admin"`
- ✅ `email` = `"admin@investoft.com"`

---

### **STEP 4: TRY LOGIN**

1. **Buka aplikasi:** http://localhost:5173
2. **Klik "Log In"**
3. **Masukkan:**
   ```
   Email: admin@investoft.com
   Password: AdminPass123!
   ```
4. **Klik "Sign In"**

**Jika masih error, lanjut ke Alternative Solution!**

---

## 🆘 ALTERNATIVE SOLUTION (Kalau masih error)

### **CARA 2: Buat dengan Email & Password Berbeda**

Ganti email dan password dengan yang baru:

```sql
-- Delete old attempts
DELETE FROM kv_store_20da1dab WHERE value::jsonb->>'email' = 'myadmin@test.com';
DELETE FROM auth.users WHERE email = 'myadmin@test.com';

-- Create with new credentials
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, 
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'myadmin@test.com',
  crypt('MyPassword123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"My Admin"}'::jsonb
)
RETURNING id;
```

**Copy ID yang muncul dari hasil RETURNING**, lalu:

```sql
-- Replace YOUR_ID_HERE with the ID from above
INSERT INTO kv_store_20da1dab (key, value)
VALUES (
  'user:YOUR_ID_HERE',
  jsonb_build_object(
    'id', 'YOUR_ID_HERE',
    'email', 'myadmin@test.com',
    'name', 'My Admin',
    'balance', 50000,
    'createdAt', now()::text,
    'role', 'admin'
  )
);
```

**Login dengan:**
```
Email: myadmin@test.com
Password: MyPassword123!
```

---

## 🆘 CARA 3: Via Sign Up UI + Promote

Kalau SQL terus error, pakai cara ini (100% pasti work):

### **3a. Sign Up via Website**

1. **Buka aplikasi:** http://localhost:5173
2. **Klik "Sign Up"** (pojok kanan atas)
3. **Isi form:**
   ```
   Name: Test Admin
   Email: testadmin@gmail.com
   Password: testadmin123
   ```
4. **Klik "Sign Up"**
5. **Tunggu sampai auto-login** → Anda masuk Member Dashboard

### **3b. Get User ID**

```sql
-- Get your user ID
SELECT id, email, raw_user_meta_data->>'name' as name
FROM auth.users
WHERE email = 'testadmin@gmail.com';
```

**Copy ID yang muncul** (contoh: `abc123-def456-...`)

### **3c. Promote to Admin**

```sql
-- Replace YOUR_USER_ID with the actual ID from above
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:YOUR_USER_ID';

-- Example if your ID is abc123-def456-789:
-- UPDATE kv_store_20da1dab
-- SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
-- WHERE key = 'user:abc123-def456-789';
```

### **3d. Logout & Login Lagi**

1. **Di app, klik "Logout"**
2. **Klik "Log In"**
3. **Masukkan:**
   ```
   Email: testadmin@gmail.com
   Password: testadmin123
   ```
4. **Klik "Sign In"**

**BOOM!** 🎉 Admin Panel!

---

## 🔍 TROUBLESHOOTING CHECKLIST

### **Check 1: Apakah Edge Functions Running?**

```bash
# Check if server is running
curl https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab/profile
```

**Expected:** Some response (bukan 404)

### **Check 2: Apakah Extension pgcrypto Active?**

```sql
-- Enable pgcrypto extension (for crypt function)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### **Check 3: List Semua Users**

```sql
-- See all users
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'name' as name,
  kv.value::jsonb->>'role' as role
FROM auth.users au
LEFT JOIN kv_store_20da1dab kv ON kv.key = 'user:' || au.id
ORDER BY au.created_at DESC
LIMIT 10;
```

### **Check 4: Browser Console Errors**

1. Buka browser Dev Tools (F12)
2. Tab "Console"
3. Try login lagi
4. Screenshot error yang muncul

---

## 💡 QUICK FIX (Copy-Paste All at Once)

Kalau mau cepat, copy-paste semua ini sekaligus:

```sql
-- Complete admin setup (all in one)
DO $$
DECLARE
  new_user_id uuid := '33333333-3333-3333-3333-333333333333';
BEGIN
  -- Clean up
  DELETE FROM kv_store_20da1dab WHERE key = 'user:' || new_user_id;
  DELETE FROM auth.users WHERE id = new_user_id;
  
  -- Create auth user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'superadmin@investoft.com',
    crypt('SuperAdmin123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Super Admin"}'::jsonb
  );
  
  -- Create KV profile
  INSERT INTO kv_store_20da1dab (key, value)
  VALUES (
    'user:' || new_user_id,
    jsonb_build_object(
      'id', new_user_id::text,
      'email', 'superadmin@investoft.com',
      'name', 'Super Admin',
      'balance', 100000,
      'createdAt', now()::text,
      'role', 'admin'
    )
  );
  
  RAISE NOTICE 'Admin created successfully!';
END $$;
```

**Login dengan:**
```
Email: superadmin@investoft.com
Password: SuperAdmin123!
```

---

## ✅ VERIFICATION FINAL

Setelah berhasil create, verify dengan:

```sql
-- Final check
SELECT 
  'Auth User' as source,
  email,
  email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
WHERE email IN ('admin@investoft.com', 'superadmin@investoft.com', 'myadmin@test.com')
UNION ALL
SELECT 
  'KV Store' as source,
  value::jsonb->>'email' as email,
  (value::jsonb->>'role' = 'admin') as confirmed
FROM kv_store_20da1dab
WHERE value::jsonb->>'role' = 'admin';
```

**Expected:** 2 rows (1 from auth, 1 from KV) dengan `confirmed = true`

---

## 📞 MASIH ERROR?

**Kalau masih error setelah semua cara di atas:**

1. **Screenshot error message** di browser console
2. **Screenshot hasil query** verify di atas
3. **Tanya saya lagi** dengan screenshot tersebut

Saya akan bantu debug lebih lanjut! 🚀

---

**Good luck!** 💪
