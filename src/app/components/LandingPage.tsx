import { Button } from "./ui/button";
import { TrendingUp, Shield, CheckCircle2, ArrowRight, Gift, Sparkles, Play } from "lucide-react";
import { LiveMarketOverview } from "./LiveMarketOverview";
import { PopularAssets } from "./PopularAssets";
import { TickerTape } from "./TickerTape";
import { useOutletContext } from "react-router";

interface OutletContextType {
  onSignupClick: () => void;
}

export function LandingPage() {
  const { onSignupClick } = useOutletContext<OutletContextType>();

  return (
    <div className="bg-slate-950 font-sans">
      {/* Ticker Tape - Real-time Market Data */}
      <div className="bg-slate-900 border-b border-slate-800">
        <TickerTape colorTheme="dark" />
      </div>

      {/* New Hero Section - Modern Dark Design */}
      <section className="relative overflow-hidden bg-slate-950 pt-16 pb-24">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                #1 Crypto Trading Platform
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-none">
                Trade Crypto<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600">
                  like a pro
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-4 sm:mb-6 leading-relaxed max-w-2xl mx-auto px-4">
                Advanced trading tools, lightning-fast execution, and unmatched security. Join millions of traders worldwide.
              </p>

              {/* Bonus Deposit Info - Animated Attention-Grabbing Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-2 border-blue-500/50 mb-8 backdrop-blur-sm shadow-lg shadow-blue-500/20 animate-[fadeInBounce_1s_ease-out_0.5s_both,float_3s_ease-in-out_1.5s_infinite]">
                <Gift className="w-6 h-6 text-blue-400 animate-[wiggle_1s_ease-in-out_1.5s_infinite]" />
                <div className="text-left">
                  <div className="text-blue-300 font-bold text-lg md:text-xl">100% Deposit Bonus</div>
                  <div className="text-slate-300 text-xs md:text-sm">Deposit $1,000 and trade with $2,000 instantly</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 h-14 rounded-xl transition-all hover:scale-105 shadow-xl shadow-blue-600/20" 
                  onClick={onSignupClick}
                >
                  Start Trading Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800 hover:border-slate-600 text-lg px-8 h-14 rounded-xl backdrop-blur-sm" 
                  onClick={() => onSignupClick()}
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

      {/* ✨ Live Market Overview Section with Enhanced Background */}
      <section className="relative py-16 bg-slate-950 border-t border-slate-900 overflow-hidden">
        {/* ✨ Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <LiveMarketOverview />
        </div>
      </section>

      {/* Popular Assets Section - MOVED UP */}
      <section className="py-16 bg-slate-950 border-t border-slate-900">
        <PopularAssets />
      </section>

      {/* Why Traders Choose Section - MOVED DOWN */}
      <section className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Traders Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Investoft</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Join thousands of successful traders who trust our platform for their crypto trading needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-600/50 transition-all hover:shadow-xl hover:shadow-blue-600/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Maximum Profit</h3>
              <p className="text-slate-400">
                Up to 95% profit on successful trades with our competitive payout rates
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-600/50 transition-all hover:shadow-xl hover:shadow-purple-600/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Advanced Security</h3>
              <p className="text-slate-400">
                Your funds are protected with bank-level encryption and security protocols
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-green-600/50 transition-all hover:shadow-xl hover:shadow-green-600/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Execution</h3>
              <p className="text-slate-400">
                Lightning-fast order execution with minimal slippage and delays
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Traders Stats Section - MOVED DOWN */}
      <section className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-2">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  50K+
                </div>
                <div className="text-slate-400 text-lg font-medium">Active Traders</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  $2.5B+
                </div>
                <div className="text-slate-400 text-lg font-medium">Trading Volume</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                  150+
                </div>
                <div className="text-slate-400 text-lg font-medium">Countries Served</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join Investoft today and experience the future of crypto trading. Get started in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 h-14 rounded-xl transition-all hover:scale-105 shadow-xl shadow-blue-600/20" 
                onClick={onSignupClick}
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700 hover:border-slate-600 text-lg px-10 h-14 rounded-xl backdrop-blur-sm" 
                onClick={onSignupClick}
              >
                Try Demo Account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}