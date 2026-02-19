import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Plus, X, TrendingUp, ChevronDown,
  Briefcase, FileText, MessageCircle, User, Search,
  Flame, TrendingDown, Clock, DollarSign
} from "lucide-react";
import { TradingChart } from "./TradingChart";

interface MemberDashboardProps {
  user?: any;
}

interface Asset {
  symbol: string;
  tradingViewSymbol: string;
  name: string;
  category: string;
  icon: string;
  color: string;
}

const POPULAR_ASSETS: Asset[] = [
  { symbol: "BTCUSD", tradingViewSymbol: "BINANCE:BTCUSDT", name: "Bitcoin", category: "Crypto", icon: "₿", color: "bg-orange-500" },
  { symbol: "ETHUSD", tradingViewSymbol: "BINANCE:ETHUSDT", name: "Ethereum", category: "Crypto", icon: "Ξ", color: "bg-blue-500" },
  { symbol: "EURUSD", tradingViewSymbol: "FX:EURUSD", name: "EUR/USD", category: "Forex", icon: "€", color: "bg-green-500" },
  { symbol: "GBPUSD", tradingViewSymbol: "FX:GBPUSD", name: "GBP/USD", category: "Forex", icon: "£", color: "bg-blue-600" },
  { symbol: "GOLD", tradingViewSymbol: "TVC:GOLD", name: "Gold", category: "Commodity", icon: "🪙", color: "bg-yellow-600" },
];

const CRYPTO_ASSETS: Asset[] = [
  { symbol: "BTCUSD", tradingViewSymbol: "BINANCE:BTCUSDT", name: "Bitcoin", category: "Crypto", icon: "₿", color: "bg-orange-500" },
  { symbol: "ETHUSD", tradingViewSymbol: "BINANCE:ETHUSDT", name: "Ethereum", category: "Crypto", icon: "Ξ", color: "bg-blue-500" },
  { symbol: "BNBUSD", tradingViewSymbol: "BINANCE:BNBUSDT", name: "BNB", category: "Crypto", icon: "◆", color: "bg-yellow-500" },
  { symbol: "SOLUSD", tradingViewSymbol: "BINANCE:SOLUSDT", name: "Solana", category: "Crypto", icon: "◎", color: "bg-purple-500" },
  { symbol: "ADAUSD", tradingViewSymbol: "BINANCE:ADAUSDT", name: "Cardano", category: "Crypto", icon: "₳", color: "bg-blue-600" },
  { symbol: "XRPUSD", tradingViewSymbol: "BINANCE:XRPUSDT", name: "Ripple", category: "Crypto", icon: "✕", color: "bg-gray-500" },
];

const FOREX_ASSETS: Asset[] = [
  { symbol: "EURUSD", tradingViewSymbol: "FX:EURUSD", name: "EUR/USD", category: "Forex", icon: "€", color: "bg-green-500" },
  { symbol: "GBPUSD", tradingViewSymbol: "FX:GBPUSD", name: "GBP/USD", category: "Forex", icon: "£", color: "bg-blue-600" },
  { symbol: "USDJPY", tradingViewSymbol: "FX:USDJPY", name: "USD/JPY", category: "Forex", icon: "¥", color: "bg-red-500" },
  { symbol: "AUDUSD", tradingViewSymbol: "FX:AUDUSD", name: "AUD/USD", category: "Forex", icon: "$", color: "bg-green-600" },
];

