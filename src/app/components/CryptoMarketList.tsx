import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface CryptoData {
  rank: number;
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  previous_price?: number; // Track previous price for animation
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  sparkline_in_7d: { price: number[] };
}

// Mock data as fallback
const MOCK_CRYPTO_DATA: CryptoData[] = [
  {
    rank: 1,
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    current_price: 69040.53,
    price_change_percentage_1h_in_currency: 0.45,
    price_change_percentage_24h_in_currency: 5.23,
    price_change_percentage_7d_in_currency: 8.67,
    market_cap: 1376719629918,
    total_volume: 43852184263,
    circulating_supply: 19980000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 65000 + Math.random() * 8000) }
  },
  {
    rank: 2,
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    current_price: 2052.72,
    price_change_percentage_1h_in_currency: -0.17,
    price_change_percentage_24h_in_currency: 7.46,
    price_change_percentage_7d_in_currency: 9.57,
    market_cap: 247648445445,
    total_volume: 21043008243,
    circulating_supply: 120690000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 1900 + Math.random() * 300) }
  },
  {
    rank: 3,
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    current_price: 616.08,
    price_change_percentage_1h_in_currency: 0.02,
    price_change_percentage_24h_in_currency: 2.08,
    price_change_percentage_7d_in_currency: 6.90,
    market_cap: 84008587051,
    total_volume: 1234000000,
    circulating_supply: 136350000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 580 + Math.random() * 60) }
  },
  {
    rank: 4,
    id: "ripple",
    symbol: "xrp",
    name: "XRP",
    image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    current_price: 1.41,
    price_change_percentage_1h_in_currency: -0.24,
    price_change_percentage_24h_in_currency: 3.72,
    price_change_percentage_7d_in_currency: 5.44,
    market_cap: 86098833505,
    total_volume: 2774982391,
    circulating_supply: 60918000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 1.3 + Math.random() * 0.2) }
  },
  {
    rank: 5,
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    current_price: 84.28,
    price_change_percentage_1h_in_currency: 0.10,
    price_change_percentage_24h_in_currency: 8.20,
    price_change_percentage_7d_in_currency: 9.83,
    market_cap: 47801745166,
    total_volume: 3850610934,
    circulating_supply: 567830000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 75 + Math.random() * 15) }
  },
  {
    rank: 6,
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    current_price: 0.2718,
    price_change_percentage_1h_in_currency: -0.51,
    price_change_percentage_24h_in_currency: 4.87,
    price_change_percentage_7d_in_currency: 3.13,
    market_cap: 9804090345,
    total_volume: 461913036,
    circulating_supply: 36060000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 0.25 + Math.random() * 0.04) }
  },
  {
    rank: 7,
    id: "dogecoin",
    symbol: "doge",
    name: "Dogecoin",
    image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    current_price: 0.09630,
    price_change_percentage_1h_in_currency: -0.11,
    price_change_percentage_24h_in_currency: 5.38,
    price_change_percentage_7d_in_currency: 3.85,
    market_cap: 16248989793,
    total_volume: 872371423,
    circulating_supply: 168720000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 0.088 + Math.random() * 0.015) }
  },
  {
    rank: 8,
    id: "tron",
    symbol: "trx",
    name: "TRON",
    image: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
    current_price: 0.2798,
    price_change_percentage_1h_in_currency: 0.25,
    price_change_percentage_24h_in_currency: 1.32,
    price_change_percentage_7d_in_currency: 2.51,
    market_cap: 26518851208,
    total_volume: 631417816,
    circulating_supply: 94720000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 0.26 + Math.random() * 0.035) }
  },
  {
    rank: 9,
    id: "polkadot",
    symbol: "dot",
    name: "Polkadot",
    image: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
    current_price: 8.45,
    price_change_percentage_1h_in_currency: 0.67,
    price_change_percentage_24h_in_currency: 3.12,
    price_change_percentage_7d_in_currency: 7.89,
    market_cap: 11000000000,
    total_volume: 456000000,
    circulating_supply: 1300000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 7.8 + Math.random() * 1.2) }
  },
  {
    rank: 10,
    id: "polygon",
    symbol: "matic",
    name: "Polygon",
    image: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
    current_price: 0.89,
    price_change_percentage_1h_in_currency: -0.34,
    price_change_percentage_24h_in_currency: 2.67,
    price_change_percentage_7d_in_currency: 9.12,
    market_cap: 8900000000,
    total_volume: 345000000,
    circulating_supply: 10000000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 0.82 + Math.random() * 0.14) }
  },
  {
    rank: 11,
    id: "litecoin",
    symbol: "ltc",
    name: "Litecoin",
    image: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
    current_price: 105.67,
    price_change_percentage_1h_in_currency: 0.23,
    price_change_percentage_24h_in_currency: 1.89,
    price_change_percentage_7d_in_currency: 4.56,
    market_cap: 7800000000,
    total_volume: 567000000,
    circulating_supply: 73800000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 100 + Math.random() * 10) }
  },
  {
    rank: 12,
    id: "shiba-inu",
    symbol: "shib",
    name: "Shiba Inu",
    image: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
    current_price: 0.00002456,
    price_change_percentage_1h_in_currency: -1.23,
    price_change_percentage_24h_in_currency: 8.45,
    price_change_percentage_7d_in_currency: 22.34,
    market_cap: 14500000000,
    total_volume: 890000000,
    circulating_supply: 589000000000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 0.000020 + Math.random() * 0.000008) }
  },
  {
    rank: 13,
    id: "avalanche-2",
    symbol: "avax",
    name: "Avalanche",
    image: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
    current_price: 42.89,
    price_change_percentage_1h_in_currency: 0.56,
    price_change_percentage_24h_in_currency: 3.45,
    price_change_percentage_7d_in_currency: 11.23,
    market_cap: 16700000000,
    total_volume: 678000000,
    circulating_supply: 389000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 38 + Math.random() * 8) }
  },
  {
    rank: 14,
    id: "chainlink",
    symbol: "link",
    name: "Chainlink",
    image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    current_price: 8.86,
    price_change_percentage_1h_in_currency: 0.89,
    price_change_percentage_24h_in_currency: 2.34,
    price_change_percentage_7d_in_currency: 6.78,
    market_cap: 5465338336,
    total_volume: 609545338,
    circulating_supply: 617000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 8.2 + Math.random() * 1.2) }
  },
  {
    rank: 15,
    id: "cosmos",
    symbol: "atom",
    name: "Cosmos Hub",
    image: "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
    current_price: 12.67,
    price_change_percentage_1h_in_currency: -0.45,
    price_change_percentage_24h_in_currency: 1.78,
    price_change_percentage_7d_in_currency: 5.23,
    market_cap: 4900000000,
    total_volume: 234000000,
    circulating_supply: 387000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 12 + Math.random() * 1.5) }
  },
  {
    rank: 16,
    id: "uniswap",
    symbol: "uni",
    name: "Uniswap",
    image: "https://assets.coingecko.com/coins/images/12504/small/uni.jpg",
    current_price: 14.23,
    price_change_percentage_1h_in_currency: 0.34,
    price_change_percentage_24h_in_currency: 2.89,
    price_change_percentage_7d_in_currency: 8.45,
    market_cap: 10700000000,
    total_volume: 345000000,
    circulating_supply: 752000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 13 + Math.random() * 2) }
  },
  {
    rank: 17,
    id: "ethereum-classic",
    symbol: "etc",
    name: "Ethereum Classic",
    image: "https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png",
    current_price: 32.45,
    price_change_percentage_1h_in_currency: -0.56,
    price_change_percentage_24h_in_currency: 1.23,
    price_change_percentage_7d_in_currency: 4.67,
    market_cap: 4800000000,
    total_volume: 189000000,
    circulating_supply: 147000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 30 + Math.random() * 4) }
  },
  {
    rank: 18,
    id: "stellar",
    symbol: "xlm",
    name: "Stellar",
    image: "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
    current_price: 0.34,
    price_change_percentage_1h_in_currency: 0.12,
    price_change_percentage_24h_in_currency: 3.45,
    price_change_percentage_7d_in_currency: 7.89,
    market_cap: 9800000000,
    total_volume: 234000000,
    circulating_supply: 28800000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 0.31 + Math.random() * 0.06) }
  },
  {
    rank: 19,
    id: "bitcoin-cash",
    symbol: "bch",
    name: "Bitcoin Cash",
    image: "https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png",
    current_price: 549.14,
    price_change_percentage_1h_in_currency: 0.65,
    price_change_percentage_24h_in_currency: 10.54,
    price_change_percentage_7d_in_currency: 10.11,
    market_cap: 10979698138,
    total_volume: 473112987,
    circulating_supply: 19990000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 490 + Math.random() * 80) }
  },
  {
    rank: 20,
    id: "near",
    symbol: "near",
    name: "NEAR Protocol",
    image: "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
    current_price: 6.78,
    price_change_percentage_1h_in_currency: -0.23,
    price_change_percentage_24h_in_currency: 4.56,
    price_change_percentage_7d_in_currency: 9.12,
    market_cap: 7400000000,
    total_volume: 234000000,
    circulating_supply: 1090000000,
    sparkline_in_7d: { price: Array(168).fill(0).map((_, i) => 6.2 + Math.random() * 1) }
  }
];

