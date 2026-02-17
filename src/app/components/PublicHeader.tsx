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
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowMobileSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate based on first filtered result
    if (filteredSuggestions.length > 0) {
      const item = filteredSuggestions[0];
      navigateToAsset(item);
    }
    setShowSuggestions(false);
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate based on first filtered result
    if (filteredMobileSuggestions.length > 0) {
      const item = filteredMobileSuggestions[0];
      navigateToAsset(item);
    }
    setShowMobileSuggestions(false);
  };

  // ✅ SMART ROUTING - ALL assets go to /markets with TradingView chart
  const navigateToAsset = (item: { symbol: string; name: string; type: string }) => {
    // Navigate to Markets page with symbol parameter for ALL assets
    // TradingView chart supports crypto, forex, stocks, and commodities
    navigate(`/markets?symbol=${item.symbol}`);
  };

  // Filter suggestions based on search query
  const filteredSuggestions = searchQuery.trim()
    ? SUGGESTIONS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 1) // ✅ Only 1 suggestion
    : []; // ✅ Show nothing if no query

  const filteredMobileSuggestions = mobileSearchQuery.trim()
    ? SUGGESTIONS.filter(item =>
        item.name.toLowerCase().includes(mobileSearchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(mobileSearchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(mobileSearchQuery.toLowerCase())
      ).slice(0, 1) // ✅ Only 1 suggestion
    : []; // ✅ Show nothing if no query

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
          
          {/* ✅ Desktop Navigation - Only show on large screens (≥1280px) */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-400">
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
          {/* ✅ Search - Hide on mobile, show on tablet+ */}
          <div className="hidden sm:flex relative max-w-xs w-full" ref={searchRef}>
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
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 border border-slate-700/50 rounded-md shadow-lg z-50 overflow-hidden backdrop-blur-sm">
                {filteredSuggestions.map((item) => (
                    <button
                      key={item.symbol}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-700/80 text-slate-300 flex justify-between items-center gap-2 group transition-colors"
                      onClick={() => {
                        setSearchQuery(item.symbol);
                        navigateToAsset(item);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="truncate text-xs">{item.name}</span>
                        <span className={`text-[10px] px-1 py-0.5 rounded uppercase font-semibold flex-shrink-0 ${
                          item.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
                          item.type === 'forex' ? 'bg-blue-500/20 text-blue-400' :
                          item.type === 'stock' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0 font-semibold">
                        {item.symbol}
                      </span>
                    </button>
                  ))}
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

          {/* ✅ Mobile/Tablet Burger Menu - Show on ALL screens <1280px (including iPad/tablet) */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-900 border-slate-800 text-white w-[300px] sm:w-[350px]" hideTitle={true}>
              {/* ✅ FIX: Add padding-right to avoid close button overlap */}
              <div className="flex flex-col h-full pr-12">
                
                {/* ✅ Search Bar - AT TOP (as requested) */}
                <div className="relative px-4 pt-4 mb-4" ref={mobileSearchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search assets..." 
                      className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleMobileSearch(e)}
                      onFocus={() => setShowMobileSuggestions(true)}
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* ✅ MINIMAL Dropdown - Only 1 item, very small */}
                  {showMobileSuggestions && filteredMobileSuggestions.length > 0 && (
                    <div className="absolute left-4 right-4 top-[52px] bg-slate-800/95 border border-slate-700/50 rounded-md shadow-lg z-50 overflow-hidden backdrop-blur-sm">
                      {filteredMobileSuggestions.map((item) => (
                        <button
                          key={item.symbol}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-slate-700/80 text-slate-300 flex justify-between items-center gap-1.5 group transition-colors"
                          onClick={() => {
                            setMobileSearchQuery(item.symbol);
                            navigateToAsset(item);
                            setShowMobileSuggestions(false);
                          }}
                        >
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <span className="truncate text-xs">{item.name}</span>
                            <span className={`text-[10px] px-1 py-0.5 rounded uppercase font-semibold flex-shrink-0 ${
                              item.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
                              item.type === 'forex' ? 'bg-blue-500/20 text-blue-400' :
                              item.type === 'stock' ? 'bg-green-500/20 text-green-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0 font-semibold">
                            {item.symbol}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation Links - Below search */}
                <nav className="flex flex-col gap-1 px-4 flex-1">{navItems.map((item) => (
                    <SheetClose asChild key={item.path}>
                      <Link 
                        to={item.path} 
                        className={`text-left py-3 px-3 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === item.path 
                            ? 'bg-blue-600/10 text-blue-400' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                {/* ✅ Action Buttons - At bottom */}
                <div className="px-4 pb-6 space-y-3 border-t border-slate-800 pt-4">
                  {isAuthenticated ? (
                    <>
                      <SheetClose asChild>
                        <Link to={userRole === 'admin' ? '/admin' : '/member'} className="block">
                          <Button variant="outline" className="text-white border-slate-700 w-full hover:bg-slate-800 h-11 bg-transparent">
                            Dashboard
                          </Button>
                        </Link>
                      </SheetClose>
                      <Button 
                        variant="outline" 
                        className="text-white border-slate-700 w-full hover:bg-slate-800 h-11 bg-transparent" 
                        onClick={() => {
                          onLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button 
                          variant="outline" 
                          className="text-white border-slate-700 w-full hover:bg-slate-800 h-11 bg-transparent"
                          onClick={() => {
                            onLoginClick();
                            setIsMenuOpen(false);
                          }}
                        >
                          Sign In
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full h-11 font-semibold"
                          onClick={() => {
                            onSignupClick();
                            setIsMenuOpen(false);
                          }}
                        >
                          Get Started
                        </Button>
                      </SheetClose>
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