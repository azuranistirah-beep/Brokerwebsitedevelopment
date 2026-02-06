# 🚀 PANDUAN MIGRASI INVESTOFT KE ROCKET.NEW

## 📋 RINGKASAN PROJECT

**Nama Project:** Investoft Trading Platform  
**Tech Stack:** React + TypeScript + Tailwind CSS v4 + Supabase  
**Fitur Utama:**
- ✅ Trading Demo dengan TradingView Charts
- ✅ Real-time Price Tracking
- ✅ News Integration (NewsAPI.org)
- ✅ User Authentication (Supabase Auth)
- ✅ Admin Dashboard
- ✅ Market Screener & Live Overview

---

## 🎯 LANGKAH MIGRASI KE ROCKET.NEW

### **STEP 1: Buka rocket.new**
1. Buka browser: `https://rocket.new`
2. Login atau Sign up
3. Create New Project → **"Import from GitHub"** atau **"Start Blank"**

---

### **STEP 2: Setup Project Structure**

Di rocket.new, buat struktur folder seperti ini:

```
investoft/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminSetup.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── ChartPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LegalModal.tsx
│   │   │   ├── LiveMarketOverview.tsx
│   │   │   ├── MarketTicker.tsx
│   │   │   ├── MarketsPage.tsx
│   │   │   ├── MemberDashboard.tsx
│   │   │   ├── MiniChart.tsx
│   │   │   ├── NewsPage.tsx
│   │   │   ├── PopularAssets.tsx
│   │   │   ├── PositionCountdown.tsx
│   │   │   ├── PublicFooter.tsx
│   │   │   ├── PublicHeader.tsx
│   │   │   ├── ScreenerPage.tsx
│   │   │   ├── TickerTape.tsx
│   │   │   ├── TradingChart.tsx
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx
│   │   │   └── ui/ (semua komponen UI)
│   │   └── lib/
│   │       └── supabaseClient.ts
│   └── styles/
│       ├── fonts.css
│       ├── index.css
│       ├── tailwind.css
│       └── theme.css
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx
│           └── kv_store.tsx
├── utils/
│   └── supabase/
│       └── info.tsx
├── package.json
├── vite.config.ts
└── postcss.config.mjs
```

---

### **STEP 3: Copy Semua File**

**CARA TERMUDAH:**
1. Di Figma Make, klik kanan pada setiap file
2. Select All → Copy code
3. Paste ke rocket.new editor

**ATAU:**

Saya sudah siapkan list file yang perlu dicopy (lihat section di bawah).

---

### **STEP 4: Install Dependencies**

Di terminal rocket.new, jalankan:

```bash
npm install @emotion/react@11.14.0 @emotion/styled@11.14.1
npm install @mui/icons-material@7.3.5 @mui/material@7.3.5
npm install @popperjs/core@2.11.8
npm install @radix-ui/react-accordion@1.2.3
npm install @radix-ui/react-alert-dialog@1.1.6
npm install @radix-ui/react-aspect-ratio@1.1.2
npm install @radix-ui/react-avatar@1.1.3
npm install @radix-ui/react-checkbox@1.1.4
npm install @radix-ui/react-collapsible@1.1.3
npm install @radix-ui/react-context-menu@2.2.6
npm install @radix-ui/react-dialog@1.1.6
npm install @radix-ui/react-dropdown-menu@2.1.6
npm install @radix-ui/react-hover-card@1.1.6
npm install @radix-ui/react-label@2.1.2
npm install @radix-ui/react-menubar@1.1.6
npm install @radix-ui/react-navigation-menu@1.2.5
npm install @radix-ui/react-popover@1.1.6
npm install @radix-ui/react-progress@1.1.2
npm install @radix-ui/react-radio-group@1.2.3
npm install @radix-ui/react-scroll-area@1.2.3
npm install @radix-ui/react-select@2.1.6
npm install @radix-ui/react-separator@1.1.2
npm install @radix-ui/react-slider@1.2.3
npm install @radix-ui/react-slot@1.1.2
npm install @radix-ui/react-switch@1.1.3
npm install @radix-ui/react-tabs@1.1.3
npm install @radix-ui/react-toggle@1.1.2
npm install @radix-ui/react-toggle-group@1.1.2
npm install @radix-ui/react-tooltip@1.1.8
npm install @supabase/supabase-js@^2.95.0
npm install class-variance-authority@0.7.1
npm install clsx@2.1.1
npm install cmdk@1.1.1
npm install date-fns@3.6.0
npm install embla-carousel-react@8.6.0
npm install input-otp@1.4.2
npm install lucide-react@0.487.0
npm install motion@12.23.24
npm install next-themes@0.4.6
npm install react-day-picker@8.10.1
npm install react-dnd@16.0.1
npm install react-dnd-html5-backend@16.0.1
npm install react-hook-form@7.55.0
npm install react-popper@2.3.0
npm install react-resizable-panels@2.1.7
npm install react-responsive-masonry@2.7.1
npm install react-slick@0.31.0
npm install recharts@2.15.2
npm install sonner@2.0.3
npm install tailwind-merge@3.2.0
npm install tw-animate-css@1.3.8
npm install vaul@1.1.2

# Dev Dependencies
npm install -D @tailwindcss/vite@4.1.12
npm install -D @vitejs/plugin-react@4.7.0
npm install -D tailwindcss@4.1.12
npm install -D vite@6.3.5
```

