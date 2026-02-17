# ⚡ QUICK FIX: Invalid Login Credentials Error

## 🎯 Solusi Super Cepat (2 Cara)

### **🚀 CARA 1: Via Homepage (TERCEPAT!)**

1. **Buka browser** → `http://localhost:5173/`

2. **Scroll ke hero section** (bagian paling atas)

3. **Klik button kuning** yang bertulisan:
   ```
   🧪 Create Test Account (azuranistirah@gmail.com)
   ```

4. **Tunggu** beberapa detik

5. **Toast notification** akan muncul:
   - ✅ "Test account created successfully!"
   - Atau: "Account already exists! You can sign in now."

6. **Modal login otomatis terbuka** → Masukkan:
   - Email: `azuranistirah@gmail.com`
   - Password: `Sundala99!`

7. **✅ DONE!** Anda akan redirect ke `/member` dashboard

---

### **🧪 CARA 2: Via Test Page (Untuk Debugging)**

1. **Buka URL**: `http://localhost:5173/test-account-creator`

2. **Klik button hijau**: "🚀 Run Full Test (Recommended)"

3. **Tunggu** test sequence selesai:
   - ✅ Test backend connection
   - ✅ Create account
   - ✅ Test login

4. **Check logs** untuk melihat:
   ```
   ✅ Backend connection successful!
   ✅ Account created successfully!
   ✅ LOGIN SUCCESSFUL!
   ```

5. **Kembali ke home** dan **login** dengan credentials di atas

---

## 📋 Account Info

| Field | Value |
|-------|-------|
| **Email** | azuranistirah@gmail.com |
| **Password** | Sundala99! |
| **Role** | Member (not admin) |
| **Initial Balance** | $0 |
| **Status** | Approved (active immediately) |

---

## 🔧 Alternative Methods

### **Via Node.js Script:**
```bash
node test-create-and-login.js
```

### **Via Bash Script:**
```bash
bash quick-create-member.sh
```

### **Via cURL:**
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

---

## ❓ Troubleshooting

### Error: "User already exists"
**✅ GOOD NEWS!** Account sudah ada, langsung login saja!

### Error: "Connection refused"
**Check:**
1. Backend server running? → `npm run dev`
2. Supabase project active?
3. Correct project ID: `ourtzdfyqpytfojlquff`

### Login successful but no redirect
**Fix:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh browser (Ctrl+R)
3. Try login again

### Balance shows $0
**Normal!** This is by design:
- Account starts with $0
- Admin must add balance via Admin Panel
- This is for testing balance management

---

## 🎯 Quick Summary

**Problem**: `AuthApiError: Invalid login credentials`  
**Cause**: Account `azuranistirah@gmail.com` doesn't exist in Supabase  
**Solution**: Create account using button on homepage  
**Time**: Less than 30 seconds!  

---

## ✅ Success Indicators

After creating account, you should see:

- ✅ Toast: "Test account created successfully!"
- ✅ Login modal opens automatically
- ✅ After login: Redirect to `/member` dashboard
- ✅ Dashboard shows: Balance $0, no trades yet
- ✅ No more "Invalid login credentials" error!

---

## 📁 New Files Added

1. ✅ Button added to `LandingPage.tsx` (homepage)
2. ✅ New page: `/test-account-creator` for full debugging
3. ✅ Backend endpoint: `/create-test-member`
4. ✅ Multiple scripts for different needs

---

## 🎉 Next Steps After Login

1. ✅ Login successful → Dashboard shows
2. 💰 Balance is $0 (normal!)
3. 🔑 Login as admin to add balance:
   - Go to `/admin`
   - Find user: azuranistirah@gmail.com
   - Add balance (e.g., $1000)
4. 🎯 Return to member dashboard
5. 💹 Start trading with your balance!

---

**Need help?** Check the logs in browser console (F12) for detailed error messages.
