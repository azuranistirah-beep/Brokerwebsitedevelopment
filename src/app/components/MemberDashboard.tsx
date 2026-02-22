import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ChevronDown, TrendingUp, TrendingDown, LogOut, Plus, Clock, 
  Wallet, User, Trophy, BarChart3, History, X, ArrowUp, ArrowDown,
  Activity, RefreshCw, DollarSign, Target, Zap
} from "lucide-react";
import { Button } from "./ui/button";
import { TradingChart } from "./TradingChart";
import { useBinancePrice } from "../hooks/useBinancePrice";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface Position {
  id: string;
  asset: string;
  type: "UP" | "DOWN";
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

interface Asset {
  symbol: string;
  tradingViewSymbol: string;
  name: string;
  category: string;
  icon: string;
}

const ASSETS: Asset[] = [
  // Crypto
  { symbol: "BTCUSD", tradingViewSymbol: "BINANCE:BTCUSDT", name: "Bitcoin", category: "Crypto", icon: "₿" },
  { symbol: "ETHUSD", tradingViewSymbol: "BINANCE:ETHUSDT", name: "Ethereum", category: "Crypto", icon: "Ξ" },
  { symbol: "BNBUSD", tradingViewSymbol: "BINANCE:BNBUSDT", name: "Binance Coin", category: "Crypto", icon: "🔶" },
  { symbol: "SOLUSD", tradingViewSymbol: "BINANCE:SOLUSDT", name: "Solana", category: "Crypto", icon: "◎" },
  { symbol: "XRPUSD", tradingViewSymbol: "BINANCE:XRPUSDT", name: "Ripple", category: "Crypto", icon: "◈" },
  // Commodities
  { symbol: "GOLD", tradingViewSymbol: "TVC:GOLD", name: "Gold", category: "Commodity", icon: "🪙" },
  { symbol: "SILVER", tradingViewSymbol: "TVC:SILVER", name: "Silver", category: "Commodity", icon: "⚪" },
  { symbol: "USOIL", tradingViewSymbol: "TVC:USOIL", name: "Crude Oil", category: "Commodity", icon: "🛢️" },
  { symbol: "UKOIL", tradingViewSymbol: "TVC:UKOIL", name: "Brent Oil", category: "Commodity", icon: "🛢️" },
];

const DURATIONS = [
  { label: "5s", seconds: 5 },
  { label: "10s", seconds: 10 },
  { label: "15s", seconds: 15 },
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "2m", seconds: 120 },
  { label: "5m", seconds: 300 },
];

const AMOUNTS = [10, 25, 50, 100, 250, 500, 1000];

