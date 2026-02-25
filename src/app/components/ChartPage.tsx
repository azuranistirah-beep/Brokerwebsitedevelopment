import { TickerTape } from "./TickerTape";
import { CryptoMarketList } from "./CryptoMarketList";

export function ChartPage() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Ticker Tape */}
      <div className="bg-slate-900 border-b border-slate-800">
        <TickerTape colorTheme="dark" />
      </div>
      
      <div className="pt-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Cryptocurrency</h1>
          <p className="text-slate-400 mb-6">Live cryptocurrency market data and real-time prices</p>
          
          {/* Crypto Market List - Like CoinMarketCap */}
          <CryptoMarketList />
        </div>
      </div>
    </div>
  );
}

// ✅ Default export for lazy loading
export default ChartPage;