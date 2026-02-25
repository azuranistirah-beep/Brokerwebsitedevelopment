import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard, Wallet, Building2, Smartphone, Shield, CheckCircle, ArrowRight, DollarSign, Lock, Zap } from "lucide-react";
import { useOutletContext } from "react-router";
import type { AppContextType } from "../hooks/useAppContext";
import { AuthModal } from "./AuthModal";

export function DepositPage() {
  const { isAuthenticated, userRole } = useOutletContext<AppContextType>();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Jika belum login, tampilkan AuthModal
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  // Jika sudah login, redirect ke dashboard member
  useEffect(() => {
    if (isAuthenticated && userRole === 'member') {
      navigate('/member');
    } else if (isAuthenticated && userRole === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Redirect akan otomatis dilakukan oleh useEffect di atas
  };

  const depositMethods = [
    {
      icon: CreditCard,
      title: "Credit/Debit Card",
      description: "Visa, Mastercard, American Express",
      fee: "Free",
      time: "Instant",
      popular: true,
    },
    {
      icon: Building2,
      title: "Bank Transfer",
      description: "Direct transfer from your bank",
      fee: "Free",
      time: "1-3 business days",
      popular: false,
    },
    {
      icon: Wallet,
      title: "E-Wallet",
      description: "PayPal, Skrill, Neteller",
      fee: "Free",
      time: "Instant",
      popular: true,
    },
    {
      icon: Smartphone,
      title: "Mobile Payment",
      description: "Apple Pay, Google Pay",
      fee: "Free",
      time: "Instant",
      popular: false,
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Bank-level encryption for all deposits",
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Start trading immediately after deposit",
    },
    {
      icon: Lock,
      title: "Protected Funds",
      description: "Your money is safe and segregated",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-slate-950 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <DollarSign className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Fund Your Account</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Deposit Funds
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Choose from multiple secure payment methods to start trading
            </p>
          </div>

          {/* Features Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Deposit Methods */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Payment Methods</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {depositMethods.map((method, index) => (
                <div
                  key={index}
                  className={`relative bg-slate-900 border rounded-2xl p-6 hover:border-blue-500 transition-all duration-300 group cursor-pointer ${
                    method.popular ? "border-blue-500/50" : "border-slate-800"
                  }`}
                  onClick={() => setShowAuthModal(true)}
                >
                  {method.popular && (
                    <div className="absolute -top-3 right-6">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                      <method.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{method.title}</h3>
                      <p className="text-slate-400 text-sm mb-3">{method.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-slate-400">Fee: <span className="text-white font-medium">{method.fee}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-slate-400">Time: <span className="text-white font-medium">{method.time}</span></span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Sign up now and get instant access to your trading dashboard with a $10,000 demo account
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all duration-200 shadow-xl inline-flex items-center gap-2 group"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/10 p-2 rounded-lg flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Your Security is Our Priority</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  All transactions are encrypted with 256-bit SSL encryption. Your funds are held in segregated accounts and protected by industry-leading security measures. Investoft is committed to maintaining the highest standards of financial security and regulatory compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          if (!isAuthenticated) {
            navigate('/'); // Redirect ke home jika user cancel dan belum login
          }
        }}
        onAuthSuccess={handleAuthSuccess}
        defaultTab="signup"
      />
    </>
  );
}