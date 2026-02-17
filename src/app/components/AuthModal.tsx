import { useState, useEffect } from "react";
import { X, BarChart3, UserPlus, LogIn, Mail, Lock, User, Eye, EyeOff, Sparkles, Shield, ArrowRight, TrendingUp, Gift, Wallet, Zap, HeadphonesIcon, DollarSign, Smartphone, Phone } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "sonner";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Professional Auth Modal with Split Layout Design
interface AuthModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (accessToken: string, userId: string) => void;
  onAuthSuccess?: (accessToken: string, userId: string) => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ open, onClose, onOpenChange, onSuccess, onAuthSuccess, defaultTab = "signin" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinPhone, setSigninPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPhone, setSignupPhone] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // Password strength calculator
  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' | null => {
    if (!password) return null;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  // Update password strength on change
  useEffect(() => {
    if (activeTab === 'signup') {
      setPasswordStrength(calculatePasswordStrength(signupPassword));
    }
  }, [signupPassword, activeTab]);

  // ✅ FIX: Sync activeTab dengan defaultTab ketika modal dibuka
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  if (!open) return null;

  // Unified close handler
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Unified success handler
  const handleSuccess = (token: string, id: string) => {
    if (onSuccess) {
      onSuccess(token, id);
    } else if (onAuthSuccess) {
      onAuthSuccess(token, id);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password: signinPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please confirm your email address before signing in.');
        } else {
          toast.error(`Sign in failed: ${error.message}`);
        }
        console.error("Sign in error:", error);
        setLoading(false);
        return;
      }

      if (data.session) {
        const profileResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/profile`,
          {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          }
        );

        if (!profileResponse.ok) {
          toast.error('Failed to fetch user profile. Please try again.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        const profileResult = await profileResponse.json();
        
        if (profileResult.user?.status === 'pending') {
          toast.error('Your account is awaiting admin approval. You will be notified once approved.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (profileResult.user?.status === 'rejected') {
          toast.error('Your account has been rejected by admin. Please contact support.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        toast.success("Sign in successful!");
        handleSuccess(data.session.access_token, data.user.id);
        handleClose();
      }
    } catch (error) {
      toast.error(`Sign in error: ${error}`);
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
            name: signupName,
            phone: signupPhone,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(`Signup failed: ${result.error}`);
        console.error("Signup error:", result.error);
        setLoading(false);
        return;
      }

      if (result.user?.status === 'pending') {
        toast.success("Account created! Your account is awaiting admin approval. You will be notified once approved.");
        setSignupEmail("");
        setSignupPassword("");
        setSignupName("");
        setLoading(false);
        handleClose();
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword,
      });

      if (error) {
        toast.error(`Auto sign-in failed: ${error.message}. Please sign in manually.`);
        console.error("Auto sign-in error:", error);
        setLoading(false);
        return;
      }

      if (data.session) {
        toast.success("Account created successfully!");
        handleSuccess(data.session.access_token, data.user.id);
        handleClose();
      }
    } catch (error) {
      toast.error(`Signup error: ${error}`);
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
        
        {/* Main Container */}
        <div className="relative bg-gradient-to-br from-black via-slate-950 to-black border border-slate-800/30 rounded-3xl shadow-2xl overflow-hidden flex">
          
          {/* Left Side - Branding */}
          <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Investoft</h1>
                  <p className="text-white/80 text-sm">Professional Trading Platform</p>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                {activeTab === "signin" ? "Welcome Back!" : "Start Your Trading Journey Today"}
              </h2>
              <p className="text-white/90 text-lg leading-relaxed">
                {activeTab === "signin" 
                  ? "Sign in to access your account and continue your professional trading experience with real-time market data."
                  : "Join thousands of traders who trust Investoft for fast, secure, and professional trading experience."
                }
              </p>
            </div>

            {/* Features - Only show on Sign Up */}
            {activeTab === "signup" && (
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Bank-Level Security</p>
                    <p className="text-white/70 text-sm">Your funds are protected</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Real-Time Market Data</p>
                    <p className="text-white/70 text-sm">Live prices & charts</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Fast Execution</p>
                    <p className="text-white/70 text-sm">Trade in milliseconds</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Instant Withdrawals</p>
                    <p className="text-white/70 text-sm">Get your profits anytime</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Demo Account Included</p>
                    <p className="text-white/70 text-sm">Practice risk-free trading</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <HeadphonesIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">24/7 Customer Support</p>
                    <p className="text-white/70 text-sm">We're always here to help</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Low Minimum Deposit</p>
                    <p className="text-white/70 text-sm">Start trading from just $1</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Trade on Any Device</p>
                    <p className="text-white/70 text-sm">Desktop, mobile, or tablet</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full md:w-3/5 p-8 md:p-12 relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-slate-800/50 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveTab("signin")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === "signin"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === "signup"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Sign In Form */}
            {activeTab === "signin" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Welcome Back!</h3>
                  <p className="text-slate-400">Sign in to your account to continue trading</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                    <input
                      type="email"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Phone Number (Optional)
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={signinPhone}
                    onChange={(value) => setSigninPhone(value || '')}
                    placeholder="Enter your phone number"
                    disabled={loading}
                    className="phone-input-custom"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                    <input
                      type={showSigninPassword ? "text" : "password"}
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-12 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSigninPassword(!showSigninPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 z-10"
                    >
                      {showSigninPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Your Account</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Create Account</h3>
                  <p className="text-slate-400 mb-4">Start trading with Investoft in minutes</p>
                  
                  {/* ✨ WELCOME BONUS BADGE - Animated */}
                  <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-blue-600/15 border border-blue-500/40 backdrop-blur-sm shadow-md shadow-blue-500/10 animate-[fadeInBounce_1s_ease-out_0.3s_both,float_3s_ease-in-out_1.3s_infinite]">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-blue-400 flex-shrink-0 animate-[wiggle_1s_ease-in-out_1.3s_infinite]" />
                      <div className="text-blue-300 font-bold text-sm">
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Welcome Bonus 100%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-300 text-xs leading-tight">
                        Deposit $1,000 and trade instantly with $2,000
                      </div>
                      <div className="text-blue-400 text-xs mt-1.5 font-semibold">
                        Bonus applies in multiples
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Phone Number
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={signupPhone}
                    onChange={(value) => setSignupPhone(value || '')}
                    placeholder="Enter your phone number"
                    disabled={loading}
                    className="custom-phone-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-11 pr-12 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 z-10"
                    >
                      {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>

                    {/* Floating Password Strength Tooltip - Above Input */}
                    {signupPassword && passwordStrength !== 'strong' && (
                      <div className="absolute left-0 right-0 bottom-full mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-3">
                          {/* Compact Tips */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-0.5">
                              <div className={`w-6 h-1 rounded-full transition-all duration-300 ${
                                passwordStrength === 'weak' ? 'bg-red-500' :
                                passwordStrength === 'medium' ? 'bg-orange-400' : 'bg-slate-700'
                              }`}></div>
                              <div className={`w-6 h-1 rounded-full transition-all duration-300 ${
                                passwordStrength === 'medium' ? 'bg-orange-400' : 'bg-slate-700'
                              }`}></div>
                              <div className={`w-6 h-1 rounded-full transition-all duration-300 ${
                                passwordStrength === 'strong' ? 'bg-green-500' : 'bg-slate-700'
                              }`}></div>
                            </div>
                            <span className="text-xs text-slate-400">
                              {passwordStrength === 'weak' && 'Weak password'}
                              {passwordStrength === 'medium' && 'Medium strength'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                            {signupPassword.length < 8 && <span>• 8+ chars</span>}
                            {!/[a-z]/.test(signupPassword) && <span>• lowercase</span>}
                            {!/[A-Z]/.test(signupPassword) && <span>• UPPERCASE</span>}
                            {!/[0-9]/.test(signupPassword) && <span>• number</span>}
                            {!/[^a-zA-Z0-9]/.test(signupPassword) && <span>• special</span>}
                          </div>
                        </div>
                        {/* Arrow pointing down */}
                        <div className="absolute left-6 -bottom-1 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45"></div>
                      </div>
                    )}

                    {/* Success Indicator - Inline */}
                    {signupPassword && passwordStrength === 'strong' && (
                      <div className="absolute right-12 top-1/2 -translate-y-1/2 z-10">
                        <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-md">
                          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs text-green-400 font-medium">Strong</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create My Account</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="pt-2">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/20 p-1.5 rounded-lg flex-shrink-0">
                        <Shield className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-200 mb-1">
                          Account Verification
                        </p>
                        <p className="text-xs text-blue-300/80 leading-relaxed">
                          Your account will be reviewed by our admin team before activation. You'll receive an email notification once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}