# 🔧 Live Price Debug & Troubleshooting Guide

## ✅ Implementasi Saat Ini

Platform Investoft telah diimplementasikan dengan sistem **3-Layer Fallback** untuk mendapatkan harga real-time:

### Layer 1: Backend Proxy (Supabase Edge Functions) ✅
- **URL**: `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/price`
- **Keuntungan**: Bypass CORS, mendukung semua jenis asset (crypto, stocks, forex)
- **Source**: 
  - Binance API untuk crypto
  - Alpha Vantage API untuk stocks
  - Simulated price untuk forex/commodities

### Layer 2: Direct Binance API 🔄
- **URL**: `https://api.binance.com/api/v3/ticker/price`
- **Keuntungan**: Real-time price langsung dari exchange
- **Limitasi**: Hanya untuk crypto, mungkin terkena CORS di browser

### Layer 3: Simulated Price 🎲
- **Fallback terakhir** jika kedua layer di atas gagal
- Menggunakan base price + random variation
- Memastikan UI tetap berfungsi meskipun API tidak tersedia

---

## 🧪 Testing & Debugging

### 1. Cek Console Browser
Buka Developer Tools (F12) dan lihat Console. Anda akan melihat log detail:

```
🌐 [Real-Time Service] Initializing with backend proxy...
🔧 [Config] Project ID: ourtzdfyq...
🔧 [Config] Anon Key: Present ✅
🧪 [Backend Test] Testing connection to Supabase Edge Functions...
```

**Expected Results:**
- ✅ Backend is ONLINE: Backend proxy berfungsi dengan baik
- ❌ Backend Test Failed: Backend tidak tersedia, akan fallback ke direct API

### 2. Verifikasi Edge Functions Deploy
Pastikan Edge Functions sudah di-deploy ke Supabase:

```bash
# Dari direktori project
cd supabase
npx supabase functions deploy make-server --no-verify-jwt

# Atau gunakan script yang sudah disediakan
./deploy-edge-functions.sh   # Linux/Mac
deploy-edge-functions.bat    # Windows
```

### 3. Test Endpoint Secara Manual

#### Test Health Endpoint:
```bash
curl -X GET "https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab/health" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected Response:**
```json
{"status":"ok"}
```

#### Test Price Endpoint:
```bash
curl -X GET "https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab/price?symbol=BTCUSD" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected Response:**
```json
{
  "symbol": "BTCUSD",
  "price": 64250.50,
  "source": "binance",
  "timestamp": "2026-02-11T10:30:00.000Z"
}
```

---

## ❌ Common Errors & Solutions

### Error: "TypeError: Failed to fetch"

**Penyebab Umum:**
1. Edge Functions belum di-deploy
2. CORS blocking (sudah di-handle dengan proxy)
3. Network connectivity issue
4. Invalid credentials

**Solusi:**

#### 1. Verifikasi Edge Functions Status
```bash
# Login ke Supabase CLI
npx supabase login

# Check functions yang sudah deploy
npx supabase functions list
```

#### 2. Re-deploy Edge Functions
```bash
cd supabase
npx supabase functions deploy make-server --no-verify-jwt
```

#### 3. Verify Supabase Project ID & Keys
Buka `/src/utils/supabase/info.ts` dan pastikan:
```typescript
export const projectId = "ourtzdfyqpytfojlquff"  // ✅ Harus ada
export const publicAnonKey = "eyJh..."             // ✅ Harus valid
```

#### 4. Check Network Connectivity
Buka browser console dan test:
```javascript
fetch('https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab/health', {
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json()).then(console.log)
```

---

## 🎯 Fallback System Working?

Sistem fallback bekerja otomatis dengan prioritas:

1. **Backend Proxy** (Primary)
   - Timeout: 5 detik
   - Jika gagal → lanjut ke #2

2. **Direct Binance API** (Secondary)
   - Hanya untuk crypto
   - Jika gagal → lanjut ke #3

3. **Simulated Price** (Tertiary)
   - Selalu berhasil
   - Menggunakan base price + random variation

**Console Logs untuk Tracking:**
```
✅ [Backend Success] BTCUSD: $64250 (binance)      ← Layer 1 berhasil
✅ [Binance Direct] BTCUSDT: $64250                ← Layer 2 berhasil
🎲 [Simulated] BTCUSD: $64250                      ← Layer 3 fallback
```

---

## 🚀 Deployment Checklist

