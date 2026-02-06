import { useEffect, useRef, memo } from "react";

interface MiniChartProps {
  symbol: string;
  colorTheme?: "light" | "dark";
}

export const MiniChart = memo(({ symbol, colorTheme = "dark" }: MiniChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
});

MiniChart.displayName = "MiniChart";
