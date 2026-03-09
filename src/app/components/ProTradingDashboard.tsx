import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronDown,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Gift,
  Bot,
  MessageCircle,
  User,
} from "lucide-react";
import { useBinancePrice } from "../hooks/useBinancePrice";
import { usePrices } from "../context/PriceContext";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

// TradingView Widget
declare global {
  interface Window {
    TradingView: any;
  }
}

interface Asset {
  symbol: string;
  tradingViewSymbol: string;
  name: string;
  category: string;
}

interface Position {
  id: string;
  asset: string;
  type: "SELL" | "BUY";
  amount: number;
  entryPrice: number;
  entryTime: number;
  expiresAt: number;
  duration: number;
  status: "open" | "won" | "lost";
  exitPrice?: number;
  profit?: number;
}

interface UserProfile {
  email: string;
  demo_balance: number;
  real_balance: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
}

const ASSETS: Asset[] = [
  { symbol: "BTCUSDT", tradingViewSymbol: "BINANCE:BTCUSDT", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETHUSDT", tradingViewSymbol: "BINANCE:ETHUSDT", name: "Ethereum", category: "Crypto" },
  { symbol: "BNBUSDT", tradingViewSymbol: "BINANCE:BNBUSDT", name: "Binance Coin", category: "Crypto" },
  { symbol: "SOLUSDT", tradingViewSymbol: "BINANCE:SOLUSDT", name: "Solana", category: "Crypto" },
  { symbol: "XRPUSDT", tradingViewSymbol: "BINANCE:XRPUSDT", name: "Ripple", category: "Crypto" },
  { symbol: "GOLD", tradingViewSymbol: "TVC:GOLD", name: "Gold", category: "Commodity" },
  { symbol: "SILVER", tradingViewSymbol: "TVC:SILVER", name: "Silver", category: "Commodity" },
  { symbol: "USOIL", tradingViewSymbol: "TVC:USOIL", name: "Crude Oil", category: "Commodity" },
];

const DURATIONS = [
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "2m", seconds: 120 },
  { label: "5m", seconds: 300 },
  { label: "15m", seconds: 900 },
];

const AMOUNTS = [10, 25, 50, 100, 250, 500, 1000];

