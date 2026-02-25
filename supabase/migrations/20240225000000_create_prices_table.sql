-- ✅ CREATE PRICES TABLE - SINGLE SOURCE OF TRUTH
-- Stores real-time prices from Binance updated every 1-2 seconds

CREATE TABLE IF NOT EXISTS public.prices (
  symbol TEXT PRIMARY KEY,
  price NUMERIC NOT NULL,
  source TEXT NOT NULL DEFAULT 'binance',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read prices (public data)
CREATE POLICY "Anyone can read prices"
  ON public.prices
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update prices
CREATE POLICY "Service role can insert/update prices"
  ON public.prices
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_prices_symbol ON public.prices(symbol);
CREATE INDEX IF NOT EXISTS idx_prices_updated_at ON public.prices(updated_at DESC);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.prices;

-- Insert initial prices for common symbols
INSERT INTO public.prices (symbol, price, source, updated_at) VALUES
  ('BTCUSDT', 94500.00, 'binance', NOW()),
  ('ETHUSDT', 3380.00, 'binance', NOW()),
  ('BNBUSDT', 625.00, 'binance', NOW()),
  ('SOLUSDT', 196.00, 'binance', NOW()),
  ('XRPUSDT', 2.45, 'binance', NOW()),
  ('ADAUSDT', 0.89, 'binance', NOW()),
  ('DOGEUSDT', 0.32, 'binance', NOW()),
  ('MATICUSDT', 0.78, 'binance', NOW()),
  ('DOTUSDT', 7.45, 'binance', NOW()),
  ('TRXUSDT', 0.24, 'binance', NOW())
ON CONFLICT (symbol) DO NOTHING;
