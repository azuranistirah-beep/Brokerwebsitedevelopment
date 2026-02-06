import { useEffect, useRef } from "react";
// ✅ v4.0-FINAL - Pure Simulation (Feb 6, 2026)
import { realTimePriceService } from "../lib/realTimePrice";

interface TradingChartProps {
  symbol: string;
  interval?: string;
  theme?: "light" | "dark";
  onPriceUpdate?: (price: number) => void;
  onSymbolChange?: (symbol: string) => void; // ✅ NEW: Track when user changes symbol in chart
}

export function TradingChart({ symbol, interval = "D", theme = "light", onPriceUpdate, onSymbolChange }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const widgetRef = useRef<any>(null);
  const symbolChangeListenerRef = useRef<any>(null);
  const containerIdRef = useRef(`tradingview_${Math.random().toString(36).substring(7)}`); // ✅ STABLE ID!
  const onSymbolChangeRef = useRef(onSymbolChange); // ✅ Stable ref untuk callback
  const onPriceUpdateRef = useRef(onPriceUpdate); // ✅ Stable ref untuk price callback

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

  // ✅ SUBSCRIBE TO REAL-TIME PRICES v4.0-FINAL
  useEffect(() => {
    if (!onPriceUpdateRef.current) return;

    console.log(`🔌 [TradingChart v4.0] Subscribing to ${symbol}...`);

    // Subscribe to price updates from simulation service
    const unsubscribe = realTimePriceService.subscribe(symbol, (price) => {
      if (onPriceUpdateRef.current) {
        onPriceUpdateRef.current(price);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log(`🔌 [TradingChart v4.0] Unsubscribing from ${symbol}...`);
      unsubscribe();
    };
  }, [symbol]); // ✅ ONLY symbol dependency!

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
      if (symbolChangeListenerRef.current) {
        clearInterval(symbolChangeListenerRef.current);
        symbolChangeListenerRef.current = null;
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
        allow_symbol_change: false, // ✅ DISABLE - User HARUS ganti via SymbolSelector!
        container_id: containerRef.current.id,
        studies: [
          "MASimple@tv-basicstudies",
          "RSI@tv-basicstudies"
        ],
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        hide_side_toolbar: false,
        onChartReady: () => {
          console.log("✅ TradingView Chart Ready for:", symbol);
          
          // ✅ CRITICAL: Polling to detect symbol changes (most reliable method!)
          if (widgetRef.current) {
            try {
              const chart = widgetRef.current.activeChart();
              if (chart) {
                console.log("✅ Chart instance obtained, starting symbol monitoring...");
                let lastSymbol = symbol;
                let pollCount = 0;
                
                const pollInterval = setInterval(() => {
                  try {
                    const currentSymbol = chart.symbol();
                    pollCount++;
                    
                    // Log every 10 polls to avoid spam
                    if (pollCount % 10 === 0) {
                      console.log(`🔍 [Poll #${pollCount}] Current symbol: "${currentSymbol}"`);
                    }
                    
                    if (currentSymbol && currentSymbol !== lastSymbol) {
                      console.log(`🔥🔥🔥 [SYMBOL CHANGED!] "${lastSymbol}" → "${currentSymbol}"`);
                      lastSymbol = currentSymbol;
                      
                      // Call callback if exists
                      if (onSymbolChangeRef.current) {
                        console.log("✅ Calling onSymbolChange callback with:", currentSymbol);
                        onSymbolChangeRef.current(currentSymbol);
                      } else {
                        console.warn("⚠️ onSymbolChange callback is NULL!");
                      }
                    }
                  } catch (e) {
                    console.error("❌ Error polling symbol:", e);
                  }
                }, 500); // Check every 500ms for faster response
                
                // Store interval ref for cleanup
                symbolChangeListenerRef.current = pollInterval;
                console.log("✅ Symbol change polling started (interval ID:", pollInterval, ")");
              } else {
                console.error("❌ Could not get chart instance!");
              }
            } catch (e) {
              console.error("❌ Error setting up symbol change detection:", e);
            }
          } else {
            console.error("❌ widgetRef.current is NULL!");
          }
        }
      });
    }

    // Re-init on prop change if script already loaded
    if (scriptLoadedRef.current) {
      initWidget();
    }
    
    // Cleanup polling interval on unmount or symbol change
    return () => {
      if (symbolChangeListenerRef.current) {
        console.log("🛑 Clearing symbol change polling");
        clearInterval(symbolChangeListenerRef.current);
        symbolChangeListenerRef.current = null;
      }
    };

  }, [symbol, tvInterval, theme]); // ✅ REMOVED onSymbolChange from deps!

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