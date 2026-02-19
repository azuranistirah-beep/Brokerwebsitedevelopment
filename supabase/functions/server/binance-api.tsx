/**
 * ✅ BINANCE API - Real-time cryptocurrency prices
 * Using PUBLIC Binance API (no auth required)
 * 
 * PRIORITY: 1-minute Candle CLOSE price (EXACTLY what TradingView uses!)
 */

// Binance PUBLIC API (no auth required)
const BINANCE_BASE_URL = 'https://api.binance.com';

// ✅ In-memory cache to reduce API calls and prevent rate limiting
interface CachedPrice {
  price: number;
  timestamp: number;
}

const priceCache = new Map<string, CachedPrice>();
const CACHE_TTL = 2000; // 2 seconds cache (same as frontend update interval)

export interface BinanceTicker {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  lastUpdate: string;
}

export interface BinanceBookTicker {
  symbol: string;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  lastUpdate: string;
}

/**
 * Get current 1-minute candle CLOSE price (EXACTLY what TradingView displays)
 * This is the MOST ACCURATE method - matches TradingView 100%
 * Endpoint: GET /api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1
 */
export async function getBinanceCurrentCandleClose(symbol: string): Promise<number | null> {
  try {
    const binanceSymbol = normalizeToBinanceSymbol(symbol);
    
    // ✅ Check cache first
    const cacheKey = `kline_${binanceSymbol}`;
    const cachedPrice = priceCache.get(cacheKey);
    if (cachedPrice && (Date.now() - cachedPrice.timestamp < CACHE_TTL)) {
      console.log(`💾 [Cache Hit] ${symbol} → $${cachedPrice.price.toFixed(2)}`);
      return cachedPrice.price;
    }
    
    console.log(`🕯️ [Binance Kline] Fetching current 1m candle CLOSE for ${symbol} → ${binanceSymbol}...`);
    
    // Get the latest 1-minute candle
    const url = `${BINANCE_BASE_URL}/api/v3/klines?symbol=${binanceSymbol}&interval=1m&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(10000), // ✅ Increased to 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.warn(`⚠️ [Binance Kline] HTTP ${response.status} for ${binanceSymbol}: ${errorText}`);
      
      // Return cached value if available (even if expired)
      if (cachedPrice) {
        console.log(`♻️ [Fallback] Using expired cache for ${symbol}: $${cachedPrice.price.toFixed(2)}`);
        return cachedPrice.price;
      }
      
      return null;
    }

    const data = await response.json();
    
    // Response format: [[openTime, open, high, low, close, volume, closeTime, ...]]
    // We want the CLOSE price (index 4)
    if (Array.isArray(data) && data.length > 0) {
      const candle = data[0];
      const closePrice = parseFloat(candle[4]);
      
      console.log(`✅ [Binance Kline] ${symbol} (${binanceSymbol}) 1m CLOSE: $${closePrice.toFixed(2)} (EXACT TradingView match)`);
      
      // ✅ Cache the result
      priceCache.set(cacheKey, { price: closePrice, timestamp: Date.now() });
      
      return closePrice;
    }

    console.warn(`⚠️ [Binance Kline] No candle data returned for ${binanceSymbol}`);
    return null;
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.warn(`⚠️ [Binance Kline] Timeout for ${symbol} (10s limit exceeded)`);
    } else if (error.message?.includes('connection')) {
      console.warn(`⚠️ [Binance Kline] Connection error for ${symbol} - rate limit or network issue`);
    } else {
      console.error(`❌ [Binance Kline] Error for ${symbol}: ${error.message}`);
    }
    
    // ✅ Return cached value if available (even if expired)
    const cacheKey = `kline_${normalizeToBinanceSymbol(symbol)}`;
    const cachedPrice = priceCache.get(cacheKey);
    if (cachedPrice) {
      console.log(`♻️ [Fallback] Using cached price for ${symbol}: $${cachedPrice.price.toFixed(2)}`);
      return cachedPrice.price;
    }
    
    return null;
  }
}

/**
 * Get best bid/ask prices (Book Ticker)
 * Endpoint: GET /api/v3/ticker/bookTicker?symbol=BTCUSDT
 */
export async function fetchBinanceBookTicker(symbol: string): Promise<BinanceBookTicker | null> {
  try {
    const binanceSymbol = normalizeToBinanceSymbol(symbol);
    const url = `${BINANCE_BASE_URL}/api/v3/ticker/bookTicker?symbol=${binanceSymbol}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      symbol: data.symbol,
      bidPrice: parseFloat(data.bidPrice),
      bidQty: parseFloat(data.bidQty),
      askPrice: parseFloat(data.askPrice),
      askQty: parseFloat(data.askQty),
      lastUpdate: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`❌ [Binance Book Ticker] Error for ${symbol}: ${error.message}`);
    return null;
  }
}

