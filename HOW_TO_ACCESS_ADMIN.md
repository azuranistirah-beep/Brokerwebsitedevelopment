# 🎯 CARA AKSES ADMIN PANEL - SIMPLE GUIDE

## ⚡ QUICK START (2 LANGKAH):

---

### **STEP 1: BUAT ADMIN ACCOUNT** 👤

#### **Option A: Via Sign Up UI (EASIEST)** ⭐

1. **Buka aplikasi** → Klik **"Sign Up"**
2. **Isi form:**
   ```
   Name: Admin Test
   Email: admin@test.com
   Password: admin123
   ```
3. **Sign Up** → Auto login sebagai member
4. **Buka Supabase** → SQL Editor → Run SQL ini:

```sql
-- Get your user ID
SELECT id FROM auth.users WHERE email = 'admin@test.com';
-- Copy the user_id result (example: abc123-def456-789)

-- Update role to admin (replace YOUR_USER_ID)
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:YOUR_USER_ID';
```

5. **Logout** dari app → **Login lagi** → **Admin Panel** ✅

---

#### **Option B: Via SQL Direct (ADVANCED)** 🛠️

**Buka Supabase Dashboard** → **SQL Editor** → Run:

```sql
-- STEP 1: Create auth user
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'admin@investoft.com', crypt('AdminPass123!', gen_salt('bf')), now(), now(), now(), '{"name": "Super Admin"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Create KV Store profile
INSERT INTO kv_store_20da1dab (key, value)
VALUES ('user:22222222-2222-2222-2222-222222222222', jsonb_build_object('id', '22222222-2222-2222-2222-222222222222', 'email', 'admin@investoft.com', 'name', 'Super Admin', 'balance', 50000, 'createdAt', now()::text, 'role', 'admin'))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

**Login credentials:**
```
Email: admin@investoft.com
Password: AdminPass123!
```

---

### **STEP 2: LOGIN SEBAGAI ADMIN** 🔑

1. **Buka aplikasi** (http://localhost:5173)
2. Klik **"Log In"** di pojok kanan atas
3. Masukkan email & password admin
4. **Klik "Sign In"**
5. **BOOM!** 🎉 → **SUPER ADMIN PANEL**

---

## ✅ YANG AKAN ANDA LIHAT:

```
┌─────────────────────────────────────────────────────────┐
│  [Investoft Logo]                    🔍 Search  🔔 👤   │ ← Topbar
├───────┬─────────────────────────────────────────────────┤
│ MENU  │  📊 OVERVIEW PAGE                               │
│       │                                                  │
│ 📊 Ov │  [Stats Cards]                                  │
│ 👥 Me │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ ✅ KY │  │2,847 │ │  23  │ │$45K  │ │$28K  │ │ 156  │ │
│ 💰 De │  │Members│ │ KYC  │ │Deposit│ │Withdr│ │Trades│ │
│ 💸 Wi │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │
│ 📈 Tr │                                                  │
│ 📦 As │  [Pending Queues]                               │
│ 🎁 Pr │  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ 💬 Su │  │ Members │ │   KYC   │ │Withdraw │          │
│ 📊 Re │  │Approve  │ │ Review  │ │ Process │          │
│ ⚙️ Se │  └─────────┘ └─────────┘ └─────────┘          │
└───────┴─────────────────────────────────────────────────┘
```

---

## 🎮 CARA MENGGUNAKAN:

### **1. Navigate via Sidebar:**
- Klik menu di kiri (Members, KYC, Withdrawals)
- Active menu highlight purple

### **2. Review KYC:**
```
Sidebar → KYC Verification → Tab "Pending" → Click "Review"
→ Lihat 3 documents → Approve/Reject
```

### **3. Process Withdrawal:**
```
Sidebar → Withdrawals → Tab "Pending" → Click "Process"
→ Check details → Approve/Reject
```

### **4. Manage Members:**
```
Sidebar → Members → Click "⋮" → Actions menu
→ View Details / Block / Adjust Balance
```

---

## ⚠️ TROUBLESHOOTING:

**Login tapi masuk Member Dashboard:**
```sql
-- Check role in database
SELECT key, value FROM kv_store_20da1dab 
WHERE value::jsonb->>'email' = 'your@email.com';

-- Update role to admin (replace USER_ID)
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:USER_ID';
```

**Page blank:**
- Clear cache (Ctrl+Shift+Del)
- Refresh (Ctrl+F5)
- Check console (F12)

---

## 📞 QUICK REFERENCE:

**Admin Login (Option A):**
```
Email: admin@test.com
Password: admin123
```

**Admin Login (Option B):**
```
Email: admin@investoft.com
Password: AdminPass123!
```

---

## ✅ CHECKLIST:

- [ ] Admin account created (via UI or SQL)
- [ ] Role di KV Store = "admin"
- [ ] App running (npm run dev)
- [ ] Login dengan credentials
- [ ] **SUCCESS!** Admin Panel terbuka 🎉

---

## 📚 NEED MORE HELP?

- **Detailed setup:** `/ADMIN_SETUP_FIX.md`
- **Features guide:** `/ADMIN_PANEL_GUIDE.md`
- **Full access guide:** `/ADMIN_ACCESS_GUIDE.md`

---

**Ready to explore!** 🚀
