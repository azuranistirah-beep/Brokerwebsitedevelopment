import { Button } from "./ui/button";
import { TrendingUp, Shield, CheckCircle2, ArrowRight, Gift, Sparkles, Play } from "lucide-react";
import { LiveMarketOverview } from "./LiveMarketOverview";
import { PopularAssets } from "./PopularAssets";
import { TickerTape } from "./TickerTape";

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (view: string) => void;
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

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Content - Centered */}
            <div className="text-center">
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
              <p className="text-xl text-slate-400 mb-6 leading-relaxed max-w-2xl mx-auto">
                Advanced trading tools, lightning-fast execution, and unmatched security. Join millions of traders worldwide.
              </p>

              {/* Bonus Deposit Info - Compact Badge with Better Colors */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-800/50 border border-blue-500/30 mb-8 backdrop-blur-sm">
                <Gift className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <div className="text-blue-300 font-bold text-sm">100% Deposit Bonus</div>
                  <div className="text-slate-300 text-xs">Deposit $1,000 and trade with $2,000 instantly</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
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
              <div className="flex flex-wrap items-center gap-6 justify-center">
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
              <Button 
                variant="outline" 
                onClick={() => onNavigate("charts")} 
                className="hidden md:flex border-2 border-blue-600/50 bg-blue-600/10 text-blue-300 hover:bg-blue-600/20 hover:border-blue-500 hover:text-blue-200 font-semibold"
              >
                View Full Chart <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <LiveMarketOverview />
            
            <div className="mt-8 text-center md:hidden">
              <Button 
                variant="outline" 
                className="w-full border-2 border-blue-600/50 bg-blue-600/10 text-blue-300 hover:bg-blue-600/20 hover:border-blue-500 hover:text-blue-200 font-semibold" 
                onClick={() => onNavigate("charts")}
              >
                View Full Chart
              </Button>
            </div>
         </div>
      </section>

      {/* Popular Assets */}
      <section id="markets" className="bg-slate-950">
        <PopularAssets />
        <div className="text-center pb-24 bg-slate-950">
           <Button 
             variant="outline" 
             className="border-2 border-blue-600/50 bg-blue-600/10 text-blue-300 hover:bg-blue-600/20 hover:border-blue-500 hover:text-blue-200 min-w-[200px] font-semibold" 
             onClick={() => onNavigate("markets")}
           >
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