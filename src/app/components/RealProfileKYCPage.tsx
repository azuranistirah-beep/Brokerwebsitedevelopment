import { Shield, User, Lock, AlertCircle } from "lucide-react";

interface RealProfileKYCPageProps {
  accessToken: string;
  userProfile: any;
  onProfileUpdate: () => void;
}

export function RealProfileKYCPage({ accessToken, userProfile, onProfileUpdate }: RealProfileKYCPageProps) {
  const kycStatus = userProfile?.kycStatus || 'not_submitted';

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white mb-2">Profile & KYC Verification</h1>
      <p className="text-slate-400 mb-8">Manage your account and complete identity verification</p>

      {/* Profile Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{userProfile?.name || 'User'}</h2>
            <p className="text-slate-400">{userProfile?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400">User ID</p>
            <p className="font-mono text-sm text-white">{userProfile?.id?.substring(0, 8)}...</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Account Type</p>
            <p className="font-semibold text-green-400">Real Account</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Member Since</p>
            <p className="text-white">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Status</p>
            <p className="text-green-400 font-semibold capitalize">{userProfile?.status || 'Active'}</p>
          </div>
        </div>
      </div>

      {/* KYC Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">KYC Verification</h2>
        </div>

        {kycStatus === 'verified' ? (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-400" />
            <div>
              <p className="font-semibold text-green-400">✓ Verified</p>
              <p className="text-sm text-green-300">Your account is fully verified</p>
            </div>
          </div>
        ) : kycStatus === 'pending' ? (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-400">Pending Review</p>
              <p className="text-sm text-yellow-300">Your KYC documents are being reviewed by our team</p>
            </div>
          </div>
        ) : (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-400">KYC Required</p>
                <p className="text-sm text-red-300">Complete KYC verification to enable real money trading</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-4">
              <p className="text-sm text-slate-300 font-semibold">Required Documents:</p>
              <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                <li>Government-issued ID (Passport, Driver's License, or National ID)</li>
                <li>Selfie holding your ID</li>
                <li>Proof of address (Utility bill, Bank statement - max 3 months old)</li>
              </ul>

              <button className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Start KYC Verification
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Security Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
            <div>
              <p className="font-semibold text-white">Change Password</p>
              <p className="text-sm text-slate-400">Update your account password</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Change
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
            <div>
              <p className="font-semibold text-white">Two-Factor Authentication (2FA)</p>
              <p className="text-sm text-slate-400">Add an extra layer of security</p>
            </div>
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