export function CryptoMarketList() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [usingMockData, setUsingMockData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCryptoData();
    // Refresh every 10 seconds for live prices (reduced from 30s)
    const interval = setInterval(() => {
      fetchCryptoData(false); // Don't show loading on refresh
    }, 10000);
    return () => clearInterval(interval);
  }, []); // Only fetch once on mount, then refresh every 10s

  const fetchCryptoData = async (showLoading = true) => {
    try {
      if (showLoading) {
        console.log("🔄 Fetching crypto data...");
      }
      
      // Try backend first - ONLY 100 coins, NO pagination
      try {
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/crypto?per_page=100&page=1`;
        console.log(`📡 [CryptoMarketList] Fetching top 100 cryptocurrencies from: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        console.log(`📡 [CryptoMarketList] Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📡 [CryptoMarketList] Received ${data.length} coins from API`);
          
          if (Array.isArray(data) && data.length > 0) {
            // Update prices with previous price tracking
            setCryptoData(prevData => {
              return data.map((newCoin: CryptoData) => {
                const oldCoin = prevData.find(c => c.id === newCoin.id);
                return {
                  ...newCoin,
                  previous_price: oldCoin?.current_price || newCoin.current_price
                };
              });
            });
            
            setLastUpdate(new Date());
            setUsingMockData(false);
            
            if (showLoading) {
              console.log(`✅ Fetched ${data.length} cryptocurrencies from backend`);
              setLoading(false);
            } else {
              console.log(`🔄 Updated prices at ${new Date().toLocaleTimeString()}`);
            }
            return;
          }
        } else {
          const errorText = await response.text();
          console.warn(`⚠️ [CryptoMarketList] Backend returned ${response.status}: ${errorText}`);
        }
      } catch (backendError: any) {
        console.warn("⚠️ Backend fetch failed:", backendError.message);
      }

      // Fallback to mock data
      console.log("📊 Using mock cryptocurrency data");
      setCryptoData(MOCK_CRYPTO_DATA);
      setUsingMockData(true);
      setLastUpdate(new Date());
      
      if (showLoading) {
        setLoading(false);
      }
      
    } catch (error) {
      console.error("❌ Error fetching crypto data:", error);
      
      // Use mock data as final fallback
      if (cryptoData.length === 0) {
        console.log("📊 Using mock cryptocurrency data as fallback");
        setCryptoData(MOCK_CRYPTO_DATA);
        setUsingMockData(true);
      }
      
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: number): string => {
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatSupply = (supply: number, symbol: string): string => {
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B ${symbol.toUpperCase()}`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M ${symbol.toUpperCase()}`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K ${symbol.toUpperCase()}`;
    return `${supply.toFixed(2)} ${symbol.toUpperCase()}`;
  };

  const renderSparkline = (prices: number[]) => {
    if (!prices || prices.length === 0) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    
    const points = prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * 100;
      const y = 100 - ((price - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = prices[prices.length - 1] >= prices[0];
    const color = isPositive ? '#10b981' : '#ef4444';

    return (
      <svg width="140" height="50" className="sparkline">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  const handleRowClick = (crypto: CryptoData) => {
    // Map crypto symbol to TradingView symbol
    const symbolMap: Record<string, string> = {
      'btc': 'BINANCE:BTCUSDT',
      'eth': 'BINANCE:ETHUSDT',
      'bnb': 'BINANCE:BNBUSDT',
      'xrp': 'BINANCE:XRPUSDT',
      'sol': 'BINANCE:SOLUSDT',
      'ada': 'BINANCE:ADAUSDT',
      'doge': 'BINANCE:DOGEUSDT',
      'trx': 'BINANCE:TRXUSDT',
      'matic': 'BINANCE:MATICUSDT',
      'dot': 'BINANCE:DOTUSDT',
      'ltc': 'BINANCE:LTCUSDT',
      'shib': 'BINANCE:SHIBUSDT',
      'avax': 'BINANCE:AVAXUSDT',
      'link': 'BINANCE:LINKUSDT',
      'atom': 'BINANCE:ATOMUSDT',
      'uni': 'BINANCE:UNIUSDT',
      'etc': 'BINANCE:ETCUSDT',
      'xlm': 'BINANCE:XLMUSDT',
      'bch': 'BINANCE:BCHUSDT',
    };

    const tradingViewSymbol = symbolMap[crypto.symbol.toLowerCase()] || 'BINANCE:BTCUSDT';
    navigate(`/markets?symbol=${tradingViewSymbol}`);
  };

  if (loading) {
    return (
      <Card className="border-slate-800 bg-slate-900 p-8">
        <div className="text-center text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading cryptocurrency data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-slate-900 overflow-hidden">
      {/* Header Stats */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div>
            <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">Market Cap</div>
            <div className="text-sm sm:text-lg md:text-xl font-bold text-white">
              {formatNumber(cryptoData.reduce((sum, coin) => sum + coin.market_cap, 0))}
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">24h Volume</div>
            <div className="text-sm sm:text-lg md:text-xl font-bold text-white">
              {formatNumber(cryptoData.reduce((sum, coin) => sum + coin.total_volume, 0))}
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">BTC Dominance</div>
            <div className="text-sm sm:text-lg md:text-xl font-bold text-white">
              {cryptoData.length > 0 
                ? ((cryptoData[0].market_cap / cryptoData.reduce((sum, coin) => sum + coin.market_cap, 0)) * 100).toFixed(2)
                : '0'}%
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">Total Coins</div>
            <div className="text-sm sm:text-lg md:text-xl font-bold text-white">{cryptoData.length}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-800 sticky top-0">
            <tr>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">#</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">1h %</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">24h %</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">7d %</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Market Cap</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider hidden xl:table-cell">Volume(24h)</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider hidden xl:table-cell">Circulating Supply</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Last 7 Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {cryptoData.map((crypto, index) => (
              <tr 
                key={crypto.id} 
                className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(crypto)}
              >
                {/* Star & Rank */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(crypto.id);
                      }}
                      className="text-slate-500 hover:text-yellow-400 transition-colors"
                    >
                      <Star 
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${watchlist.includes(crypto.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                      />
                    </button>
                    <span className="text-slate-400 font-medium text-[11px] sm:text-xs md:text-sm">{index + 1}</span>
                  </div>
                </td>

                {/* Name & Symbol */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <img 
                      src={crypto.image} 
                      alt={crypto.name} 
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full flex-shrink-0"
                      loading="lazy"
                      width="32"
                      height="32"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs sm:text-sm md:text-base truncate">{crypto.name}</div>
                      <div className="text-[10px] sm:text-xs text-slate-400">{crypto.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right">
                  <div className={`font-bold transition-all duration-300 text-xs sm:text-sm md:text-base ${
                    crypto.previous_price && crypto.current_price > crypto.previous_price
                      ? 'text-green-400 animate-pulse'
                      : crypto.previous_price && crypto.current_price < crypto.previous_price
                      ? 'text-red-400 animate-pulse'
                      : 'text-white'
                  }`}>
                    {formatPrice(crypto.current_price)}
                  </div>
                </td>

                {/* 1h % - Hidden on mobile */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right hidden sm:table-cell">
                  <div className={`flex items-center justify-end gap-0.5 sm:gap-1 ${
                    crypto.price_change_percentage_1h_in_currency >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {crypto.price_change_percentage_1h_in_currency >= 0 ? (
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    )}
                    <span className="font-semibold text-[11px] sm:text-xs md:text-sm">
                      {Math.abs(crypto.price_change_percentage_1h_in_currency || 0).toFixed(2)}%
                    </span>
                  </div>
                </td>

                {/* 24h % */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right">
                  <div className={`flex items-center justify-end gap-0.5 sm:gap-1 ${
                    crypto.price_change_percentage_24h_in_currency >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {crypto.price_change_percentage_24h_in_currency >= 0 ? (
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    )}
                    <span className="font-semibold text-[11px] sm:text-xs md:text-sm">
                      {Math.abs(crypto.price_change_percentage_24h_in_currency || 0).toFixed(2)}%
                    </span>
                  </div>
                </td>

                {/* 7d % - Hidden on mobile/tablet */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right hidden md:table-cell">
                  <div className={`flex items-center justify-end gap-0.5 sm:gap-1 ${
                    crypto.price_change_percentage_7d_in_currency >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {crypto.price_change_percentage_7d_in_currency >= 0 ? (
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    )}
                    <span className="font-semibold text-[11px] sm:text-xs md:text-sm">
                      {Math.abs(crypto.price_change_percentage_7d_in_currency || 0).toFixed(2)}%
                    </span>
                  </div>
                </td>

                {/* Market Cap - Hidden on mobile/tablet */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right hidden lg:table-cell">
                  <div className="text-white font-medium text-xs sm:text-sm">{formatNumber(crypto.market_cap)}</div>
                </td>

                {/* Volume - Hidden on smaller screens */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right hidden xl:table-cell">
                  <div className="text-white font-medium text-xs sm:text-sm">{formatNumber(crypto.total_volume)}</div>
                </td>

                {/* Circulating Supply - Hidden on smaller screens */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right hidden xl:table-cell">
                  <div className="text-slate-400 text-[11px] sm:text-xs">
                    {formatSupply(crypto.circulating_supply, crypto.symbol)}
                  </div>
                </td>

                {/* Sparkline - Hidden on mobile/tablet */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-center hidden lg:table-cell">
                  {renderSparkline(crypto.sparkline_in_7d?.price || [])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}