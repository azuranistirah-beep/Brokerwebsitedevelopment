import { Bell, LogOut, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface RealTradeHeaderProps {
  wallet: any;
  userProfile: any;
  onLogout: () => void;
}

export function RealTradeHeader({ wallet, userProfile, onLogout }: RealTradeHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const kycStatus = userProfile?.kycStatus || 'not_submitted';
  const kycBadgeConfig = {
    verified: { text: 'Verified', color: 'bg-green-600', icon: Shield },
    pending: { text: 'Pending', color: 'bg-yellow-600', icon: AlertTriangle },
    rejected: { text: 'Rejected', color: 'bg-red-600', icon: AlertTriangle },
    not_submitted: { text: 'Not Verified', color: 'bg-slate-600', icon: AlertTriangle },
  };

  const kycBadge = kycBadgeConfig[kycStatus as keyof typeof kycBadgeConfig] || kycBadgeConfig.not_submitted;
  const KYCIcon = kycBadge.icon;

  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      {/* Left: Balance Info */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs text-slate-400">Available Balance</p>
          <p className="text-xl font-bold text-white">
            {wallet ? formatCurrency(wallet.availableBalance) : '$0.00'}
          </p>
        </div>

        <div className="h-8 w-px bg-slate-700" />

        <div>
          <p className="text-xs text-slate-400">Total Equity</p>
          <p className="text-lg font-semibold text-slate-200">
            {wallet ? formatCurrency(wallet.totalEquity) : '$0.00'}
          </p>
        </div>

        {wallet && wallet.lockedBalance > 0 && (
          <>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <p className="text-xs text-slate-400">Locked (In Trades)</p>
              <p className="text-lg font-semibold text-yellow-400">
                {formatCurrency(wallet.lockedBalance)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Right: KYC Status, Notifications, User Menu */}
      <div className="flex items-center gap-4">
        {/* KYC Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${kycBadge.color}`}>
          <KYCIcon className="w-4 h-4 text-white" />
          <span className="text-xs font-semibold text-white">
            {kycBadge.text}
          </span>
        </div>

        {/* Notification Bell */}
        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">{userProfile?.name || 'User'}</p>
              <p className="text-xs text-slate-400">Real Account</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
