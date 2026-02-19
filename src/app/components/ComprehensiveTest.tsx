import { useState } from 'react';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function ComprehensiveTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error' | 'warning'>('idle');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    console.log(message);
  };

  const runComprehensiveTest = async () => {
    setLogs([]);
    setStatus('testing');
    addLog('═══════════════════════════════════════');
    addLog('🔬 COMPREHENSIVE SYSTEM TEST');
    addLog('═══════════════════════════════════════');

    try {
      // Test 1: Supabase Config
      addLog('');
      addLog('━━━ TEST 1: SUPABASE CONFIGURATION ━━━');
      addLog(`📍 Project ID: ${projectId ? projectId.substring(0, 20) + '...' : '❌ MISSING'}`);
      addLog(`🔑 Anon Key: ${publicAnonKey ? publicAnonKey.substring(0, 30) + '...' : '❌ MISSING'}`);
      
      if (!projectId || !publicAnonKey) {
        addLog('❌ Supabase configuration is missing!');
        setStatus('error');
        return;
      }
      addLog('✅ Supabase configuration OK');

      // Test 2: Backend Health Check
      addLog('');
      addLog('━━━ TEST 2: BACKEND HEALTH CHECK ━━━');
      const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`;
      addLog(`📡 Backend URL: ${backendUrl}`);
      
      try {
        const healthResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: `test-health-${Date.now()}@test.com`,
            password: 'Test123!@#',
            name: 'Health Check',
            initial_balance: 0
          })
        });

        addLog(`📊 Backend Response: ${healthResponse.status} ${healthResponse.statusText}`);
        
        const healthResult = await healthResponse.json();
        addLog(`📦 Response: ${JSON.stringify(healthResult).substring(0, 200)}...`);
        
        if (healthResponse.ok) {
          addLog('✅ Backend is responding correctly');
        } else {
          addLog('⚠️ Backend responded but with error');
          addLog(`⚠️ Error: ${healthResult.error || 'Unknown'}`);
        }
      } catch (backendError: any) {
        addLog('❌ Backend connection failed!');
        addLog(`❌ Error: ${backendError.message}`);
        setStatus('error');
        return;
      }

      // Test 3: Create Actual Test Account
      addLog('');
      addLog('━━━ TEST 3: CREATE TEST ACCOUNT ━━━');
      const testEmail = 'azuranistirah@gmail.com';
      const testPassword = 'Sundala99!';
      
      addLog(`📧 Email: ${testEmail}`);
      addLog(`🔒 Password: ${testPassword}`);
      
      const createResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: 'Azura Nistirah',
          initial_balance: 10000
        })
      });

      addLog(`📊 Create Response: ${createResponse.status} ${createResponse.statusText}`);
      
      const createResult = await createResponse.json();
      addLog(`📦 Result: ${JSON.stringify(createResult, null, 2)}`);
      
      let accountExists = false;
      if (createResponse.ok) {
        addLog('✅ Account created successfully!');
        addLog(`👤 User ID: ${createResult.user?.id || 'N/A'}`);
        addLog(`💰 Balance: $${createResult.user?.demo_balance || 0}`);
      } else if (createResult.existing) {
        addLog('ℹ️ Account already exists (this is OK)');
        accountExists = true;
      } else {
        addLog(`⚠️ Create failed: ${createResult.error}`);
        // Continue anyway to test login
      }

      // Test 4: Wait for account to be ready
      addLog('');
      addLog('━━━ TEST 4: WAITING FOR ACCOUNT ━━━');
      addLog('⏳ Waiting 2 seconds for account to be fully ready...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('✅ Wait complete');

      // Test 5: Test Login
      addLog('');
      addLog('━━━ TEST 5: SUPABASE AUTH LOGIN ━━━');
      const loginUrl = `https://${projectId}.supabase.co/auth/v1/token?grant_type=password`;
      addLog(`📡 Login URL: ${loginUrl}`);
      addLog(`🔑 API Key: ${publicAnonKey.substring(0, 30)}...`);
      addLog(`📧 Email: ${testEmail}`);
      addLog(`🔒 Password: ${'*'.repeat(testPassword.length)}`);
      
      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': publicAnonKey
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });

      addLog(`📊 Login Response: ${loginResponse.status} ${loginResponse.statusText}`);
      
      const loginResult = await loginResponse.json();
      addLog(`📦 Result: ${JSON.stringify(loginResult).substring(0, 500)}...`);
      
      if (loginResponse.ok) {
        addLog('');
        addLog('═══════════════════════════════════════');
        addLog('✅ ✅ ✅ ALL TESTS PASSED! ✅ ✅ ✅');
        addLog('═══════════════════════════════════════');
        addLog(`👤 User ID: ${loginResult.user?.id}`);
        addLog(`📧 Email: ${loginResult.user?.email}`);
        addLog(`🔑 Token: ${loginResult.access_token?.substring(0, 40)}...`);
        addLog(`⏰ Expires: ${loginResult.expires_in} seconds`);
        addLog('');
        addLog('💾 Saving credentials to localStorage...');
        localStorage.setItem('investoft_access_token', loginResult.access_token);
        localStorage.setItem('investoft_user', JSON.stringify(loginResult.user));
        addLog('✅ Credentials saved!');
        addLog('');
        addLog('🎉 You can now navigate to /member');
        addLog('═══════════════════════════════════════');
        setStatus('success');
      } else {
        addLog('');
        addLog('═══════════════════════════════════════');
        addLog('⚠️ ⚠️ ⚠️ LOGIN FAILED ⚠️ ⚠️ ⚠️');
        addLog('═══════════════════════════════════════');
        addLog(`❌ Error: ${loginResult.error || 'Unknown'}`);
        addLog(`❌ Error Code: ${loginResult.error_code || 'N/A'}`);
        addLog(`❌ Message: ${loginResult.msg || loginResult.error_description || 'N/A'}`);
        addLog('');
        addLog('🔍 DIAGNOSIS:');
        
        if (loginResult.error_code === 'invalid_credentials' || loginResult.msg?.includes('Invalid login credentials')) {
          addLog('❌ Account may not exist in Supabase Auth');
          addLog('💡 Possible causes:');
          addLog('   1. Backend create-test-member failed to create auth user');
          addLog('   2. Email confirmation required (should be disabled)');
          addLog('   3. Account was deleted');
          addLog('   4. Password mismatch');
          
          if (accountExists) {
            addLog('');
            addLog('⚠️ CRITICAL: Backend said account exists, but Supabase Auth says invalid credentials!');
            addLog('🔧 This suggests the account is in KV store but NOT in Supabase Auth');
          }
        } else if (loginResult.error_code === 'email_not_confirmed') {
          addLog('❌ Email not confirmed');
          addLog('💡 Solution: Backend should use email_confirm: true');
        } else {
          addLog('❌ Unknown error');
          addLog(`📄 Full response: ${JSON.stringify(loginResult, null, 2)}`);
        }
        
        addLog('═══════════════════════════════════════');
        setStatus('error');
      }

    } catch (error: any) {
      addLog('');
      addLog('═══════════════════════════════════════');
      addLog('❌ ❌ ❌ CRITICAL ERROR ❌ ❌ ❌');
      addLog('═══════════════════════════════════════');
      addLog(`❌ Type: ${error.constructor?.name}`);
      addLog(`❌ Message: ${error.message}`);
      addLog(`📄 Stack: ${error.stack}`);
      addLog('═══════════════════════════════════════');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔬 Comprehensive System Test
          </h1>
          <p className="text-slate-400">
            Complete diagnostic test for Backend + Auth + Login
          </p>
        </div>

        <div className="mb-6">
          <Button
            onClick={runComprehensiveTest}
            disabled={status === 'testing'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-16 text-lg font-semibold"
          >
            {status === 'testing' ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              '🚀 Run Comprehensive Test'
            )}
          </Button>
        </div>

        {status !== 'idle' && (
          <div className={`rounded-xl p-6 mb-6 ${
            status === 'success' ? 'bg-green-500/10 border-2 border-green-500/30' :
            status === 'error' ? 'bg-red-500/10 border-2 border-red-500/30' :
            status === 'warning' ? 'bg-yellow-500/10 border-2 border-yellow-500/30' :
            'bg-blue-500/10 border-2 border-blue-500/30'
          }`}>
            <div className="flex items-center gap-3">
              {status === 'success' ? (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              ) : status === 'error' ? (
                <XCircle className="w-8 h-8 text-red-400" />
              ) : status === 'warning' ? (
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              ) : (
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              )}
              <div>
                <p className={`font-bold text-lg ${
                  status === 'success' ? 'text-green-400' :
                  status === 'error' ? 'text-red-400' :
                  status === 'warning' ? 'text-yellow-400' :
                  'text-blue-400'
                }`}>
                  {status === 'success' ? '✅ All Tests Passed!' :
                   status === 'error' ? '❌ Tests Failed' :
                   status === 'warning' ? '⚠️ Warning' :
                   '⏳ Testing...'}
                </p>
                <p className="text-slate-400 text-sm">
                  {status === 'success' ? 'System is working correctly' :
                   status === 'error' ? 'Check logs below for details' :
                   status === 'warning' ? 'Some issues detected' :
                   'Running diagnostic tests...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-white font-semibold text-lg">📋 Test Logs</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const logText = logs.join('\n');
                  navigator.clipboard.writeText(logText);
                  alert('Logs copied to clipboard!');
                }}
                className="text-xs"
              >
                📋 Copy Logs
              </Button>
            </div>
            <div className="p-6 space-y-1 max-h-[600px] overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes('✅') || log.includes('PASSED') ? 'text-green-400' :
                    log.includes('❌') || log.includes('FAILED') ? 'text-red-400' :
                    log.includes('⚠️') || log.includes('WARNING') ? 'text-yellow-400' :
                    log.includes('═══') || log.includes('━━━') ? 'text-blue-400 font-bold' :
                    log.includes('💡') || log.includes('🔧') ? 'text-purple-400' :
                    log.includes('📡') || log.includes('📊') || log.includes('📦') ? 'text-cyan-400' :
                    'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8 space-x-4">
          <a href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
            → Try Login Page
          </a>
          <a href="/member" className="text-green-400 hover:text-green-300 text-sm">
            → Go to Member Dashboard
          </a>
          <a href="/" className="text-slate-400 hover:text-white text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}