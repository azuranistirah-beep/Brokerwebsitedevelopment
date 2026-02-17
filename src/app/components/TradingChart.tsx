import { useEffect, useRef } from "react";

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
  const containerIdRef = useRef(`tradingview_${Math.random().toString(36).substring(7)}`);
  const isCleaningUpRef = useRef(false);

  const mapInterval = (i: string) => {
    if (i.endsWith("m")) return i.replace("m", "");
    if (i.endsWith("h")) return (parseInt(i) * 60).toString();
    if (i === "1d") return "D";
    if (i.endsWith("s")) return "1"; 
    return i;
  };

  const tvInterval = mapInterval(interval);

  useEffect(() => {
    isCleaningUpRef.current = false;
    
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
        
        // Cleanup interval if component unmounts
        return () => clearInterval(checkTv);
      }
    }

    function initWidget() {
      if (isCleaningUpRef.current) return;
      if (!containerRef.current || !(window as any).TradingView) return;

      // Safely clear container
      try {
        if (containerRef.current && containerRef.current.parentNode) {
          containerRef.current.innerHTML = "";
        }
      } catch (error) {
        console.warn("⚠️ [TradingChart] Container clear error (safe to ignore):", error);
      }

      console.log(`🎨 [TradingChart] Initializing TradingView widget for ${symbol}`);

      // ✅ USE STANDARD TRADINGVIEW WIDGET (No custom datafeed)
      // TradingView will handle its own data from their servers
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
        disabled_features: [
          "header_symbol_search",
          "symbol_search_hot_key"
        ],
        enabled_features: [
          "hide_left_toolbar_by_default"
        ],
        onChartReady: () => {
          console.log("✅ [TradingChart] Chart Ready for:", symbol);
        }
      });
    }

    // Re-init on prop change if script already loaded
    if (scriptLoadedRef.current) {
      initWidget();
    }
    
    // Cleanup on unmount or symbol change
    return () => {
      isCleaningUpRef.current = true;
      console.log("🛑 [TradingChart] Cleanup");
      
      // Remove widget with better error handling
      if (widgetRef.current) {
        try {
          // Check if widget has remove method and iframe still exists
          if (typeof widgetRef.current.remove === 'function') {
            widgetRef.current.remove();
          }
        } catch (error) {
          // Silently handle cleanup errors as they don't affect functionality
          // These typically happen when the DOM is already cleaned up
        }
        widgetRef.current = null;
      }
      
      // Also clear the container if it still exists
      if (containerRef.current && containerRef.current.parentNode) {
        try {
          containerRef.current.innerHTML = "";
        } catch (error) {
          // Silently ignore
        }
      }
    };
  }, [symbol, tvInterval, theme]);

  return <div ref={containerRef} id={containerIdRef.current} style={{ height: "100%", width: "100%" }} />;
}