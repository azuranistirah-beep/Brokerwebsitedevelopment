import { useState, useEffect } from "react";
import { Users, FileCheck, ArrowDownToLine, ArrowUpFromLine, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { projectId } from "../../../../../utils/supabase/info";
import { makeAuthenticatedRequest } from "../../../lib/authHelpers";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  pendingMembers: number;
  pendingKYC: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalDepositsAmount: number;
  totalWithdrawalsAmount: number;
}

interface OverviewPageProps {
  onNavigate: (menu: string, submenu?: string) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingMembers: 0,
    pendingKYC: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalDepositsAmount: 0,
    totalWithdrawalsAmount: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, depositsRes, withdrawalsRes, kycRes] = await Promise.all([
        makeAuthenticatedRequest(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/users`
        ),
        makeAuthenticatedRequest(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/deposits`
        ),
        makeAuthenticatedRequest(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/withdrawals`
        ),
        makeAuthenticatedRequest(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/kyc`
        )
      ]);

      let newStats: Stats = {
        totalUsers: 0,
        pendingMembers: 0,
        pendingKYC: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
        totalDepositsAmount: 0,
        totalWithdrawalsAmount: 0,
      };

      if (usersRes.ok) {
        const data = await usersRes.json();
        const members = data.users.filter((u: any) => u.role === 'member');
        newStats.totalUsers = members.length;
        newStats.pendingMembers = members.filter((u: any) => u.status === 'pending').length;
      }

      if (depositsRes.ok) {
        const data = await depositsRes.json();
        const deposits = data.deposits || [];
        newStats.pendingDeposits = deposits.filter((d: any) => d.status === 'pending').length;
        newStats.totalDepositsAmount = deposits
          .filter((d: any) => d.status === 'pending')
          .reduce((sum: number, d: any) => sum + d.amount, 0);
      }

      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        const withdrawals = data.withdrawals || [];
        newStats.pendingWithdrawals = withdrawals.filter((w: any) => w.status === 'pending').length;
        newStats.totalWithdrawalsAmount = withdrawals
          .filter((w: any) => w.status === 'pending')
          .reduce((sum: number, w: any) => sum + w.amount, 0);
      }

      if (kycRes.ok) {
        const data = await kycRes.json();
        const kyc = data.kyc || [];
        newStats.pendingKYC = kyc.filter((k: any) => k.status === 'pending').length;
      }

      setStats(newStats);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error loading dashboard stats");
      }
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { 
      label: "Total Members", 
      value: stats.totalUsers.toString(), 
      change: `${stats.pendingMembers} pending approval`, 
      icon: Users, 
      color: "blue",
      urgent: stats.pendingMembers > 0,
      onClick: () => onNavigate("members")
    },
    { 
      label: "Pending KYC", 
      value: stats.pendingKYC.toString(), 
      change: stats.pendingKYC > 0 ? "Requires review" : "All reviewed", 
      icon: FileCheck, 
      color: "yellow",
      urgent: stats.pendingKYC > 0,
      onClick: () => onNavigate("kyc")
    },
    { 
      label: "Pending Deposits", 
      value: stats.pendingDeposits.toString(), 
      change: `$${stats.totalDepositsAmount.toLocaleString()}`, 
      icon: ArrowDownToLine, 
      color: "green",
      urgent: stats.pendingDeposits > 0,
      onClick: () => onNavigate("deposits")
    },
    { 
      label: "Pending Withdrawals", 
      value: stats.pendingWithdrawals.toString(), 
      change: `$${stats.totalWithdrawalsAmount.toLocaleString()}`, 
      icon: ArrowUpFromLine, 
      color: "orange",
      urgent: stats.pendingWithdrawals > 0,
      onClick: () => onNavigate("withdrawals")
    },
  ];

  // Mock pending queue data (will be replaced with real data later)
  const pendingQueue = [
    { id: 1, type: "member", name: "John Doe", email: "john@example.com", time: "2 min ago", priority: "normal" },
    { id: 2, type: "kyc", name: "Jane Smith", email: "jane@example.com", time: "5 min ago", priority: "high" },
    { id: 3, type: "withdrawal", name: "Mike Johnson", email: "mike@example.com", amount: "$500", time: "10 min ago", priority: "urgent" },
  ];

  // Mock recent activity data (will be replaced with real data later)
  const recentActivity = [
    { id: 1, type: "deposit", user: "Alice Green", action: "Deposited $1,000", time: "5 min ago", status: "completed" },
    { id: 2, type: "trade", user: "Bob White", action: "Opened BTC/USD trade", time: "8 min ago", status: "active" },
    { id: 3, type: "kyc", user: "Charlie Black", action: "Submitted KYC documents", time: "12 min ago", status: "pending" },
    { id: 4, type: "withdrawal", user: "Diana Blue", action: "Requested withdrawal $750", time: "15 min ago", status: "pending" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-900 border-slate-800 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <h3 className="text-white text-2xl font-bold mt-2">{stat.value}</h3>
                  <p className={`text-sm mt-2 ${
                    stat.urgent ? 'text-orange-400' : 
                    stat.trend === 'up' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
              </div>
              <Button
                size="sm"
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={stat.onClick}
              >
                View Details
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Pending Queue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Members */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Pending Members</h3>
            <Badge className="bg-blue-500/20 text-blue-400">2 new</Badge>
          </div>
          <div className="space-y-3">
            {pendingQueue.filter(q => q.type === "member").map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs truncate">{item.email}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.time}</p>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white ml-2">
                  Approve
                </Button>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="w-full text-purple-400 hover:text-purple-300"
              onClick={() => onNavigate("members", "pending")}
            >
              View All →
            </Button>
          </div>
        </Card>

        {/* Pending KYC */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Pending KYC</h3>
            <Badge className="bg-yellow-500/20 text-yellow-400">2 new</Badge>
          </div>
          <div className="space-y-3">
            {pendingQueue.filter(q => q.type === "kyc").map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs truncate">{item.email}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.time}</p>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white ml-2">
                  Review
                </Button>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="w-full text-purple-400 hover:text-purple-300"
              onClick={() => onNavigate("kyc", "pending")}
            >
              View All →
            </Button>
          </div>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Pending Withdrawals</h3>
            <Badge className="bg-red-500/20 text-red-400">1 urgent</Badge>
          </div>
          <div className="space-y-3">
            {pendingQueue.filter(q => q.type === "withdrawal").map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 bg-slate-800 rounded-lg border-l-2 border-red-500">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs">{item.amount}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.time}</p>
                </div>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white ml-2">
                  Process
                </Button>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="w-full text-purple-400 hover:text-purple-300"
              onClick={() => onNavigate("withdrawals", "pending")}
            >
              View All →
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <h3 className="text-white font-semibold mb-4">Latest Activity</h3>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-slate-800/50">
              <TableHead className="text-gray-400">User</TableHead>
              <TableHead className="text-gray-400">Action</TableHead>
              <TableHead className="text-gray-400">Time</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivity.map((activity) => (
              <TableRow key={activity.id} className="border-slate-800 hover:bg-slate-800/50">
                <TableCell className="text-white">{activity.user}</TableCell>
                <TableCell className="text-gray-300">{activity.action}</TableCell>
                <TableCell className="text-gray-400">{activity.time}</TableCell>
                <TableCell>
                  <Badge className={
                    activity.status === "completed" ? "bg-green-500/20 text-green-400" :
                    activity.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                    activity.status === "active" ? "bg-blue-500/20 text-blue-400" :
                    "bg-gray-500/20 text-gray-400"
                  }>
                    {activity.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}