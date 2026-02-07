import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Circle } from "lucide-react";
import { projectId } from "../../../utils/supabase/info";

interface RealHistoryPageProps {
  accessToken: string;
}

export function RealHistoryPage({ accessToken }: RealHistoryPageProps) {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss'>('all');

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trades/real/closed`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades);
      }
    } catch (error) {
      console.error("Failed to fetch trades:", error);
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
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    return trade.result === filter;
  });

  const stats = {
    total: trades.length,
    wins: trades.filter(t => t.result === 'win').length,
    losses: trades.filter(t => t.result === 'loss').length,
    totalProfit: trades.reduce((sum, t) => sum + (t.profit > 0 ? t.profit : 0), 0),
    totalLoss: trades.reduce((sum, t) => sum + (t.profit < 0 ? Math.abs(t.profit) : 0), 0),
  };

  const winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trading History</h1>
          <p className="text-slate-400 mt-1">View all your closed trades</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('win')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'win'
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Wins
          </button>
          <button
            onClick={() => setFilter('loss')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'loss'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Losses
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400 mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-400 mb-1">Wins</p>
          <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-400 mb-1">Losses</p>
          <p className="text-2xl font-bold text-red-400">{stats.losses}</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-400 mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-blue-400">{winRate}%</p>
        </div>
        <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-4">
          <p className="text-sm text-purple-400 mb-1">Net P/L</p>
          <p className={`text-2xl font-bold ${stats.totalProfit - stats.totalLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(stats.totalProfit - stats.totalLoss)}
          </p>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filteredTrades.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-lg">No trades found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Asset</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Direction</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Entry/Exit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Result</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">P/L</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTrades.map((trade) => (
                  <tr key={trade.tradeId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white">{trade.symbol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {trade.direction === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}>
                          {trade.direction.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{formatCurrency(trade.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-slate-300">{trade.entryPrice.toFixed(5)}</div>
                        <div className="text-slate-500">{trade.exitPrice.toFixed(5)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {trade.result === 'win' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="font-semibold text-green-400">WIN</span>
                          </>
                        ) : trade.result === 'tie' ? (
                          <>
                            <Circle className="w-5 h-5 text-yellow-400" />
                            <span className="font-semibold text-yellow-400">TIE</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="font-semibold text-red-400">LOSS</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${
                        trade.profit > 0 ? 'text-green-400' : trade.profit < 0 ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {trade.profit > 0 && '+'}
                        {formatCurrency(trade.profit)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">{formatDate(trade.closedAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
