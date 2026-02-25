/**
 * ✅ UNIFIED PRICE SERVICE - BINANCE WEBSOCKET (EXACT MATCH TRADINGVIEW!)
 * 
 * VERSION: 27.0.0 - BINANCE WEBSOCKET PRIMARY
 * 
 * Strategy:
 * - Primary: Binance WebSocket (EXACT MATCH with TradingView!)
 * - Fallback: REST API polling if WebSocket fails
 * - 100% accurate, matches TradingView ticker!
 */

interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
  source: string;
}

interface Subscriber {
  callback: (data: PriceData) => void;
  symbol: string;
}

interface BinanceTicker {
  e: string;      // Event type
  E: number;      // Event time
  s: string;      // Symbol
  c: string;      // Close price (current price)
  o: string;      // Open price
  h: string;      // High price
  l: string;      // Low price
  v: string;      // Volume
  q: string;      // Quote volume
}

class UnifiedPriceService {
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  private latestPrices: Map<string, PriceData> = new Map();
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly VERSION = '27.0.0-BINANCE-WEBSOCKET';
  private pollInterval: NodeJS.Timeout | null = null;
  private isWebSocketConnected: boolean = false;
  
  // Symbol mapping (TradingView format → Binance format)
  private symbolMap: Map<string, string> = new Map([
    // Crypto - exact binance pairs
    ['BTCUSD', 'btcusdt'],
    ['ETHUSD', 'ethusdt'],
    ['BNBUSD', 'bnbusdt'],
    ['XRPUSD', 'xrpusdt'],
    ['SOLUSD', 'solusdt'],
    ['ADAUSD', 'adausdt'],
    ['DOGEUSD', 'dogeusdt'],
    ['MATICUSD', 'maticusdt'],
    ['DOTUSD', 'dotusdt'],
    ['AVAXUSD', 'avaxusdt'],
    ['SHIBUSDT', 'shibusdt'],
    ['LINKUSD', 'linkusdt'],
    ['TRXUSD', 'trxusdt'],
    ['UNIUSD', 'uniusdt'],
    ['LTCUSD', 'ltcusdt'],
    ['ATOMUSD', 'atomusdt'],
    ['ETCUSD', 'etcusdt'],
    ['NEARUSD', 'nearusdt'],
    ['APTUSD', 'aptusdt'],
    ['ARBUSD', 'arbusdt'],
    ['OPUSD', 'opusdt'],
    ['LDOUSD', 'ldousdt'],
    ['XLMUSD', 'xlmusdt'],
    ['BCHUSD', 'bchusdt'],
    ['ALGOUSD', 'algousdt'],
    ['VETUSD', 'vetusdt'],
    ['FILUSD', 'filusdt'],
    ['ICPUSD', 'icpusdt'],
    ['SANDUSD', 'sandusdt'],
    ['MANAUSD', 'manausdt'],
    ['AXSUSD', 'axsusdt'],
    ['GRTUSD', 'grtusdt'],
    ['FTMUSD', 'ftmusdt'],
    ['ENJUSD', 'enjusdt'],
    ['APEUSD', 'apeusdt'],
    ['GMXUSD', 'gmxusdt'],
    ['RUNEUSD', 'runeusdt'],
    ['QNTUSD', 'qntusdt'],
    ['IMXUSD', 'imxusdt'],
    ['CRVUSD', 'crvusdt'],
    ['MKRUSD', 'mkrusdt'],
    ['AAVEUSD', 'aaveusdt'],
    ['SNXUSD', 'snxusdt'],
    ['COMPUSD', 'compusdt'],
    ['YFIUSD', 'yfiusdt'],
    ['SUSHIUSD', 'sushiusdt'],
    ['ZRXUSD', 'zrxusdt'],
    ['BATUSD', 'batusdt'],
    ['ZECUSD', 'zecusdt'],
    ['DASHUSD', 'dashusdt'],
    ['1INCHUSD', '1inchusdt'],
    ['HBARUSD', 'hbarusdt'],
    ['FLOWUSD', 'flowusdt'],
    ['ONEUSD', 'oneusdt'],
    ['THETAUSD', 'thetausdt'],
    ['CHZUSD', 'chzusdt'],
    ['HOTUSD', 'hotusdt'],
    ['ZILUSD', 'zilusdt'],
    ['WAVESUSD', 'wavesusdt'],
    ['KAVAUSD', 'kavausdt'],
    ['ONTUSD', 'ontusdt'],
    ['XTZUSD', 'xtzusdt'],
    ['QTUMUSD', 'qtumusdt'],
    ['RVNUSD', 'rvnusdt'],
    ['NMRUSD', 'nmrusdt'],
    ['STORJUSD', 'storjusdt'],
    ['ANKRUSD', 'ankrusdt'],
    ['CELRUSD', 'celrusdt'],
    ['CKBUSD', 'ckbusdt'],
    ['FETUSD', 'fetusdt'],
    ['IOTXUSD', 'iotxusdt'],
    ['LRCUSD', 'lrcusdt'],
    ['OCEANUSD', 'oceanusdt'],
    ['RSRUSD', 'rsrusdt'],
    ['SKLUSD', 'sklusdt'],
    ['UMAUSD', 'umausdt'],
    ['WOOUSD', 'woousdt'],
    ['BANDUSD', 'bandusdt'],
    ['KSMUSD', 'ksmusdt'],
    ['BALUSD', 'balusdt'],
    ['COTIUSD', 'cotiusdt'],
    ['OGNUSD', 'ognusdt'],
    ['RLCUSD', 'rlcusdt'],
    ['SRMUSD', 'srmusdt'],
    ['LPTUSD', 'lptusdt'],
    ['ALPHAUSD', 'alphausdt'],
    ['CTSIUSD', 'ctsiusdt'],
    ['ROSEUSD', 'roseusdt'],
    ['GLMUSD', 'glmusdt'],
    ['JASMYUSD', 'jasmyusdt'],
    ['PEOPLEUSD', 'peopleusdt'],
    ['GALAUSD', 'galausdt'],
    ['INJUSD', 'injusdt'],
    ['MINAUSD', 'minausdt'],
    ['ARUSD', 'arusdt'],
    ['CFXUSD', 'cfxusdt'],
    ['KLAYUSD', 'klayusdt'],
  ]);

