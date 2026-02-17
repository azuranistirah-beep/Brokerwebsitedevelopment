import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { projectId } from '../../../utils/supabase/info';

/**
 * Quick Create Member Component
 * For testing - creates azuranistirah@gmail.com account
 */
export function QuickCreateMember() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const memberData = {
    email: 'azuranistirah@gmail.com',
    password: 'Sundala99!',
    name: 'Azura Nistirah',
    initial_balance: 0
  };

  const handleCreateMember = async () => {
    setLoading(true);
    setSuccess(false);
    
    try {
      console.log('🧪 Creating test member account...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Check if user already exists
        if (result.error && result.error.includes('already exists')) {
          toast.error('User already exists! You can login with the credentials below.');
          setSuccess(true);
          setUserInfo({
            email: memberData.email,
            message: 'Account already exists - you can login now'
          });
          return;
        }
        
        throw new Error(result.error || result.message || 'Failed to create account');
      }

      console.log('✅ Account created successfully:', result);
      
      toast.success('Account created successfully!');
      setSuccess(true);
      setUserInfo(result.user);
      
    } catch (error: any) {
      console.error('❌ Error creating account:', error);
      toast.error(`Failed to create account: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🧪 Create Test Member Account
        </h2>
        <p className="text-slate-400 text-sm">
          Quick setup for testing member dashboard and admin panel
        </p>
      </div>

      {/* Account Details */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6 space-y-2">
        <h3 className="text-white font-semibold mb-3">📋 Account Details:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-slate-400">Email:</div>
          <div className="text-white font-mono">{memberData.email}</div>
          
          <div className="text-slate-400">Password:</div>
          <div className="text-white font-mono">{memberData.password}</div>
          
          <div className="text-slate-400">Name:</div>
          <div className="text-white">{memberData.name}</div>
          
          <div className="text-slate-400">Initial Balance:</div>
          <div className="text-white">${memberData.initial_balance}</div>
          
          <div className="text-slate-400">Role:</div>
          <div className="text-white">Member (not admin)</div>
          
          <div className="text-slate-400">Status:</div>
          <div className="text-green-400">Approved (active)</div>
        </div>
      </div>

      {/* Success Message */}
      {success && userInfo && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
            ✅ Account Ready!
          </h3>
          <div className="space-y-1 text-sm">
            <p className="text-slate-300">
              <strong>Email:</strong> {userInfo.email || memberData.email}
            </p>
            {userInfo.id && (
              <p className="text-slate-300">
                <strong>User ID:</strong> {userInfo.id}
              </p>
            )}
            {userInfo.demo_balance !== undefined && (
              <p className="text-slate-300">
                <strong>Balance:</strong> ${userInfo.demo_balance}
              </p>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-slate-300 text-sm font-semibold mb-2">
              🔐 Login Instructions:
            </p>
            <ol className="text-slate-400 text-sm space-y-1 ml-4 list-decimal">
              <li>Click "Sign In" button in header</li>
              <li>Enter email: <span className="text-white font-mono">{memberData.email}</span></li>
              <li>Enter password: <span className="text-white font-mono">{memberData.password}</span></li>
              <li>You'll be redirected to /member dashboard</li>
            </ol>
          </div>
        </div>
      )}

      {/* Create Button */}
      <Button
        onClick={handleCreateMember}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        size="lg"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Creating Account...
          </>
        ) : (
          <>
            🚀 Create Test Member Account
          </>
        )}
      </Button>

      {/* Notes */}
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <p className="text-purple-300 font-semibold text-sm mb-2">
          📝 Important Notes:
        </p>
        <ul className="text-slate-400 text-sm space-y-1 ml-4 list-disc">
          <li>Account starts with $0 balance</li>
          <li>Balance can only be modified via Admin Panel</li>
          <li>Account is approved and active immediately</li>
          <li>If account already exists, you can login directly</li>
        </ul>
      </div>
    </div>
  );
}
