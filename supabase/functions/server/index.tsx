import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { fetchStockPrice, isStockSymbol } from "./stocks-api.tsx";

const app = new Hono();

// Supabase client with service role key (for admin operations)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Supabase client with anon key (for verifying user JWTs from frontend)
const supabaseAnon = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// --- Helpers ---

// Robust Mock Price Engine (Random Walk)
// Stores last price and time to create consistent charts/movements
async function getMarketPrice(symbol: string): Promise<number> {
  const cacheKey = `price:${symbol}`;
  const cached = await kv.get(cacheKey);
  
  const now = Date.now();
  
  if (cached && (now - cached.timestamp < 1000)) {
    // Return cached if less than 1s old
    return cached.price;
  }

  let currentPrice = cached ? cached.price : getBasePrice(symbol);
  
  // Random Walk
  const volatility = getVolatility(symbol);
  const change = (Math.random() - 0.5) * volatility * currentPrice;
  const newPrice = currentPrice + change;
  
  // Save to KV
  await kv.set(cacheKey, { price: newPrice, timestamp: now });
  
  return Number(newPrice.toFixed(symbol.includes("USD") && !symbol.includes("BTC") && !symbol.includes("ETH") ? 5 : 2));
}

function getBasePrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    "BTCUSD": 65000,
    "ETHUSD": 3500,
    "EURUSD": 1.0850,
    "GBPUSD": 1.2750,
    "AAPL": 175.50,
    "TSLA": 180.20,
    "GOOGL": 145.30,
    "GOLD": 2350.00,
    "SPX500": 5100.00,
    "NSX100": 18000.00
  };
  return basePrices[symbol] || 100;
}

function getVolatility(symbol: string): number {
  if (symbol.includes("BTC") || symbol.includes("ETH")) return 0.0005; // High vol
  if (symbol.includes("USD")) return 0.00005; // Low vol (forex)
  return 0.0002; // Stocks
}

// Default Assets Configuration
const DEFAULT_ASSETS = [
  { symbol: "BTCUSD", name: "Bitcoin", payout: 85 },
  { symbol: "ETHUSD", name: "Ethereum", payout: 82 },
  { symbol: "EURUSD", name: "EUR/USD", payout: 88 },
  { symbol: "GBPUSD", name: "GBP/USD", payout: 85 },
  { symbol: "AAPL", name: "Apple", payout: 80 },
  { symbol: "TSLA", name: "Tesla", payout: 80 },
  { symbol: "GOOGL", name: "Google", payout: 80 },
  { symbol: "GOLD", name: "Gold", payout: 82 },
];

// --- Routes ---

