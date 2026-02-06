# 🚀 DEPLOY KE ROCKET.NEW VIA GITHUB

## 📋 LANGKAH-LANGKAH LENGKAP

### **STEP 1: PUSH KE GITHUB (10 menit)**

#### **A. Buat Repository Baru di GitHub**

1. **Buka GitHub:** https://github.com/new
2. **Isi informasi:**
   - Repository name: `investoft`
   - Description: `Modern trading platform with real-time charts and demo trading`
   - Visibility: **Public** (atau Private jika Anda punya GitHub Pro)
3. **JANGAN centang** "Add README" (kita sudah punya)
4. **JANGAN centang** "Add .gitignore" (kita sudah punya)
5. **Klik "Create repository"**

#### **B. Copy Semua File dari Figma Make**

**CARA TERCEPAT - Manual Download:**

1. Di Figma Make, buka File Explorer
2. Untuk setiap file, klik kanan → "Download" atau copy code
3. Save ke folder lokal di komputer Anda dengan struktur yang sama

**Atau gunakan checklist ini untuk copy paste manual:**

✅ **Files yang WAJIB dicopy (Priority 1):**
```
/package.json
/vite.config.ts
/postcss.config.mjs
/.gitignore
/.env.example
/README.md

/src/app/App.tsx
/src/app/components/LandingPage.tsx
/src/app/components/MarketsPage.tsx
/src/app/components/NewsPage.tsx
/src/app/components/MemberDashboard.tsx
/src/app/components/AdminDashboard.tsx
/src/app/components/ChartPage.tsx
/src/app/components/ScreenerPage.tsx
/src/app/components/TradingChart.tsx
/src/app/components/PositionCountdown.tsx
/src/app/components/PublicHeader.tsx
/src/app/components/PublicFooter.tsx
/src/app/components/AuthModal.tsx
/src/app/components/LegalModal.tsx
/src/app/components/AdminSetup.tsx
/src/app/components/LiveMarketOverview.tsx
/src/app/components/MarketTicker.tsx
/src/app/components/MiniChart.tsx
/src/app/components/PopularAssets.tsx
/src/app/components/TickerTape.tsx

/src/app/components/figma/ImageWithFallback.tsx
/src/app/lib/supabaseClient.ts

/src/styles/index.css
/src/styles/tailwind.css
/src/styles/theme.css
/src/styles/fonts.css

/supabase/functions/server/index.tsx
/supabase/functions/server/kv_store.tsx

/utils/supabase/info.tsx
```

✅ **UI Components (Priority 2) - Copy semua file di:**
```
/src/app/components/ui/
```

#### **C. Initialize Git & Push**

Di terminal/command prompt, navigate ke folder project Anda:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Investoft trading platform"

# 4. Add remote (ganti YOUR-USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/YOUR-USERNAME/investoft.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

**DONE! ✅ Repository Anda sekarang live di GitHub!**

---

### **STEP 2: IMPORT KE ROCKET.NEW (5 menit)**

#### **A. Buka rocket.new**

1. **Go to:** https://rocket.new
2. **Login** atau **Sign up** jika belum punya akun

#### **B. Import dari GitHub**

1. **Klik "New Project"** atau **"Import Project"**
2. **Pilih "Import from GitHub"**
3. **Authorize rocket.new** untuk akses GitHub (jika diminta)
4. **Pilih repository "investoft"** dari list
5. **Klik "Import"**

#### **C. Configure Project Settings**

Rocket.new akan otomatis detect:
- ✅ Framework: Vite + React
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`

**Jika perlu manual config:**
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### **D. Setup Environment Variables**

Di rocket.new project settings, tambahkan environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**JANGAN tambahkan:**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (ini hanya untuk backend/Supabase)
- ❌ `NEWS_API_KEY` (ini diset di Supabase secrets)

#### **E. Deploy!**

Klik **"Deploy"** dan tunggu ~2-3 menit.

Rocket.new akan:
1. ✅ Clone repository
2. ✅ Install dependencies
3. ✅ Build project
4. ✅ Deploy to production

**DONE! ✅ App Anda live di rocket.new!**

---

### **STEP 3: SETUP SUPABASE (10 menit)**

#### **A. Create Supabase Project**

1. **Buka:** https://supabase.com/dashboard
2. **Klik "New Project"**
3. **Isi informasi:**
   - Name: `Investoft`
   - Database Password: (simpan ini dengan aman!)
   - Region: Pilih terdekat dengan user Anda
4. **Klik "Create new project"**
5. **Tunggu ~2 menit** sampai project ready

#### **B. Get Credentials**

1. Di Supabase Dashboard, go to **Settings → API**
2. **Copy credentials:**
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

#### **C. Update Environment Variables**

**Di rocket.new:**
1. Go to **Project Settings → Environment Variables**
2. **Update values:**
   ```env
   VITE_SUPABASE_URL=https://your-actual-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Klik "Save"**
4. **Redeploy** (rocket.new biasanya auto-redeploy)

**Di file `/utils/supabase/info.tsx`:**

Jika rocket.new allow file editing, update:
```typescript
export const projectId = "your-actual-project-id";
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

Atau update di GitHub dan push:
```bash
# Edit file locally
nano utils/supabase/info.tsx

# Commit & push
git add utils/supabase/info.tsx
git commit -m "Update Supabase credentials"
git push
```

Rocket.new akan auto-redeploy setelah push.

#### **D. Deploy Edge Function**

**Install Supabase CLI:**
```bash
npm install -g supabase
```

**Login & Link:**
```bash
# Login
supabase login

# Link project (ganti dengan project ref Anda)
supabase link --project-ref your-project-ref
```

**Deploy function:**
```bash
# Navigate ke folder project
cd investoft

