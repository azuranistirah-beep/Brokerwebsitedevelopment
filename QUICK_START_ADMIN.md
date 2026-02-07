# ⚡ QUICK START - Create Admin & Login

## 🚀 **3 LANGKAH MUDAH:**

---

### **1️⃣ CREATE TABLE (Supabase SQL Editor)**

```sql
CREATE TABLE IF NOT EXISTS kv_store_20da1dab (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_store_value ON kv_store_20da1dab USING GIN (value);
```

---

### **2️⃣ CREATE ADMIN (Browser Console - F12)**

Buka website, tekan F12, paste ini di Console:

```javascript
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
    role: 'admin'
  })
})
.then(res => res.json())
.then(data => console.log('✅ RESULT:', data));
```

---

### **3️⃣ LOGIN (Klik Titik di Footer)**

```
1. Scroll ke footer
2. Cari: "© 2026 Investoft. All rights reserved."
3. Klik TITIK (.) setelah "Investoft"
4. Login dengan:
   - Email: admin@investoft.com
   - Password: Admin123456
5. DONE! 🎉
```

---

## 🎯 **LOKASI HIDDEN LOGIN:**

```
Footer:
© 2026 Investoft. All rights reserved.
               ↑
         KLIK TITIK INI
```

**Note:** Titik akan berubah warna merah saat di-hover, menandakan ini adalah secret access point!

---

## ✅ **VERIFY ADMIN:**

Supabase SQL:
```sql
SELECT email, value::jsonb->>'role' as role 
FROM kv_store_20da1dab 
WHERE value::jsonb->>'email' = 'admin@investoft.com';
```

Expected: `role = admin` ✅

---

**That's it! Super simple!** 🚀
