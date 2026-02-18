import { useEffect, useRef, useState } from "react";

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
  const [scriptStatus, setScriptStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
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
    
    // ✅ Define initWidget first
    function initWidget() {
      if (isCleaningUpRef.current) return;
      if (!containerRef.current || !(window as any).TradingView) return;

      // Safely clear container
      try {
        if (containerRef.current && containerRef.current.parentNode) {
          containerRef.current.innerHTML = "";
        }
      } catch (error) {
        // Silent fail
      }

      setScriptStatus('ready');

      // ✅ ULTRA-FAST TRADINGVIEW WIDGET - NO LOADING SCREEN!
      widgetRef.current = new (window as any).TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: tvInterval,
        timezone: "Etc/UTC",
        theme: theme,
        style: "1",
        locale: "en",
        toolbar_bg: theme === "dark" ? "#0f172a" : "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: containerRef.current.id,
        
        studies: [],
        
        show_popup_button: false,
        hide_side_toolbar: false,
        withdateranges: true,
        hide_top_toolbar: false,
        
        // ✅ ENABLE ALL TOOLBAR FEATURES - Show drawing tools, indicators, timeframes, etc
        disabled_features: [
          "widget_logo",
          "countdown",
        ],
        
        enabled_features: [
          "side_toolbar_in_fullscreen_mode",
        ],
        
        loading_screen: { 
          backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
          foregroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
        },
        
        overrides: {
          "mainSeriesProperties.showCountdown": false,
          "paneProperties.background": theme === "dark" ? "#0f172a" : "#ffffff",
          "paneProperties.backgroundType": "solid",
        },
        
        visible_range: {
          from: Date.now() / 1000 - (30 * 24 * 60 * 60),
          to: Date.now() / 1000,
        },
      });

      // ✅ MONITOR PRICE UPDATES FROM TRADINGVIEW CHART
      if (onPriceUpdate) {
        try {
          widgetRef.current.onChartReady(() => {
            console.log(`📊 [TradingChart] Chart ready for ${symbol}, setting up price monitoring...`);
            
            // ✅ CONTINUOUS PRICE MONITORING - Poll every 2 seconds
            const priceMonitorInterval = setInterval(() => {
              try {
                if (widgetRef.current && widgetRef.current.activeChart) {
                  widgetRef.current.activeChart().exportData({ includeTime: true, includeSeries: true }, (data: any) => {
                    if (data && data.data && data.data.length > 0) {
                      // Get the last bar (most recent price)
                      const lastBar = data.data[data.data.length - 1];
                      if (lastBar && lastBar.close !== undefined) {
                        const price = parseFloat(lastBar.close);
                        if (price > 0) {
                          console.log(`💰 [TradingChart] Live price from chart: ${symbol} = $${price.toFixed(2)}`);
                          onPriceUpdate(price);
                        }
                      }
                    }
                  });
                }
              } catch (error) {
                console.warn(`⚠️ [TradingChart] Error polling price:`, error);
              }
            }, 2000); // Poll every 2 seconds

            // Store interval ref for cleanup
            (widgetRef.current as any).__priceMonitorInterval = priceMonitorInterval;

            // Try to get initial price immediately
            try {
              setTimeout(() => {
                if (widgetRef.current && widgetRef.current.activeChart) {
                  widgetRef.current.activeChart().exportData({ includeTime: true, includeSeries: true }, (data: any) => {
                    if (data && data.data && data.data.length > 0) {
                      const lastBar = data.data[data.data.length - 1];
                      if (lastBar && lastBar.close !== undefined) {
                        const price = parseFloat(lastBar.close);
                        if (price > 0) {
                          console.log(`💰 [TradingChart] Initial price from chart: ${symbol} = $${price.toFixed(2)}`);
                          onPriceUpdate(price);
                        }
                      }
                    }
                  });
                }
              }, 1000); // Wait 1 second for chart to fully load
            } catch (error) {
              console.warn(`⚠️ [TradingChart] Error getting initial price:`, error);
            }
          });
        } catch (error) {
          console.warn(`⚠️ [TradingChart] Error setting up price monitoring:`, error);
        }
      }
    }
    
    // ✅ IMPROVED LOADING STRATEGY
    const initWithRetry = () => {
      if ((window as any).TradingView) {
        scriptLoadedRef.current = true;
        setTimeout(() => initWidget(), 0);
        return true;
      }
      return false;
    };
    
    // Try immediate init first
    if (initWithRetry()) {
      // Success! Script was already loaded
      // Return cleanup function
      return () => {
        isCleaningUpRef.current = true;
        
        if (widgetRef.current) {
          try {
            // ✅ Clear price monitor interval
            if ((widgetRef.current as any).__priceMonitorInterval) {
              clearInterval((widgetRef.current as any).__priceMonitorInterval);
            }
            
            if (typeof widgetRef.current.remove === 'function') {
              widgetRef.current.remove();
            }
          } catch (error) {
            // Silent
          }
          widgetRef.current = null;
        }
        
        if (containerRef.current && containerRef.current.parentNode) {
          try {
            containerRef.current.innerHTML = "";
          } catch (error) {
            // Silent
          }
        }
      };
    }
    
    // Fallback: Check periodically with aggressive retry
    let attempts = 0;
    const maxAttempts = 500; // 500 * 10ms = 5 seconds max
    
    const checkTv = setInterval(() => {
      attempts++;
      
      if (initWithRetry()) {
        clearInterval(checkTv);
        // Only log in development
        if (import.meta.env.DEV) {
          console.log("✅ TradingView ready after", attempts * 10, "ms");
        }
        return;
      }
      
      // After 2 seconds, try fallback load
      if (attempts === 200 && !document.getElementById("tv-widget-script-fallback")) {
        if (import.meta.env.DEV) {
          console.log("🔄 Loading TradingView fallback script...");
        }
        const script = document.createElement("script");
        script.id = "tv-widget-script-fallback";
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
          if (import.meta.env.DEV) {
            console.log("✅ Fallback script loaded!");
          }
          scriptLoadedRef.current = true;
          if (initWithRetry()) {
            clearInterval(checkTv);
          }
        };
        script.onerror = () => {
          if (import.meta.env.DEV) {
            console.error("❌ Failed to load TradingView script");
          }
          setScriptStatus('error');
        };
        document.head.appendChild(script);
      }
      
      // Give up after 5 seconds
      if (attempts >= maxAttempts) {
        clearInterval(checkTv);
        if (import.meta.env.DEV) {
          console.error("❌ TradingView script timeout");
        }
        setScriptStatus('error');
      }
    }, 10);
    
    // Return cleanup
    return () => {
      clearInterval(checkTv);
      isCleaningUpRef.current = true;
      
      if (widgetRef.current) {
        try {
          // ✅ Clear price monitor interval
          if ((widgetRef.current as any).__priceMonitorInterval) {
            clearInterval((widgetRef.current as any).__priceMonitorInterval);
          }
          
          if (typeof widgetRef.current.remove === 'function') {
            widgetRef.current.remove();
          }
        } catch (error) {
          // Silent
        }
        widgetRef.current = null;
      }
      
      if (containerRef.current && containerRef.current.parentNode) {
        try {
          containerRef.current.innerHTML = "";
        } catch (error) {
          // Silent
        }
      }
    };
  }, [symbol, tvInterval, theme]);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {scriptStatus === 'error' && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme === "dark" ? "#0f172a" : "#ffffff",
          color: theme === "dark" ? "#94a3b8" : "#64748b",
          fontSize: "14px",
        }}>
          Chart loading failed. Please refresh the page.
        </div>
      )}
      <div 
        ref={containerRef} 
        id={containerIdRef.current} 
        style={{ height: "100%", width: "100%", opacity: scriptStatus === 'error' ? 0 : 1 }} 
      />
    </div>
  );
}