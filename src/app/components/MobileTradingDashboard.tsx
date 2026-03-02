import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronDown,
  Search,
  Settings,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Home,
  Menu as MenuIcon,
  Plus,
  Minus,
  LogOut,
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
  change: number;
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
  { symbol: "BTCUSDT", tradingViewSymbol: "BINANCE:BTCUSDT", name: "Bitcoin", category: "Crypto", change: 0 },
  { symbol: "ETHUSDT", tradingViewSymbol: "BINANCE:ETHUSDT", name: "Ethereum", category: "Crypto", change: 0 },
  { symbol: "BNBUSDT", tradingViewSymbol: "BINANCE:BNBUSDT", name: "Binance Coin", category: "Crypto", change: 0 },
  { symbol: "SOLUSDT", tradingViewSymbol: "BINANCE:SOLUSDT", name: "Solana", category: "Crypto", change: 0 },
  { symbol: "XRPUSDT", tradingViewSymbol: "BINANCE:XRPUSDT", name: "Ripple", category: "Crypto", change: 0 },
  { symbol: "GOLD", tradingViewSymbol: "TVC:GOLD", name: "Gold", category: "Commodity", change: 0 },
  { symbol: "SILVER", tradingViewSymbol: "TVC:SILVER", name: "Silver", category: "Commodity", change: 0 },
  { symbol: "USOIL", tradingViewSymbol: "TVC:USOIL", name: "Crude Oil", category: "Commodity", change: 0 },
];

const TIMEFRAMES = ["1m", "30m", "1h"];
const DURATIONS = [
  { label: "1m", seconds: 60 },
  { label: "5m", seconds: 300 },
  { label: "15m", seconds: 900 },
  { label: "30m", seconds: 1800 },
  { label: "1h", seconds: 3600 },
];