export default function MemberDashboard() {
  const navigate = useNavigate();
  
  // User & Auth
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [accountType, setAccountType] = useState<"demo" | "real">("demo");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  // Trading State
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[4]); // 1m default
  const [currentPrice, setCurrentPrice] = useState(0);
  const [previousPrice, setPreviousPrice] = useState(0);
  
  // Positions
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<"trade" | "positions" | "history">("trade");
  const [isLoading, setIsLoading] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);

  // ✅ Real-time Binance prices (EXACT MATCH with TradingView)
  const { subscribe, unsubscribe, isConnected } = useBinancePrice();

  // ✅ FIX: Define loadUserProfile as useCallback to fix dependency warning
  const loadUserProfile = useCallback(async (token: string) => {
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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        console.log("✅ User profile loaded:", data);
      } else {
        console.error("Failed to load user profile");
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }, []); // Empty deps since it only uses localStorage and fetch

  // ✅ FIX: Define updatePositionResult as useCallback to fix dependency warning
  const updatePositionResult = useCallback(async (position: Position) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trades/${position.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            exit_price: position.exitPrice,
            profit: position.profit,
            status: position.status,
          }),
        }
      );
    } catch (error) {
      console.error("Error updating position:", error);
    }
  }, [accessToken]);

  // ✅ FIX: Define closePosition as useCallback to fix dependency warning
  const closePosition = useCallback(async (position: Position) => {
    if (!userProfile) return;

    const exitPrice = currentPrice;
    const isWin =
      (position.type === "UP" && exitPrice > position.entryPrice) ||
      (position.type === "DOWN" && exitPrice < position.entryPrice);

    const payout = 0.85; // 85% payout
    const profit = isWin ? position.amount * payout : 0;
    const totalReturn = isWin ? position.amount + profit : 0;

    const closedPosition: Position = {
      ...position,
      status: isWin ? "won" : "lost",
      exitPrice,
      profit: isWin ? profit : -position.amount,
    };

    // Update balance
    const balance = accountType === "demo" ? userProfile.demo_balance : userProfile.real_balance;
    const newBalance = balance + totalReturn;

    if (accountType === "demo") {
      setUserProfile({
        ...userProfile,
        demo_balance: newBalance,
        total_trades: userProfile.total_trades + 1,
        winning_trades: isWin ? userProfile.winning_trades + 1 : userProfile.winning_trades,
        losing_trades: isWin ? userProfile.losing_trades : userProfile.losing_trades + 1,
      });
    } else {
      setUserProfile({
        ...userProfile,
        real_balance: newBalance,
        total_trades: userProfile.total_trades + 1,
        winning_trades: isWin ? userProfile.winning_trades + 1 : userProfile.winning_trades,
        losing_trades: isWin ? userProfile.losing_trades : userProfile.losing_trades + 1,
      });
    }

    setClosedPositions(prev => [closedPosition, ...prev]);

    // Remove from active positions
    setPositions(prev => prev.filter(p => p.id !== position.id));

    // Save to backend
    await updatePositionResult(closedPosition);

    console.log(
      `${isWin ? "✅ WIN" : "❌ LOSS"}: ${position.type} $${position.amount} | Entry: $${position.entryPrice.toFixed(2)} | Exit: $${exitPrice.toFixed(2)} | Profit: ${isWin ? `+$${profit.toFixed(2)}` : `-$${position.amount.toFixed(2)}`}`
    );
  }, [userProfile, currentPrice, accountType, updatePositionResult]); // ✅ FIX: Add updatePositionResult to dependencies

  const savePosition = useCallback(async (position: Position) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trades`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user_id: localStorage.getItem("userId"),
            asset: position.asset,
            type: position.type,
            amount: position.amount,
            entry_price: position.entryPrice,
            duration: position.duration,
            account_type: accountType,
          }),
        }
      );
    } catch (error) {
      console.error("Error saving position:", error);
    }
  }, [accessToken, accountType]);

  // Load user session
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }
    setAccessToken(token);
    loadUserProfile(token);
  }, [navigate, loadUserProfile]); // ✅ FIX: Add loadUserProfile to dependencies

  // Subscribe to real-time price updates
  useEffect(() => {
    console.log(`🔄 [MemberDashboard] Subscribing to ${selectedAsset.tradingViewSymbol}`);
    
    // Create callback function
    const handlePriceUpdate = (priceData: { symbol: string; price: number; timestamp: number }) => {
      setCurrentPrice(prev => {
        setPreviousPrice(prev);
        console.log(`💰💰💰 [${selectedAsset.symbol}] PRICE UPDATE: $${prev.toFixed(2)} → $${priceData.price.toFixed(2)}`);
        return priceData.price;
      });
    };
    
    // Subscribe with the callback
    subscribe(selectedAsset.tradingViewSymbol, handlePriceUpdate);

    // Cleanup
    return () => {
      console.log(`�� [MemberDashboard] Unsubscribing from ${selectedAsset.tradingViewSymbol}`);
      unsubscribe(selectedAsset.tradingViewSymbol, handlePriceUpdate);
    };
  }, [selectedAsset.tradingViewSymbol, selectedAsset.symbol, subscribe, unsubscribe]); // ✅ FIX: Add all dependencies

  // Check for expired positions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setPositions((prevPositions) => {
        const stillOpen: Position[] = [];
        const toClose: Position[] = [];

        prevPositions.forEach(position => {
          if (position.expiresAt <= now && position.status === "open") {
            toClose.push(position);
          } else if (position.status === "open") {
            stillOpen.push(position);
          }
        });

        // Close expired positions
        toClose.forEach(position => {
          closePosition(position);
        });

        return stillOpen;
      });
    }, 100); // Check every 100ms for accuracy

    return () => clearInterval(interval);
  }, [closePosition]); // ✅ FIX: Add closePosition to dependencies

  const openPosition = async (type: "UP" | "DOWN") => {
    if (!userProfile) return;
    
    const balance = accountType === "demo" ? userProfile.demo_balance : userProfile.real_balance;
    
    if (balance < selectedAmount) {
      alert("Insufficient balance!");
      return;
    }

    setIsLoading(true);

    try {
      const newPosition: Position = {
        id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        asset: selectedAsset.symbol,
        type,
        amount: selectedAmount,
        entryPrice: currentPrice,
        entryTime: Date.now(),
        expiresAt: Date.now() + (selectedDuration.seconds * 1000),
        duration: selectedDuration.seconds,
        status: "open",
      };

      setPositions([...positions, newPosition]);

      // Deduct balance
      const newBalance = balance - selectedAmount;
      if (accountType === "demo") {
        setUserProfile({ ...userProfile, demo_balance: newBalance });
      } else {
        setUserProfile({ ...userProfile, real_balance: newBalance });
      }

      // Save to backend
      await savePosition(newPosition);

      console.log(`✅ Position opened: ${type} $${selectedAmount} on ${selectedAsset.symbol} @ $${currentPrice.toFixed(2)}`);
    } catch (error) {
      console.error("Error opening position:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const balance = userProfile ? (accountType === "demo" ? userProfile.demo_balance : userProfile.real_balance) : 0;
  const winRate = userProfile && userProfile.total_trades > 0 
    ? ((userProfile.winning_trades / userProfile.total_trades) * 100).toFixed(1)
    : "0";

  const priceDirection = currentPrice > previousPrice ? "up" : currentPrice < previousPrice ? "down" : "neutral";

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['-apple-system','BlinkMacSystemFont','Trebuchet_MS','Roboto','Ubuntu','sans-serif']">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Investoft
            </h1>
            <div className="h-8 w-px bg-slate-700" />
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-slate-400">WebSocket: </span>
              <span className={isConnected ? "text-green-500" : "text-red-500"}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          {/* Account & Balance */}
          <div className="flex items-center gap-4">
            {/* Account Type Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span className="font-medium">{accountType === "demo" ? "Demo" : "Real"} Account</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showAccountMenu && (
                <div className="absolute top-full mt-2 right-0 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50 min-w-[200px]">
                  <button
                    onClick={() => {
                      setAccountType("demo");
                      setShowAccountMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="font-medium">Demo Account</div>
                      <div className="text-xs text-slate-400">${userProfile?.demo_balance.toFixed(2) || "0.00"}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setAccountType("real");
                      setShowAccountMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-medium">Real Account</div>
                      <div className="text-xs text-slate-400">${userProfile?.real_balance.toFixed(2) || "0.00"}</div>
                    </div>
                  </button>
                  <div className="border-t border-slate-700">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center gap-2 text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Balance Display */}
            <div className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
              <div className="text-xs text-blue-100 mb-0.5">Balance</div>
              <div className="text-xl font-bold">${balance.toFixed(2)}</div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-800 rounded-lg">
              <div>
                <div className="text-xs text-slate-400">Win Rate</div>
                <div className="text-sm font-bold text-green-500">{winRate}%</div>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div>
                <div className="text-xs text-slate-400">Total Trades</div>
                <div className="text-sm font-bold">{userProfile?.total_trades || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Left: Chart Area */}
        <div className="flex flex-col gap-4">
          {/* Asset Selector & Price */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAssetModal(true)}
                className="flex items-center gap-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-2xl">{selectedAsset.icon}</span>
                <div className="text-left">
                  <div className="font-bold text-lg">{selectedAsset.symbol}</div>
                  <div className="text-xs text-slate-400">{selectedAsset.name}</div>
                </div>
                <ChevronDown className="w-5 h-5 ml-2" />
              </button>

              {/* Real-time Price */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    priceDirection === "up" ? "text-green-500" :
                    priceDirection === "down" ? "text-red-500" :
                    "text-white"
                  }`}>
                    ${currentPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    {priceDirection === "up" && <ArrowUp className="w-3 h-3 text-green-500" />}
                    {priceDirection === "down" && <ArrowDown className="w-3 h-3 text-red-500" />}
                    <span>Real-time Binance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TradingView Chart */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden" style={{ height: "600px" }}>
            <TradingChart 
              symbol={selectedAsset.tradingViewSymbol}
              onPriceUpdate={(price) => {
                console.log(`📊 [MemberDashboard] Received price from TradingView chart: ${selectedAsset.tradingViewSymbol} = $${price.toFixed(2)}`);
                setCurrentPrice(prevPrice => {
                  setPreviousPrice(prevPrice);
                  return price;
                });
              }}
            />
          </div>

          {/* Tabs */}
          <div className="bg-slate-900 rounded-lg border border-slate-800">
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab("trade")}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  activeTab === "trade"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Trade
              </button>
              <button
                onClick={() => setActiveTab("positions")}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  activeTab === "positions"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Open Positions ({positions.length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  activeTab === "history"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                History ({closedPositions.length})
              </button>
            </div>

            <div className="p-4">
              {activeTab === "positions" && (
                <div className="space-y-2">
                  {positions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No open positions</p>
                    </div>
                  ) : (
                    positions.map((position) => {
                      const timeLeft = Math.max(0, position.expiresAt - Date.now());
                      const secondsLeft = Math.ceil(timeLeft / 1000);
                      const progress = ((position.duration * 1000 - timeLeft) / (position.duration * 1000)) * 100;

                      return (
                        <div
                          key={position.id}
                          className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                position.type === "UP" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                              }`}>
                                {position.type}
                              </div>
                              <span className="font-bold">{position.asset}</span>
                              <span className="text-slate-400">${position.amount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="font-mono font-bold">{secondsLeft}s</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm mb-2">
                            <div>
                              <span className="text-slate-400">Entry:</span>{" "}
                              <span className="font-mono">${position.entryPrice.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Current:</span>{" "}
                              <span className="font-mono">${currentPrice.toFixed(2)}</span>
                            </div>
                            <div className={
                              (position.type === "UP" && currentPrice > position.entryPrice) ||
                              (position.type === "DOWN" && currentPrice < position.entryPrice)
                                ? "text-green-500"
                                : "text-red-500"
                            }>
                              {(position.type === "UP" && currentPrice > position.entryPrice) ||
                              (position.type === "DOWN" && currentPrice < position.entryPrice)
                                ? "🟢 Winning"
                                : "🔴 Losing"}
                            </div>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-100"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-2">
                  {closedPositions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No trade history yet</p>
                    </div>
                  ) : (
                    closedPositions.map((position) => (
                      <div
                        key={position.id}
                        className={`bg-slate-800 rounded-lg p-4 border ${
                          position.status === "won" ? "border-green-500/30" : "border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                              position.type === "UP" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                            }`}>
                              {position.type}
                            </div>
                            <span className="font-bold">{position.asset}</span>
                            <span className="text-slate-400">${position.amount}</span>
                          </div>
                          <div className={`font-bold ${position.status === "won" ? "text-green-500" : "text-red-500"}`}>
                            {position.status === "won" ? "+" : ""}{position.profit?.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm mt-2 text-slate-400">
                          <div>Entry: ${position.entryPrice.toFixed(2)}</div>
                          <div>Exit: ${position.exitPrice?.toFixed(2)}</div>
                          <div className={position.status === "won" ? "text-green-500" : "text-red-500"}>
                            {position.status === "won" ? "✓ WIN" : "✗ LOSS"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Trade Panel */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 h-fit sticky top-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Trade
          </h3>

          {/* Amount Selection */}
          <div className="mb-4">
            <label className="text-sm text-slate-400 mb-2 block">Investment Amount</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    selectedAmount === amount
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              min="1"
            />
          </div>

          {/* Duration Selection */}
          <div className="mb-6">
            <label className="text-sm text-slate-400 mb-2 block">Trade Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration.seconds}
                  onClick={() => setSelectedDuration(duration)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    selectedDuration.seconds === duration.seconds
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trade Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => openPosition("UP")}
              disabled={isLoading || balance < selectedAmount}
              className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <TrendingUp className="w-6 h-6" />
              UP / HIGHER
            </button>
            <button
              onClick={() => openPosition("DOWN")}
              disabled={isLoading || balance < selectedAmount}
              className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <TrendingDown className="w-6 h-6" />
              DOWN / LOWER
            </button>
          </div>

          {/* Payout Info */}
          <div className="mt-4 p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-400">Investment:</span>
              <span className="font-bold">${selectedAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-400">Payout (85%):</span>
              <span className="font-bold text-green-500">+${(selectedAmount * 0.85).toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-700 my-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Potential Profit:</span>
              <span className="font-bold text-green-500">${(selectedAmount * 1.85).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Selection Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg border border-slate-800 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-xl font-bold">Select Asset</h3>
              <button
                onClick={() => setShowAssetModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-2">
                {ASSETS.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setShowAssetModal(false);
                    }}
                    className={`w-full p-4 rounded-lg text-left transition-colors flex items-center gap-3 ${
                      selectedAsset.symbol === asset.symbol
                        ? "bg-blue-600"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-3xl">{asset.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{asset.symbol}</div>
                      <div className="text-sm text-slate-400">{asset.name}</div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-slate-700 rounded">{asset.category}</div>
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