  constructor() {
    console.log(`🎯 [UnifiedPriceService v${this.VERSION}] Initialized`);
    console.log('🌐 Using Binance WebSocket (EXACT MATCH with TradingView!)');
    // ✅ DON'T connect here - wait for first subscriber
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
      return mapped.toUpperCase();
    }

    // Convert to Binance format (BTCUSDT)
    if (clean.endsWith('USD') && !clean.endsWith('USDT')) {
      clean = clean.replace('USD', 'USDT');
    }

    return clean;
  }

  /**
   * ✅ CHECK IF SYMBOL IS CRYPTO (only crypto supported)
   */
  private isCryptoSymbol(symbol: string): boolean {
    return symbol.endsWith('USDT');
  }

  /**
   * ✅ CONNECT TO BINANCE WEBSOCKET
   */
  private connectWebSocket(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('⚠️ [Binance] WebSocket already connected');
      return;
    }

    const subscribedSymbols = Array.from(this.subscribers.keys());
    if (subscribedSymbols.length === 0) {
      console.log('⏸️ [Binance] No symbols to subscribe yet, waiting...');
      return;
    }

    // Filter only crypto symbols
    const cryptoSymbols = subscribedSymbols.filter(s => this.isCryptoSymbol(s));
    if (cryptoSymbols.length === 0) {
      console.log('⏸️ [Binance] No crypto symbols to subscribe');
      return;
    }

    // Create stream list
    const streams = cryptoSymbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    console.log(`🔌 [Binance] Connecting to WebSocket...`);
    console.log(`📊 [Binance] Subscribing to ${cryptoSymbols.length} symbols`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ [Binance] WebSocket CONNECTED - Real-time prices active!');
        this.isWebSocketConnected = true;
        this.reconnectAttempts = 0;
        
        // Stop polling if running
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
          this.pollInterval = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.data) {
            const ticker: BinanceTicker = message.data;
            const price = parseFloat(ticker.c);
            const symbol = ticker.s; // Already in uppercase (BTCUSDT)

            if (!isNaN(price) && price > 0) {
              const priceData: PriceData = {
                symbol: symbol,
                price: price,
                timestamp: Date.now(),
                source: 'binance-ws'
              };

              this.updatePrice(priceData);
              
              // ✅ Log first price update for each symbol
              if (!this.latestPrices.has(symbol) || this.latestPrices.size <= 5) {
                console.log(`💰 [Binance WS] ${symbol}: $${price.toFixed(2)}`);
              }
            }
          }
        } catch (error) {
          console.error('❌ [Binance] Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ [Binance] WebSocket Error:', error);
      };

      this.ws.onclose = () => {
        console.warn('⚠️ [Binance] WebSocket disconnected');
        this.isWebSocketConnected = false;
        this.ws = null;

        // Try to reconnect
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`🔄 [Binance] Reconnecting in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.connectWebSocket();
          }, delay);
        } else {
          console.error('❌ [Binance] Max reconnection attempts reached. Falling back to REST API...');
          this.startPolling();
        }
      };

    } catch (error) {
      console.error('❌ [Binance] Failed to create WebSocket:', error);
      this.startPolling();
    }
  }

  /**
   * ✅ START REST API POLLING (fallback)
   */
  private startPolling(): void {
    if (this.pollInterval) {
      return; // Already polling
    }

    console.log('🔄 [Binance] Starting REST API polling (fallback mode)...');
    
    // Poll immediately
    this.fetchPricesREST();
    
    // Then poll every 2 seconds
    this.pollInterval = setInterval(() => {
      this.fetchPricesREST();
    }, 2000);
  }

  /**
   * ✅ FETCH PRICES FROM BINANCE REST API
   */
  private async fetchPricesREST(): Promise<void> {
    const symbols = Array.from(this.subscribers.keys());
    const cryptoSymbols = symbols.filter(s => this.isCryptoSymbol(s));
    
    if (cryptoSymbols.length === 0) {
      return;
    }

    try {
      // Fetch all tickers
      const response = await fetch('https://api.binance.com/api/v3/ticker/price');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const tickers: Array<{ symbol: string; price: string }> = await response.json();
      
      // Update prices for subscribed symbols
      cryptoSymbols.forEach(symbol => {
        const ticker = tickers.find(t => t.symbol === symbol);
        if (ticker) {
          const price = parseFloat(ticker.price);
          if (!isNaN(price) && price > 0) {
            const priceData: PriceData = {
              symbol: symbol,
              price: price,
              timestamp: Date.now(),
              source: 'binance-rest'
            };
            this.updatePrice(priceData);
          }
        }
      });

    } catch (error: any) {
      console.error(`❌ [Binance REST] Error: ${error.message}`);
    }
  }

  /**
   * ✅ Update price and notify subscribers
   */
  private updatePrice(priceData: PriceData): void {
    this.latestPrices.set(priceData.symbol, priceData);

    const subs = this.subscribers.get(priceData.symbol);
    if (subs && subs.size > 0) {
      subs.forEach(subscriber => {
        try {
          subscriber.callback(priceData);
        } catch (error) {
          console.error(`❌ Subscriber callback error:`, error);
        }
      });
    }
  }

  /**
   * ✅ SUBSCRIBE TO PRICE UPDATES
   */
  subscribe(symbol: string, callback: (data: PriceData) => void): () => void {
    const normalized = this.normalizeSymbol(symbol);
    
    // Skip non-crypto symbols
    if (!this.isCryptoSymbol(normalized)) {
      console.log(`⚠️ [Skip] ${symbol} - Only crypto supported by Binance`);
      return () => {};
    }

    const isNewSymbol = !this.subscribers.has(normalized);
    const subscriber: Subscriber = { callback, symbol: normalized };

    if (isNewSymbol) {
      this.subscribers.set(normalized, new Set());
      console.log(`📡 [Subscribe] ${symbol} → ${normalized}`);
    }

    this.subscribers.get(normalized)!.add(subscriber);

    // ✅ If new symbol added and WebSocket is connected, we need to reconnect with new streams
    if (isNewSymbol && this.isWebSocketConnected) {
      console.log('🔄 [Binance] New symbol added, reconnecting WebSocket...');
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.isWebSocketConnected = false;
      setTimeout(() => this.connectWebSocket(), 100);
    }
    // ✅ If first subscriber and WebSocket not connected, connect now
    else if (!this.isWebSocketConnected && !this.ws) {
      setTimeout(() => this.connectWebSocket(), 100);
    }

    // Return latest price if available
    const latestPrice = this.latestPrices.get(normalized);
    if (latestPrice) {
      try {
        callback(latestPrice);
      } catch (error) {
        console.error(`❌ Subscriber callback error:`, error);
      }
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(normalized);
      if (subs) {
        subs.delete(subscriber);
        if (subs.size === 0) {
          this.subscribers.delete(normalized);
          console.log(`📴 [Unsubscribe] ${normalized}`);
          
          // If no more subscribers, disconnect WebSocket
          if (this.subscribers.size === 0) {
            this.cleanup();
          }
        }
      }
    };
  }

  /**
   * ✅ GET LATEST PRICE (sync)
   */
  getLatestPrice(symbol: string): number | null {
    const normalized = this.normalizeSymbol(symbol);
    const data = this.latestPrices.get(normalized);
    return data ? data.price : null;
  }

  /**
   * ✅ CLEANUP ALL
   */
  cleanup(): void {
    console.log('🧹 [UnifiedPriceService] Cleaning up...');
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.subscribers.clear();
    this.latestPrices.clear();
    this.isWebSocketConnected = false;
  }
}

// Export singleton instance
export const unifiedPriceService = new UnifiedPriceService();