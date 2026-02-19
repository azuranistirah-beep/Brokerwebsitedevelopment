import { useState } from "react";
import { X, Wallet, CreditCard, Smartphone, QrCode, Bitcoin } from "lucide-react";
import { Button } from "./ui/button";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onDepositSuccess?: () => void;
}

type PaymentMethod = 'bank' | 'ewallet' | 'qris' | 'crypto' | 'card';
type BankType = 'BCA' | 'MANDIRI' | 'BRI' | 'BNI' | 'PERMATA';
type EwalletType = 'GOPAY' | 'OVO' | 'DANA' | 'LINKAJA' | 'SHOPEEPAY';
type CryptoType = 'USDT' | 'BTC' | 'ETH' | 'BNB';

export function DepositModal({ isOpen, onClose, userEmail, onDepositSuccess }: DepositModalProps) {
  const [step, setStep] = useState<'method' | 'amount' | 'payment'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankType | null>(null);
  const [selectedEwallet, setSelectedEwallet] = useState<EwalletType | null>(null);
  const [selectedCrypto, setSelectedCryptoType] = useState<CryptoType | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const quickAmounts = [50, 100, 250, 500, 1000, 5000];

  const banks = [
    { code: 'BCA' as BankType, name: 'Bank Central Asia', color: 'bg-blue-600' },
    { code: 'MANDIRI' as BankType, name: 'Bank Mandiri', color: 'bg-blue-700' },
    { code: 'BRI' as BankType, name: 'Bank Rakyat Indonesia', color: 'bg-blue-500' },
    { code: 'BNI' as BankType, name: 'Bank Negara Indonesia', color: 'bg-orange-600' },
    { code: 'PERMATA' as BankType, name: 'Bank Permata', color: 'bg-green-600' },
  ];

  const ewallets = [
    { code: 'GOPAY' as EwalletType, name: 'GoPay', color: 'bg-green-500' },
    { code: 'OVO' as EwalletType, name: 'OVO', color: 'bg-purple-600' },
    { code: 'DANA' as EwalletType, name: 'DANA', color: 'bg-blue-500' },
    { code: 'LINKAJA' as EwalletType, name: 'LinkAja', color: 'bg-red-600' },
    { code: 'SHOPEEPAY' as EwalletType, name: 'ShopeePay', color: 'bg-orange-500' },
  ];

  const cryptos = [
    { code: 'USDT' as CryptoType, name: 'Tether (USDT)', network: 'TRC20', color: 'bg-green-500' },
    { code: 'BTC' as CryptoType, name: 'Bitcoin', network: 'Bitcoin', color: 'bg-orange-500' },
    { code: 'ETH' as CryptoType, name: 'Ethereum', network: 'ERC20', color: 'bg-blue-500' },
    { code: 'BNB' as CryptoType, name: 'Binance Coin', network: 'BEP20', color: 'bg-yellow-500' },
  ];

  if (!isOpen) return null;

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method === 'qris' || method === 'card') {
      setStep('amount');
    }
  };

  const handleBankSelect = (bank: BankType) => {
    setSelectedBank(bank);
    setStep('amount');
  };

  const handleEwalletSelect = (ewallet: EwalletType) => {
    setSelectedEwallet(ewallet);
    setStep('amount');
  };

  const handleCryptoSelect = (crypto: CryptoType) => {
    setSelectedCryptoType(crypto);
    setStep('amount');
  };

  const handleAmountSubmit = async () => {
    if (!amount || parseFloat(amount) < 10) {
      alert('Minimum deposit amount is $10');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate payment info
      const depositData = {
        userEmail,
        amount: parseFloat(amount),
        method: selectedMethod,
        bank: selectedBank,
        ewallet: selectedEwallet,
        crypto: selectedCrypto,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Call backend to create deposit request
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/deposit/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(depositData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create deposit request');
      }

      const result = await response.json();
      setPaymentInfo(result.paymentInfo);
      setStep('payment');
    } catch (error: any) {
      console.error('Deposit error:', error);
      alert('Failed to create deposit request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('method');
    setSelectedMethod(null);
    setSelectedBank(null);
    setSelectedEwallet(null);
    setSelectedCryptoType(null);
    setAmount('');
    setPaymentInfo(null);
    onClose();
  };

  const getPaymentMethodName = () => {
    if (selectedBank) return selectedBank;
    if (selectedEwallet) return selectedEwallet;
    if (selectedCrypto) return selectedCrypto;
    if (selectedMethod === 'qris') return 'QRIS';
    if (selectedMethod === 'card') return 'Credit/Debit Card';
    return '';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-slate-900 rounded-lg shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Deposit Funds</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {step === 'method' && 'Choose your payment method'}
              {step === 'amount' && `Enter amount - ${getPaymentMethodName()}`}
              {step === 'payment' && 'Complete your payment'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* STEP 1: Select Payment Method */}
          {step === 'method' && (
            <div className="space-y-6">
              {/* Bank Transfer */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold text-white">Bank Transfer</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {banks.map((bank) => (
                    <button
                      key={bank.code}
                      onClick={() => {
                        handleMethodSelect('bank');
                        handleBankSelect(bank.code);
                      }}
                      className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 rounded-lg transition-all text-center"
                    >
                      <div className={`w-12 h-12 ${bank.color} rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm`}>
                        {bank.code.slice(0, 3)}
                      </div>
                      <p className="text-sm font-medium text-white">{bank.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* E-Wallet */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-5 h-5 text-green-400" />
                  <h3 className="text-base font-semibold text-white">E-Wallet</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ewallets.map((ewallet) => (
                    <button
                      key={ewallet.code}
                      onClick={() => {
                        handleMethodSelect('ewallet');
                        handleEwalletSelect(ewallet.code);
                      }}
                      className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-green-500 rounded-lg transition-all text-center"
                    >
                      <div className={`w-12 h-12 ${ewallet.color} rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs`}>
                        {ewallet.code.slice(0, 4)}
                      </div>
                      <p className="text-sm font-medium text-white">{ewallet.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* QRIS */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-semibold text-white">QRIS</h3>
                </div>
                <button
                  onClick={() => handleMethodSelect('qris')}
                  className="w-full p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Scan QRIS</p>
                      <p className="text-xs text-slate-400">All Indonesian e-wallets & banks</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Cryptocurrency */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bitcoin className="w-5 h-5 text-orange-400" />
                  <h3 className="text-base font-semibold text-white">Cryptocurrency</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {cryptos.map((crypto) => (
                    <button
                      key={crypto.code}
                      onClick={() => {
                        handleMethodSelect('crypto');
                        handleCryptoSelect(crypto.code);
                      }}
                      className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-orange-500 rounded-lg transition-all text-center"
                    >
                      <div className={`w-12 h-12 ${crypto.color} rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm`}>
                        {crypto.code}
                      </div>
                      <p className="text-sm font-medium text-white">{crypto.name}</p>
                      <p className="text-xs text-slate-400">{crypto.network}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Card */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold text-white">Credit/Debit Card</h3>
                </div>
                <button
                  onClick={() => handleMethodSelect('card')}
                  className="w-full p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Visa / Mastercard</p>
                      <p className="text-xs text-slate-400">International cards accepted</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Enter Amount */}
          {step === 'amount' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Deposit Amount (USD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="10"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1">Minimum deposit: $10</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Quick Select</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-lg text-white text-sm transition-all"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setStep('method');
                    setSelectedMethod(null);
                    setSelectedBank(null);
                    setSelectedEwallet(null);
                    setSelectedCryptoType(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleAmountSubmit}
                  disabled={isProcessing || !amount || parseFloat(amount) < 10}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? 'Processing...' : 'Continue'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Instructions */}
          {step === 'payment' && paymentInfo && (
            <div className="space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Deposit ${amount} via {getPaymentMethodName()}
                  </h3>
                  <p className="text-sm text-slate-400">Please complete payment within 24 hours</p>
                </div>

                {paymentInfo.vaNumber && (
                  <div className="bg-slate-900 rounded-lg p-4 mb-4">
                    <p className="text-xs text-slate-400 mb-1">Virtual Account Number</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-wider">
                      {paymentInfo.vaNumber}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentInfo.vaNumber);
                        alert('Copied to clipboard!');
                      }}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                )}

                {paymentInfo.qrCode && (
                  <div className="bg-white rounded-lg p-4 mb-4 text-center">
                    <img src={paymentInfo.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                    <p className="text-xs text-slate-600 mt-2">Scan with your e-wallet app</p>
                  </div>
                )}

                {paymentInfo.cryptoAddress && (
                  <div className="bg-slate-900 rounded-lg p-4 mb-4">
                    <p className="text-xs text-slate-400 mb-1">
                      {paymentInfo.cryptoNetwork} Address
                    </p>
                    <p className="text-sm font-mono text-white break-all">
                      {paymentInfo.cryptoAddress}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentInfo.cryptoAddress);
                        alert('Copied to clipboard!');
                      }}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      Copy address
                    </button>
                  </div>
                )}

                <div className="space-y-2 text-sm text-slate-300">
                  <p className="font-medium">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    {paymentInfo.instructions?.map((instruction: string, index: number) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-300">
                  ⚠️ Your deposit will be processed within 5-30 minutes after payment confirmation. 
                  Please keep your payment receipt.
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-slate-700 hover:bg-slate-600"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
