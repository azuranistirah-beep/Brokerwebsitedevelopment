/**
 * ✅ INVESTOFT TRADING BACKEND - SINGLE SOURCE OF TRUTH
 * 
 * VERSION: 20.1.0 - ANTI 451 FIX!
 * 
 * Handles all trading operations with price fetched from prices table
 * - Backend determines entry_price (not frontend!)
 * - EXACT MATCH with TradingView (both use Binance)
 * - All users see the SAME price
 * - Multiple Binance endpoints + CoinGecko fallback
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// Multiple Binance endpoints to try
const BINANCE_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3/ticker/24hr', // Public Data API (usually not blocked)
  'https://api.binance.com/api/v3/ticker/24hr',
  'https://api1.binance.com/api/v3/ticker/24hr',
  'https://api2.binance.com/api/v3/ticker/24hr',
  'https://api3.binance.com/api/v3/ticker/24hr',
  'https://api4.binance.com/api/v3/ticker/24hr',
];

const BINANCE_PRICE_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3/ticker/price', // Public Data API first
  'https://api.binance.com/api/v3/ticker/price',
  'https://api1.binance.com/api/v3/ticker/price',
  'https://api2.binance.com/api/v3/ticker/price',
  'https://api3.binance.com/api/v3/ticker/price',
  'https://api4.binance.com/api/v3/ticker/price',
];

// CoinGecko symbol mapping
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

// Try fetching from Binance with multiple endpoints
async function fetchFromBinance(endpoints: string[], timeout = 10000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 [Binance] Trying: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      });

      if (response.ok) {
        clearTimeout(timeoutId);
        const data = await response.json();
        console.log(`✅ [Binance] Success from ${endpoint} (${data.length} tickers)`);
        return { success: true, data, source: 'binance' };
      }

      console.log(`⚠️ [Binance] ${endpoint} returned ${response.status}`);
    } catch (error) {
      console.log(`⚠️ [Binance] ${endpoint} failed:`, error.message);
      continue;
    }
  }

  clearTimeout(timeoutId);
  return { success: false };
}

// Fallback to CoinGecko API
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
  } catch (error) {
    console.error('❌ [CoinGecko Fallback] Error:', error);
    return { success: false };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ GET /binance/ticker/24hr - Fetch ALL crypto prices (ANTI 451!)
    if (path === '/make-server-20da1dab/binance/ticker/24hr' && req.method === 'GET') {
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('📡 [Binance Proxy v20.1.0] ANTI 451 - Fetching prices...');
      console.log('═══════════════════════════════════════════════');
      
      // Try Binance first (multiple endpoints)
      const binanceResult = await fetchFromBinance(BINANCE_ENDPOINTS);
      
      if (binanceResult.success) {
        console.log(`✅ [Binance] Success! Source: ${binanceResult.source}`);
        console.log(`📊 Returning ${binanceResult.data.length} tickers`);
        console.log('═══════════════════════════════════════════════');
        console.log('');
        
        return new Response(
          JSON.stringify(binanceResult.data),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'X-Price-Source': binanceResult.source,
              'Cache-Control': 'public, max-age=1',
            }
          }
        );
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
        
        return new Response(
          JSON.stringify(coinGeckoResult.data),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'X-Price-Source': coinGeckoResult.source,
              'Cache-Control': 'public, max-age=2',
            }
          }
        );
      }
      
      // Both failed
      console.error('❌ [Proxy] All price sources failed!');
      console.log('═══════════════════════════════════════════════');
      console.log('');
      
      return new Response(
        JSON.stringify({
          error: 'All price sources failed (Binance 451 + CoinGecko unavailable)',
          binance: 'blocked',
          coingecko: 'failed',
          timestamp: new Date().toISOString()
        }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // GET /prices - Fetch prices from Binance API (legacy route)
    if (path === '/make-server-20da1dab/prices' && req.method === 'GET') {
      console.log('📡 [Prices] Fetching from Binance API...');
    }

    // POST /trades - Create new trade
    if (path === '/make-server-20da1dab/trades' && req.method === 'POST') {
      const body = await req.json();
      const { user_id, asset, symbol, type, amount, duration, account_type } = body;

      console.log('📊 [CreateTrade] Request:', { user_id, asset, symbol, type, amount, duration });

      // ✅ FETCH ENTRY PRICE FROM PRICES TABLE (Single Source of Truth!)
      const normalizedSymbol = normalizeSymbol(symbol || asset);
      console.log(`🔍 [CreateTrade] Fetching price for: ${normalizedSymbol}`);

      const { data: priceData, error: priceError } = await supabase
        .from('prices')
        .select('price')
        .eq('symbol', normalizedSymbol)
        .single();

      if (priceError || !priceData) {
        console.error('❌ [CreateTrade] Price not found:', priceError);
        return new Response(
          JSON.stringify({ 
            error: 'Price not available',
            symbol: normalizedSymbol 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const entry_price = parseFloat(priceData.price);
      console.log(`✅ [CreateTrade] Entry price from DB: $${entry_price.toFixed(2)}`);

      // Save trade to database
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id,
          asset,
          symbol: normalizedSymbol,
          type,
          amount: parseFloat(amount),
          entry_price,
          duration: parseInt(duration),
          account_type,
          status: 'open',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (tradeError) {
        console.error('❌ [CreateTrade] Database error:', tradeError);
        return new Response(
          JSON.stringify({ error: tradeError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`✅ [CreateTrade] Trade created:`, trade);

      return new Response(
        JSON.stringify({ 
          success: true,
          entry_price, // ✅ Return actual entry price to frontend
          trade 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // PUT /trades/:id - Update trade result
    if (path.startsWith('/make-server-20da1dab/trades/') && req.method === 'PUT') {
      const tradeId = path.split('/').pop();
      const body = await req.json();
      const { exit_price, profit, status } = body;

      const { data, error } = await supabase
        .from('trades')
        .update({
          exit_price: parseFloat(exit_price),
          profit: parseFloat(profit),
          status,
          closed_at: new Date().toISOString()
        })
        .eq('id', tradeId)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // GET /user/:id - Get user profile
    if (path.startsWith('/make-server-20da1dab/user/') && req.method === 'GET') {
      const userId = path.split('/').pop();

      const { data, error } = await supabase
        .from('users')
        .select('email, demo_balance, real_balance, total_trades, winning_trades, losing_trades')
        .eq('id', userId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Default: Not found
    return new Response(
      JSON.stringify({ error: 'Endpoint not found', path }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ [Server] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Normalize symbol to Binance format (BTCUSDT)
 */
function normalizeSymbol(symbol: string): string {
  let clean = symbol
    .replace('BINANCE:', '')
    .replace('BITSTAMP:', '')
    .replace('NASDAQ:', '')
    .replace('NYSE:', '')
    .replace('FX:', '')
    .replace('TVC:', '')
    .replace('OANDA:', '')
    .toUpperCase()
    .trim();

  // Convert USD to USDT for crypto
  if (clean.endsWith('USD') && !clean.endsWith('USDT')) {
    const cryptoSymbols = [
      'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'DOT', 'TRX',
      'LTC', 'AVAX', 'LINK', 'ATOM', 'UNI', 'ETC', 'XLM', 'BCH', 'NEAR', 'ALGO'
    ];

    const baseSymbol = clean.replace('USD', '');
    if (cryptoSymbols.includes(baseSymbol)) {
      clean = baseSymbol + 'USDT';
    }
  }

  return clean;
}