/**
 * ✅ BINANCE PROXY - MULTI-ENDPOINT WITH FALLBACK
 * 
 * VERSION: 21.0.0 - ANTI 451 ERROR!
 * 
 * Proxies Binance API requests with multiple endpoints + CoinGecko fallback
 * - Tries multiple Binance endpoints (api, api1, api2, api3)
 * - Falls back to CoinGecko if Binance is blocked (451 error)
 * - GET /binance-proxy?symbols=BTCUSDT,ETHUSDT,...
 * - Returns real-time prices
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Multiple Binance endpoints to try
const BINANCE_ENDPOINTS = [
  'https://api.binance.com/api/v3/ticker/price',
  'https://api1.binance.com/api/v3/ticker/price',
  'https://api2.binance.com/api/v3/ticker/price',
  'https://api3.binance.com/api/v3/ticker/price',
  'https://data-api.binance.vision/api/v3/ticker/price', // Public data API
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// CoinGecko symbol mapping (Binance → CoinGecko ID)
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
async function fetchFromBinance(timeout = 8000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (const endpoint of BINANCE_ENDPOINTS) {
    try {
      console.log(`🔄 [Binance Proxy] Trying: ${endpoint}`);
      
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
        console.log(`✅ [Binance Proxy] Success from ${endpoint}`);
        return { success: true, data, source: 'binance' };
      }

      console.log(`⚠️ [Binance Proxy] ${endpoint} returned ${response.status}`);
    } catch (error) {
      console.log(`⚠️ [Binance Proxy] ${endpoint} failed:`, error.message);
      continue;
    }
  }

  clearTimeout(timeoutId);
  return { success: false };
}

// Fallback to CoinGecko API
async function fetchFromCoinGecko(symbols: string[]): Promise<any> {
  try {
    // Convert Binance symbols to CoinGecko IDs
    const coinIds = symbols
      .map(sym => COINGECKO_MAP[sym])
      .filter(Boolean)
      .join(',');

    if (!coinIds) {
      throw new Error('No CoinGecko mappings found');
    }

    console.log(`🦎 [CoinGecko Fallback] Fetching: ${coinIds}`);

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

    // Convert CoinGecko format to Binance format
    const binanceFormat = symbols.map(symbol => {
      const coinId = COINGECKO_MAP[symbol];
      const coinData = data[coinId];

      if (!coinData) return null;

      return {
        symbol: symbol,
        price: coinData.usd.toString(),
        // CoinGecko doesn't provide these, set defaults
        priceChange: '0',
        priceChangePercent: coinData.usd_24h_change?.toString() || '0',
        openPrice: coinData.usd.toString(),
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

  try {
    const url = new URL(req.url);
    const symbols = url.searchParams.get('symbols');

    console.log(`📡 [Binance Proxy] v21.0.0 - Request received`);

    // Try Binance first
    const binanceResult = await fetchFromBinance();

    if (binanceResult.success) {
      const data = binanceResult.data;

      // If specific symbols requested, filter them
      if (symbols) {
        const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
        const filtered = data.filter((ticker: any) => 
          symbolList.includes(ticker.symbol)
        );

        console.log(`✅ [Binance] Returned ${filtered.length} symbols`);

        return new Response(
          JSON.stringify(filtered),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'X-Price-Source': 'binance',
              'Cache-Control': 'public, max-age=1',
            }
          }
        );
      }

      // Return all tickers
      console.log(`✅ [Binance] Returned ${data.length} tickers`);

      return new Response(
        JSON.stringify(data),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Price-Source': 'binance',
            'Cache-Control': 'public, max-age=1',
          }
        }
      );
    }

    // Binance failed, try CoinGecko fallback
    console.log('⚠️ [Binance Proxy] All Binance endpoints failed, trying CoinGecko...');

    if (symbols) {
      const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
      const coinGeckoResult = await fetchFromCoinGecko(symbolList);

      if (coinGeckoResult.success) {
        return new Response(
          JSON.stringify(coinGeckoResult.data),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'X-Price-Source': 'coingecko',
              'Cache-Control': 'public, max-age=2',
            }
          }
        );
      }
    }

    // Both failed
    throw new Error('All price sources failed (Binance 451 + CoinGecko unavailable)');

  } catch (error) {
    console.error('❌ [Binance Proxy] Error:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        suggestion: 'Binance API might be blocked (451). Please check your region or use VPN.'
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