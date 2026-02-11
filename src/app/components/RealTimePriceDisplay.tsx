import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { realTimeWebSocket } from "../lib/realTimeWebSocket";

interface RealTimePriceDisplayProps {
  symbol: string;
}

export function RealTimePriceDisplay({ symbol }: RealTimePriceDisplayProps) {
  const [price, setPrice] = useState<number>(0);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(`📊 [RealTimePriceDisplay] Subscribing to ${symbol}`);
    setIsLoading(true);
    
    // Get initial price immediately
    const initialPrice = realTimeWebSocket.getCurrentPrice(symbol);
    if (initialPrice > 0) {
      setPrice(initialPrice);
      setPreviousPrice(initialPrice);
      setIsLoading(false);
    }
    
    // Subscribe to real-time price updates from Binance WebSocket
    const unsubscribe = realTimeWebSocket.subscribe(symbol, (newPrice) => {
      console.log(`💰 [RealTimePriceDisplay] ${symbol}: $${newPrice.toFixed(2)}`);
      
      setPreviousPrice(price);
      setPrice(newPrice);
      setIsLoading(false);
    });

    return () => {
      console.log(`🛑 [RealTimePriceDisplay] Unsubscribing from ${symbol}`);
      unsubscribe();
    };
  }, [symbol]);

  if (isLoading) {
    return (
      <div className="bg-slate-50 border-2 border-slate-300 rounded-lg px-4 py-3">
        <div className="text-xs text-slate-500 font-medium mb-1">Current Market Price</div>
        <div className="text-2xl font-bold text-slate-400 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // Determine decimal places based on asset type
  const decimals = symbol.includes("FX:") ? 4 : 2;

  return (
    <div className="bg-slate-50 border-2 border-slate-300 rounded-lg px-4 py-3">
      <div className="text-xs text-slate-500 font-medium mb-1">Current Market Price</div>
      
      <div className="flex items-baseline gap-2 flex-wrap">
        <div className="text-2xl font-bold text-slate-900">
          ${price.toLocaleString(undefined, { 
            minimumFractionDigits: decimals, 
            maximumFractionDigits: decimals 
          })}
        </div>
        {Math.abs(price - previousPrice) > 0.001 && (
          <div className={`text-sm font-semibold ${price > previousPrice ? 'text-green-600' : 'text-red-600'}`}>
            {price > previousPrice ? '▲' : '▼'} {Math.abs(price - previousPrice).toFixed(2)}%
          </div>
        )}
      </div>
      
      {Math.abs(price - previousPrice) > 0.01 && (
        <div className={`text-xs mt-1 ${price > previousPrice ? 'text-green-600' : 'text-red-600'}`}>
          {price > previousPrice ? '+' : ''}{(price - previousPrice).toFixed(decimals)} from previous
        </div>
      )}
    </div>
  );
}