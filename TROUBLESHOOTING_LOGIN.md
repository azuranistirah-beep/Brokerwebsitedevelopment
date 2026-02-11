# 🔧 TROUBLESHOOTING: Login Issues - Quick Fix Guide

## 🎯 **Quick Diagnosis:**

Jika Anda mendapat **login error**, lihat **pesan error** yang muncul untuk mengetahui solusinya:

---

## ❌ **Error 1: "Invalid email or password"**

### **Penyebab:**
- Email atau password salah
- Account belum dibuat
- Typo di email/password

### **✅ Solusi:**

#### **Untuk Member:**
1. **Periksa Email & Password**
   - Pastikan tidak ada typo
   - Check CAPS LOCK
   - Password minimal 6 karakter

2. **Belum Punya Account?**
   ```
   Landing Page → Click "Login" → Tab "Sign Up"
   ```

3. **Lupa Password?**
   - Contact admin untuk reset
   - Atau create account baru

#### **Untuk Admin:**
1. **Pastikan Admin Account Sudah Dibuat**
   ```
   Press: Ctrl+Shift+A (5x) → Admin Setup Page
   Create admin account jika belum ada
   ```

2. **Check Credentials**
   - Email: yang Anda gunakan saat create admin
   - Password: yang Anda set saat create admin

---

## ❌ **Error 2: "Account awaiting admin approval"**

### **Pesan Lengkap:**
```
Your account is awaiting admin approval. 
You will be notified once approved.
```

### **Penyebab:**
- Anda baru signup sebagai member
- Admin belum approve account Anda

### **✅ Solusi:**

#### **Tunggu Admin Approval:**
1. Admin akan review account Anda
2. Setelah approved, Anda bisa login

#### **Untuk Admin (Cara Approve Member):**
```bash
1. Login ke Admin Panel (Ctrl+Shift+A x5)
2. Sidebar → "Members"
3. Tab "Pending Approval"
4. Find member → Click "Approve" ✅
5. Member sekarang bisa login!
```

---

## ❌ **Error 3: "Account has been rejected"**

### **Pesan Lengkap:**
```
Your account has been rejected by admin. 
Please contact support.
```

### **Penyebab:**
- Admin menolak registration Anda

### **✅ Solusi:**
- Contact admin/support untuk info lebih lanjut
- Atau create account baru dengan data yang valid

---

## ❌ **Error 4: "Please confirm your email address"**

### **Penyebab:**
- Email belum ter-verify (jarang terjadi)

### **✅ Solusi:**

1. **Check Email Inbox**
   - Cari email dari Supabase
   - Click confirmation link

2. **Tidak Ada Email?**
   - Check spam folder
   - Contact admin untuk manual confirmation

3. **Quick Fix (For Admin):**
   ```sql
   -- Run di Supabase SQL Editor:
   UPDATE auth.users 
   SET email_confirmed_at = NOW() 
   WHERE email = 'user@example.com';
   ```

---

## ❌ **Error 5: "Access denied - Admin privileges required"**

### **Penyebab:**
- Login ke Admin Panel dengan akun member (bukan admin)

### **✅ Solusi:**

#### **Option 1: Login Dengan Account Admin**
```bash
Press: Ctrl+Shift+A (5x)
Enter admin email & password
```

#### **Option 2: Create Admin Account**
```bash
1. Press: Ctrl+Shift+A (5x)
2. Go to Admin Setup Page
3. Create new admin account
4. Login with new admin credentials
```

---

## ❌ **Error 6: "Failed to fetch user profile"**

### **Penyebab:**
- Backend server error
- Network issue
- Supabase Edge Functions not deployed

### **✅ Solusi:**

1. **Check Network Connection**
   - Pastikan internet stabil
   - Refresh page (F5)

2. **Check Backend Logs**
   ```bash
   F12 → Console tab
   Lihat error message dari server
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy make-server-20da1dab
   ```

4. **Check Supabase Status**
   - Go to: https://status.supabase.com/
   - Pastikan semua services UP

---

## 🔍 **Debug Mode - Advanced:**

### **1. Check If User Exists:**

Open browser console (F12) dan run:
```javascript
// Check user by email
const response = await fetch(
  `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-20da1dab/check-user?email=test@example.com`,
  {
    headers: {
      'Authorization': 'Bearer YOUR_ANON_KEY'
    }
  }
);
const result = await response.json();
console.log(result);
```

**Result:**
```json
{
  "exists": true,
  "email": "test@example.com",
  "authUser": {
    "id": "abc-123",
    "email": "test@example.com",
    "confirmed_at": "2026-02-07T10:00:00Z"
  },
  "profile": {
    "role": "member",
    "status": "pending"
  }
}
```

---

### **2. Check Current Session:**

```javascript
// Check if you're already logged in
import { supabase } from './src/app/lib/supabaseClient';

const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);
```

---

### **3. Manual User Creation (Admin Only):**

Jika user tidak ada di database:

```bash
# Go to Admin Setup Page
Press: Ctrl+Shift+A (5x)

# Or manually create via backend
POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-20da1dab/signup
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_ANON_KEY"
}
Body: {
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

---

## 📊 **Login Flow Diagram:**

```
┌─────────────────┐
│  User Input     │
│  Email/Password │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Supabase Auth Check         │
│ ❌ Invalid? → Error Message │
│ ✅ Valid? → Continue         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Fetch User Profile          │
│ Check: status, role         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Status Validation           │
│ ❌ pending → Reject + Logout│
│ ❌ rejected → Reject + Logout│
│ ✅ active → Allow Login     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ ✅ Login Successful!        │
│ Redirect to Dashboard       │
└─────────────────────────────┘
```

---

## 🎯 **Quick Checklist:**

Sebelum report bug, pastikan:

- [ ] Email & password benar (no typo)
- [ ] Account sudah dibuat (signup done)
- [ ] Email sudah confirmed
- [ ] Account status = 'active' (not pending/rejected)
- [ ] Network connection stable
- [ ] Supabase Edge Functions deployed
- [ ] Browser console tidak ada error merah

---

## 🆘 **Still Not Working?**

### **Contact Admin:**
1. Provide screenshot error message
2. Provide email yang digunakan
3. Check browser console (F12) untuk error logs

### **Common Issues:**

| Issue | Quick Fix |
|-------|-----------|
| Typo password | Re-enter carefully |
| Account pending | Wait for admin approval |
| Account rejected | Contact support |
| No admin account | Use Admin Setup Page |
| Backend error | Check Edge Functions deployed |
| Network error | Refresh page / Check internet |

---

## ✨ **Prevention Tips:**

1. **Save Your Credentials**
   - Write down email & password
   - Use password manager

2. **For Admin:**
   - Create admin account FIRST
   - Test login before production

3. **For Members:**
   - After signup, wait for approval email
   - Don't try login immediately if pending

4. **For Developers:**
   - Always deploy Edge Functions
   - Check environment variables set
   - Monitor Supabase logs

---

## 🚀 **Summary:**

**Error sudah diperbaiki dengan:**
✅ Clear error messages
✅ Account status validation
✅ Auto sign-out on invalid status
✅ Better user experience

**Jika masih error, check:**
1. Error message yang muncul
2. Follow solusi di guide ini
3. Check browser console
4. Contact admin jika perlu

---

**Platform Status:** ✅ All Systems Operational

**Last Updated:** February 7, 2026
