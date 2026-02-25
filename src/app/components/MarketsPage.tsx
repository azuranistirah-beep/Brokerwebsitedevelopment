import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Trophy, Plus, Minus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PositionCountdown } from "./PositionCountdown";
import { SymbolSelector } from "./SymbolSelector";
import { TickerTape } from "./TickerTape";
import { TradingChart } from "./TradingChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useSearchParams } from "react-router";
import { PopularAssets } from "./PopularAssets";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { TradeResultModal } from "./TradeResultModal";
import { tvPriceService } from "../lib/tvPriceService";

interface DemoAccount {
  balance: number;
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  openPositions: number;
}

interface Position {
  id: string;
  asset: string;
  type: 'up' | 'down';
  amount: number;
  entryPrice: number;
  openedAt: string;
  duration: string;
  payout: number;
  expiresAt: number; // timestamp when trade expires
}

interface TradeHistory {
  id: string;
  asset: string;
  type: 'up' | 'down';
  amount: number;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  result: 'win' | 'loss';
  closedAt: string;
}

// ✅ POIN 4: Investment amounts dengan +/- buttons (urutan spesifik $1-$10,000)
const INVESTMENT_AMOUNTS = [1, 2, 5, 10, 15, 20, 30, 50, 100, 200, 250, 300, 500, 750, 1000, 2000, 3000, 5000, 6000, 7000, 8000, 10000];

// ✅ POIN 5: Trade durations dalam bahasa Inggris (termasuk 1 Day)
const DURATIONS = [
  { label: "5 Sec", value: "5s" },
  { label: "15 Sec", value: "15s" },
  { label: "30 Sec", value: "30s" },
  { label: "1 Min", value: "1m" },
  { label: "5 Min", value: "5m" },
  { label: "15 Min", value: "15m" },
  { label: "30 Min", value: "30m" },
  { label: "1 Hour", value: "1h" },
  { label: "4 Hour", value: "4h" },
  { label: "1 Day", value: "1d" },
];

// Asset type detection and market hours
type AssetType = 'crypto' | 'forex' | 'stocks' | 'commodities' | 'indices';

const getAssetType = (symbol: string): AssetType => {
  const upper = symbol.toUpperCase();
  
  // Crypto
  if (upper.includes('BTC') || upper.includes('ETH') || upper.includes('BNB') || 
      upper.includes('XRP') || upper.includes('SOL') || upper.includes('ADA')) {
    return 'crypto';
  }
  
  // Forex
  if (upper.includes('USD') || upper.includes('EUR') || upper.includes('GBP') || 
      upper.includes('JPY') || upper.includes('AUD') || upper.includes('CAD') || 
      upper.includes('CHF') || upper.includes('NZD')) {
    return 'forex';
  }
  
  // Commodities
  if (upper.includes('XAU') || upper.includes('XAG') || upper.includes('WTI') || 
      upper.includes('BRENT') || upper.includes('OIL') || upper.includes('GOLD') || 
      upper.includes('SILVER')) {
    return 'commodities';
  }
  
  // Indices
  if (upper.includes('SPX') || upper.includes('NSX') || upper.includes('DJI') || 
      upper.includes('UK100') || upper.includes('GER') || upper.includes('JPN')) {
    return 'indices';
  }
  
  // Default to stocks
  return 'stocks';
};

