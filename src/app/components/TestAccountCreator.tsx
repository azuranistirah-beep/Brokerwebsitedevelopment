import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function TestAccountCreator() {
  const [loading, setLoading] = useState(false);
  const [testingBackend, setTestingBackend] = useState(false);
  const [testingLogin, setTestingLogin] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    console.log(message);
  };

  const testBackendConnection = async () => {
    setTestingBackend(true);
    addLog('🔍 Testing backend connection...');

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`;
      addLog(`📡 Endpoint: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test_' + Date.now() + '@test.com',
          password: 'Test123!',
          name: 'Test User',
          initial_balance: 0
        })
      });

      addLog(`📊 Response Status: ${response.status}`);
      
      const result = await response.json();
      addLog(`📦 Response Body: ${JSON.stringify(result).substring(0, 200)}`);

      if (response.ok) {
        addLog('✅ Backend connection successful!');
        toast.success('Backend is working!');
      } else {
        addLog(`⚠️ Backend returned error: ${result.error || 'Unknown error'}`);
        toast.warning('Backend responded but with error');
      }
    } catch (error: any) {
      addLog(`❌ Backend connection failed: ${error.message}`);
      toast.error('Backend connection failed!');
    } finally {
      setTestingBackend(false);
    }
  };

  const createTestAccount = async () => {
    setLoading(true);
    addLog('🧪 Starting test account creation...');

    try {
      addLog('📧 Creating account: azuranistirah@gmail.com');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'azuranistirah@gmail.com',
            password: 'Sundala99!',
            name: 'Azura Nistirah',
            initial_balance: 0
          })
        }
      );

      addLog(`📊 Create Response: ${response.status}`);
      const result = await response.json();
      addLog(`📦 Result: ${JSON.stringify(result).substring(0, 300)}`);

      if (!response.ok) {
        if (result.error && result.error.includes('already exists')) {
          addLog('✅ Account already exists - can proceed to login test');
          toast.success('Account already exists!');
        } else {
          throw new Error(result.error || 'Failed to create account');
        }
      } else {
        addLog('✅ Account created successfully!');
        addLog(`🆔 User ID: ${result.user?.id}`);
        toast.success('Account created!');
      }
    } catch (error: any) {
      addLog(`❌ Create failed: ${error.message}`);
      toast.error(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setTestingLogin(true);
    addLog('🔐 Testing login...');

    try {
      addLog('📧 Login attempt: azuranistirah@gmail.com');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': publicAnonKey
          },
          body: JSON.stringify({
            email: 'azuranistirah@gmail.com',
            password: 'Sundala99!'
          })
        }
      );

      addLog(`📊 Login Response: ${response.status}`);
      const result = await response.json();

      if (response.ok) {
        addLog('✅ LOGIN SUCCESSFUL!');
        addLog(`🎫 Token: ${result.access_token?.substring(0, 50)}...`);
        addLog(`🆔 User ID: ${result.user?.id}`);
        addLog(`📧 Email: ${result.user?.email}`);
        toast.success('Login successful! Error is FIXED!', {
          duration: 5000
        });
      } else {
        addLog(`❌ Login failed: ${result.error_description || result.message}`);
        toast.error(`Login failed: ${result.error_description || 'Unknown error'}`);
      }
    } catch (error: any) {
      addLog(`❌ Login error: ${error.message}`);
      toast.error(`Login error: ${error.message}`);
    } finally {
      setTestingLogin(false);
    }
  };

  const runFullTest = async () => {
    setLogs([]);
    addLog('🚀 Starting full test sequence...');
    
    // Test 1: Backend
    await testBackendConnection();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Create account
    await createTestAccount();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Login
    await testLogin();
    
    addLog('🏁 Full test sequence completed!');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Test Account Creator & Debugger
          </h1>
          <p className="text-slate-400">
            Fix "Invalid login credentials" error by creating and testing the account
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
            📋 Account Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-slate-400">Email:</div>
            <div className="text-white font-mono">azuranistirah@gmail.com</div>
            
            <div className="text-slate-400">Password:</div>
            <div className="text-white font-mono">Sundala99!</div>
            
            <div className="text-slate-400">Role:</div>
            <div className="text-white">Member</div>
            
            <div className="text-slate-400">Balance:</div>
            <div className="text-white">$0</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={runFullTest}
              disabled={loading || testingBackend || testingLogin}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {loading ? 'Running...' : '🚀 Run Full Test (Recommended)'}
            </Button>

            <Button
              onClick={testBackendConnection}
              disabled={testingBackend}
              variant="outline"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              {testingBackend ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                '🔍 Test Backend Connection'
              )}
            </Button>

            <Button
              onClick={createTestAccount}
              disabled={loading}
              variant="outline"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                '🧪 Create Test Account'
              )}
            </Button>

            <Button
              onClick={testLogin}
              disabled={testingLogin}
              variant="outline"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              {testingLogin ? (
                <>
                  <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                '🔐 Test Login'
              )}
            </Button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">📝 Test Logs</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLogs([])}
              className="text-slate-400 hover:text-white"
            >
              Clear
            </Button>
          </div>
          
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                No logs yet. Click "Run Full Test" to start.
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`${
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('⚠️') ? 'text-yellow-400' :
                      log.includes('🔍') || log.includes('🔐') || log.includes('🧪') ? 'text-blue-400' :
                      'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mt-6">
          <h3 className="text-purple-400 font-semibold mb-3">
            💡 How to Fix the Error
          </h3>
          <ol className="text-slate-300 space-y-2 ml-4 list-decimal text-sm">
            <li>Click <strong>"Run Full Test"</strong> button above</li>
            <li>Wait for all tests to complete (checks backend, creates account, tests login)</li>
            <li>If you see "✅ LOGIN SUCCESSFUL!" in logs, the error is fixed!</li>
            <li>Go back to home page and try to sign in with the credentials</li>
            <li>You should now be able to login without errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
