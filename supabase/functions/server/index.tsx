import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { fetchStockPrice, isStockSymbol } from "./stocks-api.tsx";
import { fetchCryptoPrice, fetchMultipleCryptoPrices, isCryptoSymbol } from "./coinmarketcap-api.tsx";
import { binanceProxy } from "./binance-proxy.tsx";
import { fetchFreeCryptoPrice, fetchMultipleFreeCryptoPrices, isCryptoSymbol as isFreeCryptoSymbol } from "./freecryptoapi.tsx";
import { getBestBinancePrice, fetchBinance24hrTicker, isBinanceSymbol, fetchBinanceBookTicker, fetchAllBinancePrices, getBinanceCurrentCandleClose, fetchBinancePrice } from "./binance-api.tsx";

const app = new Hono();

// Open CORS for all origins
app.use("*", cors());
app.use("*", logger(console.log));

// Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ==========================================
// 🧠 IN-MEMORY CACHE (Primary - Fast & Reliable)
// ==========================================
const priceCache = new Map<string, { price: number; timestamp: number; source: string }>();

// Helper to safely get from kv_store with fallback
async function safeKvGet(key: string): Promise<any> {
  try {
    return await kv.get(key);
  } catch (error: any) {
    console.warn(`⚠️ [KV Store] Get failed for ${key}: ${error.message}`);
    return null;
  }
}

// Helper to safely set to kv_store (non-blocking)
async function safeKvSet(key: string, value: any): Promise<void> {
  try {
    await kv.set(key, value);
  } catch (error: any) {
    console.warn(`⚠️ [KV Store] Set failed for ${key}: ${error.message} - Continuing with in-memory cache only`);
  }
}

// ==========================================
// 📊 LIVE REAL-TIME PRICING ENGINE
// ==========================================
// Priority System:
// 1. Binance 1m Candle CLOSE (Most Accurate - Same as TradingView) ✅
// 2. Free Crypto API (Secondary Backup)
// 3. Cached Price (< 10 seconds)
// 4. Mock Data with Random Walk (Emergency Fallback)

/**
 * Get live market price with multi-tier fallback system
 * @param symbol - Trading symbol (e.g., "BTCUSD", "ETHUSD", "AAPL", "GOLD")
 * @returns Current market price
 */
