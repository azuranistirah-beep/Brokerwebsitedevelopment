import { Card } from "./ui/card";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { tvPriceService } from "../lib/tvPriceService";
import { ArrowUp, ArrowDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  basePrice: number;
}

const INITIAL_TICKER_ITEMS: TickerItem[] = [
  { symbol: "SPX500", price: 4450.32, change: 0.45, basePrice: 4450.32 },
  { symbol: "NSX100", price: 15300.12, change: 0.78, basePrice: 15300.12 },
  { symbol: "DJI30", price: 34500.67, change: 0.23, basePrice: 34500.67 },
  { symbol: "EURUSD", price: 1.0845, change: -0.12, basePrice: 1.0845 },
  { symbol: "GBPUSD", price: 1.2634, change: 0.05, basePrice: 1.2634 },
  { symbol: "USDJPY", price: 145.67, change: 0.34, basePrice: 145.67 },
  { symbol: "BTCUSD", price: 64230.50, change: 2.34, basePrice: 64230.50 },
  { symbol: "ETHUSD", price: 3450.12, change: 1.56, basePrice: 3450.12 },
  { symbol: "SOLUSD", price: 145.23, change: 4.56, basePrice: 145.23 },
  { symbol: "GOLD", price: 1945.34, change: 0.12, basePrice: 1945.34 },
  { symbol: "OIL", price: 85.67, change: -0.45, basePrice: 85.67 },
];

export function MarketTicker() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(INITIAL_TICKER_ITEMS);

  // ✅ Subscribe to real-time updates for crypto symbols
  useEffect(() => {
    console.log('🔌 [MarketTicker] Setting up WebSocket subscriptions...');
    
    const unsubscribeFunctions: (() => void)[] = [];
    
    // Subscribe to crypto symbols
    const cryptoSymbols = ['BTCUSD', 'ETHUSD', 'SOLUSD'];
    
    cryptoSymbols.forEach((symbol) => {
      const unsubscribe = tvPriceService.subscribe(symbol, (priceData) => {
        setTickerItems((prevItems) => {
          return prevItems.map((item) => {
            if (item.symbol === symbol) {
              return {
                ...item,
                price: priceData.price,
                change: priceData.changePercent24h,
              };
            }
            return item;
          });
        });
      });
      
      unsubscribeFunctions.push(unsubscribe);
    });
    
    console.log(`✅ [MarketTicker] Subscribed to ${cryptoSymbols.length} symbols`);
    
    return () => {
      console.log('🔌 [MarketTicker] Cleaning up subscriptions...');
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, []);

  return (
    <Card className="bg-white border-b border-slate-200 overflow-hidden py-2 shadow-sm">
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
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
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
    </Card>
  );
}