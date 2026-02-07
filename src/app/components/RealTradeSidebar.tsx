import { 
  TrendingUp, 
  PieChart, 
  History, 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  User, 
  HeadphonesIcon 
} from "lucide-react";

type PageType = "trade" | "portfolio" | "history" | "wallet" | "deposit" | "withdraw" | "profile" | "support";

interface RealTradeSidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export function RealTradeSidebar({ currentPage, onPageChange }: RealTradeSidebarProps) {
  const menuItems = [
    { id: "trade" as PageType, label: "Trade", icon: TrendingUp },
    { id: "portfolio" as PageType, label: "Portfolio", icon: PieChart },
    { id: "history" as PageType, label: "History", icon: History },
    { id: "wallet" as PageType, label: "Wallet", icon: Wallet },
    { id: "deposit" as PageType, label: "Deposit", icon: ArrowDownToLine },
    { id: "withdraw" as PageType, label: "Withdraw", icon: ArrowUpFromLine },
    { id: "profile" as PageType, label: "Profile & KYC", icon: User },
    { id: "support" as PageType, label: "Support", icon: HeadphonesIcon },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">Investoft</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Account Type Badge */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 text-center">
          <p className="text-xs font-semibold text-white uppercase tracking-wide">
            Real Account
          </p>
          <p className="text-xs text-green-100 mt-1">
            Live Trading Active
          </p>
        </div>
      </div>
    </div>
  );
}
