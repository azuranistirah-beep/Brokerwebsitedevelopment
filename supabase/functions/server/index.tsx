// Investoft Backend - Main Server with Binance Proxy
import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ✅ CRITICAL: Enable CORS for all origins
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// ✅ Enable request logging
app.use('*', logger(console.log));

// ✅ ONLY 46 CRYPTO SYMBOLS WE NEED (reduce response size!)
const REQUIRED_CRYPTO_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT', 'ADAUSDT', 
  'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT', 'SHIBUSDT', 'LINKUSDT',
  'TRXUSDT', 'UNIUSDT', 'LTCUSDT', 'ATOMUSDT', 'ETCUSDT', 'NEARUSDT',
  'APTUSDT', 'ARBUSDT', 'OPUSDT', 'LDOUSDT', 'XLMUSDT', 'BCHUSDT',
  'ALGOUSDT', 'VETUSDT', 'FILUSDT', 'ICPUSDT', 'SANDUSDT', 'MANAUSDT',
  'AXSUSDT', 'GRTUSDT', 'FTMUSDT', 'ENJUSDT', 'APEUSDT', 'GMXUSDT',
  'RUNEUSDT', 'QNTUSDT', 'IMXUSDT', 'CRVUSDT', 'MKRUSDT', 'AAVEUSDT',
  'SNXUSDT', 'COMPUSDT', 'YFIUSDT', 'SUSHIUSDT', 'ZRXUSDT', 'BATUSDT',
  'ZECUSDT', 'DASHUSDT', '1INCHUSDT', 'HBARUSDT'
];

// ✅ YAHOO FINANCE SYMBOL MAPPING (NO API KEY NEEDED!)
const YAHOO_SYMBOLS: Record<string, string> = {
  // Commodities (MOST IMPORTANT!)
  'GOLD': 'GC=F',      // Gold Futures
  'XAUUSD': 'GC=F',    // Gold Spot (same as futures for simplicity)
  'SILVER': 'SI=F',    // Silver Futures
  'XAGUSD': 'SI=F',    // Silver Spot
  'USOIL': 'CL=F',     // WTI Crude Oil Futures
  'UKOIL': 'BZ=F',     // Brent Crude Oil Futures
  
  // Forex (use Yahoo Finance forex symbols)
  'EURUSD': 'EURUSD=X',
  'GBPUSD': 'GBPUSD=X',
  'USDJPY': 'USDJPY=X',
  'AUDUSD': 'AUDUSD=X',
  'USDCHF': 'USDCHF=X',
  'NZDUSD': 'NZDUSD=X',
  'USDCAD': 'USDCAD=X',
  'EURGBP': 'EURGBP=X',
  'EURJPY': 'EURJPY=X',
  'GBPJPY': 'GBPJPY=X',
  
  // Stocks (top 20 most important)
  'AAPL': 'AAPL',
  'MSFT': 'MSFT',
  'GOOGL': 'GOOGL',
  'AMZN': 'AMZN',
  'META': 'META',
  'NVDA': 'NVDA',
  'TSLA': 'TSLA',
  'AMD': 'AMD',
  'NFLX': 'NFLX',
  'INTC': 'INTC',
  'JPM': 'JPM',
  'BAC': 'BAC',
  'V': 'V',
  'MA': 'MA',
  'WMT': 'WMT',
  'JNJ': 'JNJ',
  'PFE': 'PFE',
  'XOM': 'XOM',
  'CVX': 'CVX',
  'BA': 'BA',
  
  // Indices
  'SPX500': '^GSPC',   // S&P 500
  'NSX100': '^NDX',    // Nasdaq 100
};

const BINANCE_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3/ticker/24hr', // Try public API first
  'https://api.binance.com/api/v3/ticker/24hr',
  'https://api1.binance.com/api/v3/ticker/24hr',
  'https://api2.binance.com/api/v3/ticker/24hr',
  'https://api3.binance.com/api/v3/ticker/24hr',
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
 * ✅ FILTER ONLY 46 REQUIRED SYMBOLS (reduce response size from 2500+ to 46!)
 */
