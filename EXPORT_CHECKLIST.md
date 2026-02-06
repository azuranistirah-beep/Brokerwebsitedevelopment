# ✅ CHECKLIST EXPORT FILE KE ROCKET.NEW

## 📋 PRIORITY 1: FILE UTAMA (WAJIB!)

### **Config & Setup**
- [ ] `/package.json` - Dependencies list
- [ ] `/vite.config.ts` - Vite configuration
- [ ] `/postcss.config.mjs` - PostCSS config
- [ ] `/utils/supabase/info.tsx` - Supabase credentials (UPDATE DENGAN CREDENTIALS BARU!)

### **Main App**
- [ ] `/src/app/App.tsx` - Main application component

### **Core Pages**
- [ ] `/src/app/components/LandingPage.tsx` - Homepage
- [ ] `/src/app/components/MarketsPage.tsx` - Trading Demo (FITUR TERPENTING!)
- [ ] `/src/app/components/NewsPage.tsx` - News feed
- [ ] `/src/app/components/MemberDashboard.tsx` - User dashboard
- [ ] `/src/app/components/AdminDashboard.tsx` - Admin panel
- [ ] `/src/app/components/ChartPage.tsx` - Full chart view
- [ ] `/src/app/components/ScreenerPage.tsx` - Market screener

### **Backend (CRITICAL!)**
- [ ] `/supabase/functions/server/index.tsx` - API server
- [ ] `/supabase/functions/server/kv_store.tsx` - Database utilities

### **Styles**
- [ ] `/src/styles/index.css` - Main styles
- [ ] `/src/styles/tailwind.css` - Tailwind config
- [ ] `/src/styles/theme.css` - Theme tokens
- [ ] `/src/styles/fonts.css` - Font imports

---

## 📋 PRIORITY 2: KOMPONEN SHARED

### **Navigation & Layout**
- [ ] `/src/app/components/PublicHeader.tsx`
- [ ] `/src/app/components/PublicFooter.tsx`
- [ ] `/src/app/components/AuthModal.tsx`
- [ ] `/src/app/components/LegalModal.tsx`
- [ ] `/src/app/components/AdminSetup.tsx`

### **Trading Components**
- [ ] `/src/app/components/TradingChart.tsx` - TradingView integration
- [ ] `/src/app/components/PositionCountdown.tsx` - Timer countdown
- [ ] `/src/app/components/MiniChart.tsx` - Small charts
- [ ] `/src/app/components/TickerTape.tsx` - Ticker widget
- [ ] `/src/app/components/MarketTicker.tsx` - Market ticker

### **Data Display**
- [ ] `/src/app/components/LiveMarketOverview.tsx`
- [ ] `/src/app/components/PopularAssets.tsx`

### **Utilities**
- [ ] `/src/app/components/figma/ImageWithFallback.tsx`
- [ ] `/src/app/lib/supabaseClient.ts`

---

## 📋 PRIORITY 3: UI COMPONENTS (Shadcn/UI)

**CATATAN:** Rocket.new mungkin sudah punya shadcn/ui. Cek dulu sebelum copy!

### **Essential UI Components (10 files - WAJIB!)**
- [ ] `/src/app/components/ui/button.tsx`
- [ ] `/src/app/components/ui/card.tsx`
- [ ] `/src/app/components/ui/input.tsx`
- [ ] `/src/app/components/ui/badge.tsx`
- [ ] `/src/app/components/ui/tabs.tsx`
- [ ] `/src/app/components/ui/dialog.tsx`
- [ ] `/src/app/components/ui/select.tsx`
- [ ] `/src/app/components/ui/label.tsx`
- [ ] `/src/app/components/ui/sonner.tsx` - Toast notifications
- [ ] `/src/app/components/ui/utils.ts` - CN utility

