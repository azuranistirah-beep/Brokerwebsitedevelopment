import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { usePrices } from "../context/PriceContext";

interface CryptoData {
  rank: number;
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  previous_price?: number;
  price_change_percentage_24h: number;
}

// ✅ TOP CRYPTO SYMBOLS - Match dengan PriceContext
const CRYPTO_LIST = [
  { id: 'bitcoin', symbol: 'BTCUSD', name: 'Bitcoin', short: 'BTC', image: 'https://assets.coincap.io/assets/icons/btc@2x.png' },
  { id: 'ethereum', symbol: 'ETHUSD', name: 'Ethereum', short: 'ETH', image: 'https://assets.coincap.io/assets/icons/eth@2x.png' },
  { id: 'binancecoin', symbol: 'BNBUSD', name: 'BNB', short: 'BNB', image: 'https://assets.coincap.io/assets/icons/bnb@2x.png' },
  { id: 'ripple', symbol: 'XRPUSD', name: 'XRP', short: 'XRP', image: 'https://assets.coincap.io/assets/icons/xrp@2x.png' },
  { id: 'solana', symbol: 'SOLUSD', name: 'Solana', short: 'SOL', image: 'https://assets.coincap.io/assets/icons/sol@2x.png' },
  { id: 'cardano', symbol: 'ADAUSD', name: 'Cardano', short: 'ADA', image: 'https://assets.coincap.io/assets/icons/ada@2x.png' },
  { id: 'dogecoin', symbol: 'DOGEUSD', name: 'Dogecoin', short: 'DOGE', image: 'https://assets.coincap.io/assets/icons/doge@2x.png' },
  { id: 'polygon', symbol: 'MATICUSD', name: 'Polygon', short: 'MATIC', image: 'https://assets.coincap.io/assets/icons/matic@2x.png' },
  { id: 'polkadot', symbol: 'DOTUSD', name: 'Polkadot', short: 'DOT', image: 'https://assets.coincap.io/assets/icons/dot@2x.png' },
  { id: 'avalanche', symbol: 'AVAXUSD', name: 'Avalanche', short: 'AVAX', image: 'https://assets.coincap.io/assets/icons/avax@2x.png' },
  { id: 'shiba-inu', symbol: 'SHIBUSDT', name: 'Shiba Inu', short: 'SHIB', image: 'https://assets.coincap.io/assets/icons/shib@2x.png' },
  { id: 'chainlink', symbol: 'LINKUSD', name: 'Chainlink', short: 'LINK', image: 'https://assets.coincap.io/assets/icons/link@2x.png' },
  { id: 'tron', symbol: 'TRXUSD', name: 'TRON', short: 'TRX', image: 'https://assets.coincap.io/assets/icons/trx@2x.png' },
  { id: 'uniswap', symbol: 'UNIUSD', name: 'Uniswap', short: 'UNI', image: 'https://assets.coincap.io/assets/icons/uni@2x.png' },
  { id: 'litecoin', symbol: 'LTCUSD', name: 'Litecoin', short: 'LTC', image: 'https://assets.coincap.io/assets/icons/ltc@2x.png' },
  { id: 'cosmos', symbol: 'ATOMUSD', name: 'Cosmos', short: 'ATOM', image: 'https://assets.coincap.io/assets/icons/atom@2x.png' },
  { id: 'ethereum-classic', symbol: 'ETCUSD', name: 'Ethereum Classic', short: 'ETC', image: 'https://assets.coincap.io/assets/icons/etc@2x.png' },
  { id: 'near-protocol', symbol: 'NEARUSD', name: 'NEAR Protocol', short: 'NEAR', image: 'https://assets.coincap.io/assets/icons/near@2x.png' },
  { id: 'aptos', symbol: 'APTUSD', name: 'Aptos', short: 'APT', image: 'https://assets.coincap.io/assets/icons/apt@2x.png' },
  { id: 'arbitrum', symbol: 'ARBUSD', name: 'Arbitrum', short: 'ARB', image: 'https://assets.coincap.io/assets/icons/arb@2x.png' },
];

