import { useState, useEffect } from "react";
import { Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import { projectId } from "../../../utils/supabase/info";

export function AdminFirstSetup() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("checking");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      console.log("🔍 Checking admin status...");
      console.log("📡 Supabase URL:", `https://${projectId}.supabase.co`);
      console.log("🔑 Using project ID:", projectId);
      
      setStatus("checking");
      
      // Try to sign in with admin credentials to check if already exists
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@investoft.com",
        password: "Sundala99!",
      });

      if (data.session) {
        // Admin already exists
        console.log("✅ Admin already exists!");
        setStatus("exists");
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        // Admin doesn't exist yet
        console.log("ℹ️ Admin account not found, ready to create");
        setStatus("ready");
      }
    } catch (err) {
      // Admin doesn't exist
      console.log("ℹ️ Admin check failed (expected if not created yet):", err);
      setStatus("ready");
    }
  };

  const createAdminAccount = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🔧 Creating admin account via Supabase Auth...");
      
      // Create admin directly via Supabase signup
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: "admin@investoft.com",
        password: "Sundala99!",
        options: {
          data: {
            name: "Administrator",
            role: "admin",
          },
        },
      });

      if (signupError) {
        // User might already exist
        if (signupError.message.includes("already registered") || 
            signupError.message.includes("User already registered")) {
          console.log("ℹ️ Admin already exists, attempting sign in...");
        } else {
          console.error("❌ Signup error:", signupError);
          throw new Error(signupError.message);
        }
      } else {
        console.log("✅ Admin account created:", signupData.user?.email);
      }

      // Sign in to verify
      console.log("🔑 Signing in as admin...");
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: "admin@investoft.com",
        password: "Sundala99!",
      });

      if (signInError) {
        console.error("❌ Sign in error:", signInError);
        throw new Error(signInError.message);
      }

      if (!authData.session) {
        console.error("❌ No session created");
        throw new Error("Login failed - no session created");
      }

      console.log("✅ Sign in successful!");
      console.log("✅ Admin setup complete!");
      
      setSuccess(true);
      setStatus("complete");

      // Wait 2 seconds then redirect
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err: any) {
      console.error("❌ Admin setup error:", err);
      setError(err.message || "Failed to create admin account. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600/30 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (status === "exists") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Already Setup</h2>
          <p className="text-slate-400 mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-purple-600 to-red-600 rounded-2xl blur-3xl opacity-20 animate-pulse"></div>

        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-8 text-center border-b border-slate-800">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/50 mb-4">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Setup</h1>
            <p className="text-slate-400">
              Create the first administrator account
            </p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-200 font-medium">Setup Failed</p>
                  <p className="text-xs text-red-300/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-200 font-medium">Success!</p>
                  <p className="text-xs text-green-300/80 mt-1">
                    Admin account created successfully. Redirecting...
                  </p>
                </div>
              </div>
            )}

            {/* Admin Credentials Display */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white mb-3">Administrator Credentials</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Email</label>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3">
                    <code className="text-sm text-blue-400">admin@investoft.com</code>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Password</label>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3">
                    <code className="text-sm text-purple-400">Sundala99!</code>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Role</label>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm text-red-400 font-semibold">
                      <Shield className="h-4 w-4" />
                      ADMINISTRATOR
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Client-side setup (no backend required)</span>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={createAdminAccount}
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Admin Account...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Setup Complete!</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Create Administrator Account</span>
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-300 mb-1">
                    First Time Setup - Client Side Only
                  </p>
                  <p className="text-xs text-blue-300/70 leading-relaxed">
                    This creates the admin account directly via Supabase Auth without requiring backend deployment. 
                    The admin system is fully functional and ready to use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}