/**
 * Free Crypto API Integration
 * Provider: freecryptoapi.com
 * API Key: 5ynppztz9ns236o668j9
 * Documentation: https://freecryptoapi.com/
 */

const API_KEY = Deno.env.get('FREE_CRYPTO_API_KEY') || '5ynppztz9ns236o668j9';

export interface FreeCryptoPriceData {
  symbol: string;
  price: number;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
  lastUpdate: string;
}

/**
 * Fetch live cryptocurrency price from Free Crypto API
 * Tries multiple endpoint formats to ensure compatibility
 * @param symbol - Crypto symbol (e.g., "BTC", "ETH", "BNB", "BTCUSD")
 * @returns Price data or null if error
 */
export async function fetchFreeCryptoPrice(symbol: string): Promise<FreeCryptoPriceData | null> {
  if (!API_KEY) {
    console.warn('⚠️ [FreeCryptoAPI] API key not configured');
    return null;
  }

  try {
    // Normalize symbol: Remove USD/USDT suffix if present
    const cleanSymbol = symbol.replace(/USD(T)?$/i, '').toUpperCase();
    
    console.log(`🔄 [FreeCryptoAPI] Fetching price for ${cleanSymbol}... (API Key: ${API_KEY.substring(0, 8)}...)`);
    
    // Try multiple endpoint formats
    const endpoints = [
      `https://api.freecryptoapi.com/v1/ticker/${cleanSymbol}`,
      `https://api.freecryptoapi.com/v1/price/${cleanSymbol}`,
      `https://api.freecryptoapi.com/v1/latest?symbol=${cleanSymbol}`,
      `https://api.freecryptoapi.com/ticker/${cleanSymbol}`,
      `https://freecryptoapi.com/api/v1/ticker/${cleanSymbol}`,
    ];

    for (const url of endpoints) {
      console.log(`🔍 [FreeCryptoAPI] Trying endpoint: ${url}`);
      
      try {
        const response = await fetch(url, {
          headers: {
            'apikey': API_KEY,
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json',
          }
        });

        console.log(`📡 [FreeCryptoAPI] Response status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`📊 [FreeCryptoAPI] Response data:`, JSON.stringify(data).substring(0, 200));
          
          // Try multiple response formats
          let price = null;
          
          // Format 1: { price: 97250.45 }
          if (data && typeof data.price === 'number') {
            price = data.price;
          }
          // Format 2: { data: { price: 97250.45 } }
          else if (data && data.data && typeof data.data.price === 'number') {
            price = data.data.price;
          }
          // Format 3: { result: { price: 97250.45 } }
          else if (data && data.result && typeof data.result.price === 'number') {
            price = data.result.price;
          }
          // Format 4: { [symbol]: { price: 97250.45 } }
          else if (data && data[cleanSymbol] && typeof data[cleanSymbol].price === 'number') {
            price = data[cleanSymbol].price;
          }
          // Format 5: Direct price value
          else if (typeof data === 'number') {
            price = data;
          }
          // Format 6: { last_price: 97250.45 }
          else if (data && typeof data.last_price === 'number') {
            price = data.last_price;
          }
          // Format 7: { ticker: { last: 97250.45 } }
          else if (data && data.ticker && typeof data.ticker.last === 'number') {
            price = data.ticker.last;
          }

          if (price && price > 0) {
            console.log(`✅ [FreeCryptoAPI] Success! ${cleanSymbol}: $${price}`);
            
            return {
              symbol: symbol, // Return original symbol (with USD)
              price: parseFloat(price.toString()),
              change24h: data.change24h || data.price_change_24h || data.priceChange24h,
              volume24h: data.volume24h || data.volume_24h || data.volume,
              marketCap: data.marketCap || data.market_cap,
              lastUpdate: new Date().toISOString()
            };
          }
        }
      } catch (endpointError: any) {
        console.log(`⚠️ [FreeCryptoAPI] Endpoint failed: ${endpointError.message}`);
        continue;
      }
    }

    console.warn(`⚠️ [FreeCryptoAPI] All endpoints failed for ${cleanSymbol}`);
    return null;
  } catch (error: any) {
    console.error(`❌ [FreeCryptoAPI] Error fetching ${symbol}: ${error.message}`);
    return null;
  }
}

/**
 * Fetch multiple cryptocurrency prices in one request (if API supports it)
 * @param symbols - Array of crypto symbols
 * @returns Map of symbol -> price data
 */
export async function fetchMultipleFreeCryptoPrices(symbols: string[]): Promise<Map<string, FreeCryptoPriceData>> {
  const result = new Map<string, FreeCryptoPriceData>();

  if (!API_KEY) {
    console.warn('⚠️ [FreeCryptoAPI] API key not configured');
    return result;
  }

  // Fallback: Fetch individually
  for (const symbol of symbols) {
    const priceData = await fetchFreeCryptoPrice(symbol);
    if (priceData) {
      result.set(symbol, priceData);
    }
  }
  
  return result;
}

/**
 * Check if a symbol is a cryptocurrency
 */
export function isCryptoSymbol(symbol: string): boolean {
  const cryptoSymbols = [
    'BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOGE', 'MATIC', 
    'TRX', 'DOT', 'LTC', 'AVAX', 'LINK', 'ATOM', 'UNI', 'ETC',
    'XLM', 'BCH', 'NEAR'
  ];
  
  const cleanSymbol = symbol.replace(/USD(T)?$/i, '').toUpperCase();
  return cryptoSymbols.includes(cleanSymbol);
}