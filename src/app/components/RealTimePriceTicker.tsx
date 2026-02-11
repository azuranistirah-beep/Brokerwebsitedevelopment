import { useEffect, useState } from 'react';
import { realTimeWebSocket } from '../lib/realTimeWebSocket';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  payout: number;
}

interface PriceInfo {
  price: number;
  change: number;
  changePercent: number;
}

interface RealTimePriceTickerProps {
  assets: Asset[];
  selectedSymbol?: string;
  onSelectAsset?: (asset: Asset) => void;
}

export function RealTimePriceTicker({ assets, selectedSymbol, onSelectAsset }: RealTimePriceTickerProps) {
  const [prices, setPrices] = useState<Map<string, PriceInfo>>(new Map());

  useEffect(() => {
    console.log('🎯 [PriceTicker] Subscribing to real-time prices for', assets.length, 'assets');
    
    // Subscribe to all assets
    const unsubscribers = assets.map(asset => {
      let previousPrice = 0;
      
      return realTimeWebSocket.subscribe(asset.symbol, (price) => {
        setPrices(prev => {
          const newPrices = new Map(prev);
          const current = newPrices.get(asset.symbol);
          
          if (previousPrice === 0) {
            previousPrice = price;
          }
          
          const change = price - previousPrice;
          const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
          
          newPrices.set(asset.symbol, {
            price,
            change,
            changePercent
          });
          
          return newPrices;
        });
      });
    });

    return () => {
      console.log('🛑 [PriceTicker] Unsubscribing from all prices');
      unsubscribers.forEach(unsub => unsub());
    };
  }, [assets]);

  return (
    <div className="space-y-1">
      {assets.map(asset => {
        const priceInfo = prices.get(asset.symbol);
        const isSelected = selectedSymbol === asset.symbol;
        const isPositive = (priceInfo?.change || 0) >= 0;

        return (
          <button
            key={asset.symbol}
            onClick={() => onSelectAsset?.(asset)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
              isSelected 
                ? 'bg-slate-700 border border-blue-500' 
                : 'hover:bg-slate-800 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {asset.symbol}
                </span>
                {priceInfo && (
                  isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )
                )}
              </div>
              <span className={`text-xs font-bold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {priceInfo ? `${isPositive ? '+' : ''}${priceInfo.changePercent.toFixed(2)}%` : '...'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{asset.name}</span>
              <span className="text-sm font-mono text-white">
                {priceInfo ? `$${priceInfo.price.toFixed(2)}` : 'Loading...'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
