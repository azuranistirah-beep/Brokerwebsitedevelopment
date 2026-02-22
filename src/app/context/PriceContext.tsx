import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { unifiedPriceService } from '../lib/unifiedPriceService';

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  change24h?: number;
  basePrice: number;
  timestamp: number;
}

interface PriceContextType {
  prices: Record<string, PriceData>;
  getPrice: (symbol: string) => PriceData | null;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

// ✅ ALL SUPPORTED SYMBOLS - Crypto (101), Forex (56), Commodities (4), Stocks (87) = Total 248 Assets
const ALL_SYMBOLS = [
  // Crypto - Top 101
  'BTCUSD', 'ETHUSD', 'BNBUSD', 'XRPUSD', 'SOLUSD', 'ADAUSD', 'DOGEUSD', 'MATICUSD',
  'DOTUSD', 'AVAXUSD', 'SHIBUSDT', 'LINKUSD', 'TRXUSD', 'UNIUSD', 'LTCUSD', 'ATOMUSD',
  'ETCUSD', 'NEARUSD', 'APTUSD', 'ARBUSD', 'OPUSD', 'LDOUSD', 'XLMUSD', 'BCHUSD',
  'ALGOUSD', 'VETUSD', 'FILUSD', 'ICPUSD', 'SANDUSD', 'MANAUSD', 'AXSUSD', 'GRTUSD',
  'FTMUSD', 'ENJUSD', 'APEUSD', 'GMXUSD', 'RUNEUSD', 'QNTUSD', 'IMXUSD', 'CRVUSD',
  'MKRUSD', 'AAVEUSD', 'SNXUSD', 'COMPUSD', 'YFIUSD', 'SUSHIUSD', 'ZRXUSD', 'BATUSD',
  'ZECUSD', 'DASHUSD', '1INCHUSD', 'HBARUSD', 'FLOWUSD', 'ONEUSD', 'THETAUSD', 'CHZUSD',
  'HOTUSD', 'ZILUSD', 'WAVESUSD', 'KAVAUSD', 'ONTUSD', 'XTZUSD', 'QTUMUSD', 'RVNUSD',
  'NMRUSD', 'STORJUSD', 'ANKRUSD', 'CELRUSD', 'CKBUSD', 'FETUSD', 'IOTXUSD', 'LRCUSD',
  'OCEANUSD', 'RSRUSD', 'SKLUSD', 'UMAUSD', 'WOOUSD', 'BANDUSD', 'KSMUSD', 'BALUSD',
  'COTIUSD', 'OGNUSD', 'RLCUSD', 'SRMUSD', 'LPTUSD', 'ALPHAUSD', 'CTSIUSD', 'ROSEUSD',
  'GLMUSD', 'JASMYUSD', 'PEOPLEUSD', 'GALAUSD', 'INJUSD', 'MINAUSD', 'ARUSD', 'CFXUSD',
  'KLAYUSD',
  
  // Forex - Major Pairs (7)
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF', 'NZDUSD', 'USDCAD',
  
  // Forex - Cross Pairs (20)
  'EURGBP', 'EURJPY', 'GBPJPY', 'EURAUD', 'EURCHF', 'GBPAUD', 'GBPCHF', 'AUDJPY',
  'NZDJPY', 'CHFJPY', 'CADJPY', 'AUDCAD', 'AUDCHF', 'AUDNZD', 'CADCHF', 'EURNZD',
  'EURCAD', 'GBPCAD', 'GBPNZD', 'NZDCAD', 'NZDCHF',
  
  // Forex - Exotic Pairs (29)
  'USDSGD', 'USDHKD', 'USDMXN', 'USDZAR', 'USDTRY', 'USDSEK', 'USDNOK', 'USDDKK',
  'USDPLN', 'USDHUF', 'USDCZK', 'USDTHB', 'USDIDR', 'USDKRW', 'USDCNH', 'USDINR',
  'USDBRL', 'USDARS', 'USDCLP', 'EURSGD', 'GBPSGD', 'EURHUF', 'EURPLN', 'EURTRY',
  'EURSEK', 'EURNOK', 'EURDKK', 'EURZAR',
  
  // Commodities (4)
  'GOLD', 'SILVER', 'USOIL', 'UKOIL',
  
  // Stocks (87) - US Tech, Finance, Consumer, Healthcare, Energy, Auto, Chinese, Asia, Crypto/AI, Semiconductor, E-commerce
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'NFLX', 'INTC',
  'ADBE', 'CRM', 'ORCL', 'CSCO', 'IBM', 'QCOM', 'AVGO',
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'V', 'MA', 'PYPL',
  'WMT', 'TGT', 'HD', 'KO', 'PEP', 'MCD', 'SBUX', 'NKE', 'DIS', 'COST',
  'JNJ', 'PFE', 'UNH', 'CVS', 'ABBV', 'MRK', 'TMO', 'LLY',
  'XOM', 'CVX', 'COP', 'SLB', 'BA', 'CAT', 'GE',
  'F', 'GM', 'RIVN',
  'BABA', 'BIDU', 'JD', 'PDD', 'NIO',
  'TSM', 'ASML', 'SONY', 'TM',
  'COIN', 'MSTR', 'PLTR', 'SNOW', 'CRWD',
  'MU', 'AMAT', 'LRCX',
  'UBER', 'DASH', 'ABNB'
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

          // Only log Bitcoin for monitoring (reduce console spam)
          if (symbol === 'BTCUSD') {
            console.log(`💰 [PriceContext] ${symbol} = $${priceData.price.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
          }

          return {
            ...prevPrices,
            [symbol]: {
              price: priceData.price,
              change,
              changePercent,
              change24h: changePercent, // Use same value for now
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
    // ✅ More helpful error message for debugging
    console.error('❌ [usePrices] Context is undefined! Make sure PriceProvider is wrapping your component tree.');
    console.error('📍 Current component trying to use usePrices is not inside PriceProvider.');
    throw new Error('usePrices must be used within PriceProvider');
  }
  return context;
}