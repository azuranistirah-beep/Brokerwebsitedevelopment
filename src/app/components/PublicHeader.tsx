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
    { id: "markets", label: "Trading Demo" },
    { id: "charts", label: "Chart" },
    { id: "screener", label: "Screener" },
    { id: "news", label: "News" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 backdrop-blur-md bg-white/90">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("landing")}>
            <div className="bg-blue-600 rounded p-1">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Investoft</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onNavigate(item.id)} 
                className={`hover:text-blue-600 transition-colors ${currentView === item.id ? "text-blue-600 font-bold" : ""}`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={onGetStarted} className="hover:text-blue-600 transition-colors font-bold text-blue-600">Trade</button>
          </nav>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="hidden md:flex relative max-w-xs w-full" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search stocks, forex, crypto..." 
                className="pl-9 bg-slate-100 border-slate-200 text-slate-900 h-9 focus-visible:ring-blue-600 focus:bg-white transition-colors w-full"
                onFocus={() => setShowSuggestions(true)}
              />
            </form>
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-2 text-xs text-slate-500 uppercase font-bold tracking-wider bg-slate-50">Popular Searches</div>
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item.symbol}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 flex justify-between items-center group"
                    onClick={() => {
                      onNavigate("charts");
                      setShowSuggestions(false);
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="font-mono text-slate-400 group-hover:text-blue-600">{item.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900" onClick={onLogin}>
              Sign In
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={onGetStarted}>
              Get Started
            </Button>
          </div>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-slate-900">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-slate-200 text-slate-900 w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                 <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-9 bg-slate-100 border-slate-200 text-slate-900"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                </div>
                <nav className="flex flex-col gap-4 text-lg font-medium">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.id}>
                      <button onClick={() => onNavigate(item.id)} className="text-left hover:text-blue-600">{item.label}</button>
                    </SheetClose>
                  ))}
                  <SheetClose asChild><button onClick={onGetStarted} className="text-left hover:text-blue-600 font-bold text-blue-600">Trade Now</button></SheetClose>
                </nav>
                <div className="flex flex-col gap-3 mt-auto">
                  <Button variant="outline" className="text-slate-900 border-slate-300 w-full hover:bg-slate-50" onClick={onLogin}>
                    Sign In
                  </Button>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 w-full" onClick={onGetStarted}>
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