# 🔐 Investoft - Panduan Login ke Member Dashboard

## 📋 Cara Login ke Member Dashboard

### **Metode 1: Signup & Login (Untuk User Baru)**

1. **Buka Landing Page**
   - Akses aplikasi di URL: `http://localhost:5173/` atau URL production Anda
   - Anda akan melihat halaman landing dengan hero section

2. **Klik Tombol "Start Trading Free"**
   - Di hero section, klik tombol biru dengan gradient "Start Trading Free"
   - Modal authentication akan terbuka

3. **Tab Sign Up (Default)**
   - Isi form signup dengan:
     - **Full Name**: Nama lengkap Anda
     - **Email**: Email valid Anda
     - **Phone Number**: Nomor telepon (optional, bisa dilewati)
     - **Password**: Minimal 8 karakter, kombinasi huruf, angka, dan simbol
   - Lihat password strength indicator (Weak/Medium/Strong)
   - Klik tombol "Create Account"

4. **Approval Admin**
   - Status akun: **Pending** (menunggu persetujuan admin)
   - Anda akan melihat notifikasi: "Account created! Your account is awaiting admin approval."
   - Admin harus approve akun Anda terlebih dahulu

5. **Login Setelah Approval**
   - Klik tombol "Sign In" atau "Login" di header
   - Modal akan terbuka dengan tab "Sign In"
   - Masukkan email dan password yang sudah didaftarkan
   - Klik "Sign In"

6. **Redirect Otomatis**
   - Setelah login berhasil, Anda akan otomatis diarahkan ke `/member`
   - Member Dashboard akan muncul dengan:
     - Demo Balance: **$10,000**
     - TradingView chart real-time
     - Trading panel (UP/DOWN buttons)
     - Win rate, total trades, open positions stats

---

### **Metode 2: Quick Test Account (Demo/Development)**

Jika Anda ingin langsung test tanpa signup:

1. **Setup Auto Admin**
   - Pertama kali buka aplikasi, akan ada auto setup admin
   - Ikuti instruksi untuk create admin account

2. **Create Test User via Admin Dashboard**
   - Login sebagai admin di `/admin`
   - Buat user baru dengan status "Approved"
   - Login menggunakan email/password user tersebut

---

## 🎯 Flow Login yang Benar

```
Landing Page
    ↓
Klik "Start Trading Free" atau "Sign In"
    ↓
Modal Authentication Terbuka
    ↓
[NEW USER]              [EXISTING USER]
Sign Up Tab             Sign In Tab
    ↓                       ↓
Fill Form               Enter Email + Password
    ↓                       ↓
Submit                  Click "Sign In"
    ↓                       ↓
Pending Approval        Check Session
    ↓                       ↓
Admin Approve           Redirect to /member
    ↓                       ↓
Sign In Again           ✅ Member Dashboard
    ↓
✅ Member Dashboard
```

---

## 🚀 Fitur Member Dashboard

Setelah berhasil login, Anda akan melihat:

### **1. Trading Section (Default Tab)**
- **TradingView Chart**: Real-time chart dari TradingView dengan data Binance
- **Current Price Display**: Harga real-time dengan badge trend (UP/DOWN)
- **Quick Stats Cards**:
  - 🏆 **Win Rate**: Persentase kemenangan Anda
  - 📊 **Total Trades**: Jumlah total trading
  - ⏰ **Open Positions**: Posisi yang sedang berjalan

### **2. Trading Panel (Sidebar Kanan)**
- **Asset Selector**: Pilih BTC, ETH, EUR/USD, GBP/USD, atau Gold
- **Investment Amount**: Pilih $10 - $1000
- **Duration**: Pilih 1m, 5m, 15m, atau 30m
- **UP/DOWN Buttons**: Tombol hijau (UP) dan merah (DOWN) untuk trading

### **3. Positions Tab**
- Lihat semua posisi yang sedang terbuka
- Countdown timer untuk setiap posisi
- Status real-time: Winning atau Losing
- Auto close ketika waktu habis

### **4. History Tab**
- Riwayat semua trade (WIN/LOSS)
- Detail entry price, exit price, amount
- Profit/loss untuk setiap trade
- Badge status WIN/LOSS

---

## 💡 Tips Trading

1. **Demo Balance**: Anda mulai dengan $10,000 demo balance
2. **Risk Free**: Ini adalah demo account, tidak menggunakan uang real
3. **Real-time Prices**: Harga 100% match dengan TradingView (sumber: Binance 1m Candle)
4. **Payout**: 95% profit jika WIN (contoh: trade $100, profit $95)
5. **Auto Close**: Posisi akan otomatis close sesuai duration yang dipilih

---

## 🔒 Logout

Untuk logout dari Member Dashboard:
1. Klik icon **Logout** (ikon pintu keluar) di pojok kanan atas header
2. Anda akan otomatis diarahkan kembali ke landing page
3. Session akan dihapus dari localStorage

---

## ❓ Troubleshooting

### **Tidak bisa login?**
- Pastikan email dan password benar
- Pastikan akun sudah di-approve oleh admin
- Cek console browser untuk error messages

### **Tidak ada data harga?**
- Pastikan backend server running
- Cek network tab untuk API calls ke `/assets`
- Tunggu beberapa detik untuk initial price data

### **Balance tidak update?**
- Pastikan backend endpoint `/update-balance` berfungsi
- Cek console log untuk error messages
- Balance akan update otomatis setelah posisi close

---

## 📱 URL Reference

- **Landing Page**: `/`
- **Member Dashboard**: `/member`
- **Admin Dashboard**: `/admin`
- **Markets Page**: `/markets`
- **Chart Page**: `/chart`
- **Screener Page**: `/screener`

---

## 🎨 Design Features

- ✅ Full dark theme (slate-950 background)
- ✅ Professional OlympTrade-inspired UI
- ✅ Real-time price updates
- ✅ Smooth animations and transitions
- ✅ Responsive design (desktop + mobile)
- ✅ Live indicators (pulsing dots, badges)

---

**Selamat trading! 🚀📈**
