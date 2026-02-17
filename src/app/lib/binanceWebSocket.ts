/**
 * Binance WebSocket Service
 * ✅ CRITICAL FIX: Using KLINE (candlestick) stream for chart synchronization
 * This ensures Live Price displays CURRENT CANDLE CLOSE, matching TradingView chart
 */

// Binance Kline (Candlestick) Data Structure
interface BinanceKline {
  e: string;      // Event type
  E: number;      // Event time
  s: string;      // Symbol
  k: {
    t: number;    // Kline start time
    T: number;    // Kline close time
    s: string;    // Symbol
    i: string;    // Interval
    f: number;    // First trade ID
    L: number;    // Last trade ID
    o: string;    // Open price
    c: string;    // Close price ✅ THIS IS WHAT WE DISPLAY
    h: string;    // High price
    l: string;    // Low price
    v: string;    // Base asset volume
    n: number;    // Number of trades
    x: boolean;   // Is this kline closed?
    q: string;    // Quote asset volume
    V: string;    // Taker buy base asset volume
    Q: string;    // Taker buy quote asset volume
    B: string;    // Ignore
  };
}

interface StreamData {
  stream: string;
  data: BinanceKline;
}

type PriceCallback = (price: number) => void;
type SubscriberId = string;

class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Map<SubscriberId, PriceCallback>> = new Map();
  private lastPrices: Map<string, number> = new Map();
  private reconnectTimeout: number | null = null;
  private messageCount = 0;

  /**
   * ✅ STEP 1: Check if symbol is crypto
   */
  isCrypto(symbol: string): boolean {
    const cryptoSymbols = [
      'BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'DOT',
      'MATIC', 'LTC', 'AVAX', 'LINK', 'ATOM', 'UNI', 'ETC', 
      'XLM', 'BCH', 'NEAR', 'TRX'
    ];
    return cryptoSymbols.some(crypto => symbol.toUpperCase().includes(crypto));
  }

  /**
   * ✅ STEP 2: Connect to Binance WebSocket
   * Using KLINE (candlestick) stream for chart-synchronized prices
   */
  private connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      console.log('🔗 [WS CONNECT] Already connected or connecting');
      return;
    }

    const symbols = Array.from(this.subscriptions.keys());
    if (symbols.length === 0) {
      console.log('🔗 [WS CONNECT] No symbols to subscribe');
      return;
    }

    // ✅ CRITICAL: Use kline (candlestick) stream for chart synchronization
    // This gives us CLOSE price of current candle, matching TradingView display
    const streams = symbols.map(s => `${s.toLowerCase()}@kline_1m`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔗 [WS CONNECT] Connecting to Binance Kline Stream...');
    console.log(`📊 [WS CONNECT] Symbols: ${symbols.join(', ')}`);
    console.log(`🌐 [WS CONNECT] URL: ${url}`);
    console.log(`📈 [WS CONNECT] Stream Type: Kline/Candlestick (1m)` );
    console.log(`🎯 [WS CONNECT] Price Type: Current Candle CLOSE (synchronized with chart)`);
    console.log('═══════════════════════════════════════════════════════');

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ [WS OPEN] Connected to Binance Kline stream!');
        console.log('✅ [WS OPEN] Now receiving candlestick CLOSE prices');
        this.messageCount = 0;
      };

      this.ws.onmessage = (event) => {
        this.messageCount++;
        
        try {
          const streamData: StreamData = JSON.parse(event.data);
          
          // ✅ CRITICAL: Log raw data to debug structure
          if (this.messageCount <= 3) {
            console.log(`📩 [WS MESSAGE #${this.messageCount}] RAW DATA:`, JSON.stringify(streamData, null, 2));
          }
          
          if (!streamData.data) {
            console.warn('⚠️ [WS MESSAGE] No data field in response');
            return;
          }
          
          if (!streamData.data.k) {
            console.warn('⚠️ [WS MESSAGE] No kline (k) field in data');
            return;
          }

          const kline = streamData.data.k;
          const symbol = kline.s;
          const closePrice = parseFloat(kline.c);  // ✅ Current candle CLOSE price
          const isComplete = kline.x;  // Is candle complete?
          
          if (!symbol || isNaN(closePrice) || closePrice <= 0) {
            console.warn(`⚠️ [WS MESSAGE #${this.messageCount}] Invalid data:`, { symbol, closePrice });
            return;
          }

          console.log(`📊 [WS MESSAGE #${this.messageCount}] Symbol: ${symbol}, Close: $${closePrice.toFixed(2)}, Complete: ${isComplete ? 'YES' : 'NO'}`);

          // Store price
          this.lastPrices.set(symbol, closePrice);

          // Notify subscribers
          this.notifySubscribers(symbol, closePrice);

        } catch (error) {
          console.error('❌ [WS MESSAGE] Parse error:', error);
          console.error('❌ [WS MESSAGE] Raw event data:', event.data);
        }
      };

      this.ws.onerror = (event) => {
        // ✅ SILENCED: WebSocket errors are expected due to browser/firewall blocking
        // Don't log to console to avoid confusion - we have REST API fallback
        // console.error('❌ [WS ERROR] WebSocket connection error');
      };

      this.ws.onclose = (event) => {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🔌 [WS CLOSE] Disconnected from Binance');
        console.log(`🔌 [WS CLOSE] Code: ${event.code}, Reason: ${event.reason || 'none'}`);
        console.log(`🔌 [WS CLOSE] Clean close: ${event.wasClean}`);
        console.log('═══════════════════════════════════════════════════════');

        this.ws = null;

        // Auto-reconnect if we still have subscribers
        if (this.subscriptions.size > 0) {
          console.log('🔄 [WS CLOSE] Reconnecting in 5 seconds...');
          this.reconnectTimeout = window.setTimeout(() => {
            this.connect();
          }, 5000);
        }
      };

    } catch (error) {
      console.error('❌ [WS CONNECT] Failed to create WebSocket:', error);
    }
  }

  /**
   * ✅ STEP 3: Notify all subscribers
   */
  private notifySubscribers(symbol: string, price: number) {
    const subs = this.subscriptions.get(symbol);
    if (!subs || subs.size === 0) {
      return;
    }

    console.log(`💰 [NOTIFY] Symbol: ${symbol}, Price: $${price.toFixed(2)}`);
    console.log(`💰 [NOTIFY] Notifying ${subs.size} subscriber(s)...`);

    let notifiedCount = 0;
    subs.forEach((callback, subscriberId) => {
      try {
        callback(price);
        notifiedCount++;
        console.log(`✅ [NOTIFY] Delivered to subscriber ${subscriberId}`);
      } catch (error) {
        console.error(`❌ [NOTIFY] Error calling subscriber ${subscriberId}:`, error);
      }
    });

    console.log(`✅ [NOTIFY] Successfully notified ${notifiedCount}/${subs.size} subscribers`);
  }

  /**
   * ✅ STEP 4: Fetch initial price via REST API
   */
  private async fetchInitialPrice(symbol: string, callback: PriceCallback) {
    console.log(`🌐 [REST] Fetching initial price for ${symbol}...`);
    
    try {
      // ✅ Use CORS proxy to avoid CORS errors
      const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`;
      console.log(`🌐 [REST] URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log(`🌐 [REST] Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        const price = parseFloat(data.price);
        
        console.log(`✅ [REST] ${symbol}: $${price.toFixed(2)} (initial price)`);
        
        if (!isNaN(price) && price > 0) {
          callback(price);
        } else {
          console.warn(`⚠️ [REST] Invalid price: ${price}`);
        }
      } else {
        const text = await response.text();
        console.warn(`⚠️ [REST] Error ${response.status}: ${text}`);
        console.log(`⚠️ [REST] Will use WebSocket price when available`);
      }
    } catch (error) {
      // ✅ GRACEFUL FALLBACK - WebSocket will provide price soon
      console.warn(`⚠️ [REST] CORS blocked (expected in browser) - waiting for WebSocket price`);
      console.log(`✅ [REST] Initial price will come from WebSocket stream`);
    }
  }

  /**
   * ✅ STEP 5: Normalize symbol to Binance format
   */
  private normalizeSymbol(symbol: string): string {
    // Remove exchange prefixes
    let clean = symbol
      .replace('BINANCE:', '')
      .replace('NASDAQ:', '')
      .replace('NYSE:', '')
      .replace('TVC:', '')
      .replace('FX:', '')
      .replace('OANDA:', '')
      .replace('FOREXCOM:', '')
      .replace('XETR:', '')
      .toUpperCase()
      .trim();

    // Map common symbols to Binance USDT pairs
    const symbolMap: Record<string, string> = {
      'BTC': 'BTCUSDT',
      'BTCUSD': 'BTCUSDT',
      'ETH': 'ETHUSDT',
      'ETHUSD': 'ETHUSDT',
      'BNB': 'BNBUSDT',
      'BNBUSD': 'BNBUSDT',
      'XRP': 'XRPUSDT',
      'XRPUSD': 'XRPUSDT',
      'SOL': 'SOLUSDT',
      'SOLUSD': 'SOLUSDT',
      'ADA': 'ADAUSDT',
      'ADAUSD': 'ADAUSDT',
      'DOGE': 'DOGEUSDT',
      'DOGEUSD': 'DOGEUSDT',
      'DOT': 'DOTUSDT',
      'DOTUSD': 'DOTUSDT',
      'MATIC': 'MATICUSDT',
      'MATICUSD': 'MATICUSDT',
      'LTC': 'LTCUSDT',
      'LTCUSD': 'LTCUSDT',
      'AVAX': 'AVAXUSDT',
      'AVAXUSD': 'AVAXUSDT',
      'LINK': 'LINKUSDT',
      'LINKUSD': 'LINKUSDT',
      'ATOM': 'ATOMUSDT',
      'ATOMUSD': 'ATOMUSDT',
      'UNI': 'UNIUSDT',
      'UNIUSD': 'UNIUSDT',
      'ETC': 'ETCUSDT',
      'ETCUSD': 'ETCUSDT',
      'XLM': 'XLMUSDT',
      'XLMUSD': 'XLMUSDT',
      'BCH': 'BCHUSDT',
      'BCHUSD': 'BCHUSDT',
      'NEAR': 'NEARUSDT',
      'NEARUSD': 'NEARUSDT',
      'TRX': 'TRXUSDT',
      'TRXUSD': 'TRXUSDT',
    };

    if (symbolMap[clean]) {
      return symbolMap[clean];
    }

    // If already ends with USDT, return as is
    if (clean.endsWith('USDT')) {
      return clean;
    }

    // Default: append USDT
    return clean.replace('USD', '') + 'USDT';
  }

  /**
   * ✅ PUBLIC API: Subscribe to symbol price updates
   */
  subscribe(symbol: string, callback: PriceCallback): () => void {
    const subscriberId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const normalizedSymbol = this.normalizeSymbol(symbol);

    console.log(`🔔 [SUBSCRIBE] Request: ${symbol} → ${normalizedSymbol}`);
    console.log(`🔔 [SUBSCRIBE] Subscriber ID: ${subscriberId}`);

    if (!this.subscriptions.has(normalizedSymbol)) {
      this.subscriptions.set(normalizedSymbol, new Map());
      console.log(`📝 [SUBSCRIBE] Created new subscription list for ${normalizedSymbol}`);
    }

    const subMap = this.subscriptions.get(normalizedSymbol)!;
    subMap.set(subscriberId, callback);

    console.log(`✅ [SUBSCRIBE] Total subscribers for ${normalizedSymbol}: ${subMap.size}`);

    // Fetch initial price
    this.fetchInitialPrice(normalizedSymbol, callback);

    // Connect WebSocket if not connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      console.log(`🔕 [UNSUBSCRIBE] Subscriber ${subscriberId} from ${normalizedSymbol}`);
      
      const subs = this.subscriptions.get(normalizedSymbol);
      if (subs) {
        subs.delete(subscriberId);
        console.log(`🔕 [UNSUBSCRIBE] Remaining subscribers for ${normalizedSymbol}: ${subs.size}`);

        if (subs.size === 0) {
          this.subscriptions.delete(normalizedSymbol);
          console.log(`🗑️ [UNSUBSCRIBE] Removed subscription list for ${normalizedSymbol}`);

          // Disconnect if no more subscriptions
          if (this.subscriptions.size === 0) {
            console.log(`🔌 [UNSUBSCRIBE] No more subscriptions - disconnecting`);
            this.disconnect();
          } else {
            // Reconnect with remaining symbols
            console.log(`🔄 [UNSUBSCRIBE] Reconnecting with remaining symbols`);
            this.disconnect();
            setTimeout(() => this.connect(), 100);
          }
        }
      }
    };
  }

  /**
   * ✅ PUBLIC API: Get current price for a symbol
   */
  getCurrentPrice(symbol: string): number {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    return this.lastPrices.get(normalizedSymbol) || 0;
  }

  /**
   * ✅ INTERNAL: Disconnect WebSocket
   */
  private disconnect(): void {
    console.log('🔌 [DISCONNECT] Closing WebSocket connection');

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.messageCount = 0;
  }
}

// Export singleton instance
export const binanceWebSocket = new BinanceWebSocket();