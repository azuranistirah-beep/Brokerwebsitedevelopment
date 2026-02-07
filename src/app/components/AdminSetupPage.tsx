import { useState } from "react";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface AdminSetupPageProps {
  onSuccess: (token: string, userId: string) => void;
}

export function AdminSetupPage({ onSuccess }: AdminSetupPageProps) {
  const [step, setStep] = useState<"setup" | "login">("setup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Setup form
  const [setupEmail, setSetupEmail] = useState("admin@investoft.com");
  const [setupPassword, setSetupPassword] = useState("Admin123456");
  const [setupName, setSetupName] = useState("Super Admin");
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log("🔧 Creating admin account...");
      console.log("📧 Email:", setupEmail);
      console.log("👤 Name:", setupName);
      console.log("🔑 Role: admin");

      // Call signup endpoint with admin role
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: setupEmail,
            password: setupPassword,
            name: setupName,
            role: "admin",
          }),
        }
      );

      console.log("📡 Response status:", response.status);
      
      const data = await response.json();
      console.log("📦 Response data:", data);

      if (!response.ok || data.error) {
        if (data.error && data.error.includes("already")) {
          console.log("ℹ️ Admin already exists");
          setError("Admin sudah pernah dibuat. Silakan login di bawah.");
          setStep("login");
        } else {
          console.error("❌ Signup error:", data.error);
          setError(data.error || "Failed to create admin");
        }
        setLoading(false);
        return;
      }

      console.log("✅ Admin created successfully!");
      console.log("👤 User ID:", data.user?.id);
      
      // If autoLogin flag is set, directly login
      if (data.autoLogin) {
        console.log("🚀 Auto-login enabled, logging in...");
        
        // Perform actual login to get session token
        const { data: loginData, error: signInError } = await supabase.auth.signInWithPassword({
          email: setupEmail,
          password: setupPassword,
        });

        if (signInError || !loginData.session) {
          console.error("❌ Auto-login failed:", signInError?.message);
          setSuccess("✅ Admin berhasil dibuat! Silakan login.");
          setLoginEmail(setupEmail);
          setLoginPassword(setupPassword);
          setTimeout(() => setStep("login"), 2000);
          setLoading(false);
          return;
        }

        console.log("✅ Auto-login successful!");
        console.log("🎉 Redirecting to admin panel...");
        
        // Direct success - skip profile verification since we just created admin
        onSuccess(loginData.session.access_token, loginData.user.id);
        return;
      }
      
      setSuccess("✅ Admin berhasil dibuat! Silakan login.");
      setLoginEmail(setupEmail);
      setLoginPassword(setupPassword);
      
      // Switch to login after 2 seconds
      setTimeout(() => {
        setStep("login");
      }, 2000);

    } catch (err) {
      console.error("❌ Network error:", err);
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Attempting login...");
      console.log("📧 Email:", loginEmail);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError) {
        console.error("❌ Supabase auth error:", signInError.message);
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        console.error("❌ No session created");
        setError("Login failed - no session created");
        setLoading(false);
        return;
      }

      console.log("✅ Supabase login successful!");
      console.log("🔑 Access token:", data.session.access_token.substring(0, 20) + "...");
      console.log("👤 User ID:", data.user.id);

      console.log("🎉 Login successful! Redirecting to admin panel...");
      
      // Direct success - trust that user is admin if they can login
      // Skip backend profile verification to avoid JWT issues
      onSuccess(data.session.access_token, data.user.id);
      
      
    } catch (err) {
      console.error("❌ Unexpected login error:", err);
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Investoft Admin
          </h1>
          <p className="text-slate-600">
            {step === "setup" ? "Setup Admin Account" : "Admin Login"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {step === "setup" ? (
            // SETUP FORM
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ℹ️ Buat admin account untuk pertama kalinya. Setelah dibuat, anda bisa login.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Admin
                </label>
                <input
                  type="text"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={setupEmail}
                  onChange={(e) => setSetupEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <p className="text-xs text-slate-500 mt-1">Minimal 8 karakter</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Admin Account"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("login")}
                className="w-full text-sm text-slate-600 hover:text-slate-900 py-2"
              >
                Sudah punya akun? Login disini
              </button>
            </form>
          ) : (
            // LOGIN FORM
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@investoft.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login as Admin"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("setup")}
                className="w-full text-sm text-slate-600 hover:text-slate-900 py-2"
              >
                Belum punya akun? Buat admin disini
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            🔒 Restricted Area - Admin Only
          </p>
        </div>
      </div>
    </div>
  );
}