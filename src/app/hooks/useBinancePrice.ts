/**
 * ✅ USE BINANCE PRICE HOOK - UNIFIED PRICE SERVICE
 * 
 * Simple wrapper around unifiedPriceService for React components
 * - Real-time prices from Binance
 * - No WebSocket complexity
 * - Works immediately!
 */

import { useEffect, useRef, useState } from 'react';
import { unifiedPriceService } from '../lib/unifiedPriceService';

interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
}

type PriceCallback = (data: PriceData) => void;

export function useBinancePrice() {
  const [isConnected, setIsConnected] = useState(true); // Always connected with unified service
  const unsubscribeFunctionsRef = useRef<Map<PriceCallback, () => void>>(new Map());

  // Subscribe to price updates
  const subscribe = (tvSymbol: string, callback: PriceCallback) => {
    console.log(`📡 [useBinancePrice] Subscribing to ${tvSymbol}`);

    // Convert TradingView symbol to simple format for unified service
    // BINANCE:BTCUSDT → BTCUSD
    let cleanSymbol = tvSymbol
      .replace('BINANCE:', '')
      .replace('BITSTAMP:', '')
      .replace('TVC:', '')
      .replace('USDT', 'USD');
    
    console.log(`🔄 [useBinancePrice] Converted ${tvSymbol} → ${cleanSymbol}`);

    // Subscribe via unified service
    const unsubscribe = unifiedPriceService.subscribe(cleanSymbol, (priceData) => {
      console.log(`💰 [useBinancePrice] CALLBACK RECEIVED for ${tvSymbol}:`, priceData);
      
      // Convert to expected format
      const convertedData = {
        symbol: tvSymbol,
        price: priceData.price,
        timestamp: priceData.timestamp
      };
      
      console.log(`📤 [useBinancePrice] Calling parent callback with:`, convertedData);
      callback(convertedData);
      console.log(`✅ [useBinancePrice] Parent callback executed for ${tvSymbol}`);
    });

    // Store unsubscribe function
    unsubscribeFunctionsRef.current.set(callback, unsubscribe);

    return unsubscribe;
  };

  // Unsubscribe from price updates
  const unsubscribe = (tvSymbol: string, callback: PriceCallback) => {
    console.log(`⏹️ [useBinancePrice] Unsubscribing from ${tvSymbol}`);

    const unsubscribeFn = unsubscribeFunctionsRef.current.get(callback);
    if (unsubscribeFn) {
      unsubscribeFn();
      unsubscribeFunctionsRef.current.delete(callback);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 [useBinancePrice] Cleaning up all subscriptions');
      
      // Call all unsubscribe functions
      unsubscribeFunctionsRef.current.forEach(unsubscribeFn => {
        unsubscribeFn();
      });
      
      unsubscribeFunctionsRef.current.clear();
    };
  }, []);

  return {
    subscribe,
    unsubscribe,
    isConnected, // Always true with unified service
  };
}