// Health check endpoint
app.get("/make-server-20da1dab/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-20da1dab/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user account with demo balance
    const userId = data.user.id;
    const userRole = role || 'member'; 
    
    // Set default status based on role
    // Admin = auto-active, Member = pending approval
    const status = userRole === 'admin' ? 'active' : 'pending';
    
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      balance: 10000, // Demo balance
      createdAt: new Date().toISOString(),
      role: userRole,
      status: status // NEW: pending/active/rejected
    });

    // For admin accounts, also create a session and return token
    if (userRole === 'admin') {
      // Sign in the user to get a valid session token
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });

      if (sessionError) {
        console.log(`Error generating session: ${sessionError.message}`);
      }

      // Return success with user data and a flag for auto-login
      return c.json({ 
        success: true, 
        user: { id: userId, email, name, role: userRole, status: 'active' },
        autoLogin: true // Signal to frontend to auto-login
      });
    }

    // For members, return success but no auto-login (pending approval)
    return c.json({ 
      success: true, 
      user: { id: userId, email, name, role: userRole, status: 'pending' },
      message: "Account created successfully. Awaiting admin approval."
    });
  } catch (error) {
    console.log(`Unexpected error in signup endpoint: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user profile
app.get("/make-server-20da1dab/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    const { data: { user }, error } = await supabaseAnon.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    return c.json({ user: userProfile });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Check if user exists (for diagnostic purposes)
app.get("/make-server-20da1dab/check-user", async (c) => {
  try {
    const email = c.req.query('email');
    
    if (!email) {
      return c.json({ error: "Email parameter required" }, 400);
    }

    // Try to find user in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    let authUser = null;
    if (!listError && users) {
      authUser = users.find((u: any) => u.email === email);
    }

    // Try to find user profile in KV store
    let userProfile = null;
    if (authUser) {
      userProfile = await kv.get(`user:${authUser.id}`);
    } else {
      // If no auth user, try to find by email in all user profiles
      const allUsers = await kv.getByPrefix("user:");
      userProfile = allUsers.find((u: any) => u.email === email);
    }

    return c.json({
      exists: !!authUser,
      email: email,
      authUser: authUser ? {
        id: authUser.id,
        email: authUser.email,
        confirmed_at: authUser.confirmed_at,
        created_at: authUser.created_at
      } : null,
      profile: userProfile || null
    });
  } catch (error) {
    console.log(`Error checking user: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Check if any admin exists (for auto-setup)
app.get("/make-server-20da1dab/check-admin", async (c) => {
  try {
    const allUsers = await kv.getByPrefix("user:");
    const adminExists = allUsers.some((user: any) => user.role === 'admin');
    
    return c.json({ 
      adminExists,
      totalUsers: allUsers.length,
      totalAdmins: allUsers.filter((u: any) => u.role === 'admin').length
    });
  } catch (error) {
    console.log(`Error checking admin: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get Assets (Public or Protected)
app.get("/make-server-20da1dab/assets", async (c) => {
  try {
    let assets = await kv.get("config:assets");
    if (!assets) {
      assets = DEFAULT_ASSETS;
      await kv.set("config:assets", assets);
    }
    return c.json({ assets });
  } catch (error) {
    console.log(`Error getting assets: ${error}`);
    return c.json({ assets: DEFAULT_ASSETS });
  }
});

// Get Market List Data (For Homepage/Live Overview)
app.get("/make-server-20da1dab/market-list", async (c) => {
  try {
    // List of symbols to display on homepage
    const symbols = [
      "BTCUSD", "ETHUSD", "EURUSD", "GBPUSD", "USDJPY", 
      "SPX500", "NSX100", "GOLD", "AAPL", "TSLA"
    ];
    
    const marketData = await Promise.all(symbols.map(async (sym) => {
      const price = await getMarketPrice(sym);
      const base = getBasePrice(sym);
      const change = ((price - base) / base) * 100;
      
      return {
        symbol: sym,
        price: price,
        change: Number(change.toFixed(2))
      };
    }));
    
    return c.json({ data: marketData });
  } catch (error) {
    return c.json({ error: "Failed to fetch market data" }, 500);
  }
});

// Admin: Update Assets
app.post("/make-server-20da1dab/admin/assets", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const { assets } = await c.req.json();
    if (!Array.isArray(assets)) {
      return c.json({ error: "Invalid assets format" }, 400);
    }

    await kv.set("config:assets", assets);
    return c.json({ success: true, assets });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get Price (supports crypto, stocks, and simulated data)
app.get("/make-server-20da1dab/price", async (c) => {
  try {
    const symbol = c.req.query('symbol');
    
    console.log(`📊 [Price API] Request received for symbol: ${symbol}`);
    
    if (!symbol) {
      console.error('❌ [Price API] No symbol provided');
      return c.json({ error: "Symbol required", code: 'MISSING_SYMBOL' }, 400);
    }
    
    // ✅ Check if it's a crypto symbol - fetch from Binance API
    const cryptoKeywords = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'MATIC', 'DOT', 'LINK'];
    const isCrypto = cryptoKeywords.some(keyword => symbol.toUpperCase().includes(keyword));
    
    if (isCrypto) {
      try {
        // Map to Binance symbol format
        let binanceSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, '');
        if (!binanceSymbol.endsWith('USDT')) {
          binanceSymbol = binanceSymbol.replace('USD', '') + 'USDT';
        }
        
        console.log(`🔍 [Backend] Fetching crypto price for ${symbol} -> ${binanceSymbol}`);
        console.log(`🌐 [Backend] Calling Binance API: https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);
        
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);
        
        console.log(`📡 [Backend] Binance API response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          const price = parseFloat(data.price);
          
          console.log(`💰 [Backend] Binance price for ${binanceSymbol}: $${price}`);
          
          return c.json({ 
            symbol, 
            price,
            source: 'binance',
            timestamp: new Date().toISOString()
          });
        } else {
          const errorText = await response.text();
          console.warn(`⚠️ [Backend] Binance API returned ${response.status} for ${binanceSymbol}`);
          console.warn(`⚠️ [Backend] Binance error: ${errorText}`);
          // Don't return error, try other sources
        }
      } catch (error: any) {
        console.error(`❌ [Backend] Error fetching crypto price from Binance:`);
        console.error(`   - Error name: ${error.name}`);
        console.error(`   - Error message: ${error.message}`);
        console.error(`   - Stack: ${error.stack}`);
        // Don't return error, try other sources
      }
    }
    
    // Try to fetch real stock data if it's a stock symbol
    if (isStockSymbol(symbol)) {
      console.log(`📈 [Backend] Attempting to fetch stock data for ${symbol}`);
      const stockQuote = await fetchStockPrice(symbol);
      if (stockQuote) {
        console.log(`💰 [Backend] Alpha Vantage price for ${symbol}: $${stockQuote.price}`);
        return c.json({ 
          symbol, 
          price: stockQuote.price,
          change: stockQuote.change,
          changePercent: stockQuote.changePercent,
          source: 'alpha_vantage',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Fallback to simulated price
    console.log(`🎲 [Backend] Using simulated price for ${symbol}`);
    const price = await getMarketPrice(symbol);
    return c.json({ 
      symbol, 
      price, 
      source: 'simulated',
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error(`❌ [Backend] Fatal error in /price endpoint:`);
    console.error(`   - Error: ${error.message}`);
    console.error(`   - Stack: ${error.stack}`);
    return c.json({ 
      error: "Internal server error", 
      message: error.message,
      code: 'INTERNAL_ERROR' 
    }, 500);
  }
});

// Execute trade
app.post("/make-server-20da1dab/trade", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { asset, type, amount, duration } = await c.req.json();

    if (!asset || !type || !amount) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) return c.json({ error: "User profile not found" }, 404);

    if (userProfile.balance < amount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }

    const entryPrice = await getMarketPrice(asset);

    const tradeId = `trade:${user.id}:${Date.now()}`;
    const trade = {
      id: tradeId,
      userId: user.id,
      asset,
      type, // 'buy' or 'sell'
      amount,
      entryPrice,
      duration: duration || "1m",
      status: 'open',
      openedAt: new Date().toISOString(),
      closedAt: null,
      profit: 0
    };

    await kv.set(tradeId, trade);

    userProfile.balance -= amount;
    await kv.set(`user:${user.id}`, userProfile);

    await kv.set(`tx:${user.id}:${Date.now()}`, {
      id: `tx-${Date.now()}`,
      userId: user.id,
      type: 'trade_open',
      amount: -amount,
      status: 'completed',
      date: new Date().toISOString(),
      details: `Open ${type.toUpperCase()} on ${asset}`
    });

    return c.json({ success: true, trade });
  } catch (error) {
    console.log(`Error executing trade: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Close trade
app.post("/make-server-20da1dab/trade/close", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { tradeId } = await c.req.json();
    if (!tradeId) return c.json({ error: "Missing tradeId" }, 400);

    const trade = await kv.get(tradeId);
    if (!trade) return c.json({ error: "Trade not found" }, 404);

    if (trade.userId !== user.id) return c.json({ error: "Unauthorized" }, 403);
    if (trade.status !== 'open') return c.json({ error: "Trade already closed" }, 400);

    const exitPrice = await getMarketPrice(trade.asset);
    
    let assets = await kv.get("config:assets");
    if (!assets) assets = DEFAULT_ASSETS;
    const assetConfig = assets.find((a: any) => a.symbol === trade.asset);
    const payoutRate = assetConfig ? assetConfig.payout : 80;

    let isWin = false;
    if (trade.type === 'buy') {
      isWin = exitPrice > trade.entryPrice;
    } else {
      isWin = exitPrice < trade.entryPrice;
    }

    let profit = 0;
    let returnAmount = 0;

    if (isWin) {
      const payoutMultiplier = payoutRate / 100;
      profit = trade.amount * payoutMultiplier;
      returnAmount = trade.amount + profit;
    } else if (exitPrice === trade.entryPrice) {
      returnAmount = trade.amount;
    }

    trade.status = 'closed';
    trade.closedAt = new Date().toISOString();
    trade.exitPrice = exitPrice;
    trade.profit = isWin ? profit : -trade.amount;
    trade.result = isWin ? 'win' : (exitPrice === trade.entryPrice ? 'tie' : 'loss');
    
    await kv.set(tradeId, trade);

    if (returnAmount > 0) {
      const userProfile = await kv.get(`user:${user.id}`);
      userProfile.balance += returnAmount;
      await kv.set(`user:${user.id}`, userProfile);

      await kv.set(`tx:${user.id}:${Date.now()}`, {
        id: `tx-${Date.now()}`,
        userId: user.id,
        type: 'trade_payout',
        amount: returnAmount,
        status: 'completed',
        date: new Date().toISOString(),
        details: `Payout for ${trade.asset} (${isWin ? 'Win' : 'Tie'})`
      });
    }

    return c.json({ success: true, trade, newBalance: returnAmount > 0 ? undefined : "unchanged" });
  } catch (error) {
    console.log(`Error closing trade: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user trades
app.get("/make-server-20da1dab/trades", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const allTrades = await kv.getByPrefix(`trade:${user.id}:`);
    const trades = allTrades.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());

    return c.json({ trades });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Transaction Handling
app.post("/make-server-20da1dab/payment/deposit", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { amount, method } = await c.req.json();
    if (!amount || amount <= 0) return c.json({ error: "Invalid amount" }, 400);

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) return c.json({ error: "User not found" }, 404);

    userProfile.balance += amount;
    await kv.set(`user:${user.id}`, userProfile);

    await kv.set(`tx:${user.id}:${Date.now()}`, {
      id: `tx-${Date.now()}`,
      userId: user.id,
      type: 'deposit',
      amount: amount,
      method: method || 'card',
      status: 'completed',
      date: new Date().toISOString()
    });

    return c.json({ success: true, newBalance: userProfile.balance });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/make-server-20da1dab/payment/withdraw", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { amount, method } = await c.req.json();
    if (!amount || amount <= 0) return c.json({ error: "Invalid amount" }, 400);

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) return c.json({ error: "User not found" }, 404);

    if (userProfile.balance < amount) {
      return c.json({ error: "Insufficient funds" }, 400);
    }

    userProfile.balance -= amount;
    await kv.set(`user:${user.id}`, userProfile);

    await kv.set(`tx:${user.id}:${Date.now()}`, {
      id: `tx-${Date.now()}`,
      userId: user.id,
      type: 'withdraw',
      amount: -amount,
      method: method || 'bank_transfer',
      status: 'pending',
      date: new Date().toISOString()
    });

    return c.json({ success: true, newBalance: userProfile.balance });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/make-server-20da1dab/transactions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const txs = await kv.getByPrefix(`tx:${user.id}:`);
    const transactions = txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({ transactions });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin Routes (Users, Trades, Balance - Keeping existing)
app.get("/make-server-20da1dab/admin/users", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    console.log("🔍 Admin users endpoint called");
    console.log("🔑 Token received:", accessToken ? accessToken.substring(0, 20) + "..." : "NONE");
    
    if (!accessToken) {
      console.log("❌ No token provided");
      return c.json({ code: 401, message: "No authorization token provided" }, 401);
    }

    // Verify JWT with Supabase
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);
    
    if (authError) {
      console.log("❌ JWT verification failed:", authError.message);
      return c.json({ code: 401, message: "Invalid JWT" }, 401);
    }
    
    if (!user) {
      console.log("❌ No user found for token");
      return c.json({ code: 401, message: "Invalid JWT" }, 401);
    }

    console.log("✅ User authenticated:", user.id);

    // Check if user is admin
    const adminProfile = await kv.get(`user:${user.id}`);
    
    if (!adminProfile) {
      console.log("❌ User profile not found in KV store");
      return c.json({ code: 403, message: "Forbidden - No profile found" }, 403);
    }
    
    if (adminProfile.role !== 'admin') {
      console.log("❌ User is not admin, role:", adminProfile.role);
      return c.json({ code: 403, message: "Forbidden - Admin access required" }, 403);
    }

    console.log("✅ Admin access granted");

    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    console.log("✅ Users fetched:", allUsers.length);
    
    return c.json({ users: allUsers });
  } catch (error: any) {
    console.error("❌ Error in admin/users:", error.message);
    return c.json({ code: 500, message: "Internal server error", error: error.message }, 500);
  }
});

app.get("/make-server-20da1dab/admin/trades", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const allTrades = await kv.getByPrefix('trade:');
    const trades = allTrades.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
    return c.json({ trades });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/make-server-20da1dab/admin/user/balance", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { userId, balance } = await c.req.json();
    if (!userId || balance === undefined) return c.json({ error: "Missing required fields" }, 400);

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) return c.json({ error: "User not found" }, 404);

    userProfile.balance = balance;
    await kv.set(`user:${userId}`, userProfile);

    return c.json({ success: true, user: userProfile });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/make-server-20da1dab/admin/stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const allUsers = await kv.getByPrefix('user:');
    const allTrades = await kv.getByPrefix('trade:');

    const totalUsers = allUsers.length;
    const totalTrades = allTrades.length;
    const activeTrades = allTrades.filter(t => t.status === 'open').length;
    const closedTrades = allTrades.filter(t => t.status === 'closed').length;
    const totalVolume = allTrades.reduce((sum, trade) => sum + trade.amount, 0);
    const totalProfit = allTrades.filter(t => t.status === 'closed').reduce((sum, trade) => sum + (trade.profit || 0), 0);

    return c.json({ 
      stats: { totalUsers, totalTrades, activeTrades, closedTrades, totalVolume, totalProfit }
    });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Approve Member
app.post("/make-server-20da1dab/admin/user/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { userId } = await c.req.json();
    if (!userId) return c.json({ error: "Missing userId" }, 400);

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) return c.json({ error: "User not found" }, 404);

    userProfile.status = 'active';
    userProfile.approvedAt = new Date().toISOString();
    userProfile.approvedBy = user.id;
    await kv.set(`user:${userId}`, userProfile);

    return c.json({ success: true, user: userProfile });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Reject Member
app.post("/make-server-20da1dab/admin/user/reject", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { userId, reason } = await c.req.json();
    if (!userId) return c.json({ error: "Missing userId" }, 400);

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) return c.json({ error: "User not found" }, 404);

    userProfile.status = 'rejected';
    userProfile.rejectedAt = new Date().toISOString();
    userProfile.rejectedBy = user.id;
    userProfile.rejectionReason = reason || 'No reason provided';
    await kv.set(`user:${userId}`, userProfile);

    return c.json({ success: true, user: userProfile });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// News API endpoint - fetch financial news from NewsAPI.org
app.get("/make-server-20da1dab/news", async (c) => {
  try {
    const category = c.req.query('category') || 'business';
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('pageSize') || '20');
    const search = c.req.query('search') || '';

    const apiKey = Deno.env.get('NEWS_API_KEY');
    
    if (!apiKey) {
      console.log("NEWS_API_KEY not configured, returning mock data");
      // Return mock data if API key is not configured
      return c.json({ 
        articles: getMockNewsArticles(page, pageSize, category, search),
        totalResults: 1000,
        page,
        pageSize
      });
    }

    // Build NewsAPI URL
    let url = 'https://newsapi.org/v2/';
    
    if (search) {
      // Use everything endpoint for search
      url += `everything?q=${encodeURIComponent(search)}&language=en&sortBy=publishedAt`;
    } else {
      // Use top-headlines for category
      const categoryMap: Record<string, string> = {
        'all': 'business',
        'stocks': 'business',
        'forex': 'business',
        'crypto': 'technology',
        'commodities': 'business',
        'economy': 'business'
      };
      
      url += `top-headlines?category=${categoryMap[category] || 'business'}&language=en`;
    }
    
    url += `&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error') {
      console.log(`NewsAPI error: ${data.message}`);
      return c.json({ 
        articles: getMockNewsArticles(page, pageSize, category, search),
        totalResults: 1000,
        page,
        pageSize
      });
    }

    return c.json({
      articles: data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
        source: article.source.name,
        publishedAt: article.publishedAt,
        author: article.author || 'Unknown',
        content: article.content
      })),
      totalResults: data.totalResults,
      page,
      pageSize
    });
  } catch (error) {
    console.log(`Error fetching news: ${error}`);
    // Return mock data on error
    const category = c.req.query('category') || 'business';
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('pageSize') || '20');
    const search = c.req.query('search') || '';
    
    return c.json({ 
      articles: getMockNewsArticles(page, pageSize, category, search),
      totalResults: 1000,
      page,
      pageSize
    });
  }
});

