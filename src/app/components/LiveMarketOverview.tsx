import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { TradingChart } from "./TradingChart";
import { projectId } from "../../../utils/supabase/info";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface MarketItem {
  symbol: string;
  price: number;
  change: number;
  name?: string;
  type: string;
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
  { symbol: "FOREXCOM:SPXUSD", name: "S&P 500", price: 4850.45, change: 0.78, type: "indices" },
  { symbol: "FOREXCOM:NSXUSD", name: "Nasdaq 100", price: 16420.30, change: 1.23, type: "indices" },
  { symbol: "FOREXCOM:DJI", name: "Dow Jones", price: 37850.20, change: 0.45, type: "indices" },
  { symbol: "TVC:UKX", name: "FTSE 100", price: 7650.80, change: -0.12, type: "indices" },
  { symbol: "XETR:DAX", name: "DAX", price: 17240.50, change: 0.34, type: "indices" },
  { symbol: "TVC:NI225", name: "Nikkei 225", price: 38450.70, change: 0.89, type: "indices" },
  
  // Stocks
  { symbol: "NASDAQ:AAPL", name: "Apple Inc", price: 178.34, change: 1.23, type: "stocks" },
  { symbol: "NASDAQ:MSFT", name: "Microsoft", price: 330.45, change: 0.67, type: "stocks" },
  { symbol: "NASDAQ:GOOGL", name: "Alphabet", price: 136.23, change: 1.12, type: "stocks" },
  { symbol: "NASDAQ:AMZN", name: "Amazon", price: 135.67, change: 0.89, type: "stocks" },
  { symbol: "NASDAQ:NVDA", name: "NVIDIA", price: 460.12, change: 3.45, type: "stocks" },
  { symbol: "NASDAQ:TSLA", name: "Tesla", price: 245.67, change: -2.34, type: "stocks" },
  { symbol: "NASDAQ:META", name: "Meta", price: 298.67, change: -0.45, type: "stocks" },
  { symbol: "NYSE:JPM", name: "JPMorgan", price: 145.23, change: 0.34, type: "stocks" },
  { symbol: "NYSE:V", name: "Visa", price: 245.67, change: 0.56, type: "stocks" },
  { symbol: "NYSE:WMT", name: "Walmart", price: 52.45, change: 0.78, type: "stocks" },
  
  // Crypto
  { symbol: "BITSTAMP:BTCUSD", name: "Bitcoin", price: 64250.00, change: 2.45, type: "crypto" },
  { symbol: "BITSTAMP:ETHUSD", name: "Ethereum", price: 3520.00, change: 1.89, type: "crypto" },
  { symbol: "BINANCE:BNBUSD", name: "Binance Coin", price: 420.50, change: 0.67, type: "crypto" },
  { symbol: "BINANCE:SOLUSD", name: "Solana", price: 145.30, change: 3.12, type: "crypto" },
  { symbol: "BINANCE:ADAUSD", name: "Cardano", price: 0.48, change: 0.89, type: "crypto" },
  { symbol: "BINANCE:XRPUSD", name: "Ripple", price: 0.52, change: -1.23, type: "crypto" },
  
  // Forex
  { symbol: "FX_IDC:EURUSD", name: "EUR/USD", price: 1.0845, change: -0.15, type: "forex" },
  { symbol: "FX_IDC:GBPUSD", name: "GBP/USD", price: 1.2634, change: 0.23, type: "forex" },
  { symbol: "FX_IDC:USDJPY", name: "USD/JPY", price: 149.45, change: 0.45, type: "forex" },
  { symbol: "FX_IDC:AUDUSD", name: "AUD/USD", price: 0.6512, change: -0.34, type: "forex" },
  { symbol: "FX_IDC:USDCAD", name: "USD/CAD", price: 1.3645, change: 0.12, type: "forex" },
  { symbol: "FX_IDC:USDCHF", name: "USD/CHF", price: 0.8823, change: 0.09, type: "forex" },
  
  // Commodities
  { symbol: "OANDA:XAUUSD", name: "Gold", price: 2345.60, change: 0.56, type: "commodities" },
  { symbol: "OANDA:XAGUSD", name: "Silver", price: 24.85, change: 1.12, type: "commodities" },
  { symbol: "TVC:USOIL", name: "Crude Oil WTI", price: 78.45, change: -0.45, type: "commodities" },
  { symbol: "TVC:UKOIL", name: "Brent Oil", price: 82.30, change: -0.23, type: "commodities" },
  { symbol: "NYMEX:NG1!", name: "Natural Gas", price: 2.65, change: 2.34, type: "commodities" },
];

export function LiveMarketOverview() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BITSTAMP:BTCUSD");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [marketData, setMarketData] = useState<MarketItem[]>(ALL_ASSETS);

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
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px] rounded-2xl">
        
        {/* Chart Area - Main Content (NOW ON LEFT) */}
        <div className="flex-1 bg-white relative flex flex-col">
           {/* Chart Header with Search */}
           <div className="border-b border-slate-200 p-4 bg-white">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Search any asset (stocks, crypto, forex, indices, commodities)..." 
                  className="pl-10 h-12 bg-white border-slate-300 focus-visible:ring-blue-600 text-slate-900 text-base"
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
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
           </div>
           
           {/* Chart Body */}
           <div className="flex-1 relative bg-white">
              <TradingChart symbol={selectedAsset} theme="light" />
           </div>
        </div>

        {/* Asset List - Right Sidebar (MOVED TO RIGHT) */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
            <h3 className="font-bold text-slate-900 mb-1">Market Watch</h3>
            <p className="text-xs text-slate-500">Click to view chart</p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No assets found. Try a different search.
              </div>
            ) : filteredAssets.map((item) => (
              <div 
                key={item.symbol}
                className={`p-4 cursor-pointer transition-all border-b border-slate-100 hover:bg-white group ${
                  selectedAsset === item.symbol 
                    ? "bg-white border-l-4 border-l-blue-600 shadow-sm" 
                    : "border-l-4 border-l-transparent"
                }`}
                onClick={() => setSelectedAsset(item.symbol)}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`font-bold text-xs truncate ${selectedAsset === item.symbol ? "text-slate-900" : "text-slate-700"}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {item.type}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <div className={`text-xs font-mono font-medium ${selectedAsset === item.symbol ? "text-slate-900" : "text-slate-700"}`}>
                      ${item.price.toLocaleString()}
                    </div>
                    <div className={`text-[10px] font-bold ${item.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.change >= 0 ? "+" : ""}{item.change}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}