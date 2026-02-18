/**
 * ✅ UNIFIED PRICE SERVICE - EXACT TRADINGVIEW MATCH
 * 
 * Uses Backend API which fetches Binance 1-minute CANDLE CLOSE price
 * This is EXACTLY what TradingView displays for BINANCE pairs!
 * 
 * CRITICAL: No WebSocket! Backend API uses Binance Kline (candle) endpoint
 * which gives us the SAME data that TradingView uses.
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

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

class UnifiedPriceService {
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private latestPrices: Map<string, PriceData> = new Map();
  private readonly POLLING_INTERVAL = 2000; // Poll every 2 seconds (faster than WebSocket but less aggressive)
  private errorCounts: Map<string, number> = new Map(); // Track consecutive errors per symbol
  private readonly MAX_ERROR_LOG_COUNT = 3; // Only log first 3 errors per symbol

  constructor() {
    console.log('🎯 [UnifiedPriceService] Initialized - Using Backend API (Binance 1m Candle CLOSE)');
  }

  /**
   * ✅ NORMALIZE SYMBOL - Ensure consistent format
   */
  private normalizeSymbol(symbol: string): string {
    // Remove exchange prefix (e.g., BINANCE:BTCUSDT → BTCUSDT)
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

    // ✅ Map common variations to standard symbols
    // XAUUSD → GOLD (for consistent pricing)
    if (clean === 'XAUUSD') {
      return 'GOLD';
    }
    // XAGUSD → SILVER
    if (clean === 'XAGUSD') {
      return 'SILVER';
    }

    return clean;
  }

  /**
   * ✅ FETCH PRICE FROM BACKEND (Binance 1m Candle CLOSE)
   */
  private async fetchPriceFromBackend(symbol: string): Promise<number | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/price?symbol=${symbol}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Only log 4xx and 5xx errors if under error threshold
        const currentErrorCount = this.errorCounts.get(symbol) || 0;
        if (currentErrorCount < this.MAX_ERROR_LOG_COUNT) {
          console.warn(`⚠️ [UnifiedPriceService] Backend HTTP ${response.status} for ${symbol}`);
        }
        return null;
      }

      const data = await response.json();
      
      if (data.price && data.price > 0) {
        // Only log successful fetches occasionally to reduce spam
        if (Math.random() < 0.1) { // 10% chance to log success
          console.log(`💰 [UnifiedPriceService] ${symbol}: $${data.price.toFixed(2)} (${data.source || 'unknown'})`);
        }
        return data.price;
      }

      return null;
    } catch (error: any) {
      // Only log fetch errors if under error threshold
      const currentErrorCount = this.errorCounts.get(symbol) || 0;
      if (currentErrorCount < this.MAX_ERROR_LOG_COUNT) {
        if (error.name === 'AbortError') {
          console.warn(`⚠️ [UnifiedPriceService] Timeout for ${symbol}`);
        } else {
          console.warn(`⚠️ [UnifiedPriceService] Fetch error for ${symbol}: ${error.message}`);
        }
      }
      return null;
    }
  }

  /**
   * ✅ START POLLING FOR PRICE UPDATES
   */
  private startPolling(symbol: string): void {
    if (this.pollingIntervals.has(symbol)) {
      return; // Already polling
    }

    console.log(`🔄 [UnifiedPriceService] Starting polling for ${symbol} (every ${this.POLLING_INTERVAL}ms)`);

    // Fetch immediately
    this.pollPrice(symbol);

    // Then poll at intervals
    const interval = setInterval(() => {
      this.pollPrice(symbol);
    }, this.POLLING_INTERVAL);

    this.pollingIntervals.set(symbol, interval);
  }

  /**
   * ✅ POLL PRICE ONCE
   */
  private async pollPrice(symbol: string): Promise<void> {
    const price = await this.fetchPriceFromBackend(symbol);

    if (price === null) {
      // Track consecutive errors
      const currentErrorCount = this.errorCounts.get(symbol) || 0;
      this.errorCounts.set(symbol, currentErrorCount + 1);
      
      // Only log first few errors to avoid spam
      if (currentErrorCount < this.MAX_ERROR_LOG_COUNT) {
        console.warn(`⚠️ [UnifiedPriceService] Failed to get price for ${symbol}, skipping update (error ${currentErrorCount + 1})`);
      } else if (currentErrorCount === this.MAX_ERROR_LOG_COUNT) {
        console.warn(`⚠️ [UnifiedPriceService] Failed to get price for ${symbol} multiple times, suppressing further errors...`);
      }
      // After MAX_ERROR_LOG_COUNT errors, stop logging
      return;
    }

    // Reset error count on success
    if (this.errorCounts.has(symbol)) {
      const previousErrors = this.errorCounts.get(symbol) || 0;
      if (previousErrors > 0) {
        console.log(`✅ [UnifiedPriceService] ${symbol} recovered after ${previousErrors} errors`);
      }
      this.errorCounts.delete(symbol);
    }

    const priceData: PriceData = {
      symbol,
      price,
      timestamp: Date.now(),
      source: 'backend-api'
    };

    this.updatePrice(priceData);
  }

  /**
   * ✅ UPDATE PRICE AND NOTIFY SUBSCRIBERS
   */
  private updatePrice(priceData: PriceData): void {
    // Store latest price
    this.latestPrices.set(priceData.symbol, priceData);

    // Notify all subscribers
    const subs = this.subscribers.get(priceData.symbol);
    if (subs && subs.size > 0) {
      subs.forEach(subscriber => {
        try {
          subscriber.callback(priceData);
        } catch (error) {
          console.error(`❌ [UnifiedPriceService] Subscriber callback error:`, error);
        }
      });
    }
  }

  /**
   * ✅ SUBSCRIBE TO PRICE UPDATES
   * Returns unsubscribe function
   */
  subscribe(symbol: string, callback: (data: PriceData) => void): () => void {
    const normalized = this.normalizeSymbol(symbol);
    console.log(`📡 [UnifiedPriceService] Subscribe: ${symbol} → ${normalized}`);

    const subscriber: Subscriber = { callback, symbol: normalized };

    if (!this.subscribers.has(normalized)) {
      this.subscribers.set(normalized, new Set());
    }

    this.subscribers.get(normalized)!.add(subscriber);
    console.log(`📊 [UnifiedPriceService] Subscribers for ${normalized}: ${this.subscribers.get(normalized)!.size}`);

    // Send last known price immediately (if available)
    const lastPrice = this.latestPrices.get(normalized);
    if (lastPrice) {
      console.log(`💾 [UnifiedPriceService] Sending cached price: ${normalized} = $${lastPrice.price.toFixed(2)}`);
      callback(lastPrice);
    }

    // Start polling if not already polling
    if (!this.pollingIntervals.has(normalized)) {
      this.startPolling(normalized);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(normalized);
      if (subs) {
        subs.delete(subscriber);
        console.log(`🔌 [UnifiedPriceService] Unsubscribed from ${normalized}`);

        // Stop polling if no more subscribers
        if (subs.size === 0) {
          this.stopPolling(normalized);
        }
      }
    };
  }

  /**
   * ✅ STOP POLLING
   */
  private stopPolling(symbol: string): void {
    const interval = this.pollingIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(symbol);
      console.log(`⏹️ [UnifiedPriceService] Stopped polling for ${symbol}`);
    }
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
    console.log('🧹 [UnifiedPriceService] Cleaning up all subscriptions and polling...');
    
    // Stop all polling
    this.pollingIntervals.forEach((interval, symbol) => {
      clearInterval(interval);
      console.log(`⏹️ Stopped polling: ${symbol}`);
    });

    this.pollingIntervals.clear();
    this.subscribers.clear();
    this.latestPrices.clear();
  }
}

// Export singleton instance
export const unifiedPriceService = new UnifiedPriceService();