const getMarketStatus = (symbol: string): { isOpen: boolean; message: string } => {
  const assetType = getAssetType(symbol);
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours + minutes / 60;
  
  switch (assetType) {
    case 'crypto':
      return { isOpen: true, message: 'Market Open 24/7' };
    
    case 'forex':
      // Forex: Monday 00:00 - Friday 23:59
      if (day === 0 || day === 6) {
        return { isOpen: false, message: 'Forex Market Closed (Weekend)' };
      }
      return { isOpen: true, message: 'Forex Market Open 24/5' };
    
    case 'stocks':
      // US Stocks: Monday-Friday, 09:30 - 16:00 EST (assuming local time is close to EST)
      if (day === 0 || day === 6) {
        return { isOpen: false, message: 'Stock Market Closed (Weekend)' };
      }
      if (currentTime >= 9.5 && currentTime <= 16) {
        return { isOpen: true, message: 'Stock Market Open' };
      }
      return { isOpen: false, message: 'Stock Market Closed (After Hours)' };
    
    case 'commodities':
      // Commodities: Similar to forex, mostly 24/5
      if (day === 0 || day === 6) {
        return { isOpen: false, message: 'Commodities Market Closed (Weekend)' };
      }
      return { isOpen: true, message: 'Commodities Market Open' };
    
    case 'indices':
      // Indices: Follow respective market hours, simplified as weekdays
      if (day === 0 || day === 6) {
        return { isOpen: false, message: 'Index Market Closed (Weekend)' };
      }
      if (currentTime >= 9.5 && currentTime <= 16) {
        return { isOpen: true, message: 'Index Market Open' };
      }
      return { isOpen: false, message: 'Index Market Closed (After Hours)' };
    
    default:
      return { isOpen: true, message: 'Market Status Unknown' };
  }
};

