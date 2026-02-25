import { Shield, Users, TrendingUp, Zap, Award, Globe, Clock, Lock } from "lucide-react";
import { Link } from "react-router";

/**
 * About Page - Professional & Transparent
 * Investoft Platform Information
 */
export function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 border-b border-slate-800">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Investoft</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Your gateway to learning cryptocurrency trading in a safe, risk-free environment with real-time market data.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-20 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                Investoft is dedicated to democratizing cryptocurrency trading education by providing a professional-grade trading platform where anyone can learn and practice trading strategies without risking real money.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                We believe that education is the foundation of successful trading. Our platform combines real-time market data with a simulated trading environment, allowing you to develop your skills and confidence before entering the real markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 md:py-20 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">What We Offer</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature Cards */}
              <FeatureCard
                icon={<TrendingUp className="w-8 h-8 text-blue-400" />}
                title="Real-Time Market Data"
                description="Access live cryptocurrency prices from Binance API, ensuring your practice trades reflect actual market conditions."
              />
              
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-purple-400" />}
                title="Practice Trading"
                description="Practice trading with virtual funds in a risk-free environment that simulates real market dynamics."
              />
              
              <FeatureCard
                icon={<Shield className="w-8 h-8 text-green-400" />}
                title="Zero Risk Learning"
                description="Learn trading strategies, test ideas, and build confidence without any financial risk."
              />
              
              <FeatureCard
                icon={<Globe className="w-8 h-8 text-cyan-400" />}
                title="Professional Interface"
                description="Trade with a professional-grade interface inspired by leading platforms like TradingView."
              />
              
              <FeatureCard
                icon={<Clock className="w-8 h-8 text-orange-400" />}
                title="24/7 Access"
                description="Practice trading anytime, anywhere. The crypto market never sleeps, and neither does your learning."
              />
              
              <FeatureCard
                icon={<Users className="w-8 h-8 text-pink-400" />}
                title="Educational Focus"
                description="Comprehensive resources and tools designed to help you understand market dynamics and trading principles."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Type - Important Disclaimer */}
      <section className="py-16 md:py-20 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-2 border-blue-500/30 rounded-2xl p-8 md:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-lg shrink-0">
                  <Award className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Educational Trading Platform</h2>
                  <div className="space-y-4 text-slate-300">
                    <p className="leading-relaxed">
                      <strong className="text-white">Important:</strong> Investoft is a <strong className="text-blue-400">practice trading and educational platform</strong>. All trading activities on this platform are simulated and use virtual funds only.
                    </p>
                    
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckMark />
                        <span>All accounts use virtual practice balance</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckMark />
                        <span>Real-time market data from Binance API</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckMark />
                        <span>Risk-free learning environment</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <XMark />
                        <span>No real money deposits or withdrawals</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <XMark />
                        <span>No real trading execution on exchanges</span>
                      </div>
                    </div>

                    <p className="leading-relaxed text-sm">
                      This platform is designed for educational purposes only. Past performance in practice trading does not guarantee future results in real trading. Always conduct thorough research and consider seeking advice from licensed financial advisors before engaging in real cryptocurrency trading.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 md:py-20 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Technology</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <TechCard
                icon={<Lock className="w-6 h-6 text-blue-400" />}
                title="Secure Platform"
                description="Built with React and Supabase, ensuring a fast, secure, and reliable experience."
              />
              
              <TechCard
                icon={<TrendingUp className="w-6 h-6 text-green-400" />}
                title="Real-Time Data"
                description="Direct integration with Binance API for accurate, up-to-the-second cryptocurrency prices."
              />
              
              <TechCard
                icon={<Zap className="w-6 h-6 text-purple-400" />}
                title="High Performance"
                description="Optimized for speed with 4-second price updates and smooth chart rendering."
              />
              
              <TechCard
                icon={<Globe className="w-6 h-6 text-cyan-400" />}
                title="Responsive Design"
                description="Fully responsive interface that works seamlessly on desktop, tablet, and mobile devices."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Legal Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Legal & Transparency</h2>
            
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 md:p-12 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Platform Status</h3>
                <p className="text-slate-300 leading-relaxed">
                  Investoft operates as a demonstration and educational platform. We do not hold, accept, or facilitate real money transactions. All trading is simulated using virtual funds.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Data Sources</h3>
                <p className="text-slate-300 leading-relaxed">
                  Market data is provided by Binance API. We update prices every 4 seconds to ensure accuracy while maintaining platform performance.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Terms & Conditions</h3>
                <p className="text-slate-300 leading-relaxed">
                  By using this platform, you agree to our{" "}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300 underline">
                    Terms & Conditions
                  </Link>
                  . Please read them carefully to understand your rights and responsibilities.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Risk Disclosure</h3>
                <p className="text-slate-300 leading-relaxed">
                  Cryptocurrency trading carries substantial risk. This platform is for educational purposes only. Success in practice trading does not guarantee success in real trading. Always trade responsibly and never invest more than you can afford to lose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Learning?</h2>
            <p className="text-lg text-slate-300 mb-8">
              Join Investoft today and start practicing your trading skills in a risk-free environment.
            </p>
            <Link to="/login">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                Get Started - It's Free
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function TechCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function CheckMark() {
  return (
    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-green-500" />
    </div>
  );
}

function XMark() {
  return (
    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-red-500" />
    </div>
  );
}