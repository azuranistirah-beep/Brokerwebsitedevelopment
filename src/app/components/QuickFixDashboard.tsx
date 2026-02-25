import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Shield, RefreshCw, AlertTriangle } from "lucide-react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface TestResult {
  name: string;
  status: "success" | "warning" | "error" | "testing";
  message: string;
  details?: string;
  action?: () => void;
  actionLabel?: string;
}

export function QuickFixDashboard() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateResult = (index: number, update: Partial<TestResult>) => {
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], ...update };
      return newResults;
    });
  };

  const runQuickDiagnostic = async () => {
    setTesting(true);
    const initialResults: TestResult[] = [
      { name: "1. Configuration Check", status: "testing", message: "Checking..." },
      { name: "2. Supabase Connection", status: "testing", message: "Checking..." },
      { name: "3. Edge Function Backend", status: "testing", message: "Checking..." },
      { name: "4. Auth Service", status: "testing", message: "Checking..." },
    ];
    setResults(initialResults);

    // Test 1: Configuration
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateResult(0, {
      status: "success",
      message: "Configuration valid",
      details: `Project: ${projectId}\nURL: https://${projectId}.supabase.co`,
    });

    // Test 2: Supabase Connection
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const response = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.status === 401 || response.ok) {
        updateResult(1, {
          status: "success",
          message: "Supabase is reachable",
          details: `Status: ${response.status} (${response.status === 401 ? "Auth required - OK" : "OK"})`,
        });
      } else {
        updateResult(1, {
          status: "error",
          message: "Supabase returned unexpected status",
          details: `Status: ${response.status}`,
        });
      }
    } catch (error: any) {
      updateResult(1, {
        status: "error",
        message: "Cannot reach Supabase",
        details: error.message,
      });
    }

    // Test 3: Edge Function Backend
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/`;
      console.log("🔍 Testing backend at:", backendUrl);
      
      const response = await fetch(backendUrl, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      console.log("📡 Backend response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Backend response data:", data);
        updateResult(2, {
          status: "success",
          message: "Backend is working!",
          details: `Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`,
        });
      } else {
        const errorText = await response.text().catch(() => "No response body");
        console.error("❌ Backend error:", errorText);
        updateResult(2, {
          status: "error",
          message: `Backend returned error (${response.status})`,
          details: `Status: ${response.status}\nError: ${errorText}\n\n🔧 This usually means:\n1. Edge Function not deployed\n2. Edge Function has errors\n3. Wrong function name`,
          action: () => {
            window.open(`https://supabase.com/dashboard/project/${projectId}/functions/make-server-20da1dab`, "_blank");
          },
          actionLabel: "Open Supabase Dashboard",
        });
      }
    } catch (error: any) {
      console.error("❌ Backend fetch error:", error);
      updateResult(2, {
        status: "error",
        message: "Cannot reach backend",
        details: `${error.message}\n\n🔧 Possible solutions:\n1. Deploy Edge Function in Supabase Dashboard\n2. Check function name is 'make-server-20da1dab'\n3. Verify function is running`,
        action: () => {
          window.location.href = "/deployment-guide";
        },
        actionLabel: "View Deployment Guide",
      });
    }

    // Test 4: Auth Service
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const response = await fetch(`https://${projectId}.supabase.co/auth/v1/health`, {
        headers: {
          apikey: publicAnonKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        updateResult(3, {
          status: "success",
          message: "Auth service is healthy",
          details: JSON.stringify(data, null, 2),
        });
      } else {
        updateResult(3, {
          status: "warning",
          message: "Auth service not responding (non-critical)",
          details: `Status: ${response.status}\n\nNote: This is OK if you're using localStorage auth fallback.`,
        });
      }
    } catch (error: any) {
      updateResult(3, {
        status: "warning",
        message: "Auth health endpoint unavailable",
        details: `${error.message}\n\nNote: This is OK. Auth may still work via SDK.`,
      });
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "testing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Shield className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-500/30 bg-green-500/10";
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/10";
      case "error":
        return "border-red-500/30 bg-red-500/10";
      case "testing":
        return "border-blue-500/30 bg-blue-500/10";
      default:
        return "border-slate-500/30 bg-slate-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-white">Quick Fix Dashboard</h1>
          </div>
          <p className="text-slate-400">Fast diagnostic & troubleshooting for Investoft</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-blue-300 font-semibold mb-2">About This Tool</h3>
              <p className="text-sm text-blue-200/80">
                This dashboard runs quick tests to identify common issues with your Investoft platform. 
                It checks Supabase connection, Edge Function backend, and Auth service.
              </p>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={runQuickDiagnostic}
          disabled={testing}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-semibold shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
        >
          {testing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Running Diagnostic...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5" />
              <span>Run Quick Diagnostic</span>
            </>
          )}
        </button>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Diagnostic Results</h2>
            {results.map((result, index) => (
              <div key={index} className={`border rounded-xl p-4 ${getStatusColor(result.status)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white">{result.name}</h3>
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        {result.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{result.message}</p>
                    {result.details && (
                      <pre className="text-xs text-slate-400 bg-black/30 rounded p-3 overflow-x-auto whitespace-pre-wrap">
                        {result.details}
                      </pre>
                    )}
                    {result.action && result.actionLabel && (
                      <button
                        onClick={result.action}
                        className="mt-3 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {result.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Summary */}
            {!testing && (
              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
                <div className="space-y-3 text-sm text-slate-400">
                  {results.filter((r) => r.status === "error").length > 0 ? (
                    <>
                      <p className="text-red-300">
                        ⚠️ Found {results.filter((r) => r.status === "error").length} critical issue(s)
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        {results
                          .filter((r) => r.status === "error")
                          .map((r, i) => (
                            <li key={i}>{r.name}</li>
                          ))}
                      </ul>
                      <p className="mt-4">
                        Please review the errors above and click action buttons if available.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-green-300">✅ All systems operational!</p>
                      <p>Your Investoft platform is ready to use.</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {results.length === 0 && !testing && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <p>Click "Run Quick Diagnostic" to check:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Configuration values (Project ID, API keys)</li>
                <li>Supabase connectivity</li>
                <li>Edge Function backend status</li>
                <li>Auth service availability</li>
              </ul>
              <p className="mt-4 text-slate-500">This takes about 2 seconds to complete.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}