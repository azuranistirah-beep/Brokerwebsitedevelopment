import { useState } from "react";
import { Search, Filter, UserCheck, UserX, MoreVertical, Eye, Ban, Key, DollarSign } from "lucide-react";
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

const allMembers = [
  { 
    id: 1, 
    name: "John Doe", 
    email: "john@example.com", 
    country: "USA", 
    status: "active", 
    kyc: "approved",
    balance: 5420.50,
    registered: "2024-01-15",
    lastLogin: "2 hours ago"
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    email: "jane@example.com", 
    country: "UK", 
    status: "active", 
    kyc: "pending",
    balance: 12850.00,
    registered: "2024-01-20",
    lastLogin: "5 hours ago"
  },
  { 
    id: 3, 
    name: "Mike Johnson", 
    email: "mike@example.com", 
    country: "Canada", 
    status: "pending", 
    kyc: "not_submitted",
    balance: 0,
    registered: "2024-02-05",
    lastLogin: "Never"
  },
  { 
    id: 4, 
    name: "Sarah Wilson", 
    email: "sarah@example.com", 
    country: "Australia", 
    status: "blocked", 
    kyc: "rejected",
    balance: 2340.00,
    registered: "2024-01-10",
    lastLogin: "3 days ago"
  },
];

interface MembersPageProps {
  onNavigate?: (menu: string) => void;
}

export function MembersPage({ onNavigate }: MembersPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<typeof allMembers[0] | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");

  const handleViewDetails = (member: typeof allMembers[0]) => {
    setSelectedMember(member);
    setShowDetailDialog(true);
  };

  const handleAdjustBalance = (member: typeof allMembers[0]) => {
    setSelectedMember(member);
    setShowBalanceDialog(true);
  };

  const handleApprove = (memberId: number) => {
    console.log("Approve member:", memberId);
    // TODO: Implement approval logic
  };

  const handleBlock = (memberId: number) => {
    console.log("Block member:", memberId);
    // TODO: Implement block logic
  };

  const renderMemberTable = (members: typeof allMembers) => (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-800 hover:bg-slate-800/50">
          <TableHead className="text-gray-400">Member</TableHead>
          <TableHead className="text-gray-400">Country</TableHead>
          <TableHead className="text-gray-400">Status</TableHead>
          <TableHead className="text-gray-400">KYC</TableHead>
          <TableHead className="text-gray-400">Balance</TableHead>
          <TableHead className="text-gray-400">Registered</TableHead>
          <TableHead className="text-gray-400">Last Login</TableHead>
          <TableHead className="text-gray-400">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id} className="border-slate-800 hover:bg-slate-800/50">
            <TableCell>
              <div>
                <p className="text-white font-medium">{member.name}</p>
                <p className="text-gray-400 text-sm">{member.email}</p>
              </div>
            </TableCell>
            <TableCell className="text-gray-300">{member.country}</TableCell>
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
              <Badge className={
                member.kyc === "approved" ? "bg-green-500/20 text-green-400" :
                member.kyc === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                member.kyc === "rejected" ? "bg-red-500/20 text-red-400" :
                "bg-gray-500/20 text-gray-400"
              }>
                {member.kyc === "not_submitted" ? "Not Submitted" : member.kyc}
              </Badge>
            </TableCell>
            <TableCell className="text-white font-mono">${member.balance.toFixed(2)}</TableCell>
            <TableCell className="text-gray-400">{member.registered}</TableCell>
            <TableCell className="text-gray-400">{member.lastLogin}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                  <DropdownMenuItem 
                    className="hover:bg-slate-700 cursor-pointer"
                    onClick={() => handleViewDetails(member)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {member.status === "pending" && (
                    <DropdownMenuItem 
                      className="hover:bg-slate-700 cursor-pointer text-green-400"
                      onClick={() => handleApprove(member.id)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                  )}
                  {member.status !== "blocked" && (
                    <DropdownMenuItem 
                      className="hover:bg-slate-700 cursor-pointer text-red-400"
                      onClick={() => handleBlock(member.id)}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Block User
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="hover:bg-slate-700 cursor-pointer text-purple-400"
                    onClick={() => handleAdjustBalance(member)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Adjust Balance
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Members Management</h2>
          <p className="text-gray-400 mt-1">Manage all platform members and their accounts</p>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-900 border-slate-800 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button variant="outline" className="border-slate-700 text-gray-300">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
            All Members ({allMembers.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600">
            Pending Approval ({allMembers.filter(m => m.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="blocked" className="data-[state=active]:bg-purple-600">
            Blocked ({allMembers.filter(m => m.status === "blocked").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderMemberTable(allMembers)}
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderMemberTable(allMembers.filter(m => m.status === "pending"))}
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderMemberTable(allMembers.filter(m => m.status === "blocked"))}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete information about {selectedMember?.name}
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
                  <Label className="text-gray-400">Country</Label>
                  <p className="text-white mt-1">{selectedMember.country}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <Badge className={`mt-1 ${
                    selectedMember.status === "active" ? "bg-green-500/20 text-green-400" :
                    selectedMember.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {selectedMember.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-400">KYC Status</Label>
                  <Badge className={`mt-1 ${
                    selectedMember.kyc === "approved" ? "bg-green-500/20 text-green-400" :
                    selectedMember.kyc === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {selectedMember.kyc}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-400">Balance</Label>
                  <p className="text-white mt-1 font-mono">${selectedMember.balance.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Registered</Label>
                  <p className="text-white mt-1">{selectedMember.registered}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Last Login</Label>
                  <p className="text-white mt-1">{selectedMember.lastLogin}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="bg-purple-600 hover:bg-purple-700">Edit Profile</Button>
                <Button variant="outline" className="border-slate-700 text-gray-300">View Trades</Button>
                <Button variant="outline" className="border-slate-700 text-gray-300">View Transactions</Button>
              </div>
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
              Credit or debit balance for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Balance</Label>
              <p className="text-white text-xl font-mono mt-1">
                ${selectedMember?.balance.toFixed(2)}
              </p>
            </div>
            <div>
              <Label>Amount (use - for debit, + for credit)</Label>
              <Input
                type="number"
                placeholder="+100 or -50"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                type="text"
                placeholder="e.g., Bonus, Refund, Adjustment"
                value={balanceReason}
                onChange={(e) => setBalanceReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                Apply Adjustment
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-700"
                onClick={() => setShowBalanceDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