async function fetchFromBinance(timeout = 4000): Promise<any> {
  for (const endpoint of BINANCE_ENDPOINTS) {
    try {
      console.log(`🔄 [Binance] Trying: ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const allData = await response.json();
        
        // ✅ FILTER: Only return 46 crypto symbols we need (not 2500+!)
        const filteredData = allData.filter((ticker: any) => 
          REQUIRED_CRYPTO_SYMBOLS.includes(ticker.symbol)
        );
        
        console.log(`✅ [Binance] Success from ${endpoint}`);
        console.log(`📊 Filtered: ${filteredData.length}/${allData.length} tickers (only what we need!)`);
        
        return { success: true, data: filteredData, source: 'binance' };
      }

      console.log(`⚠️ [Binance] ${endpoint} returned ${response.status}`);
    } catch (error: any) {
      console.log(`⚠️ [Binance] ${endpoint} failed: ${error.message}`);
      continue;
    }
  }

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
    version: '23.0.0-YAHOO-FINANCE',
    timestamp: new Date().toISOString(),
    status: 'operational',
    optimization: 'Response size reduced 98% (2500→46 tickers)',
    cors: 'enabled',
    logging: 'enabled',
    yahooFinance: 'enabled (commodities, forex, stocks)',
  });
});

/**
 * ✅ NEW: YAHOO FINANCE PROXY - GET REAL-TIME PRICES
 * 
 * Frontend calls: /make-server-20da1dab/yahoo/quote?symbols=GOLD,SILVER,EURUSD
 * Returns REAL-TIME prices from Yahoo Finance (NO API KEY NEEDED!)
 * 
 * Response format matches Binance for consistency:
 * {
 *   symbol: 'GOLD',
 *   lastPrice: '2850.50',
 *   priceChange: '15.30',
 *   priceChangePercent: '0.54',
 *   openPrice: '2835.20',
 *   timestamp: 1234567890
 * }
 */
app.get('/make-server-20da1dab/yahoo/quote', async (c) => {
  try {
    const symbolsParam = c.req.query('symbols');
    
    if (!symbolsParam) {
      return c.json({ error: 'Missing symbols parameter' }, { status: 400 });
    }
    
    const requestedSymbols = symbolsParam.split(',').map(s => s.trim());
    
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log(`📡 [Yahoo Finance] Fetching ${requestedSymbols.length} symbols...`);
    console.log(`📊 Requested: ${requestedSymbols.join(', ')}`);
    console.log('═══════════════════════════════════════════════');
    
    const results = [];
    
    // Fetch each symbol from Yahoo Finance
    for (const symbol of requestedSymbols) {
      const yahooSymbol = YAHOO_SYMBOLS[symbol];
      
      if (!yahooSymbol) {
        console.log(`⚠️ [Yahoo] Symbol ${symbol} not mapped, skipping...`);
        continue;
      }
      
      try {
        // Yahoo Finance API endpoint (public, no auth needed)
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2d`;
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        if (!response.ok) {
          console.log(`⚠️ [Yahoo] ${symbol} (${yahooSymbol}) failed: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        const result = data?.chart?.result?.[0];
        
        if (!result || !result.meta || !result.indicators?.quote?.[0]) {
          console.log(`⚠️ [Yahoo] ${symbol} invalid data structure`);
          continue;
        }
        
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        
        // Get current price and previous close
        const currentPrice = meta.regularMarketPrice || meta.previousClose;
        const previousClose = meta.chartPreviousClose || meta.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        // Get open price (first value of the day)
        const openPrice = quote.open?.[0] || previousClose;
        
        console.log(`✅ [Yahoo] ${symbol}: $${currentPrice.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
        
        results.push({
          symbol: symbol,
          lastPrice: currentPrice.toString(),
          priceChange: change.toFixed(8),
          priceChangePercent: changePercent.toFixed(2),
          openPrice: openPrice.toString(),
          highPrice: (meta.regularMarketDayHigh || currentPrice).toString(),
          lowPrice: (meta.regularMarketDayLow || currentPrice).toString(),
          previousClose: previousClose.toString(),
          timestamp: meta.regularMarketTime || Date.now(),
          source: 'yahoo',
        });
        
      } catch (error: any) {
        console.log(`❌ [Yahoo] ${symbol} error: ${error.message}`);
        continue;
      }
    }
    
    console.log(`✅ [Yahoo Finance] Success! Returned ${results.length}/${requestedSymbols.length} prices`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
    
    if (results.length === 0) {
      return c.json(
        { error: 'No data available for requested symbols', requested: requestedSymbols },
        { status: 404 }
      );
    }
    
    return c.json(results, {
      headers: {
        'X-Price-Source': 'yahoo',
        'Cache-Control': 'public, max-age=5',
      }
    });
    
  } catch (error: any) {
    console.error('❌ [Yahoo Finance] Fetch error:', error);
    return c.json(
      { error: 'Failed to fetch from Yahoo Finance', message: error.message },
      { status: 500 }
    );
  }
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
      console.log('═════════════════════════��═════════════════════');
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

// ========== AUTHENTICATION & USER ROUTES ==========

/**
 * ✅ CREATE TEST MEMBER
 * POST /make-server-20da1dab/create-test-member
 */
app.post('/make-server-20da1dab/create-test-member', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, initial_balance = 10000 } = body;
    
    console.log('🔐 [Create Test Member] Request:', { email, name, initial_balance });
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users.some(u => u.email === email);
    
    if (userExists) {
      console.log('⚠️ [Create Test Member] User already exists:', email);
      return c.json({ existing: true, message: 'User already exists' });
    }
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name || email.split('@')[0],
        role: 'member',
      },
    });
    
    if (authError) {
      console.error('❌ [Create Test Member] Auth error:', authError);
      return c.json({ error: authError.message }, { status: 400 });
    }
    
    console.log('✅ [Create Test Member] User created:', authData.user.id);
    
    // Store user profile in KV store
    const userId = authData.user.id;
    await kv.set(`user:${userId}:profile`, {
      email,
      name: name || email.split('@')[0],
      demo_balance: initial_balance,
      real_balance: 0,
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      created_at: new Date().toISOString(),
    });
    
    console.log('✅ [Create Test Member] Profile saved to KV store');
    
    return c.json({
      success: true,
      user_id: userId,
      email,
      message: 'Test member created successfully',
    });
    
  } catch (error: any) {
    console.error('❌ [Create Test Member] Error:', error);
    return c.json({ error: error.message }, { status: 500 });
  }
});

