import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, Lock, Gift } from "lucide-react";
import { projectId } from "../../../utils/supabase/info";

interface RealWalletPageProps {
  accessToken: string;
  wallet: any;
  onWalletUpdate: () => void;
}

export function RealWalletPage({ accessToken, wallet, onWalletUpdate }: RealWalletPageProps) {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const [depositsRes, withdrawalsRes] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/deposits`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/withdrawals`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
      ]);

      if (depositsRes.ok) {
        const data = await depositsRes.json();
        setDeposits(data.deposits);
      }

      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        setWithdrawals(data.withdrawals);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-600', text: 'text-yellow-100', label: 'Pending' },
      approved: { bg: 'bg-green-600', text: 'text-green-100', label: 'Approved' },
      rejected: { bg: 'bg-red-600', text: 'text-red-100', label: 'Rejected' },
    };
    
    const config = configs[status] || configs.pending;
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Available Balance</p>
          <p className="text-3xl font-bold">
            {wallet ? formatCurrency(wallet.availableBalance) : '$0.00'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Lock className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Locked Balance</p>
          <p className="text-3xl font-bold">
            {wallet ? formatCurrency(wallet.lockedBalance) : '$0.00'}
          </p>
          <p className="text-xs opacity-75 mt-1">In Active Trades</p>
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

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Gift className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Bonus Balance</p>
          <p className="text-3xl font-bold">
            {wallet ? formatCurrency(wallet.bonusBalance) : '$0.00'}
          </p>
        </div>
      </div>

      {/* Transactions History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposits */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">Deposit History</h3>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {deposits.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No deposits yet</p>
            ) : (
              <div className="space-y-3">
                {deposits.map((deposit) => (
                  <div
                    key={deposit.depositId}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="font-semibold text-white">
                          {formatCurrency(deposit.amount)}
                        </span>
                      </div>
                      {getStatusBadge(deposit.status)}
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Method: {deposit.method}</p>
                      <p>{formatDate(deposit.createdAt)}</p>
                    </div>
                    {deposit.rejectionReason && (
                      <p className="text-xs text-red-400 mt-2">
                        Reason: {deposit.rejectionReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Withdrawals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">Withdrawal History</h3>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {withdrawals.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No withdrawals yet</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.withdrawalId}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="font-semibold text-white">
                          {formatCurrency(withdrawal.amount)}
                        </span>
                      </div>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Method: {withdrawal.method}</p>
                      <p>{formatDate(withdrawal.createdAt)}</p>
                    </div>
                    {withdrawal.rejectionReason && (
                      <p className="text-xs text-red-400 mt-2">
                        Reason: {withdrawal.rejectionReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-400">Total Deposits</p>
            <p className="text-2xl font-bold text-green-400">
              {wallet ? formatCurrency(wallet.totalDeposits) : '$0.00'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Withdrawals</p>
            <p className="text-2xl font-bold text-red-400">
              {wallet ? formatCurrency(wallet.totalWithdrawals) : '$0.00'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Profits</p>
            <p className="text-2xl font-bold text-green-400">
              {wallet ? formatCurrency(wallet.totalProfits) : '$0.00'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Losses</p>
            <p className="text-2xl font-bold text-red-400">
              {wallet ? formatCurrency(wallet.totalLosses) : '$0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
