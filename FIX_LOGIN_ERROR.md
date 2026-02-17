# 🔧 Fix: Invalid Login Credentials Error

## ❌ Error Yang Terjadi
```
Sign in error: AuthApiError: Invalid login credentials
```

**Penyebab**: Akun `azuranistirah@gmail.com` belum dibuat di Supabase Auth.

---

## ✅ Solusi - Pilih Salah Satu Cara

### **🚀 Cara 1: Via Browser (Paling Mudah)**

1. **Buka URL**: `http://localhost:5173/quick-create-member`

2. **Klik tombol** "Create Test Member Account"

3. **Tunggu konfirmasi** success message

4. **Login** dengan credentials:
   - Email: `azuranistirah@gmail.com`
   - Password: `Sundala99!`

---

### **💻 Cara 2: Via Node.js Script (Recommended)**

```bash
node test-create-and-login.js
```

**Output yang diharapkan**:
```
╔═══════════════════════════════════════════════╗
║  INVESTOFT - Create & Test Member Account    ║
╚═══════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 STEP 1: Creating Test Member Account
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Account created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 STEP 2: Testing Login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Login successful!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 STEP 3: Getting User Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Profile retrieved successfully!

╔═══════════════════════════════════════════════╗
║              ✅ ALL TESTS PASSED              ║
╚═══════════════════════════════════════════════╝
```

Script ini akan:
- ✅ Create akun di Supabase Auth
- ✅ Test login
- ✅ Verify profile dapat diambil
- ✅ Menampilkan detail lengkap user

---

### **🐚 Cara 3: Via Bash Script (Linux/Mac)**

```bash
bash quick-create-member.sh
```

---

### **🌐 Cara 4: Via cURL (Manual)**

```bash
curl -X POST \
  'https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab/create-test-member' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "azuranistirah@gmail.com",
    "password": "Sundala99!",
    "name": "Azura Nistirah",
    "initial_balance": 0
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Test member account created successfully",
  "user": {
    "id": "uuid-here",
    "email": "azuranistirah@gmail.com",
    "name": "Azura Nistirah",
    "role": "member",
    "status": "approved",
    "demo_balance": 0,
    "real_balance": 0
  },
  "login_info": {
    "email": "azuranistirah@gmail.com",
    "note": "Account is active and ready to login"
  }
}
```

---

## 🔐 Setelah Akun Dibuat - Test Login

### **Via Frontend (Browser)**:

1. Buka `http://localhost:5173/`
2. Klik "Sign In" di header
3. Masukkan:
   ```
   Email: azuranistirah@gmail.com
   Password: Sundala99!
   ```
4. Klik "Sign In"
5. ✅ Seharusnya redirect ke `/member` dashboard

---

### **Via API (cURL)**:

```bash
# Test login via Supabase Auth
curl -X POST \
  'https://ourtzdfyqpytfojlquff.supabase.co/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91cnR6ZGZ5cXB5dGZvamxxdWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1OTA2MzgsImV4cCI6MjA1MjE2NjYzOH0.wCL4yhI4VZbwrG0lc8eX_YCwfwq-0hVpHnl4_6xrQag' \
  -d '{
    "email": "azuranistirah@gmail.com",
    "password": "Sundala99!"
  }'
```

**Success Response**:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1234567890,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "azuranistirah@gmail.com",
    "...": "..."
  }
}
```

---

## 🧪 Verifikasi Akun Berhasil Dibuat

### **Check via Supabase Dashboard**:

1. Buka Supabase Dashboard: `https://supabase.com/dashboard`
2. Pilih project: `ourtzdfyqpytfojlquff`
3. Navigasi ke: **Authentication** → **Users**
4. Cari email: `azuranistirah@gmail.com`
5. Verify:
   - ✅ Email confirmed: Yes
   - ✅ Status: Active

### **Check via API**:

```bash
# Get user profile (need access token from login)
curl -X GET \
  'https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab/profile' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN_HERE'
```

---

## ❓ Troubleshooting

### **Error: "User already exists"**
**Solusi**: Akun sudah dibuat sebelumnya, langsung login saja!

### **Error: "Connection refused"**
**Solusi**:
1. Pastikan backend server running
2. Check Supabase status
3. Verify project ID benar: `ourtzdfyqpytfojlquff`

### **Error: "Invalid token"**
**Solusi**:
1. Token expired, login ulang
2. Pastikan menggunakan ANON_KEY yang benar

### **Login berhasil tapi tidak redirect**
**Solusi**:
1. Check browser console untuk errors
2. Verify `/member` route exists
3. Clear localStorage: `localStorage.clear()`
4. Refresh browser

### **Balance tidak muncul di dashboard**
**Solusi**:
1. Normal! Balance awal memang $0
2. Login sebagai admin untuk add balance
3. Atau edit via Admin Panel

---

## 📊 Summary

| Item | Value |
|------|-------|
| **Email** | azuranistirah@gmail.com |
| **Password** | Sundala99! |
| **Initial Balance** | $0 |
| **Role** | member |
| **Status** | approved (active) |
| **Can Login?** | ✅ Yes (after account created) |

---

## 🎯 Quick Test Workflow

```bash
# 1. Create account
node test-create-and-login.js

# 2. Open browser
# http://localhost:5173/

# 3. Click "Sign In"

# 4. Enter credentials:
#    Email: azuranistirah@gmail.com
#    Password: Sundala99!

# 5. ✅ Should redirect to /member
```

---

## 📝 Files Created for This Fix

1. ✅ `/test-create-and-login.js` - Complete test script
2. ✅ `/quick-create-member.sh` - Bash script
3. ✅ `/src/app/components/QuickCreateMember.tsx` - React component
4. ✅ Route added: `/quick-create-member`
5. ✅ Backend endpoint: `/create-test-member`

---

**Pilih cara yang paling mudah untuk Anda dan jalankan sekarang! Setelah akun dibuat, error "Invalid login credentials" akan hilang.** ✅
