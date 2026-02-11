import { Button } from "./ui/button";
import { TrendingUp, Shield, CheckCircle2, ArrowRight, Gift, Sparkles, Play } from "lucide-react";
import { LiveMarketOverview } from "./LiveMarketOverview";
import { PopularAssets } from "./PopularAssets";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { TickerTape } from "./TickerTape";
import { useEffect, useState } from "react";
import bgImage from "figma:asset/f0d81cb854edb61c0a57900420621a0ae1ce5100.png";

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (view: string) => void;
}

// Mini Live Markets Widget Component
function LiveMarketsWidget({ onViewMarkets }: { onViewMarkets: () => void }) {
  const [markets, setMarkets] = useState<any[]>([
    { symbol: 'USDC', name: 'USDCUSDT', price: 1.0006, change: 0.01, icon: '🔵' },
    { symbol: 'BTC', name: 'BTCUSDT', price: 66236.01, change: -4.83, icon: '₿' },
    { symbol: 'ETH', name: 'ETHUSDT', price: 1918.21, change: -5.49, icon: 'Ξ' },
    { symbol: 'SOL', name: 'SOLUSDT', price: 78.65, change: 6.62, icon: '◎' },
    { symbol: 'XRP', name: 'XRPUSDT', price: 1.3622, change: -8.25, icon: '✕' },
  ]);

  // Simulating real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => ({
        ...m,
        price: m.price * (1 + (Math.random() - 0.5) * 0.001),
        change: m.change + (Math.random() - 0.5) * 0.1,
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">Live Markets</h3>
          <p className="text-slate-400 text-xs">Top performing assets</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-green-400 text-xs font-semibold">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {markets.map((market) => (
          <div key={market.symbol} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {market.icon}
              </div>
              <div>
                <div className="text-white font-bold text-sm">{market.symbol}</div>
                <div className="text-slate-500 text-xs">{market.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-sm">{market.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className={`text-xs font-semibold ${market.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onViewMarkets}
        className="w-full mt-4 py-3 text-blue-400 hover:text-blue-300 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800/50 rounded-xl transition-all group"
      >
        View All Markets 
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

export function LandingPage({ onGetStarted, onNavigate }: LandingPageProps) {
  return (
    <div className="bg-slate-950 font-sans">
      {/* Ticker Tape - Real-time Market Data */}
      <div className="bg-slate-900 border-b border-slate-800">
        <TickerTape colorTheme="dark" />
      </div>

      {/* New Hero Section - Modern Dark Design */}
      <section className="relative overflow-hidden min-h-screen flex items-center bg-slate-950">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                #1 Crypto Trading Platform
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none">
                Trade Crypto<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600">
                  like a pro
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-slate-400 mb-6 leading-relaxed max-w-xl">
                Advanced trading tools, lightning-fast execution, and unmatched security. Join millions of traders worldwide.
              </p>

              {/* Bonus Deposit Info - Compact Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border border-yellow-500/20 mb-8 backdrop-blur-sm">
                <Gift className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-yellow-400 font-bold text-sm">100% Deposit Bonus</div>
                  <div className="text-slate-400 text-xs">Deposit $1,000 and trade with $2,000 instantly</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 h-14 rounded-xl transition-all hover:scale-105 shadow-xl shadow-blue-600/20" 
                  onClick={onGetStarted}
                >
                  Start Trading Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800 hover:border-slate-600 text-lg px-8 h-14 rounded-xl backdrop-blur-sm" 
                  onClick={() => onNavigate("charts")}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Explore Markets
                </Button>
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Secure Trading</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Real-time Data</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right - Live Markets Widget */}
            <div className="flex justify-center lg:justify-end">
              <LiveMarketsWidget onViewMarkets={() => onNavigate("charts")} />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Investoft */}
      <section className="container mx-auto px-4 py-24 bg-slate-950" id="features">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
             <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center py-12">
                   <div className="text-6xl font-bold text-white mb-2 tracking-tighter">50K+</div>
                   <div className="text-blue-400 font-medium mb-8 uppercase tracking-widest text-sm">Active Traders</div>
                   <p className="text-slate-400 mb-8 max-w-xs mx-auto">Join a global community of successful traders. Start your journey with zero risk.</p>
                   <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 rounded-xl" onClick={onGetStarted}>
                     Join the Community
                   </Button>
                </div>
             </div>
          </div>
          
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">Why Traders Choose <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Investoft</span></h2>
            <div className="space-y-8">
              {[
                { title: "Maximum Profit", desc: "Industry-leading payouts up to 95% on successful trades.", icon: TrendingUp },
                { title: "Advanced Technology", desc: "Ultra-low latency execution with professional charting tools.", icon: CheckCircle2 },
                { title: "Secure & Regulated", desc: "Your funds are protected with bank-grade security and segregated accounts.", icon: Shield }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="mt-1 flex-shrink-0 w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 border border-slate-800">
                    <item.icon className="h-6 w-6 text-blue-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Overview */}
      <section className="bg-slate-950 py-20 border-y border-slate-800" id="charts">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Live Market Overview</h2>
                <p className="text-slate-400">Real-time prices from global exchanges</p>
              </div>
              <Button variant="outline" onClick={() => onNavigate("charts")} className="hidden md:flex border-slate-700 text-white hover:bg-slate-800">
                View Full Chart <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <LiveMarketOverview />
            
            <div className="mt-8 text-center md:hidden">
              <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800" onClick={() => onNavigate("charts")}>
                View Full Chart
              </Button>
            </div>
         </div>
      </section>

      {/* Popular Assets */}
      <section id="markets" className="bg-slate-950">
        <PopularAssets />
        <div className="text-center pb-24 bg-slate-950">
           <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800 hover:border-blue-600 hover:text-blue-400 min-w-[200px]" onClick={() => onNavigate("markets")}>
             View All Markets
           </Button>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="container mx-auto px-4 py-24 text-center bg-slate-950">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-12 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to Start Your Trading Journey?</h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Join over 50,000 traders who trust Investoft for their daily trading needs. 
              Open your free account today in less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 h-16 rounded-full w-full sm:w-auto shadow-xl" onClick={onGetStarted}>
                Create Free Account
              </Button>
            </div>
            <p className="mt-8 text-slate-500 text-sm">No credit card required for demo account.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
