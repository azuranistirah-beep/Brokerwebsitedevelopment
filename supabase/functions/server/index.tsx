// Investoft Backend - Main Server with Binance Proxy
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Enable logging
app.use('*', logger(console.log));

// ✅ MULTIPLE BINANCE ENDPOINTS TO TRY
const BINANCE_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3/ticker/24hr', // Public Data API (usually not blocked)
  'https://api.binance.com/api/v3/ticker/24hr',
  'https://api1.binance.com/api/v3/ticker/24hr',
  'https://api2.binance.com/api/v3/ticker/24hr',
  'https://api3.binance.com/api/v3/ticker/24hr',
  'https://api4.binance.com/api/v3/ticker/24hr',
];

// ✅ COINGECKO MAPPING FOR FALLBACK
const COINGECKO_MAP: Record<string, string> = {
  'BTCUSDT': 'bitcoin',
  'ETHUSDT': 'ethereum',
  'BNBUSDT': 'binancecoin',
  'XRPUSDT': 'ripple',
  'SOLUSDT': 'solana',
  'ADAUSDT': 'cardano',
  'DOGEUSDT': 'dogecoin',
  'MATICUSDT': 'matic-network',
  'DOTUSDT': 'polkadot',
  'AVAXUSDT': 'avalanche-2',
  'SHIBUSDT': 'shiba-inu',
  'LINKUSDT': 'chainlink',
  'TRXUSDT': 'tron',
  'UNIUSDT': 'uniswap',
  'LTCUSDT': 'litecoin',
  'ATOMUSDT': 'cosmos',
  'ETCUSDT': 'ethereum-classic',
  'NEARUSDT': 'near',
  'APTUSDT': 'aptos',
  'ARBUSDT': 'arbitrum',
  'OPUSDT': 'optimism',
  'LDOUSDT': 'lido-dao',
  'XLMUSDT': 'stellar',
  'BCHUSDT': 'bitcoin-cash',
  'ALGOUSDT': 'algorand',
  'VETUSDT': 'vechain',
  'FILUSDT': 'filecoin',
  'ICPUSDT': 'internet-computer',
  'SANDUSDT': 'the-sandbox',
  'MANAUSDT': 'decentraland',
  'AXSUSDT': 'axie-infinity',
  'GRTUSDT': 'the-graph',
  'FTMUSDT': 'fantom',
  'ENJUSDT': 'enjincoin',
  'APEUSDT': 'apecoin',
  'GMXUSDT': 'gmx',
  'RUNEUSDT': 'thorchain',
  'QNTUSDT': 'quant-network',
  'IMXUSDT': 'immutable-x',
  'CRVUSDT': 'curve-dao-token',
  'MKRUSDT': 'maker',
  'AAVEUSDT': 'aave',
  'SNXUSDT': 'havven',
  'COMPUSDT': 'compound-governance-token',
  'YFIUSDT': 'yearn-finance',
  'SUSHIUSDT': 'sushi',
  'ZRXUSDT': '0x',
  'BATUSDT': 'basic-attention-token',
  'ZECUSDT': 'zcash',
  'DASHUSDT': 'dash',
  '1INCHUSDT': '1inch',
  'HBARUSDT': 'hedera-hashgraph',
};

/**
 * Try fetching from multiple Binance endpoints
 */
