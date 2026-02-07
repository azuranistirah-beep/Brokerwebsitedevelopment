import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LogOut, Users, TrendingUp, Activity, DollarSign, Settings } from "lucide-react";
import { projectId } from "../../../utils/supabase/info";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { supabase } from "../lib/supabaseClient";

interface AdminDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  role: string;
  createdAt: string;
}

interface Trade {
  id: string;
  userId: string;
  asset: string;
  type: string;
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  status: string;
  openedAt: string;
  closedAt?: string;
  profit: number;
}

interface Asset {
  symbol: string;
  name: string;
  payout: number;
}

interface Stats {
  totalUsers: number;
  totalTrades: number;
  activeTrades: number;
  closedTrades: number;
  totalVolume: number;
  totalProfit: number;
}

export function AdminDashboard({ accessToken, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [loadingAssets, setLoadingAssets] = useState(false);

  useEffect(() => {
    loadStats();
    loadUsers();
    loadTrades();
    loadAssets();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/stats`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (response.ok) {
        const result = await response.json();
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/users`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (response.ok) {
        const result = await response.json();
        setUsers(result.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadTrades = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/trades`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (response.ok) {
        const result = await response.json();
        setTrades(result.trades);
      }
    } catch (error) {
      console.error("Error loading trades:", error);
    }
  };

  const loadAssets = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/assets`
      );
      if (response.ok) {
        const result = await response.json();
        setAssets(result.assets);
      }
    } catch (error) {
      console.error("Error loading assets:", error);
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !newBalance) return;
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/user/balance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            balance: parseFloat(newBalance),
          }),
        }
      );
      if (response.ok) {
        toast.success("Balance updated successfully");
        setBalanceDialogOpen(false);
        setSelectedUser(null);
        setNewBalance("");
        loadUsers();
        loadStats();
      } else {
        toast.error("Failed to update balance");
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  const handleAssetPayoutChange = (symbol: string, newPayout: string) => {
    const payout = parseFloat(newPayout);
    if (isNaN(payout) || payout < 0 || payout > 100) return;
    
    setAssets(assets.map(a => a.symbol === symbol ? { ...a, payout } : a));
  };

  const handleSaveAssets = async () => {
    setLoadingAssets(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/assets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ assets }),
        }
      );
      
      if (response.ok) {
        toast.success("Asset settings saved successfully");
      } else {
        toast.error("Failed to save asset settings");
      }
    } catch (error) {
      toast.error(`Error saving assets: ${error}`);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const openBalanceDialog = (user: User) => {
    setSelectedUser(user);
    setNewBalance(user.balance.toString());
    setBalanceDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">TradePro Admin</span>
          </div>
          <Button variant="ghost" className="text-white hover:text-blue-400" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Users</div>
                <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/20 p-3">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Trades</div>
                <div className="text-2xl font-bold text-white">{stats?.totalTrades || 0}</div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/20 p-3">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Active Trades</div>
                <div className="text-2xl font-bold text-white">{stats?.activeTrades || 0}</div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/20 p-3">
                <Activity className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Closed Trades</div>
                <div className="text-2xl font-bold text-white">{stats?.closedTrades || 0}</div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-cyan-500/20 p-3">
                <DollarSign className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Volume</div>
                <div className="text-2xl font-bold text-white">
                  ${stats?.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-pink-500/20 p-3">
                <DollarSign className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total P/L</div>
                <div className={`text-2xl font-bold ${(stats?.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(stats?.totalProfit || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trades">All Trades</TabsTrigger>
            <TabsTrigger value="assets">Asset Settings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-900 border-slate-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">User Management</h3>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No users found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-900">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Role</TableHead>
                      <TableHead className="text-gray-400">Balance</TableHead>
                      <TableHead className="text-gray-400">Created At</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800">
                        <TableCell className="text-white font-medium">{user.name}</TableCell>
                        <TableCell className="text-white">{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-white font-bold">
                          ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                            onClick={() => openBalanceDialog(user)}
                          >
                            Edit Balance
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Trades Tab */}
          <TabsContent value="trades">
            <Card className="bg-slate-900 border-slate-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">All Trades</h3>
              {trades.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No trades found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-900">
                      <TableHead className="text-gray-400">User ID</TableHead>
                      <TableHead className="text-gray-400">Asset</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Amount</TableHead>
                      <TableHead className="text-gray-400">Entry</TableHead>
                      <TableHead className="text-gray-400">Exit</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Profit/Loss</TableHead>
                      <TableHead className="text-gray-400">Opened</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.map((trade) => (
                      <TableRow key={trade.id} className="border-slate-800 hover:bg-slate-800">
                        <TableCell className="text-white font-mono text-xs">
                          {trade.userId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="text-white font-medium">{trade.asset}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {trade.type.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-white">${trade.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-white">${trade.entryPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-white">
                          {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${trade.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {trade.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className={trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {trade.status === 'closed' ? `$${trade.profit.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(trade.openedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Asset Settings Tab */}
          <TabsContent value="assets">
            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Asset Settings</h3>
                <Button 
                  onClick={handleSaveAssets} 
                  disabled={loadingAssets}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loadingAssets ? "Saving..." : "Save Changes"}
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-900">
                    <TableHead className="text-gray-400">Asset Name</TableHead>
                    <TableHead className="text-gray-400">Symbol</TableHead>
                    <TableHead className="text-gray-400">Payout (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.symbol} className="border-slate-800 hover:bg-slate-800">
                      <TableCell className="text-white font-medium">{asset.name}</TableCell>
                      <TableCell className="text-white">{asset.symbol}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={asset.payout}
                          onChange={(e) => handleAssetPayoutChange(asset.symbol, e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Balance Dialog */}
      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Update User Balance</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modify the balance for the selected user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-gray-300">User</Label>
                <div className="text-sm text-gray-500 mt-1">
                  {selectedUser.name} ({selectedUser.email})
                </div>
              </div>
              <div>
                <Label htmlFor="newBalance" className="text-gray-300">New Balance ($)</Label>
                <Input
                  id="newBalance"
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="0.00"
                  className="bg-slate-800 border-slate-700 text-white mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialogOpen(false)} className="border-slate-700 text-white hover:bg-slate-800 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleUpdateBalance} className="bg-blue-600 hover:bg-blue-700">
              Update Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}