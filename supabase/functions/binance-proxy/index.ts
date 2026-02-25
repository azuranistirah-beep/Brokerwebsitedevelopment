/**
 * ✅ BINANCE PROXY - SIMPLE CORS BYPASS
 * 
 * Proxies Binance API requests to avoid CORS issues
 * - GET /binance-proxy?symbols=BTCUSDT,ETHUSDT,...
 * - Returns real-time prices from Binance
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const BINANCE_TICKER_API = 'https://api.binance.com/api/v3/ticker/price';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbols = url.searchParams.get('symbols');

    console.log(`📡 [Binance Proxy] Fetching prices...`);

    // Fetch ALL tickers from Binance
    const response = await fetch(BINANCE_TICKER_API, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    
    // If specific symbols requested, filter them
    if (symbols) {
      const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
      const filtered = data.filter((ticker: any) => 
        symbolList.includes(ticker.symbol)
      );
      
      console.log(`✅ [Binance Proxy] Returned ${filtered.length} symbols`);
      
      return new Response(
        JSON.stringify(filtered),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=1' // Cache for 1 second
          } 
        }
      );
    }

    // Return all tickers
    console.log(`✅ [Binance Proxy] Returned ${data.length} tickers`);
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1'
        } 
      }
    );

  } catch (error) {
    console.error('❌ [Binance Proxy] Error:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
