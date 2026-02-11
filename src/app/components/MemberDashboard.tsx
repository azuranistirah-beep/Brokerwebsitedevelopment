import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TradingChart } from "./TradingChart";
import { OrderBook } from "./OrderBook";
import { 
  LogOut, TrendingUp, Wallet, History, User, 
  LayoutDashboard, PieChart, ArrowUp, ArrowDown, 
  Menu, CreditCard, HelpCircle, Settings, Plus, Minus
} from "lucide-react";
import { projectId } from "../../../utils/supabase/info";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabase } from "../lib/supabaseClient";

interface MemberDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  balance: number;
  role: string;
}

interface Trade {
  id: string;
  asset: string;
  type: string;
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  profit: number;
  status: string;
  openedAt: string;
  closedAt?: string;
  duration?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  method?: string;
}

interface Asset {
  symbol: string;
  name: string;
  payout: number;
}

const DEFAULT_ASSETS = [
  { symbol: "BTCUSD", name: "Bitcoin", payout: 85 },
  { symbol: "ETHUSD", name: "Ethereum", payout: 82 },
  { symbol: "EURUSD", name: "EUR/USD", payout: 88 },
  { symbol: "GBPUSD", name: "GBP/USD", payout: 85 },
  { symbol: "AAPL", name: "Apple", payout: 80 },
  { symbol: "TSLA", name: "Tesla", payout: 80 },
  { symbol: "GOOGL", name: "Google", payout: 80 },
  { symbol: "GOLD", name: "Gold", payout: 82 },
];

// ✅ POIN 4: Investment amounts dengan tombol +/- (urutan spesifik $1-$10,000)
const INVESTMENT_AMOUNTS = [1, 2, 5, 10, 15, 20, 30, 50, 100, 200, 250, 300, 500, 750, 1000, 2000, 3000, 5000, 6000, 7000, 8000, 10000];

// ✅ POIN 5: Trade durations dalam bahasa Inggris (termasuk 1 Day)
const TRADE_DURATIONS = [
  { label: "5 Sec", value: "5s", seconds: 5 },
  { label: "15 Sec", value: "15s", seconds: 15 },
  { label: "30 Sec", value: "30s", seconds: 30 },
  { label: "1 Min", value: "1m", seconds: 60 },
  { label: "5 Min", value: "5m", seconds: 300 },
  { label: "15 Min", value: "15m", seconds: 900 },
  { label: "30 Min", value: "30m", seconds: 1800 },
  { label: "1 Hour", value: "1h", seconds: 3600 },
  { label: "4 Hour", value: "4h", seconds: 14400 },
  { label: "1 Day", value: "1d", seconds: 86400 },
];

