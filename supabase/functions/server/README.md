# Investoft Backend Deployment Guide

## Error 544 - Deployment Failed

Error 544 biasanya disebabkan oleh:
1. **Timeout saat deployment** (Supabase server overload)
2. **Network issues**
3. **File terlalu besar** (meskipun file kita sudah minimal)

## ✅ SOLUSI 1: Manual Deployment via Supabase Dashboard

### Langkah-langkah:

1. **Buka Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/ourtzdfyqpytfojlquff/functions
   ```

2. **Create New Function:**
   - Klik "Create a new function"
   - Function name: `make-server-20da1dab`
   - Template: Empty/Blank

3. **Copy-paste code ini:**

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

4. **Deploy:**
   - Klik "Deploy"
   - Wait for deployment to complete

5. **Test:**
   - Klik "Invoke" atau test via browser:
   ```
   https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab
   ```

## ✅ SOLUSI 2: Supabase CLI (Jika Ada)

```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref ourtzdfyqpytfojlquff

# Deploy function
supabase functions deploy make-server-20da1dab
```

## ✅ SOLUSI 3: Wait & Retry

Kadang-kadang error 544 adalah temporary issue dari Supabase server:

1. **Tunggu 5-10 menit**
2. **Clear browser cache**
3. **Retry deployment**

## 🔍 Verify Deployment

Setelah deploy berhasil, test dengan:

```bash
curl https://ourtzdfyqpytfojlquff.supabase.co/functions/v1/make-server-20da1dab
```

Expected response:
```json
{
  "ok": true,
  "message": "Investoft Backend v17.0.0",
  "timestamp": "2026-02-22T..."
}
```

## 📋 Backend Version History

- **v17.0.0** - Ultra minimal with proper CORS (Current)
- **v16.0.0** - Ultra minimal 7 lines
- **v15.0.0** - Minimal 8 lines

## ⚠️ IMPORTANT

Function name HARUS: `make-server-20da1dab`

Jangan gunakan:
- ❌ `make-server`
- ❌ `server`
- ❌ nama lainnya

Frontend expects: `/functions/v1/make-server-20da1dab/`
