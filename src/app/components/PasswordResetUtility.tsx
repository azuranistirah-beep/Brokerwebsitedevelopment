import { useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function PasswordResetUtility() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const resetPassword = async () => {
    setLoading(true);
    setResult('');

    try {
      console.log('🔑 [Password Reset] Calling server endpoint...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/reset-test-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: 'azuranistirah@gmail.com',
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ [Password Reset] Success:', data);
        setResult(`✅ SUCCESS! Password reset untuk ${data.email}\n\nSekarang Anda bisa login dengan:\nEmail: azuranistirah@gmail.com\nPassword: Sundala99!\n\nKlik tombol LOGIN di bawah untuk redirect ke halaman login.`);
      } else {
        console.error('❌ [Password Reset] Error:', data);
        setResult(`❌ ERROR: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('❌ [Password Reset] Network error:', error);
      setResult(`❌ NETWORK ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    window.location.href = '/direct-signup';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-lg p-8 border border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-2">🔧 Password Reset Utility</h1>
        <p className="text-slate-400 mb-6 text-sm">
          Emergency tool untuk reset password akun test Investoft
        </p>

        <div className="space-y-4">
          <div className="bg-slate-800 rounded p-4 text-sm">
            <div className="text-slate-300 mb-2">Target Account:</div>
            <div className="text-white font-mono">azuranistirah@gmail.com</div>
            <div className="text-slate-500 text-xs mt-1">Password akan di-reset ke: Sundala99!</div>
          </div>

          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded transition-colors"
          >
            {loading ? '⏳ Resetting Password...' : '🔑 Reset Password Now'}
          </button>

          {result && (
            <div className={`rounded p-4 text-sm whitespace-pre-line ${
              result.startsWith('✅') 
                ? 'bg-emerald-900/30 border border-emerald-700 text-emerald-200'
                : 'bg-red-900/30 border border-red-700 text-red-200'
            }`}>
              {result}
            </div>
          )}

          {result.startsWith('✅') && (
            <button
              onClick={goToLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition-colors"
            >
              🚀 Go to Login Page
            </button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 text-xs text-slate-500">
          <div className="font-semibold mb-2 text-slate-400">Instructions:</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Klik "Reset Password Now"</li>
            <li>Tunggu sampai muncul pesan SUCCESS</li>
            <li>Klik "Go to Login Page"</li>
            <li>Login dengan password baru: Sundala99!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}