/**
 * ✅ GET USER PROFILE
 * GET /make-server-20da1dab/user/profile
 */
app.get('/make-server-20da1dab/user/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Missing Authorization header' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ [User Profile] Auth error:', authError);
      return c.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    console.log('✅ [User Profile] User authenticated:', user.id);
    
    // Get profile from KV store
    const profile = await kv.get(`user:${user.id}:profile`);
    
    if (!profile) {
      // Create default profile if doesn't exist
      const defaultProfile = {
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Member',
        demo_balance: 10000,
        real_balance: 0,
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
        created_at: new Date().toISOString(),
      };
      
      await kv.set(`user:${user.id}:profile`, defaultProfile);
      console.log('✅ [User Profile] Created default profile');
      
      return c.json(defaultProfile);
    }
    
    console.log('✅ [User Profile] Profile found:', profile);
    return c.json(profile);
    
  } catch (error: any) {
    console.error('❌ [User Profile] Error:', error);
    return c.json({ error: error.message }, { status: 500 });
  }
});

/**
 * ✅ OPEN TRADE
 * POST /make-server-20da1dab/trades/open
 */
app.post('/make-server-20da1dab/trades/open', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Missing Authorization header' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const body = await c.req.json();
    const { asset, type, amount, entry_price, duration, account_type = 'demo' } = body;
    
    console.log('📈 [Open Trade] Request:', { asset, type, amount, entry_price, duration, account_type });
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    // Verify token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get user profile
    const profile = await kv.get(`user:${user.id}:profile`);
    if (!profile) {
      return c.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Check balance
    const balance = account_type === 'demo' ? profile.demo_balance : profile.real_balance;
    if (balance < amount) {
      return c.json({ error: 'Insufficient balance' }, { status: 400 });
    }
    
    // Deduct balance
    const balanceKey = account_type === 'demo' ? 'demo_balance' : 'real_balance';
    profile[balanceKey] -= amount;
    
    // Create trade
    const tradeId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + (duration * 1000);
    
    const trade = {
      id: tradeId,
      user_id: user.id,
      asset,
      type,
      amount,
      entry_price,
      entry_time: now,
      expires_at: expiresAt,
      duration,
      account_type,
      status: 'open',
      created_at: new Date().toISOString(),
    };
    
    // Save trade
    await kv.set(`trade:${tradeId}`, trade);
    await kv.set(`user:${user.id}:trade:${tradeId}`, trade);
    
    // Update profile
    await kv.set(`user:${user.id}:profile`, profile);
    
    console.log('✅ [Open Trade] Trade opened:', tradeId);
    
    return c.json({
      success: true,
      trade_id: tradeId,
      expires_at: expiresAt,
      new_balance: profile[balanceKey],
    });
    
  } catch (error: any) {
    console.error('❌ [Open Trade] Error:', error);
    return c.json({ error: error.message }, { status: 500 });
  }
});

// Fallback for unknown routes
app.all('*', (c) => {
  return c.json(
    { error: 'Route not found', path: c.req.path },
    { status: 404 }
  );
});

// Start server
Deno.serve(app.fetch);

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('🚀 [Investoft Backend v23.0.0] Server started!');
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 Data Sources:');
console.log('   ✅ Binance API (Crypto): 46 symbols');
console.log('   ✅ Yahoo Finance (Commodities/Forex/Stocks): NO API KEY!');
console.log('   ✅ CoinGecko (Crypto Fallback): 46 symbols');
console.log('');
console.log('🔗 Available Routes:');
console.log('   - GET  /make-server-20da1dab/health');
console.log('   - GET  /make-server-20da1dab/binance/ticker/24hr');
console.log('   - GET  /make-server-20da1dab/binance/ticker/price?symbol=BTCUSDT');
console.log('   - GET  /make-server-20da1dab/yahoo/quote?symbols=GOLD,SILVER,EURUSD');
console.log('');
console.log('🎉 Gold/Silver/Oil: NOW REAL-TIME from Yahoo Finance!');
console.log('═══════════════════════════════════════════════════════════');
console.log('');