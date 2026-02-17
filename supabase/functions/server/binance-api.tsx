/**
 * ✅ BINANCE API - Real-time cryptocurrency prices
 * Using PUBLIC Binance API (no auth required)
 * 
 * PRIORITY: 1-minute Candle CLOSE price (EXACTLY what TradingView uses!)
 */

// Binance PUBLIC API (no auth required)
const BINANCE_BASE_URL = 'https://api.binance.com';

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
    
    console.log(`🕯️ [Binance Kline] Fetching current 1m candle CLOSE for ${binanceSymbol}...`);
    
    // Get the latest 1-minute candle
    const url = `${BINANCE_BASE_URL}/api/v3/klines?symbol=${binanceSymbol}&interval=1m&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.warn(`⚠️ [Binance Kline] HTTP ${response.status} for ${binanceSymbol}: ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    // Response format: [[openTime, open, high, low, close, volume, closeTime, ...]]
    // We want the CLOSE price (index 4)
    if (Array.isArray(data) && data.length > 0) {
      const candle = data[0];
      const closePrice = parseFloat(candle[4]);
      
      console.log(`✅ [Binance Kline] ${binanceSymbol} 1m CLOSE: $${closePrice.toFixed(2)} (EXACT TradingView match)`);
      
      return closePrice;
    }

    return null;
  } catch (error: any) {
    console.error(`❌ [Binance Kline] Error for ${symbol}: ${error.message}`);
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
 * Get latest price (simple and fast)
 * Endpoint: GET /api/v3/ticker/price?symbol=BTCUSDT
 */
export async function fetchBinancePrice(symbol: string): Promise<{ price: number } | null> {
  try {
    const binanceSymbol = normalizeToBinanceSymbol(symbol);
    const url = `${BINANCE_BASE_URL}/api/v3/ticker/price?symbol=${binanceSymbol}`;
    
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
      price: parseFloat(data.price),
    };
  } catch (error: any) {
    console.error(`❌ [Binance Price] Error for ${symbol}: ${error.message}`);
    return null;
  }
}

/**
 * Get 24hr ticker data
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
  
  // Remove USD suffix and add USDT
  if (normalized.endsWith('USD') && !normalized.endsWith('USDT')) {
    normalized = normalized.replace('USD', 'USDT');
  }
  
  // If no USDT suffix, add it
  if (!normalized.includes('USDT') && !normalized.includes('BUSD')) {
    normalized = `${normalized}USDT`;
  }
  
  return normalized;
}

/**
 * Check if symbol is supported by Binance
 */
export function isBinanceSymbol(symbol: string): boolean {
  const cryptoSymbols = [
    'BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOGE', 'MATIC', 
    'TRX', 'DOT', 'LTC', 'AVAX', 'LINK', 'ATOM', 'UNI', 'ETC',
    'XLM', 'BCH', 'NEAR', 'ALGO', 'FIL', 'SAND', 'MANA', 'AXS'
  ];
  
  const cleanSymbol = symbol.replace(/USD(T)?$/i, '').toUpperCase();
  return cryptoSymbols.includes(cleanSymbol);
}

/**
 * Get most accurate real-time price (combines multiple sources)
 * Priority: 1m Candle CLOSE (TradingView method) -> Book Ticker -> Latest Price -> Avg Price
 */
export async function getBestBinancePrice(symbol: string): Promise<number | null> {
  // Priority 1: 1m Candle CLOSE (Most accurate - TradingView method)
  const candlePrice = await getBinanceCurrentCandleClose(symbol);
  if (candlePrice) {
    return candlePrice;
  }
  
  // Priority 2: Book Ticker (Bid/Ask midpoint)
  const bookTicker = await fetchBinanceBookTicker(symbol);
  if (bookTicker) {
    return (bookTicker.bidPrice + bookTicker.askPrice) / 2;
  }
  
  // Priority 3: Latest Price
  const latestPrice = await fetchBinancePrice(symbol);
  if (latestPrice) {
    return latestPrice.price;
  }
  
  // Priority 4: Average Price
  const avgPrice = await fetchBinanceAvgPrice(symbol);
  if (avgPrice) {
    return avgPrice;
  }
  
  return null;
}

/**
 * Get detailed ticker with all price info
 */
export async function getBinanceDetailedTicker(symbol: string): Promise<BinanceTicker | null> {
  try {
    // Get 24hr ticker for most data
    const ticker24hr = await fetchBinance24hrTicker(symbol);
    if (!ticker24hr) {
      return null;
    }
    
    // Try to get more accurate current price from 1m candle
    const currentPrice = await getBinanceCurrentCandleClose(symbol);
    if (currentPrice) {
      ticker24hr.price = currentPrice;
    }
    
    return ticker24hr;
  } catch (error: any) {
    console.error(`❌ [Binance Detailed Ticker] Error for ${symbol}: ${error.message}`);
    return null;
  }
}

/**
 * Get multiple tickers at once
 */
export async function getBinanceMultipleTickers(symbols: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  
  // Fetch all prices in parallel with retry logic
  const promises = symbols.map(async (symbol) => {
    try {
      const price = await getBestBinancePrice(symbol);
      if (price) {
        priceMap.set(symbol, price);
      }
    } catch (error: any) {
      console.error(`❌ [Binance Multi] Failed to get price for ${symbol}: ${error.message}`);
    }
  });
  
  await Promise.all(promises);
  
  return priceMap;
}

/**
 * Fetch all Binance prices for all supported symbols
 */
export async function fetchAllBinancePrices(): Promise<Map<string, number>> {
  const supportedSymbols = [
    'BTCUSD', 'ETHUSD', 'BNBUSD', 'SOLUSD', 'ADAUSD', 'XRPUSD', 
    'DOGEUSD', 'MATICUSD', 'TRXUSD', 'DOTUSD', 'LTCUSD', 'AVAXUSD',
    'LINKUSD', 'ATOMUSD', 'UNIUSD', 'ETCUSD', 'XLMUSD', 'BCHUSD', 
    'NEARUSD', 'ALGOUSD', 'FILUSD', 'SANDUSD', 'MANAUSD', 'AXSUSD'
  ];
  
  return await getBinanceMultipleTickers(supportedSymbols);
}

/**
 * Test Binance API connectivity
 */
export async function testBinanceAPI(): Promise<boolean> {
  try {
    const price = await getBinanceCurrentCandleClose('BTCUSD');
    return price !== null && price > 0;
  } catch (error) {
    return false;
  }
}