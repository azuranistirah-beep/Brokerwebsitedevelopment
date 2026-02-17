/**
 * Binance WebSocket Proxy
 * Routes WebSocket connections through backend to avoid CORS/browser blocking
 */

interface BinanceAggTrade {
  e: string;      // Event type
  E: number;      // Event time
  s: string;      // Symbol
  a: number;      // Aggregate trade ID
  p: string;      // Price
  q: string;      // Quantity
  f: number;      // First trade ID
  l: number;      // Last trade ID
  T: number;      // Trade time
  m: boolean;     // Is the buyer the market maker?
  M: boolean;     // Ignore
}

interface StreamData {
  stream: string;
  data: BinanceAggTrade;
}

export class BinanceWebSocketProxy {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(price: number) => void>> = new Map();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    console.log('[Binance Proxy] Initialized');
  }

  /**
   * Subscribe to symbol price updates
   */
  subscribe(symbol: string, callback: (price: number) => void): () => void {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    
    console.log(`[Binance Proxy] Subscribe: ${symbol} -> ${normalizedSymbol}`);
    
    if (!this.subscribers.has(normalizedSymbol)) {
      this.subscribers.set(normalizedSymbol, new Set());
    }
    
    this.subscribers.get(normalizedSymbol)!.add(callback);
    console.log(`[Binance Proxy] Subscribers for ${normalizedSymbol}: ${this.subscribers.get(normalizedSymbol)!.size}`);
    
    // Connect if not already connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(normalizedSymbol);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(normalizedSymbol);
          console.log(`[Binance Proxy] No more subscribers for ${normalizedSymbol}`);
          
          // Disconnect if no more subscribers
          if (this.subscribers.size === 0) {
            this.disconnect();
          }
        }
      }
    };
  }

  /**
   * Connect to Binance WebSocket
   */
  private connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[Binance Proxy] Already connected');
      return;
    }

    const symbols = Array.from(this.subscribers.keys());
    if (symbols.length === 0) {
      console.log('[Binance Proxy] No symbols to subscribe');
      return;
    }

    // Create combined stream URL
    const streams = symbols.map(s => `${s.toLowerCase()}@aggTrade`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    
    console.log(`[Binance Proxy] Connecting to: ${url}`);
    
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log(`[Binance Proxy] Connected! Streaming ${symbols.length} symbols`);
        
        // Setup heartbeat
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('[Binance Proxy] Heartbeat - connection alive');
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data: StreamData = JSON.parse(event.data.toString());
          
          if (data.stream && data.data) {
            const symbol = data.stream.replace('@aggTrade', '').toUpperCase();
            const price = parseFloat(data.data.p);
            
            if (!isNaN(price) && price > 0) {
              this.notifySubscribers(symbol, price);
            }
          }
        } catch (error) {
          console.error('[Binance Proxy] Parse error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Binance Proxy] WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
        console.log(`[Binance Proxy] Closed: ${event.code} ${event.reason}`);
        
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }
        
        // Auto-reconnect if we still have subscribers
        if (this.subscribers.size > 0) {
          console.log('[Binance Proxy] Reconnecting in 5 seconds...');
          this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
        }
      };
    } catch (error) {
      console.error('[Binance Proxy] Failed to create WebSocket:', error);
    }
  }

  /**
   * Notify all subscribers for a symbol
   */
  private notifySubscribers(symbol: string, price: number): void {
    const subs = this.subscribers.get(symbol);
    if (subs && subs.size > 0) {
      subs.forEach(callback => {
        try {
          callback(price);
        } catch (error) {
          console.error('[Binance Proxy] Callback error:', error);
        }
      });
    }
  }

  /**
   * Normalize symbol to Binance format
   */
  private normalizeSymbol(symbol: string): string {
    let clean = symbol
      .replace('BINANCE:', '')
      .replace('NASDAQ:', '')
      .replace('NYSE:', '')
      .toUpperCase()
      .trim();
    
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
      'LINK': 'LINKUSDT',
      'LINKUSD': 'LINKUSDT',
    };
    
    if (symbolMap[clean]) {
      return symbolMap[clean];
    }
    
    if (clean.endsWith('USDT')) {
      return clean;
    }
    
    return clean.replace('USD', '') + 'USDT';
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    console.log('[Binance Proxy] Disconnecting...');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscribers.clear();
  }

  /**
   * Fetch current price from Binance REST API
   */
  async fetchCurrentPrice(symbol: string): Promise<number | null> {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    
    try {
      const url = `https://api.binance.com/api/v3/ticker/price?symbol=${normalizedSymbol}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const price = parseFloat(data.price);
        
        if (!isNaN(price) && price > 0) {
          console.log(`[Binance Proxy] REST API: ${normalizedSymbol} = $${price.toFixed(2)}`);
          return price;
        }
      }
    } catch (error) {
      console.error(`[Binance Proxy] REST API error for ${normalizedSymbol}:`, error);
    }
    
    return null;
  }
}

// Export singleton instance
export const binanceProxy = new BinanceWebSocketProxy();
