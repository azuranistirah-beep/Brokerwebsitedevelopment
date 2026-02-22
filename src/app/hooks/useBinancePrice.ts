import { useEffect, useRef, useState } from 'react';

interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
}

type PriceCallback = (data: PriceData) => void;

export function useBinancePrice() {
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<PriceCallback>>>(new Map());
  const pricesRef = useRef<Map<string, number>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const connectionAttemptRef = useRef(0);

  // Convert TradingView symbol to Binance WebSocket format
  const toBinanceSymbol = (tvSymbol: string): string | null => {
    // BINANCE:BTCUSDT -> BTCUSDT
    if (tvSymbol.startsWith('BINANCE:')) {
      return tvSymbol.replace('BINANCE:', '').toUpperCase();
    }
    return null;
  };

  // Fetch price via HTTP as fallback
  const fetchPriceHTTP = async (binanceSymbol: string): Promise<number | null> => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        return parseFloat(data.price);
      }
    } catch (err) {
      // Silent fail
    }
    return null;
  };

  // Start HTTP polling for a symbol (fallback)
  const startPolling = (tvSymbol: string) => {
    const binanceSymbol = toBinanceSymbol(tvSymbol);
    if (!binanceSymbol) return;

    // Don't poll if already polling
    if (pollingIntervalsRef.current.has(tvSymbol)) return;

    console.log(`🔄 [useBinancePrice] Starting HTTP polling for ${tvSymbol}`);

    // Fetch immediately
    fetchPriceHTTP(binanceSymbol).then(price => {
      if (price) {
        pricesRef.current.set(binanceSymbol, price);
        notifySubscribers(tvSymbol, price);
      }
    });

    // Then poll every 2 seconds
    const interval = setInterval(async () => {
      const price = await fetchPriceHTTP(binanceSymbol);
      if (price) {
        pricesRef.current.set(binanceSymbol, price);
        notifySubscribers(tvSymbol, price);
      }
    }, 2000);

    pollingIntervalsRef.current.set(tvSymbol, interval);
  };

  // Stop polling for a symbol
  const stopPolling = (tvSymbol: string) => {
    const interval = pollingIntervalsRef.current.get(tvSymbol);
    if (interval) {
      clearInterval(interval);
      pollingIntervalsRef.current.delete(tvSymbol);
      console.log(`⏹️ [useBinancePrice] Stopped polling for ${tvSymbol}`);
    }
  };

  // Notify all subscribers of a price update
  const notifySubscribers = (tvSymbol: string, price: number) => {
    const callbacks = subscribersRef.current.get(tvSymbol);
    if (callbacks) {
      callbacks.forEach(callback => {
        callback({
          symbol: tvSymbol,
          price: price,
          timestamp: Date.now()
        });
      });
    }
  };

  const connectWebSocket = () => {
    // Get all subscribed symbols
    const symbols = Array.from(subscribersRef.current.keys())
      .map(s => toBinanceSymbol(s))
      .filter(Boolean) as string[];

    if (symbols.length === 0) {
      console.log('⏳ [useBinancePrice] No symbols to subscribe, skipping WebSocket connection');
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create streams array for combined stream
    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    console.log(`🔌 [useBinancePrice] Connecting to Binance WebSocket (attempt ${++connectionAttemptRef.current})...`);
    console.log(`📊 [useBinancePrice] Subscribing to: ${symbols.join(', ')}`);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ [useBinancePrice] WebSocket CONNECTED - Real-time prices active!');
        setIsConnected(true);
        connectionAttemptRef.current = 0;
        
        // Stop all HTTP polling since WebSocket is connected
        pollingIntervalsRef.current.forEach((_, symbol) => stopPolling(symbol));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.data) {
            const { s: symbol, c: price } = message.data;
            const priceNum = parseFloat(price);
            
            if (!isNaN(priceNum)) {
              const upperSymbol = symbol.toUpperCase();
              // Store the price
              pricesRef.current.set(upperSymbol, priceNum);

              // Find TradingView symbol and notify subscribers
              for (const [tvSymbol, callbacks] of subscribersRef.current.entries()) {
                const binanceSymbol = toBinanceSymbol(tvSymbol);
                if (binanceSymbol === upperSymbol) {
                  console.log(`💰 [WebSocket] ${tvSymbol}: $${priceNum.toFixed(2)}`);
                  callbacks.forEach(callback => {
                    callback({
                      symbol: tvSymbol,
                      price: priceNum,
                      timestamp: Date.now()
                    });
                  });
                }
              }
            }
          }
        } catch (err) {
          // Silent fail - don't spam console
        }
      };

      ws.onerror = (error) => {
        console.warn('⚠️ [useBinancePrice] WebSocket error - Falling back to HTTP polling');
        setIsConnected(false);
        
        // Start HTTP polling for all symbols as fallback
        subscribersRef.current.forEach((_, tvSymbol) => {
          startPolling(tvSymbol);
        });
      };

      ws.onclose = () => {
        console.log('🔌 [useBinancePrice] WebSocket disconnected');
        setIsConnected(false);
        
        // Start HTTP polling immediately as fallback
        subscribersRef.current.forEach((_, tvSymbol) => {
          startPolling(tvSymbol);
        });
        
        // Attempt to reconnect after 5 seconds if we have subscribers
        if (subscribersRef.current.size > 0 && connectionAttemptRef.current < 3) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 [useBinancePrice] Attempting to reconnect WebSocket...');
            connectWebSocket();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.warn('⚠️ [useBinancePrice] Failed to create WebSocket - Using HTTP polling');
      setIsConnected(false);
      
      // Use HTTP polling as fallback
      subscribersRef.current.forEach((_, tvSymbol) => {
        startPolling(tvSymbol);
      });
    }
  };

  const subscribe = (tvSymbol: string, callback: PriceCallback) => {
    const binanceSymbol = toBinanceSymbol(tvSymbol);
    if (!binanceSymbol) {
      console.warn(`⚠️ [useBinancePrice] Cannot subscribe to non-Binance symbol: ${tvSymbol}`);
      return;
    }

    console.log(`📊 [useBinancePrice] Subscribing to ${tvSymbol}`);

    if (!subscribersRef.current.has(tvSymbol)) {
      subscribersRef.current.set(tvSymbol, new Set());
    }
    subscribersRef.current.get(tvSymbol)!.add(callback);

    // If we have a cached price, send it immediately
    const cachedPrice = pricesRef.current.get(binanceSymbol);
    if (cachedPrice) {
      console.log(`💾 [useBinancePrice] Sending cached price: ${tvSymbol} = $${cachedPrice.toFixed(2)}`);
      callback({
        symbol: tvSymbol,
        price: cachedPrice,
        timestamp: Date.now()
      });
    }

    // Try WebSocket first
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }
    
    // Start HTTP polling immediately as backup (will stop if WebSocket connects)
    startPolling(tvSymbol);
  };

  const unsubscribe = (tvSymbol: string, callback?: PriceCallback) => {
    if (callback) {
      subscribersRef.current.get(tvSymbol)?.delete(callback);
      
      // If no more callbacks for this symbol, remove it
      if (subscribersRef.current.get(tvSymbol)?.size === 0) {
        subscribersRef.current.delete(tvSymbol);
        stopPolling(tvSymbol);
      }
    } else {
      subscribersRef.current.delete(tvSymbol);
      stopPolling(tvSymbol);
    }

    // If no more subscribers, close connection
    if (subscribersRef.current.size === 0) {
      console.log('🛑 [useBinancePrice] No more subscribers, closing WebSocket');
      wsRef.current?.close();
      wsRef.current = null;
    }
  };

  const getLatestPrice = (tvSymbol: string): number | null => {
    const binanceSymbol = toBinanceSymbol(tvSymbol);
    if (!binanceSymbol) return null;
    return pricesRef.current.get(binanceSymbol) || null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      pollingIntervalsRef.current.forEach(interval => clearInterval(interval));
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    subscribe,
    unsubscribe,
    getLatestPrice,
    isConnected
  };
}