export default function MemberDashboard({ user }: MemberDashboardProps) {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<"Real" | "Demo">("Demo");
  const [balance, setBalance] = useState(10000);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(POPULAR_ASSETS[0]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetModalTab, setAssetModalTab] = useState<"Popular" | "Crypto" | "Forex">("Popular");
  const [tradeAmount, setTradeAmount] = useState(10);
  const [tradeDuration, setTradeDuration] = useState(60); // seconds
  const [currentPrice, setCurrentPrice] = useState(0);
  const [activeNav, setActiveNav] = useState("trade");
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [activeTrades, setActiveTrades] = useState<any[]>([]);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [showAmountSuggestions, setShowAmountSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time price from Binance WebSocket
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    // Get base price for asset
    const getBasePrice = (symbol: string): number => {
      const basePrices: Record<string, number> = {
        // Crypto
        BTCUSD: 95420.50,
        ETHUSD: 3580.25,
        BNBUSD: 642.80,
        SOLUSD: 198.45,
        ADAUSD: 1.05,
        XRPUSD: 2.45,
        // Forex
        EURUSD: 1.09200,
        GBPUSD: 1.28300,
        USDJPY: 147.850,
        AUDUSD: 0.65800,
        // Commodities
        GOLD: 2850.00,
      };
      return basePrices[symbol] || 100.00;
    };

    // Initialize with base price
    const initialPrice = getBasePrice(selectedAsset.symbol);
    setCurrentPrice(initialPrice);

    // Cleanup
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [selectedAsset]);

  // Mock base price for non-crypto assets
  const getMockBasePrice = (symbol: string): number => {
    const basePrices: Record<string, number> = {
      EURUSD: 1.09200,
      GBPUSD: 1.28300,
      USDJPY: 147.850,
      AUDUSD: 0.65800,
      GOLD: 2850.00,
    };
    return basePrices[symbol] || 100.00;
  };

  // Handle real-time price from TradingView
  const handlePriceUpdate = (price: number) => {
    setCurrentPrice(price);
  };

  const formatBalance = (amount: number) => {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Loading...";
    
    // Format based on asset type
    if (selectedAsset.category === "Forex") {
      return price.toFixed(5);
    } else if (selectedAsset.category === "Crypto") {
      return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetModal(false);
    setCurrentPrice(0); // Reset price while loading
  };

  const handleTrade = async (direction: "up" | "down") => {
    if (currentPrice === 0) {
      alert("Please wait for price to load");
      return;
    }

    if (tradeAmount > balance) {
      alert("Insufficient balance");
      return;
    }

    // Demo trade execution
    const tradeId = `TRADE-${Date.now()}`;
    console.log(`📈 TRADE EXECUTED:`, {
      id: tradeId,
      asset: selectedAsset.symbol,
      direction,
      amount: tradeAmount,
      entryPrice: currentPrice,
      duration: tradeDuration,
      timestamp: new Date().toISOString()
    });

    alert(`✅ Trade Opened!\n\n` +
          `Asset: ${selectedAsset.name}\n` +
          `Direction: ${direction.toUpperCase()}\n` +
          `Amount: $${tradeAmount}\n` +
          `Entry Price: ${formatPrice(currentPrice)}\n` +
          `Duration: ${tradeDuration}s`);
  };

  const getAssetList = () => {
    switch (assetModalTab) {
      case "Crypto":
        return CRYPTO_ASSETS;
      case "Forex":
        return FOREX_ASSETS;
      default:
        return POPULAR_ASSETS;
    }
  };

  const tradeAmounts = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
  const tradeDurations = [
    { label: "5s", value: 5 },
    { label: "10s", value: 10 },
    { label: "15s", value: 15 },
    { label: "30s", value: 30 },
    { label: "1m", value: 60 },
    { label: "2m", value: 120 },
    { label: "5m", value: 300 },
  ];

  return (
    <div className="h-screen w-full bg-[#1a1a1a] flex flex-col overflow-hidden">
      
      {/* ===== TOP HEADER - IQ OPTION STYLE ===== */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[#2a2a2a]">
        {/* Left: Account Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#303030] rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${accountType === "Real" ? "bg-green-500" : "bg-blue-500"}`}></div>
              <span className="text-white text-sm font-medium">{accountType} Account</span>
            </div>
            <span className="text-white text-base font-bold">{formatBalance(balance)}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Account Dropdown */}
          {showAccountDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-[#2a2a2a] rounded-lg shadow-xl border border-[#3a3a3a] z-50">
              <button
                onClick={() => {
                  setAccountType("Real");
                  setBalance(0);
                  setShowAccountDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#303030] border-b border-[#3a3a3a]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-white text-sm">Real Account</span>
                </div>
                <span className="text-white text-sm font-bold">$0.00</span>
              </button>
              <button
                onClick={() => {
                  setAccountType("Demo");
                  setBalance(10000);
                  setShowAccountDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#303030]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-white text-sm">Demo Account</span>
                </div>
                <span className="text-white text-sm font-bold">$10,000.00</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Deposit Button */}
        <button
          onClick={() => navigate("/member-deposit")}
          className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-sm font-bold rounded-lg shadow-lg transition-all"
        >
          DEPOSIT
        </button>
      </div>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP: CHART AREA - 70% height for ALL devices */}
        <div className="w-full flex flex-col bg-[#1a1a1a] h-[70vh]">
          
          {/* Asset Selector Bar */}
          <div className="flex items-center justify-center px-4 py-2 bg-[#1f1f1f]">
            <button
              onClick={() => setShowAssetModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#303030] rounded-xl transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4 text-green-500" />
              <div className={`w-8 h-8 flex items-center justify-center ${selectedAsset.color} rounded-full`}>
                <span className="text-white text-lg font-bold">{selectedAsset.icon}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-semibold text-sm">{selectedAsset.name}</span>
                <span className="text-slate-400 text-xs">{selectedAsset.category}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>
          </div>

          {/* TradingView Chart */}
          <div className="flex-1 relative min-h-0">
            <TradingChart 
              symbol={selectedAsset.tradingViewSymbol}
              interval="1"
              theme="dark"
              onPriceUpdate={handlePriceUpdate}
            />
          </div>
        </div>

        {/* BOTTOM: TRADING PANEL - 30% height, NO SCROLL */}
        <div className="w-full h-[30vh] bg-[#252525] border-t border-[#2a2a2a] flex flex-col">
          
          <div className="flex-1 flex flex-col p-3 gap-2">
            
            {/* Investment & Time - SIDE BY SIDE */}
            <div className="flex gap-2">
              {/* Investment Input with Suggestions */}
              <div className="flex-1 relative">
                <div className="text-slate-400 text-xs uppercase mb-1 font-medium">INVESTMENT</div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Number(e.target.value) || 0)}
                    onFocus={() => setShowAmountSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAmountSuggestions(false), 200)}
                    placeholder="Enter amount"
                    className="w-full pl-9 pr-3 py-2 bg-[#2a2a2a] text-white rounded-lg border border-[#3a3a3a] focus:border-green-500 focus:outline-none text-sm font-semibold"
                    min="1"
                  />
                  {showAmountSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                      {tradeAmounts.map((amount) => (
                        <button
                          key={amount}
                          onMouseDown={() => setTradeAmount(amount)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#303030] transition-colors"
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Duration Dropdown */}
              <div className="flex-1">
                <div className="text-slate-400 text-xs uppercase mb-1 font-medium">TIME</div>
                <select
                  value={tradeDuration}
                  onChange={(e) => setTradeDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded-lg border border-[#3a3a3a] focus:border-green-500 focus:outline-none text-sm font-semibold appearance-none cursor-pointer"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1rem'
                  }}
                >
                  {tradeDurations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Price Display */}
            <div>
              <div className="text-slate-400 text-xs uppercase mb-1 font-medium">CURRENT PRICE</div>
              <div className="text-white text-2xl font-bold font-mono">
                {formatPrice(currentPrice)}
              </div>
            </div>

            {/* Trade Buttons - SIDE BY SIDE: SELL (Left) | BUY (Right) */}
            <div className="flex-1 flex gap-2 min-h-0">
              {/* SELL Button - LEFT */}
              <button
                onClick={() => handleTrade("down")}
                disabled={currentPrice === 0}
                className="flex-1 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-2xl transition-all flex flex-col items-center justify-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <TrendingDown className="w-8 h-8 text-white mb-1 relative" />
                <span className="text-white text-xl font-bold relative">SELL</span>
              </button>

              {/* BUY Button - RIGHT */}
              <button
                onClick={() => handleTrade("up")}
                disabled={currentPrice === 0}
                className="flex-1 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-2xl transition-all flex flex-col items-center justify-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <TrendingUp className="w-8 h-8 text-white mb-1 relative" />
                <span className="text-white text-xl font-bold relative">BUY</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <div className="flex items-center justify-around bg-[#252525] border-t border-[#2a2a2a] py-3 px-4">
        <button 
          onClick={() => setActiveNav("trade")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeNav === "trade" ? "text-green-500" : "text-slate-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-xs font-medium">Trade</span>
        </button>
        <button 
          onClick={() => setActiveNav("portfolio")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeNav === "portfolio" ? "text-green-500" : "text-slate-400 hover:text-white"
          }`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-xs font-medium">Portfolio</span>
        </button>
        <button 
          onClick={() => setActiveNav("history")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeNav === "history" ? "text-green-500" : "text-slate-400 hover:text-white"
          }`}
        >
          <Clock className="w-6 h-6" />
          <span className="text-xs font-medium">History</span>
        </button>
        <button 
          onClick={() => setActiveNav("chat")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeNav === "chat" ? "text-green-500" : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-medium">Chat</span>
        </button>
        <button 
          onClick={() => setActiveNav("profile")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeNav === "profile" ? "text-green-500" : "text-slate-400 hover:text-white"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>

      {/* ===== ASSET MODAL ===== */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#252525] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
              <h3 className="text-white text-xl font-bold">Choose Asset</h3>
              <button
                onClick={() => setShowAssetModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar - PROFESSIONAL STYLING */}
            <div className="px-6 py-4 border-b border-[#2a2a2a] bg-gradient-to-br from-[#2a2a2a] to-[#252525]">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Bitcoin, Ethereum, EUR/USD..."
                  className="relative w-full bg-[#2a2a2a] text-white pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#3a3a3a] focus:border-green-500 focus:outline-none transition-all placeholder:text-slate-500 font-medium shadow-lg"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#2a2a2a]">
              <button
                onClick={() => setAssetModalTab("Popular")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  assetModalTab === "Popular"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-[#2a2a2a] text-slate-400 hover:text-white hover:bg-[#303030]"
                }`}
              >
                <Flame className="w-4 h-4" />
                Popular
              </button>
              <button
                onClick={() => setAssetModalTab("Crypto")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  assetModalTab === "Crypto"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-[#2a2a2a] text-slate-400 hover:text-white hover:bg-[#303030]"
                }`}
              >
                ₿ Crypto
              </button>
              <button
                onClick={() => setAssetModalTab("Forex")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  assetModalTab === "Forex"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-[#2a2a2a] text-slate-400 hover:text-white hover:bg-[#303030]"
                }`}
              >
                $ Forex
              </button>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                {getAssetList().map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => handleSelectAsset(asset)}
                    className="w-full flex items-center gap-4 p-4 bg-[#2a2a2a] hover:bg-[#303030] rounded-xl transition-all group"
                  >
                    <div className={`w-12 h-12 flex items-center justify-center ${asset.color} rounded-full flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <span className="text-white text-2xl font-bold">{asset.icon}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-semibold text-base">{asset.name}</div>
                      <div className="text-slate-400 text-sm">{asset.symbol}</div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-slate-400 -rotate-90" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}