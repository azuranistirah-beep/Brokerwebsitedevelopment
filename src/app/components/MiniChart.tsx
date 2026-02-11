import { useEffect, useRef, memo, useState } from "react";
import { realTimeWebSocket } from "../lib/realTimeWebSocket";

interface MiniChartProps {
  symbol: string;
  colorTheme?: "light" | "dark";
}

export const MiniChart = memo(({ symbol, colorTheme = "dark" }: MiniChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [price, setPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  // ✅ Subscribe to real-time price updates
  useEffect(() => {
    const cleanSymbol = symbol.replace('BINANCE:', '').replace('NASDAQ:', '').replace('NYSE:', '').split('/')[0];
    
    const unsubscribe = realTimeWebSocket.subscribe(cleanSymbol, (newPrice) => {
      if (newPrice && newPrice > 0) {
        setPriceChange(((newPrice - price) / price) * 100);
        setPrice(newPrice);
      }
    });

    return () => unsubscribe();
  }, [symbol]);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "12M",
      colorTheme: colorTheme,
      isTransparent: true,
      autosize: true,
      largeChartUrl: ""
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, colorTheme]);

  // ✅ Extract display name
  const displaySymbol = symbol.replace('BINANCE:', '').replace('NASDAQ:', '').replace('NYSE:', '').split('/')[0];

  return (
    <div className="relative h-full w-full">
      {/* ✅ OVERLAY: Always visible price info on top of TradingView widget */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 bg-gradient-to-b from-slate-900 to-transparent">
        <div className="text-xs font-bold text-white mb-0.5">{displaySymbol}</div>
        <div className="text-sm font-bold text-blue-400">${price.toFixed(price > 100 ? 2 : 5)}</div>
        {priceChange !== 0 && (
          <div className={`text-xs font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        )}
      </div>
      
      {/* ✅ TradingView Widget Container */}
      <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
        <div className="tradingview-widget-container__widget h-full w-full"></div>
      </div>
    </div>
  );
});

MiniChart.displayName = "MiniChart";