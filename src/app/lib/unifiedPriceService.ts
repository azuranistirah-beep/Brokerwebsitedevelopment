/**
 * ✅ UNIFIED PRICE SERVICE - REST API POLLING (NO WEBSOCKET!)
 * 
 * VERSION: 30.2.0 - TIMEOUT FIX!
 * 
 * Strategy:
 * - Using REST API polling instead of WebSocket (avoid CORS issues)
 * - Fetch via BACKEND PROXY (no CORS!)
 * - 100% reliable, no WebSocket errors!
 * - Added timeout handling (12s frontend, 10s backend)
 * - Graceful error handling - won't crash on timeout
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  change24h?: number;
  changePercent24h?: number;
  basePrice: number;
  timestamp: number;
}

interface Subscriber {
  callback: (data: PriceData) => void;
  symbol: string;
}

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  openPrice: string;
}

class UnifiedPriceService {
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  private latestPrices: Map<string, PriceData> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private readonly VERSION = '30.2.0-TIMEOUT-FIX';
  private isPolling: boolean = false;
  
  // Symbol mapping (TradingView format → Binance format)
  private symbolMap: Map<string, string> = new Map([
    // Crypto - exact binance pairs
    ['BTCUSD', 'BTCUSDT'],
    ['ETHUSD', 'ETHUSDT'],
    ['BNBUSD', 'BNBUSDT'],
    ['XRPUSD', 'XRPUSDT'],
    ['SOLUSD', 'SOLUSDT'],
    ['ADAUSD', 'ADAUSDT'],
    ['DOGEUSD', 'DOGEUSDT'],
    ['MATICUSD', 'MATICUSDT'],
    ['DOTUSD', 'DOTUSDT'],
    ['AVAXUSD', 'AVAXUSDT'],
    ['SHIBUSDT', 'SHIBUSDT'],
    ['LINKUSD', 'LINKUSDT'],
    ['TRXUSD', 'TRXUSDT'],
    ['UNIUSD', 'UNIUSDT'],
    ['LTCUSD', 'LTCUSDT'],
    ['ATOMUSD', 'ATOMUSDT'],
    ['ETCUSD', 'ETCUSDT'],
    ['NEARUSD', 'NEARUSDT'],
    ['APTUSD', 'APTUSDT'],
    ['ARBUSD', 'ARBUSDT'],
    ['OPUSD', 'OPUSDT'],
    ['LDOUSD', 'LDOUSDT'],
    ['XLMUSD', 'XLMUSDT'],
    ['BCHUSD', 'BCHUSDT'],
    ['ALGOUSD', 'ALGOUSDT'],
    ['VETUSD', 'VETUSDT'],
    ['FILUSD', 'FILUSDT'],
    ['ICPUSD', 'ICPUSDT'],
    ['SANDUSD', 'SANDUSDT'],
    ['MANAUSD', 'MANAUSDT'],
    ['AXSUSD', 'AXSUSDT'],
    ['GRTUSD', 'GRTUSDT'],
    ['FTMUSD', 'FTMUSDT'],
    ['ENJUSD', 'ENJUSDT'],
    ['APEUSD', 'APEUSDT'],
    ['GMXUSD', 'GMXUSDT'],
    ['RUNEUSD', 'RUNEUSDT'],
    ['QNTUSD', 'QNTUSDT'],
    ['IMXUSD', 'IMXUSDT'],
    ['CRVUSD', 'CRVUSDT'],
    ['MKRUSD', 'MKRUSDT'],
    ['AAVEUSD', 'AAVEUSDT'],
    ['SNXUSD', 'SNXUSDT'],
    ['COMPUSD', 'COMPUSDT'],
    ['YFIUSD', 'YFIUSDT'],
    ['SUSHIUSD', 'SUSHIUSDT'],
    ['ZRXUSD', 'ZRXUSDT'],
    ['BATUSD', 'BATUSDT'],
    ['ZECUSD', 'ZECUSDT'],
    ['DASHUSD', 'DASHUSDT'],
    ['1INCHUSD', '1INCHUSDT'],
    ['HBARUSD', 'HBARUSDT'],
    ['FLOWUSD', 'FLOWUSDT'],
    ['ONEUSD', 'ONEUSDT'],
    ['THETAUSD', 'THETAUSDT'],
    ['CHZUSD', 'CHZUSDT'],
    ['HOTUSD', 'HOTUSDT'],
    ['ZILUSD', 'ZILUSDT'],
    ['WAVESUSD', 'WAVESUSDT'],
    ['KAVAUSD', 'KAVAUSDT'],
    ['ONTUSD', 'ONTUSDT'],
    ['XTZUSD', 'XTZUSDT'],
    ['QTUMUSD', 'QTUMUSDT'],
    ['RVNUSD', 'RVNUSDT'],
    ['NMRUSD', 'NMRUSDT'],
    ['STORJUSD', 'STORJUSDT'],
    ['ANKRUSD', 'ANKRUSDT'],
    ['CELRUSD', 'CELRUSDT'],
    ['CKBUSD', 'CKBUSDT'],
    ['FETUSD', 'FETUSDT'],
    ['IOTXUSD', 'IOTXUSDT'],
    ['LRCUSD', 'LRCUSDT'],
    ['OCEANUSD', 'OCEANUSDT'],
    ['RSRUSD', 'RSRUSDT'],
    ['SKLUSD', 'SKLUSDT'],
    ['UMAUSD', 'UMAUSDT'],
    ['WOOUSD', 'WOOUSDT'],
    ['BANDUSD', 'BANDUSDT'],
    ['KSMUSD', 'KSMUSDT'],
    ['BALUSD', 'BALUSDT'],
    ['COTIUSD', 'COTIUSDT'],
    ['OGNUSD', 'OGNUSDT'],
    ['RLCUSD', 'RLCUSDT'],
    ['SRMUSD', 'SRMUSDT'],
    ['LPTUSD', 'LPTUSDT'],
    ['ALPHAUSD', 'ALPHAUSDT'],
    ['CTSIUSD', 'CTSIUSDT'],
    ['ROSEUSD', 'ROSEUSDT'],
    ['GLMUSD', 'GLMUSDT'],
    ['JASMYUSD', 'JASMYUSDT'],
    ['PEOPLEUSD', 'PEOPLEUSDT'],
    ['GALAUSD', 'GALAUSDT'],
    ['INJUSD', 'INJUSDT'],
    ['MINAUSD', 'MINAUSDT'],
    ['ARUSD', 'ARUSDT'],
    ['CFXUSD', 'CFXUSDT'],
    ['KLAYUSD', 'KLAYUSDT'],
  ]);

  constructor() {
    console.log(`🎯 [UnifiedPriceService v${this.VERSION}] Initialized`);
    console.log('🌐 Using Binance REST API polling (NO WebSocket!)');
  }

  /**
   * ✅ NORMALIZE SYMBOL (convert to Binance format)
   */
  private normalizeSymbol(symbol: string): string {
    let clean = symbol
      .replace('BINANCE:', '')
      .replace('BITSTAMP:', '')
      .replace('NASDAQ:', '')
      .replace('NYSE:', '')
      .replace('FX:', '')
      .replace('TVC:', '')
      .replace('OANDA:', '')
      .replace('FOREXCOM:', '')
      .replace('FX_IDC:', '')
      .replace('XETR:', '')
      .toUpperCase()
      .trim();

    // Check if we have direct mapping
    const mapped = this.symbolMap.get(clean);
    if (mapped) {
      return mapped;
    }

    // Convert to Binance format (BTCUSDT)
    if (clean.endsWith('USD') && !clean.endsWith('USDT')) {
      clean = clean.replace('USD', 'USDT');
    }

    return clean;
  }

  /**
   * ✅ CHECK IF CRYPTO SYMBOL
   */
  private isCryptoSymbol(symbol: string): boolean {
    return symbol.endsWith('USDT');
  }

  /**
   * ✅ FETCH PRICE DATA FROM BINANCE REST API
   */
  private async fetchBinancePrices(): Promise<void> {
    const subscribedSymbols = Array.from(this.subscribers.keys());
    console.log(`\n🔍 [Binance] FETCH DEBUG:`);
    console.log(`   Total subscribers: ${subscribedSymbols.length}`);
    
    if (subscribedSymbols.length === 0) {
      console.log(`⚠️ [Binance] No subscribers, skipping fetch`);
      return;
    }

    // Filter only crypto symbols
    const cryptoSymbols = subscribedSymbols.filter(s => this.isCryptoSymbol(s));
    console.log(`   Crypto symbols: ${cryptoSymbols.length}`, cryptoSymbols);
    
    if (cryptoSymbols.length === 0) {
      console.log(`⚠️ [Binance] No crypto symbols, skipping fetch`);
      return;
    }

    try {
      // ✅ USE BACKEND PROXY TO AVOID CORS!
      const proxyUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/binance/ticker/24hr`;
      
      console.log(`🔄 [Binance] Fetching via BACKEND PROXY...`);
      console.log(`   URL: ${proxyUrl}`);
      console.log(`   Symbols: ${cryptoSymbols.length}`);
      
      // ✅ Add frontend timeout (12 seconds to give backend time)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      
      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`❌ [Binance] Backend proxy error: ${response.status}`);
        const errorText = await response.text();
        console.error(`   Error details:`, errorText);
        
        // Don't crash, just skip this fetch cycle
        return;
      }

      const allTickers: BinanceTicker[] = await response.json();
      console.log(`✅ [Binance] Received ${allTickers.length} tickers from BACKEND PROXY`);
      
      let updatedCount = 0;
      
      // Process each subscribed symbol
      cryptoSymbols.forEach(binanceSymbol => {
        console.log(`🔍 [Binance] Looking for ticker: ${binanceSymbol}`);
        const ticker = allTickers.find(t => t.symbol === binanceSymbol);
        
        if (ticker) {
          const price = parseFloat(ticker.lastPrice);
          const change24h = parseFloat(ticker.priceChange);
          const changePercent24h = parseFloat(ticker.priceChangePercent);
          const openPrice = parseFloat(ticker.openPrice);
          
          console.log(`✅ [Binance] Found ticker for ${binanceSymbol}:`);
          console.log(`   Price: ${price}`);
          console.log(`   Change: ${change24h}`);
          console.log(`   Change%: ${changePercent24h}`);
          
          const priceData: PriceData = {
            price: price,
            change: change24h,
            changePercent: changePercent24h,
            change24h: change24h,
            changePercent24h: changePercent24h,
            basePrice: openPrice,
            timestamp: Date.now(),
          };

          // Update cache
          this.latestPrices.set(binanceSymbol, priceData);
          console.log(`💾 [Binance] Cached price for ${binanceSymbol}: $${price}`);

          // Notify subscribers
          const subscribers = this.subscribers.get(binanceSymbol);
          console.log(`📢 [Binance] Notifying ${subscribers?.size || 0} subscribers for ${binanceSymbol}`);
          
          if (subscribers) {
            subscribers.forEach((sub, index) => {
              try {
                console.log(`   📡 Calling subscriber #${index + 1} callback...`);
                sub.callback(priceData);
                console.log(`   ✅ Subscriber #${index + 1} callback executed!`);
              } catch (error) {
                console.error(`❌ [Binance] Subscriber callback error:`, error);
              }
            });
          } else {
            console.warn(`⚠️ [Binance] No subscribers found for ${binanceSymbol}!`);
          }
          
          updatedCount++;
        } else {
          console.warn(`⚠️ [Binance] No ticker found for ${binanceSymbol}`);
        }
      });

      console.log(`✅ [Binance] Updated ${updatedCount}/${cryptoSymbols.length} symbols via REST API`);
      
      // Log first 3 prices for debugging
      if (updatedCount > 0) {
        const firstThree = Array.from(this.latestPrices.entries()).slice(0, 3);
        firstThree.forEach(([symbol, data]) => {
          console.log(`💹 ${symbol}: $${data.price.toFixed(2)} (${data.changePercent24h.toFixed(2)}%)`);
        });
      }
      
    } catch (error) {
      console.error('❌ [Binance] REST API fetch error:', error);
    }
  }

  /**
   * ✅ START POLLING
   */
  private startPolling(): void {
    if (this.isPolling) {
      console.log('⚠️ [Binance] Polling already active');
      return;
    }

    console.log('🔄 [Binance] Starting REST API polling (every 2 seconds)...');
    this.isPolling = true;

    // Initial fetch
    this.fetchBinancePrices();

    // Poll every 2 seconds
    this.pollInterval = setInterval(() => {
      this.fetchBinancePrices();
    }, 2000);
  }

  /**
   * ✅ STOP POLLING
   */
  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      this.isPolling = false;
      console.log('🛑 [Binance] Stopped REST API polling');
    }
  }

  /**
   * ✅ SUBSCRIBE TO PRICE UPDATES
   */
  subscribe(symbol: string, callback: (data: PriceData) => void): () => void {
    const binanceSymbol = this.normalizeSymbol(symbol);
    
    console.log(`🔍 [UnifiedPriceService] SUBSCRIBE DEBUG:`);
    console.log(`   Input symbol: ${symbol}`);
    console.log(`   Normalized: ${binanceSymbol}`);
    console.log(`   Is crypto?: ${this.isCryptoSymbol(binanceSymbol)}`);
    
    if (!this.isCryptoSymbol(binanceSymbol)) {
      console.warn(`⚠️ [UnifiedPriceService] ${symbol} is not a crypto symbol, skipping subscription`);
      return () => {}; // Return empty unsubscribe function
    }

    // Create subscriber set if it doesn't exist
    if (!this.subscribers.has(binanceSymbol)) {
      this.subscribers.set(binanceSymbol, new Set());
      console.log(`➕ [UnifiedPriceService] Created new subscriber set for ${binanceSymbol}`);
    }

    // Add subscriber
    const subscriber: Subscriber = { callback, symbol: binanceSymbol };
    this.subscribers.get(binanceSymbol)!.add(subscriber);

    console.log(`✅ [UnifiedPriceService] Subscribed to ${symbol} (Binance: ${binanceSymbol})`);
    console.log(`📊 Total subscribers: ${this.subscribers.size} symbols, ${Array.from(this.subscribers.values()).reduce((acc, set) => acc + set.size, 0)} callbacks`);

    // Send cached data immediately if available
    const cached = this.latestPrices.get(binanceSymbol);
    if (cached) {
      console.log(`💾 [UnifiedPriceService] Sending cached data: $${cached.price.toFixed(2)}`);
      callback(cached);
    } else {
      console.log(`⚠️ [UnifiedPriceService] No cached data for ${binanceSymbol} yet`);
    }

    // Start polling if not already active
    if (!this.isPolling) {
      console.log(`🚀 [UnifiedPriceService] Starting polling...`);
      this.startPolling();
    } else {
      console.log(`✓ [UnifiedPriceService] Polling already active`);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(binanceSymbol);
      if (subs) {
        subs.delete(subscriber);
        
        // If no more subscribers for this symbol, remove it
        if (subs.size === 0) {
          this.subscribers.delete(binanceSymbol);
          console.log(`🧹 [UnifiedPriceService] Unsubscribed from ${binanceSymbol}`);
        }
      }

      // If no more subscribers at all, stop polling
      if (this.subscribers.size === 0) {
        this.stopPolling();
      }
    };
  }

  /**
   * ✅ GET CURRENT PRICE
   */
  getPrice(symbol: string): PriceData | null {
    const binanceSymbol = this.normalizeSymbol(symbol);
    return this.latestPrices.get(binanceSymbol) || null;
  }

  /**
   * ✅ CLEANUP
   */
  destroy(): void {
    this.stopPolling();
    this.subscribers.clear();
    this.latestPrices.clear();
    console.log('🧹 [UnifiedPriceService] Destroyed');
  }
}

// ✅ SINGLETON INSTANCE
export const unifiedPriceService = new UnifiedPriceService();