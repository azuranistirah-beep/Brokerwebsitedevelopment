import { useState } from "react";
import { CreditCard, Building2, Bitcoin, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { projectId } from "../../../utils/supabase/info";

interface RealDepositPageProps {
  accessToken: string;
  onSuccess: () => void;
}

export function RealDepositPage({ accessToken, onSuccess }: RealDepositPageProps) {
  const [amount, setAmount] = useState(50);
  const [method, setMethod] = useState<'bank' | 'crypto' | 'card'>('bank');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [10, 25, 50, 100, 250, 500, 1000, 5000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 10) {
      toast.error("Minimum deposit is $10");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/deposit/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            amount,
            method,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Deposit request submitted! Awaiting admin approval.");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to submit deposit");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Failed to submit deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Deposit Funds</h1>
      <p className="text-slate-400 mb-8">Add funds to your trading account</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setMethod('bank')}
              className={`p-4 rounded-xl border-2 transition-all ${
                method === 'bank'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <Building2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Bank Transfer</p>
            </button>
            <button
              type="button"
              onClick={() => setMethod('crypto')}
              className={`p-4 rounded-xl border-2 transition-all ${
                method === 'crypto'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <Bitcoin className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Cryptocurrency</p>
            </button>
            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`p-4 rounded-xl border-2 transition-all ${
                method === 'card'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <CreditCard className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Credit Card</p>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Deposit Amount
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(qa)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  amount === qa
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ${qa}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-blue-500"
              min={10}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">Minimum deposit: $10</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">Manual Verification Required</p>
            <p>Your deposit will be reviewed by our team. Once approved, funds will be added to your account within 1-24 hours.</p>
          </div>
        </div>

        {/* Bonus Info Box */}
        {amount >= 1000 && (
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-600/50 rounded-lg p-4 flex items-start gap-3 animate-pulse">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎁</span>
            </div>
            <div className="text-sm">
              <p className="font-bold text-yellow-300 mb-1">100% Deposit Bonus Eligible!</p>
              <p className="text-yellow-100">
                You'll receive <span className="font-bold">${amount.toLocaleString()}</span> bonus, 
                trading with a total of <span className="font-bold text-yellow-300">${(amount * 2).toLocaleString()}</span>!
              </p>
              <p className="text-yellow-200/60 text-xs mt-2">*Available exclusively for new accounts with minimum deposit of $1,000</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Deposit Request"}
        </button>
      </form>
    </div>
  );
}