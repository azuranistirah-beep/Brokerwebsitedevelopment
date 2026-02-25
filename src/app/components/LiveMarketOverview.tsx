import { TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { usePrices } from "../context/PriceContext";

interface MarketItem {
  symbol: string;
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

// Market data - will get real-time updates from PriceContext
const MARKET_ITEMS: MarketItem[] = [
  // Crypto
  { symbol: "BTCUSD", name: "Bitcoin", type: "crypto" },
  { symbol: "ETHUSD", name: "Ethereum", type: "crypto" },
  { symbol: "BNBUSD", name: "BNB", type: "crypto" },
  { symbol: "SOLUSD", name: "Solana", type: "crypto" },
  { symbol: "XRPUSD", name: "XRP", type: "crypto" },
  
  // Forex
  { symbol: "EURUSD", name: "EUR/USD", type: "forex" },
  { symbol: "GBPUSD", name: "GBP/USD", type: "forex" },
  { symbol: "USDJPY", name: "USD/JPY", type: "forex" },
  
  // Indices
  { symbol: "SPX500", name: "S&P 500", type: "indices" },
  { symbol: "NSX100", name: "Nasdaq 100", type: "indices" },
  
  // Commodities
  { symbol: "GOLD", name: "Gold", type: "commodities" },
  { symbol: "SILVER", name: "Silver", type: "commodities" },
];

export function LiveMarketOverview() {
  const { prices } = usePrices(); // ✅ USE SHARED PRICE CONTEXT
  const [flashingSymbols, setFlashingSymbols] = useState<Set<string>>(new Set());

  // Track price changes for flash effect
  useEffect(() => {
    const newFlashing = new Set<string>();
    
    MARKET_ITEMS.forEach((item) => {
      const priceData = prices[item.symbol];
      if (priceData && priceData.timestamp) {
        const timeSinceUpdate = Date.now() - priceData.timestamp;
        if (timeSinceUpdate < 500) {
          newFlashing.add(item.symbol);
        }
      }
    });
    
    if (newFlashing.size > 0) {
      setFlashingSymbols(newFlashing);
      setTimeout(() => {
        setFlashingSymbols(new Set());
      }, 500);
    }
  }, [prices]);

  // Get price data for a symbol
  const getPriceData = (symbol: string) => {
    const priceData = prices[symbol];
    
    // Return fallback if no data yet
    if (!priceData || !priceData.price) {
      return { price: 0, change: 0, changePercent: 0, basePrice: 0, timestamp: 0 };
    }
    
    return priceData;
  };

  return (
    <div className="space-y-6">
      {/* ✨ Top 4 Market Cards with Gradient Borders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MARKET_ITEMS.slice(0, 4).map((item) => {
          const isFlashing = flashingSymbols.has(item.symbol);
          const priceData = getPriceData(item.symbol);
          const isPositive = priceData.changePercent >= 0;
          
          return (
            <Card 
              key={item.symbol} 
              className={`group relative p-6 border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 transition-all duration-300 hover:scale-105 overflow-hidden ${
                isFlashing ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20' : ''
              }`}
            >
              {/* ✨ Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* ✨ Animated Corner Accent */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${
                isPositive ? 'from-green-500/20 to-transparent' : 'from-red-500/20 to-transparent'
              } blur-2xl transition-all duration-300 group-hover:scale-150`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{item.name || ASSET_NAMES[item.symbol] || item.symbol}</p>
                    <h3 className="text-2xl font-bold text-white">
                      ${priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    isPositive ? 'bg-green-500/10 ring-1 ring-green-500/20' : 'bg-red-500/10 ring-1 ring-red-500/20'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={isPositive ? "bg-green-600/20 text-green-400 hover:bg-green-600/20 border border-green-500/20" : "bg-red-600/20 text-red-400 hover:bg-red-600/20 border border-red-500/20"}>
                    {isPositive ? "+" : ""}{priceData.changePercent.toFixed(2)}%
                  </Badge>
                  <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{item.type}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ✨ Top Movers Section with Gradient */}
      <div className="grid md:grid-cols-1 gap-6">
        <Card className="relative p-6 border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 overflow-hidden group">
          {/* ✨ Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent opacity-50" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg ring-1 ring-blue-500/30">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-white text-lg">Top Movers</h3>
              </div>
              <Badge className="bg-blue-600/10 text-blue-400 border border-blue-500/20">
                Live
              </Badge>
            </div>
            <div className="space-y-3">
              {MARKET_ITEMS
                .sort((a, b) => Math.abs(getPriceData(b.symbol).changePercent) - Math.abs(getPriceData(a.symbol).changePercent))
                .slice(0, 5)
                .map((item, index) => {
                  const priceData = getPriceData(item.symbol);
                  const isPositive = priceData.changePercent >= 0;
                  const isFlashing = flashingSymbols.has(item.symbol);
                  
                  return (
                    <div 
                      key={item.symbol} 
                      className={`group/item flex items-center justify-between py-3 px-4 rounded-lg border border-slate-800/50 bg-gradient-to-r from-slate-800/30 to-transparent hover:from-slate-800/60 hover:to-slate-800/20 transition-all duration-300 ${
                        isFlashing ? 'ring-2 ring-blue-500/30 bg-blue-900/20' : ''
                      }`}
                    >
                      {/* ✨ Rank Badge */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-400 ring-1 ring-yellow-500/30' :
                          index === 1 ? 'bg-gradient-to-br from-slate-400/20 to-slate-500/20 text-slate-300 ring-1 ring-slate-400/30' :
                          index === 2 ? 'bg-gradient-to-br from-amber-700/20 to-amber-800/20 text-amber-600 ring-1 ring-amber-700/30' :
                          'bg-slate-700/30 text-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm group-hover/item:text-blue-400 transition-colors">{item.name || ASSET_NAMES[item.symbol] || item.symbol}</p>
                          <p className="text-xs text-slate-500">${priceData.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <Badge className={`${isPositive ? "bg-green-600/20 text-green-400 hover:bg-green-600/20 border border-green-500/20" : "bg-red-600/20 text-red-400 hover:bg-red-600/20 border border-red-500/20"}`}>
                        {isPositive ? "+" : ""}{priceData.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      </div>

      {/* ✨ All Markets Table with Gradient */}
      <Card className="relative p-6 border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 overflow-hidden group">
        {/* ✨ Background Gradient Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-transparent opacity-50" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-lg">All Markets</h3>
            <Badge className="bg-purple-600/10 text-purple-400 border border-purple-500/20">
              {MARKET_ITEMS.length} Assets
            </Badge>
          </div>
          
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50 bg-gradient-to-r from-slate-800/30 to-transparent">
                  <th className="text-left text-slate-400 text-sm font-semibold pb-3 pt-3 pl-4">Asset</th>
                  <th className="text-left text-slate-400 text-sm font-semibold pb-3 pt-3">Type</th>
                  <th className="text-right text-slate-400 text-sm font-semibold pb-3 pt-3">Price</th>
                  <th className="text-right text-slate-400 text-sm font-semibold pb-3 pt-3 pr-4">Change</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_ITEMS.map((item, index) => {
                  const priceData = getPriceData(item.symbol);
                  const isPositive = priceData.changePercent >= 0;
                  const isFlashing = flashingSymbols.has(item.symbol);
                  
                  return (
                    <tr 
                      key={item.symbol} 
                      className={`border-b border-slate-800/30 last:border-0 hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-transparent transition-all duration-200 group/row ${
                        isFlashing ? 'bg-blue-900/20 ring-2 ring-inset ring-blue-500/20' : ''
                      }`}
                    >
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-gradient-to-br ${
                            item.type === 'crypto' ? 'from-orange-500/10 to-orange-600/5 text-orange-400' :
                            item.type === 'forex' ? 'from-blue-500/10 to-blue-600/5 text-blue-400' :
                            item.type === 'indices' ? 'from-green-500/10 to-green-600/5 text-green-400' :
                            'from-yellow-500/10 to-yellow-600/5 text-yellow-400'
                          }`}>
                            {item.symbol.substring(0, 2)}
                          </div>
                          <span className="text-white font-medium group-hover/row:text-blue-400 transition-colors">{item.name || ASSET_NAMES[item.symbol] || item.symbol}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="border-slate-700/50 text-slate-400 text-xs bg-slate-800/30">
                          {item.type}
                        </Badge>
                      </td>
                      <td className="py-4 text-right text-white font-medium">
                        ${priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-right pr-4">
                        <Badge className={`${isPositive ? "bg-green-600/20 text-green-400 border border-green-500/20" : "bg-red-600/20 text-red-400 border border-red-500/20"}`}>
                          {isPositive ? "+" : ""}{priceData.changePercent.toFixed(2)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}