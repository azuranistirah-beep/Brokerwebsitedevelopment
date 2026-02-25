/**
 * ✅ SUPABASE EDGE FUNCTION - CRYPTO PRICES PROXY
 * 
 * Fetches real-time crypto prices from Binance API
 * This runs server-side so NO CORS issues!
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const BINANCE_API = 'https://api.binance.com/api/v3/ticker/price';

interface BinanceTicker {
  symbol: string;
  price: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    console.log('📡 Fetching prices from Binance...');

    // Fetch from Binance API (server-side, no CORS!)
    const response = await fetch(BINANCE_API, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Binance API returned ${response.status}`);
    }

    const data: BinanceTicker[] = await response.json();

    console.log(`✅ Fetched ${data.length} prices from Binance`);

    // Convert to our format
    const prices: Record<string, number> = {};
    
    data.forEach((ticker) => {
      // Convert BTCUSDT -> BTCUSD format
      const symbol = ticker.symbol.replace('USDT', 'USD');
      prices[symbol] = parseFloat(ticker.price);
    });

    // Return with CORS headers
    return new Response(JSON.stringify({ prices, timestamp: Date.now() }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=5', // Cache for 5 seconds
      },
    });

  } catch (error) {
    console.error('❌ Error fetching prices:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch prices',
        message: error.message 
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
