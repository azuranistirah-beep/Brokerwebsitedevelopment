# 🔐 CREATE ADMIN ACCOUNT - SIMPLE METHOD

## ✅ CARA PALING MUDAH: VIA API CALL

Karena backend sudah support `role` parameter di signup endpoint, kita bisa create admin langsung via HTTP request!

---

### **METHOD 1: VIA BROWSER CONSOLE (RECOMMENDED)**

1. **Buka aplikasi:** http://localhost:5173

2. **Tekan F12** untuk buka Developer Tools

3. **Pilih tab "Console"**

4. **Copy-paste code ini:**

```javascript
// Create Admin Account
fetch('https://fwzrhkclhstobppnuxfz.supabase.co/functions/v1/make-server-20da1dab/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3enJoa2NsaHN0b2JwcG51eGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MjkzMzcsImV4cCI6MjA1MjIwNTMzN30.y2OqhBi4_daBSZz_FS51PabI_z9y9D17jbPF44MxXoc'
  },
  body: JSON.stringify({
    email: 'admin@investoft.com',
    password: 'Admin123456',
    name: 'Super Admin',
    role: 'admin'  // PENTING: Ini yang bikin jadi admin!
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ ADMIN CREATED:', data);
  if (data.success) {
    console.log('🎉 LOGIN DENGAN:');
    console.log('Email: admin@investoft.com');
    console.log('Password: Admin123456');
  } else {
    console.error('❌ ERROR:', data.error);
  }
})
.catch(err => console.error('❌ FETCH ERROR:', err));
```

5. **Tekan ENTER**

6. **Tunggu response** (harusnya muncul "✅ ADMIN CREATED")

7. **LOGIN!**
   - Email: `admin@investoft.com`
   - Password: `Admin123456`

---

### **METHOD 2: VIA CURL (Jika punya terminal/command prompt)**

Buka terminal dan jalankan:

```bash
curl -X POST https://fwzrhkclhstobppnuxfz.supabase.co/functions/v1/make-server-20da1dab/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3enJoa2NsaHN0b2JwcG51eGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MjkzMzcsImV4cCI6MjA1MjIwNTMzN30.y2OqhBi4_daBSZz_FS51PabI_z9y9D17jbPF44MxXoc" \
  -d '{
    "email": "admin@investoft.com",
    "password": "Admin123456",
    "name": "Super Admin",
    "role": "admin"
  }'
```

---

### **METHOD 3: VIA POSTMAN (Jika ada)**

- **URL:** `https://fwzrhkclhstobppnuxfz.supabase.co/functions/v1/make-server-20da1dab/signup`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3enJoa2NsaHN0b2JwcG51eGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MjkzMzcsImV4cCI6MjA1MjIwNTMzN30.y2OqhBi4_daBSZz_FS51PabI_z9y9D17jbPF44MxXoc`
- **Body (JSON):**
```json
{
  "email": "admin@investoft.com",
  "password": "Admin123456",
  "name": "Super Admin",
  "role": "admin"
}
```

---

## 🔍 VERIFY ADMIN DIBUAT (Optional)

Setelah create admin, verify di Supabase SQL Editor:

```sql
SELECT 
  au.id,
  au.email,
  kv.value::jsonb->>'role' as role,
  kv.value::jsonb->>'name' as name
FROM auth.users au
LEFT JOIN kv_store_20da1dab kv ON kv.key = 'user:' || au.id::text
WHERE au.email = 'admin@investoft.com';
```

**Expected result:**
```
| id       | email                  | role  | name        |
|----------|------------------------|-------|-------------|
| abc123.. | admin@investoft.com    | admin | Super Admin |
```

---

## 🎯 LOGIN KE ADMIN PANEL

1. Buka: http://localhost:5173
2. Klik "Log In"
3. Masukkan:
   - **Email:** `admin@investoft.com`
   - **Password:** `Admin123456`
4. **BOOM! Masuk ke Admin Panel!** 🎉

---

## ⚠️ TROUBLESHOOTING

### Kalau masih "Invalid login credentials":

1. **Check di console browser** (F12) apakah ada error message lain
2. **Verify password di Supabase** dengan SQL:
   ```sql
   SELECT encrypted_password FROM auth.users WHERE email = 'admin@investoft.com';
   ```
3. **Reset password** dengan SQL:
   ```sql
   UPDATE auth.users
   SET encrypted_password = crypt('Admin123456', gen_salt('bf'))
   WHERE email = 'admin@investoft.com';
   ```

### Kalau "Email already exists":

Berarti admin sudah dibuat sebelumnya, tapi password salah. **Reset password** dengan SQL di atas.

---

## 📝 NOTES

- **JANGAN create table** via SQL karena backend akan auto-create saat pertama kali dipanggil
- **Signup endpoint** sudah handle create user + KV store entry sekaligus
- **Password** di-hash otomatis oleh Supabase Auth
- **Role parameter** akan langsung set user sebagai admin

**METHOD 1 (Browser Console) adalah yang PALING MUDAH dan PALING RELIABLE!** 🚀
