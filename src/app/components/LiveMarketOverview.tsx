import { TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { unifiedPriceService } from "../lib/unifiedPriceService";

interface MarketItem {
  symbol: string;
  price: number;
  change: number;
  name?: string;
  type: string;
  basePrice?: number;
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

// Initial market data - will be updated via real-time subscriptions
const INITIAL_MARKET_DATA: MarketItem[] = [
  // Crypto (will get real-time updates)
  { symbol: "BTCUSD", price: 68000, change: 0, name: "Bitcoin", type: "crypto", basePrice: 68000 },
  { symbol: "ETHUSD", price: 3400, change: 0, name: "Ethereum", type: "crypto", basePrice: 3400 },
  { symbol: "BNBUSD", price: 610, change: 0, name: "BNB", type: "crypto", basePrice: 610 },
  { symbol: "SOLUSD", price: 145, change: 0, name: "Solana", type: "crypto", basePrice: 145 },
  { symbol: "XRPUSD", price: 1.40, change: 0, name: "XRP", type: "crypto", basePrice: 1.40 },
  
  // Forex
  { symbol: "EURUSD", price: 1.0845, change: -0.15, name: "EUR/USD", type: "forex", basePrice: 1.0845 },
  { symbol: "GBPUSD", price: 1.2634, change: 0.23, name: "GBP/USD", type: "forex", basePrice: 1.2634 },
  { symbol: "USDJPY", price: 149.45, change: 0.45, name: "USD/JPY", type: "forex", basePrice: 149.45 },
  
  // Indices
  { symbol: "SPX500", price: 4850.45, change: 0.78, name: "S&P 500", type: "indices", basePrice: 4850.45 },
  { symbol: "NSX100", price: 16420.30, change: 1.23, name: "Nasdaq 100", type: "indices", basePrice: 16420.30 },
  
  // Commodities
  { symbol: "GOLD", price: 2345.60, change: 0.56, name: "Gold", type: "commodities", basePrice: 2345.60 },
  { symbol: "SILVER", price: 24.85, change: 1.12, name: "Silver", type: "commodities", basePrice: 24.85 },
];

export function LiveMarketOverview() {
  const [marketData, setMarketData] = useState<MarketItem[]>(INITIAL_MARKET_DATA);
  const [flashingSymbols, setFlashingSymbols] = useState<Set<string>>(new Set());

  // Subscribe to real-time crypto price updates
  useEffect(() => {
    console.log('🔌 [LiveMarketOverview] Setting up real-time price subscriptions...');
    
    const unsubscribeFunctions: (() => void)[] = [];
    
    // Subscribe to crypto symbols
    const cryptoSymbols = INITIAL_MARKET_DATA.filter(item => item.type === 'crypto');
    
    cryptoSymbols.forEach((item) => {
      const unsubscribe = unifiedPriceService.subscribe(item.symbol, (priceData) => {
        console.log(`💰 [LiveMarketOverview] Real-time update: ${item.symbol} = $${priceData.price.toFixed(2)}`);
        
        // Add flash effect
        setFlashingSymbols(prev => new Set(prev).add(item.symbol));
        setTimeout(() => {
          setFlashingSymbols(prev => {
            const newSet = new Set(prev);
            newSet.delete(item.symbol);
            return newSet;
          });
        }, 500);
        
        // Update market data
        setMarketData((prevData) => {
          return prevData.map((dataItem) => {
            if (dataItem.symbol === item.symbol) {
              const basePrice = dataItem.basePrice || dataItem.price;
              const change = basePrice > 0 ? ((priceData.price - basePrice) / basePrice) * 100 : 0;
              
              return {
                ...dataItem,
                price: priceData.price,
                change: Number(change.toFixed(2)),
              };
            }
            return dataItem;
          });
        });
      });
      
      unsubscribeFunctions.push(unsubscribe);
    });
    
    console.log(`✅ [LiveMarketOverview] Subscribed to ${cryptoSymbols.length} crypto symbols`);
    
    // Cleanup
    return () => {
      console.log('🔌 [LiveMarketOverview] Cleaning up subscriptions...');
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* ✨ Top 4 Market Cards with Gradient Borders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketData.slice(0, 4).map((item) => {
          const isFlashing = flashingSymbols.has(item.symbol);
          const isPositive = item.change >= 0;
          
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
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    {isPositive ? "+" : ""}{item.change.toFixed(2)}%
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
              {marketData
                .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                .slice(0, 5)
                .map((item, index) => {
                  const isPositive = item.change >= 0;
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
                          <p className="text-xs text-slate-500">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <Badge className={`${isPositive ? "bg-green-600/20 text-green-400 hover:bg-green-600/20 border border-green-500/20" : "bg-red-600/20 text-red-400 hover:bg-red-600/20 border border-red-500/20"}`}>
                        {isPositive ? "+" : ""}{item.change.toFixed(2)}%
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
              {marketData.length} Assets
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
                {marketData.map((item, index) => {
                  const isPositive = item.change >= 0;
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
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-right pr-4">
                        <Badge className={`${isPositive ? "bg-green-600/20 text-green-400 border border-green-500/20" : "bg-red-600/20 text-red-400 border border-red-500/20"}`}>
                          {isPositive ? "+" : ""}{item.change.toFixed(2)}%
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