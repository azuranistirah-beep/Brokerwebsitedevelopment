import { useState } from "react";
import { 
  LayoutDashboard, Users, FileCheck, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp, Package, Gift, MessageSquare, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, Bell
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface AdminSidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users, badge: "new" },
  { id: "kyc", label: "KYC Verification", icon: FileCheck, badge: "pending" },
  { id: "deposits", label: "Deposits", icon: ArrowDownToLine },
  { id: "withdrawals", label: "Withdrawals", icon: ArrowUpFromLine, badge: "urgent" },
  { id: "trades", label: "Trades", icon: TrendingUp },
  { id: "assets", label: "Assets", icon: Package },
  { id: "promotions", label: "Promotions", icon: Gift },
  { id: "support", label: "Support", icon: MessageSquare },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ activeMenu, onMenuChange, onLogout }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo & Collapse Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-white font-bold text-lg">Investoft</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onMenuChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
                  isActive 
                    ? "bg-purple-600 text-white" 
                    : "text-gray-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded-full",
                        item.badge === "new" && "bg-blue-500/20 text-blue-400",
                        item.badge === "pending" && "bg-yellow-500/20 text-yellow-400",
                        item.badge === "urgent" && "bg-red-500/20 text-red-400"
                      )}>
                        {item.badge === "new" ? "3" : item.badge === "pending" ? "5" : "2"}
                      </span>
                    )}
                  </>
                )}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            "w-full text-gray-400 hover:text-white hover:bg-slate-800",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
