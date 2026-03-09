import { useState } from 'react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export default function QuickSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const createTestAccount = async () => {
    setLoading(true);
    setStatus('Creating account...');

    try {
      const email = 'azuranistirah@gmail.com';
      const password = 'Sundala99!';
      
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('🚀 [QuickSignup] Starting account creation flow');
      console.log('═══════════════════════════════════════════════');
      console.log('Email:', email);
      console.log('Password length:', password.length);
      console.log('ProjectId:', projectId);
      console.log('PublicAnonKey:', publicAnonKey?.substring(0, 20) + '...');
      
      // Step 1: Create account
      const createUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`;
      console.log('');
      console.log('📡 [Step 1] Creating account via backend...');
      console.log('URL:', createUrl);
      
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

      console.log('📊 Response status:', createResponse.status);
      console.log('📊 Response ok:', createResponse.ok);
      
      let createResult;
      try {
        createResult = await createResponse.json();
      } catch (e) {
        const text = await createResponse.text();
        console.error('❌ Failed to parse JSON response');
        console.error('Response text:', text);
        throw new Error('Backend returned invalid JSON: ' + text);
      }
      
      console.log('📦 Create result:', JSON.stringify(createResult, null, 2));

      if (!createResponse.ok && !createResult.existing) {
        console.error('❌ Account creation failed!');
        console.error('Error:', createResult.error);
        throw new Error(createResult.error || 'Failed to create account');
      }

      setStatus('Account created! Logging in...');
      console.log('✅ Account created or already exists');

      // Step 2: Wait a bit
      console.log('⏳ Waiting 3 seconds for user sync...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Login
      console.log('');
      console.log('🔐 [Step 2] Logging in via Supabase Auth...');
      const loginUrl = `https://${projectId}.supabase.co/auth/v1/token?grant_type=password`;
      console.log('URL:', loginUrl);
      
      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': publicAnonKey
        },
        body: JSON.stringify({ email, password })
      });

      console.log('📊 Login status:', loginResponse.status);
      console.log('📊 Login ok:', loginResponse.ok);
      
      let loginResult;
      try {
        loginResult = await loginResponse.json();
      } catch (e) {
        const text = await loginResponse.text();
        console.error('❌ Failed to parse login JSON response');
        console.error('Response text:', text);
        throw new Error('Login returned invalid JSON: ' + text);
      }
      
      console.log('📦 Login result:', JSON.stringify(loginResult, null, 2));

      if (!loginResponse.ok) {
        console.error('❌ Login failed!');
        console.error('Error:', loginResult);
        throw new Error(loginResult.error_description || loginResult.msg || 'Login failed');
      }

      // Store tokens
      console.log('💾 Storing tokens in localStorage...');
      localStorage.setItem('access_token', loginResult.access_token);
      localStorage.setItem('accessToken', loginResult.access_token);
      localStorage.setItem('investoft_access_token', loginResult.access_token);
      localStorage.setItem('investoft_token', loginResult.access_token);
      localStorage.setItem('userId', loginResult.user.id);
      localStorage.setItem('userEmail', loginResult.user.email);

      setStatus('Success! Redirecting to dashboard...');
      console.log('✅ Login successful!');
      console.log('✅ Tokens stored');
      console.log('═══════════════════════════════════════════════');
      console.log('');

      setTimeout(() => {
        navigate('/member');
      }, 1000);

    } catch (error: any) {
      console.error('');
      console.error('═══════════════════════════════════════════════');
      console.error('❌ [CRITICAL ERROR]');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('═══════════════════════════════════════════════');
      console.error('');
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 border border-slate-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
            <span className="text-3xl">💹</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Investoft</h1>
          <p className="text-slate-400">Quick Account Setup</p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h2 className="text-white font-semibold mb-2">Test Account Details:</h2>
            <div className="text-sm text-slate-300 space-y-1">
              <p><span className="text-slate-500">Email:</span> azuranistirah@gmail.com</p>
              <p><span className="text-slate-500">Password:</span> Sundala99!</p>
              <p><span className="text-slate-500">Initial Balance:</span> $10,000 (Demo)</p>
            </div>
          </div>

          {status && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-300 text-sm">{status}</p>
            </div>
          )}

          <button
            onClick={createTestAccount}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Creating Account...' : 'Create & Login Test Account'}
          </button>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Already have account? Go to Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}