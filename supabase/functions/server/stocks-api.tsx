/**
 * Stocks API Handler
 * Fetches real-time stock prices from Alpha Vantage API
 */

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

/**
 * Fetch stock price from Alpha Vantage
 * API Key: MGBGLASR660UCN89
 */
export async function fetchStockPrice(symbol: string): Promise<StockQuote | null> {
  try {
    const apiKey = Deno.env.get('STOCKS_API_KEY');
    
    if (!apiKey) {
      console.log('⚠️ STOCKS_API_KEY not configured');
      return null;
    }

    // Alpha Vantage API endpoint
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    
    console.log(`📊 [Stocks API] Fetching: ${symbol}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ [Stocks API] Error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Alpha Vantage response format:
    // {
    //   "Global Quote": {
    //     "01. symbol": "AAPL",
    //     "05. price": "175.43",
    //     "09. change": "2.15",
    //     "10. change percent": "1.24%",
    //     "06. volume": "45678901",
    //     "07. latest trading day": "2024-02-11"
    //   }
    // }
    
    const quote = data['Global Quote'];
    
    if (!quote || !quote['05. price']) {
      console.error(`❌ [Stocks API] Invalid response for ${symbol}`);
      return null;
    }
    
    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
    const volume = parseInt(quote['06. volume']);
    
    console.log(`✅ [Stocks API] ${symbol}: $${price.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
    
    return {
      symbol,
      price,
      change,
      changePercent,
      volume,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error(`❌ [Stocks API] Error fetching ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch multiple stock prices at once
 */
export async function fetchMultipleStocks(symbols: string[]): Promise<Map<string, StockQuote>> {
  const results = new Map<string, StockQuote>();
  
  // Fetch in parallel (with rate limit consideration)
  const promises = symbols.map(symbol => fetchStockPrice(symbol));
  const quotes = await Promise.all(promises);
  
  quotes.forEach((quote, index) => {
    if (quote) {
      results.set(symbols[index], quote);
    }
  });
  
  return results;
}

/**
 * Check if symbol is a stock (not crypto/forex)
 */
export function isStockSymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  
  // Not a stock if it's crypto
  const cryptoKeywords = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'MATIC', 'DOT', 'LINK', 'USDT'];
  if (cryptoKeywords.some(k => upper.includes(k))) return false;
  
  // Not a stock if it's forex pair
  const forexKeywords = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
  const hasMultipleCurrencies = forexKeywords.filter(k => upper.includes(k)).length >= 2;
  if (hasMultipleCurrencies) return false;
  
  // Common stock symbols
  const stockSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 
    'AMD', 'INTC', 'NFLX', 'DIS', 'BA', 'GE', 'IBM', 'JPM', 'BAC',
    'WMT', 'PG', 'JNJ', 'V', 'MA', 'PYPL', 'SQ', 'SHOP', 'SPOT',
    'UBER', 'LYFT', 'ABNB', 'COIN', 'HOOD', 'RBLX'
  ];
  
  return stockSymbols.some(s => upper === s || upper.includes(s));
}
