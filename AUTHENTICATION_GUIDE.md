# 🔐 INVESTOFT - Authentication & Access Guide

## Platform Authentication System

Investoft menggunakan **Supabase Authentication** dengan role-based access control (member vs admin).

---

## 📋 CARA LOGIN KE PLATFORM

### **1️⃣ LOGIN SEBAGAI MEMBER (Regular User)**

#### **Opsi A: Create New Account**
1. Buka aplikasi Investoft
2. Klik tombol **"Sign Up"** atau **"Get Started"** di homepage
3. Isi form registrasi:
   - **Name**: Nama lengkap anda
   - **Email**: Email valid (contoh: `member@investoft.com`)
   - **Password**: Minimal 6 karakter (contoh: `member123`)
4. Klik **"Sign Up"**
5. Otomatis login dan redirect ke **Member Dashboard**

#### **Opsi B: Test Account (Demo)**
Jika sudah ada test account di database:
```
Email: member@investoft.com
Password: member123
```

**Akses Member Dashboard:**
- Real-time trading charts (TradingView)
- Demo trading account ($10,000 virtual balance)
- Trading history & statistics
- Live market news
- Popular assets monitoring

---

### **2️⃣ LOGIN SEBAGAI ADMIN**

#### **Cara 1: Promote Existing User ke Admin (Via Database)**

**STEP-BY-STEP:**

1. **Login ke Supabase Dashboard:**
   ```
   URL: https://supabase.com/dashboard
   Login dengan akun Supabase anda
   ```

2. **Pilih Project:**
   ```
   Project ID: ourtzdfyqpytfojlquff
   Project Name: [Your Investoft Project]
   ```

3. **Buka Table Editor:**
   ```
   Sidebar → Table Editor → "users" table
   ```

4. **Find User & Update Role:**
   - Cari user yang ingin dijadikan admin (by email)
   - Edit row tersebut
   - Ubah column `role` dari `"member"` menjadi `"admin"`
   - Save changes

5. **Logout & Login Kembali:**
   - User tersebut logout dari aplikasi
   - Login kembali dengan credentials yang sama
   - Otomatis redirect ke **Admin Dashboard**

#### **Cara 2: Create Admin via SQL (Recommended)**

1. **Buka SQL Editor di Supabase:**
   ```
   Sidebar → SQL Editor → New Query
   ```

2. **Create Admin User:**
   ```sql
   -- Create admin user in auth.users (Supabase Auth)
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
     raw_user_meta_data,
     confirmation_token
   )
   VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'admin@investoft.com',
     crypt('admin123', gen_salt('bf')), -- Password: admin123
     now(),
     now(),
     now(),
     '{"name": "Admin User"}',
     ''
   )
   RETURNING id;

   -- Then create profile in users table with admin role
   INSERT INTO public.users (id, email, name, role, created_at)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@investoft.com'),
     'admin@investoft.com',
     'Admin User',
     'admin', -- ✅ IMPORTANT: Set role to 'admin'
     now()
   );
   ```

3. **Login dengan Admin Credentials:**
   ```
   Email: admin@investoft.com
   Password: admin123
   ```

---

## 🎯 PERBEDAAN AKSES

### **Member Dashboard** (`role = "member"`)
✅ View trading charts  
✅ Execute demo trades  
✅ View trading history  
✅ View market news  
✅ Manage personal account  
❌ Cannot access admin panel  

### **Admin Dashboard** (`role = "admin"`)
✅ All member features  
✅ View all users  
✅ Manage user accounts  
✅ View platform statistics  
✅ Manage platform settings  
✅ Monitor all trades  

---

## 🔧 TROUBLESHOOTING

### **Problem: "Login failed: Invalid login credentials"**
**Solution:**
1. Check email & password spelling
2. Verify user exists in `auth.users` table
3. Check if email is confirmed (`email_confirmed_at` is not null)

### **Problem: "Logged in but role is null"**
**Solution:**
1. Check if user exists in `public.users` table
2. Verify `role` column has value ('member' or 'admin')
3. Logout and login again

### **Problem: "Admin account doesn't redirect to admin panel"**
**Solution:**
1. Verify `role = 'admin'` in `public.users` table (case-sensitive!)
2. Clear browser cache & cookies
3. Logout completely and login again

### **Problem: "Cannot access Edge Functions"**
**Solution:**
1. Check if Edge Functions are deployed in Supabase
2. Verify function name: `make-server-20da1dab`
3. Check if `publicAnonKey` is correct in `/utils/supabase/info.tsx`

---

## 📊 DATABASE STRUCTURE

### **Table: `auth.users` (Supabase Auth)**
Managed by Supabase Authentication system.

### **Table: `public.users` (Your App)**
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member', -- 'member' or 'admin'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🚀 QUICK START - TEST ACCOUNTS

### **Option 1: Manual SQL Setup**
Run this SQL in Supabase SQL Editor to create both test accounts:

```sql
-- Create Member Account
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'member@investoft.com',
  crypt('member123', gen_salt('bf')),
  now(), now(), now(),
  '{"name": "Demo Member"}'
);

INSERT INTO public.users (id, email, name, role, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'member@investoft.com',
  'Demo Member',
  'member',
  now()
);

-- Create Admin Account
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'admin@investoft.com',
  crypt('admin123', gen_salt('bf')),
  now(), now(), now(),
  '{"name": "Platform Admin"}'
);

INSERT INTO public.users (id, email, name, role, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin@investoft.com',
  'Platform Admin',
  'admin',
  now()
);
```

**Test Credentials:**
```
Member:
- Email: member@investoft.com
- Password: member123

Admin:
- Email: admin@investoft.com
- Password: admin123
```

### **Option 2: Via Signup Form**
1. Use signup form to create regular member account
2. Then promote to admin via database (see "Cara 1" above)

---

## 📝 NOTES

- **Production Security**: Change default passwords immediately!
- **Email Verification**: Current setup auto-confirms emails (for demo purposes)
- **Role Management**: Only admins should be able to modify user roles (implement proper RBAC)
- **Session Duration**: Supabase sessions expire after 1 hour by default
- **Refresh Tokens**: Implement token refresh for better UX

---

## 🔗 USEFUL LINKS

- Supabase Dashboard: https://supabase.com/dashboard
- Project URL: https://ourtzdfyqpytfojlquff.supabase.co
- Docs: https://supabase.com/docs/guides/auth

---

**Last Updated:** February 7, 2026  
**Version:** 1.0  
**Platform:** Investoft Trading Platform
