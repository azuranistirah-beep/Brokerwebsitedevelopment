import { Card } from "./ui/card";
import { MiniChart } from "./MiniChart";

const ASSETS = [
  { symbol: "FX:EURUSD", name: "EUR/USD" },
  { symbol: "NASDAQ:AAPL", name: "Apple Inc" },
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin" },
  { symbol: "NASDAQ:TSLA", name: "Tesla" },
  { symbol: "NASDAQ:NVDA", name: "NVIDIA" },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum" },
];

export function PopularAssets() {
  return (
    <section className="container mx-auto px-4 py-20 bg-slate-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular Assets</h2>
        <p className="text-slate-500">Track and trade the most popular stocks and cryptocurrencies</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ASSETS.map((asset) => (
          <Card key={asset.symbol} className="bg-white border-slate-200 p-4 h-[200px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <MiniChart symbol={asset.symbol} />
          </Card>
        ))}
      </div>
    </section>
  );
}
