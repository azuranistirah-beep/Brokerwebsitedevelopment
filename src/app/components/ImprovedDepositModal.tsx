import { useState, useEffect } from "react";
import { X, ChevronRight, ArrowLeft, Shield } from "lucide-react";

interface ImprovedDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onDepositSuccess: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  speed: string;
  minAmount: string;
  category: "my-methods" | "recommended" | "other";
}

// 🌍 PAYMENT METHODS BY COUNTRY
const INDONESIA_PAYMENTS: PaymentMethod[] = [
  { id: "qris", name: "QRIS", icon: "📱", speed: "Instantly", minAmount: "min Rp 165,000", category: "my-methods" },
  { id: "virtual-bank", name: "Virtual Bank", icon: "🏦", speed: "1-60 minutes", minAmount: "min Rp 165,000", category: "recommended" },
  { id: "dana", name: "DANA", icon: "💳", speed: "Instantly", minAmount: "min Rp 165,000", category: "recommended" },
  { id: "ovo", name: "OVO", icon: "💜", speed: "Instantly", minAmount: "min Rp 165,000", category: "recommended" },
  { id: "mastercard", name: "Mastercard", icon: "💳", speed: "Instantly", minAmount: "min Rp 165,000", category: "other" },
  { id: "visa", name: "Visa", icon: "💳", speed: "Instantly", minAmount: "min Rp 165,000", category: "other" },
  { id: "google-pay", name: "Google Pay", icon: "🔵", speed: "Instantly", minAmount: "min Rp 165,000", category: "other" },
  { id: "shopeepay", name: "SHOPEEPAY", icon: "🛍️", speed: "Instantly", minAmount: "min Rp 165,000", category: "other" },
];

const GLOBAL_PAYMENTS: PaymentMethod[] = [
  { id: "card", name: "Credit/Debit Card", icon: "💳", speed: "Instantly", minAmount: "min $10", category: "recommended" },
  { id: "paypal", name: "PayPal", icon: "🅿️", speed: "Instantly", minAmount: "min $10", category: "recommended" },
  { id: "bank-transfer", name: "Bank Transfer", icon: "🏦", speed: "1-3 days", minAmount: "min $50", category: "other" },
  { id: "crypto", name: "Cryptocurrency", icon: "₿", speed: "10-30 minutes", minAmount: "min $20", category: "other" },
];

// 💰 PRESET AMOUNTS (IDR)
const IDR_PRESETS = [330000, 500000, 750000, 1000000, 1250000, 1500000];

// 💰 PRESET AMOUNTS (USD)
const USD_PRESETS = [50, 100, 250, 500, 1000, 2500];

export function ImprovedDepositModal({ isOpen, onClose, userEmail, onDepositSuccess }: ImprovedDepositModalProps) {
  const [step, setStep] = useState<"methods" | "amount">("methods");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [country, setCountry] = useState<"ID" | "GLOBAL">("GLOBAL");
  const [isLoading, setIsLoading] = useState(false);

  // 🌍 DETECT COUNTRY (simple geolocation)
  useEffect(() => {
    if (isOpen) {
      detectCountry();
    }
  }, [isOpen]);

  const detectCountry = async () => {
    try {
      // Try to detect country from browser timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.includes("Jakarta") || timezone.includes("Asia/Jakarta")) {
        setCountry("ID");
      } else {
        // You can also use a geolocation API here
        setCountry("GLOBAL");
      }
    } catch (error) {
      console.error("Error detecting country:", error);
      setCountry("GLOBAL");
    }
  };

  const paymentMethods = country === "ID" ? INDONESIA_PAYMENTS : GLOBAL_PAYMENTS;
  const presets = country === "ID" ? IDR_PRESETS : USD_PRESETS;
  const currency = country === "ID" ? "Rp" : "$";

  const myMethods = paymentMethods.filter((m) => m.category === "my-methods");
  const recommended = paymentMethods.filter((m) => m.category === "recommended");
  const other = paymentMethods.filter((m) => m.category === "other");

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep("amount");
    setAmount(country === "ID" ? 500000 : 100); // Default amount
  };

  const handleDeposit = async () => {
    if (!selectedMethod || amount <= 0) return;

    setIsLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // In real app, you would:
      // 1. Call backend to create payment
      // 2. Redirect to payment gateway
      // 3. Handle callback after payment
      
      alert(`Payment processing:\nMethod: ${selectedMethod.name}\nAmount: ${currency} ${amount.toLocaleString()}`);
      onDepositSuccess();
    } catch (error) {
      console.error("Deposit error:", error);
      alert("Deposit failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "amount") {
      setStep("methods");
      setSelectedMethod(null);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* 🎯 HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={handleBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h2 className="text-lg font-bold text-white flex-1">
          {step === "methods" ? "Payment method" : selectedMethod?.name}
        </h2>
        {step === "amount" && selectedMethod?.id === "qris" && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <Shield className="h-3 w-3" />
            <span className="font-semibold">Secure method</span>
          </div>
        )}
      </div>

      {/* 📜 CONTENT */}
      <div className="flex-1 overflow-y-auto bg-slate-950">
        {step === "methods" && (
          <div className="p-4 space-y-6">
            {/* MY METHODS */}
            {myMethods.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-slate-400 mb-3">My methods</h3>
                <div className="space-y-2">
                  {myMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method)}
                      className="w-full flex items-center gap-3 p-4 bg-slate-900 hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-xl">
                        {method.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold text-white">{method.name}</div>
                        <div className="text-xs text-slate-400">
                          {method.speed} • {method.minAmount}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* RECOMMENDED */}
            {recommended.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Recommended</h3>
                <div className="space-y-2">
                  {recommended.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method)}
                      className="w-full flex items-center gap-3 p-4 bg-slate-900 hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-xl">
                        {method.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold text-white">{method.name}</div>
                        <div className="text-xs text-slate-400">
                          {method.speed} • {method.minAmount}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* OTHER */}
            {other.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Other</h3>
                <div className="space-y-2">
                  {other.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method)}
                      className="w-full flex items-center gap-3 p-4 bg-slate-900 hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-xl">
                        {method.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold text-white">{method.name}</div>
                        <div className="text-xs text-slate-400">
                          {method.speed} • {method.minAmount}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {step === "amount" && (
          <div className="p-4 space-y-6">
            {/* AMOUNT INPUT */}
            <section>
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Amount ({currency})</h3>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-transparent text-4xl font-bold text-white outline-none border-b border-slate-700 pb-2"
                placeholder="0"
              />
            </section>

            {/* PRESET AMOUNTS */}
            <section className="grid grid-cols-3 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`p-4 rounded-xl text-center font-bold transition-all ${
                    amount === preset
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {currency} {preset.toLocaleString()}
                </button>
              ))}
            </section>

            {/* DEPOSIT BUTTON */}
            <button
              onClick={handleDeposit}
              disabled={isLoading || amount <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all uppercase flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Deposit {currency} {amount.toLocaleString()}</span>
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              You will be redirected to the payment page to complete your payment.
            </p>

            {/* LICENSE BADGES */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-800">
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">VISA</span>
                </div>
                <span className="text-[9px] text-slate-600">secure</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">MC</span>
                </div>
                <span className="text-[9px] text-slate-600">ID Check</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">PCI</span>
                </div>
                <span className="text-[9px] text-slate-600">DSS</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">SSL</span>
                </div>
                <span className="text-[9px] text-slate-600">256-bit</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
