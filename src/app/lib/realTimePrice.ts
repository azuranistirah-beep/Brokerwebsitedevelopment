// ✅ REAL-TIME PRICE SIMULATION SERVICE v7.0-FINAL
// Pure client-side simulation with ACCURATE base prices
// Prices synchronized across all components (Chart, Ticker, Trading)
// VERSION: 7.0-FINAL - Feb 6, 2026 - 100% TRANSPARENT SIMULATION

const BUILD_VERSION = "7.0-FINAL";
const BUILD_TIME = "2026-02-06T23:45:00Z";

console.log("═══════════════════════════════════════════════════════════");
console.log(`🟢 PRICE SERVICE v${BUILD_VERSION} - LOADING...`);
console.log(`⏰ Build Time: ${BUILD_TIME}`);
console.log("💡 DEMO PLATFORM - Simulated prices based on real market data");
console.log("═══════════════════════════════════════════════════════════");

type PriceCallback = (price: number) => void;

class RealTimePriceService {
  private subscribers: Map<string, Set<PriceCallback>> = new Map();
  private currentPrices: Map<string, number> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private priceHistory: Map<string, number[]> = new Map();

  constructor() {
    console.log(`✅ RealTimePriceService v${BUILD_VERSION} initialized`);
    console.log("ℹ️  Pure simulation - Prices synchronized across all components");
    console.log("ℹ️  Base prices updated to match current market values (Feb 6, 2026)");
    console.log("═══════════════════════════════════════════════════════════");
  }

  // ✅ ACCURATE base prices (updated Feb 6, 2026 to match TradingView)
  private getBasePrice(symbol: string): number {
    const upper = symbol.toUpperCase();
    
    // ✅ Crypto - Updated to match current market (Feb 7, 2026)
    if (upper.includes('BTC')) return 68073; // ✅ MATCH TradingView $68,073!
    if (upper.includes('ETH')) return 3520;
    if (upper.includes('BNB')) return 608;
    if (upper.includes('XRP')) return 2.48;
    if (upper.includes('SOL')) return 183;
    if (upper.includes('ADA')) return 1.18;
    
    // Forex
    if (upper.includes('EUR') && upper.includes('USD')) return 1.0892;
    if (upper.includes('GBP') && upper.includes('USD')) return 1.2695;
    if (upper.includes('USD') && upper.includes('JPY')) return 145.32;
    if (upper.includes('AUD') && upper.includes('USD')) return 0.6823;
    
    // Stocks - common tickers
    if (upper.includes('AAPL')) return 188.75;
    if (upper.includes('TSLA')) return 265.12;
    if (upper.includes('NVDA')) return 712.34;
    if (upper.includes('GOOGL')) return 152.45;
    if (upper.includes('MSFT')) return 405.67;
    if (upper.includes('AMZN')) return 178.23;
    if (upper.includes('META')) return 489.56;
    if (upper.includes('NFLX')) return 587.34;
    if (upper.includes('AMD')) return 182.91;
    
    // Commodities
    if (upper.includes('XAU') || upper.includes('GOLD')) return 2052;
    if (upper.includes('XAG') || upper.includes('SILVER')) return 24.5;
    if (upper.includes('OIL') || upper.includes('WTI')) return 74.8;
    
    // Indices
    if (upper.includes('SPX') || upper.includes('SP500')) return 5048;
    if (upper.includes('DJI') || upper.includes('DOW')) return 38150;
    if (upper.includes('NDX') || upper.includes('NASDAQ')) return 15920;
    
    return 100;
  }

  // Get realistic volatility for asset type
  private getVolatility(symbol: string): number {
    const upper = symbol.toUpperCase();
    
    // Crypto: Higher volatility (0.15%)
    if (upper.includes('BTC') || upper.includes('ETH') || 
        upper.includes('BNB') || upper.includes('XRP') || 
        upper.includes('SOL') || upper.includes('ADA')) {
      return 0.0015; // 0.15% per update (smoother than before)
    }
    
    // Forex: Low volatility (0.03%)
    if (upper.includes('USD') || upper.includes('EUR') || 
        upper.includes('GBP') || upper.includes('JPY')) {
      return 0.0003; // 0.03% per update
    }
    
    // Commodities: Medium volatility (0.08%)
    if (upper.includes('XAU') || upper.includes('GOLD') || 
        upper.includes('OIL') || upper.includes('SILVER')) {
      return 0.0008; // 0.08% per update
    }
    
    // Stocks/Indices: Medium volatility (0.05%)
    return 0.0005;
  }