async function fetchFromBinance(timeout = 10000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (const endpoint of BINANCE_ENDPOINTS) {
    try {
      console.log(`🔄 [Binance] Trying: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });

      if (response.ok) {
        clearTimeout(timeoutId);
        const data = await response.json();
        console.log(`✅ [Binance] Success from ${endpoint} (${data.length} tickers)`);
        return { success: true, data, source: 'binance' };
      }

      console.log(`⚠️ [Binance] ${endpoint} returned ${response.status}`);
    } catch (error: any) {
      console.log(`⚠️ [Binance] ${endpoint} failed: ${error.message}`);
      continue;
    }
  }

  clearTimeout(timeoutId);
  return { success: false };
}

/**
 * Fallback to CoinGecko API
 */
async function fetchFromCoinGecko(): Promise<any> {
  try {
    const coinIds = Object.values(COINGECKO_MAP).join(',');
    
    console.log(`🦎 [CoinGecko Fallback] Fetching all supported coins...`);

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Convert CoinGecko format to Binance ticker/24hr format
    const binanceFormat = Object.entries(COINGECKO_MAP).map(([binanceSymbol, coinId]) => {
      const coinData = data[coinId];
      
      if (!coinData) return null;

      const price = coinData.usd;
      const changePercent = coinData.usd_24h_change || 0;
      const change = (price * changePercent) / 100;
      const openPrice = price - change;

      return {
        symbol: binanceSymbol,
        lastPrice: price.toString(),
        priceChange: change.toFixed(8),
        priceChangePercent: changePercent.toFixed(2),
        openPrice: openPrice.toString(),
        highPrice: price.toString(),
        lowPrice: price.toString(),
        volume: '0',
        quoteVolume: '0',
        closeTime: Date.now(),
      };
    }).filter(Boolean);

    console.log(`✅ [CoinGecko Fallback] Returned ${binanceFormat.length} prices`);

    return { success: true, data: binanceFormat, source: 'coingecko' };
  } catch (error: any) {
    console.error('❌ [CoinGecko Fallback] Error:', error.message);
    return { success: false };
  }
}

/**
 * ✅ HEALTH CHECK
 */
app.get('/make-server-20da1dab/health', (c) => {
  return c.json({
    ok: true,
    service: 'Investoft Backend',
    version: '21.0.0-ANTI-451-FIX',
    timestamp: new Date().toISOString(),
    status: 'operational',
  });
});

/**
 * ✅ BINANCE API PROXY - ANTI 451 FIX!
 * 
 * v21.0.0 - Multiple Binance endpoints + CoinGecko fallback
 * - Tries 6 Binance endpoints (data-api.binance.vision first)
 * - Falls back to CoinGecko if all Binance endpoints fail
 * - Returns X-Price-Source header to indicate data source
 */
app.get('/make-server-20da1dab/binance/ticker/24hr', async (c) => {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('📡 [Binance Proxy v21.0.0] ANTI 451 - Fetching prices...');
    console.log('═══════════════════════════════════════════════');
    
    // Try Binance first (multiple endpoints)
    const binanceResult = await fetchFromBinance();
    
    if (binanceResult.success) {
      console.log(`✅ [Binance] Success! Source: ${binanceResult.source}`);
      console.log(`📊 Returning ${binanceResult.data.length} tickers`);
      console.log('═══════════════════════════════════════════════');
      console.log('');
      
      return c.json(binanceResult.data, {
        headers: {
          'X-Price-Source': binanceResult.source,
          'Cache-Control': 'public, max-age=1',
        }
      });
    }
    
    // Binance failed, try CoinGecko fallback
    console.log('⚠️ [Binance] All endpoints failed (451 blocked)');
    console.log('🦎 [CoinGecko] Activating fallback...');
    
    const coinGeckoResult = await fetchFromCoinGecko();
    
    if (coinGeckoResult.success) {
      console.log(`✅ [CoinGecko] Success! Source: ${coinGeckoResult.source}`);
      console.log(`📊 Returning ${coinGeckoResult.data.length} prices`);
      console.log('═══════════════════════════════════════════════');
      console.log('');
      
      return c.json(coinGeckoResult.data, {
        headers: {
          'X-Price-Source': coinGeckoResult.source,
          'Cache-Control': 'public, max-age=2',
        }
      });
    }
    
    // Both failed
    console.error('❌ [Proxy] All price sources failed!');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    
    return c.json(
      {
        error: 'All price sources failed (Binance 451 + CoinGecko unavailable)',
        binance: 'blocked',
        coingecko: 'failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
    
  } catch (error: any) {
    console.error('❌ [Binance Proxy] Fetch error:', error);
    return c.json(
      { error: 'Failed to fetch from Binance', message: error.message },
      { status: 500 }
    );
  }
});

/**
 * ✅ BINANCE API PROXY - SINGLE TICKER PRICE
 * 
 * Frontend calls: /make-server-20da1dab/binance/ticker/price?symbol=BTCUSDT
 * Backend fetches: https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT
 */
app.get('/make-server-20da1dab/binance/ticker/price', async (c) => {
  try {
    const symbol = c.req.query('symbol');
    
    if (!symbol) {
      return c.json({ error: 'Missing symbol parameter' }, { status: 400 });
    }
    
    console.log(`🔄 [Binance Proxy] Fetching price for ${symbol}...`);
    
    // Fetch from Binance API
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    
    if (!response.ok) {
      console.error(`❌ [Binance Proxy] Binance API error: ${response.status}`);
      return c.json(
        { error: 'Binance API error', status: response.status },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`✅ [Binance Proxy] Price for ${symbol}: $${data.price}`);
    
    return c.json(data);
    
  } catch (error) {
    console.error('❌ [Binance Proxy] Fetch error:', error);
    return c.json(
      { error: 'Failed to fetch from Binance', message: error.message },
      { status: 500 }
    );
  }
});

/**
 * ✅ CATCH-ALL ROUTE
 */
app.all('*', (c) => {
  console.log(`⚠️ [Server] Unknown route: ${c.req.method} ${c.req.url}`);
  return c.json(
    { 
      error: 'Route not found',
      path: new URL(c.req.url).pathname,
      method: c.req.method,
    },
    { status: 404 }
  );
});

// Start server
Deno.serve(app.fetch);

console.log('🚀 [Investoft Backend] Server started with Binance proxy!');
console.log('📊 Routes available:');
console.log('   - GET  /make-server-20da1dab/health');
console.log('   - GET  /make-server-20da1dab/binance/ticker/24hr');
console.log('   - GET  /make-server-20da1dab/binance/ticker/price?symbol=BTCUSDT');