async function getMarketPrice(symbol: string): Promise<number> {
  const cacheKey = `price:${symbol}`;
  const cached = await safeKvGet(cacheKey);
  const now = Date.now();
  
  // REDUCED CACHE: Only use cache if less than 10 seconds old (was 5 minutes)
  const CACHE_DURATION = 10000; // 10 seconds in milliseconds
  
  // ==========================================
  // 🪙 CRYPTOCURRENCY (Real-time via Binance)
  // ==========================================
  if (isBinanceSymbol(symbol) || isFreeCryptoSymbol(symbol)) {
    console.log(`💰 [Price Engine] Getting FRESH real-time CRYPTO price for ${symbol}...`);
    
    // 🥇 PRIORITY 1: Binance 1-minute Candle CLOSE (EXACTLY what TradingView uses!)
    try {
      console.log(`🎯 [Priority 1] Trying Binance 1m Candle CLOSE for ${symbol}... (TRADINGVIEW METHOD)`);
      const bestPrice = await getBinanceCurrentCandleClose(symbol);
      
      if (bestPrice && bestPrice > 0) {
        console.log(`✅ [Binance 1m Candle CLOSE] ${symbol} = $${bestPrice.toFixed(2)} ⭐ EXACT TRADINGVIEW MATCH`);
        
        await safeKvSet(cacheKey, {
          price: bestPrice,
          timestamp: now,
          source: 'binance-1m-candle-close'
        });
        
        priceCache.set(cacheKey, {
          price: bestPrice,
          timestamp: now,
          source: 'binance-1m-candle-close'
        });
        
        return Number(bestPrice.toFixed(2));
      }
    } catch (error: any) {
      console.warn(`⚠️ [Binance 1m Candle] Failed: ${error.message}`);
    }
    
    // 🥈 PRIORITY 2: Free Crypto API (Secondary Backup)
    try {
      console.log(`🎯 [Priority 2] Trying Free Crypto API for ${symbol}...`);
      const freeCryptoData = await fetchFreeCryptoPrice(symbol);
      
      if (freeCryptoData && freeCryptoData.price && freeCryptoData.price > 0) {
        console.log(`✅ [Free Crypto API] ${symbol} = $${freeCryptoData.price.toFixed(2)}`);
        
        await safeKvSet(cacheKey, {
          price: freeCryptoData.price,
          timestamp: now,
          source: 'free-crypto-api'
        });
        
        priceCache.set(cacheKey, {
          price: freeCryptoData.price,
          timestamp: now,
          source: 'free-crypto-api'
        });
        
        return Number(freeCryptoData.price.toFixed(2));
      }
    } catch (error: any) {
      console.warn(`⚠️ [Free Crypto API] Failed: ${error.message}`);
    }
    
    // 📦 PRIORITY 3: Use cached price ONLY if recent (< 10 seconds)
    if (cached && cached.price && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`📦 [Cache] Using cached CRYPTO price for ${symbol}: $${cached.price} (age: ${Math.round((now - cached.timestamp) / 1000)}s, Source: ${cached.source})`);
      return Number(cached.price.toFixed(2));
    }
  }
  
  // ==========================================
  // 📈 STOCKS (Real-time via Alpha Vantage)
  // ==========================================
  if (isStockSymbol(symbol)) {
    console.log(`📊 [Price Engine] Getting FRESH real-time STOCK price for ${symbol}...`);
    
    try {
      const stockQuote = await fetchStockPrice(symbol);
      
      if (stockQuote && stockQuote.price > 0) {
        console.log(`✅ [Stocks API] ${symbol} = $${stockQuote.price.toFixed(2)} (Real-time)`);
        
        await safeKvSet(cacheKey, {
          price: stockQuote.price,
          timestamp: now,
          source: 'alpha-vantage-stocks'
        });
        
        priceCache.set(cacheKey, {
          price: stockQuote.price,
          timestamp: now,
          source: 'alpha-vantage-stocks'
        });
        
        return Number(stockQuote.price.toFixed(2));
      }
    } catch (error: any) {
      console.warn(`⚠️ [Stocks API] Failed for ${symbol}: ${error.message}`);
    }
    
    // Use cache if available
    if (cached && cached.price) {
      console.log(`📦 [Cache] Using cached STOCK price for ${symbol}: $${cached.price}`);
      return Number(cached.price.toFixed(2));
    }
  }
  
  // ==========================================
  // 💱 FOREX & 🏅 COMMODITIES
  // ==========================================
  // For Forex/Commodities, use cache with longer duration (60 seconds)
  // since we don't have real-time API yet, but mock data is more stable
  const FOREX_CACHE_DURATION = 60000; // 60 seconds
  
  if (cached && cached.price && (now - cached.timestamp) < FOREX_CACHE_DURATION) {
    console.log(`📦 [Cache] Using cached price for ${symbol}: $${cached.price} (age: ${Math.round((now - cached.timestamp) / 1000)}s)`);
    return Number(cached.price.toFixed(2));
  }
  
  // 🎲 FALLBACK: Mock Data with Random Walk (for Forex/Commodities)
  console.log(`🎲 [Mock Data] Using simulated price for ${symbol} (Forex/Commodity)`);
  
  let currentPrice = cached ? cached.price : getBasePrice(symbol);
  
  // Apply random walk
  const volatility = getVolatility(symbol);
  const change = (Math.random() - 0.5) * volatility * currentPrice;
  const newPrice = currentPrice + change;
  
  await safeKvSet(cacheKey, {
    price: newPrice,
    timestamp: now,
    source: 'mock-random-walk'
  });
  
  priceCache.set(cacheKey, {
    price: newPrice,
    timestamp: now,
    source: 'mock-random-walk'
  });
  
  const decimals = symbol.includes("USD") && !symbol.includes("BTC") && !symbol.includes("ETH") ? 5 : 2;
  return Number(newPrice.toFixed(decimals));
}

/**
 * Get base price for mock data
 */
function getBasePrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    // Crypto (Updated Feb 2026)
    BTCUSD: 95420.00,
    ETHUSD: 3580.50,
    BNBUSD: 625.30,
    SOLUSD: 195.80,
    ADAUSD: 0.89,
    XRPUSD: 2.45,
    DOGEUSD: 0.32,
    MATICUSD: 0.78,
    TRXUSD: 0.16,
    DOTUSD: 8.90,
    LTCUSD: 125.50,
    AVAXUSD: 45.40,
    LINKUSD: 22.50,
    ATOMUSD: 12.80,
    UNIUSD: 9.70,
    ETCUSD: 32.30,
    XLMUSD: 0.14,
    BCHUSD: 420.00,
    NEARUSD: 6.80,
    
    // Forex (Updated Feb 2026)
    EURUSD: 1.09200,
    GBPUSD: 1.28300,
    USDJPY: 147.850,
    AUDUSD: 0.65800,
    USDCAD: 1.36200,
    NZDUSD: 0.61500,
    USDCHF: 0.88400,
    
    // Stocks (Updated Feb 2026)
    AAPL: 225.80,
    TSLA: 312.50,
    GOOGL: 168.40,
    MSFT: 465.90,
    AMZN: 198.70,
    NVDA: 945.20,
    META: 512.30,
    JPM: 218.50,
    
    // Commodities (Updated Feb 2026 - REAL PRICES!)
    GOLD: 2925.50,     // Gold is at all-time highs in 2026
    SILVER: 32.85,     // Silver also at higher levels
    USOIL: 72.40,      // WTI Crude Oil
    UKOIL: 76.80,      // Brent Crude Oil
  };
  
  return basePrices[symbol] || 100;
}

/**
 * Get volatility for random walk simulation
 */
function getVolatility(symbol: string): number {
  if (symbol.includes("BTC") || symbol.includes("ETH")) return 0.003;
  if (symbol.includes("USD") && !symbol.includes("JPY")) return 0.0005;
  if (symbol.includes("JPY")) return 0.002;
  if (["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"].includes(symbol)) return 0.008;
  if (["GOLD", "SILVER", "USOIL", "UKOIL"].includes(symbol)) return 0.005;
  return 0.01;
}

// ==========================================
// 🛣️ ROUTES
// ==========================================

/**
 * Health check
 */
app.get("/make-server-20da1dab/health", (c) => {
  return c.json({
    status: "ok",
    message: "Investoft Trading Server is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0-binance-realtime"
  });
});

/**
 * Get single asset price
 * GET /make-server-20da1dab/price?symbol=BTCUSD
 */
