import { useState } from "react";
import { X, Lock, AlertCircle } from "lucide-react";
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Access</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-2">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@investoft.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Login as Admin"}
          </button>

          <p className="text-xs text-center text-slate-500 mt-4">
            🔒 This is a restricted area. Unauthorized access is prohibited.
          </p>
        </form>
      </div>
    </div>
  );
}