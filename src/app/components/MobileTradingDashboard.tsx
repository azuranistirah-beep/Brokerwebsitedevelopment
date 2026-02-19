import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ChevronDown, ArrowUp, ArrowDown, User, Search, 
  Settings, BarChart3, Award, Bot, HeadphonesIcon,
  UserCircle, Menu, Clock, Plus, Minus, X, TrendingUp, TrendingDown
} from "lucide-react";
import { TradingChart } from "./TradingChart";
import { usePrices } from "../context/PriceContext";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

// ✅ UPDATED: Duration options from 5 seconds to 1 day
const DURATIONS = [
  { value: 5, label: "5s" },
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 45, label: "45s" },
  { value: 60, label: "1m" },
  { value: 120, label: "2m" },
  { value: 180, label: "3m" },
  { value: 300, label: "5m" },
  { value: 600, label: "10m" },
  { value: 900, label: "15m" },
  { value: 1800, label: "30m" },
  { value: 3600, label: "1h" },
  { value: 7200, label: "2h" },
  { value: 14400, label: "4h" },
  { value: 28800, label: "8h" },
  { value: 43200, label: "12h" },
  { value: 86400, label: "1d" },
];

interface Asset {
  symbol: string;
  name: string;
  flag: string;
  percentage: string;
  tradingViewSymbol: string;
}

interface ActiveTrade {
  id: string;
  symbol: string;
  asset: string;
  direction: "UP" | "DOWN";
  amount: number;
  duration: number;
  entryPrice: number;
  targetPrice?: number;
  startTime: number;
  endTime: number;
  remainingSeconds: number;
  currentPrice: number;
  profit: number;
  status: "active" | "win" | "loss";
}

// Available assets
const ASSETS: Asset[] = [
  { symbol: "BTCUSD", name: "Bitcoin", flag: "₿", percentage: "+2.5%", tradingViewSymbol: "BINANCE:BTCUSDT" },
  { symbol: "ETHUSD", name: "Ethereum", flag: "Ξ", percentage: "+1.8%", tradingViewSymbol: "BINANCE:ETHUSDT" },
  { symbol: "EURUSD", name: "EUR/USD", flag: "🇪🇺", percentage: "-0.2%", tradingViewSymbol: "FX:EURUSD" },
  { symbol: "GBPUSD", name: "GBP/USD", flag: "🇬🇧", percentage: "+0.5%", tradingViewSymbol: "FX:GBPUSD" },
  { symbol: "USDJPY", name: "USD/JPY", flag: "🇯🇵", percentage: "-0.1%", tradingViewSymbol: "FX:USDJPY" },
  { symbol: "GOLD", name: "Gold", flag: "🪙", percentage: "+1.2%", tradingViewSymbol: "TVC:GOLD" },
];

