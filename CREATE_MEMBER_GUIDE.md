# 🧪 Panduan Membuat Test Member Account - Investoft

## 📋 Spesifikasi Akun

Akun test member dengan detail berikut:

- **Email**: `azuranistirah@gmail.com`
- **Password**: `Sundala99!`
- **Name**: `Azura Nistirah`
- **Role**: `member` (bukan admin)
- **Status**: `approved` (langsung aktif)
- **Demo Balance**: `$0` (nol)
- **Real Balance**: `$0`
- **Ketentuan**: Saldo hanya bisa diubah melalui Admin Panel

---

## 🚀 Cara 1: Menggunakan Node.js Script

### Langkah:

1. **Edit Project ID** di file `/create-member-script.js`:
   ```javascript
   const PROJECT_ID = 'ourtzdfyqpytfojlquff'; // Ganti dengan project ID Anda
   ```

2. **Jalankan script**:
   ```bash
   node create-member-script.js
   ```

3. **Output yang diharapkan**:
   ```
   ✅ SUCCESS! Account created successfully!
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📋 Account Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✉️  Email: azuranistirah@gmail.com
   🆔 User ID: [generated-id]
   👤 Name: Azura Nistirah
   🎭 Role: member
   ✅ Status: approved
   💰 Demo Balance: $0
   💵 Real Balance: $0
   ```

---

## 🌐 Cara 2: Menggunakan HTML Form

### Langkah:

1. **Buka file** `/create-test-member.html` di browser

2. **Form sudah terisi** dengan data default:
   - Email: `azuranistirah@gmail.com`
   - Password: `Sundala99!`
   - Name: `Azura Nistirah`
   - Initial Balance: `0`

3. **Klik tombol** "Create Test Member Account"

4. **Tunggu konfirmasi** success message

---

## 📡 Cara 3: Menggunakan cURL (Manual)

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

### Response (Success):
```json
{
  "success": true,
  "message": "Test member account created successfully",
  "user": {
    "id": "uuid-generated-by-supabase",
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

### Response (Error - User Exists):
```json
{
  "error": "User already exists",
  "message": "This email is already registered. Please use a different email or delete the existing user first."
}
```

---

## 🔐 Login Setelah Akun Dibuat

### Cara Login:

1. **Buka aplikasi** di browser: `http://localhost:5173/`

2. **Klik tombol** "Sign In" atau "Start Trading Free" di header

3. **Masukkan credentials**:
   - Email: `azuranistirah@gmail.com`
   - Password: `Sundala99!`

4. **Klik** "Sign In"

5. **Otomatis redirect** ke `/member` dashboard

### Yang akan Anda lihat:
- ✅ Member Dashboard dengan demo balance **$0**
- ✅ Tidak bisa trading (insufficient balance)
- ✅ Balance hanya bisa ditambah via Admin Panel

---

## 🛠️ Mengelola Balance via Admin Panel

### Langkah untuk Admin:

1. **Login sebagai admin** di `/admin`

2. **Cari user** `azuranistirah@gmail.com` di user list

3. **Klik tombol** "Edit Balance" atau "Add Funds"

4. **Input amount** yang ingin ditambahkan (contoh: $1000)

5. **Save changes**

6. **Member bisa refresh** dan melihat balance baru

---

## 🧪 Testing Scenarios

### Scenario 1: Login dengan Balance $0
```
✅ Login berhasil
✅ Dashboard muncul
✅ Balance menampilkan $0
❌ Tidak bisa place trade (insufficient balance)
```

### Scenario 2: Admin Tambah Balance
```
✅ Admin login ke /admin
✅ Find user azuranistirah@gmail.com
✅ Add $1000 to demo balance
✅ Member refresh dashboard
✅ Balance update jadi $1000
✅ Sekarang bisa trading
```

### Scenario 3: Trading After Balance Added
```
✅ Member pilih asset (BTC)
✅ Pilih amount ($50)
✅ Click UP/DOWN
✅ Position opened successfully
✅ Balance berkurang $50
✅ Wait for expiry
✅ Result: WIN/LOSS
✅ Balance updated accordingly
```

---

## 🔍 Verifikasi Akun

### Cek via Backend API:

```bash
# 1. Login dulu untuk dapat token
curl -X POST \
  'https://ourtzdfyqpytfojlquff.supabase.co/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_ANON_KEY' \
  -d '{
    "email": "azuranistirah@gmail.com",
    "password": "Sundala99!"
  }'

# 2. Get profile dengan token
curl -X GET \
  'https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab/profile' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Expected Profile Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "azuranistirah@gmail.com",
    "name": "Azura Nistirah",
    "phone": "",
    "role": "member",
    "status": "approved",
    "demo_balance": 0,
    "real_balance": 0,
    "total_trades": 0,
    "winning_trades": 0,
    "losing_trades": 0,
    "created_at": "2026-02-17T...",
    "created_by": "admin",
    "notes": "Test member account - Balance managed by admin only"
  }
}
```

---

## ❓ Troubleshooting

### Error: "User already exists"
**Solusi**:
1. User sudah dibuat sebelumnya
2. Gunakan email lain, atau
3. Delete user dari Admin Panel dulu
4. Atau login dengan credentials yang ada

### Error: "Connection refused"
**Solusi**:
1. Pastikan backend server running
2. Check Supabase project status
3. Verify project ID benar
4. Check firewall/network settings

### Error: "Invalid token"
**Solusi**:
1. Token expired, login ulang
2. Clear browser cache/cookies
3. Check localStorage for token

### Balance tidak update setelah trading
**Solusi**:
1. Refresh halaman
2. Check console logs
3. Verify `/update-balance` endpoint working
4. Check backend logs untuk errors

---

## 📊 Monitoring & Logs

### Backend Logs:
```bash
# Look for these logs:
🧪 [Create Test Member] Creating account for azuranistirah@gmail.com...
✅ [Create Test Member] Supabase user created with ID: [uuid]
✅ [Create Test Member] Profile created with 0 balance
✅ [Create Test Member] Account ready: azuranistirah@gmail.com
```

### Frontend Console:
```javascript
// Login success:
✅ Authentication successful!
✅ User logged in with role: member

// Profile loaded:
{
  user: {
    email: "azuranistirah@gmail.com",
    demo_balance: 0,
    role: "member"
  }
}
```

---

## 📝 Summary

| Item | Value |
|------|-------|
| **Email** | azuranistirah@gmail.com |
| **Password** | Sundala99! |
| **Role** | member |
| **Status** | approved (active) |
| **Demo Balance** | $0 |
| **Real Balance** | $0 |
| **Can Login** | ✅ Yes |
| **Can Trade** | ❌ No (until admin adds balance) |
| **Balance Management** | Admin Panel only |
| **Auto-Confirmed** | ✅ Yes |

---

## 🎯 Next Steps

1. ✅ Create account using one of the methods above
2. ✅ Login to verify account works
3. ✅ Verify balance is $0
4. ✅ Login as admin
5. ✅ Add test balance (e.g., $1000) via Admin Panel
6. ✅ Login as member again
7. ✅ Start testing trading functionality

---

**Created by**: Admin
**Purpose**: Testing member account flow dan admin balance management
**Date**: February 17, 2026
