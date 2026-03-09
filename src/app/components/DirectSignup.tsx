import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

// Create Supabase client
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

export default function DirectSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, msg]);
  };

  const createAndLogin = async () => {
    setLoading(true);
    setStatus('Starting...');
    setLogs([]);

    try {
      const email = 'azuranistirah@gmail.com';
      const password = 'Sundala99!';
      
      addLog('═══════════════════════════════════════════════');
      addLog('🚀 [DirectSignup] COMPLETE FLOW');
      addLog('═══════════════════════════════════════════════');
      addLog(`Email: ${email}`);
      addLog(`Password length: ${password.length}`);
      addLog('');

      // STEP 1: Try to sign in first (maybe user already exists)
      setStatus('Checking if account exists...');
      addLog('🔐 [Step 1] Attempting sign in...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData?.session) {
        // Success! User exists and login worked
        addLog('✅ Login successful! User already exists.');
        addLog(`User ID: ${signInData.user.id}`);
        addLog(`Email: ${signInData.user.email}`);
        addLog(`Access Token: ${signInData.session.access_token.substring(0, 30)}...`);
        
        // Store tokens
        localStorage.setItem('access_token', signInData.session.access_token);
        localStorage.setItem('accessToken', signInData.session.access_token);
        localStorage.setItem('investoft_access_token', signInData.session.access_token);
        localStorage.setItem('investoft_token', signInData.session.access_token);
        localStorage.setItem('userId', signInData.user.id);
        localStorage.setItem('userEmail', signInData.user.email!);
        
        setStatus('Success! Redirecting...');
        addLog('💾 Tokens stored in localStorage');
        addLog('✅ Redirecting to dashboard...');
        addLog('═══════════════════════════════════════════════');
        
        setTimeout(() => navigate('/member'), 1000);
        return;
      }

      // If login failed, user doesn't exist or wrong password
      addLog(`⚠️ Login failed: ${signInError?.message || 'Unknown error'}`);
      addLog('');

      // STEP 2: Create account via backend
      setStatus('Creating new account...');
      addLog('📡 [Step 2] Creating account via backend...');
      
      const createUrl = `${supabaseUrl}/functions/v1/make-server-20da1dab/create-test-member`;
      addLog(`URL: ${createUrl}`);
      
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email,
          password,
          name: 'Azura Nistirah',
          initial_balance: 10000
        })
      });

      addLog(`📊 Status: ${createResponse.status}`);
      addLog(`📊 OK: ${createResponse.ok}`);
      
      const createResult = await createResponse.json();
      addLog(`📦 Response: ${JSON.stringify(createResult, null, 2)}`);
      
      if (!createResponse.ok && !createResult.existing) {
        throw new Error(createResult.error || 'Failed to create account');
      }

      if (createResult.existing) {
        addLog('⚠️ Account already exists (but login failed earlier)');
        addLog('🔧 This might be a password mismatch issue!');
        throw new Error('Account exists but password is incorrect. Please contact admin to reset password.');
      }

      addLog('✅ Account created successfully!');
      addLog('');

      // STEP 3: Wait for user sync
      setStatus('Waiting for sync...');
      addLog('⏳ [Step 3] Waiting 3 seconds for user sync...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // STEP 4: Login with new account
      setStatus('Logging in...');
      addLog('');
      addLog('🔐 [Step 4] Logging in with new account...');
      
      const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (newSignInError || !newSignInData?.session) {
        addLog(`❌ Login failed: ${newSignInError?.message || 'No session'}`);
        throw new Error(newSignInError?.message || 'Login failed after account creation');
      }

      addLog('✅ Login successful!');
      addLog(`User ID: ${newSignInData.user.id}`);
      addLog(`Email: ${newSignInData.user.email}`);
      
      // Store tokens
      localStorage.setItem('access_token', newSignInData.session.access_token);
      localStorage.setItem('accessToken', newSignInData.session.access_token);
      localStorage.setItem('investoft_access_token', newSignInData.session.access_token);
      localStorage.setItem('investoft_token', newSignInData.session.access_token);
      localStorage.setItem('userId', newSignInData.user.id);
      localStorage.setItem('userEmail', newSignInData.user.email!);
      
      setStatus('Success! Redirecting to dashboard...');
      addLog('💾 Tokens stored in localStorage');
      addLog('✅ Redirecting to dashboard...');
      addLog('═══════════════════════════════════════════════');
      
      setTimeout(() => navigate('/member'), 1000);

    } catch (error: any) {
      addLog('');
      addLog('═══════════════════════════════════════════════');
      addLog('❌ [ERROR]');
      addLog(`Message: ${error.message}`);
      addLog(`Stack: ${error.stack}`);
      addLog('═══════════════════════════════════════════════');
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header Card */}
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
              <span className="text-3xl">💹</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Investoft Direct Signup</h1>
            <p className="text-slate-400">Using Supabase Auth Directly</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h2 className="text-white font-semibold mb-2">Test Account:</h2>
            <div className="text-sm text-slate-300 space-y-1">
              <p><span className="text-slate-500">Email:</span> azuranistirah@gmail.com</p>
              <p><span className="text-slate-500">Password:</span> Sundala99!</p>
              <p><span className="text-slate-500">Initial Balance:</span> $10,000 (Demo)</p>
            </div>
          </div>

          {status && (
            <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-300 text-sm font-semibold">{status}</p>
            </div>
          )}

          <button
            onClick={createAndLogin}
            disabled={loading}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Processing...' : 'Create Account & Login'}
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Back to Login Page →
            </button>
          </div>
        </div>

        {/* Logs Card */}
        {logs.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4">Detailed Logs</h2>
            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 max-h-96 overflow-y-auto">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                {logs.join('\n')}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
