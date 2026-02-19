import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  CreditCard, Wallet, Building2, Smartphone, 
  Shield, Zap, Lock, ArrowLeft, Copy, CheckCircle,
  X, Upload, DollarSign
} from "lucide-react";

export function MemberDepositPage() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const depositMethods = [
    {
      id: "card",
      icon: CreditCard,
      title: "Credit/Debit Card",
      description: "Visa, Mastercard, American Express",
      fee: "Free",
      time: "Instant",
      popular: true,
    },
    {
      id: "bank",
      icon: Building2,
      title: "Bank Transfer",
      description: "Direct transfer from your bank",
      fee: "Free",
      time: "1-3 business days",
      popular: false,
    },
    {
      id: "ewallet",
      icon: Wallet,
      title: "E-Wallet",
      description: "PayPal, Skrill, Neteller",
      fee: "Free",
      time: "Instant",
      popular: true,
    },
    {
      id: "mobile",
      icon: Smartphone,
      title: "Mobile Payment",
      description: "Apple Pay, Google Pay",
      fee: "Free",
      time: "Instant",
      popular: false,
    },
  ];

  const quickAmounts = [10, 50, 100, 500, 1000, 5000];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!amount || !selectedMethod) {
      alert("Please select a payment method and enter an amount");
      return;
    }

    // Simulate deposit submission
    console.log("💰 DEPOSIT SUBMITTED:", {
      method: selectedMethod,
      amount: parseFloat(amount),
      proof: proofFile?.name,
      timestamp: new Date().toISOString(),
    });

    setShowSuccess(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/member");
    }, 3000);
  };

  const selectedMethodData = depositMethods.find(m => m.id === selectedMethod);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="bg-[#252525] border-b border-[#2a2a2a] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/member")}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Deposit Funds</h1>
            <p className="text-slate-400 text-sm">Add money to your trading account</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#252525] rounded-xl p-4 border border-[#2a2a2a]">
            <Shield className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold mb-1">Secure</h3>
            <p className="text-sm text-slate-400">Bank-level encryption</p>
          </div>
          <div className="bg-[#252525] rounded-xl p-4 border border-[#2a2a2a]">
            <Zap className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="font-semibold mb-1">Fast</h3>
            <p className="text-sm text-slate-400">Instant processing</p>
          </div>
          <div className="bg-[#252525] rounded-xl p-4 border border-[#2a2a2a]">
            <Lock className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Protected</h3>
            <p className="text-sm text-slate-400">Your funds are safe</p>
          </div>
        </div>

        {/* Payment Methods */}
        {!selectedMethod && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Choose Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {depositMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`relative bg-[#252525] border rounded-xl p-6 hover:border-green-500 transition-all text-left ${
                    method.popular ? "border-green-500/50" : "border-[#2a2a2a]"
                  }`}
                >
                  {method.popular && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500/10 p-3 rounded-xl">
                      <method.icon className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{method.title}</h3>
                      <p className="text-sm text-slate-400 mb-3">{method.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-400">Fee: <span className="text-white">{method.fee}</span></span>
                        <span className="text-slate-400">Time: <span className="text-white">{method.time}</span></span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Deposit Form */}
        {selectedMethod && !showSuccess && (
          <div className="bg-[#252525] rounded-xl p-6 border border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedMethodData && <selectedMethodData.icon className="w-6 h-6 text-green-500" />}
                <div>
                  <h3 className="font-bold">{selectedMethodData?.title}</h3>
                  <p className="text-sm text-slate-400">{selectedMethodData?.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMethod(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Deposit Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-[#2a2a2a] text-white pl-12 pr-4 py-3 rounded-xl border border-[#3a3a3a] focus:border-green-500 focus:outline-none text-lg font-semibold"
                  min="1"
                />
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="bg-[#2a2a2a] hover:bg-[#303030] border border-[#3a3a3a] hover:border-green-500 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Details for Bank Transfer */}
            {selectedMethod === "bank" && (
              <div className="mb-6 p-4 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a]">
                <h4 className="font-semibold mb-3 text-sm">Bank Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Bank Name:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">Investoft Bank</span>
                      <button className="text-green-500 hover:text-green-400">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">123456789012</span>
                      <button className="text-green-500 hover:text-green-400">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Account Name:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">Investoft Ltd</span>
                      <button className="text-green-500 hover:text-green-400">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Proof */}
            {selectedMethod === "bank" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Upload Transfer Proof (Optional)
                </label>
                <div className="border-2 border-dashed border-[#3a3a3a] hover:border-green-500 rounded-xl p-6 text-center transition-all cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="proof-upload"
                    accept="image/*,application/pdf"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      {proofFile ? proofFile.name : "Click to upload receipt or screenshot"}
                    </p>
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!amount}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg"
            >
              Submit Deposit Request
            </button>

            <p className="text-xs text-slate-400 text-center mt-4">
              Your deposit will be processed within {selectedMethodData?.time.toLowerCase()}
            </p>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-[#252525] rounded-xl p-8 border border-green-500 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Deposit Submitted!</h3>
            <p className="text-slate-400 mb-4">
              Your deposit request for ${amount} has been submitted successfully.
            </p>
            <p className="text-sm text-slate-400">
              Redirecting to dashboard...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
