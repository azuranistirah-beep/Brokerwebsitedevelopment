import { useEffect, useRef } from "react";
import { realTimeWebSocket } from "../lib/realTimeWebSocket";

interface TradingChartProps {
  symbol: string;
  interval?: string;
  theme?: "light" | "dark";
  onPriceUpdate?: (price: number) => void;
  onSymbolChange?: (symbol: string) => void;
}

export function TradingChart({ symbol, interval = "D", theme = "light", onPriceUpdate, onSymbolChange }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const widgetRef = useRef<any>(null);
  const pricePollingIntervalRef = useRef<any>(null);
  const containerIdRef = useRef(`tradingview_${Math.random().toString(36).substring(7)}`);
  const onSymbolChangeRef = useRef(onSymbolChange);
  const onPriceUpdateRef = useRef(onPriceUpdate);

  // Update callback refs when they change
  useEffect(() => {
    onSymbolChangeRef.current = onSymbolChange;
  }, [onSymbolChange]);

  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  const mapInterval = (i: string) => {
    if (i.endsWith("m")) return i.replace("m", "");
    if (i.endsWith("h")) return (parseInt(i) * 60).toString();
    if (i === "1d") return "D";
    if (i.endsWith("s")) return "1"; 
    return i;
  };

  const tvInterval = mapInterval(interval);

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
        // If script exists but TV not ready, wait for it
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

      // Clear container
      containerRef.current.innerHTML = "";
      
      // Clear previous polling interval
      if (pricePollingIntervalRef.current) {
        clearInterval(pricePollingIntervalRef.current);
        pricePollingIntervalRef.current = null;
      }

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
        allow_symbol_change: false,
        container_id: containerRef.current.id,
        studies: [
          "MASimple@tv-basicstudies",
          "RSI@tv-basicstudies"
        ],
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        hide_side_toolbar: false,
        // ✅ Disable iframe access attempts to prevent CORS errors
        disabled_features: [
          "header_symbol_search",
          "symbol_search_hot_key"
        ],
        enabled_features: [
          "hide_left_toolbar_by_default"
        ],
        onChartReady: () => {
          console.log("✅ [TradingChart] Chart Ready for:", symbol);
          
          // ✅ Subscribe to realTimeWebSocket for REAL market price updates
          // Clean symbol: BINANCE:BTCUSDT -> BTCUSDT
          const cleanSymbol = symbol.replace('BINANCE:', '').replace('NASDAQ:', '').replace('NYSE:', '');
          console.log(`📊 [TradingChart] Subscribing to WebSocket for cleaned symbol: ${cleanSymbol} (original: ${symbol})`);
          
          const unsubscribe = realTimeWebSocket.subscribe(cleanSymbol, (price) => {
            console.log(`💰 [TradingChart] Price Update: ${cleanSymbol} = $${price.toFixed(2)}`);
            if (onPriceUpdateRef.current && price > 0) {
              onPriceUpdateRef.current(price);
            }
          });
          
          // Store unsubscribe function
          pricePollingIntervalRef.current = unsubscribe;
          
          console.log("✅ [TradingChart] Price updates connected via Binance WebSocket");
        }
      });
    }

    // Re-init on prop change if script already loaded
    if (scriptLoadedRef.current) {
      initWidget();
    }
    
    // Cleanup on unmount or symbol change
    return () => {
      if (pricePollingIntervalRef.current) {
        console.log("🛑 [TradingChart] Unsubscribing from price updates");
        // Call unsubscribe function if it exists
        if (typeof pricePollingIntervalRef.current === 'function') {
          pricePollingIntervalRef.current();
        } else {
          clearInterval(pricePollingIntervalRef.current);
        }
        pricePollingIntervalRef.current = null;
      }
    };

  }, [symbol, tvInterval, theme]);

  return (
    <div className="w-full h-full min-h-[400px] bg-white rounded-lg overflow-hidden border border-slate-200">
      <div
        ref={containerRef}
        id={containerIdRef.current}
        className="w-full h-full"
      />
    </div>
  );
}