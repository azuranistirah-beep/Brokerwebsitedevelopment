import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, TrendingUp, TrendingDown, LogOut, Plus, Clock, Wallet, User, Trophy, BarChart3, History, X } from "lucide-react";
import { Button } from "./ui/button";
import { TradingChart } from "./TradingChart";
import { unifiedPriceService } from "../lib/unifiedPriceService";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { ChooseAssetModal } from "./ChooseAssetModal";
import { ImprovedDepositModal } from "./ImprovedDepositModal";

interface Position {
  id: string;
  asset: string;
  type: "UP" | "DOWN";
  amount: number;
  entryPrice: number;
  entryTime: number;
  expiresAt: number;
  duration: string;
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

const DURATIONS = [
  { label: "5s", seconds: 5 },
  { label: "10s", seconds: 10 },
  { label: "15s", seconds: 15 },
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "2m", seconds: 120 },
  { label: "5m", seconds: 300 },
];

export function MemberDashboardNew() {
  const navigate = useNavigate();
  
  // User & Auth
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [accountType, setAccountType] = useState<"demo" | "real">("demo");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  // Trading State
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [previousPrice, setPreviousPrice] = useState(0);
  
  // Positions
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<"trade" | "positions" | "history" | "wallet">("trade");
  const [isLoading, setIsLoading] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);

  // Load user session
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }
    setAccessToken(token);
    loadUserProfile(token);
  }, []);

  // Convert symbol to TradingView format
  const getTradingViewSymbol = (symbol: string): string => {
    const symbolMap: Record<string, string> = {
      // Crypto
      'BTCUSD': 'BINANCE:BTCUSDT',
      'ETHUSD': 'BINANCE:ETHUSDT',
      'BNBUSD': 'BINANCE:BNBUSDT',
      'SOLUSD': 'BINANCE:SOLUSDT',
      'XRPUSD': 'BINANCE:XRPUSDT',
      'ADAUSD': 'BINANCE:ADAUSDT',
      'DOGEUSD': 'BINANCE:DOGEUSDT',
      'MATICUSD': 'BINANCE:MATICUSDT',
      'DOTUSD': 'BINANCE:DOTUSDT',
      'UNIUSD': 'BINANCE:UNIUSDT',
      // Commodities
      'GOLD': 'TVC:GOLD',
      'SILVER': 'TVC:SILVER',
      'USOIL': 'TVC:USOIL',
      'UKOIL': 'TVC:UKOIL',
      // Stocks
      'AAPL': 'NASDAQ:AAPL',
      'GOOGL': 'NASDAQ:GOOGL',
      'MSFT': 'NASDAQ:MSFT',
      'TSLA': 'NASDAQ:TSLA',
      'NVDA': 'NASDAQ:NVDA',
    };
    
    const tvSymbol = symbolMap[symbol] || `BINANCE:${symbol}USDT`;
    console.log(`🔄 [MemberDashboard] Converting symbol: ${symbol} → ${tvSymbol}`);
    return tvSymbol;
  };

  // Subscribe to price updates
  useEffect(() => {
    const unsubscribe = unifiedPriceService.subscribe(selectedSymbol, (priceData) => {
      setPreviousPrice(currentPrice);
      setCurrentPrice(priceData.price);
    });

    return () => unsubscribe();
  }, [selectedSymbol]);

  // Check for expired positions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expired = positions.filter(p => p.expiresAt <= now);
      
      if (expired.length > 0) {
        expired.forEach(position => {
          closePosition(position);
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [positions, currentPrice]);

  const loadUserProfile = async (token: string) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("No userId found");
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/user/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      } else {
        // Fallback to demo profile
        const email = localStorage.getItem("userEmail") || "demo@investoft.com";
        setUserProfile({
          email,
          demo_balance: 10000,
          real_balance: 0,
          total_trades: 0,
          winning_trades: 0,
          losing_trades: 0,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Fallback to demo profile
      const email = localStorage.getItem("userEmail") || "demo@investoft.com";
      setUserProfile({
        email,
        demo_balance: 10000,
        real_balance: 0,
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
      });
    }
  };

  const closePosition = (position: Position) => {
    if (!currentPrice || currentPrice === 0) return;

    const exitPrice = currentPrice;
    const priceChange = exitPrice - position.entryPrice;
    const isWin = 
      (position.type === "UP" && priceChange > 0) ||
      (position.type === "DOWN" && priceChange < 0);

    const payoutPercentage = 95;
    const returnAmount = isWin ? position.amount + (position.amount * payoutPercentage / 100) : 0;
    const profit = returnAmount - position.amount;

    const closedPosition: Position = {
      ...position,
      status: isWin ? "won" : "lost",
      exitPrice,
      profit,
    };

    setPositions(prev => prev.filter(p => p.id !== position.id));
    setClosedPositions(prev => [closedPosition, ...prev]);

    if (userProfile) {
      const newBalance = userProfile.demo_balance + returnAmount;
      setUserProfile({
        ...userProfile,
        demo_balance: newBalance,
        total_trades: userProfile.total_trades + 1,
        winning_trades: isWin ? userProfile.winning_trades + 1 : userProfile.winning_trades,
        losing_trades: !isWin ? userProfile.losing_trades + 1 : userProfile.losing_trades,
      });
    }
  };

  const handleTrade = (direction: "UP" | "DOWN") => {
    if (!currentPrice || currentPrice === 0) {
      alert("Waiting for price data...");
      return;
    }

    if (!userProfile || userProfile.demo_balance < selectedAmount) {
      alert("Insufficient balance!");
      return;
    }

    const now = Date.now();
    const newPosition: Position = {
      id: `pos_${now}`,
      asset: selectedSymbol,
      type: direction,
      amount: selectedAmount,
      entryPrice: currentPrice,
      entryTime: now,
      expiresAt: now + (selectedDuration.seconds * 1000),
      duration: selectedDuration.label,
      status: "open",
    };

    setPositions(prev => [newPosition, ...prev]);
    
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        demo_balance: userProfile.demo_balance - selectedAmount,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const demoBalance = userProfile?.demo_balance || 10000;

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* TOP: Header with Account, Asset, Deposit */}
      <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* LEFT: Account Type Selector (Real/Demo) */}
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {accountType === "demo" ? "D" : "R"}
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">
                  {accountType === "demo" ? "Demo Account" : "Real Account"}
                </div>
                <div className="text-[10px] text-slate-400">
                  ${demoBalance.toLocaleString()}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {/* Account Menu Dropdown */}
            {showAccountMenu && (
              <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                <button
                  onClick={() => {
                    setAccountType("demo");
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-t-lg transition-colors"
                >
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">D</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">Demo Account</div>
                    <div className="text-[10px] text-slate-400">${demoBalance.toLocaleString()}</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setAccountType("real");
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-b-lg transition-colors"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">R</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">Real Account</div>
                    <div className="text-[10px] text-slate-400">$0.00</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* CENTER: Asset with "+" button */}
          <button
            onClick={() => setShowAssetModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex-1 max-w-xs"
          >
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs font-bold text-white">{selectedSymbol}</div>
              <div className="text-[10px] text-slate-400">${currentPrice.toFixed(2)}</div>
            </div>
          </button>

          {/* RIGHT: Deposit Button (GREEN) */}
          <button
            onClick={() => setShowDepositModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <span className="text-sm font-bold text-white">Deposit</span>
          </button>
        </div>
      </header>

      {/* MAIN: Fullscreen Chart */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <TradingChart 
            symbol={getTradingViewSymbol(selectedSymbol)} 
            theme="dark"
            onPriceUpdate={(price) => {
              console.log(`💰 [MemberDashboard] Received price update: $${price.toFixed(2)}`);
              setPreviousPrice(currentPrice);
              setCurrentPrice(price);
            }}
          />
          
          {/* CUSTOM PRICE OVERLAY - Always show REAL BINANCE PRICE */}
          {currentPrice > 0 && (
            <div className="absolute top-2 left-2 z-50 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-2 shadow-xl">
              <div className="flex items-center gap-3">
                {/* Symbol */}
                <div className="text-slate-400 text-sm font-medium">
                  {selectedSymbol}
                </div>
                
                {/* Price */}
                <div className="flex items-center gap-2">
                  <div className="text-white text-2xl font-bold tracking-tight">
                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  
                  {/* Price Change Indicator */}
                  {previousPrice > 0 && currentPrice !== previousPrice && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      currentPrice > previousPrice ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {currentPrice > previousPrice ? (
                        <><TrendingUp className="h-4 w-4" /> +{((currentPrice - previousPrice) / previousPrice * 100).toFixed(2)}%</>
                      ) : (
                        <><TrendingDown className="h-4 w-4" /> {((currentPrice - previousPrice) / previousPrice * 100).toFixed(2)}%</>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Live Indicator */}
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-500 font-medium">LIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM: Trading Controls */}
      <div className="border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm">
        {/* Trading Controls */}
        <div className="px-3 py-2 flex items-center gap-2">
          {/* Duration */}
          <button
            onClick={() => setShowDurationModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Clock className="h-4 w-4 text-blue-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400">Duration</div>
              <div className="text-xs font-bold text-white">{selectedDuration.label}</div>
            </div>
          </button>

          {/* Amount */}
          <div className="flex-1 flex items-center gap-1 bg-slate-800 rounded-lg">
            <button
              onClick={() => setSelectedAmount(Math.max(10, selectedAmount - 10))}
              className="px-3 py-2 hover:bg-slate-700 rounded-l-lg transition-colors"
            >
              <span className="text-xl text-white font-bold">−</span>
            </button>
            
            <div className="flex-1 text-center py-2">
              <div className="text-[10px] text-slate-400">Amount</div>
              <div className="text-sm font-bold text-white">${selectedAmount}</div>
            </div>
            
            <button
              onClick={() => setSelectedAmount(Math.min(10000, selectedAmount + 10))}
              className="px-3 py-2 hover:bg-slate-700 rounded-r-lg transition-colors"
            >
              <span className="text-xl text-white font-bold">+</span>
            </button>
          </div>
        </div>

        {/* Trade Buttons */}
        <div className="px-3 pb-2 grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleTrade("DOWN")}
            disabled={isLoading || currentPrice === 0}
            className="h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-lg shadow-lg transition-all active:scale-95"
          >
            <TrendingDown className="h-5 w-5 mr-2" />
            DOWN
          </Button>
          <Button
            onClick={() => handleTrade("UP")}
            disabled={isLoading || currentPrice === 0}
            className="h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg shadow-lg transition-all active:scale-95"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            UP
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-slate-800 px-3 py-2 grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab("trade")}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeTab === "trade" ? "text-blue-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Trade</span>
          </button>

          <button
            onClick={() => setActiveTab("positions")}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeTab === "positions" ? "text-blue-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="text-[10px] font-medium">Positions</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeTab === "history" ? "text-blue-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="h-5 w-5" />
            <span className="text-[10px] font-medium">History</span>
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeTab === "wallet" ? "text-blue-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Wallet className="h-5 w-5" />
            <span className="text-[10px] font-medium">Wallet</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 py-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* MODALS */}
      
      {/* Choose Asset Modal */}
      <ChooseAssetModal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        onSelectAsset={(symbol) => setSelectedSymbol(symbol)}
        selectedSymbol={selectedSymbol}
      />

      {/* Deposit Modal */}
      <ImprovedDepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        userEmail={userProfile?.email || ""}
        onDepositSuccess={() => {
          loadUserProfile(accessToken);
          setShowDepositModal(false);
        }}
      />

      {/* Duration Modal */}
      {showDurationModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-slate-900 rounded-t-2xl">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Select Duration</h2>
              <button
                onClick={() => setShowDurationModal(false)}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-3 gap-3 pb-6">
              {DURATIONS.map((duration) => (
                <button
                  key={duration.label}
                  onClick={() => {
                    setSelectedDuration(duration);
                    setShowDurationModal(false);
                  }}
                  className={`p-4 rounded-xl text-center font-bold text-lg transition-all ${
                    selectedDuration.label === duration.label
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}