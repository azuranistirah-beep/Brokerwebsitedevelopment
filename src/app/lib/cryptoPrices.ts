// ⚠️ DEPRECATED: This file is NO LONGER USED for static prices
// All prices now come from unifiedPriceService.ts which fetches REAL-TIME data from backend
//
// This file is kept ONLY for type definitions and backward compatibility
// DO NOT ADD STATIC PRICES HERE - they will NOT be used!

import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface CryptoPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

// ⚠️ THESE FALLBACK PRICES ARE NO LONGER USED!
// Only kept for emergency fallback if ALL API calls fail
// Real prices come from unifiedPriceService -> backend -> Binance API
const EMERGENCY_FALLBACK_PRICES: Record<string, CryptoPriceData> = {
  "BTCUSD": { symbol: "BTCUSD", name: "Bitcoin", price: 68000, change24h: 0 },
  "ETHUSD": { symbol: "ETHUSD", name: "Ethereum", price: 3400, change24h: 0 },
  "BNBUSD": { symbol: "BNBUSD", name: "BNB", price: 610, change24h: 0 },
  "XRPUSD": { symbol: "XRPUSD", name: "XRP", price: 1.40, change24h: 0 },
  "SOLUSD": { symbol: "SOLUSD", name: "Solana", price: 145, change24h: 0 },
  "ADAUSD": { symbol: "ADAUSD", name: "Cardano", price: 0.55, change24h: 0 },
  "DOGEUSD": { symbol: "DOGEUSD", name: "Dogecoin", price: 0.08, change24h: 0 },
  "TRXUSD": { symbol: "TRXUSD", name: "TRON", price: 0.11, change24h: 0 },
  "DOTUSD": { symbol: "DOTUSD", name: "Polkadot", price: 7.20, change24h: 0 },
  "MATICUSD": { symbol: "MATICUSD", name: "Polygon", price: 0.92, change24h: 0 },
  "LTCUSD": { symbol: "LTCUSD", name: "Litecoin", price: 102.50, change24h: 0 },
  "SHIBUSD": { symbol: "SHIBUSD", name: "Shiba Inu", price: 0.00002456, change24h: 0 },
  "AVAXUSD": { symbol: "AVAXUSD", name: "Avalanche", price: 36.40, change24h: 0 },
  "LINKUSD": { symbol: "LINKUSD", name: "Chainlink", price: 14.50, change24h: 0 },
  "ATOMUSD": { symbol: "ATOMUSD", name: "Cosmos Hub", price: 9.80, change24h: 0 },
  "UNIUSD": { symbol: "UNIUSD", name: "Uniswap", price: 6.70, change24h: 0 },
  "ETCUSD": { symbol: "ETCUSD", name: "Ethereum Classic", price: 27.30, change24h: 0 },
  "XLMUSD": { symbol: "XLMUSD", name: "Stellar", price: 0.11, change24h: 0 },
  "BCHUSD": { symbol: "BCHUSD", name: "Bitcoin Cash", price: 320.00, change24h: 0 },
  "NEARUSD": { symbol: "NEARUSD", name: "NEAR Protocol", price: 5.40, change24h: 0 }
};

// Get price from emergency fallback (LAST RESORT ONLY!)
export function getCryptoPrice(symbol: string): number {
  const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  
  if (EMERGENCY_FALLBACK_PRICES[cleanSymbol]) {
    console.warn(`⚠️ [cryptoPrices] Using EMERGENCY FALLBACK for ${cleanSymbol} - API may be down!`);
    return EMERGENCY_FALLBACK_PRICES[cleanSymbol].price;
  }
  
  console.warn(`⚠️ [cryptoPrices] No fallback price for ${cleanSymbol}`);
  return 0;
}

// Async getter that fetches from backend (use unifiedPriceService instead!)
export async function getCryptoPriceAsync(symbol: string): Promise<number> {
  const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/price?symbol=${cleanSymbol}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.price) {
        console.log(`✅ [cryptoPrices] Fetched ${cleanSymbol}: $${data.price}`);
        return data.price;
      }
    }
  } catch (error) {
    console.warn(`⚠️ [cryptoPrices] Failed to fetch ${cleanSymbol}, using fallback`);
  }
  
  return getCryptoPrice(cleanSymbol);
}

// Get all crypto symbols
export function getAllCryptoSymbols(): string[] {
  return Object.keys(EMERGENCY_FALLBACK_PRICES);
}

// ⚠️ DEPRECATED: DO NOT USE - Use unifiedPriceService instead!
// This export is kept ONLY for backward compatibility
// It will return STALE data - use unifiedPriceService.subscribe() for real-time prices
export const CRYPTO_PRICES = EMERGENCY_FALLBACK_PRICES;

// Get all prices async (also deprecated - use unifiedPriceService!)
export async function getAllCryptoPricesAsync(): Promise<Record<string, CryptoPriceData>> {
  console.warn('⚠️ getAllCryptoPricesAsync is deprecated - use unifiedPriceService instead!');
  return EMERGENCY_FALLBACK_PRICES;
}
