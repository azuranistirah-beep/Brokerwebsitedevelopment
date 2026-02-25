import { useState } from "react";
import { 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  AlertTriangle, 
  ArrowRight,
  Terminal,
  Rocket
} from "lucide-react";
import { projectId } from "../../../utils/supabase/info";

export function ManualDeploymentHelper() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const functionName = "make-server-20da1dab";
  const dashboardUrl = `https://supabase.com/dashboard/project/${projectId}/functions`;
  const testUrl = `https://${projectId}.supabase.co/functions/v1/${functionName}`;

  const fullCode = `Deno.serve((req) => {
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

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const toggleStep = (step: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(step)) {
        newSet.delete(step);
      } else {
        newSet.add(step);
      }
      return newSet;
    });
  };

  const Step = ({ 
    number, 
    title, 
    children 
  }: { 
    number: number; 
    title: string; 
    children: React.ReactNode;
  }) => {
    const isCompleted = completedSteps.has(number);
    
    return (
      <div className={`border rounded-xl p-6 transition-all ${
        isCompleted 
          ? 'border-green-500/30 bg-green-500/5' 
          : 'border-slate-700 bg-slate-900/50'
      }`}>
        <div className="flex items-start gap-4">
          <button
            onClick={() => toggleStep(number)}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              isCompleted
                ? 'bg-green-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : number}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
            {children}
          </div>
        </div>
      </div>
    );
  };

  const CopyButton = ({ 
    text, 
    step, 
    label = "Copy" 
  }: { 
    text: string; 
    step: number; 
    label?: string;
  }) => (
    <button
      onClick={() => copyToClipboard(text, step)}
      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      {copiedStep === step ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="h-10 w-10 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Manual Deployment</h1>
              <p className="text-slate-400">Deploy Investoft Backend ke Supabase</p>
            </div>
          </div>
        </div>

        {/* Error Explanation */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold mb-2">
                Kenapa Error 544 Terjadi?
              </h3>
              <p className="text-sm text-red-200/80 mb-3">
                Error 544 adalah <strong>deployment timeout</strong> dari system Figma Make ke Supabase. 
                Ini <strong>BUKAN masalah code</strong>, tetapi masalah infrastructure.
              </p>
              <div className="bg-red-500/10 rounded-lg p-3 mb-3">
                <code className="text-xs text-red-300">
                  XHR for "/api/.../edge_functions/make-server/deploy" failed with status 544
                </code>
              </div>
              <p className="text-sm text-red-200/80">
                <strong>Solusi:</strong> Deploy manual melalui Supabase Dashboard (ikuti langkah di bawah)
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Progress</h3>
            <span className="text-slate-400 text-sm">
              {completedSteps.size} / 5 steps
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
              style={{ width: `${(completedSteps.size / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1 */}
          <Step number={1} title="Buka Supabase Dashboard">
            <p className="text-slate-400 mb-4">
              Klik tombol di bawah untuk membuka halaman Edge Functions di Supabase:
            </p>
            <div className="flex gap-3">
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Supabase Dashboard
              </a>
              <CopyButton text={dashboardUrl} step={1} label="Copy URL" />
            </div>
          </Step>

          {/* Step 2 */}
          <Step number={2} title="Create New Function">
            <div className="space-y-4">
              <p className="text-slate-400">
                Di Supabase Dashboard, klik <strong className="text-white">"Create a new function"</strong> atau 
                <strong className="text-white"> "New Edge Function"</strong>
              </p>
              
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <label className="text-xs text-slate-400 block mb-2">Function Name (HARUS PERSIS!):</label>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-slate-900/50 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 font-mono">
                    {functionName}
                  </code>
                  <CopyButton text={functionName} step={2} label="Copy Name" />
                </div>
                <p className="text-xs text-yellow-300 mt-3">
                  ⚠️ CRITICAL: Function name harus <strong>EXACTLY</strong> seperti ini, termasuk suffix "-20da1dab"
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  💡 <strong>Template:</strong> Pilih "Empty" atau "Blank" saat create function
                </p>
              </div>
            </div>
          </Step>

          {/* Step 3 */}
          <Step number={3} title="Copy Backend Code">
            <p className="text-slate-400 mb-4">
              Pilih salah satu versi code. Mulai dengan Version 1 (recommended):
            </p>

            {/* Version 1 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">Version 1: Full CORS (Recommended)</h4>
                <CopyButton text={fullCode} step={31} label="Copy Code" />
              </div>
              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto max-h-64">
                <pre className="text-xs text-slate-300">
                  <code>{fullCode}</code>
                </pre>
              </div>
            </div>

            {/* Version 2 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">Version 2: Ultra Minimal (Fallback)</h4>
                <CopyButton text={minimalCode} step={32} label="Copy Code" />
              </div>
              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-slate-300">
                  <code>{minimalCode}</code>
                </pre>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Gunakan version ini hanya jika Version 1 gagal deploy
              </p>
            </div>
          </Step>

          {/* Step 4 */}
          <Step number={4} title="Paste & Deploy">
            <div className="space-y-4">
              <ol className="space-y-3 text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-white text-xs flex items-center justify-center">1</span>
                  <span>Paste code yang sudah di-copy ke editor di Supabase</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-white text-xs flex items-center justify-center">2</span>
                  <span>Klik tombol <strong className="text-white">"Deploy"</strong> (biasanya warna biru/hijau)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-white text-xs flex items-center justify-center">3</span>
                  <span>Tunggu 10-30 detik hingga deployment selesai</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-white text-xs flex items-center justify-center">4</span>
                  <span>Pastikan status menunjukkan <strong className="text-green-400">"Successfully deployed"</strong></span>
                </li>
              </ol>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  ⏱️ <strong>Note:</strong> Jika deployment gagal, tunggu 5-10 menit dan retry. 
                  Kadang Supabase server overload.
                </p>
              </div>
            </div>
          </Step>

          {/* Step 5 */}
          <Step number={5} title="Test Backend">
            <p className="text-slate-400 mb-4">
              Test apakah backend berhasil di-deploy dengan membuka URL ini:
            </p>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <code className="flex-1 text-sm text-blue-400 break-all">
                  {testUrl}
                </code>
              </div>
              <div className="flex gap-3">
                <a
                  href={testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Terminal className="h-4 w-4" />
                  Test Backend
                </a>
                <CopyButton text={testUrl} step={5} label="Copy URL" />
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-2">Expected Response:</p>
              <pre className="text-xs text-green-400">
                {JSON.stringify(
                  {
                    ok: true,
                    message: "Investoft Backend v17.0.0",
                    timestamp: "2026-02-22T..."
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </Step>
        </div>

        {/* Success / Next Steps */}
        {completedSteps.size === 5 ? (
          <div className="mt-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Deployment Complete! 🎉</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Backend Investoft berhasil di-deploy! Sekarang test dengan Quick Fix Dashboard.
            </p>
            <div className="flex gap-3">
              <a
                href="/quick-fix-dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                Run Diagnostic Test
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3">Tips:</h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>• Klik checkbox di setiap step setelah selesai untuk track progress</li>
              <li>• Copy button akan mempermudah copy-paste URL dan code</li>
              <li>• Jika ada masalah, screenshot error dan test URL response</li>
              <li>• Setelah selesai, jalankan Quick Fix Dashboard untuk verify</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
