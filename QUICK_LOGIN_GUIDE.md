# 🚀 QUICK LOGIN GUIDE - INVESTOFT

## ⚡ FASTEST WAY TO GET STARTED

### **METHOD 1: Create Account via UI (Recommended)**

1. **Open Investoft App** → Click **"Sign Up"** button
2. **Fill the form:**
   ```
   Name: Your Name
   Email: youremail@example.com
   Password: yourpassword123
   ```
3. **Click "Sign Up"** → Automatically logged in to **Member Dashboard** ✅

---

### **METHOD 2: Use Pre-made Test Accounts**

#### **🔧 Setup Required (One-time only):**

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **Investoft project** (ID: `ourtzdfyqpytfojlquff`)
3. Open **SQL Editor** (left sidebar)
4. Copy-paste this SQL and click **RUN**:

```sql
-- Create test member account
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'member@test.com',
  crypt('member123', gen_salt('bf')),
  now(), now(), now(), '{"name": "Test Member"}'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'member@test.com', 'Test Member', 'member')
ON CONFLICT (id) DO NOTHING;

-- Create test admin account
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'admin@test.com',
  crypt('admin123', gen_salt('bf')),
  now(), now(), now(), '{"name": "Test Admin"}'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, role)
VALUES ('22222222-2222-2222-2222-222222222222', 'admin@test.com', 'Test Admin', 'admin')
ON CONFLICT (id) DO NOTHING;
```

#### **✅ Now you can login with:**

**Member Account:**
```
Email: member@test.com
Password: member123
→ Access: Member Dashboard
```

**Admin Account:**
```
Email: admin@test.com
Password: admin123
→ Access: Admin Panel
```

---

## 🔄 PROMOTE EXISTING USER TO ADMIN

**If you already have an account and want admin access:**

1. Go to **Supabase Dashboard** → **Table Editor** → **users** table
2. Find your user row (search by email)
3. Click the row to edit
4. Change `role` from `"member"` to `"admin"`
5. Save
6. **Logout** from app and **login again** → You'll see Admin Dashboard! 🎉

---

## 🐛 TROUBLESHOOTING

**Problem:** "Login failed"
- ✅ Check spelling (email & password)
- ✅ Make sure test accounts are created via SQL above

**Problem:** "Logged in but see nothing"
- ✅ Check if `public.users` table exists and has your user
- ✅ Clear browser cache and try again

**Problem:** "Admin not working"
- ✅ Verify `role = 'admin'` in database (case-sensitive!)
- ✅ Logout completely and login again

---

## 📍 WHERE TO LOGIN?

- **Login Button**: Top right corner of homepage ("Log In" button)
- **Direct Access**: The header shows "Log In" and "Sign Up" buttons
- **After Signup**: Automatically redirected to dashboard based on role

---

**Need more help?** Check the full guide: `/AUTHENTICATION_GUIDE.md`
