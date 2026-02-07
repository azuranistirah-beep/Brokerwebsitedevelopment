import { useState } from "react";
import { Search, Bell, Plus, User, ChevronDown, CheckCircle, WifiOff } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

interface AdminTopbarProps {
  adminName: string;
  onQuickAction: (action: string) => void;
}

const notifications = [
  { id: 1, type: "member", text: "New member registration: John Doe", time: "2m ago", unread: true },
  { id: 2, type: "kyc", text: "KYC document submitted by Jane Smith", time: "5m ago", unread: true },
  { id: 3, type: "withdrawal", text: "Withdrawal request: $500 by Mike Johnson", time: "10m ago", unread: true },
  { id: 4, type: "deposit", text: "New deposit: $1,000 by Sarah Wilson", time: "15m ago", unread: false },
  { id: 5, type: "support", text: "New support ticket #1234", time: "20m ago", unread: false },
];

const quickActions = [
  { id: "approve-member", label: "Approve Member" },
  { id: "approve-kyc", label: "Approve KYC" },
  { id: "approve-withdrawal", label: "Approve Withdrawal" },
  { id: "add-asset", label: "Add Asset" },
  { id: "create-promo", label: "Create Promo" },
];

export function AdminTopbar({ adminName, onQuickAction }: AdminTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search members, transactions, tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              Quick Action
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-white">
            {quickActions.map((action) => (
              <DropdownMenuItem 
                key={action.id}
                onClick={() => onQuickAction(action.id)}
                className="hover:bg-slate-700 cursor-pointer"
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700 text-white">
            <div className="px-4 py-3 border-b border-slate-700">
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-xs text-gray-400 mt-1">{unreadCount} unread notifications</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <DropdownMenuItem 
                  key={notif.id}
                  className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex flex-col items-start gap-1"
                >
                  <div className="flex items-start justify-between w-full">
                    <p className="text-sm">{notif.text}</p>
                    {notif.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{notif.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="px-4 py-2 text-center hover:bg-slate-700 cursor-pointer text-purple-400">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-800">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{adminName}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700 text-white">
            <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer text-red-400">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}