  // Subscribe to price updates for a symbol
  subscribe(symbol: string, callback: PriceCallback): () => void {
    console.log(`📊 [RealTimePrice] Subscribing to ${symbol}...`);
    
    // Create subscriber set if it doesn't exist
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.startPriceStream(symbol);
    }

    // Add callback to subscribers
    this.subscribers.get(symbol)!.add(callback);

    // Send current price immediately if available
    const currentPrice = this.currentPrices.get(symbol);
    if (currentPrice) {
      callback(currentPrice);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(symbol);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.stopPriceStream(symbol);
        }
      }
    };
  }

  // Start price stream for a symbol
  private startPriceStream(symbol: string) {
    console.log(`🚀 [RealTimePrice] Starting price stream for ${symbol}...`);
    
    // Initialize price with base price
    const basePrice = this.getBasePrice(symbol);
    this.currentPrices.set(symbol, basePrice);
    this.updatePrice(symbol, basePrice);

    // Update price every 1-2 seconds with realistic movement
    const updatePrice = () => {
      const price = this.generateNextPrice(symbol);
      this.updatePrice(symbol, price);
    };

    // Immediate first update
    updatePrice();

    // Then update regularly with slight randomness
    const interval = setInterval(() => {
      updatePrice();
    }, 1000 + Math.random() * 1000); // 1-2 seconds

    this.intervals.set(symbol, interval);
  }

  // Stop price stream for a symbol
  private stopPriceStream(symbol: string) {
    console.log(`🛑 [RealTimePrice] Stopping price stream for ${symbol}...`);
    
    const interval = this.intervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(symbol);
    }

    this.subscribers.delete(symbol);
    this.currentPrices.delete(symbol);
    this.priceHistory.delete(symbol);
  }

  // Generate next price using realistic random walk (Geometric Brownian Motion)
  private generateNextPrice(symbol: string): number {
    let currentPrice = this.currentPrices.get(symbol);
    
    if (!currentPrice) {
      currentPrice = this.getBasePrice(symbol);
    }

    // Get volatility for this asset
    const volatility = this.getVolatility(symbol);
    const basePrice = this.getBasePrice(symbol);
    
    // ✅ MEAN REVERSION: Pull price back toward base price (prevents drift)
    const deviation = (currentPrice - basePrice) / basePrice; // % away from base
    const meanReversionSpeed = 0.05; // 5% pull back per update
    const meanReversionForce = -deviation * meanReversionSpeed;
    
    // Random walk with mean reversion
    const dt = 1; // time step
    const randomShock = (Math.random() - 0.5) * 2; // -1 to 1
    
    // Price change formula with mean reversion:
    // ΔP = P * (mean_reversion + volatility * sqrt(dt) * randomShock)
    const priceChange = currentPrice * (meanReversionForce + volatility * Math.sqrt(dt) * randomShock);
    
    let newPrice = currentPrice + priceChange;
    
    // Add occasional larger moves (simulate market events - 2% chance)
    if (Math.random() < 0.02) {
      const spike = (Math.random() - 0.5) * volatility * 2;
      newPrice = newPrice * (1 + spike);
    }

    // ✅ IMPORTANT: Keep price within ±5% of base (tight range for accuracy!)
    const minPrice = basePrice * 0.95; // Max 5% below base
    const maxPrice = basePrice * 1.05; // Max 5% above base
    newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

    // Store in history (keep last 100 prices)
    let history = this.priceHistory.get(symbol) || [];
    history.push(newPrice);
    if (history.length > 100) {
      history = history.slice(-100);
    }
    this.priceHistory.set(symbol, history);

    return newPrice;
  }

  // Update price and notify subscribers
  private updatePrice(symbol: string, price: number) {
    this.currentPrices.set(symbol, price);

    // Notify all subscribers
    const subs = this.subscribers.get(symbol);
    if (subs) {
      subs.forEach(callback => {
        try {
          callback(price);
        } catch (error) {
          console.error(`❌ Error in price callback for ${symbol}:`, error);
        }
      });
    }
  }

  // Get current price for a symbol (synchronous)
  getCurrentPrice(symbol: string): number {
    const price = this.currentPrices.get(symbol);
    
    // If price not available, return base price
    if (!price) {
      const basePrice = this.getBasePrice(symbol);
      console.log(`⚠️ [RealTimePrice] No current price for ${symbol}, returning base price: $${basePrice.toFixed(2)}`);
      return basePrice;
    }
    
    return price;
  }

  // Get price history for a symbol
  getPriceHistory(symbol: string): number[] {
    return this.priceHistory.get(symbol) || [];
  }
}

// Export singleton instance
export const realTimePriceService = new RealTimePriceService();