import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface RealPortfolioPageProps {
  accessToken: string;
  wallet: any;
}

export function RealPortfolioPage({ accessToken, wallet }: RealPortfolioPageProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const netPL = (wallet?.totalProfits || 0) - (wallet?.totalLosses || 0);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-2">Portfolio Overview</h1>
      <p className="text-slate-400 mb-8">Track your trading performance</p>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Equity</p>
          <p className="text-3xl font-bold">
            {wallet ? formatCurrency(wallet.totalEquity) : '$0.00'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Profits</p>
          <p className="text-3xl font-bold">
            {wallet ? formatCurrency(wallet.totalProfits) : '$0.00'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Losses</p>
          <p className="text-3xl font-bold">
            {wallet ? formatCurrency(wallet.totalLosses) : '$0.00'}
          </p>
        </div>

        <div className={`bg-gradient-to-br ${netPL >= 0 ? 'from-purple-600 to-purple-700' : 'from-orange-600 to-orange-700'} rounded-xl p-6 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Net P/L</p>
          <p className="text-3xl font-bold">
            {netPL >= 0 && '+'}
            {formatCurrency(netPL)}
          </p>
        </div>
      </div>

      {/* Balance Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Balance Breakdown</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
            <div>
              <p className="font-semibold text-white">Available Balance</p>
              <p className="text-sm text-slate-400">Ready to trade</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {wallet ? formatCurrency(wallet.availableBalance) : '$0.00'}
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
            <div>
              <p className="font-semibold text-white">Locked Balance</p>
              <p className="text-sm text-slate-400">In active trades</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {wallet ? formatCurrency(wallet.lockedBalance) : '$0.00'}
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
            <p className="font-semibold text-white">Bonus Balance</p>
            <p className="text-2xl font-bold text-purple-400">
              {wallet ? formatCurrency(wallet.bonusBalance) : '$0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Deposits</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Deposited</span>
              <span className="text-lg font-bold text-green-400">
                {wallet ? formatCurrency(wallet.totalDeposits) : '$0.00'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Withdrawals</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Withdrawn</span>
              <span className="text-lg font-bold text-red-400">
                {wallet ? formatCurrency(wallet.totalWithdrawals) : '$0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Performance Chart</h2>
        <div className="h-64 flex items-center justify-center bg-slate-800 rounded-lg">
          <p className="text-slate-400">Chart visualization coming soon...</p>
        </div>
      </div>
    </div>
  );
}
