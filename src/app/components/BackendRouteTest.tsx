import { useState } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export default function BackendRouteTest() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackendRoute = async () => {
    setLoading(true);
    setTestResult('Testing backend route...\n\n');
    
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`;
      
      console.log('Testing backend route:', url);
      setTestResult(prev => prev + `URL: ${url}\n\n`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test123!',
          name: 'Test User',
          initial_balance: 5000
        })
      });
      
      setTestResult(prev => prev + `Status: ${response.status}\n`);
      setTestResult(prev => prev + `OK: ${response.ok}\n\n`);
      
      const contentType = response.headers.get('content-type');
      setTestResult(prev => prev + `Content-Type: ${contentType}\n\n`);
      
      let result;
      if (contentType?.includes('application/json')) {
        result = await response.json();
        setTestResult(prev => prev + `Response (JSON):\n${JSON.stringify(result, null, 2)}\n\n`);
      } else {
        result = await response.text();
        setTestResult(prev => prev + `Response (Text):\n${result}\n\n`);
      }
      
      if (response.ok || result.existing) {
        setTestResult(prev => prev + '✅ Backend route is working!\n');
      } else {
        setTestResult(prev => prev + '❌ Backend route returned error\n');
      }
      
    } catch (error: any) {
      console.error('Error testing backend:', error);
      setTestResult(prev => prev + `\n❌ ERROR:\n${error.message}\n${error.stack}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Backend Route Test</h1>
        
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Configuration</h2>
          <div className="space-y-2 text-sm">
            <p className="text-slate-300">
              <span className="text-slate-500">Project ID:</span> {projectId}
            </p>
            <p className="text-slate-300">
              <span className="text-slate-500">Anon Key:</span> {publicAnonKey?.substring(0, 30)}...
            </p>
            <p className="text-slate-300">
              <span className="text-slate-500">Backend URL:</span> 
              <br />
              https://{projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member
            </p>
          </div>
        </div>

        <button
          onClick={testBackendRoute}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mb-6"
        >
          {loading ? 'Testing...' : 'Test Backend Route'}
        </button>

        {testResult && (
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4">Test Result</h2>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