export default function ProTradingDashboard() {
  const navigate = useNavigate();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);

  // User & Auth
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [accountType, setAccountType] = useState<"demo" | "real">("demo");

  // Trading State
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1");
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1]); // 1m default
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // UI State
  const [activeNavTab, setActiveNavTab] = useState("platform");
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time price from Binance
  const binancePrice = useBinancePrice(selectedAsset.symbol);
  const { prices: commodityPrices } = usePrices();

  // Update current price
  useEffect(() => {
    if (selectedAsset.category === "Crypto" && binancePrice) {
      setCurrentPrice(Number(binancePrice) || 0);
    } else if (selectedAsset.category === "Commodity") {
      const price = commodityPrices[selectedAsset.symbol];
      if (price) {
        setCurrentPrice(Number(price) || 0);
      }
    }
  }, [binancePrice, commodityPrices, selectedAsset]);

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // ✅ Try multiple localStorage keys for backwards compatibility
        const token = 
          localStorage.getItem("access_token") || 
          localStorage.getItem("accessToken") || 
          localStorage.getItem("investoft_access_token") ||
          localStorage.getItem("investoft_token");
          
        if (!token) {
          console.error("❌ No access token found in localStorage");
          console.log("📋 Available keys:", Object.keys(localStorage));
          navigate("/login");
          return;
        }

        console.log("✅ Access token found:", token.substring(0, 20) + "...");
        setAccessToken(token);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("✅ User profile loaded:", data);
          setUserProfile(data);
        } else {
          console.error("❌ Failed to load profile, status:", response.status);
          const errorText = await response.text();
          console.error("❌ Error response:", errorText);
          navigate("/login");
        }
      } catch (error) {
        console.error("❌ Error loading profile:", error);
        navigate("/login");
      }
    };

    loadUserProfile();
  }, [navigate]);

  // Ensure chart container is ready
  useEffect(() => {
    // Wait for next frame to ensure ref is attached
    requestAnimationFrame(() => {
      if (chartContainerRef.current && document.body.contains(chartContainerRef.current)) {
        console.log("✅ Chart container is ready in DOM");
      }
    });
  }, []);

  // Initialize TradingView Chart
  useEffect(() => {
    // Wait a bit to ensure container is fully ready
    const timer = setTimeout(() => {
      if (!chartContainerRef.current) {
        console.warn("Chart container ref is null");
        return;
      }

      if (!document.body.contains(chartContainerRef.current)) {
        console.warn("Chart container not in DOM yet");
        return;
      }

      console.log("✅ Starting TradingView initialization...");

      // Clean up previous widget if exists
      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.remove();
        } catch (e) {
          console.warn("Error removing previous TradingView widget:", e);
        }
        tvWidgetRef.current = null;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      
      const initWidget = () => {
        // Double check container is still mounted
        if (!chartContainerRef.current) {
          console.warn("Chart container not available for TradingView widget");
          return;
        }

        // Verify container is in DOM
        if (!document.body.contains(chartContainerRef.current)) {
          console.warn("Chart container not in DOM yet");
          return;
        }

        if (!window.TradingView) {
          console.warn("TradingView library not loaded yet");
          return;
        }

        try {
          // Clear container first
          if (chartContainerRef.current) {
            chartContainerRef.current.innerHTML = '';
          }

          tvWidgetRef.current = new window.TradingView.widget({
            container: chartContainerRef.current,
            width: "100%",
            height: "100%",
            symbol: selectedAsset.tradingViewSymbol,
            interval: selectedTimeframe,
            timezone: "Asia/Jakarta",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#0B0F1A",
            enable_publishing: false,
            hide_top_toolbar: true,
            hide_legend: true,
            save_image: false,
            backgroundColor: "#0B0F1A",
            gridColor: "#1a1f2e",
            studies: [],
            disabled_features: [
              "use_localstorage_for_settings",
              "header_widget",
              "timeframes_toolbar",
              "volume_force_overlay",
              "left_toolbar",
              "control_bar",
              "border_around_the_chart",
            ],
            enabled_features: ["hide_left_toolbar_by_default"],
            overrides: {
              "paneProperties.background": "#0B0F1A",
              "paneProperties.backgroundType": "solid",
              "paneProperties.vertGridProperties.color": "#1a1f2e",
              "paneProperties.horzGridProperties.color": "#1a1f2e",
              "mainSeriesProperties.candleStyle.upColor": "#1FA24A",
              "mainSeriesProperties.candleStyle.downColor": "#E53935",
              "mainSeriesProperties.candleStyle.borderUpColor": "#1FA24A",
              "mainSeriesProperties.candleStyle.borderDownColor": "#E53935",
              "mainSeriesProperties.candleStyle.wickUpColor": "#1FA24A",
              "mainSeriesProperties.candleStyle.wickDownColor": "#E53935",
            },
          });
          
          console.log("✅ TradingView widget initialized successfully");
          setChartReady(true);
        } catch (error) {
          console.error("Error initializing TradingView widget:", error);
        }
      };

      if (existingScript && window.TradingView) {
        // Script already loaded, init with small delay to ensure DOM is ready
        setTimeout(initWidget, 100);
      } else if (!existingScript) {
        // Load script first
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
          // Wait a bit for library to be fully ready
          setTimeout(initWidget, 200);
        };
        script.onerror = () => {
          console.error("Failed to load TradingView script");
        };
        document.head.appendChild(script);
      }

      return () => {
        if (tvWidgetRef.current) {
          try {
            tvWidgetRef.current.remove();
          } catch (e) {
            console.warn("Error removing TradingView widget on cleanup:", e);
          }
          tvWidgetRef.current = null;
        }
      };
    }, 500); // Wait 500ms to ensure container is fully ready

    return () => clearTimeout(timer);
  }, [selectedAsset, selectedTimeframe]);

  // Execute Trade
  const executeTrade = async (direction: "SELL" | "BUY") => {
    if (!userProfile || !currentPrice) return;

    const balance = accountType === "demo" ? userProfile.demo_balance : userProfile.real_balance;
    if (balance < selectedAmount) {
      alert("Insufficient balance!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trades/open`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            asset: selectedAsset.symbol,
            type: direction,
            amount: selectedAmount,
            entry_price: currentPrice,
            duration: selectedDuration.seconds,
            account_type: accountType,
          }),
        }
      );

      if (response.ok) {
        // Refresh profile
        const profileResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/user/profile`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          setUserProfile(data);
        }
      } else {
        const error = await response.json();
        alert(`Trade failed: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Trade error:", error);
      alert("Failed to execute trade. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentBalance = userProfile
    ? accountType === "demo"
      ? userProfile.demo_balance
      : userProfile.real_balance
    : 0;

  const priceChange = -2.34; // Mock percentage change
  
  // Safe price display with fallbacks
  const safeCurrentPrice = Number(currentPrice) || 0;
  const safeBalance = Number(currentBalance) || 0;

  const handleDurationPrev = () => {
    const currentIndex = DURATIONS.findIndex((d) => d.label === selectedDuration.label);
    if (currentIndex > 0) {
      setSelectedDuration(DURATIONS[currentIndex - 1]);
    }
  };

  const handleDurationNext = () => {
    const currentIndex = DURATIONS.findIndex((d) => d.label === selectedDuration.label);
    if (currentIndex < DURATIONS.length - 1) {
      setSelectedDuration(DURATIONS[currentIndex + 1]);
    }
  };

  const handleAmountPrev = () => {
    const currentIndex = AMOUNTS.findIndex((a) => a === selectedAmount);
    if (currentIndex > 0) {
      setSelectedAmount(AMOUNTS[currentIndex - 1]);
    }
  };

  const handleAmountNext = () => {
    const currentIndex = AMOUNTS.findIndex((a) => a === selectedAmount);
    if (currentIndex < AMOUNTS.length - 1) {
      setSelectedAmount(AMOUNTS[currentIndex + 1]);
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: "#0B0F1A" }}>
      {/* ========== TOP NAVIGATION BAR (64px) ========== */}
      <div
        className="flex items-center justify-between px-6"
        style={{ height: "64px", backgroundColor: "#0B0F1A" }}
      >
        {/* LEFT: Account Info */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-gray-500">Akun demo</div>
            <div className="text-lg font-bold text-white">
              ${safeBalance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* CENTER: Asset Selector & Live Price */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowAssetDropdown(!showAssetDropdown)}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <span className="font-bold text-lg">{selectedAsset.name}</span>
            <span className="text-green-500 font-medium">95%</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              {safeCurrentPrice.toFixed(2)}
            </span>
            <span className="text-red-500 font-medium">
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* RIGHT: Deposit Button & Timeframe */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/member-deposit")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Deposit
          </button>
          <div className="bg-gray-800 text-white px-4 py-1 rounded-full text-sm font-medium">
            1m
          </div>
        </div>
      </div>

      {/* ========== MAIN CHART AREA (Full Height) ========== */}
      <div className="flex-1 relative" style={{ backgroundColor: "#0B0F1A" }}>
        <div ref={chartContainerRef} className="absolute inset-0" />
      </div>

      {/* ========== BOTTOM TRADING CONTROL BAR (120px, STICKY) ========== */}
      <div
        className="flex flex-col"
        style={{ height: "120px", backgroundColor: "#0B0F1A", borderTop: "1px solid #1a1f2e" }}
      >
        {/* Top Section: Time & Amount Selectors */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* LEFT: Time Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDurationPrev}
              className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={DURATIONS.findIndex((d) => d.label === selectedDuration.label) === 0}
            >
              <Minus className="w-5 h-5 text-white" />
            </button>
            <div className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium min-w-[80px] text-center">
              {selectedDuration.label}
            </div>
            <button
              onClick={handleDurationNext}
              className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={
                DURATIONS.findIndex((d) => d.label === selectedDuration.label) ===
                DURATIONS.length - 1
              }
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* RIGHT: Amount Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAmountPrev}
              className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={AMOUNTS.findIndex((a) => a === selectedAmount) === 0}
            >
              <Minus className="w-5 h-5 text-white" />
            </button>
            <div className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium min-w-[100px] text-center">
              ${selectedAmount}
            </div>
            <button
              onClick={handleAmountNext}
              className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={AMOUNTS.findIndex((a) => a === selectedAmount) === AMOUNTS.length - 1}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Bottom Section: SELL & BUY Buttons (No gap, 50% each) */}
        <div className="flex" style={{ height: "56px" }}>
          <button
            onClick={() => executeTrade("SELL")}
            disabled={isLoading}
            className="flex-1 text-white font-bold text-lg uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "#E53935",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "0",
            }}
          >
            <TrendingDown className="w-6 h-6" />
            SELL
          </button>
          <button
            onClick={() => executeTrade("BUY")}
            disabled={isLoading}
            className="flex-1 text-white font-bold text-lg uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "#1FA24A",
              borderTopLeftRadius: "0",
              borderTopRightRadius: "8px",
            }}
          >
            <TrendingUp className="w-6 h-6" />
            BUY
          </button>
        </div>
      </div>

      {/* ========== BOTTOM NAVIGATION (70px) ========== */}
      <div
        className="flex items-center justify-around px-4"
        style={{ height: "70px", backgroundColor: "#0B0F1A", borderTop: "1px solid #1a1f2e" }}
      >
        <button
          onClick={() => setActiveNavTab("platform")}
          className={`flex flex-col items-center gap-1 ${
            activeNavTab === "platform" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs">Platform</span>
        </button>
        <button
          onClick={() => setActiveNavTab("penawaran")}
          className={`flex flex-col items-center gap-1 ${
            activeNavTab === "penawaran" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <Gift className="w-6 h-6" />
          <span className="text-xs">Penawaran</span>
        </button>
        <button
          onClick={() => setActiveNavTab("robot")}
          className={`flex flex-col items-center gap-1 ${
            activeNavTab === "robot" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <Bot className="w-6 h-6" />
          <span className="text-xs">Robot</span>
        </button>
        <button
          onClick={() => setActiveNavTab("dukungan")}
          className={`flex flex-col items-center gap-1 ${
            activeNavTab === "dukungan" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Dukungan</span>
        </button>
        <button
          onClick={() => setActiveNavTab("akun")}
          className={`flex flex-col items-center gap-1 ${
            activeNavTab === "akun" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Akun</span>
        </button>
      </div>

      {/* ========== ASSET DROPDOWN MODAL ========== */}
      {showAssetDropdown && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setShowAssetDropdown(false)}
        >
          <div
            className="rounded-xl p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: "#1a1f2e" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Select Asset</h3>
            <div className="space-y-2">
              {ASSETS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setShowAssetDropdown(false);
                  }}
                  className={`w-full p-4 rounded-lg flex items-center justify-between transition-colors ${
                    selectedAsset.symbol === asset.symbol
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-sm text-gray-400">{asset.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}