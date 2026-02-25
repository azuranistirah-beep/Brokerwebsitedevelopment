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

// ✅ CRYPTO SYMBOLS - Using Binance WebSocket for REAL-TIME prices!
const CRYPTO_SYMBOLS = [
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
];

// ✅ NON-CRYPTO SYMBOLS - Forex, Commodities, Stocks (using fallback prices)
const NON_CRYPTO_SYMBOLS = [
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
  'XAUUSD', 'XAGUSD',
  
  // Stocks (87)
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
  'UBER', 'DASH', 'ABNB',
  'SPX500', 'NSX100'
];

// ✅ FALLBACK PRICES for non-crypto assets
const FALLBACK_PRICES: Record<string, number> = {
  // Forex
  'EURUSD': 1.0850, 'GBPUSD': 1.2650, 'USDJPY': 148.50, 'AUDUSD': 0.6550, 
  'USDCHF': 0.8850, 'NZDUSD': 0.6050, 'USDCAD': 1.3550,
  'EURGBP': 0.8580, 'EURJPY': 161.20, 'GBPJPY': 187.90,
  
  // Commodities
  'GOLD': 2048.50, 'XAUUSD': 2048.50, 'SILVER': 24.85, 'XAGUSD': 24.85,
  'USOIL': 78.50, 'UKOIL': 82.30,
  
  // Stocks
  'AAPL': 178.50, 'MSFT': 378.90, 'GOOGL': 141.20, 'AMZN': 152.80, 'META': 358.60,
  'NVDA': 495.30, 'TSLA': 248.70, 'AMD': 138.90, 'NFLX': 458.20, 'INTC': 43.80,
  'JPM': 158.40, 'BAC': 33.60, 'V': 258.70, 'MA': 418.90,
  'SPX500': 4958.61, 'NSX100': 17863.24,
};

export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});

  useEffect(() => {
    console.log('🚀 [PriceContext] USING BINANCE WEBSOCKET for crypto (REAL-TIME!)');
    console.log(`📊 Crypto symbols: ${CRYPTO_SYMBOLS.length}`);
    console.log(`📊 Non-crypto symbols: ${NON_CRYPTO_SYMBOLS.length} (using fallback)`);
    
    // ✅ Subscribe to ALL CRYPTO via Binance WebSocket (SAME as MemberDashboard!)
    const unsubscribeFunctions: (() => void)[] = [];
    
    CRYPTO_SYMBOLS.forEach((symbol) => {
      const unsubscribe = unifiedPriceService.subscribe(symbol, (data) => {
        setPrices((prev) => ({
          ...prev,
          [symbol]: {
            price: data.price,
            change: data.change24h,
            changePercent: data.changePercent24h,
            change24h: data.change24h,
            basePrice: data.price - data.change24h,
            timestamp: data.timestamp,
          },
        }));
      });
      
      unsubscribeFunctions.push(unsubscribe);
    });

    console.log('✅ [PriceContext] All crypto subscribed via Binance WebSocket!');
    console.log('🎉 ALL CRYPTO PRICES ARE NOW REAL-TIME (same as MemberDashboard)!');

    // ✅ Set fallback prices for non-crypto assets
    NON_CRYPTO_SYMBOLS.forEach((symbol) => {
      const basePrice = FALLBACK_PRICES[symbol] || 100;
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.005); // Small random variation
      const change24h = price * (Math.random() - 0.5) * 0.02;
      
      setPrices((prev) => ({
        ...prev,
        [symbol]: {
          price: parseFloat(price.toFixed(symbol.includes('JPY') ? 2 : 4)),
          change: change24h,
          changePercent: (change24h / (price - change24h)) * 100,
          change24h: change24h,
          basePrice: price - change24h,
          timestamp: Date.now(),
        },
      }));
    });

    console.log('✅ [PriceContext] Non-crypto fallback prices set!');

    // Cleanup
    return () => {
      console.log('🧹 [PriceContext] Unsubscribing from all crypto symbols...');
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
    console.error('❌ [usePrices] Context is undefined! Make sure PriceProvider is wrapping your component tree.');
    throw new Error('usePrices must be used within PriceProvider');
  }
  return context;
}
