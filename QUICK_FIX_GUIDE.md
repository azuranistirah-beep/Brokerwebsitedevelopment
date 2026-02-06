# 🔧 QUICK FIX GUIDE - Investoft

## ✅ MASALAH YANG BARU SAJA DIPERBAIKI

### Error: "Failed to fetch dynamically imported module"

**Penyebab:**
- Missing entry point files (`/src/main.tsx` dan `/index.html`)
- Missing dev script di `package.json`

**Yang sudah diperbaiki:**
1. ✅ Created `/src/main.tsx` - Entry point untuk React app
2. ✅ Created `/index.html` - HTML template
3. ✅ Updated `/package.json` - Added `dev`, `build`, dan `preview` scripts

**Struktur file sekarang LENGKAP:**
```
investoft/
├── index.html              ✅ BARU
├── src/
│   ├── main.tsx           ✅ BARU
│   ├── app/
│   │   └── App.tsx        ✅ (sudah ada)
│   └── styles/
└── package.json           ✅ (updated)
```

---

## 🚀 CARA MENJALANKAN PROJECT

### **1. Di Figma Make (Sekarang!)**

Project sekarang harus bisa jalan! Refresh browser Anda.

Jika masih error, coba:
1. Hard refresh: `Ctrl + Shift + R` (Windows) atau `Cmd + Shift + R` (Mac)
2. Clear cache browser
3. Tutup dan buka kembali Figma Make

### **2. Di Local Machine**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser at http://localhost:5173
```

### **3. Di rocket.new (Setelah push ke GitHub)**

```bash
# Push ke GitHub
git add .
git commit -m "Fix: Add missing entry point files"
git push origin main

# Import ke rocket.new
# - Go to https://rocket.new
# - Import from GitHub
# - Select your repository
# - Deploy!
```

---

## 📋 FILE YANG BARU DITAMBAHKAN

### **1. `/src/main.tsx`**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Fungsi:** Entry point React app, mount App component ke DOM

---

### **2. `/index.html`**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Investoft - Modern trading platform" />
    <title>Investoft - Trading Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Fungsi:** HTML template, load React app via `/src/main.tsx`

---

### **3. `/package.json` (updated)**

**Perubahan:**
```json
"scripts": {
  "dev": "vite",           // ✅ BARU - Run development server
  "build": "vite build",   // ✅ (sudah ada)
  "preview": "vite preview" // ✅ BARU - Preview production build
}
```

**Fungsi:** 
- `npm run dev` → Start development server
- `npm run build` → Build untuk production
- `npm run preview` → Preview production build locally

---

## 🔍 VERIFIKASI

### **Checklist - Pastikan semua file ada:**

```bash
# Check entry point files
✅ /index.html
✅ /src/main.tsx
✅ /src/app/App.tsx

# Check config files
✅ /package.json
✅ /vite.config.ts
✅ /postcss.config.mjs

# Check styles
✅ /src/styles/index.css
✅ /src/styles/tailwind.css
✅ /src/styles/theme.css
✅ /src/styles/fonts.css

# Check utils
✅ /utils/supabase/info.tsx
✅ /src/app/lib/supabaseClient.ts
```

### **Test Commands:**

```bash
# Test dev server starts
npm run dev
# Should start at http://localhost:5173

# Test build works
npm run build
# Should create /dist folder

# Test preview works
npm run preview
# Should start preview server
```

---

## 🐛 TROUBLESHOOTING LANJUTAN

### **Error 1: "Cannot find module 'react'"**

**Fix:**
```bash
npm install react@18.3.1 react-dom@18.3.1
```

### **Error 2: "Port 5173 already in use"**

**Fix:**
```bash
# Kill the process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9

