import { useState, useEffect } from "react";
import { Search, Download, CheckCircle, X, AlertCircle } from "lucide-react";
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
import { makeAuthenticatedRequest } from "../../../lib/authHelpers";

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  walletAddress?: string;
  walletId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export function WithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/withdrawals`
      );

      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals || []);
      } else {
        toast.error("Failed to fetch withdrawals");
      }
    } catch (error: any) {
      console.error("Error fetching withdrawals:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error loading withdrawals");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    try {
      setProcessingId(selectedWithdrawal.id);
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/withdrawals/approve`,
        {
          method: "POST",
          body: JSON.stringify({ withdrawalId: selectedWithdrawal.id })
        }
      );

      if (response.ok) {
        toast.success("Withdrawal approved successfully!");
        fetchWithdrawals();
        setShowReviewDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to approve withdrawal");
      }
    } catch (error: any) {
      console.error("Error approving withdrawal:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error approving withdrawal");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setProcessingId(selectedWithdrawal.id);
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/withdrawals/reject`,
        {
          method: "POST",
          body: JSON.stringify({ 
            withdrawalId: selectedWithdrawal.id,
            reason: rejectionReason 
          })
        }
      );

      if (response.ok) {
        toast.success("Withdrawal rejected");
        fetchWithdrawals();
        setShowReviewDialog(false);
        setRejectionReason("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to reject withdrawal");
      }
    } catch (error: any) {
      console.error("Error rejecting withdrawal:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error rejecting withdrawal");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReview = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowReviewDialog(true);
    setRejectionReason("");
  };

  const filteredWithdrawals = withdrawals.filter(w =>
    w.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingWithdrawals = filteredWithdrawals.filter(w => w.status === "pending");
  const approvedWithdrawals = filteredWithdrawals.filter(w => w.status === "approved");
  const rejectedWithdrawals = filteredWithdrawals.filter(w => w.status === "rejected");

  const renderWithdrawalTable = (data: Withdrawal[]) => (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-800 hover:bg-slate-800/50">
          <TableHead className="text-gray-400">ID</TableHead>
          <TableHead className="text-gray-400">Member</TableHead>
          <TableHead className="text-gray-400">Amount</TableHead>
          <TableHead className="text-gray-400">Method</TableHead>
          <TableHead className="text-gray-400">Status</TableHead>
          <TableHead className="text-gray-400">Request Date</TableHead>
          <TableHead className="text-gray-400">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-400 py-8">
              No withdrawals found
            </TableCell>
          </TableRow>
        ) : (
          data.map((withdrawal) => (
            <TableRow key={withdrawal.id} className="border-slate-800 hover:bg-slate-800/50">
              <TableCell className="text-white font-mono">{withdrawal.id.substring(0, 8)}...</TableCell>
              <TableCell>
                <div>
                  <p className="text-white font-medium">{withdrawal.userName}</p>
                  <p className="text-gray-400 text-sm">{withdrawal.userEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-white font-mono">${withdrawal.amount.toFixed(2)}</p>
              </TableCell>
              <TableCell className="text-gray-300">{withdrawal.method}</TableCell>
              <TableCell>
                <Badge className={
                  withdrawal.status === "approved" ? "bg-green-500/20 text-green-400" :
                  withdrawal.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }>
                  {withdrawal.status}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-400">
                {new Date(withdrawal.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  onClick={() => handleReview(withdrawal)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {withdrawal.status === "pending" ? "Process" : "View"}
                </Button>
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
        <div className="text-white text-xl">Loading withdrawals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Withdrawals Management</h2>
          <p className="text-gray-400 mt-1">Process and manage member withdrawal requests</p>
        </div>
        <div className="flex gap-3">
          <Card className="bg-slate-900 border-slate-800 px-4 py-2">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-white text-2xl font-bold">
              {pendingWithdrawals.length}
            </p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 px-4 py-2">
            <p className="text-gray-400 text-sm">Total Amount</p>
            <p className="text-white text-2xl font-bold">
              ${pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(0)}
            </p>
          </Card>
        </div>
      </div>

      {/* Search & Export */}
      <Card className="bg-slate-900 border-slate-800 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by ID, member name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button 
            variant="outline" 
            className="border-slate-700 text-gray-300"
            onClick={fetchWithdrawals}
          >
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600">
            Pending ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-purple-600">
            Approved ({approvedWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-purple-600">
            Rejected ({rejectedWithdrawals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderWithdrawalTable(pendingWithdrawals)}
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderWithdrawalTable(approvedWithdrawals)}
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderWithdrawalTable(rejectedWithdrawals)}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Withdrawal Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review and process withdrawal request
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-6">
              {/* Withdrawal Info */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Request ID</Label>
                    <p className="text-white font-mono mt-1">{selectedWithdrawal.id}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Status</Label>
                    <Badge className={`mt-1 ${
                      selectedWithdrawal.status === "approved" ? "bg-green-500/20 text-green-400" :
                      selectedWithdrawal.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {selectedWithdrawal.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-400">Member</Label>
                    <p className="text-white mt-1">{selectedWithdrawal.userName}</p>
                    <p className="text-gray-400 text-sm">{selectedWithdrawal.userEmail}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Withdrawal Amount</Label>
                    <p className="text-white text-xl font-mono mt-1">${selectedWithdrawal.amount.toFixed(2)}</p>
                  </div>
                </div>
              </Card>

              {/* Payment Details */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <Label className="text-lg mb-3 block">Payment Details</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-400">Method</Label>
                    <p className="text-white mt-1">{selectedWithdrawal.method}</p>
                  </div>
                  
                  {selectedWithdrawal.bankName && (
                    <>
                      <div>
                        <Label className="text-gray-400">Bank Name</Label>
                        <p className="text-white mt-1">{selectedWithdrawal.bankName}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Account Number</Label>
                        <p className="text-white font-mono mt-1">{selectedWithdrawal.accountNumber}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Account Name</Label>
                        <p className="text-white mt-1">{selectedWithdrawal.accountName}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedWithdrawal.walletAddress && (
                    <div>
                      <Label className="text-gray-400">Wallet Address</Label>
                      <p className="text-white font-mono text-sm mt-1 break-all">{selectedWithdrawal.walletAddress}</p>
                    </div>
                  )}
                  
                  {selectedWithdrawal.walletId && (
                    <div>
                      <Label className="text-gray-400">Wallet ID</Label>
                      <p className="text-white mt-1">{selectedWithdrawal.walletId}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions for Pending */}
              {selectedWithdrawal.status === "pending" && (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Rejection Reason (if rejecting)</Label>
                    <Textarea
                      placeholder="Explain the rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={processingId === selectedWithdrawal.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Process
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleReject}
                      disabled={!rejectionReason.trim() || processingId === selectedWithdrawal.id}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                </div>
              )}

              {/* Show rejection reason if already rejected */}
              {selectedWithdrawal.status === "rejected" && selectedWithdrawal.rejectionReason && (
                <Card className="bg-red-500/10 border-red-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <Label className="text-red-400">Rejection Reason</Label>
                      <p className="text-white mt-1">{selectedWithdrawal.rejectionReason}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
