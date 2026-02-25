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

/**
 * ✅ HEALTH CHECK
 */
app.get('/make-server-20da1dab/health', (c) => {
  return c.json({
    ok: true,
    service: 'Investoft Backend',
    version: '20.0.0-TIMEOUT-FIX',
    timestamp: new Date().toISOString(),
    status: 'operational',
  });
});

/**
 * ✅ BINANCE API PROXY - FIX CORS ERRORS!
 * 
 * Frontend calls: /make-server-20da1dab/binance/ticker/24hr
 * Backend fetches: https://api.binance.com/api/v3/ticker/24hr
 * 
 * This solves CORS issues because server-to-server requests don't have CORS!
 * 
 * v20.0.0 - Added timeout handling to prevent connection hangs
 */
app.get('/make-server-20da1dab/binance/ticker/24hr', async (c) => {
  try {
    console.log('🔄 [Binance Proxy] Fetching 24hr ticker data...');
    
    // ✅ Add timeout to prevent hanging connections
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Fetch from Binance API (server-to-server, no CORS!)
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`❌ [Binance Proxy] Binance API error: ${response.status}`);
        return c.json(
          { error: 'Binance API error', status: response.status },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      console.log(`✅ [Binance Proxy] Fetched ${data.length} tickers successfully`);
      
      // Return data to frontend
      return c.json(data);
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ [Binance Proxy] Request timeout (>10s)');
        return c.json(
          { error: 'Request timeout', message: 'Binance API took too long to respond' },
          { status: 504 }
        );
      }
      
      throw fetchError; // Re-throw other errors
    }
    
  } catch (error) {
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