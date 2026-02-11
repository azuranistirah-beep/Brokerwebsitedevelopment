import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { TradingChart } from "./TradingChart";
import { projectId } from "../../../utils/supabase/info";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { realTimeWebSocket } from "../lib/realTimeWebSocket";

interface MarketItem {
  symbol: string;
  price: number;
  change: number;
  name?: string;
  type: string;
  basePrice?: number; // For calculating change
}

const ASSET_NAMES: Record<string, string> = {
  "BTCUSD": "Bitcoin",
  "ETHUSD": "Ethereum",
  "EURUSD": "Euro / USD",
  "GBPUSD": "GBP / USD",
  "USDJPY": "USD / JPY",
  "SPX500": "S&P 500",
  "NSX100": "Nasdaq 100",
  "GOLD": "Gold",
  "AAPL": "Apple Inc",
  "TSLA": "Tesla Inc"
};

// Comprehensive asset list with categories
const ALL_ASSETS: MarketItem[] = [
  // Indices
  { symbol: "FOREXCOM:SPXUSD", name: "S&P 500", price: 4850.45, change: 0.78, type: "indices", basePrice: 4850.45 },
  { symbol: "FOREXCOM:NSXUSD", name: "Nasdaq 100", price: 16420.30, change: 1.23, type: "indices", basePrice: 16420.30 },
  { symbol: "FOREXCOM:DJI", name: "Dow Jones", price: 37850.20, change: 0.45, type: "indices", basePrice: 37850.20 },
  { symbol: "TVC:UKX", name: "FTSE 100", price: 7650.80, change: -0.12, type: "indices", basePrice: 7650.80 },
  { symbol: "XETR:DAX", name: "DAX", price: 17240.50, change: 0.34, type: "indices", basePrice: 17240.50 },
  { symbol: "TVC:NI225", name: "Nikkei 225", price: 38450.70, change: 0.89, type: "indices", basePrice: 38450.70 },
  
  // Stocks
  { symbol: "NASDAQ:AAPL", name: "Apple Inc", price: 178.34, change: 1.23, type: "stocks", basePrice: 178.34 },
  { symbol: "NASDAQ:MSFT", name: "Microsoft", price: 330.45, change: 0.67, type: "stocks", basePrice: 330.45 },
  { symbol: "NASDAQ:GOOGL", name: "Alphabet", price: 136.23, change: 1.12, type: "stocks", basePrice: 136.23 },
  { symbol: "NASDAQ:AMZN", name: "Amazon", price: 135.67, change: 0.89, type: "stocks", basePrice: 135.67 },
  { symbol: "NASDAQ:NVDA", name: "NVIDIA", price: 460.12, change: 3.45, type: "stocks", basePrice: 460.12 },
  { symbol: "NASDAQ:TSLA", name: "Tesla", price: 245.67, change: -2.34, type: "stocks", basePrice: 245.67 },
  { symbol: "NASDAQ:META", name: "Meta", price: 298.67, change: -0.45, type: "stocks", basePrice: 298.67 },
  { symbol: "NYSE:JPM", name: "JPMorgan", price: 145.23, change: 0.34, type: "stocks", basePrice: 145.23 },
  { symbol: "NYSE:V", name: "Visa", price: 245.67, change: 0.56, type: "stocks", basePrice: 245.67 },
  { symbol: "NYSE:WMT", name: "Walmart", price: 52.45, change: 0.78, type: "stocks", basePrice: 52.45 },
  
  // Crypto
  { symbol: "BITSTAMP:BTCUSD", name: "Bitcoin", price: 64250.00, change: 2.45, type: "crypto", basePrice: 64250.00 },
  { symbol: "BITSTAMP:ETHUSD", name: "Ethereum", price: 3520.00, change: 1.89, type: "crypto", basePrice: 3520.00 },
  { symbol: "BINANCE:BNBUSD", name: "Binance Coin", price: 420.50, change: 0.67, type: "crypto", basePrice: 420.50 },
  { symbol: "BINANCE:SOLUSD", name: "Solana", price: 145.30, change: 3.12, type: "crypto", basePrice: 145.30 },
  { symbol: "BINANCE:ADAUSD", name: "Cardano", price: 0.48, change: 0.89, type: "crypto", basePrice: 0.48 },
  { symbol: "BINANCE:XRPUSD", name: "Ripple", price: 0.52, change: -1.23, type: "crypto", basePrice: 0.52 },
  
  // Forex
  { symbol: "FX_IDC:EURUSD", name: "EUR/USD", price: 1.0845, change: -0.15, type: "forex", basePrice: 1.0845 },
  { symbol: "FX_IDC:GBPUSD", name: "GBP/USD", price: 1.2634, change: 0.23, type: "forex", basePrice: 1.2634 },
  { symbol: "FX_IDC:USDJPY", name: "USD/JPY", price: 149.45, change: 0.45, type: "forex", basePrice: 149.45 },
  { symbol: "FX_IDC:AUDUSD", name: "AUD/USD", price: 0.6512, change: -0.34, type: "forex", basePrice: 0.6512 },
  { symbol: "FX_IDC:USDCAD", name: "USD/CAD", price: 1.3645, change: 0.12, type: "forex", basePrice: 1.3645 },
  { symbol: "FX_IDC:USDCHF", name: "USD/CHF", price: 0.8823, change: 0.09, type: "forex", basePrice: 0.8823 },
  
  // Commodities
  { symbol: "OANDA:XAUUSD", name: "Gold", price: 2345.60, change: 0.56, type: "commodities", basePrice: 2345.60 },
  { symbol: "OANDA:XAGUSD", name: "Silver", price: 24.85, change: 1.12, type: "commodities", basePrice: 24.85 },
  { symbol: "TVC:USOIL", name: "Crude Oil WTI", price: 78.45, change: -0.45, type: "commodities", basePrice: 78.45 },
  { symbol: "TVC:UKOIL", name: "Brent Oil", price: 82.30, change: -0.23, type: "commodities", basePrice: 82.30 },
];

