# 🚀 DEPLOY BINANCE PROXY - SIMPLE SOLUTION!

## ⚠️ IMPORTANT: Anda HARUS DEPLOY dulu sebelum test!

Edge Function `binance-proxy` mungkin belum deployed atau butuh redeploy dengan config yang benar.

---

## 🔧 STEP 1: DEPLOY EDGE FUNCTION

Buka terminal dan jalankan:

```bash
supabase functions deploy binance-proxy
```

**Output yang HARUS Anda lihat:**
```
Deploying binance-proxy (project ref: nvocyxqxlxqxdzioxgrw)
Bundled binance-proxy size: X KB
✅ Deployed Function binance-proxy.
```

---

## 🔧 STEP 2: TEST EDGE FUNCTION

Test manual dengan curl:

```bash
curl https://nvocyxqxlxqxdzioxgrw.supabase.co/functions/v1/binance-proxy
```

**Jika BERHASIL, Anda akan lihat:**
```json
[
  {"symbol":"BTCUSDT","price":"98234.50"},
  {"symbol":"ETHUSDT","price":"3456.78"},
  ...
]
```

**Jika dapat ERROR 401:**
```json
{"msg":"Invalid API key"}
```

**Artinya:** Edge Function butuh auth disabled. Lanjut ke Step 3.

---

## 🔧 STEP 3: DISABLE AUTHORIZATION

1. **Buka Supabase Dashboard → Edge Functions**
2. **Pilih `binance-proxy`**
3. **Set "Require Authorization" ke OFF**

---

Deploy command lagi:

```bash
supabase functions deploy binance-proxy
```

✅ Done! Refresh dan lihat hasilnya! 🎉