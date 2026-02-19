import { useState } from 'react';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function QuickLoginTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    console.log(message);
  };

  const testLogin = async () => {
    setLogs([]);
    setStatus('testing');
    addLog('🚀 Starting comprehensive login test...');
    addLog(`📍 Project ID: ${projectId?.substring(0, 10)}...`);
    addLog(`🔑 Anon Key: ${publicAnonKey?.substring(0, 20)}...`);

    const testCredentials = {
      email: 'azuranistirah@gmail.com',
      password: 'Sundala99!'
    };

    try {
      // Step 1: Try to create account
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('📝 STEP 1: Creating test account via backend');
      addLog(`📧 Email: ${testCredentials.email}`);
      addLog(`🔒 Password: ${testCredentials.password}`);
      
      const createUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`;
      addLog(`📡 Backend URL: ${createUrl}`);
      
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testCredentials.email,
          password: testCredentials.password,
          name: 'Azura Nistirah',
          initial_balance: 10000
        })
      });

      addLog(`📊 Response Status: ${createResponse.status} ${createResponse.statusText}`);
      addLog(`📊 Response OK: ${createResponse.ok}`);
      
      const createResult = await createResponse.json();
      addLog(`📦 Response Body: ${JSON.stringify(createResult, null, 2)}`);
      
      if (createResult.existing) {
        addLog('ℹ️ Account already exists (this is OK, we can login)');
      } else if (createResponse.ok) {
        addLog('✅ Account created successfully!');
        addLog(`👤 User ID: ${createResult.user_id || createResult.id || 'N/A'}`);
      } else {
        addLog(`⚠️ Create error: ${createResult.error}`);
        addLog('⚠️ This may be OK if account already exists');
      }

      // Wait a bit
      addLog('⏳ Waiting 2 seconds for account to be fully ready...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Try login
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('🔐 STEP 2: Testing Supabase Auth login');
      
      const loginUrl = `https://${projectId}.supabase.co/auth/v1/token?grant_type=password`;
      addLog(`📡 Auth URL: ${loginUrl}`);
      addLog(`🔑 API Key: ${publicAnonKey?.substring(0, 20)}...`);
      addLog(`📧 Email: ${testCredentials.email}`);
      addLog(`🔒 Password: ${testCredentials.password}`);
      
      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': publicAnonKey
        },
        body: JSON.stringify({
          email: testCredentials.email,
          password: testCredentials.password
        })
      });

      addLog(`📊 Login Status: ${loginResponse.status} ${loginResponse.statusText}`);
      addLog(`📊 Login OK: ${loginResponse.ok}`);
      
      // Log response headers
      const headers: Record<string, string> = {};
      loginResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });
      addLog(`📊 Response Headers: ${JSON.stringify(headers, null, 2)}`);
      
      const loginResult = await loginResponse.json();
      addLog(`📦 Login Response Body: ${JSON.stringify(loginResult, null, 2).substring(0, 500)}...`);
      
      if (loginResponse.ok) {
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('✅ ✅ ✅ LOGIN SUCCESS! ✅ ✅ ✅');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog(`👤 User ID: ${loginResult.user?.id || 'N/A'}`);
        addLog(`📧 User Email: ${loginResult.user?.email || 'N/A'}`);
        addLog(`🔑 Access Token: ${loginResult.access_token?.substring(0, 30)}...`);
        addLog(`⏰ Token Type: ${loginResult.token_type || 'N/A'}`);
        addLog(`⏰ Expires In: ${loginResult.expires_in || 'N/A'} seconds`);
        
        // Store in localStorage
        localStorage.setItem('investoft_access_token', loginResult.access_token);
        localStorage.setItem('investoft_user', JSON.stringify(loginResult.user));
        
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('💾 Credentials saved to localStorage');
        addLog('🎉 You can now access /member dashboard!');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        setStatus('success');
      } else {
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('❌ ❌ ❌ LOGIN FAILED! ❌ ❌ ❌');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog(`❌ Error: ${loginResult.error || 'Unknown error'}`);
        addLog(`❌ Error Description: ${loginResult.error_description || 'No description'}`);
        addLog(`❌ Message: ${loginResult.msg || loginResult.message || 'No message'}`);
        addLog(`📄 Full Response: ${JSON.stringify(loginResult, null, 2)}`);
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('💡 Possible issues:');
        addLog('   1. Account might not exist yet (try creating first)');
        addLog('   2. Wrong password');
        addLog('   3. Email not confirmed (if email confirmation enabled)');
        addLog('   4. Supabase auth configuration issue');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        setStatus('error');
      }

    } catch (error: any) {
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('❌ ❌ ❌ CRITICAL ERROR! ❌ ❌ ❌');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog(`❌ Error Type: ${error.constructor?.name || 'Unknown'}`);
      addLog(`❌ Error Message: ${error.message || 'No message'}`);
      addLog(`📄 Error Stack: ${error.stack || 'No stack trace'}`);
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Quick Login Test
          </h1>
          <p className="text-slate-400">
            Test account creation and login functionality
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-400">
              <p className="font-semibold mb-1">What this test does:</p>
              <ol className="list-decimal ml-4 space-y-1 text-blue-300">
                <li>Creates test account (azuranistirah@gmail.com) via backend</li>
                <li>Tests login with Supabase Auth</li>
                <li>Saves credentials to localStorage</li>
                <li>Verifies you can access member dashboard</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="mb-6">
          <Button
            onClick={testLogin}
            disabled={status === 'testing'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg font-semibold"
          >
            {status === 'testing' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Running Test...
              </>
            ) : (
              '🚀 Run Login Test'
            )}
          </Button>
        </div>

        {/* Status Banner */}
        {status !== 'idle' && (
          <div className={`rounded-xl p-4 mb-6 ${
            status === 'success' ? 'bg-green-500/10 border border-green-500/30' :
            status === 'error' ? 'bg-red-500/10 border border-red-500/30' :
            'bg-blue-500/10 border border-blue-500/30'
          }`}>
            <div className="flex items-center gap-3">
              {status === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : status === 'error' ? (
                <XCircle className="w-6 h-6 text-red-400" />
              ) : (
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              )}
              <div>
                <p className={`font-semibold ${
                  status === 'success' ? 'text-green-400' :
                  status === 'error' ? 'text-red-400' :
                  'text-blue-400'
                }`}>
                  {status === 'success' ? '✅ Login Test PASSED!' :
                   status === 'error' ? '❌ Login Test FAILED' :
                   '⏳ Testing...'}
                </p>
                {status === 'success' && (
                  <p className="text-sm text-green-300 mt-1">
                    You can now go to <a href="/member" className="underline">/member</a> dashboard
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
              <h3 className="text-white font-semibold">📋 Test Logs</h3>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes('✅') ? 'text-green-400' :
                    log.includes('❌') ? 'text-red-400' :
                    log.includes('⚠️') ? 'text-yellow-400' :
                    log.includes('ℹ️') ? 'text-blue-400' :
                    'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {status === 'success' && (
          <div className="mt-6 flex gap-4">
            <Button
              onClick={() => window.location.href = '/member'}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
            >
              ✅ Go to Member Dashboard
            </Button>
            <Button
              onClick={() => window.location.href = '/login'}
              variant="outline"
              className="flex-1 border-slate-700 text-white hover:bg-slate-800 h-12"
            >
              🔐 Try Login Page
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6">
            <Button
              onClick={testLogin}
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800 h-12"
            >
              🔄 Try Again
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <a href="/" className="text-slate-400 hover:text-white text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}