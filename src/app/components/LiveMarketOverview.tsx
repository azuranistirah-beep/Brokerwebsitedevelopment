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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketData.slice(0, 4).map((item) => {
          const isFlashing = flashingSymbols.has(item.symbol);
          const isPositive = item.change >= 0;
          
          return (
            <Card 
              key={item.symbol} 
              className={`p-6 border-slate-800 bg-slate-900 transition-all duration-300 ${
                isFlashing ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{item.name || ASSET_NAMES[item.symbol] || item.symbol}</p>
                  <h3 className="text-2xl font-bold text-white">
                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                {isPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={isPositive ? "bg-green-600/20 text-green-400 hover:bg-green-600/20" : "bg-red-600/20 text-red-400 hover:bg-red-600/20"}>
                  {isPositive ? "+" : ""}{item.change.toFixed(2)}%
                </Badge>
                <span className="text-xs text-slate-500 uppercase">{item.type}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        <Card className="p-6 border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Top Movers</h3>
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-4">
            {marketData
              .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
              .slice(0, 5)
              .map((item) => {
                const isPositive = item.change >= 0;
                const isFlashing = flashingSymbols.has(item.symbol);
                
                return (
                  <div 
                    key={item.symbol} 
                    className={`flex items-center justify-between py-2 border-b border-slate-800 last:border-0 transition-all ${
                      isFlashing ? 'bg-blue-900/20 px-2 rounded' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium text-white text-sm">{item.name || ASSET_NAMES[item.symbol] || item.symbol}</p>
                      <p className="text-xs text-slate-500">${item.price.toFixed(2)}</p>
                    </div>
                    <Badge className={isPositive ? "bg-green-600/20 text-green-400 hover:bg-green-600/20" : "bg-red-600/20 text-red-400 hover:bg-red-600/20"}>
                      {isPositive ? "+" : ""}{item.change.toFixed(2)}%
                    </Badge>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      <Card className="p-6 border-slate-800 bg-slate-900">
        <h3 className="font-bold text-white mb-4">All Markets</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-400 text-sm font-medium pb-3">Asset</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3">Type</th>
                <th className="text-right text-slate-400 text-sm font-medium pb-3">Price</th>
                <th className="text-right text-slate-400 text-sm font-medium pb-3">Change</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((item) => {
                const isPositive = item.change >= 0;
                const isFlashing = flashingSymbols.has(item.symbol);
                
                return (
                  <tr 
                    key={item.symbol} 
                    className={`border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-all ${
                      isFlashing ? 'bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="py-3 text-white font-medium">{item.name || ASSET_NAMES[item.symbol] || item.symbol}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                        {item.type}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-white font-mono">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                        {isPositive ? "+" : ""}{item.change.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}