export default function MobileTradingDashboard() {
  const navigate = useNavigate();
  const { getPrice } = usePrices(); // ✅ USE SHARED PRICE CONTEXT
  
  // State
  const [accountType, setAccountType] = useState<"Demo" | "Real">("Demo");
  const [balance, setBalance] = useState(10000.00);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [duration, setDuration] = useState(60); // in seconds
  const [amount, setAmount] = useState(10);
  const [activeNav, setActiveNav] = useState("platform");
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [showAmountSelector, setShowAmountSelector] = useState(false);
  
  // ✅ NEW: Active trades tracking
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [isTrading, setIsTrading] = useState(false);

  // ✅ GET REAL-TIME PRICE FROM SHARED CONTEXT - EXACT MATCH with LiveMarketOverview
  const priceData = getPrice(selectedAsset.symbol);
  const currentPrice = priceData?.price || 0;
  const priceChange = priceData?.change || 0;
  const priceChangePercent = priceData?.changePercent || 0;

  // Log price updates for debugging
  useEffect(() => {
    if (priceData) {
      console.log(`📊 [MobileDashboard] Using price from context: ${selectedAsset.symbol} = $${currentPrice.toFixed(2)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)`);
    }
  }, [priceData, selectedAsset.symbol, currentPrice, priceChangePercent]);
  
  // ✅ Update active trades with current price and countdown
  useEffect(() => {
    if (activeTrades.length === 0) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      
      setActiveTrades(prevTrades => {
        return prevTrades.map(trade => {
          // Get current price for this trade's symbol
          const tradePrice = getPrice(trade.symbol);
          const currentTradePrice = tradePrice?.price || trade.currentPrice;
          
          // Calculate remaining seconds
          const remainingSeconds = Math.max(0, Math.floor((trade.endTime - now) / 1000));
          
          // Calculate profit/loss based on direction
          let profit = 0;
          if (trade.direction === "UP") {
            profit = currentTradePrice > trade.entryPrice ? trade.amount * 0.85 : -trade.amount; // 85% payout
          } else {
            profit = currentTradePrice < trade.entryPrice ? trade.amount * 0.85 : -trade.amount;
          }
          
          // Determine status
          let status: "active" | "win" | "loss" = "active";
          if (remainingSeconds === 0) {
            status = profit > 0 ? "win" : "loss";
          }
          
          return {
            ...trade,
            remainingSeconds,
            currentPrice: currentTradePrice,
            profit,
            status
          };
        });
      });
    }, 100); // Update every 100ms for smooth countdown
    
    return () => clearInterval(timer);
  }, [activeTrades.length, getPrice]);
  
  // ✅ Auto-close expired trades
  useEffect(() => {
    const expiredTrades = activeTrades.filter(t => t.status !== "active");
    
    if (expiredTrades.length > 0) {
      expiredTrades.forEach(trade => {
        // Update balance
        setBalance(prev => prev + trade.profit);
        
        // Show result notification
        const resultEmoji = trade.status === "win" ? "🎉" : "😔";
        const resultText = trade.status === "win" ? "WIN" : "LOSS";
        const profitText = trade.status === "win" 
          ? `+$${Math.abs(trade.profit).toFixed(2)}` 
          : `-$${Math.abs(trade.profit).toFixed(2)}`;
        
        console.log(`${resultEmoji} Trade ${resultText}! ${trade.asset} ${trade.direction} ${profitText}`);
        
        // Remove expired trade after showing result
        setTimeout(() => {
          setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
        }, 3000); // Show result for 3 seconds
      });
    }
  }, [activeTrades]);
  
  // Format balance
  const formatBalance = (val: number) => {
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format price based on asset type
  const formatPrice = (val: number) => {
    if (val === 0) return "Loading...";
    
    // Forex: 5 decimals
    if (selectedAsset.symbol.includes("USD") && !selectedAsset.symbol.includes("BTC") && !selectedAsset.symbol.includes("ETH") && !selectedAsset.symbol.includes("GOLD")) {
      return val.toFixed(5);
    }
    // Crypto: 2 decimals dengan thousand separator
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format price change for display
  const formatPriceChange = (val: number) => {
    // Forex: 5 decimals
    if (selectedAsset.symbol.includes("USD") && !selectedAsset.symbol.includes("BTC") && !selectedAsset.symbol.includes("ETH") && !selectedAsset.symbol.includes("GOLD")) {
      const sign = val >= 0 ? "+" : "";
      return `${sign}${val.toFixed(5)}`;
    }
    // Crypto: 2 decimals
    const sign = val >= 0 ? "+" : "";
    return `${sign}${val.toFixed(2)}`;
  };

  // Handle price update from TradingView chart (optional, we use context price instead)
  const handlePriceUpdate = (price: number) => {
    // We're now using shared price context, so this is just for compatibility
    console.log(`📈 [TradingView Chart] Price update: $${price.toFixed(2)}`);
  };

  // ✅ Handle trade - FULL IMPLEMENTATION
  const handleTrade = async (direction: "UP" | "DOWN") => {
    if (amount > balance) {
      alert("Saldo tidak mencukupi!");
      return;
    }
    
    if (currentPrice === 0) {
      alert("Menunggu harga real-time...");
      return;
    }
    
    if (isTrading) {
      return; // Prevent double-click
    }
    
    setIsTrading(true);
    
    try {
      // Create trade object
      const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();
      const endTime = now + (duration * 1000);
      
      const newTrade: ActiveTrade = {
        id: tradeId,
        symbol: selectedAsset.symbol,
        asset: selectedAsset.name,
        direction,
        amount,
        duration,
        entryPrice: currentPrice,
        startTime: now,
        endTime,
        remainingSeconds: duration,
        currentPrice,
        profit: 0,
        status: "active"
      };
      
      // Deduct amount from balance immediately
      setBalance(prev => prev - amount);
      
      // Add to active trades
      setActiveTrades(prev => [...prev, newTrade]);
      
      console.log(`✅ Trade opened:`, newTrade);
      
    } catch (error) {
      console.error("❌ Trade error:", error);
      alert("Gagal membuka trade!");
    } finally {
      setIsTrading(false);
    }
  };

  // Get duration label
  const getDurationLabel = () => {
    const found = DURATIONS.find(d => d.value === duration);
    return found ? found.label : "1m";
  };

  // ✅ UPDATED: Preset amount options from $1 to $10,000
  const AMOUNT_PRESETS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

  // ✅ FIXED: Increase/decrease amount with proper increments
  const adjustAmount = (delta: number) => {
    const currentIndex = AMOUNT_PRESETS.findIndex(preset => preset >= amount);
    
    if (delta > 0) {
      // Increase: go to next preset
      if (currentIndex < AMOUNT_PRESETS.length - 1) {
        setAmount(AMOUNT_PRESETS[currentIndex === -1 ? 0 : Math.min(currentIndex + 1, AMOUNT_PRESETS.length - 1)]);
      }
    } else {
      // Decrease: go to previous preset
      if (currentIndex > 0) {
        setAmount(AMOUNT_PRESETS[Math.max(0, currentIndex - 1)]);
      } else if (amount > 1) {
        setAmount(Math.max(1, amount - 1));
      }
    }
  };

  // Increase/decrease duration
  const adjustDuration = (delta: number) => {
    const currentIndex = DURATIONS.findIndex(d => d.value === duration);
    const newIndex = Math.max(0, Math.min(DURATIONS.length - 1, currentIndex + delta));
    setDuration(DURATIONS[newIndex].value);
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
      
      {/* ===== TOP HEADER ===== */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-gray-800">
        {/* Left: Account Info */}
        <div className="relative">
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="flex items-center gap-2"
          >
            <User className="w-6 h-6 text-white bg-gray-700 rounded-full p-1" />
            <div className="flex flex-col items-start">
              <span className="text-white text-sm font-medium">Akun demo</span>
              <span className="text-white text-base font-bold">{formatBalance(balance)}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-white ml-1" />
          </button>

          {/* Account Dropdown */}
          {showAccountDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAccountDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] rounded-lg shadow-xl border border-gray-800 z-50">
                <button
                  onClick={() => {
                    setAccountType("Demo");
                    setBalance(10000);
                    setShowAccountDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 border-b border-gray-800"
                >
                  <span className="text-white text-sm">Akun demo</span>
                  <span className="text-white text-sm font-bold">$10,000.00</span>
                </button>
                <button
                  onClick={() => {
                    setAccountType("Real");
                    setBalance(0);
                    setShowAccountDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800"
                >
                  <span className="text-white text-sm">Akun real</span>
                  <span className="text-white text-sm font-bold">$0.00</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right: Deposit Button */}
        <button
          onClick={() => navigate("/member-deposit")}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
        >
          Deposit
        </button>
      </div>

      {/* ===== ASSET SELECTOR BAR ===== */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f0f] border-b border-gray-800">
        {/* Left: Asset Info */}
        <button
          onClick={() => setShowAssetSelector(true)}
          className="flex items-center gap-2"
        >
          <span className="text-2xl">{selectedAsset.flag}</span>
          <div className="flex flex-col">
            <span className="text-white text-sm font-semibold">{selectedAsset.name}</span>
          </div>
          <span className="text-blue-400 text-lg font-bold ml-1">{selectedAsset.percentage}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {/* Right: Action Icons */}
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <Settings className="w-5 h-5 text-gray-400" />
          <div className="px-2 py-1 bg-gray-800 rounded text-white text-xs font-bold">
            {getDurationLabel()}
          </div>
        </div>
      </div>

      {/* ===== CHART AREA ===== */}
      <div className="flex-1 bg-black relative">
        {/* Price Info Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">{selectedAsset.name}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-white text-lg font-bold font-mono">{formatPrice(currentPrice)}</span>
            <span className={`text-xs font-mono ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPriceChange(priceChange)} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* ✅ Active Trades Overlay */}
        {activeTrades.length > 0 && (
          <div className="absolute top-4 right-4 z-10 space-y-2 max-w-[200px]">
            {activeTrades.map((trade) => (
              <div
                key={trade.id}
                className={`bg-black/70 backdrop-blur-sm border-2 rounded-lg p-2 ${
                  trade.status === "win" 
                    ? "border-green-500 animate-pulse" 
                    : trade.status === "loss" 
                    ? "border-red-500 animate-pulse"
                    : trade.direction === "UP" 
                    ? "border-green-500/50" 
                    : "border-red-500/50"
                }`}
              >
                {/* Trade Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    {trade.direction === "UP" ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-white text-xs font-bold">{trade.asset}</span>
                  </div>
                  {trade.status === "active" && (
                    <span className="text-gray-400 text-xs font-mono">
                      {Math.floor(trade.remainingSeconds / 60)}:{String(trade.remainingSeconds % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Trade Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Entry:</span>
                    <span className="text-white font-mono">${trade.entryPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Current:</span>
                    <span className="text-white font-mono">${trade.currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">P/L:</span>
                    <span className={`font-mono font-bold ${
                      trade.profit > 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {trade.profit > 0 ? "+" : ""}${trade.profit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Result Badge */}
                {trade.status !== "active" && (
                  <div className={`mt-2 text-center py-1 rounded font-bold text-xs ${
                    trade.status === "win" 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                  }`}>
                    {trade.status === "win" ? "🎉 WIN!" : "😔 LOSS"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TradingView Chart */}
        <TradingChart
          symbol={selectedAsset.tradingViewSymbol}
          interval="1"
          theme="dark"
          onPriceUpdate={handlePriceUpdate}
        />
      </div>

      {/* ===== TRADING CONTROLS ===== */}
      <div className="bg-[#0a0a0a] border-t border-gray-800 px-4 py-3">
        
        {/* Duration & Amount Controls */}
        <div className="flex items-center justify-between mb-3">
          {/* Duration Control */}
          <div className="flex-1 mr-2">
            <div className="text-gray-400 text-xs mb-1.5">Waktunya</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustDuration(-1)}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
              >
                −
              </button>
              <button
                onClick={() => setShowDurationSelector(true)}
                className="flex-1 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
              >
                {getDurationLabel()}
              </button>
              <button
                onClick={() => adjustDuration(1)}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Amount Control */}
          <div className="flex-1 ml-2">
            <div className="text-gray-400 text-xs mb-1.5">Jumlah awal</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustAmount(-1)}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
              >
                −
              </button>
              <button
                onClick={() => setShowAmountSelector(true)}
                className="flex-1 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
              >
                $ {amount}
              </button>
              <button
                onClick={() => adjustAmount(1)}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Trade Buttons */}
        <div className="flex gap-2 mb-2">
          {/* DOWN Button */}
          <button
            onClick={() => handleTrade("DOWN")}
            className="flex-1 h-16 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <ArrowDown className="w-6 h-6" />
          </button>

          {/* UP Button */}
          <button
            onClick={() => handleTrade("UP")}
            className="flex-1 h-16 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <div className="flex items-center justify-around bg-[#0a0a0a] border-t border-gray-800 py-2 safe-bottom">
        <button
          onClick={() => setActiveNav("platform")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "platform" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Platform</span>
        </button>

        <button
          onClick={() => setActiveNav("penawaran")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "penawaran" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] font-medium">Penawaran</span>
        </button>

        <button
          onClick={() => setActiveNav("robot")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "robot" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] font-medium">Robot</span>
        </button>

        <button
          onClick={() => setActiveNav("dukungan")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "dukungan" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <HeadphonesIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dukungan</span>
        </button>

        <button
          onClick={() => setActiveNav("akun")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "akun" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <UserCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Akun</span>
        </button>
      </div>

      {/* Duration Selector Modal */}
      {showDurationSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#1a1a1a] rounded-t-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Pilih Durasi</h3>
              <button
                onClick={() => setShowDurationSelector(false)}
                className="text-gray-400 hover:text-white"
              >
                <Clock className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {DURATIONS.map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => {
                    setDuration(dur.value);
                    setShowDurationSelector(false);
                  }}
                  className={`py-3 px-4 rounded-lg font-bold text-sm transition-colors ${
                    duration === dur.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDurationSelector(false)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Asset Selector Modal */}
      {showAssetSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#1a1a1a] rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Pilih Asset</h3>
              <button
                onClick={() => setShowAssetSelector(false)}
                className="text-gray-400 hover:text-white"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
            
            {/* Asset List */}
            <div className="space-y-2 mb-4">
              {ASSETS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setShowAssetSelector(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    selectedAsset.symbol === asset.symbol
                      ? "bg-blue-600"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{asset.flag}</span>
                    <div className="flex flex-col items-start">
                      <span className="text-white text-sm font-semibold">{asset.name}</span>
                      <span className="text-gray-400 text-xs">{asset.symbol}</span>
                    </div>
                  </div>
                  <span className="text-blue-400 text-lg font-bold">{asset.percentage}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowAssetSelector(false)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ✅ NEW: Amount Selector Modal */}
      {showAmountSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#1a1a1a] rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Pilih Jumlah Investment</h3>
              <button
                onClick={() => setShowAmountSelector(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Amount Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNT_PRESETS.map((preset) => {
                const isSelected = amount === preset;
                const canAfford = preset <= balance;
                
                return (
                  <button
                    key={preset}
                    onClick={() => {
                      if (canAfford) {
                        setAmount(preset);
                        setShowAmountSelector(false);
                      }
                    }}
                    disabled={!canAfford}
                    className={`py-4 px-4 rounded-lg font-bold text-sm transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : canAfford
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-900 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    ${preset.toLocaleString()}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setShowAmountSelector(false)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}