export function LiveMarketOverview() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BITSTAMP:BTCUSD");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [marketData, setMarketData] = useState<MarketItem[]>(ALL_ASSETS);
  const [flashingSymbols, setFlashingSymbols] = useState<Set<string>>(new Set());

  // ✅ Subscribe to real-time price updates for crypto assets
  useEffect(() => {
    console.log('🔌 [LiveMarketOverview] Setting up WebSocket subscriptions...');
    
    const unsubscribeFunctions: (() => void)[] = [];
    
    // Subscribe to ALL crypto symbols in the list
    const cryptoAssets = ALL_ASSETS.filter(asset => asset.type === 'crypto');
    
    cryptoAssets.forEach((asset) => {
      // Extract clean symbol for WebSocket (e.g., "BITSTAMP:BTCUSD" -> "BTCUSD")
      const cleanSymbol = asset.symbol.split(':')[1] || asset.symbol;
      
      const unsubscribe = realTimeWebSocket.subscribe(cleanSymbol, (newPrice) => {
        console.log(`💰 [LiveMarketOverview] Price update: ${cleanSymbol} = $${newPrice}`);
        
        // Add flash effect
        setFlashingSymbols(prev => new Set(prev).add(asset.symbol));
        setTimeout(() => {
          setFlashingSymbols(prev => {
            const newSet = new Set(prev);
            newSet.delete(asset.symbol);
            return newSet;
          });
        }, 500);
        
        // Update market data with new price
        setMarketData((prevData) => {
          return prevData.map((item) => {
            if (item.symbol === asset.symbol) {
              const basePrice = item.basePrice || item.price;
              const change = ((newPrice - basePrice) / basePrice) * 100;
              
              return {
                ...item,
                price: newPrice,
                change: Number(change.toFixed(2)),
              };
            }
            return item;
          });
        });
      });
      
      unsubscribeFunctions.push(unsubscribe);
    });
    
    console.log(`��� [LiveMarketOverview] Subscribed to ${cryptoAssets.length} crypto symbols`);
    
    // Cleanup: Unsubscribe when component unmounts
    return () => {
      console.log('🔌 [LiveMarketOverview] Cleaning up WebSocket subscriptions...');
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, []); // Only run once on mount

  // Filter logic
  const filteredAssets = marketData.filter(item => {
    const matchesSearch = 
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || item.type === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px] rounded-2xl">
        
        {/* Chart Area - Main Content (NOW ON LEFT) */}
        <div className="flex-1 bg-slate-900 relative flex flex-col">
           {/* Chart Header with Search */}
           <div className="border-b border-slate-800 p-4 bg-slate-900">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Search any asset (stocks, crypto, forex, indices, commodities)..." 
                  className="pl-10 h-12 bg-slate-800 border-slate-700 focus-visible:ring-blue-600 text-white text-base placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { label: "All", value: "all" },
                  { label: "Stocks", value: "stocks" },
                  { label: "Forex", value: "forex" },
                  { label: "Crypto", value: "crypto" },
                  { label: "Indices", value: "indices" },
                  { label: "Commodities", value: "commodities" },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      categoryFilter === cat.value
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
           </div>
           
           {/* Chart Body */}
           <div className="flex-1 relative bg-slate-900">
              <TradingChart symbol={selectedAsset} theme="dark" />
           </div>
        </div>

        {/* Asset List - Right Sidebar (MOVED TO RIGHT) */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col bg-slate-900">
          <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
            <h3 className="font-bold text-white mb-1">Market Watch</h3>
            <p className="text-xs text-slate-400">Click to view chart</p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No assets found. Try a different search.
              </div>
            ) : filteredAssets.map((item) => {
              const isFlashing = flashingSymbols.has(item.symbol);
              
              return (
              <div 
                key={item.symbol}
                className={`p-4 cursor-pointer transition-all border-b border-slate-800 hover:bg-slate-800/50 group ${
                  selectedAsset === item.symbol 
                    ? "bg-slate-800/50 border-l-4 border-l-blue-500 shadow-sm" 
                    : "border-l-4 border-l-transparent"
                } ${isFlashing ? 'bg-blue-900/30' : ''}`}
                onClick={() => setSelectedAsset(item.symbol)}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`font-bold text-xs truncate ${selectedAsset === item.symbol ? "text-white" : "text-slate-300"}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      {item.type}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <div className={`text-xs font-mono font-medium ${selectedAsset === item.symbol ? "text-white" : "text-slate-300"} ${isFlashing ? 'font-bold' : ''}`}>
                      ${item.price.toLocaleString()}
                    </div>
                    <div className={`text-[10px] font-bold ${item.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {item.change >= 0 ? "+" : ""}{item.change}%
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}