// ✅ REAL-TIME DATA FROM PRICECONTEXT
export function CryptoMarketList() {
  const navigate = useNavigate();
  const { prices } = usePrices(); // ✅ USE SHARED PRICE CONTEXT
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);

  // ✅ Update crypto data from PriceContext
  useEffect(() => {
    console.log('🔄 [CryptoMarketList] Updating from PriceContext...');
    
    const updatedData = CRYPTO_LIST.map((crypto, index) => {
      const priceData = prices[crypto.symbol];
      
      return {
        rank: index + 1,
        id: crypto.id,
        symbol: crypto.short,
        name: crypto.name,
        image: crypto.image,
        current_price: priceData?.price || 0,
        previous_price: cryptoData.find(c => c.id === crypto.id)?.current_price,
        price_change_percentage_24h: priceData?.changePercent || 0,
      };
    });

    setCryptoData(updatedData);
    
    // Log first 3 prices for verification
    const activePrices = updatedData.filter(c => c.current_price > 0);
    if (activePrices.length > 0) {
      console.log(`✅ [CryptoMarketList] ${activePrices.length} prices active from PriceContext`);
      activePrices.slice(0, 3).forEach(coin => {
        console.log(`💰 ${coin.name} (${coin.symbol}): $${coin.current_price.toLocaleString()}`);
      });
    }
  }, [prices]);

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const formatPrice = (price: number): string => {
    if (price === 0) return "$0.00";
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const handleRowClick = (crypto: CryptoData) => {
    const symbolMap: Record<string, string> = {
      'BTC': 'BINANCE:BTCUSDT',
      'ETH': 'BINANCE:ETHUSDT',
      'BNB': 'BINANCE:BNBUSDT',
      'XRP': 'BINANCE:XRPUSDT',
      'SOL': 'BINANCE:SOLUSDT',
      'ADA': 'BINANCE:ADAUSDT',
      'DOGE': 'BINANCE:DOGEUSDT',
      'MATIC': 'BINANCE:MATICUSDT',
      'DOT': 'BINANCE:DOTUSDT',
      'AVAX': 'BINANCE:AVAXUSDT',
      'SHIB': 'BINANCE:SHIBUSDT',
      'LINK': 'BINANCE:LINKUSDT',
      'TRX': 'BINANCE:TRXUSDT',
      'UNI': 'BINANCE:UNIUSDT',
      'LTC': 'BINANCE:LTCUSDT',
      'ATOM': 'BINANCE:ATOMUSDT',
      'ETC': 'BINANCE:ETCUSDT',
    };

    const tradingViewSymbol = symbolMap[crypto.symbol] || 'BINANCE:BTCUSDT';
    navigate(`/markets?symbol=${tradingViewSymbol}`);
  };

  return (
    <Card className="border-slate-800 bg-slate-900 overflow-hidden">
      {/* Header Stats */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div>
            <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">Active Prices</div>
            <div className="text-sm sm:text-lg md:text-xl font-bold text-white">
              {cryptoData.filter(c => c.current_price > 0).length} / {cryptoData.length}
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">Bitcoin</div>
            <div className="text-sm sm:text-lg md:text-xl font-bold text-white">
              {formatPrice(cryptoData.find(c => c.symbol === 'BTC')?.current_price || 0)}
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">Ethereum</div>
            <div className="text-sm sm:text-lg md:text-xl font-bold text-white">
              {formatPrice(cryptoData.find(c => c.symbol === 'ETH')?.current_price || 0)}
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
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">24h %</th>
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
                      <div className="text-[10px] sm:text-xs text-slate-400">{crypto.symbol}</div>
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
                      : crypto.current_price > 0 ? 'text-white' : 'text-slate-600'
                  }`}>
                    {formatPrice(crypto.current_price)}
                  </div>
                </td>

                {/* 24h % */}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right">
                  <div className={`flex items-center justify-end gap-0.5 sm:gap-1 ${
                    crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    )}
                    <span className="font-semibold text-[11px] sm:text-xs md:text-sm">
                      {Math.abs(crypto.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
