// Edge Function: get-market-price
// Fetch real-time market prices from external APIs (bypasses CORS)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface PriceRequest {
  symbol: string;
}

interface PriceResponse {
  success: boolean;
  symbol: string;
  price: number | null;
  source: string;
  timestamp: number;
  error?: string;
}

// Detect asset type from symbol
function getAssetType(symbol: string): 'crypto' | 'forex' | 'stocks' | 'commodities' {
  const upper = symbol.toUpperCase();
  
  if (upper.includes('BTC') || upper.includes('ETH') || upper.includes('BNB') || 
      upper.includes('XRP') || upper.includes('SOL') || upper.includes('ADA')) {
    return 'crypto';
  }
  
  if (upper.includes('USD') || upper.includes('EUR') || upper.includes('GBP') || 
      upper.includes('JPY') || upper.includes('AUD') || upper.includes('CAD')) {
    return 'forex';
  }
  
  if (upper.includes('GOLD') || upper.includes('SILVER') || upper.includes('XAU') || 
      upper.includes('XAG') || upper.includes('OIL')) {
    return 'commodities';
  }
  
  return 'stocks';
}

// Fetch crypto price from CoinGecko
async function fetchCryptoPrice(symbol: string): Promise<{ price: number | null; source: string }> {
  try {
    // ✅ TRY BINANCE FIRST (most reliable for crypto, no rate limit)
    const cleanSymbol = symbol.replace('BINANCE:', '');
    
    console.log(`🔍 Fetching from Binance API: ${cleanSymbol}`);
    
    const binanceResponse = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}`
    );
    
    if (binanceResponse.ok) {
      const binanceData = await binanceResponse.json();
      const price = parseFloat(binanceData.price);
      
      if (price && price > 0) {
        console.log(`✅ Binance: ${cleanSymbol} = $${price}`);
        return { price, source: 'binance' };
      }
    } else {
      console.warn(`⚠️ Binance API returned ${binanceResponse.status}`);
    }
    
    // ✅ FALLBACK: Try CoinGecko if Binance fails
    const symbolMap = cleanSymbol.replace('USDT', '').toLowerCase();
    
    const coinMap: Record<string, string> = {
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'bnb': 'binancecoin',
      'xrp': 'ripple',
      'sol': 'solana',
      'ada': 'cardano',
      'doge': 'dogecoin',
      'dot': 'polkadot',
      'matic': 'matic-network',
      'trx': 'tron',
      'ltc': 'litecoin',
      'avax': 'avalanche-2',
      'link': 'chainlink',
      'atom': 'cosmos',
      'uni': 'uniswap',
      'etc': 'ethereum-classic',
      'xlm': 'stellar',
      'bch': 'bitcoin-cash',
      'near': 'near',
    };
    
    const coinId = coinMap[symbolMap];
    if (!coinId) {
      console.error(`❌ Unknown crypto symbol: ${cleanSymbol}`);
      return { price: null, source: 'none' };
    }
    
    console.log(`🔍 Trying CoinGecko fallback: ${coinId}`);
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    
    if (!response.ok) {
      console.error(`❌ CoinGecko API error: ${response.status}`);
      return { price: null, source: 'coingecko' };
    }
    
    const data = await response.json();
    const price = data[coinId]?.usd || null;
    
    if (price) {
      console.log(`✅ CoinGecko: ${symbolMap.toUpperCase()} = $${price}`);
    }
    
    return { price, source: 'coingecko' };
    
  } catch (error) {
    console.error('❌ Crypto price fetch error:', error);
    return { price: null, source: 'error' };
  }
}

// Fetch forex price from Yahoo Finance API
async function fetchForexPrice(symbol: string): Promise<{ price: number | null; source: string }> {
  try {
    const pair = symbol.replace('FX:', '');
    
    // Yahoo Finance uses format: EURUSD=X
    const yahooSymbol = `${pair}=X`;
    
    console.log(`🔍 Fetching from Yahoo Finance: ${yahooSymbol}`);
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`
    );
    
    if (!response.ok) {
      console.error(`❌ Yahoo Finance API error: ${response.status}`);
      return { price: null, source: 'yahoo-finance' };
    }
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    const price = result?.meta?.regularMarketPrice;
    
    if (price && price > 0) {
      console.log(`✅ Yahoo Finance: ${pair} = ${price}`);
      return { price, source: 'yahoo-finance' };
    }
    
    return { price: null, source: 'yahoo-finance' };
    
  } catch (error) {
    console.error('❌ Forex price fetch error:', error);
    return { price: null, source: 'yahoo-finance' };
  }
}

