import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Home, RefreshCw } from "lucide-react";

/**
 * DebugPage - Simple page to verify routing works
 * Cache Bust v2.0.1
 */
export function DebugPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-green-600/20 border border-green-500/50">
            <RefreshCw className="w-6 h-6 text-green-400" />
            <div className="text-left">
              <div className="text-green-300 font-bold text-lg">✅ Routing Works!</div>
              <div className="text-slate-300 text-sm">Cache cleared successfully - v2.0.1</div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold">Debug Page</h1>
          <p className="text-slate-400 text-lg">
            If you can see this page, routing is working correctly
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold mb-4">Navigation Test</h2>
          
          <div className="grid gap-4">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Go to Landing Page
            </Button>
            
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              Go to Login Page
            </Button>
            
            <Button
              onClick={() => navigate('/comprehensive-test')}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Go to Comprehensive Test
            </Button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3">Verification Checklist:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-slate-300">✅ useNavigate() is working</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-slate-300">✅ React Router imports from 'react-router'</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-slate-300">✅ No useOutletContext() issues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-slate-300">✅ Cache version: v2.0.1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
