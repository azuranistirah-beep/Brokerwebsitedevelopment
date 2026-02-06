import { useEffect, useRef } from "react";

interface TradingChartProps {
  symbol: string;
  interval?: string;
  theme?: "light" | "dark";
  onPriceUpdate?: (price: number) => void;
}

export function TradingChart({ symbol, interval = "D", theme = "light", onPriceUpdate }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const widgetRef = useRef<any>(null);

  const mapInterval = (i: string) => {
    if (i.endsWith("m")) return i.replace("m", "");
    if (i.endsWith("h")) return (parseInt(i) * 60).toString();
    if (i === "1d") return "D";
    if (i.endsWith("s")) return "1"; 
    return i;
  };

  const tvInterval = mapInterval(interval);

  // Simulate real-time price updates
  useEffect(() => {
    if (!onPriceUpdate) return;

    // Get base price based on symbol
    const getBasePrice = (sym: string): number => {
      const upper = sym.toUpperCase();
      if (upper.includes('BTC')) return 65000 + (Math.random() - 0.5) * 1000;
      if (upper.includes('ETH')) return 3500 + (Math.random() - 0.5) * 50;
      if (upper.includes('EUR')) return 1.09 + (Math.random() - 0.5) * 0.01;
      if (upper.includes('GBP')) return 1.27 + (Math.random() - 0.5) * 0.01;
      if (upper.includes('JPY')) return 145 + (Math.random() - 0.5) * 1;
      if (upper.includes('XAU') || upper.includes('GOLD')) return 2050 + (Math.random() - 0.5) * 10;
      if (upper.includes('OIL') || upper.includes('WTI')) return 75 + (Math.random() - 0.5) * 2;
      return 100 + (Math.random() - 0.5) * 5;
    };

    let currentPrice = getBasePrice(symbol);
    onPriceUpdate(currentPrice);

    // Update price every 1-3 seconds with realistic movement
    const priceInterval = setInterval(() => {
      // Realistic price movement: small random walk
      const volatility = currentPrice * 0.002; // 0.2% volatility
      const change = (Math.random() - 0.5) * volatility;
      currentPrice = currentPrice + change;
      
      onPriceUpdate(currentPrice);
    }, 1000 + Math.random() * 2000); // Random interval between 1-3 seconds

    return () => clearInterval(priceInterval);
  }, [symbol, onPriceUpdate]);

  useEffect(() => {
    // Check if script is already in head
    if (!document.getElementById("tv-widget-script")) {
      const script = document.createElement("script");
      script.id = "tv-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        scriptLoadedRef.current = true;
        initWidget();
      };
      document.head.appendChild(script);
    } else {
      if ((window as any).TradingView) {
        scriptLoadedRef.current = true;
        initWidget();
      } else {
        // If script exists but TV not ready, wait for it (simple polling or event listener)
        const checkTv = setInterval(() => {
          if ((window as any).TradingView) {
            clearInterval(checkTv);
            scriptLoadedRef.current = true;
            initWidget();
          }
        }, 100);
      }
    }

    function initWidget() {
      if (!containerRef.current || !(window as any).TradingView) return;

      // Clear container to be safe, though widget overwrites usually
      containerRef.current.innerHTML = "";

      widgetRef.current = new (window as any).TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: tvInterval,
        timezone: "Etc/UTC",
        theme: theme,
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: containerRef.current.id,
        studies: [
          "MASimple@tv-basicstudies",
          "RSI@tv-basicstudies"
        ],
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        hide_side_toolbar: false,
      });
    }

    // Re-init on prop change if script already loaded
    if (scriptLoadedRef.current) {
      initWidget();
    }

  }, [symbol, tvInterval, theme]);

  return (
    <div className="w-full h-full min-h-[400px] bg-white rounded-lg overflow-hidden border border-slate-200">
      <div
        ref={containerRef}
        id={`tradingview_${Math.random().toString(36).substring(7)}`}
        className="w-full h-full"
      />
    </div>
  );
}