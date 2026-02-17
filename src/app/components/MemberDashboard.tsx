import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, TrendingDown, Wallet, History, User, LogOut, ChevronRight, DollarSign, Trophy, Clock, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TradingChart } from "./TradingChart";
import { unifiedPriceService } from "../lib/unifiedPriceService";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

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

const POPULAR_ASSETS = [
  { symbol: "BTCUSD", name: "Bitcoin", type: "Crypto" },
  { symbol: "ETHUSD", name: "Ethereum", type: "Crypto" },
  { symbol: "EURUSD", name: "EUR/USD", type: "Forex" },
  { symbol: "GBPUSD", name: "GBP/USD", type: "Forex" },
  { symbol: "GOLD", name: "Gold", type: "Commodity" },
];

const INVESTMENT_AMOUNTS = [10, 25, 50, 100, 250, 500, 1000];
const DURATIONS = [
  { label: "1 Min", value: "1m", seconds: 60 },
  { label: "5 Min", value: "5m", seconds: 300 },
  { label: "15 Min", value: "15m", seconds: 900 },
  { label: "30 Min", value: "30m", seconds: 1800 },
];

export function MemberDashboard() {
  const navigate = useNavigate();
  
  // User & Auth
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  
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

  // Load user session
  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // ✅ Changed from "investoft_access_token"
    if (!token) {
      navigate("/");
      return;
    }
    setAccessToken(token);
    loadUserProfile(token);
  }, []);

  // Subscribe to price updates
  useEffect(() => {
    console.log(`🔌 [MemberDashboard] Subscribing to ${selectedSymbol}...`);
    
    const unsubscribe = unifiedPriceService.subscribe(selectedSymbol, (priceData) => {
      console.log(`💰 [MemberDashboard] Price update: ${priceData.symbol} = $${priceData.price.toFixed(2)}`);
      setPreviousPrice(currentPrice);
      setCurrentPrice(priceData.price);
    });

    return () => {
      console.log(`🔌 [MemberDashboard] Unsubscribing from ${selectedSymbol}`);
      unsubscribe();
    };
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      } else {
        console.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const closePosition = (position: Position) => {
    if (!currentPrice || currentPrice === 0) {
      console.warn("No valid price available, skipping position close");
      return;
    }

    const exitPrice = currentPrice;
    const priceChange = exitPrice - position.entryPrice;
    const isWin = 
      (position.type === "UP" && priceChange > 0) ||
      (position.type === "DOWN" && priceChange < 0);

    const payoutPercentage = 95;
    const profit = isWin ? (position.amount * payoutPercentage) / 100 : -position.amount;

    const closedPosition: Position = {
      ...position,
      status: isWin ? "won" : "lost",
      exitPrice,
      profit,
    };

    // Update positions
    setPositions(prev => prev.filter(p => p.id !== position.id));
    setClosedPositions(prev => [closedPosition, ...prev]);

    // Update balance
    if (userProfile) {
      const newBalance = userProfile.demo_balance + profit;
      setUserProfile({
        ...userProfile,
        demo_balance: newBalance,
        total_trades: userProfile.total_trades + 1,
        winning_trades: isWin ? userProfile.winning_trades + 1 : userProfile.winning_trades,
        losing_trades: !isWin ? userProfile.losing_trades + 1 : userProfile.losing_trades,
      });

      // Save to backend
      updateUserBalance(newBalance, isWin);
    }

    console.log(`📊 Position closed: ${position.asset} ${position.type} | ${isWin ? "WIN" : "LOSS"} | Profit: $${profit.toFixed(2)}`);
  };

  const updateUserBalance = async (newBalance: number, isWin: boolean) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/update-balance`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            demo_balance: newBalance,
            is_win: isWin,
          }),
        }
      );
    } catch (error) {
      console.error("Error updating balance:", error);
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
    
    // Deduct balance immediately
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        demo_balance: userProfile.demo_balance - selectedAmount,
      });
    }

    console.log(`🚀 New ${direction} position opened: ${selectedSymbol} @ $${currentPrice.toFixed(2)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); // ✅ Changed from "investoft_access_token"
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const demoBalance = userProfile?.demo_balance || 10000;
  const winRate = userProfile && userProfile.total_trades > 0
    ? ((userProfile.winning_trades / userProfile.total_trades) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-white">Investoft</h1>
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setActiveTab("trade")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "trade" ? "text-blue-400" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Trading
                </button>
                <button
                  onClick={() => setActiveTab("positions")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "positions" ? "text-blue-400" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Positions
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "history" ? "text-blue-400" : "text-slate-400 hover:text-white"
                  }`}
                >
                  History
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg">
                <Wallet className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-xs text-slate-400">Demo Balance</div>
                  <div className="text-lg font-bold text-white">${demoBalance.toLocaleString()}</div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-400 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === "trade" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 border-slate-800 bg-slate-900">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                    <div>
                      <div className="text-xs text-slate-400">Win Rate</div>
                      <div className="text-xl font-bold text-white">{winRate}%</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-slate-800 bg-slate-900">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-blue-400" />
                    <div>
                      <div className="text-xs text-slate-400">Total Trades</div>
                      <div className="text-xl font-bold text-white">{userProfile?.total_trades || 0}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-slate-800 bg-slate-900">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-green-400" />
                    <div>
                      <div className="text-xs text-slate-400">Open Positions</div>
                      <div className="text-xl font-bold text-white">{positions.length}</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* TradingView Chart */}
              <Card className="p-6 border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedSymbol}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-bold text-white">
                        ${currentPrice.toFixed(2)}
                      </span>
                      <Badge className={currentPrice >= previousPrice ? "bg-green-600" : "bg-red-600"}>
                        {currentPrice >= previousPrice ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-semibold">LIVE</span>
                  </div>
                </div>

                <div className="h-[400px]">
                  <TradingChart symbol={selectedSymbol} theme="dark" />
                </div>

                {/* Price Info */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-slate-400">Data Source:</span>
                      <span className="text-green-300 font-semibold">Binance (1m Candle)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Updated:</span>
                      <span className="text-green-300 font-semibold">Real-time</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Trading Panel */}
            <div className="space-y-6">
              {/* Asset Selector */}
              <Card className="p-4 border-slate-800 bg-slate-900">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">SELECT ASSET</h3>
                <div className="space-y-2">
                  {POPULAR_ASSETS.map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => setSelectedSymbol(asset.symbol)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        selectedSymbol === asset.symbol
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold">{asset.name}</div>
                        <div className="text-xs opacity-70">{asset.type}</div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Investment Amount */}
              <Card className="p-4 border-slate-800 bg-slate-900">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">INVESTMENT AMOUNT</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {INVESTMENT_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`py-2 rounded-lg font-semibold transition-all ${
                        selectedAmount === amount
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">${selectedAmount}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Potential Profit: <span className="text-green-400 font-semibold">${((selectedAmount * 95) / 100).toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              {/* Duration */}
              <Card className="p-4 border-slate-800 bg-slate-900">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">DURATION</h3>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => setSelectedDuration(duration)}
                      className={`py-3 rounded-lg font-semibold transition-all ${
                        selectedDuration.value === duration.value
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Trade Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleTrade("UP")}
                  disabled={isLoading || currentPrice === 0}
                  className="h-16 bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
                >
                  <TrendingUp className="h-6 w-6 mr-2" />
                  UP
                </Button>
                <Button
                  onClick={() => handleTrade("DOWN")}
                  disabled={isLoading || currentPrice === 0}
                  className="h-16 bg-red-600 hover:bg-red-700 text-white font-bold text-lg"
                >
                  <TrendingDown className="h-6 w-6 mr-2" />
                  DOWN
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "positions" && (
          <Card className="p-6 border-slate-800 bg-slate-900">
            <h2 className="text-xl font-bold text-white mb-6">Open Positions</h2>
            
            {positions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No open positions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position) => {
                  const timeLeft = Math.max(0, position.expiresAt - Date.now());
                  const secondsLeft = Math.floor(timeLeft / 1000);
                  const priceChange = currentPrice - position.entryPrice;
                  const isWinning = 
                    (position.type === "UP" && priceChange > 0) ||
                    (position.type === "DOWN" && priceChange < 0);

                  return (
                    <div
                      key={position.id}
                      className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={position.type === "UP" ? "bg-green-600" : "bg-red-600"}>
                            {position.type}
                          </Badge>
                          <span className="font-bold text-white">{position.asset}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Time Left</div>
                          <div className="text-lg font-bold text-white">{secondsLeft}s</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">Entry Price</div>
                          <div className="text-white font-semibold">${position.entryPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Current Price</div>
                          <div className="text-white font-semibold">${currentPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Status</div>
                          <div className={`font-semibold ${isWinning ? "text-green-400" : "text-red-400"}`}>
                            {isWinning ? "Winning" : "Losing"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {activeTab === "history" && (
          <Card className="p-6 border-slate-800 bg-slate-900">
            <h2 className="text-xl font-bold text-white mb-6">Trade History</h2>
            
            {closedPositions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trade history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {closedPositions.map((position) => (
                  <div
                    key={position.id}
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={position.type === "UP" ? "bg-green-600" : "bg-red-600"}>
                          {position.type}
                        </Badge>
                        <div>
                          <div className="font-bold text-white">{position.asset}</div>
                          <div className="text-xs text-slate-400">{position.duration}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${position.status === "won" ? "text-green-400" : "text-red-400"}`}>
                          {position.status === "won" ? "+" : ""}${position.profit?.toFixed(2)}
                        </div>
                        <Badge className={position.status === "won" ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"}>
                          {position.status === "won" ? "WIN" : "LOSS"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-slate-400">Entry</div>
                        <div className="text-white font-semibold">${position.entryPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Exit</div>
                        <div className="text-white font-semibold">${position.exitPrice?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Amount</div>
                        <div className="text-white font-semibold">${position.amount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}