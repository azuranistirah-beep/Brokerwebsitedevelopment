# ❓ FAQ - Edge Functions Deployment

## 📖 Frequently Asked Questions

---

### Q1: Apa itu Error 403 dan kenapa terjadi?

**A:** Error 403 (Forbidden) terjadi karena:
- Supabase CLI tidak terautentikasi dengan benar
- Access token expired atau invalid
- Project tidak ter-link dengan benar
- Anda tidak memiliki permission yang cukup di organization

**Solusi tercepat:** 
```bash
npx supabase logout
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

---

### Q2: Dimana saya bisa mendapatkan Project Reference ID?

**A:** 
1. Login ke Supabase Dashboard
2. Pilih project **"Broker Website Development"**
3. Buka **Settings** → **General**
4. Copy **Reference ID** (contoh: `ourtzdfyqpytfojlquff`)

**Direct link:** https://app.supabase.com/project/_/settings/general

---

### Q3: Apa bedanya SUPABASE_ANON_KEY dan SUPABASE_SERVICE_ROLE_KEY?

**A:**

| Key Type | Use Case | Security | Frontend/Backend |
|----------|----------|----------|------------------|
| **ANON_KEY** | Public access, authenticated users | Public | Frontend ✓ |
| **SERVICE_ROLE_KEY** | Admin operations, bypass RLS | SECRET ⚠️ | Backend only |

**⚠️ WARNING:** Jangan pernah expose SERVICE_ROLE_KEY di frontend atau commit ke Git!

---

### Q4: Apakah saya perlu set environment secrets setiap kali deploy?

**A:** **Tidak.** Secrets hanya perlu di-set sekali. Setelah di-set, secrets akan tersimpan di Supabase project dan otomatis tersedia untuk semua deployment berikutnya.

Verify secrets sudah ada:
```bash
npx supabase secrets list
```

---

### Q5: Kenapa deployment saya timeout?

**A:** Penyebab umum:
1. **Koneksi internet lambat** → Coba lagi dengan koneksi lebih baik
2. **Supabase server issue** → Check https://status.supabase.com/
3. **Bundle size terlalu besar** → Optimize imports
4. **Network firewall** → Cek firewall/proxy settings

**Quick fix:** Coba deploy ulang:
```bash
npx supabase functions deploy make-server
```

---

### Q6: Bagaimana cara melihat logs Edge Function?

**A:**

**Real-time logs:**
```bash
npx supabase functions logs make-server --tail
```

**Error logs only:**
```bash
npx supabase functions logs make-server --level error
```

**Last 100 logs:**
```bash
npx supabase functions logs make-server
```

---

### Q7: Apakah saya harus install Supabase CLI globally?

**A:** **Tidak wajib**. Anda bisa menggunakan `npx`:
```bash
# Tanpa install global:
npx supabase login

# Atau install global (recommended untuk frequent use):
npm install -g supabase
supabase login
```

**Keuntungan install global:**
- Lebih cepat (tidak download tiap kali)
- Command lebih pendek
- Lebih mudah untuk development

---

### Q8: File apa saja yang diperlukan untuk Edge Function?

**A:** Minimal files:
```
/supabase/functions/make-server/
  ├── index.ts          # Main handler (REQUIRED)
  ├── kv_store.tsx      # KV utilities (optional tapi recommended)
  └── deno.json         # Deno config (REQUIRED)
```

**Optional tapi recommended:**
```
/supabase/
  └── config.toml       # Supabase config
```

---

### Q9: Apa itu Access Token dan kapan saya perlu menggunakannya?

**A:** 

**Access Token** adalah personal authentication token untuk Supabase CLI.

**Kapan digunakan:**
- ✅ Saat error 403 setelah login normal
- ✅ Untuk CI/CD automation
- ✅ Saat multiple developers
- ✅ Untuk scripted deployments

**Cara generate:**
1. Buka: https://app.supabase.com/account/tokens
2. Klik **"Generate new token"**
3. Beri nama (e.g., "Investoft Deploy")
4. Copy token (⚠️ hanya muncul sekali!)

**Cara pakai:**
```bash
export SUPABASE_ACCESS_TOKEN=sbp_your_token
npx supabase link --project-ref YOUR_REF
```

---

### Q10: Kenapa error "Module not found" atau import error?

**A:** 

**Penyebab:**
- Import path salah
- File extension salah (.ts vs .tsx)
- deno.json tidak ada atau salah konfigurasi

**Solusi:**

1. **Check deno.json exists:**
```bash
cat supabase/functions/make-server/deno.json
```

2. **Verify content:**
```json
{
  "imports": {
    "hono": "npm:hono@^4.0.0",
    "@supabase/supabase-js": "jsr:@supabase/supabase-js@2.49.8"
  }
}
```

3. **Check imports in index.ts:**
```typescript
// ✅ Correct
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

// ❌ Wrong
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
```

---

### Q11: Bagaimana cara update Edge Function setelah edit code?

**A:** Sangat mudah! Cukup deploy ulang:
```bash
npx supabase functions deploy make-server
```

**Tidak perlu:**
- ❌ Logout/login
- ❌ Link ulang project
- ❌ Set secrets lagi

**Workflow development:**
1. Edit code di `index.ts`
2. Deploy: `npx supabase functions deploy make-server`
3. Test endpoint
4. Repeat

---

### Q12: Apakah Edge Function gratis?

**A:** 

**Supabase Free Plan:**
- ✅ 500,000 invocations/month
- ✅ 2GB outbound data transfer
- ✅ Unlimited functions

**Setelah limit:**
- Upgrade ke Pro Plan ($25/month)
- atau
- Function akan di-throttle

**Check usage:**
https://app.supabase.com/project/_/settings/billing

---

### Q13: Bagaimana cara test Edge Function sebelum deploy?

**A:**

**Local development:**
```bash
# Start local Supabase
npx supabase start

