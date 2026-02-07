import { useState } from "react";
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Circle } from "lucide-react";

interface RealTradesListProps {
  activeTrades: any[];
  closedTrades: any[];
}

export function RealTradesList({ activeTrades, closedTrades }: RealTradesListProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTimeRemaining = (expiryTime: number) => {
    const remaining = Math.max(0, expiryTime - Date.now());
    const seconds = Math.floor(remaining / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'open'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Open Trades ({activeTrades.length})
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'closed'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Closed Trades ({closedTrades.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'open' && (
          <div className="p-4">
            {activeTrades.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No open trades</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeTrades.map((trade) => (
                  <div
                    key={trade.tradeId}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {trade.direction === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <p className="font-semibold text-white">{trade.symbol}</p>
                        <p className="text-xs text-slate-400">
                          Entry: {trade.entryPrice.toFixed(5)}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(trade.amount)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatTime(trade.entryTime)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-mono font-semibold text-yellow-400">
                        {getTimeRemaining(trade.expiryTime)}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Payout</p>
                      <p className="text-sm font-semibold text-green-400">{trade.payout}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'closed' && (
          <div className="p-4">
            {closedTrades.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No closed trades</p>
              </div>
            ) : (
              <div className="space-y-2">
                {closedTrades.map((trade) => {
                  const isWin = trade.result === 'win';
                  const isTie = trade.result === 'tie';
                  
                  return (
                    <div
                      key={trade.tradeId}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {trade.direction === 'up' ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <p className="font-semibold text-white">{trade.symbol}</p>
                          <p className="text-xs text-slate-400">
                            {trade.entryPrice.toFixed(5)} → {trade.exitPrice.toFixed(5)}
                          </p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(trade.amount)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(trade.closedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isWin ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : isTie ? (
                          <Circle className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`text-sm font-semibold ${
                          isWin ? 'text-green-400' : isTie ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {isWin ? 'WIN' : isTie ? 'TIE' : 'LOSS'}
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">P/L</p>
                        <p className={`text-sm font-bold ${
                          trade.profit > 0 ? 'text-green-400' : trade.profit < 0 ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {trade.profit > 0 && '+'}
                          {formatCurrency(trade.profit)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
