import { useEffect, useRef } from "react";

interface TickerTapeProps {
  colorTheme?: "light" | "dark";
}

export function TickerTape({ colorTheme = "light" }: TickerTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        {
          proName: "FOREXCOM:SPXUSD",
          title: "S&P 500"
        },
        {
          proName: "FOREXCOM:NSXUSD",
          title: "US 100"
        },
        {
          proName: "FX_IDC:EURUSD",
          title: "EUR/USD"
        },
        {
          proName: "BITSTAMP:BTCUSD",
          title: "Bitcoin"
        },
        {
          proName: "BITSTAMP:ETHUSD",
          title: "Ethereum"
        },
        {
          description: "Gold",
          proName: "OANDA:XAUUSD"
        },
        {
          description: "Crude Oil",
          proName: "TVC:USOIL"
        },
        {
          description: "Apple",
          proName: "NASDAQ:AAPL"
        },
        {
          description: "Tesla",
          proName: "NASDAQ:TSLA"
        },
        {
          description: "Microsoft",
          proName: "NASDAQ:MSFT"
        },
        {
          description: "NVIDIA",
          proName: "NASDAQ:NVDA"
        },
        {
          description: "Amazon",
          proName: "NASDAQ:AMZN"
        },
        {
          description: "Google",
          proName: "NASDAQ:GOOGL"
        },
        {
          description: "GBP/USD",
          proName: "FX_IDC:GBPUSD"
        },
        {
          description: "USD/JPY",
          proName: "FX_IDC:USDJPY"
        },
        {
          description: "Silver",
          proName: "OANDA:XAGUSD"
        }
      ],
      showSymbolLogo: true,
      colorTheme: colorTheme,
      isTransparent: false,
      displayMode: "adaptive",
      locale: "en"
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [colorTheme]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}