import { Button } from "./ui/button";
import { BarChart3, Search, Menu, X } from "lucide-react";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { toast } from "sonner";

interface PublicHeaderProps {
  onLogin: () => void;
  onGetStarted: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

const SUGGESTIONS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "BTCUSD", name: "Bitcoin" },
  { symbol: "EURUSD", name: "Euro / US Dollar" },
  { symbol: "TSLA", name: "Tesla Inc" },
  { symbol: "GOLD", name: "Gold" },
];

export function PublicHeader({ onLogin, onGetStarted, onNavigate, currentView }: PublicHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    onNavigate("charts");
    setShowSuggestions(false);
  };

  const navItems = [
    { id: "markets", label: "Markets" },
    { id: "charts", label: "Chart" },
    { id: "screener", label: "Screener" },
    { id: "news", label: "News" },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("landing")}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded p-1">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Investoft</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onNavigate(item.id)} 
                className={`hover:text-blue-400 transition-colors ${currentView === item.id ? "text-blue-400 font-bold" : ""}`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={onGetStarted} className="hover:text-blue-400 transition-colors font-bold text-blue-400">Trade</button>
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
              />
            </form>
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-2 text-xs text-slate-400 uppercase font-bold tracking-wider bg-slate-800">Popular Searches</div>
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item.symbol}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 text-sm text-slate-300 flex justify-between items-center group"
                    onClick={() => {
                      onNavigate("charts");
                      setShowSuggestions(false);
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="font-mono text-slate-400 group-hover:text-blue-400">{item.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-slate-300 hover:bg-slate-800 hover:text-white" onClick={onLogin}>
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" onClick={onGetStarted}>
              Get Started
            </Button>
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
                    <SheetClose asChild key={item.id}>
                      <button onClick={() => onNavigate(item.id)} className="text-left hover:text-blue-400 text-slate-300">{item.label}</button>
                    </SheetClose>
                  ))}
                  <SheetClose asChild><button onClick={onGetStarted} className="text-left hover:text-blue-400 font-bold text-blue-400">Trade Now</button></SheetClose>
                </nav>
                <div className="flex flex-col gap-3 mt-auto">
                  <Button variant="outline" className="text-white border-slate-700 w-full hover:bg-slate-800" onClick={onLogin}>
                    Sign In
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full" onClick={onGetStarted}>
                    Get Started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}