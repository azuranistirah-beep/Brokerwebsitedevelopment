import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Card } from "./ui/card";

interface SymbolOption {
  symbol: string;
  name: string;
  category: string;
}

// 📋 COMPREHENSIVE SYMBOL LIST with categories
const ALL_SYMBOLS: SymbolOption[] = [
  // Cryptocurrencies
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin", category: "Crypto" },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum", category: "Crypto" },
  { symbol: "BINANCE:BNBUSDT", name: "Binance Coin", category: "Crypto" },
  { symbol: "BINANCE:SOLUSDT", name: "Solana", category: "Crypto" },
  { symbol: "BINANCE:ADAUSDT", name: "Cardano", category: "Crypto" },
  { symbol: "BINANCE:XRPUSDT", name: "Ripple", category: "Crypto" },
  { symbol: "BINANCE:DOGEUSDT", name: "Dogecoin", category: "Crypto" },
  { symbol: "BINANCE:DOTUSDT", name: "Polkadot", category: "Crypto" },
  { symbol: "BINANCE:AVAXUSDT", name: "Avalanche", category: "Crypto" },
  { symbol: "BINANCE:MATICUSDT", name: "Polygon", category: "Crypto" },
  
  // US Stocks - Tech
  { symbol: "NASDAQ:AAPL", name: "Apple Inc", category: "Stocks" },
  { symbol: "NASDAQ:MSFT", name: "Microsoft", category: "Stocks" },
  { symbol: "NASDAQ:GOOGL", name: "Alphabet (Google)", category: "Stocks" },
  { symbol: "NASDAQ:AMZN", name: "Amazon", category: "Stocks" },
  { symbol: "NASDAQ:META", name: "Meta (Facebook)", category: "Stocks" },
  { symbol: "NASDAQ:TSLA", name: "Tesla", category: "Stocks" },
  { symbol: "NASDAQ:NVDA", name: "NVIDIA", category: "Stocks" },
  { symbol: "NASDAQ:NFLX", name: "Netflix", category: "Stocks" },
  { symbol: "NASDAQ:AMD", name: "AMD", category: "Stocks" },
  { symbol: "NASDAQ:INTC", name: "Intel", category: "Stocks" },
  { symbol: "NASDAQ:PYPL", name: "PayPal", category: "Stocks" },
  { symbol: "NASDAQ:ADBE", name: "Adobe", category: "Stocks" },
  { symbol: "NASDAQ:CSCO", name: "Cisco", category: "Stocks" },
  { symbol: "NASDAQ:AVGO", name: "Broadcom", category: "Stocks" },
  { symbol: "NASDAQ:QCOM", name: "Qualcomm", category: "Stocks" },
  
  // US Stocks - Other Sectors
  { symbol: "NYSE:JPM", name: "JPMorgan Chase", category: "Stocks" },
  { symbol: "NYSE:V", name: "Visa", category: "Stocks" },
  { symbol: "NYSE:JNJ", name: "Johnson & Johnson", category: "Stocks" },
  { symbol: "NYSE:WMT", name: "Walmart", category: "Stocks" },
  { symbol: "NYSE:PG", name: "Procter & Gamble", category: "Stocks" },
  { symbol: "NYSE:MA", name: "Mastercard", category: "Stocks" },
  { symbol: "NYSE:DIS", name: "Disney", category: "Stocks" },
  { symbol: "NYSE:BAC", name: "Bank of America", category: "Stocks" },
  { symbol: "NYSE:KO", name: "Coca-Cola", category: "Stocks" },
  { symbol: "NYSE:PFE", name: "Pfizer", category: "Stocks" },
  { symbol: "NASDAQ:IBIT", name: "iShares Bitcoin Trust", category: "ETF" },
  
  // Forex Majors
  { symbol: "FX:EURUSD", name: "EUR/USD", category: "Forex" },
  { symbol: "FX:GBPUSD", name: "GBP/USD", category: "Forex" },
  { symbol: "FX:USDJPY", name: "USD/JPY", category: "Forex" },
  { symbol: "FX:AUDUSD", name: "AUD/USD", category: "Forex" },
  { symbol: "FX:USDCAD", name: "USD/CAD", category: "Forex" },
  { symbol: "FX:USDCHF", name: "USD/CHF", category: "Forex" },
  { symbol: "FX:NZDUSD", name: "NZD/USD", category: "Forex" },
  { symbol: "FX:EURGBP", name: "EUR/GBP", category: "Forex" },
  { symbol: "FX:EURJPY", name: "EUR/JPY", category: "Forex" },
  { symbol: "FX:GBPJPY", name: "GBP/JPY", category: "Forex" },
  
  // Commodities
  { symbol: "TVC:GOLD", name: "Gold", category: "Commodities" },
  { symbol: "TVC:SILVER", name: "Silver", category: "Commodities" },
  { symbol: "TVC:USOIL", name: "Crude Oil WTI", category: "Commodities" },
  { symbol: "TVC:UKOIL", name: "Brent Crude Oil", category: "Commodities" },
  
  // Indices
  { symbol: "SP:SPX", name: "S&P 500", category: "Indices" },
  { symbol: "DJ:DJI", name: "Dow Jones", category: "Indices" },
  { symbol: "NASDAQ:NDX", name: "NASDAQ 100", category: "Indices" },
];

interface SymbolSelectorProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

export function SymbolSelector({ selectedSymbol, onSymbolChange }: SymbolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter symbols based on search query
  const filteredSymbols = ALL_SYMBOLS.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.symbol.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  // Group by category
  const groupedSymbols = filteredSymbols.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SymbolOption[]>);

  const selectedSymbolData = ALL_SYMBOLS.find(s => s.symbol === selectedSymbol);

  const handleSelect = (symbol: string) => {
    console.log(`🎯 [SymbolSelector] User selected: "${symbol}"`);
    onSymbolChange(symbol);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Symbol Display - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-slate-300 hover:border-blue-500 rounded-lg px-4 py-3 flex items-center justify-between transition-colors"
      >
        <div className="text-left">
          <div className="text-xs text-slate-500 font-medium mb-1">Trading Symbol</div>
          <div className="font-bold text-slate-900">{selectedSymbolData?.name || "Select Asset"}</div>
          <div className="text-xs text-slate-600 mt-1">{selectedSymbol}</div>
        </div>
        <Search className="h-5 w-5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className="absolute top-full mt-2 w-full max-w-md z-50 shadow-xl border-2 border-slate-300 max-h-[500px] overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search symbols, names, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Symbol List - Scrollable */}
          <div className="overflow-y-auto flex-1">
            {Object.keys(groupedSymbols).length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No symbols found
              </div>
            ) : (
              Object.entries(groupedSymbols).map(([category, symbols]) => (
                <div key={category} className="border-b border-slate-100 last:border-b-0">
                  <div className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {category}
                  </div>
                  {symbols.map((item) => (
                    <button
                      key={item.symbol}
                      onClick={() => handleSelect(item.symbol)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 ${
                        selectedSymbol === item.symbol ? "bg-blue-100" : ""
                      }`}
                    >
                      <div className="font-semibold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{item.symbol}</div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
