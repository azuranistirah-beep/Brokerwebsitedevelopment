import { useState } from 'react';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function BackendTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    console.log(message);
  };

  const testBackend = async () => {
    setLogs([]);
    setStatus('testing');
    addLog('🧪 Testing backend create-test-member endpoint...');

    try {
      const testEmail = `test-${Date.now()}@investoft.com`;
      const testPassword = 'TestPassword123!';
      
      addLog(`📧 Creating account: ${testEmail}`);
      addLog(`🔒 Password: ${testPassword}`);
      
      const createUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`;
      addLog(`📡 URL: ${createUrl}`);
      
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: 'Test User',
          initial_balance: 10000
        })
      });

      addLog(`📊 Status: ${response.status} ${response.statusText}`);
      
      const result = await response.json();
      addLog(`📦 Response: ${JSON.stringify(result, null, 2)}`);
      
      if (response.ok) {
        addLog('✅ Backend endpoint is working!');
        addLog(`👤 User ID: ${result.user_id || result.id || 'N/A'}`);
        setStatus('success');
      } else {
        addLog(`❌ Backend error: ${result.error}`);
        setStatus('error');
      }
      
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Backend Test
          </h1>
          <p className="text-slate-400">
            Test create-test-member endpoint
          </p>
        </div>

        <div className="mb-6">
          <Button
            onClick={testBackend}
            disabled={status === 'testing'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg font-semibold"
          >
            {status === 'testing' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              '🚀 Test Backend'
            )}
          </Button>
        </div>

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
              <p className={`font-semibold ${
                status === 'success' ? 'text-green-400' :
                status === 'error' ? 'text-red-400' :
                'text-blue-400'
              }`}>
                {status === 'success' ? '✅ Backend Working!' :
                 status === 'error' ? '❌ Backend Error' :
                 '⏳ Testing...'}
              </p>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
              <h3 className="text-white font-semibold">📋 Logs</h3>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes('✅') ? 'text-green-400' :
                    log.includes('❌') ? 'text-red-400' :
                    'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <a href="/" className="text-slate-400 hover:text-white text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