export default function MobileTradingDashboard() {
  const navigate = useNavigate();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<any>(null);

  // User & Auth
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [accountType, setAccountType] = useState<"demo" | "real">("demo");

  // Trading State
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  const [tradeAmount, setTradeAmount] = useState(10);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [ohlcData, setOhlcData] = useState({ o: 0, h: 0, l: 0, c: 0 });

  // Positions
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);

  // UI State
  const [activeNavTab, setActiveNavTab] = useState<"trading" | "portfolio" | "markets" | "dashboard" | "menu">("trading");
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time price from Binance
  const binancePrice = useBinancePrice(selectedAsset.symbol);
  const { prices: commodityPrices } = usePrices();

  // Update current price
  useEffect(() => {
    if (selectedAsset.category === "Crypto" && binancePrice) {
      setCurrentPrice(binancePrice);
      setOhlcData({
        o: binancePrice * 0.999,
        h: binancePrice * 1.001,
        l: binancePrice * 0.998,
        c: binancePrice,
      });
    } else if (selectedAsset.category === "Commodity") {
      const price = commodityPrices[selectedAsset.symbol];
      if (price) {
        setCurrentPrice(price);
        setOhlcData({
          o: price * 0.999,
          h: price * 1.001,
          l: price * 0.998,
          c: price,
        });
      }
    }
  }, [binancePrice, commodityPrices, selectedAsset]);

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        setAccessToken(token);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        navigate("/login");
      }
    };

    loadUserProfile();
  }, [navigate]);

  // Load positions
  useEffect(() => {
    const loadPositions = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trades/list?account_type=${accountType}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const open = data.filter((p: Position) => p.status === "open");
          const closed = data.filter((p: Position) => p.status !== "open");
          setPositions(open);
          setClosedPositions(closed);
        }
      } catch (error) {
        console.error("Error loading positions:", error);
      }
    };

    loadPositions();
    const interval = setInterval(loadPositions, 2000);
    return () => clearInterval(interval);
  }, [accessToken, accountType]);

  // Initialize TradingView Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView && chartContainerRef.current) {
        tvWidgetRef.current = new window.TradingView.widget({
          container: chartContainerRef.current,
          width: "100%",
          height: 400,
          symbol: selectedAsset.tradingViewSymbol,
          interval: selectedTimeframe,
          timezone: "Asia/Jakarta",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#000000",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          backgroundColor: "#000000",
          gridColor: "#1a1a1a",
          studies: [],
          disabled_features: [
            "use_localstorage_for_settings",
            "header_widget",
            "timeframes_toolbar",
          ],
          enabled_features: ["study_templates"],
          overrides: {
            "paneProperties.background": "#000000",
            "paneProperties.backgroundType": "solid",
            "mainSeriesProperties.candleStyle.upColor": "#26a69a",
            "mainSeriesProperties.candleStyle.downColor": "#ef5350",
            "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
            "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
          },
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [selectedAsset, selectedTimeframe]);

  // Execute Trade
  const executeTrade = async (direction: "SELL" | "BUY") => {
    if (!userProfile || !currentPrice) return;

    const balance = accountType === "demo" ? userProfile.demo_balance : userProfile.real_balance;
    if (balance < tradeAmount) {
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
            amount: tradeAmount,
            entry_price: currentPrice,
            duration: selectedDuration.seconds,
            account_type: accountType,
          }),
        }
      );

      if (response.ok) {
        // Refresh profile and positions
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

        // Show success feedback
        const message = direction === "BUY" ? "✅ BUY order placed!" : "✅ SELL order placed!";
        alert(message);
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const currentBalance = userProfile
    ? accountType === "demo"
      ? userProfile.demo_balance
      : userProfile.real_balance
    : 0;

  const priceChange = ((ohlcData.c - ohlcData.o) / ohlcData.o) * 100;
  const priceChangeAbs = Math.abs(ohlcData.c - ohlcData.o);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ========== TOP BAR ========== */}
      <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
            A
          </div>
          <div>
            <div className="text-xs text-gray-400">Akun demo</div>
            <div className="text-sm font-bold">${currentBalance.toFixed(2)}</div>
          </div>
        </div>
        <button
          onClick={() => navigate("/member-deposit")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Deposit
        </button>
      </div>

      {/* ========== SYMBOL BAR ========== */}
      <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800">
        <button
          onClick={() => setShowAssetDropdown(!showAssetDropdown)}
          className="flex items-center gap-2 text-white hover:bg-gray-900 px-3 py-2 rounded"
        >
          <span className="font-bold">{selectedAsset.name}</span>
          <span className="text-green-500 text-sm font-bold">
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)}%
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-900 rounded">
            <Search className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-900 rounded">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <div className="text-sm font-medium bg-gray-800 px-3 py-1 rounded">
            {selectedTimeframe}
          </div>
        </div>
      </div>

      {/* ========== CHART TOOLBAR ========== */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black border-b border-gray-800 overflow-x-auto">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${
              selectedTimeframe === tf
                ? "bg-gray-800 text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {tf}
          </button>
        ))}
        <div className="border-l border-gray-700 h-6 mx-2" />
        <button className="p-1 hover:bg-gray-900 rounded">
          <BarChart3 className="w-4 h-4 text-gray-400" />
        </button>
        <button className="p-1 hover:bg-gray-900 rounded">
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </button>
        <button className="p-1 hover:bg-gray-900 rounded">
          <Clock className="w-4 h-4 text-gray-400" />
        </button>
        <button className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded">
          Indicators
        </button>
      </div>

      {/* ========== SYMBOL INFO ========== */}
      <div className="px-4 py-2 bg-black border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-orange-500">●</span>
            <span>
              {selectedAsset.name} / Tether/US - 1 - Binance
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span>
              O:{" "}
              <span className="text-green-500">{ohlcData.o.toFixed(2)}</span>
            </span>
            <span>
              H:{" "}
              <span className="text-green-500">{ohlcData.h.toFixed(2)}</span>
            </span>
            <span>
              L:{" "}
              <span className="text-red-500">{ohlcData.l.toFixed(2)}</span>
            </span>
            <span>
              C:{" "}
              <span className="text-red-500">{ohlcData.c.toFixed(2)}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-lg font-bold mt-1">
          <span>{currentPrice.toFixed(2)}</span>
          <span className={priceChange >= 0 ? "text-green-500" : "text-red-500"}>
            {priceChange >= 0 ? "+" : ""}
            {priceChangeAbs.toFixed(4)} ({priceChange.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* ========== CHART ========== */}
      <div className="flex-1 bg-black">
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* ========== TRADING PANEL ========== */}
      <div className="bg-black border-t border-gray-800 p-4 space-y-4">
        {/* Duration & Amount */}
        <div className="flex gap-4">
          {/* Duration */}
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Waktunya</label>
            <button
              onClick={() => setShowDurationDropdown(!showDurationDropdown)}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded flex items-center justify-between"
            >
              <span className="font-medium">{selectedDuration.label}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Amount */}
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Jumlah</label>
            <div className="bg-gray-900 rounded p-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setTradeAmount(Math.max(10, tradeAmount - 10))}
                  className="text-gray-400 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold">${tradeAmount}</span>
                <button
                  onClick={() => setTradeAmount(tradeAmount + 10)}
                  className="text-gray-400 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Amount Slider */}
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value))}
                className="w-full mt-2 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SELL / BUY Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => executeTrade("SELL")}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white font-bold py-4 rounded-lg flex flex-col items-center justify-center gap-1"
          >
            <TrendingDown className="w-5 h-5" />
            <span>SELL</span>
          </button>
          <button
            onClick={() => executeTrade("BUY")}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:opacity-50 text-white font-bold py-4 rounded-lg flex flex-col items-center justify-center gap-1"
          >
            <TrendingUp className="w-5 h-5" />
            <span>BUY</span>
          </button>
        </div>
      </div>

      {/* ========== BOTTOM NAVIGATION ========== */}
      <div className="bg-black border-t border-gray-800 py-2 px-4">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveNavTab("trading")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded ${
              activeNavTab === "trading" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-medium">Trading</span>
          </button>
          <button
            onClick={() => setActiveNavTab("portfolio")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded ${
              activeNavTab === "portfolio" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <PieChart className="w-5 h-5" />
            <span className="text-xs font-medium">Portofolio</span>
          </button>
          <button
            onClick={() => navigate("/markets")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded ${
              activeNavTab === "markets" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-medium">Markets</span>
          </button>
          <button
            onClick={() => setActiveNavTab("dashboard")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded ${
              activeNavTab === "dashboard" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Dasbor</span>
          </button>
          <button
            onClick={() => setActiveNavTab("menu")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded ${
              activeNavTab === "menu" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <MenuIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* ========== ASSET DROPDOWN ========== */}
      {showAssetDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-end">
          <div className="bg-gray-900 rounded-t-2xl w-full max-h-[70vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Select Asset</h3>
              <button
                onClick={() => setShowAssetDropdown(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-2">
              {ASSETS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setShowAssetDropdown(false);
                  }}
                  className={`w-full p-3 rounded-lg flex items-center justify-between ${
                    selectedAsset.symbol === asset.symbol
                      ? "bg-blue-600"
                      : "bg-gray-800 hover:bg-gray-700"
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

      {/* ========== DURATION DROPDOWN ========== */}
      {showDurationDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-end">
          <div className="bg-gray-900 rounded-t-2xl w-full">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Select Duration</h3>
              <button
                onClick={() => setShowDurationDropdown(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration.label}
                  onClick={() => {
                    setSelectedDuration(duration);
                    setShowDurationDropdown(false);
                  }}
                  className={`p-3 rounded-lg font-medium ${
                    selectedDuration.label === duration.label
                      ? "bg-blue-600"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== MENU MODAL ========== */}
      {activeNavTab === "menu" && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-end">
          <div className="bg-gray-900 rounded-t-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Menu</h3>
              <button
                onClick={() => setActiveNavTab("trading")}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <button
              onClick={() => {
                setAccountType(accountType === "demo" ? "real" : "demo");
                setActiveNavTab("trading");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
            >
              Switch to {accountType === "demo" ? "Real" : "Demo"} Account
            </button>

            <button
              onClick={() => navigate("/member-deposit")}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg"
            >
              Deposit / Withdraw
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
