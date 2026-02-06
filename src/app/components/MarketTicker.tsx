import { ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "motion/react";

const TICKER_ITEMS = [
  { symbol: "SPX500", price: 4450.32, change: 0.45 },
  { symbol: "NSX100", price: 15300.12, change: 0.78 },
  { symbol: "DJI30", price: 34500.67, change: 0.23 },
  { symbol: "EURUSD", price: 1.0845, change: -0.12 },
  { symbol: "GBPUSD", price: 1.2634, change: 0.05 },
  { symbol: "USDJPY", price: 145.67, change: 0.34 },
  { symbol: "BTCUSD", price: 64230.50, change: 2.34 },
  { symbol: "ETHUSD", price: 3450.12, change: 1.56 },
  { symbol: "SOLUSD", price: 145.23, change: 4.56 },
  { symbol: "GOLD", price: 1945.34, change: 0.12 },
  { symbol: "OIL", price: 85.67, change: -0.45 },
];

export function MarketTicker() {
  return (
    <div className="bg-white border-b border-slate-200 overflow-hidden py-2 shadow-sm">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-8"
          animate={{ x: [0, -1000] }}
          transition={{
            repeat: Infinity,
            duration: 30,
            ease: "linear",
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{item.symbol}</span>
              <span className="text-slate-600">{item.price.toFixed(2)}</span>
              <span
                className={`flex items-center text-xs ${
                  item.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(item.change)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
