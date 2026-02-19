import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('========================================');
      console.log('🚀 [LOGIN FLOW START]');
      console.log('Mode:', mode);
      console.log('Email:', email);
      console.log('Password length:', password.length);
      console.log('========================================');

      if (mode === 'signup') {
        // CREATE ACCOUNT
        console.log('🧪 [STEP 1] Creating new account via backend...');
        
        const createUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`;
        console.log('📡 Create URL:', createUrl);
        
        const createBody = {
          email,
          password,
          name: email.split('@')[0],
          initial_balance: 10000
        };
        console.log('📦 Create Request Body:', createBody);
        
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(createBody)
        });

        console.log('📊 Create Response Status:', createResponse.status);
        console.log('📊 Create Response OK:', createResponse.ok);
        
        const createResult = await createResponse.json();
        console.log('📦 Create Response Body:', createResult);
        
        if (createResult.existing) {
          console.log('⚠️ Account exists, switching to login mode...');
          setMode('login');
          setError('Account already exists. Logging you in...');
        } else if (!createResponse.ok) {
          console.error('❌ Create account failed:', createResult.error);
          throw new Error(createResult.error || 'Failed to create account');
        } else {
          console.log('✅ Account created successfully!');
          console.log('⏳ Waiting 1 second before login...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // LOGIN
      console.log('🔐 [STEP 2] Attempting login...');
      
      const loginUrl = `https://${projectId}.supabase.co/auth/v1/token?grant_type=password`;
      console.log('📡 Login URL:', loginUrl);
      console.log('🔑 Using apikey:', publicAnonKey?.substring(0, 20) + '...');
      
      const loginBody = { email, password };
      console.log('📦 Login Request Body:', { email, password: '***' });
      
      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': publicAnonKey
        },
        body: JSON.stringify(loginBody)
      });

      console.log('📊 Login Response Status:', loginResponse.status);
      console.log('📊 Login Response OK:', loginResponse.ok);
      console.log('📊 Login Response Headers:', Object.fromEntries(loginResponse.headers.entries()));
      
      const loginResult = await loginResponse.json();
      console.log('📦 Login Response Body:', loginResult);

      if (!loginResponse.ok) {
        console.error('❌ Login failed with status:', loginResponse.status);
        console.error('❌ Error details:', loginResult);
        
        // Check if it's an "invalid credentials" error (user doesn't exist)
        const isInvalidCredentials = 
          loginResult.error_description?.includes('Invalid login credentials') ||
          loginResult.msg?.includes('Invalid login credentials') ||
          loginResult.error_code === 'invalid_credentials';
        
        // If login fails and we're NOT in signup mode, try to create account first
        if (mode === 'login' && isInvalidCredentials) {
          console.log('⚠️ User not found, attempting auto-create...');
          
          const autoCreateUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`;
          console.log('📡 Auto-Create URL:', autoCreateUrl);
          
          const autoCreateResponse = await fetch(autoCreateUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              email,
              password,
              name: email.split('@')[0],
              initial_balance: 10000
            })
          });

          console.log('📊 Auto-Create Response Status:', autoCreateResponse.status);
          console.log('📊 Auto-Create Response OK:', autoCreateResponse.ok);
          
          const autoCreateResult = await autoCreateResponse.json();
          console.log('📦 Auto-Create Response:', JSON.stringify(autoCreateResult, null, 2));
          
          if (autoCreateResponse.ok || autoCreateResult.existing) {
            console.log('✅ Account created/exists, retrying login...');
            console.log('⏳ Waiting 1.5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('🔐 [RETRY LOGIN]');
            const retryLoginResponse = await fetch(loginUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': publicAnonKey
              },
              body: JSON.stringify(loginBody)
            });

            console.log('📊 Retry Login Status:', retryLoginResponse.status);
            const retryLoginResult = await retryLoginResponse.json();
            console.log('📦 Retry Login Response:', retryLoginResult);
            
            if (!retryLoginResponse.ok) {
              console.error('❌ Retry login also failed!');
              throw new Error(retryLoginResult.error_description || retryLoginResult.msg || 'Login failed after account creation');
            }
            
            // Success on retry
            console.log('✅ Login successful on retry!');
            
            // Store in all required localStorage keys
            localStorage.setItem('investoft_access_token', retryLoginResult.access_token);
            localStorage.setItem('investoft_user', JSON.stringify(retryLoginResult.user));
            
            // Also store individual fields for compatibility
            localStorage.setItem('investoft_token', retryLoginResult.access_token);
            localStorage.setItem('investoft_user_id', retryLoginResult.user.id);
            localStorage.setItem('investoft_user_email', retryLoginResult.user.email);
            localStorage.setItem('investoft_user_role', retryLoginResult.user.user_metadata?.role || 'member');
            
            // For MemberDashboard compatibility
            localStorage.setItem('accessToken', retryLoginResult.access_token);
            localStorage.setItem('userId', retryLoginResult.user.id);
            localStorage.setItem('userEmail', retryLoginResult.user.email);
            localStorage.setItem('userRole', retryLoginResult.user.user_metadata?.role || 'member');
            
            console.log('💾 Credentials saved to localStorage');
            console.log('🎉 Redirecting to /member...');
            navigate('/member');
            return;
          } else {
            console.error('❌ Auto-create failed!');
            console.error('❌ Status:', autoCreateResponse.status);
            console.error('❌ Response:', autoCreateResult);
            console.error('❌ Error message:', autoCreateResult.error || 'Unknown error');
          }
        }
        
        const errorMsg = loginResult.error_description || loginResult.msg || loginResult.error || 'Login failed. Please check your credentials.';
        console.error('❌ Final error message:', errorMsg);
        throw new Error(errorMsg);
      }

      // SUCCESS!
      console.log('✅ Login successful!');
      console.log('👤 User:', loginResult.user);
      console.log('🔑 Access Token:', loginResult.access_token?.substring(0, 20) + '...');
      
      // Store in all required localStorage keys
      localStorage.setItem('investoft_access_token', loginResult.access_token);
      localStorage.setItem('investoft_user', JSON.stringify(loginResult.user));
      
      // Also store individual fields for compatibility
      localStorage.setItem('investoft_token', loginResult.access_token);
      localStorage.setItem('investoft_user_id', loginResult.user.id);
      localStorage.setItem('investoft_user_email', loginResult.user.email);
      localStorage.setItem('investoft_user_role', loginResult.user.user_metadata?.role || 'member');
      
      // For MemberDashboard compatibility
      localStorage.setItem('accessToken', loginResult.access_token);
      localStorage.setItem('userId', loginResult.user.id);
      localStorage.setItem('userEmail', loginResult.user.email);
      localStorage.setItem('userRole', loginResult.user.user_metadata?.role || 'member');
      
      console.log('💾 Credentials saved to localStorage');
      
      console.log('🎉 Redirecting to /member...');
      navigate('/member');
      
    } catch (err: any) {
      console.error('========================================');
      console.error('❌ [CRITICAL ERROR]');
      console.error('Error Type:', err.constructor.name);
      console.error('Error Message:', err.message);
      console.error('Error Stack:', err.stack);
      console.error('========================================');
      setError(err.message || 'Something went wrong. Please check console for details.');
    } finally {
      setLoading(false);
      console.log('========================================');
      console.log('🏁 [LOGIN FLOW END]');
      console.log('========================================');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
            <span className="text-3xl">💹</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Investoft
          </h1>
          <p className="text-slate-400 text-sm">
            Professional Trading Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg">
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {mode === 'signup' ? 'Creating Account...' : 'Logging In...'}
                </>
              ) : (
                <>
                  {mode === 'signup' ? '🚀 Create Account' : '🔐 Login'}
                </>
              )}
            </Button>
          </form>

          {/* Test Account Info */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <h4 className="text-purple-400 font-semibold text-sm mb-2">
              💡 Test Account
            </h4>
            <div className="text-slate-400 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Email:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('azuranistirah@gmail.com');
                    setPassword('Sundala99!');
                    setMode('login');
                  }}
                  className="text-purple-400 hover:text-purple-300 font-mono"
                >
                  azuranistirah@gmail.com
                </button>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <span className="text-white font-mono">Sundala99!</span>
              </div>
              <div className="flex justify-between">
                <span>Demo Balance:</span>
                <span className="text-green-400">$10,000</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-2">
              Click email to auto-fill credentials
            </p>
          </div>

          {/* Auto-Create Info */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-xs">
              ℹ️ <strong>First time?</strong> Just enter your email & password and click Login. 
              Account will be created automatically with $10,000 demo balance!
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}