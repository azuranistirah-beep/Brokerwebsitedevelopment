/**
 * ✅ INVESTOFT TRADING BACKEND - SINGLE SOURCE OF TRUTH
 * 
 * Handles all trading operations with price fetched from prices table
 * - Backend determines entry_price (not frontend!)
 * - EXACT MATCH with TradingView (both use Binance)
 * - All users see the SAME price
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const BINANCE_API = 'https://api.binance.com/api/v3/ticker/price';

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

    // GET /prices - Fetch prices from Binance API
    if (path === '/make-server-20da1dab/prices' && req.method === 'GET') {
      console.log('📡 [Prices] Fetching from Binance API...');
      
      try {
        const response = await fetch(BINANCE_API, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Binance API returned ${response.status}`);
        }

        const data = await response.json();
        
        console.log(`✅ [Prices] Fetched ${data.length} prices from Binance`);
        
        return new Response(
          JSON.stringify({
            success: true,
            count: data.length,
            prices: data,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        console.error('❌ [Prices] Error:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: error.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
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