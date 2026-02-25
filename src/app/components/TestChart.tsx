import { useEffect, useRef } from "react";

export function TestChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("🧪 TEST CHART - Starting...");
    console.log("🧪 TradingView available?", !!(window as any).TradingView);
    console.log("🧪 Container?", !!containerRef.current);

    if (!containerRef.current) {
      console.log("❌ No container!");
      return;
    }

    if (!(window as any).TradingView) {
      console.log("❌ No TradingView!");
      return;
    }

    console.log("✅ Creating test widget...");

    const widget = new (window as any).TradingView.widget({
      autosize: true,
      symbol: "BINANCE:BTCUSDT",
      interval: "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#0f172a",
      enable_publishing: false,
      container_id: containerRef.current.id,
    });

    console.log("✅ Test widget created:", widget);

    return () => {
      if (widget && typeof widget.remove === "function") {
        widget.remove();
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0f172a" }}>
      <h1 style={{ color: "white", padding: "20px" }}>TEST CHART - Check Console (F12)</h1>
      <div
        ref={containerRef}
        id="test-chart-container"
        style={{ width: "100%", height: "calc(100vh - 60px)" }}
      />
    </div>
  );
}

// ✅ Default export for lazy loading
export default TestChart;