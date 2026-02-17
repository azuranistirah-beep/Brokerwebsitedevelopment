import { Button } from "./ui/button";
import { BarChart3, Search, Menu, X } from "lucide-react";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { Link, useNavigate, useLocation } from "react-router";

interface PublicHeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  isAuthenticated: boolean;
  userRole: string | null;
  onLogout: () => void;
}

const SUGGESTIONS = [
  // Crypto
  { symbol: "BTCUSD", name: "Bitcoin", type: "crypto" },
  { symbol: "ETHUSD", name: "Ethereum", type: "crypto" },
  { symbol: "BNBUSD", name: "Binance Coin", type: "crypto" },
  { symbol: "SOLUSD", name: "Solana", type: "crypto" },
  { symbol: "XRPUSD", name: "Ripple", type: "crypto" },
  
  // Forex
  { symbol: "EURUSD", name: "Euro / US Dollar", type: "forex" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", type: "forex" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", type: "forex" },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", type: "forex" },
  
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", type: "stock" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "stock" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "stock" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "stock" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "stock" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "stock" },
  { symbol: "META", name: "Meta Platforms Inc.", type: "stock" },
  
  // Commodities
  { symbol: "GOLD", name: "Gold", type: "commodity" },
  { symbol: "SILVER", name: "Silver", type: "commodity" },
  { symbol: "USOIL", name: "Crude Oil (WTI)", type: "commodity" },
  { symbol: "UKOIL", name: "Brent Crude Oil", type: "commodity" },
];

export function PublicHeader({ onLoginClick, onSignupClick, isAuthenticated, userRole, onLogout }: PublicHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/cryptocurrency");
    setShowSuggestions(false);
  };

  // Filter suggestions based on search query
  const filteredSuggestions = searchQuery.trim()
    ? SUGGESTIONS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10) // Limit to 10 results
    : SUGGESTIONS.slice(0, 10); // Show first 10 if no query

  const navItems = [
    { path: "/markets", label: "Markets" },
    { path: "/cryptocurrency", label: "Cryptocurrency" },
    { path: "/screener", label: "Screener" },
    { path: "/deposit", label: "Deposit" },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded p-1">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Investoft</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`hover:text-blue-400 transition-colors ${location.pathname === item.path ? "text-blue-400 font-bold" : ""}`}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link to="/member" className="hover:text-blue-400 transition-colors font-bold text-blue-400">
                Dashboard
              </Link>
            ) : (
              <button onClick={onSignupClick} className="hover:text-blue-400 transition-colors font-bold text-blue-400">
                Trade
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="hidden md:flex relative max-w-xs w-full" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search stocks, forex, crypto..." 
                className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 h-9 focus-visible:ring-blue-600 focus:bg-slate-800 transition-colors w-full"
                onFocus={() => setShowSuggestions(true)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                <div className="p-2 px-4 text-xs text-slate-400 uppercase font-bold tracking-wider bg-slate-800 flex items-center justify-between">
                  <span>{searchQuery.trim() ? 'Search Results' : 'Popular Searches'}</span>
                  {searchQuery.trim() && filteredSuggestions.length > 0 && (
                    <span className="text-blue-400 font-normal normal-case">{filteredSuggestions.length} found</span>
                  )}
                </div>
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item) => (
                    <button
                      key={item.symbol}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-sm text-slate-300 flex justify-between items-center gap-3 group transition-colors"
                      onClick={() => {
                        setSearchQuery(item.symbol);
                        navigate("/cryptocurrency");
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="truncate">{item.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded uppercase font-semibold flex-shrink-0 ${
                          item.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
                          item.type === 'forex' ? 'bg-blue-500/20 text-blue-400' :
                          item.type === 'stock' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <span className="font-mono text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0 font-semibold">
                        {item.symbol}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <div className="text-slate-500 text-sm mb-1">No results found</div>
                    <div className="text-slate-600 text-xs">Try searching for "Bitcoin", "AAPL", or "Gold"</div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to={userRole === 'admin' ? '/admin' : '/member'}>
                  <Button variant="ghost" className="text-slate-300 hover:bg-slate-800 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" className="text-slate-300 hover:bg-slate-800 hover:text-white" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-slate-300 hover:bg-slate-800 hover:text-white" onClick={onLoginClick}>
                  Sign In
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" onClick={onSignupClick}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-900 border-slate-800 text-white w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                 <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                </div>
                <nav className="flex flex-col gap-4 text-lg font-medium">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.path}>
                      <Link to={item.path} className="text-left hover:text-blue-400 text-slate-300">
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                  {isAuthenticated ? (
                    <SheetClose asChild>
                      <Link to="/member" className="text-left hover:text-blue-400 font-bold text-blue-400">
                        Dashboard
                      </Link>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <button onClick={onSignupClick} className="text-left hover:text-blue-400 font-bold text-blue-400">
                        Trade Now
                      </button>
                    </SheetClose>
                  )}
                </nav>
                <div className="flex flex-col gap-3 mt-auto">
                  {isAuthenticated ? (
                    <>
                      <Link to={userRole === 'admin' ? '/admin' : '/member'}>
                        <Button variant="outline" className="text-white border-slate-700 w-full hover:bg-slate-800">
                          Dashboard
                        </Button>
                      </Link>
                      <Button variant="outline" className="text-white border-slate-700 w-full hover:bg-slate-800" onClick={onLogout}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="text-white border-slate-700 w-full hover:bg-slate-800" onClick={onLoginClick}>
                        Sign In
                      </Button>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full" onClick={onSignupClick}>
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}