import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

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
  
  try {
    // ✅ FAST: Use Promise.race to ensure KV doesn't block forever
    const cached = await Promise.race([
      kv.get(cacheKey),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)) // 500ms max for KV lookup
    ]);
    
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
    
    // ✅ FAST: Fire-and-forget KV save (don't wait for it)
    kv.set(cacheKey, { price: newPrice, timestamp: now }).catch(() => {
      // Ignore KV errors - price generation still works
    });
    
    return Number(newPrice.toFixed(symbol.includes("USD") && !symbol.includes("BTC") && !symbol.includes("ETH") ? 5 : 2));
  } catch (error) {
    // ✅ FALLBACK: If KV fails entirely, just return base price with random walk
    console.warn(`⚠️ [getMarketPrice] KV error for ${symbol}, using fallback`);
    const basePrice = getBasePrice(symbol);
    const volatility = getVolatility(symbol);
    const change = (Math.random() - 0.5) * volatility * basePrice;
    return Number((basePrice + change).toFixed(symbol.includes("USD") && !symbol.includes("BTC") && !symbol.includes("ETH") ? 5 : 2));
  }
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

// Get Price
app.get("/make-server-20da1dab/price", async (c) => {
  try {
    const symbol = c.req.query('symbol');
    if (!symbol) return c.json({ error: "Symbol required" }, 400);
    
    console.log(`💰 [Price API] Fetching price for: ${symbol}`);
    
    // ✅ FAST: Try to get price with 1 second timeout (reduced from 3 seconds)
    const price = await Promise.race([
      getMarketPrice(symbol),
      new Promise<number>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1000) // 1 second only!
      )
    ]);
    
    console.log(`✅ [Price API] ${symbol}: $${price}`);
    return c.json({ symbol, price, source: 'backend', timestamp: Date.now() });
  } catch (error: any) {
    console.warn(`⚠️ [Price API Timeout] ${c.req.query('symbol')}: Using fallback price`);
    
    // ✅ FAST: Fallback to base price immediately if timeout
    const symbol = c.req.query('symbol') || '';
    const fallbackPrice = getBasePrice(symbol);
    return c.json({ symbol, price: fallbackPrice, source: 'fallback', timestamp: Date.now() });
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
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const { data: { user } } = await supabaseAnon.auth.getUser(accessToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const allUsers = await kv.getByPrefix('user:');
    return c.json({ users: allUsers });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
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

Deno.serve(app.fetch);