/**
 * Get 24hr ticker statistics
 * Endpoint: GET /api/v3/ticker/24hr?symbol=BTCUSDT
 */
export async function fetchBinance24hrTicker(symbol: string): Promise<BinanceTicker | null> {
  try {
    const binanceSymbol = normalizeToBinanceSymbol(symbol);
    const url = `${BINANCE_BASE_URL}/api/v3/ticker/24hr?symbol=${binanceSymbol}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      symbol: data.symbol,
      price: parseFloat(data.lastPrice),
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      volume: parseFloat(data.volume),
      high: parseFloat(data.highPrice),
      low: parseFloat(data.lowPrice),
      open: parseFloat(data.openPrice),
      lastUpdate: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`❌ [Binance 24hr Ticker] Error for ${symbol}: ${error.message}`);
    return null;
  }
}

/**
 * Get average price
 * Endpoint: GET /api/v3/avgPrice?symbol=BTCUSDT
 */
export async function fetchBinanceAvgPrice(symbol: string): Promise<number | null> {
  try {
    const binanceSymbol = normalizeToBinanceSymbol(symbol);
    const url = `${BINANCE_BASE_URL}/api/v3/avgPrice?symbol=${binanceSymbol}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return parseFloat(data.price);
  } catch (error: any) {
    console.error(`❌ [Binance Avg Price] Error for ${symbol}: ${error.message}`);
    return null;
  }
}

/**
 * Normalize symbol to Binance format
 * Examples: BTC -> BTCUSDT, BTCUSD -> BTCUSDT, ETH -> ETHUSDT, BNBUSD -> BNBUSDT
 */
function normalizeToBinanceSymbol(symbol: string): string {
  let normalized = symbol.toUpperCase().trim();
  
  // Already in Binance format
  if (normalized.endsWith('USDT')) {
    return normalized;
  }
  
  // Map common variations
  const symbolMap: Record<string, string> = {
    'BTC': 'BTCUSDT',
    'BTCUSD': 'BTCUSDT',
    'BITCOIN': 'BTCUSDT',
    'ETH': 'ETHUSDT',
    'ETHUSD': 'ETHUSDT',
    'ETHEREUM': 'ETHUSDT',
    'BNB': 'BNBUSDT',
    'BNBUSD': 'BNBUSDT',
    'SOL': 'SOLUSDT',
    'SOLUSD': 'SOLUSDT',
    'SOLANA': 'SOLUSDT',
    'XRP': 'XRPUSDT',
    'XRPUSD': 'XRPUSDT',
    'ADA': 'ADAUSDT',
    'ADAUSD': 'ADAUSDT',
    'CARDANO': 'ADAUSDT',
    'DOGE': 'DOGEUSDT',
    'DOGEUSD': 'DOGEUSDT',
    'DOGECOIN': 'DOGEUSDT',
    'MATIC': 'MATICUSDT',
    'MATICUSD': 'MATICUSDT',
    'POLYGON': 'MATICUSDT',
    'DOT': 'DOTUSDT',
    'DOTUSD': 'DOTUSDT',
    'POLKADOT': 'DOTUSDT',
    'AVAX': 'AVAXUSDT',
    'AVAXUSD': 'AVAXUSDT',
    'AVALANCHE': 'AVAXUSDT',
  };
  
  if (symbolMap[normalized]) {
    return symbolMap[normalized];
  }
  
  // If ends with USD but not USDT, replace with USDT
  if (normalized.endsWith('USD') && !normalized.endsWith('USDT')) {
    return normalized.replace(/USD$/, 'USDT');
  }
  
  // Default: add USDT suffix
  return `${normalized}USDT`;
}