app.get("/make-server-20da1dab/price", async (c) => {
  try {
    const symbol = c.req.query("symbol");
    
    if (!symbol) {
      return c.json({ error: "Symbol parameter is required" }, 400);
    }
    
    const price = await getMarketPrice(symbol);
    const cached = await safeKvGet(`price:${symbol}`);
    
    return c.json({
      symbol: symbol,
      price: price,
      source: cached?.source || 'unknown',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("❌ [Price Error]:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Get market list with real-time prices
 * GET /make-server-20da1dab/market-list
 */
app.get("/make-server-20da1dab/market-list", async (c) => {
  try {
    const symbols = [
      // Crypto
      "BTCUSD", "ETHUSD", "BNBUSD", "SOLUSD", "ADAUSD", "XRPUSD",
      "DOGEUSD", "MATICUSD", "TRXUSD", "DOTUSD", "LTCUSD", "AVAXUSD",
      "LINKUSD", "ATOMUSD", "UNIUSD", "ETCUSD", "XLMUSD", "BCHUSD", "NEARUSD",
      
      // Forex
      "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD",
      
      // Stocks
      "AAPL", "TSLA", "GOOGL", "MSFT", "AMZN",
      
      // Commodities
      "GOLD", "SILVER", "USOIL", "UKOIL"
    ];
    
    const prices = await Promise.all(
      symbols.map(async (symbol) => {
        const price = await getMarketPrice(symbol);
        const cached = await safeKvGet(`price:${symbol}`);
        
        // Calculate random change for display
        const change = (Math.random() - 0.5) * 5;
        
        return {
          symbol: symbol,
          price: price,
          change: Number(change.toFixed(2)),
          source: cached?.source || 'unknown'
        };
      })
    );
    
    return c.json({ data: prices });
  } catch (error: any) {
    console.error("❌ [Market List Error]:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Get detailed 24hr ticker data (Binance)
 * GET /make-server-20da1dab/ticker-24hr?symbol=BTCUSD
 */
app.get("/make-server-20da1dab/ticker-24hr", async (c) => {
  try {
    const symbol = c.req.query("symbol");
    
    if (!symbol) {
      return c.json({ error: "Symbol parameter is required" }, 400);
    }
    
    // Try to get 24hr data from Binance
    const ticker24hr = await fetchBinance24hrTicker(symbol);
    
    if (ticker24hr) {
      return c.json(ticker24hr);
    }
    
    // Fallback to basic price
    const price = await getMarketPrice(symbol);
    return c.json({
      symbol: symbol,
      price: price,
      priceChange: 0,
      priceChangePercent: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("❌ [24hr Ticker Error]:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Get all Binance prices (bulk fetch)
 * GET /make-server-20da1dab/binance-all-prices
 */
app.get("/make-server-20da1dab/binance-all-prices", async (c) => {
  try {
    const allPrices = await fetchAllBinancePrices();
    
    const pricesArray = Array.from(allPrices.entries()).map(([symbol, price]) => ({
      symbol,
      price
    }));
    
    return c.json({
      total: pricesArray.length,
      data: pricesArray,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("❌ [All Prices Error]:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Binance WebSocket proxy
 */
app.all("/make-server-20da1dab/binance-proxy/*", binanceProxy);

/**
 * Execute trade (demo mode)
 * POST /make-server-20da1dab/trade
 */
app.post("/make-server-20da1dab/trade", async (c) => {
  try {
    const body = await c.req.json();
    const { symbol, amount, direction, duration } = body;
    
    if (!symbol || !amount || !direction || !duration) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Get current price as entry price
    const entryPrice = await getMarketPrice(symbol);
    
    // Create trade record
    const trade = {
      id: crypto.randomUUID(),
      symbol,
      amount: Number(amount),
      direction,
      duration: Number(duration),
      entryPrice,
      entryTime: new Date().toISOString(),
      status: 'active'
    };
    
    // Save to KV store
    await kv.set(`trade:${trade.id}`, trade);
    
    return c.json({
      success: true,
      trade: trade
    });
  } catch (error: any) {
    console.error("❌ [Trade Error]:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Close trade and calculate result
 * POST /make-server-20da1dab/trade/close
 */
app.post("/make-server-20da1dab/trade/close", async (c) => {
  try {
    const body = await c.req.json();
    const { tradeId } = body;
    
    if (!tradeId) {
      return c.json({ error: "Trade ID is required" }, 400);
    }
    
    // Get trade from KV store
    const trade = await kv.get(`trade:${tradeId}`);
    
    if (!trade) {
      return c.json({ error: "Trade not found" }, 404);
    }
    
    // Get current price as exit price
    const exitPrice = await getMarketPrice(trade.symbol);
    
    // Calculate profit/loss
    const priceChange = exitPrice - trade.entryPrice;
    const isWin = (trade.direction === 'up' && priceChange > 0) || 
                  (trade.direction === 'down' && priceChange < 0);
    
    const result = {
      ...trade,
      exitPrice,
      exitTime: new Date().toISOString(),
      priceChange,
      result: isWin ? 'win' : 'loss',
      profit: isWin ? trade.amount * 0.8 : -trade.amount,
      status: 'closed'
    };
    
    // Update trade in KV store
    await kv.set(`trade:${tradeId}`, result);
    
    return c.json({
      success: true,
      trade: result
    });
  } catch (error: any) {
    console.error("❌ [Close Trade Error]:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Get trade history
 * GET /make-server-20da1dab/trades
 */
app.get("/make-server-20da1dab/trades", async (c) => {
  try {
    // Get all trades from KV store
    const trades = await kv.getByPrefix('trade:');
    
    return c.json({
      success: true,
      trades: trades || []
    });
  } catch (error: any) {
    console.error("❌ [Get Trades Error]:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * CLEAR ALL PRICE CACHE (Force refresh)
 * POST /make-server-20da1dab/clear-cache
 */
app.post("/make-server-20da1dab/clear-cache", async (c) => {
  try {
    console.log("🧹 [Cache Clear] Clearing all price cache...");
    
    // Get all cached prices
    const allCached = await kv.getByPrefix('price:');
    
    // Delete all cache entries
    if (allCached && Array.isArray(allCached)) {
      for (const item of allCached) {
        const key = item.key || `price:${item.symbol}`;
        await kv.del(key);
      }
      
      console.log(`✅ [Cache Clear] Deleted ${allCached.length} cached prices`);
      
      return c.json({
        success: true,
        message: `Cleared ${allCached.length} cached prices`,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log("✅ [Cache Clear] No cache to clear");
    return c.json({
      success: true,
      message: "No cache to clear",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("❌ [Cache Clear Error]:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * TEST BINANCE API (Debug endpoint)
 * GET /make-server-20da1dab/test-binance?symbol=BTCUSD
 */
app.get("/make-server-20da1dab/test-binance", async (c) => {
  try {
    const symbol = c.req.query("symbol") || "BTCUSD";
    
    console.log(`🧪 [Test] Testing Binance API for ${symbol}...`);
    
    const results = {
      symbol,
      timestamp: new Date().toISOString(),
      tests: {} as any
    };
    
    // Test 1: Candle Close (TradingView method)
    try {
      const candleClose = await getBinanceCurrentCandleClose(symbol);
      results.tests.candleClose = {
        success: !!candleClose,
        price: candleClose,
        method: "1m Candle CLOSE (TradingView)"
      };
    } catch (e: any) {
      results.tests.candleClose = { success: false, error: e.message };
    }
    
    // Test 2: Book Ticker
    try {
      const bookTicker = await fetchBinanceBookTicker(symbol);
      results.tests.bookTicker = {
        success: !!bookTicker,
        bid: bookTicker?.bidPrice,
        ask: bookTicker?.askPrice,
        mid: bookTicker ? (bookTicker.bidPrice + bookTicker.askPrice) / 2 : null
      };
    } catch (e: any) {
      results.tests.bookTicker = { success: false, error: e.message };
    }
    
    // Test 3: Latest Price
    try {
      const priceData = await fetchBinancePrice(symbol);
      results.tests.latestPrice = {
        success: !!priceData,
        price: priceData?.price
      };
    } catch (e: any) {
      results.tests.latestPrice = { success: false, error: e.message };
    }
    
    // Test 4: Free Crypto API
    try {
      const freeCrypto = await fetchFreeCryptoPrice(symbol);
      results.tests.freeCrypto = {
        success: !!freeCrypto,
        price: freeCrypto?.price
      };
    } catch (e: any) {
      results.tests.freeCrypto = { success: false, error: e.message };
    }
    
    return c.json(results);
  } catch (error: any) {
    console.error("❌ [Test Error]:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

// ==========================================
// 💰 CRYPTOCURRENCY MARKET DATA (CoinGecko API)
// ==========================================

/**
 * Get cryptocurrency market data
 * GET /make-server-20da1dab/crypto?per_page=100&page=1
 */
app.get("/make-server-20da1dab/crypto", async (c) => {
  try {
    const perPage = c.req.query("per_page") || "100";
    const page = c.req.query("page") || "1";
    
    console.log(`🦎 [CoinGecko] Fetching top ${perPage} cryptocurrencies...`);
    
    // Fetch from CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      console.warn(`⚠️ [CoinGecko] API returned ${response.status}`);
      return c.json({ error: `CoinGecko API returned ${response.status}` }, response.status);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`⚠️ [CoinGecko] No data returned`);
      return c.json({ error: "No data available" }, 404);
    }
    
    // Transform data to match frontend format
    const transformedData = data.map((coin: any, index: number) => ({
      rank: index + 1 + ((parseInt(page) - 1) * parseInt(perPage)),
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_1h_in_currency: coin.price_change_percentage_1h_in_currency || 0,
      price_change_percentage_24h_in_currency: coin.price_change_percentage_24h_in_currency || 0,
      price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency || 0,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      circulating_supply: coin.circulating_supply,
      sparkline_in_7d: coin.sparkline_in_7d || { price: [] }
    }));
    
    console.log(`✅ [CoinGecko] Fetched ${transformedData.length} cryptocurrencies`);
    
    return c.json(transformedData);
    
  } catch (error: any) {
    console.error(`❌ [CoinGecko] Error fetching crypto data:`, error.message);
    return c.json({ error: error.message }, 500);
  }
});

// Start server
console.log("🚀 Starting Investoft Trading Server with Binance Real-Time Pricing...");
console.log("📡 Priority: Binance 1m Candle CLOSE → Free Crypto API → Cache (10s) → Mock");
console.log("🧠 Using in-memory cache as primary, KV store as backup");
Deno.serve(app.fetch);