# Serve function locally
npx supabase functions serve make-server

# Test
curl http://localhost:54321/functions/v1/make-server/health
```

**Staging environment:**
- Deploy ke staging project dulu
- Test thoroughly
- Baru deploy ke production

---

### Q14: Kenapa frontend tidak bisa access Edge Function?

**A:**

**Possible causes:**

1. **CORS issue** → Check CORS config di `index.ts`:
```typescript
app.use("/*", cors({
  origin: "*",  // atau specify domain Anda
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
```

2. **Wrong URL** → Verify function URL:
```bash
npx supabase functions list
```

3. **Authentication required** → Add auth header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

4. **Function not deployed** → Check status:
```bash
npx supabase functions list
```

---

### Q15: Bagaimana cara delete Edge Function?

**A:**

```bash
npx supabase functions delete make-server
```

**⚠️ WARNING:** Ini akan delete function permanently!

**Backup dulu:**
- Code sudah di-commit ke Git
- Dokumentasi sudah lengkap
- Team sudah aware

---

### Q16: Apa yang harus dilakukan jika Supabase CLI version lama?

**A:**

**Update to latest:**
```bash
npm install -g supabase@latest
```

**Verify version:**
```bash
npx supabase --version
```

**Minimum recommended:** v1.150.0+

**After update:**
```bash
npx supabase logout
npx supabase login
```

---

### Q17: Bagaimana cara monitoring performance Edge Function?

**A:**

**Built-in monitoring:**
1. Buka Supabase Dashboard
2. Pilih project
3. **Database** → **Functions**
4. Klik function name
5. View metrics:
   - Invocations
   - Errors
   - Response time
   - Success rate

**Custom monitoring:**
```typescript
// Add logging in function
console.log('[Performance]', {
  endpoint: '/api/market/price',
  duration: Date.now() - start,
  status: 'success'
});
```

**View logs:**
```bash
npx supabase functions logs make-server --tail
```

---

### Q18: Apakah bisa deploy multiple Edge Functions?

**A:** **Ya!** Anda bisa deploy banyak functions:

**Structure:**
```
/supabase/functions/
  ├── make-server/
  │   └── index.ts
  ├── auth-service/
  │   └── index.ts
  └── payment-handler/
      └── index.ts
```

**Deploy all:**
```bash
npx supabase functions deploy
```

**Deploy specific:**
```bash
npx supabase functions deploy make-server
```

---

### Q19: Kenapa secrets tidak muncul saat saya list?

**A:** Ini adalah **behavior normal** untuk security!

```bash
npx supabase secrets list
```

**Output (correct):**
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEWS_API_KEY
```

**⚠️ Values tidak ditampilkan** untuk security reasons.

Untuk verify secrets bekerja, test function endpoint langsung.

---

### Q20: Dimana saya bisa get help lebih lanjut?

**A:**

**Documentation (yang Anda punya):**
- 📖 [`EDGE_FUNCTIONS_README.md`](./EDGE_FUNCTIONS_README.md) - Complete guide
- ⚡ [`QUICK_FIX_403.md`](./QUICK_FIX_403.md) - Quick solutions
- ✅ [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) - Step-by-step
- 🔑 [`HOW_TO_GET_CREDENTIALS.md`](./HOW_TO_GET_CREDENTIALS.md) - Get API keys
- 🚀 [`3MIN_DEPLOY.md`](./3MIN_DEPLOY.md) - Quick start
- 🔄 [`DEPLOYMENT_FLOW_DIAGRAM.md`](./DEPLOYMENT_FLOW_DIAGRAM.md) - Visual guide

**Community Support:**
- 💬 **Supabase Discord:** https://discord.supabase.com/
- 🐛 **GitHub Issues:** https://github.com/supabase/cli/issues
- 📚 **Official Docs:** https://supabase.com/docs/guides/functions

**Professional Support:**
- 🎫 **Supabase Support Portal:** https://supabase.com/support
- 📧 **Email:** support@supabase.io (for paid plans)

---

## 🎯 Quick Reference

### Most Common Commands:
```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref YOUR_REF

# Deploy
npx supabase functions deploy make-server

# View logs
npx supabase functions logs make-server --tail

# List functions
npx supabase functions list

# Set secret
npx supabase secrets set KEY=VALUE
```

### Most Common Errors:
| Error | Quick Fix |
|-------|-----------|
| 403 | `npx supabase logout && npx supabase login` |
| Timeout | Retry deployment |
| Module not found | Check deno.json |
| Invalid ref | Get correct Project Ref ID |

---

## 💡 Pro Tips

1. **Save Project Ref** - Store di `.env` untuk easy access
2. **Use Scripts** - Automated scripts save time
3. **Monitor Logs** - Regular monitoring prevents issues
4. **Version Control** - Always commit before deploy
5. **Documentation** - Keep internal docs updated
6. **Backup Secrets** - Store securely (1Password, etc)
7. **Test Locally** - Use `supabase functions serve`
8. **Staging First** - Deploy to staging before production

---

**Still have questions?** Create an issue or contact support!

---

*FAQ created: 2025-02-07 | Investoft Platform | Version 1.0*
*Last updated: 2025-02-07*