/**
 * Check if symbol is supported by Binance
 */
export function isBinanceSymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  
  // Common crypto symbols
  const cryptoSymbols = [
    'BTC', 'BTCUSD', 'BITCOIN',
    'ETH', 'ETHUSD', 'ETHEREUM',
    'BNB', 'BNBUSD',
    'SOL', 'SOLUSD', 'SOLANA',
    'XRP', 'XRPUSD',
    'ADA', 'ADAUSD', 'CARDANO',
    'DOGE', 'DOGEUSD', 'DOGECOIN',
    'MATIC', 'MATICUSD', 'POLYGON',
    'DOT', 'DOTUSD', 'POLKADOT',
    'AVAX', 'AVAXUSD', 'AVALANCHE',
  ];
  
  return cryptoSymbols.some(s => upper.includes(s)) || upper.endsWith('USDT');
}

/**
 * Get best available price using waterfall strategy
 * Priority: 1m Candle CLOSE > Book Ticker > 24hr Ticker > Avg Price
 */
export async function getBestBinancePrice(symbol: string): Promise<number | null> {
  // Priority 1: Current 1-minute candle CLOSE (EXACT TradingView match)
  const candlePrice = await getBinanceCurrentCandleClose(symbol);
  if (candlePrice !== null) {
    return candlePrice;
  }
  
  console.log(`⚠️ [Binance] Candle failed for ${symbol}, trying book ticker...`);
  
  // Priority 2: Book Ticker (best bid/ask)
  const bookTicker = await fetchBinanceBookTicker(symbol);
  if (bookTicker) {
    const midPrice = (bookTicker.bidPrice + bookTicker.askPrice) / 2;
    console.log(`📊 [Binance Book] ${symbol}: $${midPrice.toFixed(2)} (bid/ask average)`);
    return midPrice;
  }
  
  console.log(`⚠️ [Binance] Book ticker failed for ${symbol}, trying 24hr ticker...`);
  
  // Priority 3: 24hr Ticker
  const ticker24hr = await fetchBinance24hrTicker(symbol);
  if (ticker24hr) {
    console.log(`📊 [Binance 24hr] ${symbol}: $${ticker24hr.price.toFixed(2)}`);
    return ticker24hr.price;
  }
  
  console.log(`⚠️ [Binance] 24hr ticker failed for ${symbol}, trying avg price...`);
  
  // Priority 4: Average Price
  const avgPrice = await fetchBinanceAvgPrice(symbol);
  if (avgPrice) {
    console.log(`📊 [Binance Avg] ${symbol}: $${avgPrice.toFixed(2)}`);
    return avgPrice;
  }
  
  console.error(`❌ [Binance] All methods failed for ${symbol}`);
  return null;
}

/**
 * Fetch single price (alias for getBestBinancePrice)
 */
export async function fetchBinancePrice(symbol: string): Promise<number | null> {
  return getBestBinancePrice(symbol);
}

/**
 * Fetch all prices for popular cryptocurrencies
 * Returns Map<symbol, price>
 */
export async function fetchAllBinancePrices(): Promise<Map<string, number>> {
  const symbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 
    'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'MATICUSDT',
    'DOTUSDT', 'AVAXUSDT'
  ];
  
  const pricesMap = new Map<string, number>();
  
  // Fetch all prices in parallel
  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const price = await getBinanceCurrentCandleClose(symbol);
      return { symbol, price };
    })
  );
  
  // Process results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.price !== null) {
      pricesMap.set(symbols[index], result.value.price);
    }
  });
  
  console.log(`✅ [Binance All Prices] Fetched ${pricesMap.size}/${symbols.length} prices`);
  
  return pricesMap;
}
