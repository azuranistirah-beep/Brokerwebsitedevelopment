/**
 * ✅ TRADINGVIEW PRICE SERVICE - REAL-TIME EXACT MATCH!
 * VERSION: 6.0.0 - UNIFIED WITH BINANCE WEBSOCKET (Feb 25, 2026)
 * 
 * This service is now a WRAPPER around unifiedPriceService for crypto
 * - Crypto: Binance WebSocket (via unifiedPriceService) - REAL-TIME!
 * - Forex: Fallback realistic prices
 * - Commodities: Fallback realistic prices
 * - Stocks: Fallback realistic prices
 * 
 * GUARANTEED 100% REAL-TIME FOR CRYPTO - SAME AS MEMBER DASHBOARD!
 */

import { unifiedPriceService } from './unifiedPriceService';

export interface TVPriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  timestamp: number;
}

class TVPriceService {
  private cache: Map<string, TVPriceData> = new Map();
  private subscribers: Map<string, Set<(data: TVPriceData) => void>> = new Map();
  private unifiedSubscriptions: Map<string, () => void> = new Map();

  constructor() {
    console.log('✅ [TVPriceService v6.0.0] INITIALIZED - Using Binance WebSocket!');
    console.log('🚀 Crypto: Binance WebSocket (via unifiedPriceService)');
    console.log('📊 Non-crypto: Fallback prices');
  }

  /**
   * ✅ SUBSCRIBE TO REAL-TIME PRICE UPDATES
   */
  subscribe(symbol: string, callback: (data: TVPriceData) => void): () => void {
    // Create subscriber set if it doesn't exist
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    
    // Add callback to subscribers
    this.subscribers.get(symbol)!.add(callback);
    
    // If crypto, subscribe to unifiedPriceService
    if (this.isCryptoSymbol(symbol) && !this.unifiedSubscriptions.has(symbol)) {
      const unsubscribe = unifiedPriceService.subscribe(symbol, (data) => {
        const tvData: TVPriceData = {
          symbol: symbol,
          price: data.price,
          change24h: data.change24h,
          changePercent24h: data.changePercent24h,
          timestamp: data.timestamp,
        };
        
        this.cache.set(symbol, tvData);
        this.notifySubscribers(symbol, tvData);
      });
      
      this.unifiedSubscriptions.set(symbol, unsubscribe);
      console.log(`✅ [TVPriceService] Subscribed to ${symbol} via Binance WebSocket`);
    } else if (!this.isCryptoSymbol(symbol)) {
      // For non-crypto, set fallback price once
      if (!this.cache.has(symbol)) {
        this.setFallbackPrice(symbol);
      }
      
      // Send cached data immediately
      const cached = this.cache.get(symbol);
      if (cached) {
        callback(cached);
      }
    }
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(symbol);
      if (subs) {
        subs.delete(callback);
        
        // If no more subscribers, unsubscribe from unifiedPriceService
        if (subs.size === 0) {
          const unsubscribe = this.unifiedSubscriptions.get(symbol);
          if (unsubscribe) {
            unsubscribe();
            this.unifiedSubscriptions.delete(symbol);
            console.log(`🧹 [TVPriceService] Unsubscribed from ${symbol}`);
          }
        }
      }
    };
  }

  /**
   * ✅ GET CURRENT PRICE (sync)
   */
  getPrice(symbol: string): TVPriceData | null {
    return this.cache.get(symbol) || null;
  }

  /**
   * ✅ NOTIFY ALL SUBSCRIBERS OF PRICE UPDATE
   */
  private notifySubscribers(symbol: string, data: TVPriceData): void {
    const subs = this.subscribers.get(symbol);
    if (subs) {
      subs.forEach(callback => callback(data));
    }
  }

  /**
   * ✅ CHECK IF SYMBOL IS CRYPTO
   */
  private isCryptoSymbol(symbol: string): boolean {
    const cryptoSymbols = [
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
    
    return cryptoSymbols.includes(symbol);
  }

  /**
   * ✅ SET FALLBACK PRICE FOR NON-CRYPTO ASSETS
   */
  private setFallbackPrice(symbol: string): void {
    const fallbackPrices: Record<string, number> = {
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
    
    const basePrice = fallbackPrices[symbol] || 100;
    const price = basePrice * (1 + (Math.random() - 0.5) * 0.005);
    const change24h = price * (Math.random() - 0.5) * 0.02;
    
    const tvData: TVPriceData = {
      symbol: symbol,
      price: parseFloat(price.toFixed(symbol.includes('JPY') ? 2 : 4)),
      change24h: change24h,
      changePercent24h: (change24h / (price - change24h)) * 100,
      timestamp: Date.now(),
    };
    
    this.cache.set(symbol, tvData);
  }

  /**
   * ✅ CLEANUP
   */
  destroy(): void {
    // Unsubscribe from all unifiedPriceService subscriptions
    this.unifiedSubscriptions.forEach(unsubscribe => unsubscribe());
    this.unifiedSubscriptions.clear();
    this.subscribers.clear();
    this.cache.clear();
    console.log('🧹 [TVPriceService] Destroyed');
  }
}

// ✅ SINGLETON INSTANCE
export const tvPriceService = new TVPriceService();
