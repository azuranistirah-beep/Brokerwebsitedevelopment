import { Button } from "./ui/button";
import { TrendingUp, Shield, CheckCircle2, ArrowRight, Gift } from "lucide-react";
import { LiveMarketOverview } from "./LiveMarketOverview";
import { PopularAssets } from "./PopularAssets";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { TickerTape } from "./TickerTape";
import bgImage from "figma:asset/f0d81cb854edb61c0a57900420621a0ae1ce5100.png"; // Keeping the import just in case, but using Unsplash for the bg

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (view: string) => void;
}

export function LandingPage({ onGetStarted, onNavigate }: LandingPageProps) {
  return (
    <div className="bg-white font-sans">
      {/* Ticker Tape - Real-time Market Data */}
      <div className="bg-white border-b border-slate-200">
        <TickerTape colorTheme="light" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-8 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live Market Data Available
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
            Master the Markets with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Precision & Speed</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the next generation of trading. Zero commission, lightning-fast execution, and professional-grade tools at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 h-14 rounded-full transition-all hover:scale-105 shadow-xl shadow-blue-600/20 w-full sm:w-auto" onClick={onGetStarted}>
              Start Trading Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 text-lg px-8 h-14 rounded-full w-full sm:w-auto transition-all" 
              onClick={onGetStarted}
            >
              Try Demo Account
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 text-sm grayscale opacity-70">
             <div className="font-bold flex items-center gap-1"><Shield size={16}/> SECURE</div>
             <div className="font-bold flex items-center gap-1"><CheckCircle2 size={16}/> REGULATED</div>
             <div className="font-bold flex items-center gap-1"><TrendingUp size={16}/> FAST</div>
          </div>
        </div>
      </section>

      {/* Promo Section - Reimagined */}
      <section className="container mx-auto px-4 py-12" id="promo">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[500px] flex items-center group">
          {/* Background Image */}
          <ImageWithFallback 
             src="https://images.unsplash.com/photo-1762279389083-abf71f22d338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhYnN0cmFjdCUyMGZpbmFuY2lhbCUyMHRlY2hub2xvZ3klMjBibHVlJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzAzNzYyNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
             alt="Trading Background"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-900/80 to-blue-900/30" />

          {/* Decorative Circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 w-full p-8 md:p-16">
             <div className="max-w-2xl">
               <div className="inline-block bg-yellow-400 text-blue-950 text-xs font-bold px-3 py-1 rounded-full mb-6 shadow-lg shadow-yellow-400/20">
                  LIMITED TIME OFFER
               </div>
               
               <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                 Double Your Capital<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">100% Deposit Bonus</span>
               </h2>
               
               <p className="text-blue-100 text-lg mb-10 leading-relaxed max-w-xl">
                 Start your trading journey with a massive advantage. Deposit $500 and trade with $1,000 instantly. Available exclusively for new accounts.
               </p>

               <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-yellow-400 text-blue-950 hover:bg-yellow-300 font-bold h-14 px-8 rounded-full text-lg shadow-lg shadow-yellow-400/20" onClick={onGetStarted}>
                    Claim Bonus Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-4 px-6 h-14 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white">
                     <Gift className="text-yellow-400 h-5 w-5" />
                     <span className="font-mono font-bold tracking-wider">WELCOME100</span>
                  </div>
               </div>
               
               <p className="mt-6 text-blue-200/60 text-sm">
                 *Terms and conditions apply. Minimum deposit required.
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* Why Choose Investoft */}
      <section className="container mx-auto px-4 py-24 bg-white" id="features">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
             <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center py-12">
                   <div className="text-6xl font-bold text-slate-900 mb-2 tracking-tighter">50K+</div>
                   <div className="text-blue-600 font-medium mb-8 uppercase tracking-widest text-sm">Active Traders</div>
                   <p className="text-slate-600 mb-8 max-w-xs mx-auto">Join a global community of successful traders. Start your journey with zero risk.</p>
                   <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl" onClick={onGetStarted}>
                     Join the Community
                   </Button>
                </div>
             </div>
          </div>
          
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">Why Traders Choose <br/><span className="text-blue-600">Investoft</span></h2>
            <div className="space-y-8">
              {[
                { title: "Maximum Profit", desc: "Industry-leading payouts up to 95% on successful trades.", icon: TrendingUp },
                { title: "Advanced Technology", desc: "Ultra-low latency execution with professional charting tools.", icon: CheckCircle2 },
                { title: "Secure & Regulated", desc: "Your funds are protected with bank-grade security and segregated accounts.", icon: Shield }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="mt-1 flex-shrink-0 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                    <item.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Overview */}
      <section className="bg-slate-50 py-20 border-y border-slate-200" id="charts">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Live Market Overview</h2>
                <p className="text-slate-500">Real-time prices from global exchanges</p>
              </div>
              <Button variant="outline" onClick={() => onNavigate("charts")} className="hidden md:flex">
                View Full Chart <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <LiveMarketOverview />
            
            <div className="mt-8 text-center md:hidden">
              <Button variant="outline" className="w-full" onClick={() => onNavigate("charts")}>
                View Full Chart
              </Button>
            </div>
         </div>
      </section>

      {/* Popular Assets */}
      <section id="markets">
        <PopularAssets />
        <div className="text-center pb-24 bg-slate-50">
           <Button variant="outline" className="border-slate-300 hover:bg-white hover:border-blue-600 hover:text-blue-600 min-w-[200px]" onClick={() => onNavigate("markets")}>
             View All Markets
           </Button>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="bg-slate-900 rounded-3xl p-12 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-800/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-800/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to Start Your Trading Journey?</h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Join over 50,000 traders who trust Investoft for their daily trading needs. 
              Open your free account today in less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-10 h-16 rounded-full w-full sm:w-auto shadow-xl" onClick={onGetStarted}>
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