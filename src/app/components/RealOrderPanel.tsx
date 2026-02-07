import { useState } from "react";
import { ArrowUp, ArrowDown, AlertTriangle, Shield } from "lucide-react";
import { ConfirmTradeModal } from "./ConfirmTradeModal";
import { toast } from "sonner";
import { projectId } from "../../../utils/supabase/info";

interface RealOrderPanelProps {
  accessToken: string;
  selectedSymbol: string;
  selectedAsset: any;
  wallet: any;
  userProfile: any;
  onTradeSuccess: () => void;
}

export function RealOrderPanel({
  accessToken,
  selectedSymbol,
  selectedAsset,
  wallet,
  userProfile,
  onTradeSuccess,
}: RealOrderPanelProps) {
  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState(60); // seconds
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<'up' | 'down' | null>(null);

  const quickAmounts = [1, 2, 5, 10, 20, 30, 40, 50, 100, 250, 500, 1000, 3000, 5000, 10000, 25000, 50000, 100000];
  const durations = [
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '2m', value: 120 },
    { label: '5m', value: 300 },
    { label: '15m', value: 900 },
    { label: '30m', value: 1800 },
    { label: '1h', value: 3600 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const payout = selectedAsset?.payout || 85;
  const potentialProfit = amount * (payout / 100);
  const potentialReturn = amount + potentialProfit;

  const kycVerified = userProfile?.kycStatus === 'verified';
  const hasBalance = wallet && wallet.availableBalance >= amount;

  const handleBuyClick = (direction: 'up' | 'down') => {
    // Check KYC
    if (!kycVerified) {
      toast.error("KYC verification required for real money trading");
      return;
    }

    // Check balance
    if (!hasBalance) {
      toast.error("Insufficient balance");
      return;
    }

    // Check amount validity
    if (amount <= 0 || amount > 100000) {
      toast.error("Invalid trade amount");
      return;
    }

    setPendingDirection(direction);
    setShowConfirmModal(true);
  };

  const handleConfirmTrade = async () => {
    if (!pendingDirection) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trade/real`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            symbol: selectedSymbol,
            direction: pendingDirection,
            amount,
            duration,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Trade executed! ${pendingDirection.toUpperCase()} ${selectedSymbol}`);
        setShowConfirmModal(false);
        setPendingDirection(null);
        onTradeSuccess();
      } else {
        toast.error(data.error || "Failed to execute trade");
      }
    } catch (error) {
      console.error("Trade execution error:", error);
      toast.error("Failed to execute trade");
    }
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
      {/* Account Mode Badge */}
      <div className="p-4 border-b border-slate-800">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 text-center">
          <p className="text-sm font-bold text-white">REAL ACCOUNT</p>
          <p className="text-xs text-green-100 mt-1">Live Trading</p>
        </div>
      </div>

      {/* KYC Warning if not verified */}
      {!kycVerified && (
        <div className="mx-4 mt-4 bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">KYC Required</p>
            <p className="text-xs text-yellow-300 mt-1">
              Please complete KYC verification to start trading with real money.
            </p>
          </div>
        </div>
      )}

      {/* Order Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Investment Amount */}
        <div>
          <label className="text-sm font-semibold text-slate-300 mb-2 block">
            Investment Amount
          </label>
          
          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                onClick={() => setAmount(qa)}
                className={`px-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  amount === qa
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {qa >= 1000 ? `$${qa / 1000}K` : `$${qa}`}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-blue-500"
              placeholder="Enter amount"
              min={1}
              max={100000}
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm font-semibold text-slate-300 mb-2 block">
            Trade Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {durations.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                  duration === d.value
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payout Info */}
        <div className="bg-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-400">Payout</span>
            <span className="text-sm font-semibold text-green-400">{payout}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-400">Potential Profit</span>
            <span className="text-sm font-bold text-white">{formatCurrency(potentialProfit)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-700 pt-2">
            <span className="text-sm font-semibold text-slate-300">Potential Return</span>
            <span className="text-lg font-bold text-green-400">{formatCurrency(potentialReturn)}</span>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-300">
            <strong>Risk Warning:</strong> Trading involves risk. You can lose your entire investment.
          </p>
        </div>

        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleBuyClick('up')}
            disabled={!kycVerified || !hasBalance}
            className="flex flex-col items-center justify-center gap-2 py-4 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-slate-700 disabled:to-slate-700 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-green-500/50 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-6 h-6" />
            <span>BUY (UP)</span>
          </button>

          <button
            onClick={() => handleBuyClick('down')}
            disabled={!kycVerified || !hasBalance}
            className="flex flex-col items-center justify-center gap-2 py-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-slate-700 disabled:to-slate-700 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-red-500/50 disabled:cursor-not-allowed"
          >
            <ArrowDown className="w-6 h-6" />
            <span>SELL (DOWN)</span>
          </button>
        </div>

        {/* Balance Info */}
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Available Balance</span>
            <span className="text-sm font-bold text-white">
              {wallet ? formatCurrency(wallet.availableBalance) : '$0'}
            </span>
          </div>
          {!hasBalance && (
            <p className="text-xs text-red-400 mt-2">
              Insufficient balance. Please deposit funds.
            </p>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && pendingDirection && (
        <ConfirmTradeModal
          symbol={selectedSymbol}
          direction={pendingDirection}
          amount={amount}
          duration={duration}
          payout={payout}
          potentialProfit={potentialProfit}
          onConfirm={handleConfirmTrade}
          onCancel={() => {
            setShowConfirmModal(false);
            setPendingDirection(null);
          }}
        />
      )}
    </div>
  );
}
