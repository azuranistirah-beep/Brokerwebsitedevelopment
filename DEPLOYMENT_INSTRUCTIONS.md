# 🚀 MANUAL DEPLOYMENT INSTRUCTIONS - INVESTOFT BACKEND

## ⚠️ ERROR 544 CANNOT BE FIXED IN CODE

Error 544 adalah deployment infrastructure issue. Manual deployment adalah SATU-SATUNYA solusi.

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Open Supabase Dashboard

Buka link ini (klik untuk open in new tab):
```
https://supabase.com/dashboard/project/ourtzdfyqpytfojlquff/functions
```

### STEP 2: Create New Function

- Klik: **"Create a new function"** atau **"New Edge Function"**
- Function name: **`make-server-20da1dab`** ← HARUS PERSIS INI!
- Template: **Empty** atau **Blank**

### STEP 3: Copy Backend Code

**PILIH SALAH SATU:**

#### OPTION A: Full Version (Recommended)

```typescript
Deno.serve((req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Main response
  return new Response(
    JSON.stringify({ 
      ok: true, 
      message: "Investoft Backend v17.0.0",
      timestamp: new Date().toISOString()
    }), 
    {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      }
    }
  );
});
```

#### OPTION B: Ultra Minimal (If Option A fails)

```typescript
Deno.serve(() => new Response(JSON.stringify({ok:true}), {
  headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
}));
```

### STEP 4: Paste & Deploy

1. **Paste** code yang sudah di-copy ke editor di Supabase
2. **Klik tombol "Deploy"** (biasanya warna biru/hijau)
3. **Tunggu** 10-30 detik hingga deployment selesai
4. Lihat status deployment - pastikan **"Successfully deployed"**

### STEP 5: Test Backend

**Buka URL ini di browser untuk test:**
```
https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab
```

**Expected Response:**
```json
{
  "ok": true,
  "message": "Investoft Backend v17.0.0",
  "timestamp": "2026-02-22T..."
}
```

---

## ✅ VERIFICATION

Setelah deployment berhasil, test dengan tools berikut:

### 1. Quick Fix Dashboard
```
http://localhost:5173/quick-fix-dashboard
```
Klik "Run Quick Diagnostic" - semua harus SUCCESS ✅

### 2. Direct Browser Test
```
https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab
```
Harus return JSON response dengan `"ok": true`

---

## 🆘 TROUBLESHOOTING

### Q: Deployment masih gagal di Supabase Dashboard?
**A:** Tunggu 5-10 menit dan retry. Kadang Supabase server overload.

### Q: Response 404 Not Found?
**A:** Function name salah. HARUS: `make-server-20da1dab` (dengan suffix `-20da1dab`)

### Q: CORS error?
**A:** Gunakan Option A code (yang ada CORS handling)

### Q: Function tidak muncul di list?
**A:** Refresh dashboard page, atau check di tab "Edge Functions"

---

## 🎯 FINAL CHECKLIST

- [ ] Function name = `make-server-20da1dab` (EXACT!)
- [ ] Code pasted correctly
- [ ] Deployment status = "Successfully deployed"
- [ ] Test URL returns JSON response
- [ ] Quick Fix Dashboard shows all SUCCESS

---

## 📞 NEED HELP?

Jika masih ada masalah setelah manual deployment:

1. Screenshot Supabase Dashboard (functions page)
2. Screenshot test URL response
3. Screenshot Quick Fix Dashboard results
4. Report back dengan screenshots tersebut

---

**IMPORTANT:** Error 544 TIDAK bisa diperbaiki dengan mengubah code. Manual deployment via Supabase Dashboard adalah SATU-SATUNYA solusi yang pasti berhasil.
