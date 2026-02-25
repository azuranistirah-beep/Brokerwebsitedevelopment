import { Copy, ExternalLink, CheckCircle2, AlertTriangle, Terminal } from "lucide-react";
import { useState } from "react";
import { projectId } from "../../../utils/supabase/info";

export function DeploymentGuide() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const backendCode = `Deno.serve((req) => {
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
});`;

  const minimalCode = `Deno.serve(() => new Response(JSON.stringify({ok:true}), {
  headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
}));`;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Backend Deployment Guide
          </h1>
          <p className="text-slate-400">
            Fix Error 544 - Manual deployment ke Supabase Edge Functions
          </p>
        </div>

        {/* Error Info */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-300 font-semibold mb-2">Error 544 - Deployment Failed</h3>
              <p className="text-sm text-red-200/80 mb-3">
                Error ini biasanya disebabkan oleh timeout atau masalah server Supabase. 
                Solusinya adalah deploy manual melalui Supabase Dashboard.
              </p>
              <div className="text-xs text-red-300/60 space-y-1">
                <p>• Timeout saat deployment (Supabase server overload)</p>
                <p>• Network issues</p>
                <p>• Build process terlalu lama</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Open Dashboard */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 font-bold">
              1
            </div>
            <h2 className="text-xl font-semibold text-white">Buka Supabase Dashboard</h2>
          </div>

          <p className="text-slate-400 mb-4">
            Buka halaman Edge Functions di Supabase Dashboard:
          </p>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-sm text-blue-400 break-all">
                https://supabase.com/dashboard/project/{projectId}/functions
              </code>
              <button
                onClick={() =>
                  copyToClipboard(
                    `https://supabase.com/dashboard/project/${projectId}/functions`,
                    "dashboard-url"
                  )
                }
                className="ml-4 p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
              >
                {copied === "dashboard-url" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <a
            href={`https://supabase.com/dashboard/project/${projectId}/functions`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Buka Supabase Dashboard
          </a>
        </div>

        {/* Step 2: Create Function */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 font-bold">
              2
            </div>
            <h2 className="text-xl font-semibold text-white">Create New Function</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-slate-400 mb-2">Klik tombol "Create a new function"</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Function Name</label>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 flex items-center justify-between">
                    <code className="text-sm text-green-400">make-server-20da1dab</code>
                    <button
                      onClick={() => copyToClipboard("make-server-20da1dab", "function-name")}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      {copied === "function-name" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-yellow-300 mt-2">
                    ⚠️ PENTING: Nama function HARUS persis seperti ini!
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Template</label>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3">
                    <span className="text-sm text-slate-300">Empty / Blank</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Copy Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/20 text-green-400 font-bold">
              3
            </div>
            <h2 className="text-xl font-semibold text-white">Copy Backend Code</h2>
          </div>

          <p className="text-slate-400 mb-4">
            Pilih salah satu versi code berikut:
          </p>

          {/* Version 1: Full CORS */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Version 1: Full CORS (Recommended)</h3>
              <button
                onClick={() => copyToClipboard(backendCode, "backend-full")}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                {copied === "backend-full" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-slate-300">
                <code>{backendCode}</code>
              </pre>
            </div>
          </div>

          {/* Version 2: Minimal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Version 2: Ultra Minimal (Fallback)</h3>
              <button
                onClick={() => copyToClipboard(minimalCode, "backend-minimal")}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                {copied === "backend-minimal" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-slate-300">
                <code>{minimalCode}</code>
              </pre>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Gunakan versi ini jika versi 1 gagal deploy
            </p>
          </div>
        </div>

        {/* Step 4: Deploy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20 text-red-400 font-bold">
              4
            </div>
            <h2 className="text-xl font-semibold text-white">Deploy Function</h2>
          </div>

          <div className="space-y-4">
            <p className="text-slate-400">
              1. Paste code yang sudah di-copy ke editor di Supabase
            </p>
            <p className="text-slate-400">
              2. Klik tombol <strong className="text-white">"Deploy"</strong>
            </p>
            <p className="text-slate-400">
              3. Tunggu hingga deployment selesai (biasanya 10-30 detik)
            </p>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-200">
                💡 <strong>Tips:</strong> Jika deployment gagal lagi, coba:
              </p>
              <ul className="text-sm text-blue-200/80 mt-2 ml-4 space-y-1">
                <li>• Tunggu 5-10 menit dan retry</li>
                <li>• Clear browser cache</li>
                <li>• Gunakan Ultra Minimal version</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 5: Test */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-400 font-bold">
              5
            </div>
            <h2 className="text-xl font-semibold text-white">Test Deployment</h2>
          </div>

          <p className="text-slate-400 mb-4">
            Setelah deployment berhasil, test dengan membuka URL ini:
          </p>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-sm text-green-400 break-all">
                https://{projectId}.supabase.co/functions/v1/make-server-20da1dab
              </code>
              <button
                onClick={() =>
                  copyToClipboard(
                    `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab`,
                    "test-url"
                  )
                }
                className="ml-4 p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
              >
                {copied === "test-url" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <a
            href={`https://${projectId}.supabase.co/functions/v1/make-server-20da1dab`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Terminal className="h-4 w-4" />
            Test Backend URL
          </a>

          <div className="mt-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">Expected Response:</p>
            <pre className="text-xs text-green-400">
              {JSON.stringify(
                {
                  ok: true,
                  message: "Investoft Backend v17.0.0",
                  timestamp: "2026-02-22T...",
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>

        {/* Final Step */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Selesai!</h3>
          </div>
          <p className="text-slate-300 mb-4">
            Setelah backend berhasil di-deploy dan test URL mengembalikan response yang benar, 
            platform Investoft Anda siap digunakan!
          </p>
          <div className="flex gap-3">
            <a
              href="/quick-fix-dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Run Diagnostic
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