### Pre-Deployment:
- [ ] Edge Functions sudah di-test lokal
- [ ] Environment variables sudah di-set di Supabase Dashboard
- [ ] Frontend sudah di-build tanpa error

### Deploy ke Supabase:
```bash
# 1. Deploy Edge Functions
cd supabase
npx supabase functions deploy make-server --no-verify-jwt

# 2. Verify deployment
npx supabase functions list

# 3. Test endpoint
curl "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-20da1dab/health"
```

### Deploy ke Netlify:
```bash
# 1. Build project
npm run build

# 2. Deploy (auto via Git push atau manual)
netlify deploy --prod

# 3. Verify at https://investoft.netlify.app
```

### Post-Deployment:
- [ ] Test health endpoint dari production URL
- [ ] Buka browser console dan verify backend connection
- [ ] Test live price updates di UI
- [ ] Verify flash effect saat price update

---

## 📊 Monitoring & Logs

### Frontend Logs (Browser Console)
```
💰 [🏦 Binance] BTCUSDT: $64250.00      ← Real-time dari Binance
💰 [📈 Alpha Vantage] AAPL: $178.34     ← Stock dari Alpha Vantage
💰 [🎲 Simulated] EURUSD: $1.0845       ← Simulated untuk forex
```

### Backend Logs (Supabase Dashboard)
1. Buka Supabase Dashboard
2. Pilih project: `ourtzdfyqpytfojlquff`
3. Klik **Edge Functions** → **Logs**
4. Filter by function: `make-server`

**Expected Logs:**
```
📊 [Price API] Request received for symbol: BTCUSD
🔍 [Backend] Fetching crypto price for BTCUSD -> BTCUSDT
💰 [Backend] Binance price for BTCUSDT: $64250
```

---

## 🔑 API Keys Required

### Binance API (Public - No Key Required) ✅
- Endpoint: `https://api.binance.com/api/v3/ticker/price`
- Rate Limit: 1200 requests/minute
- Tidak perlu API key untuk public price data

### Alpha Vantage (For Stocks) ⚠️
- **Status**: Sudah dikonfigurasi dengan API Key
- **Key**: `MGBGLASR660UCN89`
- **Rate Limit**: 5 requests/minute (free tier)
- **Location**: Environment variable di Supabase

### NewsAPI.org ✅
- **Status**: Sudah dikonfigurasi
- **Used for**: News articles, bukan price data

---

## 🐛 Debug Commands

### Quick Test Script (Browser Console)
```javascript
// Test 1: Backend Health
fetch('https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab/health', {
  headers: { 'Authorization': 'Bearer ' + publicAnonKey }
}).then(r => r.json()).then(d => console.log('Health:', d))

// Test 2: Get BTC Price
fetch('https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab/price?symbol=BTCUSD', {
  headers: { 'Authorization': 'Bearer ' + publicAnonKey }
}).then(r => r.json()).then(d => console.log('BTC Price:', d))

// Test 3: Direct Binance API
fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
  .then(r => r.json()).then(d => console.log('Binance:', d))
```

---

## ✅ Success Indicators

Jika semuanya berfungsi dengan baik, Anda akan melihat:

1. **Console Logs:**
   ```
   ✅ [Backend Test] Backend is ONLINE and responding
   💰 [🏦 Binance] BTCUSDT: $64250.00
   💰 [🏦 Binance] ETHUSD: $3520.50
   ```

2. **UI Behavior:**
   - Price bergerak smooth setiap 2 detik
   - Flash effect kuning saat price update
   - Tidak ada frozen price atau price yang tidak berubah

3. **Network Tab (Developer Tools):**
   - Status 200 OK untuk `/price` requests
   - Response time < 1 detik
   - Payload berisi `{"symbol":"BTCUSD","price":64250,"source":"binance"}`

---

## 🆘 Getting Help

Jika masih ada masalah setelah mengikuti guide ini:

1. **Kumpulkan informasi:**
   - Screenshot console logs
   - Screenshot network tab (F12 → Network)
   - Backend logs dari Supabase Dashboard

2. **Check dokumentasi lain:**
   - `/EDGE_FUNCTIONS_DEPLOYMENT_FIX.md` - Deployment issues
   - `/TROUBLESHOOTING.md` - General troubleshooting
   - `/FETCH_ERROR_DEBUG.md` - Network error debugging

3. **Verify system requirements:**
   - Node.js >= 18
   - Supabase CLI latest version
   - Valid Supabase project with Edge Functions enabled

---

**Last Updated:** February 11, 2026  
**Status:** ✅ Fully Implemented with 3-Layer Fallback
