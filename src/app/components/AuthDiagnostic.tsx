import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2, Search } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export function AuthDiagnostic() {
  const [email, setEmail] = useState("admin@investoft.com");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkUser = async () => {
    setChecking(true);
    setResult(null);

    try {
      const diagnosticResult: any = {
        email,
        timestamp: new Date().toISOString(),
        checks: {}
      };

      // Check 1: User exists in Supabase Auth
      console.log("🔍 Checking if user exists in Supabase Auth...");
      try {
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          diagnosticResult.checks.authExists = {
            status: "error",
            message: `Cannot list users: ${listError.message}`,
            details: "Might need service role key to list users"
          };
        } else {
          const userExists = users?.users?.find((u: any) => u.email === email);
          
          if (userExists) {
            diagnosticResult.checks.authExists = {
              status: "success",
              message: "User exists in Supabase Auth",
              details: {
                id: userExists.id,
                email: userExists.email,
                confirmed_at: userExists.confirmed_at,
                created_at: userExists.created_at
              }
            };
          } else {
            diagnosticResult.checks.authExists = {
              status: "error",
              message: "User NOT found in Supabase Auth",
              solution: "User needs to be created via signup or AdminSetupPage"
            };
          }
        }
      } catch (error: any) {
        diagnosticResult.checks.authExists = {
          status: "warning",
          message: "Cannot check auth (need service role)",
          details: error.message
        };
      }

      // Check 2: User profile in KV Store
      console.log("🔍 Checking user profile in backend...");
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/check-user?email=${encodeURIComponent(email)}`,
          {
            headers: {
              "Authorization": `Bearer ${publicAnonKey}`
            }
          }
        );

        const data = await response.json();
        
        if (response.ok && data.exists) {
          diagnosticResult.checks.profileExists = {
            status: "success",
            message: "User profile found in backend",
            details: data.profile
          };
        } else {
          diagnosticResult.checks.profileExists = {
            status: "error",
            message: "User profile NOT found in backend",
            solution: "Profile should be created during signup"
          };
        }
      } catch (error: any) {
        diagnosticResult.checks.profileExists = {
          status: "error",
          message: "Cannot check profile",
          details: error.message,
          solution: "Edge function might not be deployed or /check-user endpoint missing"
        };
      }

      // Check 3: Edge Functions health
      console.log("🔍 Checking Edge Functions health...");
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/health`,
          {
            headers: {
              "Authorization": `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          diagnosticResult.checks.edgeFunctions = {
            status: "success",
            message: "Edge Functions are running"
          };
        } else {
          diagnosticResult.checks.edgeFunctions = {
            status: "error",
            message: "Edge Functions not responding correctly",
            details: `Status: ${response.status}`
          };
        }
      } catch (error: any) {
        diagnosticResult.checks.edgeFunctions = {
          status: "error",
          message: "Cannot reach Edge Functions",
          details: error.message,
          solution: "Edge Functions might not be deployed"
        };
      }

      setResult(diagnosticResult);
    } catch (error: any) {
      setResult({
        error: true,
        message: error.message
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">
              Auth Diagnostic Tool
            </h1>
          </div>

          <p className="text-white/70 mb-6">
            Check if a user exists and can login to Investoft platform
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-white/90 mb-2 font-medium">
                Email to Check
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@investoft.com"
              />
            </div>

            <button
              onClick={checkUser}
              disabled={checking || !email}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {checking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Run Diagnostic
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Diagnostic Results
                </h3>
                
                <div className="space-y-3">
                  {Object.entries(result.checks || {}).map(([key, check]: [string, any]) => (
                    <div key={key} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        {check.status === "success" ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-white/70 text-sm mt-1">
                            {check.message}
                          </p>
                          {check.solution && (
                            <p className="text-yellow-400 text-sm mt-2">
                              💡 Solution: {check.solution}
                            </p>
                          )}
                          {check.details && (
                            <pre className="text-xs text-white/50 mt-2 bg-black/30 p-2 rounded overflow-auto">
                              {JSON.stringify(check.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Recommendations:</h4>
                <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
                  <li>If user doesn't exist: Create via AdminSetupPage or Sign Up</li>
                  <li>If profile missing: Check Edge Functions deployment</li>
                  <li>If member status is "pending": Admin needs to approve</li>
                  <li>Check Supabase Dashboard → Authentication → Users for manual verification</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-3">Quick Fixes:</h3>
          <div className="space-y-2 text-white/70 text-sm">
            <p>• <strong className="text-white">Create Admin:</strong> Click "." after "Investoft" in footer</p>
            <p>• <strong className="text-white">Reset Password:</strong> Supabase Dashboard → Authentication → Users → Reset</p>
            <p>• <strong className="text-white">Approve Member:</strong> Admin Panel → Members Management → Approve</p>
            <p>• <strong className="text-white">Check Logs:</strong> Supabase Dashboard → Edge Functions → Logs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
