import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { AlertCircle, ArrowRight, Sparkles, Zap } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('⚠️ [LoginPage] DEPRECATED!');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('🚨 This page is no longer the recommended way to login.');
    console.log('');
    console.log('✅ NEW RECOMMENDED METHOD:');
    console.log('   Use /direct-signup page instead!');
    console.log('');
    console.log('💡 REASON:');
    console.log('   - DirectSignup uses Supabase Auth directly');
    console.log('   - More reliable & faster');
    console.log('   - Auto-creates account if not exists');
    console.log('   - Better error handling');
    console.log('');
    console.log('🔄 Auto-redirecting in 5 seconds...');
    console.log('═══════════════════════════════════════════════');
    console.log('');
  }, []);

  useEffect(() => {
    if (!autoRedirect) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/direct-signup');
    }
  }, [countdown, navigate, autoRedirect]);

  const handleGoNow = () => {
    navigate('/direct-signup');
  };

  const handleStay = () => {
    setAutoRedirect(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Redirect Notice Card */}
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl p-8 border-2 border-blue-500/30 shadow-2xl shadow-blue-600/20 backdrop-blur-sm">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white text-center mb-4">
            New Login Method Available!
          </h1>

          {/* Message */}
          <div className="bg-slate-900/60 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-semibold mb-2">
                  Login page has been updated!
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We've improved the login experience with our new <span className="text-blue-400 font-semibold">DirectSignup</span> page. It's faster, more reliable, and automatically creates your account if it doesn't exist yet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 font-semibold mb-2">
                  Benefits:
                </p>
                <ul className="text-slate-300 text-sm space-y-1.5 list-disc list-inside">
                  <li>Uses Supabase Auth directly (more reliable)</li>
                  <li>Auto-creates account if doesn't exist</li>
                  <li>Faster login process</li>
                  <li>Better error messages & debugging</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Countdown */}
          {autoRedirect && (
            <div className="bg-blue-600/20 border border-blue-500/40 rounded-lg p-4 mb-6 text-center">
              <p className="text-blue-300 text-sm mb-2">
                Auto-redirecting to DirectSignup in...
              </p>
              <div className="text-5xl font-bold text-blue-400 animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoNow}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-xl shadow-blue-600/30"
            >
              Go to DirectSignup Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {autoRedirect && (
              <Button
                onClick={handleStay}
                variant="outline"
                className="w-full border-2 border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600 py-4 rounded-xl backdrop-blur-sm"
              >
                Cancel Auto-redirect
              </Button>
            )}
          </div>

          {/* Footer Note */}
          <p className="text-xs text-slate-500 text-center mt-6">
            Don't worry, your test account credentials remain the same:<br />
            <span className="text-slate-400">azuranistirah@gmail.com / Sundala99!</span>
          </p>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            Having issues? The DirectSignup page has detailed logs to help debug any problems.
          </p>
        </div>
      </div>
    </div>
  );
}