// Mock news data generator
function getMockNewsArticles(page: number, pageSize: number, category: string, search: string) {
  const templates = [
    {
      title: "Global Markets Rally on Positive Economic Data",
      description: "Stock markets worldwide surge as latest economic indicators exceed expectations.",
      source: "Financial Times",
      category: "stocks"
    },
    {
      title: "Federal Reserve Hints at Potential Rate Adjustments",
      description: "Central bank officials suggest monetary policy changes may be on the horizon.",
      source: "Bloomberg",
      category: "forex"
    },
    {
      title: "Bitcoin Breaks Through Key Resistance Level",
      description: "Leading cryptocurrency shows strong momentum amid institutional adoption.",
      source: "CoinDesk",
      category: "crypto"
    },
    {
      title: "Oil Prices Stabilize After Volatile Trading Session",
      description: "Energy markets find equilibrium as supply concerns ease globally.",
      source: "Reuters",
      category: "commodities"
    },
    {
      title: "Tech Giants Report Stronger Than Expected Earnings",
      description: "Major technology companies exceed analyst estimates in latest quarter.",
      source: "CNBC",
      category: "stocks"
    },
    {
      title: "Ethereum Network Upgrade Successfully Implemented",
      description: "Major blockchain update reduces transaction costs and improves scalability.",
      source: "CoinTelegraph",
      category: "crypto"
    },
    {
      title: "Gold Reaches New Multi-Month High on Safe Haven Demand",
      description: "Precious metals attract investors seeking protection amid market uncertainty.",
      source: "Kitco News",
      category: "commodities"
    },
    {
      title: "European Central Bank Maintains Accommodative Stance",
      description: "ECB keeps interest rates unchanged, pledges continued support for economy.",
      source: "Financial Times",
      category: "forex"
    },
    {
      title: "S&P 500 Companies Show Resilient Profit Margins",
      description: "Corporate earnings demonstrate strength despite economic headwinds.",
      source: "Wall Street Journal",
      category: "stocks"
    },
    {
      title: "Cryptocurrency Regulation Framework Takes Shape",
      description: "Governments worldwide move toward comprehensive digital asset oversight.",
      source: "Bloomberg",
      category: "crypto"
    }
  ];

  const articles = [];
  const startIndex = (page - 1) * pageSize;
  
  // Generate articles matching criteria
  for (let i = 0; i < pageSize; i++) {
    const templateIndex = (startIndex + i) % templates.length;
    const template = templates[templateIndex];
    const articleNumber = startIndex + i + 1;
    
    // Filter by category if not 'all'
    if (category !== 'all' && category !== 'business') {
      // Only include articles from matching category
      const matchingTemplates = templates.filter(t => t.category === category);
      if (matchingTemplates.length === 0) continue;
      
      const matchedTemplate = matchingTemplates[i % matchingTemplates.length];
      articles.push({
        title: `${matchedTemplate.title}`,
        description: matchedTemplate.description,
        url: `https://example.com/news/${articleNumber}`,
        image: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80`,
        source: matchedTemplate.source,
        publishedAt: new Date(Date.now() - (articleNumber * 3600000)).toISOString(),
        author: `Financial Analyst`,
        content: `${matchedTemplate.description} This is a comprehensive article covering the latest developments in ${matchedTemplate.category} markets. Stay tuned for more updates as the situation develops.`
      });
      continue;
    }
    
    // Filter by search if specified
    if (search && 
        !template.title.toLowerCase().includes(search.toLowerCase()) && 
        !template.description.toLowerCase().includes(search.toLowerCase())) {
      continue;
    }
    
    articles.push({
      title: `${template.title}`,
      description: template.description,
      url: `https://example.com/news/${articleNumber}`,
      image: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80`,
      source: template.source,
      publishedAt: new Date(Date.now() - (articleNumber * 3600000)).toISOString(),
      author: `Financial Analyst ${(articleNumber % 10) + 1}`,
      content: `${template.description} This is a comprehensive article covering the latest developments in ${template.category} markets. Detailed analysis shows significant market movements across various sectors. Investors are closely monitoring these developments as they could signal broader economic trends. Stay tuned for more updates as the situation develops.`
    });
  }
  
  return articles;
}

// ========================================
// DEPOSITS ENDPOINTS
// ========================================

// Member: Submit Deposit Request
app.post("/make-server-20da1dab/deposits/create", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { amount, method, proofImage } = await c.req.json();
    if (!amount || !method) return c.json({ error: "Amount and method required" }, 400);

    const depositId = `deposit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const deposit = {
      id: depositId,
      userId: user.id,
      amount: Number(amount),
      method,
      proofImage: proofImage || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`deposit:${depositId}`, deposit);
    
    return c.json({ success: true, deposit });
  } catch (error) {
    console.log(`Error creating deposit: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Member: Get My Deposits
app.get("/make-server-20da1dab/deposits/my", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const allDeposits = await kv.getByPrefix('deposit:');
    const myDeposits = allDeposits
      .filter((d: any) => d.userId === user.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ deposits: myDeposits });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Get All Deposits
app.get("/make-server-20da1dab/admin/deposits", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const allDeposits = await kv.getByPrefix('deposit:');
    const deposits = allDeposits.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Enrich with user data
    const enrichedDeposits = await Promise.all(deposits.map(async (d: any) => {
      const userProfile = await kv.get(`user:${d.userId}`);
      return {
        ...d,
        userName: userProfile?.name || 'Unknown',
        userEmail: userProfile?.email || 'Unknown'
      };
    }));
    
    return c.json({ deposits: enrichedDeposits });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Approve Deposit
app.post("/make-server-20da1dab/admin/deposits/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { depositId } = await c.req.json();
    if (!depositId) return c.json({ error: "depositId required" }, 400);

    const deposit = await kv.get(`deposit:${depositId}`);
    if (!deposit) return c.json({ error: "Deposit not found" }, 404);

    // Update deposit status
    deposit.status = 'approved';
    deposit.approvedAt = new Date().toISOString();
    deposit.approvedBy = user.id;
    deposit.updatedAt = new Date().toISOString();
    await kv.set(`deposit:${depositId}`, deposit);

    // Add balance to user
    const userProfile = await kv.get(`user:${deposit.userId}`);
    if (userProfile) {
      userProfile.balance = (userProfile.balance || 0) + deposit.amount;
      await kv.set(`user:${deposit.userId}`, userProfile);
    }

    return c.json({ success: true, deposit });
  } catch (error) {
    console.log(`Error approving deposit: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Reject Deposit
app.post("/make-server-20da1dab/admin/deposits/reject", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { depositId, reason } = await c.req.json();
    if (!depositId) return c.json({ error: "depositId required" }, 400);

    const deposit = await kv.get(`deposit:${depositId}`);
    if (!deposit) return c.json({ error: "Deposit not found" }, 404);

    deposit.status = 'rejected';
    deposit.rejectedAt = new Date().toISOString();
    deposit.rejectedBy = user.id;
    deposit.rejectionReason = reason || 'No reason provided';
    deposit.updatedAt = new Date().toISOString();
    await kv.set(`deposit:${depositId}`, deposit);

    return c.json({ success: true, deposit });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ========================================
// WITHDRAWALS ENDPOINTS
// ========================================

// Member: Submit Withdrawal Request
app.post("/make-server-20da1dab/withdrawals/create", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { amount, method, accountDetails } = await c.req.json();
    if (!amount || !method || !accountDetails) {
      return c.json({ error: "Amount, method, and account details required" }, 400);
    }

    // Check user balance
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.balance < amount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }

    const withdrawalId = `withdrawal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const withdrawal = {
      id: withdrawalId,
      userId: user.id,
      amount: Number(amount),
      method,
      accountDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`withdrawal:${withdrawalId}`, withdrawal);
    
    // Deduct balance immediately (will be returned if rejected)
    userProfile.balance -= Number(amount);
    await kv.set(`user:${user.id}`, userProfile);
    
    return c.json({ success: true, withdrawal });
  } catch (error) {
    console.log(`Error creating withdrawal: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Member: Get My Withdrawals
app.get("/make-server-20da1dab/withdrawals/my", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const allWithdrawals = await kv.getByPrefix('withdrawal:');
    const myWithdrawals = allWithdrawals
      .filter((w: any) => w.userId === user.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ withdrawals: myWithdrawals });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Get All Withdrawals
app.get("/make-server-20da1dab/admin/withdrawals", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const allWithdrawals = await kv.getByPrefix('withdrawal:');
    const withdrawals = allWithdrawals.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Enrich with user data
    const enrichedWithdrawals = await Promise.all(withdrawals.map(async (w: any) => {
      const userProfile = await kv.get(`user:${w.userId}`);
      return {
        ...w,
        userName: userProfile?.name || 'Unknown',
        userEmail: userProfile?.email || 'Unknown'
      };
    }));
    
    return c.json({ withdrawals: enrichedWithdrawals });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Approve Withdrawal
app.post("/make-server-20da1dab/admin/withdrawals/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { withdrawalId } = await c.req.json();
    if (!withdrawalId) return c.json({ error: "withdrawalId required" }, 400);

    const withdrawal = await kv.get(`withdrawal:${withdrawalId}`);
    if (!withdrawal) return c.json({ error: "Withdrawal not found" }, 404);

    withdrawal.status = 'approved';
    withdrawal.approvedAt = new Date().toISOString();
    withdrawal.approvedBy = user.id;
    withdrawal.updatedAt = new Date().toISOString();
    await kv.set(`withdrawal:${withdrawalId}`, withdrawal);

    return c.json({ success: true, withdrawal });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Reject Withdrawal
app.post("/make-server-20da1dab/admin/withdrawals/reject", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { withdrawalId, reason } = await c.req.json();
    if (!withdrawalId) return c.json({ error: "withdrawalId required" }, 400);

    const withdrawal = await kv.get(`withdrawal:${withdrawalId}`);
    if (!withdrawal) return c.json({ error: "Withdrawal not found" }, 404);

    withdrawal.status = 'rejected';
    withdrawal.rejectedAt = new Date().toISOString();
    withdrawal.rejectedBy = user.id;
    withdrawal.rejectionReason = reason || 'No reason provided';
    withdrawal.updatedAt = new Date().toISOString();
    await kv.set(`withdrawal:${withdrawalId}`, withdrawal);

    // Return balance to user
    const userProfile = await kv.get(`user:${withdrawal.userId}`);
    if (userProfile) {
      userProfile.balance = (userProfile.balance || 0) + withdrawal.amount;
      await kv.set(`user:${withdrawal.userId}`, userProfile);
    }

    return c.json({ success: true, withdrawal });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ========================================
// KYC ENDPOINTS
// ========================================

// Member: Submit KYC
app.post("/make-server-20da1dab/kyc/submit", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { fullName, idNumber, idType, frontImage, backImage, selfieImage } = await c.req.json();
    if (!fullName || !idNumber || !idType || !frontImage || !backImage || !selfieImage) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const kycId = `kyc_${user.id}_${Date.now()}`;
    const kyc = {
      id: kycId,
      userId: user.id,
      fullName,
      idNumber,
      idType,
      frontImage,
      backImage,
      selfieImage,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`kyc:${kycId}`, kyc);
    
    return c.json({ success: true, kyc });
  } catch (error) {
    console.log(`Error submitting KYC: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Member: Get My KYC
app.get("/make-server-20da1dab/kyc/my", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const allKyc = await kv.getByPrefix('kyc:');
    const myKyc = allKyc.find((k: any) => k.userId === user.id);
    
    return c.json({ kyc: myKyc || null });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Get All KYC
app.get("/make-server-20da1dab/admin/kyc", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const allKyc = await kv.getByPrefix('kyc:');
    const kycList = allKyc.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Enrich with user data
    const enrichedKyc = await Promise.all(kycList.map(async (k: any) => {
      const userProfile = await kv.get(`user:${k.userId}`);
      return {
        ...k,
        userName: userProfile?.name || 'Unknown',
        userEmail: userProfile?.email || 'Unknown'
      };
    }));
    
    return c.json({ kyc: enrichedKyc });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Approve KYC
app.post("/make-server-20da1dab/admin/kyc/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { kycId } = await c.req.json();
    if (!kycId) return c.json({ error: "kycId required" }, 400);

    const kyc = await kv.get(`kyc:${kycId}`);
    if (!kyc) return c.json({ error: "KYC not found" }, 404);

    kyc.status = 'approved';
    kyc.approvedAt = new Date().toISOString();
    kyc.approvedBy = user.id;
    kyc.updatedAt = new Date().toISOString();
    await kv.set(`kyc:${kycId}`, kyc);

    // Update user profile
    const userProfile = await kv.get(`user:${kyc.userId}`);
    if (userProfile) {
      userProfile.kycStatus = 'verified';
      userProfile.kycVerifiedAt = new Date().toISOString();
      await kv.set(`user:${kyc.userId}`, userProfile);
    }

    return c.json({ success: true, kyc });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Reject KYC
app.post("/make-server-20da1dab/admin/kyc/reject", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { kycId, reason } = await c.req.json();
    if (!kycId) return c.json({ error: "kycId required" }, 400);

    const kyc = await kv.get(`kyc:${kycId}`);
    if (!kyc) return c.json({ error: "KYC not found" }, 404);

    kyc.status = 'rejected';
    kyc.rejectedAt = new Date().toISOString();
    kyc.rejectedBy = user.id;
    kyc.rejectionReason = reason || 'No reason provided';
    kyc.updatedAt = new Date().toISOString();
    await kv.set(`kyc:${kycId}`, kyc);

    return c.json({ success: true, kyc });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ================== REAL MONEY TRADING ENDPOINTS ==================

// Get user wallet (real money balance)
app.get("/make-server-20da1dab/wallet", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    // Get or initialize wallet
    let wallet = await kv.get(`wallet:${user.id}`);
    if (!wallet) {
      wallet = {
        userId: user.id,
        realBalance: 0,
        lockedBalance: 0,
        bonusBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalProfits: 0,
        totalLosses: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await kv.set(`wallet:${user.id}`, wallet);
    }

    const totalEquity = wallet.realBalance + wallet.lockedBalance + wallet.bonusBalance;

    return c.json({ 
      wallet: {
        ...wallet,
        availableBalance: wallet.realBalance,
        totalEquity
      }
    });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create deposit request
app.post("/make-server-20da1dab/deposit/create", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { amount, method, proofUrl } = await c.req.json();
    
    if (!amount || amount <= 0) {
      return c.json({ error: "Invalid amount" }, 400);
    }

    if (!method) {
      return c.json({ error: "Payment method required" }, 400);
    }

    const depositId = `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const deposit = {
      depositId,
      userId: user.id,
      amount,
      method,
      proofUrl: proofUrl || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null
    };

    await kv.set(`deposit:${depositId}`, deposit);

    return c.json({ success: true, deposit });
  } catch (error) {
    console.error("Create deposit error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user deposits
app.get("/make-server-20da1dab/deposits", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const allDeposits = await kv.getByPrefix(`deposit:`);
    const userDeposits = allDeposits.filter((d: any) => d.userId === user.id);
    
    // Sort by date, newest first
    userDeposits.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ deposits: userDeposits });
  } catch (error) {
    console.error("Get deposits error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create withdrawal request
app.post("/make-server-20da1dab/withdraw/create", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { amount, method, accountDetails } = await c.req.json();
    
    if (!amount || amount <= 0) {
      return c.json({ error: "Invalid amount" }, 400);
    }

    if (!method || !accountDetails) {
      return c.json({ error: "Method and account details required" }, 400);
    }

    // Check wallet balance
    const wallet = await kv.get(`wallet:${user.id}`);
    if (!wallet || wallet.realBalance < amount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }

    // Minimum withdrawal check
    const MIN_WITHDRAWAL = 10;
    if (amount < MIN_WITHDRAWAL) {
      return c.json({ error: `Minimum withdrawal is $${MIN_WITHDRAWAL}` }, 400);
    }

    const withdrawalId = `wd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Lock the funds
    wallet.realBalance -= amount;
    wallet.lockedBalance += amount;
    wallet.updatedAt = new Date().toISOString();
    await kv.set(`wallet:${user.id}`, wallet);

    const withdrawal = {
      withdrawalId,
      userId: user.id,
      amount,
      method,
      accountDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
      paidAt: null
    };

    await kv.set(`withdrawal:${withdrawalId}`, withdrawal);

    return c.json({ success: true, withdrawal });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user withdrawals
app.get("/make-server-20da1dab/withdrawals", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const allWithdrawals = await kv.getByPrefix(`withdrawal:`);
    const userWithdrawals = allWithdrawals.filter((w: any) => w.userId === user.id);
    
    // Sort by date, newest first
    userWithdrawals.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ withdrawals: userWithdrawals });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Execute real money trade
app.post("/make-server-20da1dab/trade/real", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    // Check KYC status
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) return c.json({ error: "User not found" }, 404);
    
    if (userProfile.kycStatus !== 'verified') {
      return c.json({ error: "KYC verification required for real money trading" }, 403);
    }

    const { symbol, direction, amount, duration } = await c.req.json();

    // Validate inputs
    if (!symbol || !direction || !amount || !duration) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (amount <= 0 || amount > 100000) {
      return c.json({ error: "Invalid trade amount" }, 400);
    }

    // Check wallet balance
    const wallet = await kv.get(`wallet:${user.id}`);
    if (!wallet || wallet.realBalance < amount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }

    // Get asset config for payout
    const assets = await kv.get("config:assets") || DEFAULT_ASSETS;
    const asset = assets.find((a: any) => a.symbol === symbol);
    if (!asset) {
      return c.json({ error: "Asset not found" }, 400);
    }

    // Deduct from balance and add to locked
    wallet.realBalance -= amount;
    wallet.lockedBalance += amount;
    wallet.updatedAt = new Date().toISOString();
    await kv.set(`wallet:${user.id}`, wallet);

    // Get current price
    const entryPrice = await getMarketPrice(symbol);

    const tradeId = `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiryTime = Date.now() + duration * 1000;

    const trade = {
      tradeId,
      userId: user.id,
      symbol,
      direction,
      amount,
      duration,
      entryPrice,
      entryTime: Date.now(),
      expiryTime,
      payout: asset.payout,
      status: 'active',
      result: null,
      exitPrice: null,
      profit: null,
      createdAt: new Date().toISOString(),
      closedAt: null,
      accountType: 'real'
    };

    await kv.set(`trade:real:${tradeId}`, trade);

    return c.json({ success: true, trade });
  } catch (error) {
    console.error("Real trade error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get active real trades
app.get("/make-server-20da1dab/trades/real/active", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const allTrades = await kv.getByPrefix(`trade:real:`);
    const userActiveTrades = allTrades.filter((t: any) => 
      t.userId === user.id && t.status === 'active'
    );

    return c.json({ trades: userActiveTrades });
  } catch (error) {
    console.error("Get active trades error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get closed real trades
app.get("/make-server-20da1dab/trades/real/closed", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const allTrades = await kv.getByPrefix(`trade:real:`);
    const userClosedTrades = allTrades.filter((t: any) => 
      t.userId === user.id && t.status === 'closed'
    );

    // Sort by closed date, newest first
    userClosedTrades.sort((a: any, b: any) => 
      new Date(b.closedAt || 0).getTime() - new Date(a.closedAt || 0).getTime()
    );

    return c.json({ trades: userClosedTrades });
  } catch (error) {
    console.error("Get closed trades error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Close expired real trades (called by cron or manual check)
app.post("/make-server-20da1dab/trades/real/check-expired", async (c) => {
  try {
    const allTrades = await kv.getByPrefix(`trade:real:`);
    const now = Date.now();
    let closedCount = 0;

    for (const trade of allTrades) {
      if (trade.status === 'active' && trade.expiryTime <= now) {
        // Get exit price
        const exitPrice = await getMarketPrice(trade.symbol);
        
        // Determine result
        let result: 'win' | 'loss' | 'tie' = 'tie';
        if (trade.direction === 'up' && exitPrice > trade.entryPrice) {
          result = 'win';
        } else if (trade.direction === 'down' && exitPrice < trade.entryPrice) {
          result = 'win';
        } else if (exitPrice === trade.entryPrice) {
          result = 'tie';
        } else {
          result = 'loss';
        }

        // Calculate profit
        let profit = 0;
        if (result === 'win') {
          profit = trade.amount * (trade.payout / 100);
        } else if (result === 'tie') {
          profit = 0; // Return investment
        } else {
          profit = -trade.amount;
        }

        // Update trade
        trade.status = 'closed';
        trade.result = result;
        trade.exitPrice = exitPrice;
        trade.profit = profit;
        trade.closedAt = new Date().toISOString();
        await kv.set(`trade:real:${trade.tradeId}`, trade);

        // Update wallet
        const wallet = await kv.get(`wallet:${trade.userId}`);
        if (wallet) {
          wallet.lockedBalance -= trade.amount;
          
          if (result === 'win') {
            wallet.realBalance += trade.amount + profit;
            wallet.totalProfits += profit;
          } else if (result === 'tie') {
            wallet.realBalance += trade.amount;
          } else {
            wallet.totalLosses += trade.amount;
          }
          
          wallet.updatedAt = new Date().toISOString();
          await kv.set(`wallet:${trade.userId}`, wallet);
        }

        closedCount++;
      }
    }

    return c.json({ success: true, closedCount });
  } catch (error) {
    console.error("Check expired trades error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Approve deposit
app.post("/make-server-20da1dab/admin/deposit/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const { depositId } = await c.req.json();
    if (!depositId) return c.json({ error: "depositId required" }, 400);

    const deposit = await kv.get(`deposit:${depositId}`);
    if (!deposit) return c.json({ error: "Deposit not found" }, 404);

    if (deposit.status !== 'pending') {
      return c.json({ error: "Deposit already processed" }, 400);
    }

    // Update deposit status
    deposit.status = 'approved';
    deposit.approvedAt = new Date().toISOString();
    deposit.approvedBy = user.id;
    deposit.updatedAt = new Date().toISOString();
    await kv.set(`deposit:${depositId}`, deposit);

    // Update wallet
    const wallet = await kv.get(`wallet:${deposit.userId}`);
    if (wallet) {
      wallet.realBalance += deposit.amount;
      wallet.totalDeposits += deposit.amount;
      wallet.updatedAt = new Date().toISOString();
      await kv.set(`wallet:${deposit.userId}`, wallet);
    }

    return c.json({ success: true, deposit });
  } catch (error) {
    console.error("Approve deposit error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Reject deposit
app.post("/make-server-20da1dab/admin/deposit/reject", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const { depositId, reason } = await c.req.json();
    if (!depositId) return c.json({ error: "depositId required" }, 400);

    const deposit = await kv.get(`deposit:${depositId}`);
    if (!deposit) return c.json({ error: "Deposit not found" }, 404);

    deposit.status = 'rejected';
    deposit.rejectedAt = new Date().toISOString();
    deposit.rejectedBy = user.id;
    deposit.rejectionReason = reason || 'No reason provided';
    deposit.updatedAt = new Date().toISOString();
    await kv.set(`deposit:${depositId}`, deposit);

    return c.json({ success: true, deposit });
  } catch (error) {
    console.error("Reject deposit error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Approve withdrawal
app.post("/make-server-20da1dab/admin/withdrawal/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const { withdrawalId } = await c.req.json();
    if (!withdrawalId) return c.json({ error: "withdrawalId required" }, 400);

    const withdrawal = await kv.get(`withdrawal:${withdrawalId}`);
    if (!withdrawal) return c.json({ error: "Withdrawal not found" }, 404);

    if (withdrawal.status !== 'pending') {
      return c.json({ error: "Withdrawal already processed" }, 400);
    }

    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.approvedAt = new Date().toISOString();
    withdrawal.approvedBy = user.id;
    withdrawal.paidAt = new Date().toISOString();
    withdrawal.updatedAt = new Date().toISOString();
    await kv.set(`withdrawal:${withdrawalId}`, withdrawal);

    // Update wallet - remove from locked balance
    const wallet = await kv.get(`wallet:${withdrawal.userId}`);
    if (wallet) {
      wallet.lockedBalance -= withdrawal.amount;
      wallet.totalWithdrawals += withdrawal.amount;
      wallet.updatedAt = new Date().toISOString();
      await kv.set(`wallet:${withdrawal.userId}`, wallet);
    }

    return c.json({ success: true, withdrawal });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: Reject withdrawal
app.post("/make-server-20da1dab/admin/withdrawal/reject", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const { withdrawalId, reason } = await c.req.json();
    if (!withdrawalId) return c.json({ error: "withdrawalId required" }, 400);

    const withdrawal = await kv.get(`withdrawal:${withdrawalId}`);
    if (!withdrawal) return c.json({ error: "Withdrawal not found" }, 404);

    if (withdrawal.status !== 'pending') {
      return c.json({ error: "Withdrawal already processed" }, 400);
    }

    // Update withdrawal status
    withdrawal.status = 'rejected';
    withdrawal.rejectedAt = new Date().toISOString();
    withdrawal.rejectedBy = user.id;
    withdrawal.rejectionReason = reason || 'No reason provided';
    withdrawal.updatedAt = new Date().toISOString();
    await kv.set(`withdrawal:${withdrawalId}`, withdrawal);

    // Return funds to available balance
    const wallet = await kv.get(`wallet:${withdrawal.userId}`);
    if (wallet) {
      wallet.lockedBalance -= withdrawal.amount;
      wallet.realBalance += withdrawal.amount;
      wallet.updatedAt = new Date().toISOString();
      await kv.set(`wallet:${withdrawal.userId}`, wallet);
    }

    return c.json({ success: true, withdrawal });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);