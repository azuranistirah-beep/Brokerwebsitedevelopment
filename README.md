# 🚀 Investoft - Modern Trading Platform

<div align="center">

![Investoft Logo](https://via.placeholder.com/200x60/3b82f6/ffffff?text=INVESTOFT)

**Platform trading modern dengan real-time charts, news feed, dan demo trading**

[![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.95-3ecf8e?logo=supabase)](https://supabase.com/)

[🌐 Live Demo](#) • [📖 Documentation](#features) • [🐛 Report Bug](#) • [✨ Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Features
- **✅ Trading Demo Interface** - Practice trading dengan real-time price tracking
- **📊 TradingView Charts** - Grafik profesional terintegrasi TradingView
- **📰 Real-time News Feed** - Berita pasar dari NewsAPI.org
- **🔐 User Authentication** - Login/Signup dengan Supabase Auth
- **👨‍💼 Admin Dashboard** - Panel admin untuk manajemen platform
- **📈 Market Screener** - Screening aset dengan berbagai filter
- **⚡ Live Market Overview** - Overview pasar real-time

### 🎨 UI/UX
- **Modern & Clean Design** - UI profesional dengan Tailwind CSS v4
- **Responsive Layout** - Mobile-friendly design
- **Dark/Light Mode Support** - Theme switching
- **Toast Notifications** - Real-time feedback dengan Sonner

### 🔧 Technical Features
- **Real-time Price Tracking** - Update harga setiap detik
- **Position Countdown Timer** - Timer untuk trading positions
- **Realistic WIN/LOSS Calculation** - Perhitungan profit/loss akurat
- **Edge Function Backend** - Serverless API dengan Deno
- **Key-Value Store** - Database fleksibel untuk prototyping

---

## 🛠 Tech Stack

### Frontend
- **React 18.3** - UI Library
- **TypeScript** - Type-safe JavaScript
- **Vite 6.3** - Build tool & dev server
- **Tailwind CSS 4.1** - Utility-first CSS
- **Shadcn/UI** - Component library
- **Lucide React** - Icon library
- **Recharts** - Chart library
- **Motion (Framer Motion)** - Animation library

### Backend
- **Supabase** - Backend as a Service
  - Edge Functions (Deno + Hono)
  - PostgreSQL Database
  - Authentication
  - Storage
- **NewsAPI.org** - News data provider

### UI Components
- Radix UI primitives
- Custom Shadcn/UI components
- Material UI components
- TradingView widgets

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or 20+ 
- **npm** or **pnpm** (recommended)
- **Supabase account** ([Sign up free](https://supabase.com))
- **NewsAPI key** ([Get free key](https://newsapi.org/register))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/investoft.git
cd investoft
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

### Environment Setup

1. **Create environment file**
```bash
cp .env.example .env
```

2. **Update `.env` with your credentials:**

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NewsAPI
NEWS_API_KEY=your-newsapi-key
```

**Get Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Go to Settings → API
4. Copy `URL`, `anon key`, and `service_role key`

**Get NewsAPI key:**
1. Go to [NewsAPI.org](https://newsapi.org/register)
2. Sign up for free account (100 requests/day)
3. Copy your API key

### Database Setup

The project uses Supabase's built-in key-value store. No manual database setup needed!

The `kv_store_20da1dab` table is automatically managed by the backend.

### Supabase Edge Function Deployment

1. **Install Supabase CLI**
```bash
npm install -g supabase
```

2. **Login to Supabase**
```bash
supabase login
```

3. **Link your project**
```bash
supabase link --project-ref your-project-ref
```

4. **Deploy the Edge Function**
```bash
supabase functions deploy make-server-20da1dab --no-verify-jwt
```

5. **Set environment secrets**
```bash
supabase secrets set NEWS_API_KEY=your-key-here
```

### Running the App

**Development mode:**
```bash
npm run dev
```

App will open at `http://localhost:5173`

**Production build:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

---

## 🌐 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/investoft)

**Manual Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR-USERNAME/investoft)

**Manual Deployment:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

### Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR-USERNAME/investoft)

### Environment Variables for Deployment

Don't forget to set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `NEWS_API_KEY` (set this in Supabase secrets, not in hosting platform)

---

## 📁 Project Structure

```
investoft/
├── src/
│   ├── app/
│   │   ├── App.tsx                          # Main app component
│   │   ├── components/
│   │   │   ├── LandingPage.tsx             # Homepage
│   │   │   ├── MarketsPage.tsx             # Trading Demo page ⭐
│   │   │   ├── NewsPage.tsx                # News feed
│   │   │   ├── MemberDashboard.tsx         # User dashboard
│   │   │   ├── AdminDashboard.tsx          # Admin panel
│   │   │   ├── ChartPage.tsx               # Full chart view
│   │   │   ├── TradingChart.tsx            # TradingView widget
│   │   │   ├── PositionCountdown.tsx       # Trade timer
│   │   │   ├── PublicHeader.tsx            # Navigation
│   │   │   ├── PublicFooter.tsx            # Footer
│   │   │   ├── AuthModal.tsx               # Login/Signup
│   │   │   └── ui/                         # Shadcn/UI components
│   │   └── lib/
│   │       └── supabaseClient.ts           # Supabase client
│   └── styles/
│       ├── index.css                        # Main styles
│       ├── tailwind.css                     # Tailwind config
│       ├── theme.css                        # Design tokens
│       └── fonts.css                        # Font imports
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx                    # API server (Hono)
│           └── kv_store.tsx                 # Database utils
├── utils/
│   └── supabase/
│       └── info.tsx                         # Supabase config
├── package.json                             # Dependencies
├── vite.config.ts                           # Vite config
├── .env.example                             # Environment template
└── README.md                                # This file
```

---

## 🎯 Key Features Explained

### 1. Trading Demo Interface
- **Location:** `/src/app/components/MarketsPage.tsx`
- **Features:**
  - Demo account balance ($10,000)
  - Investment amount selector ($10-$1000)
  - Trade duration (1-5 minutes)
  - UP/DOWN trading buttons
  - Real-time WIN/LOSS calculation
  - Position countdown timer
  - Trading statistics

### 2. TradingView Integration
- **Location:** `/src/app/components/TradingChart.tsx`
- **Features:**
  - Professional charting
  - Multiple timeframes
  - Technical indicators
  - Real-time price updates
  - Responsive design

### 3. News Feed
- **Location:** `/src/app/components/NewsPage.tsx`
- **Features:**
  - Real-time financial news
  - Search functionality
  - Category filtering
  - Pagination
  - Article previews

### 4. Admin Dashboard
- **Location:** `/src/app/components/AdminDashboard.tsx`
- **Features:**
  - User management
  - Platform statistics
  - Content moderation
  - System monitoring

---

## 🔐 First Time Setup

### Create Admin Account

1. Start the app: `npm run dev`
2. Navigate to: `http://localhost:5173/admin-setup`
3. Create your first admin account
4. Login with admin credentials

### Configure Supabase Auth Providers

**To enable Google/Facebook/GitHub login:**

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable desired providers
3. Follow setup instructions:
   - [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
   - [Facebook OAuth](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
   - [GitHub OAuth](https://supabase.com/docs/guides/auth/social-login/auth-github)

---

## 🐛 Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**2. Supabase connection errors**
- Check `.env` file exists and has correct values
- Verify Supabase project is active
- Check Edge Function is deployed

**3. TradingView charts not loading**
- Check internet connection (TradingView loads from CDN)
- Check browser console for errors
- Clear browser cache

**4. News feed empty**
- Verify `NEWS_API_KEY` is set in Supabase secrets
- Check NewsAPI quota (free tier: 100 requests/day)
- Check backend logs: `supabase functions logs make-server-20da1dab`

**5. Build errors**
```bash
# Clear cache and rebuild
rm -rf dist .vite
npm run build
```

---

## 📝 Environment Variables Reference

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (⚠️ Keep secret!) | Supabase Dashboard → Settings → API |
| `NEWS_API_KEY` | NewsAPI.org API key | NewsAPI.org dashboard |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [TradingView](https://www.tradingview.com) - Chart widgets
- [NewsAPI](https://newsapi.org) - News data
- [Shadcn/UI](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

## 📞 Support

- 📧 Email: support@investoft.com (ganti dengan email Anda)
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR-USERNAME/investoft/issues)

---

## 🗺️ Roadmap

- [ ] Real money trading integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced charting tools
- [ ] Social trading features
- [ ] AI trading signals
- [ ] Portfolio tracking
- [ ] Copy trading

---

<div align="center">

**Made with ❤️ for traders worldwide**

⭐ Star us on GitHub — it helps!

[⬆ Back to top](#-investoft---modern-trading-platform)

</div>