export function MemberDashboard({ accessToken, onLogout }: MemberDashboardProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(DEFAULT_ASSETS[0]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("trade");
  
  // Trade form state
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [selectedDuration, setSelectedDuration] = useState("1m");
  
  // ✅ POIN 1: Current price sinkron 100% dengan TradingView chart
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [previousPrice, setPreviousPrice] = useState<number>(0);

  // Wallet State
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  
  useEffect(() => {
    loadUserProfile();
    loadTrades();
    loadAssets();
    loadTransactions();
  }, []);

  // Track price changes
  useEffect(() => {
    if (currentPrice > 0 && currentPrice !== previousPrice) {
      console.log(`💰 [MemberDashboard] Price Updated: ${selectedAsset.symbol} = $${currentPrice.toFixed(2)}`);
      setPreviousPrice(currentPrice);
    }
  }, [currentPrice, previousPrice, selectedAsset.symbol]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/profile`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (response.ok) {
        const result = await response.json();
        setUserProfile(result.user);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadTrades = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trades`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (response.ok) {
        const result = await response.json();
        setTrades(result.trades);
      }
    } catch (error) {
      console.error("Error loading trades:", error);
    }
  };

  const loadAssets = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/assets`
      );
      if (response.ok) {
        const result = await response.json();
        if (result.assets && result.assets.length > 0) {
          setAssets(result.assets);
          const current = result.assets.find((a: Asset) => a.symbol === selectedAsset.symbol);
          if (current) setSelectedAsset(current);
          else setSelectedAsset(result.assets[0]);
        }
      }
    } catch (error) {
      console.error("Error loading assets:", error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/transactions`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (response.ok) {
        const result = await response.json();
        setTransactions(result.transactions);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const handleExecuteTrade = async (type: "buy" | "sell") => {
    if (currentPrice === 0) {
      toast.error("Waiting for market price...");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            asset: selectedAsset.symbol,
            type,
            amount: tradeAmount,
            duration: selectedDuration,
            entryPrice: currentPrice
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(`Trade executed: ${type.toUpperCase()} ${selectedAsset.symbol} at $${currentPrice.toFixed(2)}`);
        loadUserProfile();
        loadTrades();
      } else {
        toast.error(`Trade failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Trade error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trade/close`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ tradeId, exitPrice: currentPrice }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        const profit = result.trade.profit;
        if (profit > 0) toast.success(`Trade Closed! Profit: $${profit.toFixed(2)}`);
        else if (profit < 0) toast.warning(`Trade Closed. Loss: $${Math.abs(profit).toFixed(2)}`);
        else toast.info("Trade Closed. Tie.");
        
        loadUserProfile();
        loadTrades();
      } else {
        toast.error(`Close failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAction = async (type: "deposit" | "withdraw") => {
    const amount = parseFloat(walletAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/payment/${type}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            amount,
            method: type === "deposit" ? "card" : "bank_transfer"
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(`${type === "deposit" ? "Deposit" : "Withdrawal"} successful`);
        loadUserProfile();
        loadTransactions();
        setWalletAmount("");
        if (type === "deposit") setIsDepositOpen(false);
        else setIsWithdrawOpen(false);
      } else {
        toast.error(`${type} failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  // Handle amount increase/decrease with +/- buttons
  const handleAmountIncrease = () => {
    const currentIndex = INVESTMENT_AMOUNTS.indexOf(tradeAmount);
    if (currentIndex < INVESTMENT_AMOUNTS.length - 1) {
      setTradeAmount(INVESTMENT_AMOUNTS[currentIndex + 1]);
    }
  };

  const handleAmountDecrease = () => {
    const currentIndex = INVESTMENT_AMOUNTS.indexOf(tradeAmount);
    if (currentIndex > 0) {
      setTradeAmount(INVESTMENT_AMOUNTS[currentIndex - 1]);
    }
  };

  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');
  
  // ✅ POIN 3: Sinkronisasi stats - Total Trades, Win Rate, Total Profit
  const totalTrades = closedTrades.length;
  const winTrades = closedTrades.filter(t => t.profit > 0).length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
  const totalProfit = closedTrades.reduce((sum, t) => sum + t.profit, 0);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
         <div className="bg-blue-600 rounded p-1">
            <TrendingUp className="h-5 w-5 text-white" />
         </div>
         <span className="font-bold text-white text-lg">Investoft</span>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-1 px-2">
          <Button variant={activeTab === "trade" ? "secondary" : "ghost"} className="w-full justify-start text-white" onClick={() => setActiveTab("trade")}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Trade
          </Button>
          <Button variant={activeTab === "portfolio" ? "secondary" : "ghost"} className="w-full justify-start text-white" onClick={() => setActiveTab("portfolio")}>
            <PieChart className="mr-2 h-4 w-4" /> Portfolio
          </Button>
          <Button variant={activeTab === "history" ? "secondary" : "ghost"} className="w-full justify-start text-white" onClick={() => setActiveTab("history")}>
            <History className="mr-2 h-4 w-4" /> History
          </Button>
          <Button variant={activeTab === "wallet" ? "secondary" : "ghost"} className="w-full justify-start text-white" onClick={() => setActiveTab("wallet")}>
            <Wallet className="mr-2 h-4 w-4" /> Wallet
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white" onClick={() => { setActiveTab("wallet"); setIsDepositOpen(true); }}>
            <CreditCard className="mr-2 h-4 w-4" /> Deposit
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white" onClick={() => { setActiveTab("wallet"); setIsWithdrawOpen(true); }}>
            <ArrowDown className="mr-2 h-4 w-4" /> Withdraw
          </Button>
          <div className="my-4 border-t border-slate-800" />
          <Button variant={activeTab === "profile" ? "secondary" : "ghost"} className="w-full justify-start text-white" onClick={() => setActiveTab("profile")}>
            <User className="mr-2 h-4 w-4" /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white">
            <HelpCircle className="mr-2 h-4 w-4" /> Support
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded p-3 mb-3">
           <div className="text-xs text-gray-400">Balance</div>
           <div className="font-bold text-green-400 text-lg">
             ${userProfile?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </div>
        </div>
        <Button variant="outline" className="w-full text-white border-slate-700 hover:bg-slate-800" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-slate-800 bg-slate-900 p-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="bg-blue-600 rounded p-1">
                <TrendingUp className="h-5 w-5 text-white" />
             </div>
             <span className="font-bold text-white">Investoft</span>
           </div>
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon"><Menu className="text-white" /></Button>
             </SheetTrigger>
             <SheetContent side="left" className="p-0 bg-slate-900 border-r border-slate-800 w-64">
               <SidebarContent />
             </SheetContent>
           </Sheet>
        </header>

        {activeTab === "trade" ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* ✅ POIN 3: Top Stats Bar - Sinkronisasi Total Trades, Win Rate, Total Profit */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-gray-400">Total Trades</div>
                    <div className="text-lg font-bold text-white">{totalTrades}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                    <div className="text-lg font-bold text-green-400">{winRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Total Profit</div>
                    <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div>
                  {/* ✅ POIN 2: "Live Market" badge (bukan "Live Simulation") */}
                  <Badge className="bg-green-600 text-white animate-pulse">Live Market</Badge>
                </div>
              </div>
            </div>

            {/* ✅ POIN 6 & 7: Chart Area - Full width, controls di bawah */}
            <div className="flex-1 flex min-w-0 relative gap-4 p-4 overflow-hidden">
              {/* Left Side - Chart and Controls */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Asset Selector - Top Left */}
                <div className="absolute top-6 left-6 z-10">
                  <Select value={selectedAsset.symbol} onValueChange={(val) => setSelectedAsset(assets.find(a => a.symbol === val) || assets[0])}>
                     <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-slate-800 border-slate-700 text-white">
                       {assets.map(asset => (
                         <SelectItem key={asset.symbol} value={asset.symbol}>
                           <div className="flex justify-between w-full gap-4">
                             <span>{asset.name}</span>
                             <span className="text-green-400">{asset.payout}%</span>
                           </div>
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>

                {/* ✅ POIN 1: Current Price Display - Sinkron 100% dengan TradingView */}
                <div className="absolute top-6 left-[250px] z-10 bg-slate-900/95 border border-slate-700 rounded-lg px-4 py-2">
                  <div className="text-xs text-gray-400 mb-1">Current Price</div>
                  <div className="text-2xl font-bold text-white">
                    {currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : "Loading..."}
                  </div>
                </div>

                {/* Trading Chart */}
                <div className="flex-1 min-h-0">
                  <TradingChart 
                    symbol={selectedAsset.symbol} 
                    interval={selectedDuration}
                    onPriceUpdate={setCurrentPrice}
                  />
                </div>

                {/* ✅ POIN 6: Trading Controls - BELOW CHART */}
                <div className="border-t border-slate-800 bg-slate-900 p-4 mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Investment Amount */}
                    <Card className="bg-slate-800 border-slate-700 p-4">
                      <h3 className="text-sm font-semibold text-gray-300 mb-3">Investment Amount</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
                          onClick={handleAmountDecrease}
                          disabled={INVESTMENT_AMOUNTS.indexOf(tradeAmount) === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-center">
                          <div className="text-2xl font-bold text-white">${tradeAmount.toLocaleString()}</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
                          onClick={handleAmountIncrease}
                          disabled={INVESTMENT_AMOUNTS.indexOf(tradeAmount) === INVESTMENT_AMOUNTS.length - 1}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>

                    {/* Trade Duration */}
                    <Card className="bg-slate-800 border-slate-700 p-4">
                      <h3 className="text-sm font-semibold text-gray-300 mb-3">Trade Duration</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {TRADE_DURATIONS.map((duration) => (
                          <Button
                            key={duration.value}
                            variant={selectedDuration === duration.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedDuration(duration.value)}
                            className={selectedDuration === duration.value 
                              ? "bg-blue-600 hover:bg-blue-700 text-white text-xs" 
                              : "bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600 text-xs"
                            }
                          >
                            {duration.label}
                          </Button>
                        ))}
                      </div>
                    </Card>

                    {/* Trade Execution Buttons */}
                    <Card className="bg-slate-800 border-slate-700 p-4">
                      <h3 className="text-sm font-semibold text-gray-300 mb-3">Execute Trade</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => handleExecuteTrade('buy')}
                          disabled={loading || currentPrice === 0}
                          className="bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-bold"
                        >
                          <ArrowUp className="mr-2 h-5 w-5" />
                          UP
                        </Button>
                        <Button 
                          onClick={() => handleExecuteTrade('sell')}
                          disabled={loading || currentPrice === 0}
                          className="bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-bold"
                        >
                          <ArrowDown className="mr-2 h-5 w-5" />
                          DOWN
                        </Button>
                      </div>
                      <div className="mt-3 text-center text-xs text-gray-400">
                        Potential Profit: <span className="text-green-400 font-bold">+${(tradeAmount * (selectedAsset.payout / 100)).toFixed(2)}</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Right Side - Order Book */}
              <div className="w-80 flex-shrink-0 hidden xl:block">
                <OrderBook symbol={selectedAsset.symbol} />
              </div>
            </div>

            {/* Open Trades - Bottom Panel */}
            <div className="h-48 border-t border-slate-800 bg-slate-900 flex flex-col">
               <div className="flex items-center px-4 border-b border-slate-800">
                  <Button variant="ghost" className="rounded-none border-b-2 border-blue-500 text-white h-10 px-4">Open Trades ({openTrades.length})</Button>
                  <Button variant="ghost" className="rounded-none text-gray-400 h-10 px-4" onClick={() => setActiveTab("history")}>History ({closedTrades.length})</Button>
               </div>
               <ScrollArea className="flex-1">
                 <Table>
                   <TableHeader>
                     <TableRow className="border-slate-800 hover:bg-slate-900">
                       <TableHead className="text-gray-400">Asset</TableHead>
                       <TableHead className="text-gray-400">Amount</TableHead>
                       <TableHead className="text-gray-400">Entry Price</TableHead>
                       <TableHead className="text-gray-400">Direction</TableHead>
                       <TableHead className="text-gray-400">Action</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {openTrades.length === 0 ? (
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                          <TableCell colSpan={5} className="text-center text-gray-500 py-8">No active trades</TableCell>
                        </TableRow>
                     ) : (
                       openTrades.map(trade => (
                         <TableRow key={trade.id} className="border-slate-800 hover:bg-slate-800">
                            <TableCell className="text-white font-medium">{trade.asset}</TableCell>
                            <TableCell className="text-white">${trade.amount}</TableCell>
                            <TableCell className="text-white">{trade.entryPrice.toFixed(2)}</TableCell>
                            <TableCell>
                               <span className={trade.type === 'buy' ? "text-green-400" : "text-red-400"}>
                                 {trade.type.toUpperCase()}
                               </span>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="h-7 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700"
                                onClick={() => handleCloseTrade(trade.id)}
                                disabled={loading}
                              >
                                Close
                              </Button>
                            </TableCell>
                         </TableRow>
                       ))
                     )}
                   </TableBody>
                 </Table>
               </ScrollArea>
            </div>
          </div>
        ) : activeTab === "history" ? (
          <div className="flex-1 overflow-auto p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Trade History</h1>
            <Card className="bg-slate-900 border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-gray-400">Asset</TableHead>
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Entry</TableHead>
                    <TableHead className="text-gray-400">Exit</TableHead>
                    <TableHead className="text-gray-400">Profit</TableHead>
                    <TableHead className="text-gray-400">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedTrades.length === 0 ? (
                    <TableRow className="border-slate-800">
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">No trade history</TableCell>
                    </TableRow>
                  ) : (
                    closedTrades.map(trade => (
                      <TableRow key={trade.id} className="border-slate-800 hover:bg-slate-800">
                        <TableCell className="text-white font-medium">{trade.asset}</TableCell>
                        <TableCell>
                          <Badge className={trade.type === 'buy' ? 'bg-green-600' : 'bg-red-600'}>
                            {trade.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">${trade.amount}</TableCell>
                        <TableCell className="text-white">${trade.entryPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-white">${trade.exitPrice?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell className={trade.profit >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-400">{new Date(trade.closedAt || '').toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        ) : activeTab === "wallet" ? (
          <div className="flex-1 overflow-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Wallet</h1>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
               <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-none p-6 text-white">
                  <div className="text-blue-200 mb-2">Total Balance</div>
                  <div className="text-3xl font-bold">${userProfile?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className="mt-4 flex gap-2">
                     <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                       <DialogTrigger asChild>
                         <Button className="bg-white text-blue-600 hover:bg-blue-50 flex-1">Deposit</Button>
                       </DialogTrigger>
                       <DialogContent className="bg-slate-900 border-slate-800 text-white">
                         <DialogHeader>
                           <DialogTitle>Deposit Funds</DialogTitle>
                           <p className="text-sm text-slate-400">Add funds to your trading account</p>
                         </DialogHeader>
                         <div className="space-y-4 py-4">
                           <div className="space-y-2">
                             <Label>Amount ($)</Label>
                             <Input 
                               type="number" 
                               placeholder="100"
                               className="bg-slate-800 border-slate-700" 
                               value={walletAmount}
                               onChange={(e) => setWalletAmount(e.target.value)}
                             />
                           </div>
                           <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleWalletAction('deposit')} disabled={loading}>
                             {loading ? "Processing..." : "Deposit Now"}
                           </Button>
                         </div>
                       </DialogContent>
                     </Dialog>

                     <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                       <DialogTrigger asChild>
                         <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 flex-1">Withdraw</Button>
                       </DialogTrigger>
                       <DialogContent className="bg-slate-900 border-slate-800 text-white">
                         <DialogHeader>
                           <DialogTitle>Withdraw Funds</DialogTitle>
                           <p className="text-sm text-slate-400">Request withdrawal from your account</p>
                         </DialogHeader>
                         <div className="space-y-4 py-4">
                           <div className="space-y-2">
                             <Label>Amount ($)</Label>
                             <Input 
                               type="number" 
                               placeholder="100"
                               className="bg-slate-800 border-slate-700" 
                               value={walletAmount}
                               onChange={(e) => setWalletAmount(e.target.value)}
                             />
                           </div>
                           <Button className="w-full bg-slate-700 hover:bg-slate-600" onClick={() => handleWalletAction('withdraw')} disabled={loading}>
                             {loading ? "Processing..." : "Request Withdraw"}
                           </Button>
                         </div>
                       </DialogContent>
                     </Dialog>
                  </div>
               </Card>
               <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="text-gray-400 mb-2">Bonus Balance</div>
                  <div className="text-2xl font-bold text-white">$0.00</div>
                  <p className="text-xs text-gray-500 mt-2">Bonus funds cannot be withdrawn directly.</p>
               </Card>
               <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="text-gray-400 mb-2">Demo Balance</div>
                  <div className="text-2xl font-bold text-white">$10,000.00</div>
                  <Button variant="link" className="text-blue-400 p-0 h-auto mt-2">Reset Demo</Button>
               </Card>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
            <Card className="bg-slate-900 border-slate-800">
               <Table>
                 <TableHeader>
                   <TableRow className="border-slate-800 hover:bg-slate-900">
                     <TableHead className="text-gray-400">ID</TableHead>
                     <TableHead className="text-gray-400">Type</TableHead>
                     <TableHead className="text-gray-400">Amount</TableHead>
                     <TableHead className="text-gray-400">Status</TableHead>
                     <TableHead className="text-gray-400">Date</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {transactions.length === 0 ? (
                      <TableRow className="border-slate-800 hover:bg-slate-900">
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">No transactions found</TableCell>
                      </TableRow>
                   ) : (
                     transactions.map(tx => (
                       <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800">
                          <TableCell className="text-white font-mono text-xs">{tx.id}</TableCell>
                          <TableCell className="capitalize text-white">{tx.type.replace('_', ' ')}</TableCell>
                          <TableCell className={tx.amount > 0 ? "text-green-400" : "text-red-400"}>
                            {tx.amount > 0 ? "+" : ""}{tx.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-gray-400 capitalize">{tx.status}</TableCell>
                          <TableCell className="text-gray-400">{new Date(tx.date).toLocaleDateString()}</TableCell>
                       </TableRow>
                     ))
                   )}
                 </TableBody>
               </Table>
            </Card>
          </div>
        ) : (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-4 capitalize">{activeTab}</h1>
            <p className="text-gray-400">This section is under construction.</p>
          </div>
        )}
      </div>
    </div>
  );
}