/**
 * ✅ SUPABASE EDGE FUNCTION - PRICE UPDATER
 * 
 * Updates prices table with real-time data from Binance API
 * - Fetches prices from Binance every call
 * - Updates Supabase prices table
 * - Should be called every 1-2 seconds via cron or frontend polling
 * 
 * This ensures ALL users see the SAME price (Single Source of Truth)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const BINANCE_API = 'https://api.binance.com/api/v3/ticker/price';

// Symbols to track (add more as needed)
const TRACKED_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'TRXUSDT',
  'LTCUSDT', 'AVAXUSDT', 'LINKUSDT', 'ATOMUSDT', 'UNIUSDT',
  'ETCUSDT', 'XLMUSDT', 'BCHUSDT', 'NEARUSDT', 'ALGOUSDT',
  'FILUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT', 'GRTUSDT',
  'FTMUSDT', 'ENJUSDT', 'APEUSDT', 'GMXUSDT', 'RUNEUSDT',
  'QNTUSDT', 'IMXUSDT', 'CRVUSDT', 'MKRUSDT', 'AAVEUSDT',
  'SNXUSDT', 'COMPUSDT', 'YFIUSDT', 'SUSHIUSDT', 'ZRXUSDT',
  'BATUSDT', 'ZECUSDT', 'DASHUSDT', '1INCHUSDT', 'HBARUSDT',
  'FLOWUSDT', 'ONEUSDT', 'THETAUSDT', 'CHZUSDT', 'HOTUSDT',
  'ZILUSDT', 'WAVESUSDT', 'KAVAUSDT', 'ONTUSDT', 'XTZUSDT',
  'QTUMUSDT', 'RVNUSDT', 'NMRUSDT', 'STORJUSDT', 'ANKRUSDT',
  'CELRUSDT', 'CKBUSDT', 'FETUSDT', 'IOTXUSDT', 'LRCUSDT',
  'OCEANUSDT', 'RSRUSDT', 'SKLUSDT', 'UMAUSDT', 'WOOUSDT',
  'BANDUSDT', 'KSMUSDT', 'BALUSDT', 'COTIUSDT', 'OGNUSDT',
  'RLCUSDT', 'SRMUSDT', 'LPTUSDT', 'ALPHAUSDT', 'CTSIUSDT',
  'ROSEUSDT', 'GLMUSDT', 'JASMYUSDT', 'PEOPLEUSDT', 'GALAUSDT',
  'INJUSDT', 'MINAUSDT', 'ARUSDT', 'CFXUSDT', 'KLAYUSDT',
  'SHIBUSDT', 'ICPUSDT', 'APTUSDT', 'ARBUSDT', 'OPUSDT',
  'LDOUSDT', 'VETUSDT'
];

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
    const startTime = Date.now();
    console.log('📡 Fetching prices from Binance API...');

    // Fetch ALL prices from Binance in one call
    const response = await fetch(BINANCE_API);

    if (!response.ok) {
      throw new Error(`Binance API returned ${response.status}`);
    }

    const allTickers: BinanceTicker[] = await response.json();
    console.log(`✅ Fetched ${allTickers.length} tickers from Binance`);

    // Filter to only tracked symbols
    const relevantTickers = allTickers.filter(ticker =>
      TRACKED_SYMBOLS.includes(ticker.symbol)
    );

    console.log(`📊 Found ${relevantTickers.length} tracked symbols`);

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare batch update
    const now = new Date().toISOString();
    const updates = relevantTickers.map(ticker => ({
      symbol: ticker.symbol,
      price: parseFloat(ticker.price),
      source: 'binance',
      updated_at: now
    }));

    // Upsert all prices in one transaction
    const { data, error } = await supabase
      .from('prices')
      .upsert(updates, { onConflict: 'symbol' });

    if (error) {
      console.error('❌ Supabase upsert error:', error);
      throw error;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Updated ${updates.length} prices in ${duration}ms`);

    // Return summary
    return new Response(
      JSON.stringify({
        success: true,
        updated: updates.length,
        duration_ms: duration,
        timestamp: now,
        sample: updates.slice(0, 5) // Show first 5 as sample
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('❌ Error updating prices:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
