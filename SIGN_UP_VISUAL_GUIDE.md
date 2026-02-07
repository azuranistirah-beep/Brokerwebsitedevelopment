# 📱 APA ITU "SIGN UP VIA UI"? - PANDUAN VISUAL

---

## 🤔 PERTANYAAN: "SIGN UP VIA UI APA?"

**UI = User Interface** = Tampilan website/aplikasi yang anda lihat di browser

**"Sign Up via UI"** artinya = **Daftar akun lewat tombol & form di website** (bukan lewat SQL/database)

---

## 🎯 LOKASI BUTTON "SIGN UP"

Ketika anda buka aplikasi Investoft di browser, akan ada **2 tombol** di pojok kanan atas:

```
┌─────────────────────────────────────────────────────────┐
│  [INVESTOFT Logo]    Markets  Charts  News   [Log In] [Sign Up] │  ← HEADER
└─────────────────────────────────────────────────────────┘
                                                     ↑       ↑
                                              Tombol  Tombol
                                              Log In  Sign Up
```

**Yang anda klik:** Tombol **"Sign Up"** (warna biru/purple)

---

## 📋 STEP-BY-STEP LENGKAP (DENGAN GAMBAR KETERANGAN)

### **STEP 1: BUKA APLIKASI**

1. **Buka terminal** (Command Prompt / Terminal)
2. **Jalankan perintah:**
   ```bash
   npm run dev
   ```
3. **Tunggu sampai muncul pesan:**
   ```
   ➜  Local:   http://localhost:5173/
   ```
4. **Buka browser** (Chrome, Firefox, Edge, dll)
5. **Ketik di address bar:**
   ```
   http://localhost:5173
   ```
6. **Tekan Enter**

**Anda akan lihat:**
```
╔═══════════════════════════════════════════════════════╗
║  [INVESTOFT]     Markets  Charts  News   [Log In] [Sign Up]  ║ ← Header
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║     Welcome to Investoft                              ║
║     Professional Trading Platform                     ║
║                                                       ║
║     [Get Started Button]                              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

### **STEP 2: KLIK TOMBOL "SIGN UP"**

**Cari tombol "Sign Up" di pojok kanan atas**, kemudian **KLIK**.

```
     Markets  Charts  News   [Log In] [Sign Up]
                                          ↑
                                    KLIK INI!
```

**Atau:**

Anda juga bisa klik tombol **"Get Started"** yang ada di tengah halaman.

---

### **STEP 3: FORM PENDAFTARAN MUNCUL**

Setelah klik "Sign Up", akan muncul **popup modal** (kotak dialog) seperti ini:

```
┌────────────────────────────────────────────┐
│  ╔════════════════════════════════════╗    │
│  ║  Welcome to Investoft              ║    │
│  ║  Create your account               ║    │
│  ╠════════════════════════════════════╣    │
│  ║                                    ║    │
│  ║  [ Login ]  [ Sign Up ] ← Tab     ║    │
│  ║             ─────────              ║    │
│  ║                                    ║    │
│  ║  Name:                             ║    │
│  ║  [___________________]             ║    │
│  ║                                    ║    │
│  ║  Email:                            ║    │
│  ║  [___________________]             ║    │
│  ║                                    ║    │
│  ║  Password:                         ║    │
│  ║  [___________________]             ║    │
│  ║                                    ║    │
│  ║        [Sign Up Button]            ║    │
│  ║                                    ║    │
│  ╚════════════════════════════════════╝    │
└────────────────────────────────────────────┘
```

**Ada 3 kolom isian:**
- **Name** (Nama anda)
- **Email** (Email anda)
- **Password** (Password yang anda inginkan)

---

### **STEP 4: ISI FORM**

**Contoh pengisian:**

```
Name:     Admin Investoft
          ↑ Ketik nama anda

Email:    admin@test.com
          ↑ Ketik email anda

Password: admin123
          ↑ Ketik password anda
```

**PENTING:** Ingat email dan password ini karena akan dipakai untuk login nanti!

---

### **STEP 5: KLIK TOMBOL "SIGN UP"**

Setelah semua kolom terisi, **klik tombol biru "Sign Up"** di bawah form.

```
       [Sign Up Button]
              ↑
         KLIK INI!
