-- ✅ CREATE TRADES TABLE
-- Stores all trading positions with entry_price from backend

CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  asset TEXT NOT NULL,
  symbol TEXT NOT NULL, -- Normalized symbol (BTCUSDT)
  type TEXT NOT NULL CHECK (type IN ('UP', 'DOWN')),
  amount NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL, -- ✅ Set by backend from prices table!
  exit_price NUMERIC,
  duration INTEGER NOT NULL, -- in seconds
  account_type TEXT NOT NULL CHECK (account_type IN ('demo', 'real')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  profit NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own trades
CREATE POLICY "Users can read own trades"
  ON public.trades
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own trades
CREATE POLICY "Users can insert own trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own trades
CREATE POLICY "Users can update own trades"
  ON public.trades
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage all trades"
  ON public.trades
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON public.trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON public.trades(symbol);
