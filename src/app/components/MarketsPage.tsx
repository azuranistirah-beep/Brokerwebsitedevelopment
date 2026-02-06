import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown, Clock, DollarSign, Target, Trophy, Activity } from "lucide-react";
import { TickerTape } from "./TickerTape";
import { TradingChart } from "./TradingChart";
import { toast } from "sonner";
import { PositionCountdown } from "./PositionCountdown";

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

const INVESTMENT_AMOUNTS = [1, 2, 5, 10, 20, 30, 40, 50, 100, 250, 500, 1000, 3000, 5000, 10000, 25000, 50000, 100000];
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

const isMarketOpen = (symbol: string): { isOpen: boolean; message: string } => {
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
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [selectedDuration, setSelectedDuration] = useState("1m");
  const [demoAccount, setDemoAccount] = useState<DemoAccount>({
    balance: 200000,
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
    openPositions: 0
  });
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<TradeHistory[]>([]);
  const [currentPrice, setCurrentPrice] = useState(65000);

  const payoutPercentage = 95;
  const potentialProfit = (selectedAmount * payoutPercentage) / 100;
  const marketStatus = isMarketOpen(selectedSymbol);

  // Log price updates
  useEffect(() => {
    console.log(`💵 Price updated: ${selectedSymbol} = $${currentPrice.toFixed(2)}`);
  }, [currentPrice, selectedSymbol]);

  // Check for expired positions every second
  useEffect(() => {
    const checkExpiredPositions = () => {
      const now = Date.now();
      const expiredPositions = positions.filter(p => p.expiresAt <= now);
      
      if (expiredPositions.length > 0) {
        console.log(`⏰ Found ${expiredPositions.length} expired position(s)!`);
        expiredPositions.forEach(position => {
          console.log(`📊 Closing position: ${position.asset} ${position.type} | Current Price: $${currentPrice}`);
          closePositionWithRealPrice(position, currentPrice);
        });
      }
    };

    const interval = setInterval(checkExpiredPositions, 1000);
    return () => clearInterval(interval);
  }, [positions, currentPrice]);

  const closePositionWithRealPrice = (position: Position, exitPrice: number) => {
    // Use REAL price from TradingView chart
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

    // Update state
    setHistory(prev => [trade, ...prev]);
    setPositions(prev => prev.filter(p => p.id !== position.id));
    
    const newTotalTrades = demoAccount.totalTrades + 1;
    const newTotalProfit = demoAccount.totalProfit + profit;
    const allTrades = [trade, ...history];
    const wins = allTrades.filter(h => h.result === 'win').length;
    const newWinRate = (wins / newTotalTrades) * 100;

    setDemoAccount(prev => ({
      ...prev,
      balance: prev.balance + returnAmount,
      totalTrades: newTotalTrades,
      winRate: newWinRate,
      totalProfit: newTotalProfit,
      openPositions: prev.openPositions - 1
    }));

    // Show BIG notification with result
    const priceChange = exitPrice - position.entryPrice;
    const priceChangePercent = ((priceChange / position.entryPrice) * 100).toFixed(2);
    
    if (isWin) {
      toast.success(
        `🎉 TRADE WIN! +$${profit.toFixed(2)}`, 
        {
          description: `${position.asset} ${position.type.toUpperCase()} • Entry: $${position.entryPrice.toFixed(2)} → Exit: $${exitPrice.toFixed(2)} (${Number(priceChangePercent) > 0 ? '+' : ''}${priceChangePercent}%)`,
          duration: 10000,
          action: {
            label: "View History",
            onClick: () => console.log("View history")
          }
        }
      );
    } else {
      toast.error(
        `❌ TRADE LOSS! -$${Math.abs(profit).toFixed(2)}`, 
        {
          description: `${position.asset} ${position.type.toUpperCase()} • Entry: $${position.entryPrice.toFixed(2)} → Exit: $${exitPrice.toFixed(2)} (${Number(priceChangePercent) > 0 ? '+' : ''}${priceChangePercent}%)`,
          duration: 10000,
          action: {
            label: "Try Again",
            onClick: () => console.log("Try again")
          }
        }
      );
    }

    // Log to console for debugging
    console.log(`🔔 TRADE RESULT: ${isWin ? 'WIN' : 'LOSS'} | ${position.asset} ${position.type} | Entry: $${position.entryPrice.toFixed(2)} → Exit: $${exitPrice.toFixed(2)} (${priceChangePercent}%) | P/L: $${profit.toFixed(2)}`);
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

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      asset: selectedSymbol,
      type,
      amount: selectedAmount,
      entryPrice: currentPrice,
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

    // Show success notification
    toast.success(`Trade opened: ${type.toUpperCase()} ${selectedSymbol} - $${selectedAmount.toFixed(2)}`, {
      description: `Entry price: $${currentPrice.toFixed(2)} • Duration: ${selectedDuration}`
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

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Ticker Tape */}
      <div className="bg-white border-b border-slate-200">
        <TickerTape colorTheme="light" />
      </div>
      
      <div className="pt-4">
        <div className="container mx-auto px-4">
          {/* Demo Account Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Trading Demo</h1>
              <p className="text-slate-500 text-sm">Practice trading with virtual funds</p>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg">
              <div className="text-xs opacity-90 mb-1">Demo Account Balance</div>
              <div className="text-2xl font-bold">${demoAccount.balance.toLocaleString()}</div>
            </div>
          </div>

          {/* Trading Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total Trades</div>
                  <div className="text-xl font-bold text-slate-900">{demoAccount.totalTrades}</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Win Rate</div>
                  <div className="text-xl font-bold text-slate-900">{demoAccount.winRate.toFixed(1)}%</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className={`${demoAccount.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-2 rounded-lg`}>
                  <DollarSign className={`h-5 w-5 ${demoAccount.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total Profit</div>
                  <div className={`text-xl font-bold ${demoAccount.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${demoAccount.totalProfit.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Open Positions</div>
                  <div className="text-xl font-bold text-slate-900">{demoAccount.openPositions}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Trading Interface */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2">
              <Card className="p-4 border-slate-200 bg-white">
                {/* Real-time Price Display */}
                <div className="mb-4 flex justify-between items-center bg-slate-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Current Price</div>
                    <div className="text-3xl font-bold text-slate-900">${currentPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">{selectedSymbol}</div>
                    <Badge className="bg-blue-600">Live</Badge>
                  </div>
                </div>
                <div className="h-[500px]">
                  <TradingChart 
                    symbol={selectedSymbol}
                    onPriceUpdate={setCurrentPrice}
                  />
                </div>
              </Card>
            </div>

            {/* Trading Panel */}
            <div className="space-y-6">
              {/* Investment Amount */}
              <Card className="p-6 border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-4">Investment Amount</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {INVESTMENT_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAmount(amount)}
                      className={selectedAmount === amount 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                      }
                    >
                      {formatAmount(amount)}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Trade Duration */}
              <Card className="p-6 border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-4">Trade Duration</h3>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      variant={selectedDuration === duration.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDuration(duration.value)}
                      className={selectedDuration === duration.value 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                      }
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Trade Summary */}
              <Card className="p-6 border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-4">Trade Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Market Status</span>
                    <Badge className={marketStatus.isOpen ? "bg-green-600" : "bg-red-600"}>
                      {marketStatus.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 -mt-1">{marketStatus.message}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Investment</span>
                    <span className="font-bold text-slate-900">${selectedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Potential Profit</span>
                    <span className="font-bold text-green-600">+${potentialProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Payout</span>
                    <span className="font-bold text-blue-600">{payoutPercentage}%</span>
                  </div>
                </div>
              </Card>

              {/* UP/DOWN Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleTrade('up')}
                  disabled={!marketStatus.isOpen}
                  className="bg-green-600 hover:bg-green-700 text-white h-16 text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp className="mr-2 h-6 w-6" />
                  UP
                </Button>
                <Button 
                  onClick={() => handleTrade('down')}
                  disabled={!marketStatus.isOpen}
                  className="bg-red-600 hover:bg-red-700 text-white h-16 text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingDown className="mr-2 h-6 w-6" />
                  DOWN
                </Button>
              </div>
            </div>
          </div>

          {/* Positions and History Tabs */}
          <Card className="mt-6 border-slate-200 bg-white">
            <Tabs defaultValue="positions" className="w-full">
              <TabsList className="w-full justify-start border-b border-slate-200 bg-transparent rounded-none h-12">
                <TabsTrigger value="positions" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                  Open Positions ({positions.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                  History ({history.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="positions" className="p-6">
                {positions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No open positions. Start trading to see your positions here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions.map((position) => (
                      <Card key={position.id} className="p-4 border-slate-200 bg-slate-50">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-lg text-slate-900">{position.asset}</div>
                              <div className="text-sm text-slate-500 mt-1">
                                Entry: <span className="font-semibold text-slate-700">${position.entryPrice.toFixed(2)}</span>
                              </div>
                              <div className="text-sm text-slate-500">
                                Amount: <span className="font-semibold text-slate-700">${position.amount.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={position.type === 'up' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                                {position.type.toUpperCase()}
                              </Badge>
                              <div className="text-xs text-slate-500">
                                Duration: {position.duration}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-600 font-medium">Time Remaining:</span>
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
                  <div className="text-center py-12 text-slate-500">
                    No trade history yet. Complete your first trade to see results here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((trade) => (
                      <Card key={trade.id} className="p-4 border-slate-200 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900">{trade.asset}</div>
                            <div className="text-sm text-slate-500">
                              Entry: ${trade.entryPrice.toFixed(2)} → Exit: ${trade.exitPrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(trade.closedAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={trade.result === 'win' ? 'bg-green-600' : 'bg-red-600'}>
                              {trade.result.toUpperCase()}
                            </Badge>
                            <div className={`text-lg font-bold mt-1 ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
    </div>
  );
}