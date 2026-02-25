# 🔧 FIX: HTTP 404 Error - Binance Proxy Not Deployed

## 📊 Status Error
```
❌ [Polling #1] Error: HTTP 404
URL: https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy
⚠️ Binance proxy may not be deployed yet
```

## ✅ Root Cause
Edge Function `binance-proxy` **BELUM DI-DEPLOY** ke Supabase.

---

## 🚀 SOLUSI CEPAT (3 Langkah)

### Step 1: Login ke Supabase CLI
```bash
supabase login
```
- Browser akan terbuka
- Login dengan akun Supabase Anda
- Kembali ke terminal

### Step 2: Link Project
```bash
supabase link --project-ref nvocyxqxlxqxdzioxgrw
```
- Masukkan database password jika diminta
- Project ref: `nvocyxqxlxqxdzioxgrw`

### Step 3: Deploy Binance Proxy
```bash
supabase functions deploy binance-proxy
```
- Tunggu hingga selesai (sekitar 30 detik)
- Anda akan melihat:
  ```
  ✅ Deployed Function binance-proxy on project nvocyxqxlxqxdzioxgrw
  ```

---

## 🎯 VERIFIKASI DEPLOYMENT

### Test dengan curl:
```bash
curl -X POST https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT"}'
```

### Response yang benar:
```json
{
  "symbol": "BTCUSDT",
  "price": "62458.50"
}
```

### Test di Browser Console:
```javascript
fetch('https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ symbol: 'BTCUSDT' })
})
.then(r => r.json())
.then(console.log);
```

---

## 🔄 ALTERNATIVE: Deploy Semua Edge Functions

Jika ingin deploy semua Edge Functions sekaligus:

```bash
# Deploy semua functions
supabase functions deploy

# Atau deploy satu per satu
supabase functions deploy binance-proxy
supabase functions deploy get-market-price
supabase functions deploy crypto-prices
```

---

## 📝 FILE YANG PERLU DI-CHECK

### 1. Edge Function Code
**File**: `/supabase/functions/binance-proxy/index.ts`
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const BINANCE_API = 'https://api.binance.com/api/v3';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { symbol } = await req.json();
    
    // Fetch dari Binance API
    const response = await fetch(`${BINANCE_API}/ticker/price?symbol=${symbol}`);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
```

### 2. Deno Config
**File**: `/supabase/functions/binance-proxy/deno.json`
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "imports": {
    "react": "https://esm.sh/react@18.2.0",
    "react-dom": "https://esm.sh/react-dom@18.2.0"
  }
}
```

---

## 🛠️ TROUBLESHOOTING

### Error: "Not logged in"
```bash
supabase login
```

### Error: "Project not linked"
```bash
supabase link --project-ref nvocyxqxlxqxdzioxgrw
```

### Error: "Permission denied"
- Pastikan Anda adalah owner/admin project Supabase
- Check di dashboard: https://supabase.com/dashboard/project/nvocyxqxlxqxdzioxgrw/settings/general

### Error: "Function already exists"
- Ini normal, function akan di-update
- Deploy akan meng-overwrite function yang lama

---

## 📱 SETELAH DEPLOY

### 1. Refresh Browser
- Hard refresh dengan `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)

### 2. Check Console
- Buka DevTools (F12)
- Pergi ke Console tab
- Lihat log dari `unifiedPriceService.ts`
- Seharusnya TIDAK ada error 404 lagi

### 3. Check Price Updates
- Buka `/member` atau `/markets` page
- Price seharusnya update setiap 3 detik
- Check console: `[UnifiedPrice] Successfully fetched prices`

---

## 📋 CHECKLIST DEPLOYMENT

- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Logged in (`supabase login`)
- [ ] Project linked (`supabase link --project-ref nvocyxqxlxqxdzioxgrw`)
- [ ] Binance Proxy deployed (`supabase functions deploy binance-proxy`)
- [ ] Tested dengan curl atau browser console
- [ ] No more 404 errors di console
- [ ] Real-time prices updating every 3 seconds

---

## 🎯 EXPECTED RESULT

### Before Deploy (❌)
```
❌ [Polling #1] Error: HTTP 404
URL: https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy
⚠️ Binance proxy may not be deployed yet
```

### After Deploy (✅)
```
✅ [UnifiedPrice] Successfully fetched prices: 5 assets
✅ BTCUSDT: $62,458.50
✅ ETHUSDT: $3,127.85
✅ XAUUSD: $2,187.50 (synthetic)
✅ Next update in 3 seconds...
```

---

## 💡 PRO TIPS

1. **Deploy dari root project directory** (bukan dari subdirectory)
2. **Tunggu 30-60 detik** setelah deploy sebelum test
3. **Clear browser cache** setelah deploy Edge Function
4. **Check Supabase Dashboard** untuk melihat logs: https://supabase.com/dashboard/project/nvocyxqxlxqxdzioxgrw/logs/edge-functions

---

## 🆘 NEED HELP?

Jika masih error setelah deploy:
1. Check Supabase Dashboard Logs
2. Verify project ref: `nvocyxqxlxqxdzioxgrw`
3. Ensure Edge Functions enabled di project settings
4. Contact Supabase support jika masih error

---

**Last Updated**: 2026-02-25  
**Status**: ✅ Ready to Deploy
