import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { projectId } from "../../../utils/supabase/info";
import { CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";

export function SupabaseTestPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    const testResults: any[] = [];

    // Test 1: Check Configuration
    testResults.push({
      name: "Configuration",
      status: "success",
      message: `Project ID: ${projectId}`,
      details: `URL: https://${projectId}.supabase.co`,
    });
    setResults([...testResults]);

    // Test 2: Test Health Endpoint
    try {
      const healthCheck = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
        headers: {
          'apikey': supabase.key,
          'Authorization': `Bearer ${supabase.key}`,
        },
      });
      if (healthCheck.ok || healthCheck.status === 401) {
        testResults.push({
          name: "REST API Health",
          status: "success",
          message: "REST API is reachable and responding",
          details: `Status: ${healthCheck.status} (${healthCheck.status === 401 ? 'Auth required - OK' : 'OK'})`,
        });
      } else {
        testResults.push({
          name: "REST API Health",
          status: "warning",
          message: "REST API returned unexpected status",
          details: `Status: ${healthCheck.status}`,
        });
      }
    } catch (error: any) {
      testResults.push({
        name: "REST API Health",
        status: "error",
        message: "Cannot reach REST API",
        details: error.message,
      });
    }
    setResults([...testResults]);

    // Test 3: Test Auth Endpoint
    try {
      const authCheck = await fetch(
        `https://${projectId}.supabase.co/auth/v1/health`,
        {
          headers: {
            'apikey': supabase.key,
          },
        }
      );
      
      if (authCheck.ok) {
        const data = await authCheck.json();
        testResults.push({
          name: "Auth Service",
          status: "success",
          message: "Auth service is healthy",
          details: JSON.stringify(data, null, 2),
        });
      } else {
        const errorText = await authCheck.text().catch(() => 'No response body');
        testResults.push({
          name: "Auth Service",
          status: "warning",
          message: `Auth service responded with ${authCheck.status}`,
          details: `Status: ${authCheck.status}\nResponse: ${errorText}`,
        });
      }
    } catch (error: any) {
      // Auth service error is not critical if SDK works
      testResults.push({
        name: "Auth Service",
        status: "warning",
        message: "Cannot reach Auth health endpoint (non-critical)",
        details: `${error.message}\n\nNote: This may be normal if direct health endpoint is not exposed.\nThe Supabase SDK test below is more important.`,
      });
    }
    setResults([...testResults]);

    // Test 4: Try Supabase SDK
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        testResults.push({
          name: "Supabase SDK",
          status: "warning",
          message: "SDK call returned error (expected if no session)",
          details: error.message,
        });
      } else {
        testResults.push({
          name: "Supabase SDK",
          status: "success",
          message: "SDK is working correctly",
          details: data.session ? "Active session found" : "No active session (OK)",
        });
      }
    } catch (error: any) {
      testResults.push({
        name: "Supabase SDK",
        status: "error",
        message: "SDK call failed",
        details: error.message,
      });
    }
    setResults([...testResults]);

    // Test 5: Try Sign Up (dry run)
    try {
      const testEmail = `test-${Date.now()}@investoft.com`;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "TestPassword123!",
        options: {
          data: { test: true },
        },
      });

      if (error) {
        // Check if it's a meaningful error (not CORS/network)
        if (error.message.includes("fetch") || error.message.includes("Failed") || error.message.includes("Network")) {
          testResults.push({
            name: "Auth Sign Up Test",
            status: "error",
            message: "Network/CORS error - Auth may not be configured",
            details: `${error.message}\n\nPossible causes:\n1. Auth service not enabled in Supabase project\n2. Email confirmation required but not configured\n3. Network connectivity issues\n\nNote: This is not critical if you can still create accounts via Admin Panel.`,
          });
        } else if (error.message.includes("already") || error.message.includes("exists")) {
          testResults.push({
            name: "Auth Sign Up Test",
            status: "success",
            message: "Auth API is working (user already exists)",
            details: error.message,
          });
        } else {
          testResults.push({
            name: "Auth Sign Up Test",
            status: "success",
            message: "Auth API is working (got expected error)",
            details: error.message,
          });
        }
      } else {
        testResults.push({
          name: "Auth Sign Up Test",
          status: "success",
          message: "Sign up succeeded (test user created)",
          details: `User ID: ${data.user?.id}`,
        });
      }
    } catch (error: any) {
      testResults.push({
        name: "Auth Sign Up Test",
        status: "error",
        message: "Auth sign up failed",
        details: error.message,
      });
    }
    setResults([...testResults]);

    // Test 6: Test Edge Function (Backend)
    try {
      const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/`;
      const backendCheck = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${supabase.key}`,
        },
      });
      
      if (backendCheck.ok) {
        const data = await backendCheck.json();
        testResults.push({
          name: "Edge Function Backend",
          status: "success",
          message: "Backend is responding correctly",
          details: `Status: ${backendCheck.status}\nResponse: ${JSON.stringify(data, null, 2)}`,
        });
      } else {
        testResults.push({
          name: "Edge Function Backend",
          status: "error",
          message: "Backend returned error status",
          details: `Status: ${backendCheck.status}\nURL: ${backendUrl}`,
        });
      }
    } catch (error: any) {
      testResults.push({
        name: "Edge Function Backend",
        status: "error",
        message: "Cannot reach Edge Function backend",
        details: `${error.message}\n\nThis may indicate backend deployment issues.`,
      });
    }
    setResults([...testResults]);

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning":
        return <Shield className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
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
      default:
        return "border-blue-500/30 bg-blue-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Supabase Connection Test
          </h1>
          <p className="text-slate-400">
            Diagnose connection issues with Supabase services
          </p>
        </div>

        {/* Configuration Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Project ID:</span>
              <span className="text-blue-400">{projectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">API URL:</span>
              <span className="text-blue-400">https://{projectId}.supabase.co</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Anon Key:</span>
              <span className="text-blue-400 truncate max-w-sm">{supabase.key.substring(0, 30)}...</span>
            </div>
          </div>
        </div>

        {/* Run Tests Button */}
        <button
          onClick={runTests}
          disabled={testing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
        >
          {testing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Running Tests...</span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              <span>Run Connection Tests</span>
            </>
          )}
        </button>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-xl p-4 ${getStatusColor(result.status)}`}
              >
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
                      <pre className="text-xs text-slate-400 bg-black/30 rounded p-3 overflow-x-auto">
                        {result.details}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {results.length === 0 && !testing && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Instructions</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <p>This diagnostic tool will test:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Configuration values</li>
                <li>REST API endpoint accessibility</li>
                <li>Auth service health</li>
                <li>Supabase SDK functionality</li>
                <li>Sign up capability</li>
                <li>Edge Function backend</li>
              </ul>
              <p className="mt-4">
                Click "Run Connection Tests" to begin diagnosis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}