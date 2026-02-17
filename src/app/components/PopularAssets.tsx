import { Card } from "./ui/card";
import { MiniChart } from "./MiniChart";

const DEFAULT_ASSETS = [
  { symbol: "FX:EURUSD", name: "EUR/USD" },
  { symbol: "NASDAQ:AAPL", name: "Apple Inc" },
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin" },
  { symbol: "NASDAQ:TSLA", name: "Tesla" },
  { symbol: "NASDAQ:NVDA", name: "NVIDIA" },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum" },
];

interface PopularAssetsProps {
  assets?: Array<{ symbol: string; name: string }>;
  title?: string;
  description?: string;
}

export function PopularAssets({ 
  assets = DEFAULT_ASSETS,
  title = "Popular Assets",
  description = "Track and trade the most popular stocks and cryptocurrencies"
}: PopularAssetsProps) {
  return (
    <section className="container mx-auto px-4 py-20 bg-slate-950">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400">{description}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <Card key={asset.symbol} className="bg-slate-900 border-slate-800 p-0 h-[280px] overflow-hidden shadow-lg hover:shadow-xl hover:border-slate-700 transition-all hover:scale-[1.02]">
            <MiniChart symbol={asset.symbol} />
          </Card>
        ))}
      </div>
    </section>
  );
}