import { useState } from "react";
import { X, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface ConfirmTradeModalProps {
  symbol: string;
  direction: 'up' | 'down';
  amount: number;
  duration: number;
  payout: number;
  potentialProfit: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmTradeModal({
  symbol,
  direction,
  amount,
  duration,
  payout,
  potentialProfit,
  onConfirm,
  onCancel,
}: ConfirmTradeModalProps) {
  const [understood, setUnderstood] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">Confirm Trade</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Direction Badge */}
          <div className={`flex items-center justify-center gap-2 p-4 rounded-xl ${
            direction === 'up' 
              ? 'bg-green-600/20 border border-green-600' 
              : 'bg-red-600/20 border border-red-600'
          }`}>
            {direction === 'up' ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
            <span className={`text-2xl font-bold ${
              direction === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              {direction.toUpperCase()}
            </span>
          </div>

          {/* Trade Details */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Asset</span>
              <span className="font-bold text-white">{symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Investment</span>
              <span className="font-bold text-white">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duration</span>
              <span className="font-bold text-white">{formatDuration(duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payout</span>
              <span className="font-bold text-green-400">{payout}%</span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-slate-300 font-semibold">Potential Profit</span>
              <span className="font-bold text-green-400">{formatCurrency(potentialProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 font-semibold">Total Risk</span>
              <span className="font-bold text-red-400">{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">High Risk Warning</p>
              <p className="text-xs text-red-300">
                Binary options trading carries a high level of risk. You may lose your entire investment of {formatCurrency(amount)} if the trade does not end in your favor.
              </p>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-slate-300">
              I understand that I can lose my entire investment and accept the risks associated with binary options trading.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!understood}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Confirm Trade
          </button>
        </div>
      </div>
    </div>
  );
}