### **Optional UI Components (30 files - Install jika perlu)**
- [ ] `/src/app/components/ui/accordion.tsx`
- [ ] `/src/app/components/ui/alert-dialog.tsx`
- [ ] `/src/app/components/ui/alert.tsx`
- [ ] `/src/app/components/ui/aspect-ratio.tsx`
- [ ] `/src/app/components/ui/avatar.tsx`
- [ ] `/src/app/components/ui/breadcrumb.tsx`
- [ ] `/src/app/components/ui/calendar.tsx`
- [ ] `/src/app/components/ui/carousel.tsx`
- [ ] `/src/app/components/ui/chart.tsx`
- [ ] `/src/app/components/ui/checkbox.tsx`
- [ ] `/src/app/components/ui/collapsible.tsx`
- [ ] `/src/app/components/ui/command.tsx`
- [ ] `/src/app/components/ui/context-menu.tsx`
- [ ] `/src/app/components/ui/drawer.tsx`
- [ ] `/src/app/components/ui/dropdown-menu.tsx`
- [ ] `/src/app/components/ui/form.tsx`
- [ ] `/src/app/components/ui/hover-card.tsx`
- [ ] `/src/app/components/ui/input-otp.tsx`
- [ ] `/src/app/components/ui/menubar.tsx`
- [ ] `/src/app/components/ui/navigation-menu.tsx`
- [ ] `/src/app/components/ui/pagination.tsx`
- [ ] `/src/app/components/ui/popover.tsx`
- [ ] `/src/app/components/ui/progress.tsx`
- [ ] `/src/app/components/ui/radio-group.tsx`
- [ ] `/src/app/components/ui/resizable.tsx`
- [ ] `/src/app/components/ui/scroll-area.tsx`
- [ ] `/src/app/components/ui/separator.tsx`
- [ ] `/src/app/components/ui/sheet.tsx`
- [ ] `/src/app/components/ui/sidebar.tsx`
- [ ] `/src/app/components/ui/skeleton.tsx`
- [ ] `/src/app/components/ui/slider.tsx`
- [ ] `/src/app/components/ui/switch.tsx`
- [ ] `/src/app/components/ui/table.tsx`
- [ ] `/src/app/components/ui/textarea.tsx`
- [ ] `/src/app/components/ui/toggle-group.tsx`
- [ ] `/src/app/components/ui/toggle.tsx`
- [ ] `/src/app/components/ui/tooltip.tsx`
- [ ] `/src/app/components/ui/use-mobile.ts`

---

## 🚀 CARA EXPORT TERCEPAT

### **Option 1: Manual Copy-Paste (Recommended untuk rocket.new)**

1. **Buka Figma Make di tab browser**
2. **Buka rocket.new di tab lain**
3. **Copy file satu per satu** mengikuti checklist di atas
4. **Prioritaskan PRIORITY 1 dulu!**

### **Option 2: Download ZIP (Jika tersedia)**

Jika Figma Make punya fitur "Export Project":
1. Klik Export/Download
2. Extract ZIP file
3. Upload ke rocket.new atau GitHub
4. Import dari GitHub ke rocket.new

### **Option 3: Via GitHub (Paling Reliable)**

```bash
# 1. Create GitHub repo baru
# 2. Di local machine, clone repo Figma Make (jika ada akses)
# 3. Push ke GitHub
git add .
git commit -m "Initial Investoft platform"
git push origin main

# 4. Di rocket.new, pilih "Import from GitHub"
```

---

## ⚡ QUICK START GUIDE UNTUK ROCKET.NEW

### **1. Setup Project Structure**
```bash
# Di rocket.new terminal
npm create vite@latest investoft -- --template react-ts
cd investoft
```

### **2. Install Dependencies (Copy dari package.json)**
```bash
npm install
```

### **3. Copy Files**
- Start dengan PRIORITY 1 files
- Test setelah copy setiap major component
- Fix import paths jika perlu

### **4. Setup Environment Variables**
Di rocket.new settings atau `.env`:
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
NEWS_API_KEY=your-newsapi-key
```

### **5. Run Development Server**
```bash
npm run dev
```

### **6. Test Features**
- [ ] Homepage loads
- [ ] Trading Demo works
- [ ] News page shows articles
- [ ] Charts display
- [ ] Login/Signup works

---

## 📦 FILE SIZE REFERENCE

**Total Project Size:** ~2-3 MB

**Breakdown:**
- Frontend Components: ~500 KB
- UI Components (shadcn): ~800 KB  
- Backend: ~50 KB
- Styles: ~20 KB
- Config: ~10 KB
- node_modules: ~300 MB (akan di-install otomatis)

---

## 🔥 PRO TIPS

1. **Copy PRIORITY 1 dulu** - Pastikan app bisa running sebelum copy UI components
2. **Test incrementally** - Jangan copy semua sekaligus
3. **Use shadcn CLI di rocket.new** - Lebih cepat daripada manual copy UI components:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button card input badge tabs
   ```
4. **Deploy Supabase Edge Function ASAP** - Backend harus jalan dulu
5. **Update credentials immediately** - Jangan lupa ganti Supabase URL/keys!

---

## ✅ FINAL CHECKLIST SEBELUM GO LIVE

- [ ] All PRIORITY 1 files copied
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Supabase Edge Function deployed
- [ ] Database configured
- [ ] App runs without errors
- [ ] Trading Demo works
- [ ] News loads
- [ ] Charts display
- [ ] Auth works
- [ ] Admin dashboard accessible

---

**ESTIMASI WAKTU MIGRASI: 30-60 menit**

Good luck! 🚀