# Or use different port:
npm run dev -- --port 3000
```

### **Error 3: "Module not found: @supabase/supabase-js"**

**Fix:**
```bash
npm install @supabase/supabase-js@^2.95.0
```

### **Error 4: "Cannot resolve 'figma:asset/...' "**

**Explanation:** 
`figma:asset` adalah virtual module khusus Figma Make. 

**Di rocket.new/local development:**
- Gambar tidak akan muncul (karena `figma:asset` hanya work di Figma Make)
- App tetap jalan, hanya gambar yang broken
- Replace dengan Unsplash images atau upload manual

**Quick fix untuk development:**
```typescript
// Ganti ini:
import img from "figma:asset/abc123.png";

// Dengan ini:
const img = "https://via.placeholder.com/400x300";
// atau Unsplash:
const img = "https://images.unsplash.com/photo-...";
```

### **Error 5: TradingView widget not loading**

**Fix:**
```bash
# Check internet connection (TradingView loads from CDN)
# Check browser console for errors
# Make sure no ad blocker blocking TradingView
```

### **Error 6: News feed empty**

**Fix:**
```bash
# 1. Check Supabase Edge Function deployed
supabase functions list

# 2. Check NEWS_API_KEY set in Supabase
supabase secrets list

# 3. Set NEWS_API_KEY if missing
supabase secrets set NEWS_API_KEY=your-key-here

# 4. Redeploy function
supabase functions deploy make-server-20da1dab --no-verify-jwt

# 5. Check function logs
supabase functions logs make-server-20da1dab
```

---

## 📦 UNTUK MIGRASI KE ROCKET.NEW

### **Files yang WAJIB ada sebelum push ke GitHub:**

```
✅ /index.html              (BARU DIBUAT)
✅ /src/main.tsx            (BARU DIBUAT)
✅ /package.json            (UPDATED)
✅ /.gitignore              (sudah ada)
✅ /.env.example            (sudah ada)
✅ /README.md               (sudah ada)
✅ /vite.config.ts          (sudah ada)
```

### **Quick Push Command:**

```bash
# Add all files
git add .

# Commit with fix message
git commit -m "Fix: Add missing entry point files (main.tsx, index.html)"

# Push to GitHub
git push origin main
```

### **Import ke rocket.new:**

1. Go to https://rocket.new
2. Click "Import from GitHub"
3. Select repository: `investoft`
4. rocket.new will auto-detect:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
5. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Click **Deploy**!

---

## ✅ STATUS CHECK

### **Sebelum migrasi, pastikan:**

- [ ] App bisa jalan di Figma Make (refresh browser)
- [ ] `/index.html` ada
- [ ] `/src/main.tsx` ada
- [ ] `/package.json` punya scripts: `dev`, `build`, `preview`
- [ ] All components import correctly
- [ ] No console errors (kecuali Supabase connection yang normal)

### **Siap untuk rocket.new jika:**

- [ ] Semua file sudah dicopy ke local
- [ ] GitHub repository created
- [ ] All files pushed to GitHub
- [ ] Supabase project ready (optional, bisa setup nanti)
- [ ] NewsAPI key ready (optional, bisa setup nanti)

---

## 🎉 SUCCESS INDICATORS

**App berhasil jalan jika:**

✅ Homepage loads (Landing Page)
✅ Navigation works (Markets, Charts, Screener, News)
✅ TradingView charts display
✅ No critical errors di console
✅ Styling looks correct (white background, proper colors)

**Backend works jika:**

✅ News feed shows articles
✅ Login/Signup works
✅ User dapat masuk ke dashboard
✅ Trading Demo dapat melakukan trade

---

## 📞 NEXT STEPS

1. **Test app di Figma Make** (refresh browser)
2. **Copy semua files ke local** (prepare untuk GitHub)
3. **Push ke GitHub** (ikuti panduan di DEPLOY_GITHUB_ROCKET.md)
4. **Import ke rocket.new**
5. **Setup Supabase** (ikuti panduan di README.md)
6. **Deploy!** 🚀

---

**Problem solved! App sekarang harus bisa jalan! 💪**

Jika masih ada error, pastikan:
- Hard refresh browser (Ctrl+Shift+R)
- Check console untuk error messages
- Verify semua file ada di tempatnya
