import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TradingChart } from "./TradingChart";
import { 
  LogOut, TrendingUp, Wallet, History, User, 
  LayoutDashboard, PieChart, ArrowUp, ArrowDown, 
  Menu, CreditCard, HelpCircle, Settings
} from "lucide-react";
import { projectId } from "/utils/supabase/info";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
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

const INVESTMENT_AMOUNTS = [1, 2, 5, 10, 20, 30, 40, 50, 100, 250, 500, 1000, 3000, 5000, 10000, 25000, 50000, 100000];
const TIMEFRAMES = ["5s", "10s", "15s", "30s", "1m", "2m", "5m", "15m", "30m", "1h", "2h", "4h", "1d"];

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
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");

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
          // Update selected asset if it exists in new list
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
            duration: selectedTimeframe
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(`Trade executed: ${type.toUpperCase()} ${selectedAsset.symbol}`);
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
          body: JSON.stringify({ tradeId }),
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

  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');
  
  const estimatedPayout = tradeAmount + (tradeAmount * (selectedAsset.payout / 100));

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
          <div className="flex flex-1 overflow-hidden">
             {/* Chart Area */}
             <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <Select value={selectedAsset.symbol} onValueChange={(val) => setSelectedAsset(assets.find(a => a.symbol === val) || assets[0])}>
                    <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
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

                 <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-[100px] bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {TIMEFRAMES.map(tf => (
                        <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
               </div>

               <div className="flex-1">
                 <TradingChart symbol={selectedAsset.symbol} interval={selectedTimeframe} />
               </div>

               {/* Bottom Panel - Trades */}
               <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col">
                  <div className="flex items-center px-4 border-b border-slate-800">
                     <Button variant="ghost" className="rounded-none border-b-2 border-blue-500 text-white h-10 px-4">Open Trades ({openTrades.length})</Button>
                     <Button variant="ghost" className="rounded-none text-gray-400 h-10 px-4" onClick={() => setActiveTab("history")}>Closed Trades</Button>
                  </div>
                  <ScrollArea className="flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                          <TableHead className="text-gray-400">Asset</TableHead>
                          <TableHead className="text-gray-400">Amount</TableHead>
                          <TableHead className="text-gray-400">Entry Price</TableHead>
                          <TableHead className="text-gray-400">Direction</TableHead>
                          <TableHead className="text-gray-400">Profit</TableHead>
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
                                   Close / Settle
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

             {/* Right Trading Panel */}
             <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col p-4 overflow-y-auto">
               <div className="mb-6">
                 <Label className="text-gray-400 mb-2 block">Investment Amount</Label>
                 <Input 
                   type="number" 
                   value={tradeAmount} 
                   onChange={(e) => setTradeAmount(Number(e.target.value))}
                   className="bg-slate-800 border-slate-700 text-white text-lg font-bold h-12 mb-4" 
                 />
                 
                 <div className="grid grid-cols-3 gap-2">
                   {INVESTMENT_AMOUNTS.map(amount => (
                     <Button 
                       key={amount} 
                       variant={tradeAmount === amount ? "default" : "outline"}
                       className={`h-8 text-xs ${tradeAmount === amount ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700"}`}
                       onClick={() => setTradeAmount(amount)}
                     >
                       ${amount >= 1000 ? `${amount/1000}K` : amount}
                     </Button>
                   ))}
                 </div>
               </div>

               <div className="mb-6">
                 <Label className="text-gray-400 mb-2 block">Duration</Label>
                 <div className="bg-slate-800 rounded p-2 text-center text-white font-bold border border-slate-700">
                    {selectedTimeframe}
                 </div>
               </div>

               <div className="mt-auto space-y-4">
                 <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between text-sm mb-1">
                       <span className="text-gray-400">Payout</span>
                       <span className="text-green-400 font-bold">{selectedAsset.payout}%</span>
                    </div>
                    <div className="flex justify-between items-end">
                       <span className="text-gray-400 text-sm">Profit:</span>
                       <span className="text-xl font-bold text-green-400">+${(tradeAmount * (selectedAsset.payout/100)).toFixed(2)}</span>
                    </div>
                 </div>

                 <Button 
                   className="w-full h-14 bg-green-500 hover:bg-green-600 text-white text-lg font-bold flex flex-col items-center justify-center gap-0"
                   onClick={() => handleExecuteTrade("buy")}
                   disabled={loading}
                 >
                   <div className="flex items-center gap-2">
                     <span>UP</span>
                     <ArrowUp className="h-5 w-5" />
                   </div>
                   <span className="text-xs font-normal opacity-80">Buy at market</span>
                 </Button>

                 <Button 
                   className="w-full h-14 bg-red-500 hover:bg-red-600 text-white text-lg font-bold flex flex-col items-center justify-center gap-0"
                   onClick={() => handleExecuteTrade("sell")}
                   disabled={loading}
                 >
                   <div className="flex items-center gap-2">
                     <span>DOWN</span>
                     <ArrowDown className="h-5 w-5" />
                   </div>
                   <span className="text-xs font-normal opacity-80">Sell at market</span>
                 </Button>
               </div>
             </div>
          </div>
        ) : activeTab === "wallet" ? (
          <div className="p-8 max-w-4xl mx-auto w-full">
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