```

**Tunggu beberapa detik...**

---

### **STEP 6: OTOMATIS LOGIN**

Setelah Sign Up berhasil:

1. **Modal akan tertutup**
2. **Anda otomatis login** sebagai member
3. **Halaman akan berubah** ke **Member Dashboard** (trading demo interface)

**Anda akan lihat:**
```
╔═══════════════════════════════════════════════════════╗
║  [Chart TradingView]                                  ║
║                                                       ║
║  Balance: $10,000                                     ║
║  [UP Button] [DOWN Button]                            ║
╚═══════════════════════════════════════════════════════╝
```

---

### **STEP 7: SEKARANG PROMOTE KE ADMIN**

**Sampai sini, anda sudah punya akun member.**

Sekarang kita perlu **ubah role dari "member" jadi "admin"** via SQL.

---

## 🔧 LANJUT KE SQL (PROMOTE KE ADMIN)

### **Step 7a: Buka Supabase Dashboard**

1. **Buka tab browser baru**
2. **Pergi ke:** https://supabase.com/dashboard
3. **Login** dengan akun Supabase anda
4. **Pilih project "Investoft"**

---

### **Step 7b: Buka SQL Editor**

1. Di **sidebar kiri**, cari dan klik **"SQL Editor"**
2. Atau cari icon **⚡ (petir)** dengan label "SQL"

---

### **Step 7c: Get User ID**

**Copy-paste SQL ini** di SQL Editor:

```sql
SELECT id FROM auth.users WHERE email = 'admin@test.com';
```

**GANTI `admin@test.com`** dengan email yang anda pakai saat Sign Up tadi!

**Contoh:**
- Kalau tadi anda daftar dengan `myemail@gmail.com`, ganti jadi:
  ```sql
  SELECT id FROM auth.users WHERE email = 'myemail@gmail.com';
  ```

**Klik RUN** (atau tekan Ctrl+Enter)

**Akan muncul hasil seperti:**
```
| id                                   |
|--------------------------------------|
| abc123-def456-789ghi-012jkl-345mno   |
```

**COPY** id tersebut (highlight → Ctrl+C)

---

### **Step 7d: Update Role ke Admin**

**Copy-paste SQL ini:**

```sql
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:PASTE_USER_ID_HERE';
```

**GANTI `PASTE_USER_ID_HERE`** dengan id yang anda copy tadi!

**Contoh setelah diganti:**
```sql
UPDATE kv_store_20da1dab
SET value = jsonb_set(value::jsonb, '{role}', '"admin"')
WHERE key = 'user:abc123-def456-789ghi-012jkl-345mno';
```

**Klik RUN**

**Akan muncul:** `Success. No rows returned.` ✅

---

### **Step 7e: Logout dari Aplikasi**

1. **Kembali ke tab aplikasi Investoft**
2. **Di Member Dashboard**, cari button **"Logout"** (biasanya pojok kanan atas atau di menu)
3. **Klik Logout**
4. **Anda akan kembali ke Landing Page**

---

### **Step 7f: Login Lagi**

1. **Klik tombol "Log In"** (pojok kanan atas)
2. **Modal Login muncul**
3. **Masukkan email & password** yang sama seperti saat Sign Up tadi:
   ```
   Email: admin@test.com
   Password: admin123
   ```
4. **Klik "Sign In"**

**BOOM!** 🎉 **Anda sekarang masuk ke ADMIN PANEL!**

---

## ✅ BERHASIL!

Kalau berhasil, anda akan lihat:

```
╔═══════════════════════════════════════════════════════╗
║ SIDEBAR        │  ADMIN DASHBOARD                     ║
║ ═══════════    │                                      ║
║ 📊 Overview    │  ┌──────┐ ┌──────┐ ┌──────┐        ║
║ 👥 Members     │  │Stats │ │Stats │ │Stats │        ║
║ ✅ KYC         │  └──────┘ └──────┘ └──────┘        ║
║ 💸 Withdrawals │                                      ║
║ ...            │  [Pending Queues]                    ║
╚═══════════════════════════════════════════════════════╝
     ↑
  Ini ADMIN
   PANEL!
```

---

## 🎯 RINGKASAN SINGKAT

**"Sign Up via UI"** = Cara normal daftar akun seperti di website-website lain

**Langkah-langkahnya:**
1. Buka website → Klik "Sign Up"
2. Isi form (Name, Email, Password)
3. Klik "Sign Up" button
4. Auto login sebagai member
5. Buka Supabase → SQL Editor
6. Get user ID dengan `SELECT id FROM auth.users WHERE...`
7. Update role dengan `UPDATE kv_store_20da1dab SET...`
8. Logout dari app
9. Login lagi → Jadi Admin! ✅

---

## 🆚 PERBEDAAN 2 METHOD

### **METHOD 1: Sign Up via UI (yang ini)**
```
✅ Mudah (pakai form di website)
✅ Aman (pakai fitur built-in)
✅ Visual (bisa lihat form)
❌ Perlu 2 langkah (sign up + promote)
```

### **METHOD 2: SQL Direct**
```
❌ Susah (harus tulis SQL panjang)
❌ Rawan typo (banyak field)
✅ Cepat (1x run langsung jadi)
✅ Untuk advanced users
```

---

## 📞 MASIH BINGUNG?

**Kalau masih bingung, saya bisa buatkan video tutorial atau screenshot lebih detail!**

**Atau langsung pakai METHOD 2 (SQL Direct) aja:**

Copy-paste SQL ini di Supabase SQL Editor:

```sql
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'admin@investoft.com', crypt('AdminPass123!', gen_salt('bf')), now(), now(), now(), '{"name": "Super Admin"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO kv_store_20da1dab (key, value)
VALUES ('user:22222222-2222-2222-2222-222222222222', jsonb_build_object('id', '22222222-2222-2222-2222-222222222222', 'email', 'admin@investoft.com', 'name', 'Super Admin', 'balance', 50000, 'createdAt', now()::text, 'role', 'admin'))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

**Lalu login dengan:**
```
Email: admin@investoft.com
Password: AdminPass123!
```

**Langsung jadi admin!** ✅

---

**Semoga jelas sekarang!** 😊
