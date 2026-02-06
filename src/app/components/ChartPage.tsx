import { LiveMarketOverview } from "./LiveMarketOverview";
import { TickerTape } from "./TickerTape";

export function ChartPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Ticker Tape */}
      <div className="bg-white border-b border-slate-200">
        <TickerTape colorTheme="light" />
      </div>
      
      <div className="pt-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Interactive Chart</h1>
          <LiveMarketOverview />
        </div>
      </div>
    </div>
  );
}