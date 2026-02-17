import { useState } from "react";
import { X, Lock, AlertCircle, Shield, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { projectId } from "../../../utils/supabase/info";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, userId: string) => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Provide more helpful error messages
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your admin credentials.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Email not confirmed. Please verify your email address.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("Login failed - no session created");
        setLoading(false);
        return;
      }

      // Check if user is admin
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/profile`,
        {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        setError("Failed to fetch user profile");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const result = await response.json();

      // Verify user is admin
      if (result.user.role !== "admin") {
        setError("Access denied - Admin privileges required");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Success!
      onSuccess(data.session.access_token, data.user.id);
      onClose();
    } catch (err) {
      console.error("Admin login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md animate-in zoom-in slide-in-from-bottom-4 duration-300">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent pointer-events-none"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10 p-2 hover:bg-white/5 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="relative p-8 pb-6 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/50 mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">
              Admin Access
            </h2>
            <p className="text-slate-400 text-sm">
              Sign in to access the administration panel
            </p>
          </div>

          {/* Body */}
          <form onSubmit={handleLogin} className="relative p-8 pt-0 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-200">
                <div className="bg-red-500/20 p-1 rounded-lg flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-200 font-medium">Authentication Error</p>
                  <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="admin-email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@investoft.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Sign In to Admin Panel</span>
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="pt-2">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/10 p-1.5 rounded-lg flex-shrink-0">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300 mb-1">
                      Secure Admin Area
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      This is a restricted area. All access attempts are logged and monitored for security purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}