export function MarketsPage() {
  // Debug log at component mount
  console.log('🎬 [MarketsPage] Component mounted - Using tvPriceService for real-time prices');
  
  const [searchParams] = useSearchParams();
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState("1d");
  const [currentPrice, setCurrentPrice] = useState<number>(0); // ✅ Start with 0 to detect if price updates work
  const [previousPrice, setPreviousPrice] = useState<number>(0); // ✅ Start with 0 to detect if price updates work
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [selectedDuration, setSelectedDuration] = useState("1m");
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<TradeHistory[]>([]);
  const [priceSource, setPriceSource] = useState<'binance_spot' | 'mock'>('binance_spot');
  const [demoAccount, setDemoAccount] = useState<DemoAccount>({
    balance: 10000,
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
    openPositions: 0
  });
  
  // ✅ Trade Result Modal State
  const [showTradeResultModal, setShowTradeResultModal] = useState(false);
  const [tradeResultData, setTradeResultData] = useState<{
    result: 'win' | 'loss';
    profit: number;
    asset: string;
    direction: 'up' | 'down';
    entryPrice: number;
    exitPrice: number;
    priceChange: number;
    priceChangePercent: number;
    duration: string;
    newBalance: number;
    winRate: number;
    totalProfit: number;
  } | null>(null);
  
  // ✅ Handle URL filter parameter
  useEffect(() => {
    const filter = searchParams.get('filter');
    const symbol = searchParams.get('symbol');
    
    // If symbol is directly provided, convert to TradingView format
    if (symbol) {
      console.log(`🎯 Direct symbol from URL: ${symbol}`);
      
      // ✅ MAP SEARCH SYMBOL TO TRADINGVIEW FORMAT
      const symbolMap: Record<string, string> = {
        // Crypto - Expanded list
        'BTCUSD': 'BINANCE:BTCUSDT',
        'ETHUSD': 'BINANCE:ETHUSDT',
        'BNBUSD': 'BINANCE:BNBUSDT',
        'SOLUSD': 'BINANCE:SOLUSDT',
        'XRPUSD': 'BINANCE:XRPUSDT',
        'ADAUSD': 'BINANCE:ADAUSDT',
        'DOGEUSD': 'BINANCE:DOGEUSDT',
        'MATICUSD': 'BINANCE:MATICUSDT',
        'TRXUSD': 'BINANCE:TRXUSDT',
        'DOTUSD': 'BINANCE:DOTUSDT',
        'LTCUSD': 'BINANCE:LTCUSDT',
        'AVAXUSD': 'BINANCE:AVAXUSDT',
        'LINKUSD': 'BINANCE:LINKUSDT',
        'ATOMUSD': 'BINANCE:ATOMUSDT',
        'UNIUSD': 'BINANCE:UNIUSDT',
        'ETCUSD': 'BINANCE:ETCUSDT',
        'XLMUSD': 'BINANCE:XLMUSDT',
        'BCHUSD': 'BINANCE:BCHUSDT',
        'NEARUSD': 'BINANCE:NEARUSDT',
        
        // Forex
        'EURUSD': 'FX:EURUSD',
        'GBPUSD': 'FX:GBPUSD',
        'USDJPY': 'FX:USDJPY',
        'AUDUSD': 'FX:AUDUSD',
        'USDCAD': 'FX:USDCAD',
        'NZDUSD': 'FX:NZDUSD',
        'USDCHF': 'FX:USDCHF',
        
        // Stocks
        'AAPL': 'NASDAQ:AAPL',
        'TSLA': 'NASDAQ:TSLA',
        'GOOGL': 'NASDAQ:GOOGL',
        'MSFT': 'NASDAQ:MSFT',
        'AMZN': 'NASDAQ:AMZN',
        'NVDA': 'NASDAQ:NVDA',
        'META': 'NASDAQ:META',
        'JPM': 'NYSE:JPM',
        
        // Commodities (support both GOLD and XAUUSD)
        'GOLD': 'TVC:GOLD',
        'XAUUSD': 'TVC:GOLD',
        'SILVER': 'TVC:SILVER',
        'XAGUSD': 'TVC:SILVER',
        'USOIL': 'TVC:USOIL',
        'UKOIL': 'TVC:UKOIL',
      };
      
      const tradingViewSymbol = symbolMap[symbol.toUpperCase()] || symbol;
      console.log(`📊 Mapped ${symbol} → ${tradingViewSymbol}`);
      setSelectedSymbol(tradingViewSymbol);
      return;
    }
    
    // Otherwise, use filter to set default symbol
    if (filter) {
      // Map filter to default symbol for that category
      const filterMap: Record<string, string> = {
        'crypto': 'BINANCE:BTCUSDT',
        'stocks': 'NASDAQ:AAPL',
        'forex': 'FX:EURUSD',
        'commodities': 'TVC:GOLD'
      };
      
      const newSymbol = filterMap[filter.toLowerCase()] || 'BINANCE:BTCUSDT';
      console.log(`🔍 Filter detected: ${filter} → Setting symbol to ${newSymbol}`);
      setSelectedSymbol(newSymbol);
    }
  }, [searchParams]);
  
  const marketStatus = getMarketStatus(selectedSymbol);
  const payoutPercentage = 95;
  const potentialProfit = (selectedAmount * payoutPercentage) / 100;

  // ✅ REAL-TIME PRICE from Binance WebSocket via Supabase Edge Function
  // Convert TradingView symbol to Binance format
  const convertToBinanceSymbol = (tvSymbol: string): string | null => {
    const symbolMap: Record<string, string> = {
      'BINANCE:BTCUSDT': 'BTCUSD',
      'BINANCE:ETHUSDT': 'ETHUSD',
      'BINANCE:BNBUSDT': 'BNBUSD',
      'BINANCE:XRPUSDT': 'XRPUSD',
      'BINANCE:SOLUSDT': 'SOLUSD',
      'BINANCE:ADAUSDT': 'ADAUSD',
      'BINANCE:DOGEUSDT': 'DOGEUSD',
      'BINANCE:DOTUSDT': 'DOTUSD',
      'BINANCE:MATICUSDT': 'MATICUSD',
      'BINANCE:TRXUSDT': 'TRXUSD',
      'BINANCE:LTCUSDT': 'LTCUSD',
      'BINANCE:AVAXUSDT': 'AVAXUSD',
      'BINANCE:LINKUSDT': 'LINKUSD',
      'BINANCE:ATOMUSDT': 'ATOMUSD',
      'BINANCE:UNIUSDT': 'UNIUSD',
      'BINANCE:ETCUSDT': 'ETCUSD',
      'BINANCE:XLMUSDT': 'XLMUSD',
      'BINANCE:BCHUSDT': 'BCHUSD',
      'BINANCE:NEARUSDT': 'NEARUSD',
    };
    
    return symbolMap[tvSymbol] || null;
  };

  useEffect(() => {
    const binanceSymbol = convertToBinanceSymbol(selectedSymbol);
    
    if (!binanceSymbol) {
      console.log(`⚠️ [MarketsPage] Symbol ${selectedSymbol} is not a Binance crypto pair. Using fallback price.`);
      // For non-crypto assets (forex, stocks, commodities), keep current price or set a default
      return;
    }

    console.log(`🔌 [MarketsPage] Subscribing to ${binanceSymbol} (from ${selectedSymbol})...`);
    
    const unsubscribe = tvPriceService.subscribe(binanceSymbol, (priceData) => {
      console.log(`💹 [MarketsPage] Price update for ${binanceSymbol}: $${priceData.price.toFixed(2)}`);
      setCurrentPrice(prev => {
        setPreviousPrice(prev);
        return priceData.price;
      });
    });
    
    return () => {
      console.log(`🧹 [MarketsPage] Unsubscribing from ${binanceSymbol}...`);
      unsubscribe();
    };
  }, [selectedSymbol]);

  // Check for expired positions every second
  useEffect(() => {
    const checkExpiredPositions = () => {
      const now = Date.now();
      const expiredPositions = positions.filter(p => p.expiresAt <= now);
      
      if (expiredPositions.length > 0) {
        console.log(`⏰ Found ${expiredPositions.length} expired position(s)!`);
        expiredPositions.forEach(position => {
          // ✅ CRITICAL: Use current price from state (updated from TradingChart onPriceUpdate)
          // This ensures exit price matches what's shown in the UI
          const realExitPrice = currentPrice;
          
          if (!realExitPrice || realExitPrice === 0) {
            console.warn(`⚠️ No valid price available for ${position.asset}, skipping position close. Will retry.`);
            return; // Skip this position, will be checked again in next interval
          }
          
          console.log(`📊 Closing position: ${position.asset} ${position.type} | Entry: $${position.entryPrice.toFixed(2)} | Exit: $${realExitPrice.toFixed(2)} (from TradingChart)`);
          closePositionWithRealPrice(position, realExitPrice);
        });
      }
    };

    const interval = setInterval(checkExpiredPositions, 1000);
    return () => clearInterval(interval);
  }, [positions, currentPrice]);

  const closePositionWithRealPrice = (position: Position, exitPrice: number) => {
    // ✅ CRITICAL: Use REAL price from TradingView chart
    // WIN condition: UP trade wins if exit > entry, DOWN trade wins if exit < entry
    const isWin = position.type === 'up' 
      ? exitPrice > position.entryPrice 
      : exitPrice < position.entryPrice;
    
    const profit = isWin ? (position.amount * position.payout) / 100 : -position.amount;
    const returnAmount = isWin ? position.amount + profit : 0;

    const trade: TradeHistory = {
      id: position.id,
      asset: position.asset,
      type: position.type,
      amount: position.amount,
      entryPrice: position.entryPrice,
      exitPrice,
      profit,
      result: isWin ? 'win' : 'loss',
      closedAt: new Date().toISOString()
    };

    //  FIX: Calculate stats BEFORE setState to avoid scope issues
    let newWinRate = 0;
    let newTotalTrades = 0;
    let newTotalProfit = 0;

    // ✅ CRITICAL FIX: Use functional setState to avoid stale state
    setHistory(prevHistory => {
      const updatedHistory = [trade, ...prevHistory];
      
      // Calculate stats based on NEW history
      newTotalTrades = updatedHistory.length;
      const wins = updatedHistory.filter(h => h.result === 'win').length;
      newWinRate = newTotalTrades > 0 ? (wins / newTotalTrades) * 100 : 0;
      newTotalProfit = updatedHistory.reduce((sum, h) => sum + h.profit, 0);
      
      // Update account stats with calculated values
      setDemoAccount(prev => ({
        ...prev,
        balance: prev.balance + returnAmount,
        totalTrades: newTotalTrades,
        winRate: newWinRate,
        totalProfit: newTotalProfit,
        openPositions: prev.openPositions - 1
      }));
      
      // Enhanced logging
      console.log(`🔔 TRADE RESULT: ${isWin ? 'WIN' : 'LOSS'} | ${position.asset} ${position.type} | Entry: $${position.entryPrice.toFixed(2)} → Exit: $${exitPrice.toFixed(2)} | P/L: $${profit.toFixed(2)}`);
      console.log(`📊 UPDATED STATS: Total Trades: ${newTotalTrades} | Wins: ${wins} | Win Rate: ${newWinRate.toFixed(2)}% | Total Profit: $${newTotalProfit.toFixed(2)}`);
      console.log(`📋 History Length: ${updatedHistory.length} | Account Total Trades: ${newTotalTrades}`);
      
      return updatedHistory;
    });
    
    // Remove position from open positions
    setPositions(prev => prev.filter(p => p.id !== position.id));

    // Show notification
    const priceChangeValue = exitPrice - position.entryPrice;
    const priceChangePercent = ((priceChangeValue / position.entryPrice) * 100).toFixed(2);
    
    if (isWin) {
      toast.success(
        `🎉 TRADE WIN! +$${profit.toFixed(2)}`, 
        {
          description: `${position.asset} ${position.type.toUpperCase()} • Entry: $${position.entryPrice.toFixed(2)} → Exit: $${exitPrice.toFixed(2)} (${Number(priceChangePercent) > 0 ? '+' : ''}${priceChangePercent}%)`,
          duration: 10000,
        }
      );
    } else {
      toast.error(
        `❌ TRADE LOSS! -$${Math.abs(profit).toFixed(2)}`, 
        {
          description: `${position.asset} ${position.type.toUpperCase()} • Entry: $${position.entryPrice.toFixed(2)} → Exit: $${exitPrice.toFixed(2)} (${Number(priceChangePercent) > 0 ? '+' : ''}${priceChangePercent}%)`,
          duration: 10000,
        }
      );
    }

    // ✅ Update Trade Result Modal Data
    setTradeResultData({
      result: isWin ? 'win' : 'loss',
      profit: profit,
      asset: position.asset,
      direction: position.type,
      entryPrice: position.entryPrice,
      exitPrice: exitPrice,
      priceChange: priceChangeValue,
      priceChangePercent: Number(priceChangePercent),
      duration: position.duration,
      newBalance: demoAccount.balance + returnAmount,
      winRate: newWinRate,
      totalProfit: newTotalProfit
    });
    setShowTradeResultModal(true);
  };

  const handleTrade = (type: 'up' | 'down') => {
    // Check market hours
    if (!marketStatus.isOpen) {
      toast.error(`Cannot trade: ${marketStatus.message}`);
      return;
    }

    if (demoAccount.balance < selectedAmount) {
      toast.error("Insufficient balance!");
      return;
    }

    // ✅ CRITICAL: Use current price from TradingView (via state)
    // This is the EXACT price shown in the UI and extracted from TradingView chart
    const realEntryPrice = currentPrice;
    
    if (!realEntryPrice || realEntryPrice === 0) {
      toast.error("Waiting for price data... Please try again in a moment.");
      return;
    }
    
    console.log(`\n========================================`);
    console.log(`🔥 TRADE OPENED: ${type.toUpperCase()} ${selectedSymbol}`);
    console.log(`💰 Entry Price (EXACT from TradingView): $${realEntryPrice.toFixed(2)}`);
    console.log(`📊 Investment Amount: $${selectedAmount.toFixed(2)}`);
    console.log(`⏱️  Duration: ${selectedDuration}`);
    console.log(`========================================\n`);

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      asset: selectedSymbol, // ✅ CRITICAL: Save symbol for price lookup later
      type,
      amount: selectedAmount,
      entryPrice: realEntryPrice, // ✅ Use REAL price from service
      openedAt: new Date().toISOString(),
      duration: selectedDuration,
      payout: payoutPercentage,
      expiresAt: Date.now() + parseDuration(selectedDuration)
    };

    setPositions([...positions, newPosition]);
    setDemoAccount({
      ...demoAccount,
      balance: demoAccount.balance - selectedAmount,
      openPositions: demoAccount.openPositions + 1
    });

    // Show success notification with REAL entry price
    toast.success(`Trade opened: ${type.toUpperCase()} ${selectedSymbol} - $${selectedAmount.toFixed(2)}`, {
      description: `Entry price: $${realEntryPrice.toFixed(2)} (LIVE) • Duration: ${selectedDuration} • Potential profit: +$${potentialProfit.toFixed(2)}`
    });

    // Position will auto-close via useEffect when expired
  };

  const parseDuration = (duration: string): number => {
    const value = parseInt(duration);
    const unit = duration.slice(-1);
    
    if (unit === 's') return value * 1000;
    if (unit === 'm') return value * 60 * 1000;
    if (unit === 'h') return value * 60 * 60 * 1000;
    if (unit === 'd') return value * 24 * 60 * 60 * 1000;
    return 60000; // default 1 minute
  };

  // ✅ POIN 4: Handle amount increase/decrease with +/- buttons
  const handleAmountIncrease = () => {
    const currentIndex = INVESTMENT_AMOUNTS.indexOf(selectedAmount);
    if (currentIndex < INVESTMENT_AMOUNTS.length - 1) {
      setSelectedAmount(INVESTMENT_AMOUNTS[currentIndex + 1]);
    }
  };

  const handleAmountDecrease = () => {
    const currentIndex = INVESTMENT_AMOUNTS.indexOf(selectedAmount);
    if (currentIndex > 0) {
      setSelectedAmount(INVESTMENT_AMOUNTS[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Ticker Tape */}
      <div className="bg-slate-900 border-b border-slate-800">
        <TickerTape colorTheme="dark" />
      </div>
      
      <div className="pt-4">
        <div className="container mx-auto px-4">
          {/* Demo Account Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Markets</h1>
              <p className="text-slate-400 text-sm">Practice trading with virtual funds</p>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg w-full sm:w-auto">
              <div className="text-xs opacity-90 mb-1">Demo Account Balance</div>
              <div className="text-2xl font-bold">${demoAccount.balance.toLocaleString()}</div>
            </div>
          </div>

          {/* ✅ POIN 3: Trading Stats - Sinkronisasi akurat */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 border-slate-800 bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Total Trades</div>
                  <div className="text-xl font-bold text-white">{demoAccount.totalTrades}</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-slate-800 bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/20 p-2 rounded-lg">
                  <Trophy className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Win Rate</div>
                  <div className="text-xl font-bold text-white">{demoAccount.winRate.toFixed(1)}%</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-slate-800 bg-slate-900">
              <div className="flex items-center gap-3">
                <div className={`${demoAccount.totalProfit >= 0 ? 'bg-green-600/20' : 'bg-red-600/20'} p-2 rounded-lg`}>
                  <DollarSign className={`h-5 w-5 ${demoAccount.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Total Profit</div>
                  <div className={`text-xl font-bold ${demoAccount.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${demoAccount.totalProfit.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-slate-800 bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600/20 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Open Positions</div>
                  <div className="text-xl font-bold text-white">{demoAccount.openPositions}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* ✅ POIN 6 & 7: New Layout - Chart Full Width, Controls Below */}
          <div className="space-y-6">
            {/* Chart Area - Full Width */}
            <Card className="p-4 border-slate-800 bg-slate-900">
              {/* ✅ Symbol Selector Only */}
              <div className="mb-4 pb-4 border-b border-slate-800">
                <SymbolSelector 
                  selectedSymbol={selectedSymbol}
                  onSymbolChange={(newSymbol) => {
                    console.log(`🎯 [Markets] User selected symbol: "${newSymbol}"`);
                    setSelectedSymbol(newSymbol);
                  }}
                />
              </div>

              {/* TradingView Chart */}
              <div className="h-[500px]">
                <TradingChart 
                  key={selectedSymbol} // ✅ Force re-mount when symbol changes
                  symbol={selectedSymbol}
                  theme="dark"
                />
              </div>
              
              {/* ✅ SIMPLIFIED PRICE DISPLAY - Show only essential info */}
              <div className="mt-4 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-green-400">LIVE REAL-TIME PRICING</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Current Price:</span>
                    <span className="text-xl font-bold text-white">${currentPrice.toFixed(2)}</span>
                    <Badge className={currentPrice >= previousPrice ? "bg-green-600 text-xs" : "bg-red-600 text-xs"}>
                      {currentPrice >= previousPrice ? '▲' : '▼'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* ✅ POIN 6: Trading Controls - BELOW CHART (Popular Assets moved to bottom) */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* ✅ POIN 4: Investment Amount dengan +/- buttons */}
              <Card className="p-6 border-slate-800 bg-slate-900">
                <h3 className="font-bold text-white mb-4">Investment Amount</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAmountDecrease}
                    disabled={INVESTMENT_AMOUNTS.indexOf(selectedAmount) === 0}
                    className="border-2 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 bg-slate-950 border-2 border-blue-500/50 rounded-lg px-4 py-3 text-center">
                    <div className="text-2xl font-bold text-blue-300">${selectedAmount.toLocaleString()}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAmountIncrease}
                    disabled={INVESTMENT_AMOUNTS.indexOf(selectedAmount) === INVESTMENT_AMOUNTS.length - 1}
                    className="border-2 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-slate-400 text-center">
                  Range: $1 - $10,000
                </div>
              </Card>

              {/* ✅ POIN 5: Trade Duration - Dalam bahasa Inggris sampai 1 Day */}
              <Card className="p-6 border-slate-800 bg-slate-900">
                <h3 className="font-bold text-white mb-4">Trade Duration</h3>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      variant={selectedDuration === duration.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDuration(duration.value)}
                      className={selectedDuration === duration.value 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs border-0" 
                        : "border-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:border-slate-600 hover:text-white text-xs"
                      }
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Trade Summary & Buttons */}
              <Card className="p-6 border-slate-800 bg-slate-900">
                <h3 className="font-bold text-white mb-4">Execute Trade</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Market Status</span>
                    <Badge className={marketStatus.isOpen ? "bg-green-600" : "bg-red-600"}>
                      {marketStatus.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Potential Profit</span>
                    <span className="font-bold text-green-400">+${potentialProfit.toFixed(2)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleTrade('up')}
                    disabled={!marketStatus.isOpen}
                    className="bg-green-600 hover:bg-green-700 text-white h-12 font-bold shadow-lg disabled:opacity-50"
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                    UP
                  </Button>
                  <Button 
                    onClick={() => handleTrade('down')}
                    disabled={!marketStatus.isOpen}
                    className="bg-red-600 hover:bg-red-700 text-white h-12 font-bold shadow-lg disabled:opacity-50"
                  >
                    <TrendingDown className="mr-2 h-5 w-5" />
                    DOWN
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Positions and History Tabs */}
          <Card className="mt-6 border-slate-800 bg-slate-900">
            <Tabs defaultValue="positions" className="w-full">
              <TabsList className="w-full justify-start border-b border-slate-800 bg-transparent rounded-none h-12">
                <TabsTrigger value="positions" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none text-slate-400 data-[state=active]:text-white">
                  Open Positions ({positions.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none text-slate-400 data-[state=active]:text-white">
                  History ({history.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="positions" className="p-6">
                {positions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-300 text-lg font-medium mb-2">No open positions</div>
                    <div className="text-slate-500 text-sm">Start trading to see your positions here.</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions.map((position) => (
                      <Card key={position.id} className="p-4 border-slate-700 bg-slate-900/50 hover:bg-slate-800/70 transition-colors">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-lg text-white">{position.asset}</div>
                              <div className="text-sm text-slate-400 mt-1">
                                Entry: <span className="font-semibold text-blue-400">${position.entryPrice.toFixed(2)}</span>
                              </div>
                              <div className="text-sm text-slate-400">
                                Amount: <span className="font-semibold text-blue-400">${position.amount.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={position.type === 'up' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
                                {position.type.toUpperCase()}
                              </Badge>
                              <div className="text-xs text-slate-400">
                                Duration: {position.duration}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                            <span className="text-xs text-slate-400 font-medium">Time Remaining:</span>
                            <PositionCountdown expiresAt={position.expiresAt} />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="p-6">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-300 text-lg font-medium mb-2">No trade history yet</div>
                    <div className="text-slate-500 text-sm">Complete your first trade to see results here.</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((trade) => (
                      <Card key={trade.id} className="p-4 border-slate-700 bg-slate-900/50 hover:bg-slate-800/70 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white">{trade.asset}</div>
                            <div className="text-sm text-slate-400">
                              Entry: <span className="text-blue-400">${trade.entryPrice.toFixed(2)}</span> → Exit: <span className="text-blue-400">${trade.exitPrice.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(trade.closedAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={trade.result === 'win' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
                              {trade.result.toUpperCase()}
                            </Badge>
                            <div className={`text-lg font-bold mt-1 ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      {/* Popular Assets Section - Expanded */}
      <PopularAssets 
        assets={[
          // Crypto (8)
          { symbol: "BINANCE:BTCUSDT", name: "Bitcoin" },
          { symbol: "BINANCE:ETHUSDT", name: "Ethereum" },
          { symbol: "BINANCE:BNBUSDT", name: "Binance Coin" },
          { symbol: "BINANCE:XRPUSDT", name: "Ripple" },
          { symbol: "BINANCE:SOLUSDT", name: "Solana" },
          { symbol: "BINANCE:ADAUSDT", name: "Cardano" },
          { symbol: "BINANCE:DOGEUSDT", name: "Dogecoin" },
          { symbol: "BINANCE:DOTUSDT", name: "Polkadot" },
          
          // Stocks (8)
          { symbol: "NASDAQ:AAPL", name: "Apple Inc" },
          { symbol: "NASDAQ:MSFT", name: "Microsoft" },
          { symbol: "NASDAQ:GOOGL", name: "Google" },
          { symbol: "NASDAQ:AMZN", name: "Amazon" },
          { symbol: "NASDAQ:TSLA", name: "Tesla" },
          { symbol: "NASDAQ:NVDA", name: "NVIDIA" },
          { symbol: "NASDAQ:META", name: "Meta" },
          { symbol: "NYSE:JPM", name: "JPMorgan" },
          
          // Forex (6)
          { symbol: "FX:EURUSD", name: "EUR/USD" },
          { symbol: "FX:GBPUSD", name: "GBP/USD" },
          { symbol: "FX:USDJPY", name: "USD/JPY" },
          { symbol: "FX:AUDUSD", name: "AUD/USD" },
          { symbol: "FX:USDCAD", name: "USD/CAD" },
          { symbol: "FX:NZDUSD", name: "NZD/USD" },
          
          // Commodities (2)
          { symbol: "TVC:GOLD", name: "Gold" },
          { symbol: "TVC:SILVER", name: "Silver" },
        ]}
        title="Popular Assets"
        description="Track and trade the most popular stocks, cryptocurrencies, forex pairs, and commodities"
      />
      
      {/* ✅ Trade Result Modal */}
      {tradeResultData && (
        <TradeResultModal
          isOpen={showTradeResultModal}
          onClose={() => setShowTradeResultModal(false)}
          result={tradeResultData.result}
          profit={tradeResultData.profit}
          asset={tradeResultData.asset}
          direction={tradeResultData.direction}
          entryPrice={tradeResultData.entryPrice}
          exitPrice={tradeResultData.exitPrice}
          priceChange={tradeResultData.priceChange}
          priceChangePercent={tradeResultData.priceChangePercent}
          duration={tradeResultData.duration}
          newBalance={tradeResultData.newBalance}
          winRate={tradeResultData.winRate}
          totalProfit={tradeResultData.totalProfit}
          onTradeAgain={() => {
            // Scroll to top and reset
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onViewHistory={() => {
            // Switch to history tab
            const historyTab = document.querySelector('[value="history"]') as HTMLElement;
            historyTab?.click();
          }}
        />
      )}
    </div>
  );
}