# Deploy
supabase functions deploy make-server-20da1dab --no-verify-jwt
```

**Set secrets:**
```bash
supabase secrets set NEWS_API_KEY=your-newsapi-key-here
```

**Verify deployment:**
```bash
supabase functions list
```

Should show:
```
NAME                      VERSION  STATUS   CREATED AT
make-server-20da1dab      1        ACTIVE   2024-xx-xx
```

---

### **STEP 4: TEST & VERIFY (5 menit)**

#### **A. Test Homepage**

Buka URL rocket.new Anda (contoh: `https://investoft.rocket.new`)

✅ **Check:**
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Styling correct (no broken CSS)

#### **B. Test Trading Demo**

1. Navigate ke **"Trading Demo"** page
2. ✅ **Check:**
   - [ ] TradingView chart displays
   - [ ] Asset list loads
   - [ ] Investment amount selector works
   - [ ] UP/DOWN buttons work
   - [ ] Timer countdown works

#### **C. Test News Feed**

1. Navigate ke **"News"** page
2. ✅ **Check:**
   - [ ] News articles load
   - [ ] Search works
   - [ ] Pagination works

#### **D. Test Authentication**

1. Click **"Login"** or **"Sign Up"**
2. ✅ **Check:**
   - [ ] Modal opens
   - [ ] Can create account
   - [ ] Can login
   - [ ] Dashboard accessible after login

#### **E. Test Admin Panel**

1. Navigate to `/admin-setup`
2. Create first admin account
3. ✅ **Check:**
   - [ ] Can access admin dashboard
   - [ ] Admin features work

---

### **STEP 5: CUSTOM DOMAIN (Optional, 10 menit)**

#### **A. Add Custom Domain di rocket.new**

1. Go to **Project Settings → Domains**
2. **Add Custom Domain:** `investoft.com` atau `trade.yourdomain.com`
3. **Copy DNS records** yang diberikan

#### **B. Update DNS**

Di domain registrar Anda (Namecheap, GoDaddy, Cloudflare, dll):

1. Add **A record** atau **CNAME record** sesuai instruksi rocket.new
2. **Tunggu propagation** (~5-30 menit)

#### **C. Enable SSL**

Rocket.new biasanya auto-provision SSL certificate. Jika tidak:
1. Go to **Settings → SSL/TLS**
2. Enable **Auto SSL**

**DONE! ✅ Domain custom Anda aktif!**

---

## 🎯 QUICK REFERENCE

### **GitHub Commands**

```bash
# Clone your repo
git clone https://github.com/YOUR-USERNAME/investoft.git
cd investoft

# Make changes
git add .
git commit -m "Your commit message"
git push

# Create branch
git checkout -b feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
git push
```

### **Supabase Commands**

```bash
# Deploy function
supabase functions deploy make-server-20da1dab --no-verify-jwt

# View logs
supabase functions logs make-server-20da1dab

# List functions
supabase functions list

# Set secrets
supabase secrets set KEY=value

# List secrets
supabase secrets list
```

### **Rocket.new CLI (jika tersedia)**

```bash
# Deploy
rocket deploy

# View logs
rocket logs

# List projects
rocket projects

# Open project
rocket open
```

---

## 🔥 TROUBLESHOOTING

### **1. Build fails di rocket.new**

**Error:** `Module not found`

**Fix:**
```bash
# Locally, ensure all dependencies work
npm install
npm run build

# If successful, commit package-lock.json
git add package-lock.json
git commit -m "Fix dependencies"
git push
```

### **2. Environment variables tidak terbaca**

**Fix:**
- Pastikan nama variable diawali `VITE_` untuk frontend
- Redeploy setelah update env vars
- Clear browser cache

### **3. Supabase connection error**

**Fix:**
- Verify credentials di `/utils/supabase/info.tsx`
- Check Supabase project is active (not paused)
- Verify Edge Function deployed: `supabase functions list`

### **4. News tidak muncul**

**Fix:**
```bash
# Check secrets set correctly
supabase secrets list

# Should show NEWS_API_KEY

# If not, set it:
supabase secrets set NEWS_API_KEY=your-key

# Redeploy function
supabase functions deploy make-server-20da1dab --no-verify-jwt
```

### **5. GitHub push rejected**

**Fix:**
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push origin main
```

---

## ✅ FINAL CHECKLIST

### **Before Going Live:**

- [ ] All files pushed to GitHub
- [ ] Repository public or accessible by rocket.new
- [ ] rocket.new project imported successfully
- [ ] Environment variables set correctly
- [ ] Supabase project created
- [ ] Edge Function deployed
- [ ] NewsAPI key configured
- [ ] Homepage loads correctly
- [ ] Trading Demo works
- [ ] News feed shows articles
- [ ] Authentication works
- [ ] Admin dashboard accessible
- [ ] Custom domain configured (if applicable)
- [ ] SSL enabled
- [ ] Mobile responsive verified
- [ ] All console errors resolved

---

## 🎉 SUCCESS!

**Your Investoft platform is now live on rocket.new! 🚀**

**Next steps:**
1. ✅ Share URL dengan team/users
2. ✅ Monitor analytics
3. ✅ Add more features
4. ✅ Scale as needed

**Need help?** Check:
- 📖 [GitHub Repository](https://github.com/YOUR-USERNAME/investoft)
- 📚 [Supabase Docs](https://supabase.com/docs)
- 🚀 [rocket.new Support](https://rocket.new/support)

---

**TOTAL TIME: ~30-40 menit**

**Selamat! Platform trading Anda sudah production-ready! 💪🔥**
