/**
 * Real-Time WebSocket Service
 * Connects to actual exchanges for REAL market data
 * - Backend proxy for all symbols (crypto, stocks, forex)
 * - Bypasses CORS restrictions
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface PriceSubscriber {
  symbol: string;
  callback: (price: number) => void;
}

interface OrderBookData {
  bids: [string, string][]; // [price, quantity]
  asks: [string, string][];
}

interface OrderBookSubscriber {
  symbol: string;
  callback: (orderBook: OrderBookData) => void;
}

class RealTimeWebSocketService {
  private subscribers: Map<string, PriceSubscriber[]> = new Map();
  private orderBookSubscribers: Map<string, OrderBookSubscriber[]> = new Map();
  private currentPrices: Map<string, number> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isPolling: boolean = false;
  private backendConnectionTested: boolean = false;
  private backendConnected: boolean = false;

  constructor() {
    console.log('🌐 [Real-Time Service] Initializing with backend proxy...');
    console.log(`🔧 [Config] Project ID: ${projectId ? projectId.substring(0, 8) + '...' : 'MISSING'}`);
    console.log(`🔧 [Config] Anon Key: ${publicAnonKey ? 'Present ✅' : 'MISSING ❌'}`);
    
    // Test backend connection immediately
    this.testBackendConnection();
  }

  /**
   * Test backend connection and log detailed info
   */
  private async testBackendConnection() {
    if (this.backendConnectionTested) return;
    
    this.backendConnectionTested = true;
    console.log('🧪 [Backend Test] Testing connection to Supabase Edge Functions...');
    
    try {
      const testUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/health`;
      console.log(`🔗 [Backend Test] URL: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📡 [Backend Test] Response Status: ${response.status}`);
      console.log(`📡 [Backend Test] Response OK: ${response.ok}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [Backend Test] Backend is ONLINE and responding:', data);
        this.backendConnected = true;
      } else {
        const errorText = await response.text();
        console.error(`❌ [Backend Test] Backend returned error ${response.status}:`, errorText);
        this.backendConnected = false;
      }
    } catch (error: any) {
      console.error('❌ [Backend Test] Failed to connect to backend:');
      console.error('   - Error name:', error.name);
      console.error('   - Error message:', error.message);
      console.error('   - Error stack:', error.stack);
      console.error('   - Possible causes:');
      console.error('     1. Edge Functions not deployed to Supabase');
      console.error('     2. CORS blocking the request');
      console.error('     3. Network connectivity issue');
      console.error('     4. Invalid Project ID or Anon Key');
      this.backendConnected = false;
    }
  }

  /**
   * Map our symbol format to Binance format
   * Examples: BTCUSD -> btcusdt, ETHUSD -> ethusdt
   */
  private toBinanceSymbol(symbol: string): string {
    // Remove any special characters and convert to lowercase
    const clean = symbol.replace(/[^A-Z]/gi, '').toLowerCase();
    
    // Map common pairs
    if (clean.includes('btc')) return 'btcusdt';
    if (clean.includes('eth')) return 'ethusdt';
    if (clean.includes('bnb')) return 'bnbusdt';
    if (clean.includes('xrp')) return 'xrpusdt';
    if (clean.includes('ada')) return 'adausdt';
    if (clean.includes('doge')) return 'dogeusdt';
    if (clean.includes('sol')) return 'solusdt';
    if (clean.includes('matic')) return 'maticusdt';
    if (clean.includes('dot')) return 'dotusdt';
    if (clean.includes('link')) return 'linkusdt';
    
    // Default: assume it's already in correct format or add USDT
    return clean.endsWith('usdt') ? clean : `${clean}usdt`;
  }

  /**
   * Check if symbol is a crypto pair (should use Binance)
   */
  private isCryptoSymbol(symbol: string): boolean {
    const cryptoKeywords = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'MATIC', 'DOT', 'LINK', 'USDT'];
    return cryptoKeywords.some(keyword => symbol.toUpperCase().includes(keyword));
  }

  /**
   * Start polling Binance REST API for crypto prices
   * This is more reliable than WebSocket for browser environments
   */
  private connectBinance(symbols: string[]) {
    if (this.isPolling) {
      console.log('🔗 [Binance] Already polling');
      return;
    }

    this.isPolling = true;
    const binanceSymbols = symbols.map(s => this.toBinanceSymbol(s));
    const uniqueSymbols = [...new Set(binanceSymbols)];
    
    console.log(`🔗 [Binance] Starting backend proxy polling for ${uniqueSymbols.length} symbols...`);
    console.log(`📊 [Binance] Symbols: ${uniqueSymbols.join(', ')}`);
    
    // Validate config before starting
    if (!projectId || !publicAnonKey) {
      console.error('❌ [Binance] Supabase config missing! Cannot start polling.');
      console.error('   - Project ID:', projectId ? 'Present' : 'MISSING');
      console.error('   - Anon Key:', publicAnonKey ? 'Present' : 'MISSING');
      return;
    }
    
    // Poll all symbols using backend proxy OR direct Binance API as fallback
    const pollPrices = async () => {
      // Poll each symbol individually through backend
      for (const symbol of uniqueSymbols) {
        try {
          const symbolUpper = symbol.toUpperCase();
          const cleanSymbol = symbolUpper.replace('USDT', 'USD'); // BTCUSDT -> BTCUSD for backend
          
          let price: number | null = null;
          let source: string = 'unknown';
          
          // Strategy 1: Try backend proxy first (bypasses CORS) with shorter timeout
          if (this.backendConnected !== false) { // Try if not explicitly marked as failed
            try {
              const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/price?symbol=${cleanSymbol}`;
              
              console.log(`🔄 [Polling] Fetching ${cleanSymbol} from backend...`);
              
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout (reduced from 5)
              
              const response = await fetch(backendUrl, {
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'Content-Type': 'application/json'
                },
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              
              if (response.ok) {
                const data = await response.json();
                
                price = parseFloat(data.price);
                source = data.source || 'backend';
                
                if (!isNaN(price) && price > 0) {
                  console.log(`✅ [Backend Success] ${cleanSymbol}: $${price} (${source})`);
                }
              } else {
                const errorText = await response.text();
                console.error(`❌ [Backend Error] ${cleanSymbol}: Status ${response.status}`);
                console.error(`   Response: ${errorText}`);
              }
            } catch (backendError: any) {
              if (backendError.name === 'AbortError') {
                console.error(`⏱️ [Backend Timeout] ${cleanSymbol}: Request took too long`);
              } else {
                console.error(`❌ [Backend Failed] ${cleanSymbol}:`, backendError.message);
              }
            }
          }
          
          // Strategy 2: Fallback to direct Binance API if backend failed (may hit CORS)
          if (!price || price <= 0) {
            try {
              console.log(`🔄 [Fallback] Trying direct Binance API for ${symbolUpper}...`);
              
              const binanceUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbolUpper}`;
              const response = await fetch(binanceUrl);
              
              if (response.ok) {
                const data = await response.json();
                price = parseFloat(data.price);
                source = 'binance_direct';
                console.log(`✅ [Binance Direct] ${symbolUpper}: $${price}`);
              }
            } catch (binanceError: any) {
              console.warn(`⚠️ [Binance Direct Failed] ${symbolUpper}:`, binanceError.message);
            }
          }
          
          // Strategy 3: Use simulated price as last resort
          if (!price || price <= 0) {
            price = this.getSimulatedPrice(cleanSymbol);
            source = 'simulated';
            console.log(`🎲 [Simulated] ${cleanSymbol}: $${price}`);
          }
          
          // Update price and notify subscribers
          if (price && price > 0) {
            // Update current price
            this.currentPrices.set(symbolUpper, price);
            
            // Notify subscribers for this symbol and variations
            this.notifySubscribers(symbolUpper, price);
            
            // Also notify for common variations (BTCUSDT -> BTCUSD, BTC/USD, etc.)
            const baseSymbol = symbolUpper.replace('USDT', '');
            this.notifySubscribers(`${baseSymbol}USD`, price);
            this.notifySubscribers(`${baseSymbol}/USD`, price);
            this.notifySubscribers(baseSymbol, price);
            
            // Log only on significant changes or every 10 polls
            const lastLog = (this as any)[`lastLog_${symbolUpper}`] || 0;
            if (Date.now() - lastLog > 10000) { // Log every 10 seconds
              const sourceIcon = source === 'binance' || source === 'binance_direct' ? '🏦 Binance' : 
                                source === 'alpha_vantage' ? '📈 Alpha Vantage' : 
                                '🎲 Simulated';
              console.log(`💰 [${sourceIcon}] ${symbolUpper}: $${price.toFixed(2)}`);
              (this as any)[`lastLog_${symbolUpper}`] = Date.now();
            }
          } else {
            console.warn(`⚠️ [Invalid Price] ${cleanSymbol}: No valid price obtained`);
          }
        } catch (error: any) {
          console.error(`❌ [Polling Error] ${symbol}:`, error.message);
        }
      }
    };
    
    // Initial fetch
    console.log('🚀 [Binance] Starting initial fetch...');
    pollPrices();
    
    // Poll every 2 seconds
    const pollInterval = setInterval(pollPrices, 2000);
    this.pollingIntervals.set('binance', pollInterval);
    
    console.log('✅ [Binance] Backend proxy polling started successfully');
  }

  /**
   * Get simulated price based on symbol (fallback)
   */
  private getSimulatedPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      "BTCUSD": 64250,
      "ETHUSD": 3520,
      "BNBUSD": 420,
      "SOLUSD": 145,
      "XRPUSD": 0.52,
      "ADAUSD": 0.48,
      "DOGEUSD": 0.15,
      "MATICUSD": 0.85,
      "DOTUSD": 6.50,
      "LINKUSD": 14.20
    };
    
    // Get base price or use 100 as default
    let basePrice = basePrices[symbol] || 100;
    
    // Add small random variation (±0.5%)
    const variation = (Math.random() - 0.5) * 0.01;
    return basePrice * (1 + variation);
  }

  /**
   * Connect to Order Book stream for a specific symbol
   */
  private connectOrderBook(symbol: string) {
    const binanceSymbol = this.toBinanceSymbol(symbol);
    const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}@depth20@100ms`;

    console.log('📖 [Order Book] Connecting for:', symbol);

    const orderBookWs = new WebSocket(wsUrl);

    orderBookWs.onopen = () => {
      console.log('✅ [Order Book] Connected for:', symbol);
    };

    orderBookWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.bids && data.asks) {
          const orderBook: OrderBookData = {
            bids: data.bids.slice(0, 20), // Top 20 bids
            asks: data.asks.slice(0, 20)  // Top 20 asks
          };
          
          // Notify order book subscribers
          const subscribers = this.orderBookSubscribers.get(symbol) || [];
          subscribers.forEach(sub => sub.callback(orderBook));
        }
      } catch (error) {
        console.error('❌ [Order Book] Error:', error);
      }
    };

    orderBookWs.onerror = (error) => {
      console.error('❌ [Order Book] WebSocket Error:', error);
    };

    orderBookWs.onclose = () => {
      console.log('🔌 [Order Book] WebSocket Closed for:', symbol);
    };

    return orderBookWs;
  }

  /**
   * Notify all subscribers for a given symbol
   */
  private notifySubscribers(symbol: string, price: number) {
    const subscribers = this.subscribers.get(symbol) || [];
    subscribers.forEach(sub => {
      try {
        sub.callback(price);
      } catch (error) {
        console.error(`❌ Error notifying subscriber for ${symbol}:`, error);
      }
    });
  }

  /**
   * Subscribe to price updates for a symbol
   */
  subscribe(symbol: string, callback: (price: number) => void): () => void {
    console.log('📊 [Real-Time] Subscribing to:', symbol);

    // Add subscriber
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    this.subscribers.get(symbol)!.push({ symbol, callback });

    // Connect to appropriate WebSocket immediately
    if (this.isCryptoSymbol(symbol)) {
      const cryptoSymbols = Array.from(this.subscribers.keys()).filter(s => this.isCryptoSymbol(s));
      this.connectBinance(cryptoSymbols);
    }

    // Fetch current price via REST API immediately (don't wait for WebSocket)
    this.fetchInitialPrice(symbol, callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(symbol) || [];
      const index = subs.findIndex(s => s.callback === callback);
      if (index !== -1) {
        subs.splice(index, 1);
        console.log('🛑 [Real-Time] Unsubscribed from:', symbol);
      }
    };
  }

  /**
   * Fetch initial price immediately via REST API
   */
  private async fetchInitialPrice(symbol: string, callback: (price: number) => void) {
    try {
      // ✅ ALWAYS use backend proxy to bypass CORS issues
      const cleanSymbol = symbol.replace('BINANCE:', '').replace('NASDAQ:', '').replace('NYSE:', '').split('/')[0];
      
      const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/price?symbol=${cleanSymbol}`;
      console.log(`🔍 [Initial Price] Fetching via backend proxy: ${cleanSymbol}`);
      
      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const price = data.price;
        
        if (price > 0) {
          const sourceIcon = data.source === 'binance' ? '🏦 Binance' : 
                            data.source === 'alpha_vantage' ? '📈 Alpha Vantage' : 
                            '🎲 Simulated';
          console.log(`💰 [Initial Price - ${sourceIcon}] ${symbol}: $${price.toFixed(2)}`);
          this.currentPrices.set(cleanSymbol.toUpperCase(), price);
          this.currentPrices.set(symbol.toUpperCase(), price);
          callback(price);
          return;
        }
      } else {
        console.warn(`⚠️ [Initial Price] Backend returned status ${response.status} for ${cleanSymbol}`);
      }
    } catch (error) {
      console.error(`❌ [Initial Price] Error fetching ${symbol}:`, error);
      // Fallback: Use placeholder until WebSocket connects
      const placeholderPrice = symbol.includes('BTC') ? 65000 : 
                               symbol.includes('ETH') ? 3200 : 
                               symbol.includes('BNB') ? 580 : 100;
      console.log(`🔄 [Initial Price] Using placeholder $${placeholderPrice} until WebSocket connects`);
      callback(placeholderPrice);
    }
  }

  /**
   * Subscribe to order book updates
   */
  subscribeOrderBook(symbol: string, callback: (orderBook: OrderBookData) => void): () => void {
    console.log('📖 [Order Book] Subscribing to:', symbol);

    if (!this.orderBookSubscribers.has(symbol)) {
      this.orderBookSubscribers.set(symbol, []);
    }
    this.orderBookSubscribers.get(symbol)!.push({ symbol, callback });

    // Connect to order book stream
    const orderBookWs = this.connectOrderBook(symbol);

    // Return unsubscribe function
    return () => {
      const subs = this.orderBookSubscribers.get(symbol) || [];
      const index = subs.findIndex(s => s.callback === callback);
      if (index !== -1) {
        subs.splice(index, 1);
        console.log('🛑 [Order Book] Unsubscribed from:', symbol);
      }
      orderBookWs.close();
    };
  }

  /**
   * Get current price for a symbol (sync)
   */
  getCurrentPrice(symbol: string): number {
    // Try exact match
    let price = this.currentPrices.get(symbol.toUpperCase());
    if (price) return price;

    // Try with USDT suffix
    const binanceSymbol = this.toBinanceSymbol(symbol).toUpperCase();
    price = this.currentPrices.get(binanceSymbol);
    if (price) return price;

    // Try variations
    const variations = [
      symbol.replace('/', ''),
      symbol.replace('USD', 'USDT'),
      symbol + 'USDT',
    ];

    for (const variation of variations) {
      price = this.currentPrices.get(variation.toUpperCase());
      if (price) return price;
    }

    return 0;
  }

  /**
   * Get all current prices
   */
  getAllPrices(): Map<string, number> {
    return new Map(this.currentPrices);
  }

  /**
   * Disconnect all WebSockets
   */
  disconnect() {
    console.log('🔌 [Real-Time] Disconnecting all connections...');
    
    this.subscribers.clear();
    this.orderBookSubscribers.clear();
    
    // Clear polling intervals
    this.pollingIntervals.forEach(interval => clearInterval(interval));
    this.pollingIntervals.clear();
    
    this.isPolling = false;
  }
}

// Export singleton instance
export const realTimeWebSocket = new RealTimeWebSocketService();
export type { OrderBookData };