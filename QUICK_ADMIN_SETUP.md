# ⚡ QUICK ADMIN SETUP - 2 MENIT

---

## 🚀 METHOD 1: SIGN UP + PROMOTE (EASIEST)

### **Step 1: Sign Up**
```
1. Buka app → Click "Sign Up"
2. Isi: Name, Email, Password
3. Click "Sign Up" → Auto login
```

### **Step 2: Get User ID**
```sql
SELECT id FROM auth.users WHERE email = 'your@email.com';
```
📝 Copy user_id

### **Step 3: Promote to Admin**
```sql
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:PASTE_USER_ID_HERE';
```

### **Step 4: Login**
```
Logout → Login → Admin Panel ✅
```

---

## 🛠️ METHOD 2: SQL DIRECT (ADVANCED)

### **Copy & Paste This:**

```sql
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'admin@investoft.com', crypt('AdminPass123!', gen_salt('bf')), now(), now(), now(), '{"name": "Super Admin"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO kv_store_20da1dab (key, value)
VALUES ('user:22222222-2222-2222-2222-222222222222', jsonb_build_object('id', '22222222-2222-2222-2222-222222222222', 'email', 'admin@investoft.com', 'name', 'Super Admin', 'balance', 50000, 'createdAt', now()::text, 'role', 'admin'))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### **Login:**
```
Email: admin@investoft.com
Password: AdminPass123!
```

---

## ✅ VERIFY

```sql
SELECT key, value FROM kv_store_20da1dab 
WHERE value::jsonb->>'email' = 'your@email.com';
```

**Check:** `role` = `"admin"` ✅

---

## ⚠️ TROUBLESHOOT

**Login but Member Dashboard?**
```sql
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE value::jsonb->>'email' = 'your@email.com';
```

---

## 🎯 EXPECTED RESULT

```
✅ Dark sidebar (11 menu items)
✅ Topbar (search, notifications)
✅ Overview page (stats cards)
✅ Can navigate all admin pages
```

---

**DONE!** 🎉
