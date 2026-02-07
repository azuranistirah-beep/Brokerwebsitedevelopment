import { useState } from "react";
import { Building2, Bitcoin, CreditCard, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { projectId } from "../../../utils/supabase/info";

interface RealWithdrawPageProps {
  accessToken: string;
  wallet: any;
  onSuccess: () => void;
}

export function RealWithdrawPage({ accessToken, wallet, onSuccess }: RealWithdrawPageProps) {
  const [amount, setAmount] = useState(50);
  const [method, setMethod] = useState<'bank' | 'crypto' | 'card'>('bank');
  const [accountDetails, setAccountDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const MIN_WITHDRAWAL = 10;
  const availableBalance = wallet?.availableBalance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is $${MIN_WITHDRAWAL}`);
      return;
    }

    if (amount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!accountDetails.trim()) {
      toast.error("Please provide account details");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/withdraw/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            amount,
            method,
            accountDetails,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Withdrawal request submitted!");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to submit withdrawal");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to submit withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
      <p className="text-slate-400 mb-8">Request withdrawal from your account</p>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8">
        <p className="text-sm text-blue-100 mb-1">Available Balance</p>
        <p className="text-4xl font-bold text-white">{formatCurrency(availableBalance)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Withdrawal Method
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
            Withdrawal Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-blue-500"
              min={MIN_WITHDRAWAL}
              max={availableBalance}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Minimum: ${MIN_WITHDRAWAL} | Available: {formatCurrency(availableBalance)}
          </p>
        </div>

        {/* Account Details */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            {method === 'bank' && 'Bank Account Number / IBAN'}
            {method === 'crypto' && 'Crypto Wallet Address'}
            {method === 'card' && 'Card Number'}
          </label>
          <textarea
            value={accountDetails}
            onChange={(e) => setAccountDetails(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            rows={3}
            placeholder="Enter your account details"
          />
        </div>

        {/* Warning */}
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-300">
            <p className="font-semibold mb-1">Important</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Funds will be locked until withdrawal is processed</li>
              <li>Processing time: 1-5 business days</li>
              <li>Ensure account details are correct</li>
            </ul>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || amount > availableBalance}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Withdrawal Request"}
        </button>
      </form>
    </div>
  );
}
