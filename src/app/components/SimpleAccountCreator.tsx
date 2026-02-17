import { useState } from 'react';
import { Button } from './ui/button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface SimpleAccountCreatorProps {
  onSuccess?: () => void;
}

export function SimpleAccountCreator({ onSuccess }: SimpleAccountCreatorProps) {
  const [status, setStatus] = useState<'idle' | 'creating' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [accountInfo, setAccountInfo] = useState<any>(null);

  const credentials = {
    email: 'azuranistirah@gmail.com',
    password: 'Sundala99!'
  };

  const createAndTestAccount = async () => {
    try {
      // Step 1: Create account
      setStatus('creating');
      setMessage('Creating account...');
      
      const createResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            name: 'Azura Nistirah',
            initial_balance: 0
          })
        }
      );

      const createResult = await createResponse.json();
      
      if (!createResponse.ok && !createResult.error?.includes('already exists')) {
        throw new Error(createResult.error || 'Failed to create account');
      }

      setMessage(createResult.error?.includes('already exists') ? 'Account exists, testing login...' : 'Account created, testing login...');
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Test login
      setStatus('testing');
      setMessage('Testing login...');

      const loginResponse = await fetch(
        `https://${projectId}.supabase.co/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': publicAnonKey
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        }
      );

      const loginResult = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginResult.error_description || 'Login test failed');
      }

      // Success!
      setStatus('success');
      setMessage('✅ Account ready! You can now login.');
      setAccountInfo({
        email: credentials.email,
        userId: loginResult.user.id,
        token: loginResult.access_token
      });

      // Store token for immediate use
      localStorage.setItem('investoft_access_token', loginResult.access_token);
      localStorage.setItem('investoft_user', JSON.stringify(loginResult.user));

      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }

    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Error: ${error.message}`);
      console.error('Account creation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Setup Test Account
            </h1>
            <p className="text-slate-400 text-sm">
              Create and test your account in one click
            </p>
          </div>

          {/* Credentials Info */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold text-sm mb-3">📋 Account Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-white font-mono text-xs">{credentials.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Password:</span>
                <span className="text-white font-mono text-xs">{credentials.password}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Balance:</span>
                <span className="text-white">$0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="text-white">Member</span>
              </div>
            </div>
          </div>

          {/* Status Display */}
          {status !== 'idle' && (
            <div className={`rounded-xl p-4 mb-6 ${
              status === 'success' ? 'bg-green-500/10 border border-green-500/30' :
              status === 'error' ? 'bg-red-500/10 border border-red-500/30' :
              'bg-blue-500/10 border border-blue-500/30'
            }`}>
              <div className="flex items-center gap-3">
                {status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                ) : (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  status === 'success' ? 'text-green-400' :
                  status === 'error' ? 'text-red-400' :
                  'text-blue-400'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          )}

          {/* Success Info */}
          {status === 'success' && accountInfo && (
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold text-sm mb-3">✅ Account Ready!</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">User ID:</span>
                  <span className="text-white font-mono text-xs truncate ml-2">
                    {accountInfo.userId}
                  </span>
                </div>
                <div className="text-slate-400 text-xs mt-3">
                  Token saved to localStorage. You can now access member dashboard.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status !== 'success' && (
              <Button
                onClick={createAndTestAccount}
                disabled={status === 'creating' || status === 'testing'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-semibold"
              >
                {status === 'creating' || status === 'testing' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {status === 'creating' ? 'Creating...' : 'Testing...'}
                  </>
                ) : (
                  '🚀 Create & Test Account'
                )}
              </Button>
            )}

            {status === 'success' && (
              <>
                <Button
                  onClick={() => window.location.href = '/member'}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-base font-semibold"
                >
                  ✅ Go to Member Dashboard
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 h-12"
                >
                  🏠 Back to Home
                </Button>
              </>
            )}

            {status === 'error' && (
              <Button
                onClick={() => {
                  setStatus('idle');
                  setMessage('');
                }}
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 h-12"
              >
                🔄 Try Again
              </Button>
            )}
          </div>

          {/* Instructions */}
          {status === 'idle' && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <h4 className="text-purple-400 font-semibold text-sm mb-2">
                💡 What happens when you click:
              </h4>
              <ol className="text-slate-400 text-xs space-y-1 ml-4 list-decimal">
                <li>Creates account in Supabase Auth</li>
                <li>Tests login with credentials</li>
                <li>Saves token to localStorage</li>
                <li>Ready to access dashboard!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            Having issues?{' '}
            <a href="/test-account-creator" className="text-blue-400 hover:text-blue-300">
              Try advanced debugger
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
