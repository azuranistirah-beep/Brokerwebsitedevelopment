// CoinGecko API Integration (FREE - No API Key Required)
// CoinGecko is a reliable alternative to CoinMarketCap with real-time crypto prices

interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache to prevent rate limiting
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 seconds

// Map of our symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'BTCUSD': 'bitcoin',
  'ETHUSD': 'ethereum',
  'BNBUSD': 'binancecoin',
  'XRPUSD': 'ripple',
  'SOLUSD': 'solana',
  'ADAUSD': 'cardano',
  'DOGEUSD': 'dogecoin',
  'MATICUSD': 'matic-network',
  'TRXUSD': 'tron',
  'DOTUSD': 'polkadot',
  'LTCUSD': 'litecoin',
  'AVAXUSD': 'avalanche-2',
  'LINKUSD': 'chainlink',
  'ATOMUSD': 'cosmos',
  'UNIUSD': 'uniswap',
  'ETCUSD': 'ethereum-classic',
  'XLMUSD': 'stellar',
  'BCHUSD': 'bitcoin-cash',
  'NEARUSD': 'near',
  'SHIBUSD': 'shiba-inu',
};

/**
 * Fetch real-time crypto price from CoinGecko
 */
export async function fetchCryptoPrice(symbol: string): Promise<number | null> {
  try {
    // Check cache first
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.price;
    }

    // Get CoinGecko ID
    const coinId = SYMBOL_TO_COINGECKO_ID[symbol];
    if (!coinId) {
      return null;
    }

    // Fetch from CoinGecko
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.log(`⚠️ CoinGecko API error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const price = data[coinId]?.usd;

    if (price) {
      // Cache the price
      priceCache.set(symbol, { price, timestamp: Date.now() });
      return price;
    }

    return null;
  } catch (error: any) {
    console.log(`⚠️ Error fetching ${symbol} from CoinGecko: ${error.message}`);
    return null;
  }
}

/**
 * Fetch multiple crypto prices in batch
 */
export async function fetchMultipleCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
  try {
    // Get CoinGecko IDs
    const coinIds = symbols
      .map(s => SYMBOL_TO_COINGECKO_ID[s])
      .filter(Boolean)
      .join(',');

    if (!coinIds) {
      return {};
    }

    // Fetch from CoinGecko (batch request)
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.log(`⚠️ CoinGecko batch API error: ${response.status}`);
      return {};
    }

    const data = await response.json();
    
    // Map back to our symbols
    const prices: Record<string, number> = {};
    for (const [symbol, coinId] of Object.entries(SYMBOL_TO_COINGECKO_ID)) {
      if (data[coinId]?.usd) {
        prices[symbol] = data[coinId].usd;
        // Cache it
        priceCache.set(symbol, { price: data[coinId].usd, timestamp: Date.now() });
      }
    }

    return prices;
  } catch (error: any) {
    console.log(`⚠️ Error fetching batch prices from CoinGecko: ${error.message}`);
    return {};
  }
}

/**
 * Check if symbol is a cryptocurrency
 */
export function isCryptoSymbol(symbol: string): boolean {
  return symbol in SYMBOL_TO_COINGECKO_ID;
}

/**
 * Get all supported crypto symbols
 */
export function getAllCryptoSymbols(): string[] {
  return Object.keys(SYMBOL_TO_COINGECKO_ID);
}