// Fetch stock price from Finnhub
async function fetchStockPrice(symbol: string): Promise<{ price: number | null; source: string }> {
  try {
    const cleanSymbol = symbol.split(':')[1]; // Extract AAPL from NASDAQ:AAPL
    const apiKey = 'c0vud6pr01qmq8vd2fm0'; // Free demo key
    
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${cleanSymbol}&token=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`Finnhub API error: ${response.status}`);
      return { price: null, source: 'finnhub' };
    }
    
    const data = await response.json();
    const price = data.c || null; // Current price
    
    if (price && price > 0) {
      console.log(`✅ Finnhub: ${cleanSymbol} = $${price}`);
      return { price, source: 'finnhub' };
    }
    
    return { price: null, source: 'finnhub' };
    
  } catch (error) {
    console.error('Stock price fetch error:', error);
    return { price: null, source: 'finnhub' };
  }
}

// Fetch commodity price from MetalPrice API
async function fetchCommodityPrice(symbol: string): Promise<{ price: number | null; source: string }> {
  try {
    const cleanSymbol = symbol.replace('TVC:', '');
    const apiKey = '6bb3544ebca8f0a0131f0f93b41fa2ef';
    
    let base = '';
    if (cleanSymbol === 'GOLD') {
      base = 'XAU';
    } else if (cleanSymbol === 'SILVER') {
      base = 'XAG';
    } else {
      return { price: null, source: 'metalpriceapi' };
    }
    
    const response = await fetch(
      `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=${base}&currencies=USD`
    );
    
    if (!response.ok) {
      console.error(`MetalPrice API error: ${response.status}`);
      return { price: null, source: 'metalpriceapi' };
    }
    
    const data = await response.json();
    const rate = data.rates?.USD;
    
    if (rate) {
      const price = 1 / rate; // Invert to get price per ounce
      console.log(`✅ MetalPrice: ${cleanSymbol} = $${price}`);
      return { price, source: 'metalpriceapi' };
    }
    
    return { price: null, source: 'metalpriceapi' };
    
  } catch (error) {
    console.error('Commodity price fetch error:', error);
    return { price: null, source: 'metalpriceapi' };
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { symbol }: PriceRequest = await req.json();
    
    if (!symbol) {
      const errorResponse: PriceResponse = {
        success: false,
        symbol: '',
        price: null,
        source: 'none',
        timestamp: Date.now(),
        error: 'Symbol is required'
      };
      
      return new Response(JSON.stringify(errorResponse), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 400,
      });
    }
    
    console.log(`🔍 Fetching price for: ${symbol}`);
    
    const assetType = getAssetType(symbol);
    let result: { price: number | null; source: string };
    
    // Route to appropriate API based on asset type
    switch (assetType) {
      case 'crypto':
        result = await fetchCryptoPrice(symbol);
        break;
      case 'forex':
        result = await fetchForexPrice(symbol);
        break;
      case 'stocks':
        result = await fetchStockPrice(symbol);
        break;
      case 'commodities':
        result = await fetchCommodityPrice(symbol);
        break;
      default:
        result = { price: null, source: 'unknown' };
    }
    
    const response: PriceResponse = {
      success: result.price !== null,
      symbol,
      price: result.price,
      source: result.source,
      timestamp: Date.now(),
      error: result.price === null ? 'Failed to fetch price' : undefined
    };
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    });
    
  } catch (error) {
    console.error('Edge Function error:', error);
    
    const errorResponse: PriceResponse = {
      success: false,
      symbol: '',
      price: null,
      source: 'none',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    });
  }
});