import { useEffect, useRef, useState } from "react";

interface TradingChartProps {
  symbol: string;
  interval?: string;
  theme?: "light" | "dark";
}

export function TradingChart({ symbol, interval = "1", theme = "dark" }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    console.log(`📊 Loading TradingView chart for ${symbol}...`);
    setIsLoading(true);
    setError(null);

    const container = containerRef.current;
    container.innerHTML = "";

    // Create widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "calc(100% - 32px)";
    widgetDiv.style.width = "100%";

    widgetContainer.appendChild(widgetDiv);
    container.appendChild(widgetContainer);

    // Create script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;

    const config = {
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      toolbar_bg: "#1a1a1a",
      enable_publishing: false,
      backgroundColor: "rgba(26, 26, 26, 1)",
      gridColor: "rgba(42, 42, 42, 0.6)",
      save_image: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      studies: [],
      overrides: {
        "mainSeriesProperties.candleStyle.upColor": "#10b981",
        "mainSeriesProperties.candleStyle.downColor": "#ef4444",
        "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
        "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
        "paneProperties.background": "#1a1a1a",
        "paneProperties.backgroundType": "solid",
      }
    };

    script.innerHTML = JSON.stringify(config);

    // ✅ SIMPLE: Just wait 2 seconds then hide loading (widget loads itself)
    script.onload = () => {
      console.log("✅ TradingView script loaded");
      setTimeout(() => {
        setIsLoading(false);
        console.log("✅ TradingView widget should be visible now");
      }, 2000); // Give widget 2 seconds to initialize
    };

    script.onerror = () => {
      console.error("❌ Failed to load TradingView script");
      setError("Failed to load chart");
      setIsLoading(false);
    };

    widgetContainer.appendChild(script);

    // Cleanup
    return () => {
      container.innerHTML = "";
    };
  }, [symbol, interval, theme]);

  return (
    <div className="w-full h-full bg-[#1a1a1a] relative">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] z-10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
            <div className="text-slate-300 text-sm">Loading Chart...</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] z-10">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <div className="text-slate-300 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
    </div>
  );
}