**ATAU install sekaligus:**
```bash
npm install
```

---

### **STEP 5: Setup Supabase**

**A. Create Supabase Project:**
1. Buka https://supabase.com
2. Create New Project
3. Copy credentials:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

**B. Setup Environment Variables di rocket.new:**

Buat file `.env` atau `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEWS_API_KEY=your-newsapi-key
```

**C. Deploy Supabase Edge Function:**

Di terminal Supabase:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy make-server-20da1dab
```

**D. Set Environment Variables di Supabase:**
```bash
supabase secrets set NEWS_API_KEY=your-key-here
```

---

### **STEP 6: Update File Path**

Di file `/utils/supabase/info.tsx`, update:

```typescript
export const projectId = "YOUR_SUPABASE_PROJECT_ID"; // Ganti dengan ID project Supabase baru
export const publicAnonKey = "YOUR_SUPABASE_ANON_KEY"; // Ganti dengan anon key baru
```

---

### **STEP 7: Run Development Server**

```bash
npm run dev
```

Atau di rocket.new biasanya otomatis running preview.

---

## 📦 DAFTAR FILE YANG PERLU DICOPY

### **1. Frontend Components (22 files utama)**
- `/src/app/App.tsx`
- `/src/app/components/AdminDashboard.tsx`
- `/src/app/components/AdminSetup.tsx`
- `/src/app/components/AuthModal.tsx`
- `/src/app/components/ChartPage.tsx`
- `/src/app/components/LandingPage.tsx`
- `/src/app/components/LegalModal.tsx`
- `/src/app/components/LiveMarketOverview.tsx`
- `/src/app/components/MarketTicker.tsx`
- `/src/app/components/MarketsPage.tsx`
- `/src/app/components/MemberDashboard.tsx`
- `/src/app/components/MiniChart.tsx`
- `/src/app/components/NewsPage.tsx`
- `/src/app/components/PopularAssets.tsx`
- `/src/app/components/PositionCountdown.tsx`
- `/src/app/components/PublicFooter.tsx`
- `/src/app/components/PublicHeader.tsx`
- `/src/app/components/ScreenerPage.tsx`
- `/src/app/components/TickerTape.tsx`
- `/src/app/components/TradingChart.tsx`
- `/src/app/components/figma/ImageWithFallback.tsx`
- `/src/app/lib/supabaseClient.ts`

### **2. UI Components (~40 files)**
Semua file di `/src/app/components/ui/`

### **3. Styles (4 files)**
- `/src/styles/fonts.css`
- `/src/styles/index.css`
- `/src/styles/tailwind.css`
- `/src/styles/theme.css`

### **4. Backend (2 files)**
- `/supabase/functions/server/index.tsx`
- `/supabase/functions/server/kv_store.tsx`

### **5. Config Files (4 files)**
- `/package.json`
- `/vite.config.ts`
- `/postcss.config.mjs`
- `/utils/supabase/info.tsx`

**TOTAL: ~72 files**

---

## ⚙️ ENVIRONMENT VARIABLES YANG DIPERLUKAN

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:...

# NewsAPI
NEWS_API_KEY=your-newsapi-key-here
```

---

## 🔧 TROUBLESHOOTING

### **Problem 1: Module not found errors**
**Solution:** 
```bash
npm install
npm run dev
```

### **Problem 2: Supabase connection errors**
**Solution:** 
- Check `.env` file ada dan benar
- Pastikan Supabase Edge Function sudah deployed
- Check CORS settings di Supabase

### **Problem 3: TradingView chart tidak muncul**
**Solution:**
- TradingView widget load dari CDN, pastikan koneksi internet OK
- Check console untuk errors

### **Problem 4: News tidak muncul**
**Solution:**
- Pastikan `NEWS_API_KEY` sudah diset di Supabase secrets
- Check backend logs: `supabase functions logs make-server-20da1dab`

---

## 📝 CATATAN PENTING

1. **Database Schema:** Project ini menggunakan KV Store (key-value), tidak ada SQL migrations yang perlu dijalankan.

2. **First Admin Setup:** Setelah deploy, buka `/admin-setup` untuk create admin account pertama.

3. **Demo Account:** Trading demo menggunakan local state, tidak perlu database.

4. **NewsAPI Free Tier:** Terbatas 100 requests/day. Upgrade ke paid jika perlu lebih.

---

## 🚀 NEXT STEPS SETELAH MIGRASI

1. ✅ Test semua fitur (Login, Trading Demo, News, Charts)
2. ✅ Deploy ke production (Vercel, Netlify, atau hosting lain)
3. ✅ Setup custom domain
4. ✅ Configure Supabase Auth providers (Google, Facebook, dll)
5. ✅ Setup monitoring & analytics

---

## 📞 SUPPORT

Jika ada masalah saat migrasi:
1. Check browser console untuk errors
2. Check Supabase function logs
3. Verify environment variables
4. Pastikan semua dependencies terinstall

---

**GOOD LUCK! 🎉**

Project Investoft Anda siap dilanjutkan di rocket.new!
