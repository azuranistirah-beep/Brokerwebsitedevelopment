import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { unifiedPriceService } from '../lib/unifiedPriceService';

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  basePrice: number;
  timestamp: number;
}

interface PriceContextType {
  prices: Record<string, PriceData>;
  getPrice: (symbol: string) => PriceData | null;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

// ✅ ALL SUPPORTED SYMBOLS - Crypto, Forex, Indices, Commodities
const ALL_SYMBOLS = [
  // Crypto
  'BTCUSD', 'ETHUSD', 'BNBUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD', 'DOGEUSD', 'MATICUSD',
  // Forex
  'EURUSD', 'GBPUSD', 'USDJPY',
  // Indices
  'SPX500', 'NSX100',
  // Commodities
  'GOLD', 'SILVER',
];

export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});

  useEffect(() => {
    console.log('🔌 [PriceContext] Initializing real-time price subscriptions for ALL symbols...');
    
    const unsubscribeFunctions: (() => void)[] = [];

    // Subscribe to ALL symbols
    ALL_SYMBOLS.forEach((symbol) => {
      const unsubscribe = unifiedPriceService.subscribe(symbol, (priceData) => {
        setPrices((prevPrices) => {
          const existing = prevPrices[symbol];
          const basePrice = existing?.basePrice || priceData.price;
          const change = priceData.price - basePrice;
          const changePercent = basePrice > 0 ? (change / basePrice) * 100 : 0;

          console.log(`💰 [PriceContext] ${symbol} = $${priceData.price.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);

          return {
            ...prevPrices,
            [symbol]: {
              price: priceData.price,
              change,
              changePercent,
              basePrice,
              timestamp: Date.now(),
            },
          };
        });
      });

      unsubscribeFunctions.push(unsubscribe);
    });

    console.log(`✅ [PriceContext] Subscribed to ${ALL_SYMBOLS.length} symbols`);

    // Cleanup
    return () => {
      console.log('🔌 [PriceContext] Cleaning up all subscriptions...');
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, []);

  const getPrice = (symbol: string): PriceData | null => {
    return prices[symbol] || null;
  };

  return (
    <PriceContext.Provider value={{ prices, getPrice }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrices() {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrices must be used within PriceProvider');
  }
  return context;
}
