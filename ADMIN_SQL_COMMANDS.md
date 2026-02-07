# 🚀 ADMIN SQL COMMANDS - COPY & PASTE

Panduan SQL commands untuk setup admin account di Investoft.

---

## 📋 TABLE OF CONTENTS

1. [Method 1: Promote Existing User](#method-1-promote-existing-user) ⭐ **RECOMMENDED**
2. [Method 2: Create New Admin](#method-2-create-new-admin)
3. [Verify Commands](#verify-commands)
4. [Troubleshooting Commands](#troubleshooting-commands)

---

## METHOD 1: PROMOTE EXISTING USER ⭐

**Use this if you already signed up via UI**

### **Step 1: Find Your User ID**

```sql
-- Replace 'your@email.com' with your actual email
SELECT 
    id as user_id,
    email,
    raw_user_meta_data->>'name' as name,
    created_at
FROM auth.users
WHERE email = 'your@email.com';
```

**📝 Copy the `user_id` from results** (example: `abc123-def456-789...`)

---

### **Step 2: Promote to Admin**

```sql
-- Replace 'YOUR_USER_ID_HERE' with the actual user_id from Step 1
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:YOUR_USER_ID_HERE';
```

**Example with actual ID:**
```sql
-- If your user_id is: abc123-def456-789
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:abc123-def456-789';
```

---

### **Step 3: Verify**

```sql
-- Check role updated (replace email)
SELECT key, value
FROM kv_store_20da1dab
WHERE value::jsonb->>'email' = 'your@email.com';
```

**Expected output:**
```json
{
  "id": "abc123-...",
  "email": "your@email.com",
  "name": "Your Name",
  "balance": 10000,
  "role": "admin"  ← Should be "admin"
}
```

✅ **Done!** Logout dan login lagi → Admin Panel

---

## METHOD 2: CREATE NEW ADMIN

**Use this to create fresh admin account**

### **Full Command (Copy All at Once):**

```sql
-- STEP 1: Create auth user
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

-- STEP 2: Create KV Store profile
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

**Login credentials:**
```
Email: admin@investoft.com
Password: AdminPass123!
```

---

### **Customizable Version:**

```sql
-- CUSTOMIZE THESE VALUES:
-- email: Change to your preferred email
-- password: Change 'YourPassword123' to your password
-- name: Change 'Admin Name' to your name
-- id: Use any UUID (or keep the default)

-- STEP 1: Create auth user
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
  'CHANGE-THIS-TO-UNIQUE-UUID-HERE',  -- Change this!
  'authenticated', 
  'authenticated',
  'your-email@example.com',  -- Change this!
  crypt('YourPassword123', gen_salt('bf')),  -- Change password!
  now(), 
  now(), 
  now(), 
  '{"name": "Your Admin Name"}'::jsonb  -- Change name!
)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Create KV Store profile (use same id and info)
INSERT INTO kv_store_20da1dab (key, value)
VALUES (
  'user:CHANGE-THIS-TO-SAME-UUID-AS-ABOVE',  -- Same UUID!
  jsonb_build_object(
    'id', 'CHANGE-THIS-TO-SAME-UUID-AS-ABOVE',  -- Same UUID!
    'email', 'your-email@example.com',  -- Same email!
    'name', 'Your Admin Name',  -- Same name!
    'balance', 50000,
    'createdAt', now()::text,
    'role', 'admin'
  )
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;
```

**Note:** Make sure UUID, email, and name are IDENTICAL in both INSERT statements!

---

## VERIFY COMMANDS

### **Check Auth User:**

```sql
-- List all users
SELECT 
    id,
    email,
    raw_user_meta_data->>'name' as name,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC;
```

---

### **Check KV Store Profile:**

```sql
-- List all user profiles
SELECT 
    key,
    value::jsonb->>'email' as email,
    value::jsonb->>'name' as name,
    value::jsonb->>'role' as role,
    value::jsonb->>'balance' as balance
FROM kv_store_20da1dab
WHERE key LIKE 'user:%'
ORDER BY (value::jsonb->>'createdAt') DESC;
```

---

### **Check Specific User:**

```sql
-- Replace with your email
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'name' as auth_name,
    kv.value::jsonb->>'role' as role,
    kv.value::jsonb->>'balance' as balance
FROM auth.users au
LEFT JOIN kv_store_20da1dab kv ON kv.key = 'user:' || au.id
WHERE au.email = 'your@email.com';
```

**Expected output:**
- `id`: UUID
- `email`: Your email
- `auth_name`: Name from auth
- `role`: **"admin"** ← Must be "admin"!
- `balance`: Demo balance

---

## TROUBLESHOOTING COMMANDS

### **Problem: Login but goes to Member Dashboard**

**Fix: Update role to admin**

```sql
-- Find user and update role
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE value::jsonb->>'email' = 'your@email.com';
```

---

### **Problem: User not in KV Store**

**Fix: Add user to KV Store**

```sql
-- Get user ID first
SELECT id, email, raw_user_meta_data->>'name' as name
FROM auth.users
WHERE email = 'your@email.com';

-- Insert to KV Store (replace USER_ID, EMAIL, NAME)
INSERT INTO kv_store_20da1dab (key, value)
VALUES (
  'user:USER_ID_FROM_ABOVE',
  jsonb_build_object(
    'id', 'USER_ID_FROM_ABOVE',
    'email', 'your@email.com',
    'name', 'Your Name',
    'balance', 10000,
    'createdAt', now()::text,
    'role', 'admin'
  )
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;
```

---

### **Problem: Multiple accounts, need to find admin**

**Find all admin accounts:**

```sql
SELECT 
    key,
    value::jsonb->>'email' as email,
    value::jsonb->>'name' as name,
    value::jsonb->>'role' as role
FROM kv_store_20da1dab
WHERE key LIKE 'user:%'
AND value::jsonb->>'role' = 'admin';
```

---

### **Problem: Need to reset admin password**

**Change password in Supabase Auth:**

```sql
-- Replace email and new password
UPDATE auth.users
SET encrypted_password = crypt('NewPassword123', gen_salt('bf')),
    updated_at = now()
WHERE email = 'admin@investoft.com';
```

---

### **Problem: Delete wrong admin account**

**Delete from both tables:**

```sql
-- Get user ID first
SELECT id FROM auth.users WHERE email = 'wrong@email.com';

-- Delete from KV Store (replace USER_ID)
DELETE FROM kv_store_20da1dab WHERE key = 'user:USER_ID';

-- Delete from auth (replace USER_ID)
DELETE FROM auth.users WHERE id = 'USER_ID';
```

---

## BULK ADMIN CREATION

**Create multiple admin accounts:**

```sql
-- Admin 1
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin1@investoft.com', crypt('Admin123!', gen_salt('bf')), now(), now(), now(), '{"name": "Admin One"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO kv_store_20da1dab (key, value)
VALUES ('user:aaaaaaaa-1111-1111-1111-111111111111', jsonb_build_object('id', 'aaaaaaaa-1111-1111-1111-111111111111', 'email', 'admin1@investoft.com', 'name', 'Admin One', 'balance', 50000, 'createdAt', now()::text, 'role', 'admin'))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Admin 2
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'admin2@investoft.com', crypt('Admin123!', gen_salt('bf')), now(), now(), now(), '{"name": "Admin Two"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO kv_store_20da1dab (key, value)
VALUES ('user:bbbbbbbb-2222-2222-2222-222222222222', jsonb_build_object('id', 'bbbbbbbb-2222-2222-2222-222222222222', 'email', 'admin2@investoft.com', 'name', 'Admin Two', 'balance', 50000, 'createdAt', now()::text, 'role', 'admin'))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

---

## UTILITY COMMANDS

### **List ALL users with roles:**

```sql
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'name' as name,
    COALESCE(kv.value::jsonb->>'role', 'no role') as role,
    COALESCE(kv.value::jsonb->>'balance', '0') as balance,
    au.created_at
FROM auth.users au
LEFT JOIN kv_store_20da1dab kv ON kv.key = 'user:' || au.id
ORDER BY au.created_at DESC;
```

---

### **Count users by role:**

```sql
SELECT 
    value::jsonb->>'role' as role,
    COUNT(*) as count
FROM kv_store_20da1dab
WHERE key LIKE 'user:%'
GROUP BY value::jsonb->>'role';
```

---

### **Update balance for admin:**

```sql
-- Set admin balance to 100,000
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{balance}', '100000')
WHERE value::jsonb->>'role' = 'admin'
AND value::jsonb->>'email' = 'admin@investoft.com';
```

---

## 🎯 RECOMMENDED WORKFLOW

### **For New Setup:**

1. **Sign Up via UI** (easiest, no SQL errors)
2. **Run Method 1** to promote to admin
3. **Verify** with verify commands
4. **Login** and access Admin Panel ✅

### **For Advanced Users:**

1. **Run Method 2** (create new admin directly)
2. **Verify** with verify commands
3. **Login** immediately ✅

---

## 📞 QUICK REFERENCE

**Method 1 (Recommended):**
```
1. Sign Up → Get user_id → UPDATE role → Done
```

**Method 2 (Advanced):**
```
1. INSERT auth.users → INSERT kv_store → Done
```

**Verify:**
```
Check auth.users → Check kv_store → role = "admin"
```

---

## ✅ SUCCESS INDICATORS

After running commands, you should see:

- ✅ User exists in `auth.users`
- ✅ User exists in `kv_store_20da1dab` with key `user:UUID`
- ✅ Value has field `role: "admin"` (lowercase!)
- ✅ Login redirects to Admin Dashboard
- ✅ Sidebar shows 11 menu items
- ✅ Can navigate all admin pages

---

**Last Updated:** February 7, 2026  
**Platform:** Investoft Trading Platform  
**Database:** Supabase (KV Store Architecture)
