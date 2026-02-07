import { useState, useEffect } from "react";
import { Search, UserCheck, UserX, MoreVertical, Eye, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { projectId } from "../../../../../utils/supabase/info";
import { toast } from "sonner";
import { makeAuthenticatedRequest, handleAuthError } from "../../../lib/authHelpers";

interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  createdAt: string;
  role: string;
  status: 'pending' | 'active' | 'rejected';
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

interface MembersPageProps {
  accessToken: string; // Not used anymore but kept for compatibility
}

export function MembersPage({ accessToken }: MembersPageProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log("🔍 Fetching users from backend...");
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/users`
      );

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Users fetched:", result.users?.length || 0);
        
        // Filter out admins, only show members
        const members = result.users.filter((u: User) => u.role === 'member');
        setUsers(members);
        
        if (members.length === 0) {
          toast.info("No members found. Members will appear here after they sign up.");
        }
      } else {
        const errorText = await response.text();
        console.error("❌ Fetch failed:", response.status, errorText);
        toast.error(`Failed to fetch users: ${response.status}`);
      }
    } catch (error: any) {
      console.error("❌ Error fetching users:", error);
      console.error("Error details:", error.message);
      
      if (!error.message.includes("Authentication failed")) {
        toast.error(`Error loading users: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/user/approve`,
        {
          method: "POST",
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        toast.success("Member approved successfully!");
        fetchUsers(); // Refresh list
        setShowDetailDialog(false);
      } else {
        const errorText = await response.text();
        toast.error(`Failed to approve member: ${errorText}`);
      }
    } catch (error: any) {
      console.error("Error approving member:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error approving member");
      }
    }
  };

  const handleReject = async () => {
    if (!selectedMember || !rejectionReason) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/user/reject`,
        {
          method: "POST",
          body: JSON.stringify({ 
            userId: selectedMember.id,
            reason: rejectionReason 
          }),
        }
      );

      if (response.ok) {
        toast.success("Member rejected");
        fetchUsers(); // Refresh list
        setShowRejectDialog(false);
        setShowDetailDialog(false);
        setRejectionReason("");
      } else {
        const errorText = await response.text();
        toast.error(`Failed to reject member: ${errorText}`);
      }
    } catch (error: any) {
      console.error("Error rejecting member:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error rejecting member");
      }
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedMember || !balanceAmount) {
      toast.error("Please enter a valid balance");
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/user/balance`,
        {
          method: "POST",
          body: JSON.stringify({ 
            userId: selectedMember.id,
            balance: parseFloat(balanceAmount)
          }),
        }
      );

      if (response.ok) {
        toast.success("Balance updated successfully!");
        fetchUsers(); // Refresh list
        setShowBalanceDialog(false);
        setBalanceAmount("");
      } else {
        const errorText = await response.text();
        toast.error(`Failed to update balance: ${errorText}`);
      }
    } catch (error: any) {
      console.error("Error updating balance:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error updating balance");
      }
    }
  };

  const handleViewDetails = (member: User) => {
    setSelectedMember(member);
    setShowDetailDialog(true);
  };

  const openBalanceDialog = (member: User) => {
    setSelectedMember(member);
    setBalanceAmount(member.balance.toString());
    setShowBalanceDialog(true);
  };

  const openRejectDialog = (member: User) => {
    setSelectedMember(member);
    setShowRejectDialog(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingUsers = filteredUsers.filter(u => u.status === 'pending');
  const activeUsers = filteredUsers.filter(u => u.status === 'active');
  const rejectedUsers = filteredUsers.filter(u => u.status === 'rejected');

  const renderMemberTable = (members: User[]) => (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-800 hover:bg-slate-800/50">
          <TableHead className="text-gray-400">Name</TableHead>
          <TableHead className="text-gray-400">Email</TableHead>
          <TableHead className="text-gray-400">Balance</TableHead>
          <TableHead className="text-gray-400">Registered</TableHead>
          <TableHead className="text-gray-400">Status</TableHead>
          <TableHead className="text-gray-400">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-400 py-8">
              No members found
            </TableCell>
          </TableRow>
        ) : (
          members.map((member) => (
            <TableRow key={member.id} className="border-slate-800 hover:bg-slate-800/50">
              <TableCell className="text-white font-medium">{member.name}</TableCell>
              <TableCell className="text-gray-400">{member.email}</TableCell>
              <TableCell className="text-white">${member.balance.toLocaleString()}</TableCell>
              <TableCell className="text-gray-400">
                {new Date(member.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge className={
                  member.status === "active" ? "bg-green-500/20 text-green-400" :
                  member.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }>
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {member.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(member.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => openRejectDialog(member)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-900 border-slate-800 text-white">
                      <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openBalanceDialog(member)}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Adjust Balance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Members Management</h2>
          <p className="text-gray-400 mt-1">Manage and monitor all registered members</p>
        </div>
        <div className="flex gap-3">
          <Card className="bg-slate-900 border-slate-800 px-4 py-2">
            <p className="text-gray-400 text-sm">Total Members</p>
            <p className="text-white text-2xl font-bold">{users.length}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 px-4 py-2">
            <p className="text-gray-400 text-sm">Pending Approval</p>
            <p className="text-yellow-400 text-2xl font-bold">{pendingUsers.length}</p>
          </Card>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-slate-900 border-slate-800 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600">
            Pending Approval ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-purple-600">
            Active Members ({activeUsers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-purple-600">
            Rejected ({rejectedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderMemberTable(pendingUsers)}
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderMemberTable(activeUsers)}
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderMemberTable(rejectedUsers)}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Full information about the member
            </DialogDescription>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Full Name</Label>
                  <p className="text-white mt-1">{selectedMember.name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white mt-1">{selectedMember.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Balance</Label>
                  <p className="text-white mt-1">${selectedMember.balance.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <Badge className={
                    selectedMember.status === "active" ? "bg-green-500/20 text-green-400 mt-1" :
                    selectedMember.status === "pending" ? "bg-yellow-500/20 text-yellow-400 mt-1" :
                    "bg-red-500/20 text-red-400 mt-1"
                  }>
                    {selectedMember.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-400">Registered</Label>
                  <p className="text-white mt-1">
                    {new Date(selectedMember.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">User ID</Label>
                  <p className="text-white mt-1 text-xs break-all">{selectedMember.id}</p>
                </div>
              </div>

              {selectedMember.status === 'rejected' && selectedMember.rejectionReason && (
                <Card className="bg-red-500/10 border-red-500/20 p-4">
                  <Label className="text-red-400">Rejection Reason</Label>
                  <p className="text-white mt-1">{selectedMember.rejectionReason}</p>
                </Card>
              )}

              {selectedMember.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedMember.id)}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve Member
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      setShowDetailDialog(false);
                      openRejectDialog(selectedMember);
                    }}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Reject Member
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Adjust Balance Dialog */}
      <Dialog open={showBalanceDialog} onOpenChange={setShowBalanceDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Adjust Balance</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update member's account balance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedMember && (
              <div>
                <Label className="text-gray-400">Current Balance</Label>
                <p className="text-white text-2xl font-bold">
                  ${selectedMember.balance.toLocaleString()}
                </p>
              </div>
            )}
            
            <div>
              <Label>New Balance</Label>
              <Input
                type="number"
                placeholder="Enter new balance"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white mt-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-slate-700 text-white hover:bg-slate-800"
                onClick={() => setShowBalanceDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleAdjustBalance}
              >
                Update Balance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Member Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Reject Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Provide a reason for rejecting this member
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedMember && (
              <Card className="bg-slate-800 border-slate-700 p-4">
                <p className="text-gray-400 text-sm">Member</p>
                <p className="text-white font-bold">{selectedMember.name}</p>
                <p className="text-gray-400 text-sm">{selectedMember.email}</p>
              </Card>
            )}
            
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Explain why this member is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white mt-2"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-slate-700 text-white hover:bg-slate-800"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleReject}
                disabled={!rejectionReason}
              >
                Reject Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}