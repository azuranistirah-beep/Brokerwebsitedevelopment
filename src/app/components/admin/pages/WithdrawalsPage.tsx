import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";

const withdrawals = [
  {
    id: "WD001",
    member: "John Doe",
    email: "john@example.com",
    amount: 500.00,
    fee: 5.00,
    netAmount: 495.00,
    method: "Bank Transfer",
    bankName: "Chase Bank",
    accountNumber: "****5678",
    accountName: "John Doe",
    kycStatus: "approved",
    status: "pending",
    requestDate: "2024-02-07 10:30",
  },
  {
    id: "WD002",
    member: "Jane Smith",
    email: "jane@example.com",
    amount: 1200.00,
    fee: 12.00,
    netAmount: 1188.00,
    method: "Crypto (BTC)",
    walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    kycStatus: "approved",
    status: "pending",
    requestDate: "2024-02-07 09:15",
  },
  {
    id: "WD003",
    member: "Mike Johnson",
    email: "mike@example.com",
    amount: 750.00,
    fee: 7.50,
    netAmount: 742.50,
    method: "E-wallet",
    walletId: "paypal@mike.com",
    kycStatus: "pending",
    status: "pending",
    requestDate: "2024-02-07 08:45",
  },
  {
    id: "WD004",
    member: "Sarah Wilson",
    email: "sarah@example.com",
    amount: 2000.00,
    fee: 20.00,
    netAmount: 1980.00,
    method: "Bank Transfer",
    bankName: "Bank of America",
    accountNumber: "****1234",
    accountName: "Sarah Wilson",
    kycStatus: "approved",
    status: "approved",
    requestDate: "2024-02-06 14:20",
    approvedDate: "2024-02-06 15:30",
  },
  {
    id: "WD005",
    member: "Bob White",
    email: "bob@example.com",
    amount: 300.00,
    fee: 3.00,
    netAmount: 297.00,
    method: "Bank Transfer",
    bankName: "Wells Fargo",
    accountNumber: "****9012",
    accountName: "Bob White",
    kycStatus: "rejected",
    status: "rejected",
    requestDate: "2024-02-05 11:30",
    rejectedDate: "2024-02-05 16:00",
    rejectionReason: "KYC verification failed",
  },
];

const rejectionReasons = [
  "Insufficient funds",
  "KYC verification required",
  "Suspicious activity detected",
  "Bank details mismatch",
  "Account under investigation",
  "Bonus wagering requirements not met",
  "Other (specify below)",
];

export function WithdrawalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<typeof withdrawals[0] | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [proofOfPayment, setProofOfPayment] = useState("");

  const handleReview = (withdrawal: typeof withdrawals[0]) => {
    setSelectedWithdrawal(withdrawal);
    setShowReviewDialog(true);
    setRejectionReason("");
    setCustomReason("");
  };

  const handleApprove = () => {
    console.log("Approve withdrawal:", selectedWithdrawal?.id);
    setShowReviewDialog(false);
    // TODO: Implement approval logic
  };

  const handleReject = () => {
    console.log("Reject withdrawal:", selectedWithdrawal?.id, "Reason:", rejectionReason || customReason);
    setShowReviewDialog(false);
    // TODO: Implement rejection logic
  };

  const handleMarkAsPaid = () => {
    console.log("Mark as paid:", selectedWithdrawal?.id, "Proof:", proofOfPayment);
    setShowReviewDialog(false);
    // TODO: Implement mark as paid logic
  };

  const renderWithdrawalTable = (data: typeof withdrawals) => (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-800 hover:bg-slate-800/50">
          <TableHead className="text-gray-400">ID</TableHead>
          <TableHead className="text-gray-400">Member</TableHead>
          <TableHead className="text-gray-400">Amount</TableHead>
          <TableHead className="text-gray-400">Method</TableHead>
          <TableHead className="text-gray-400">KYC Status</TableHead>
          <TableHead className="text-gray-400">Status</TableHead>
          <TableHead className="text-gray-400">Request Date</TableHead>
          <TableHead className="text-gray-400">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((withdrawal) => (
          <TableRow key={withdrawal.id} className="border-slate-800 hover:bg-slate-800/50">
            <TableCell className="text-white font-mono">{withdrawal.id}</TableCell>
            <TableCell>
              <div>
                <p className="text-white font-medium">{withdrawal.member}</p>
                <p className="text-gray-400 text-sm">{withdrawal.email}</p>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="text-white font-mono">${withdrawal.amount.toFixed(2)}</p>
                <p className="text-gray-400 text-xs">Fee: ${withdrawal.fee.toFixed(2)}</p>
                <p className="text-green-400 text-xs font-semibold">Net: ${withdrawal.netAmount.toFixed(2)}</p>
              </div>
            </TableCell>
            <TableCell className="text-gray-300">{withdrawal.method}</TableCell>
            <TableCell>
              <Badge className={
                withdrawal.kycStatus === "approved" ? "bg-green-500/20 text-green-400" :
                withdrawal.kycStatus === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }>
                {withdrawal.kycStatus}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={
                withdrawal.status === "approved" ? "bg-green-500/20 text-green-400" :
                withdrawal.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }>
                {withdrawal.status}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-400">{withdrawal.requestDate}</TableCell>
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
        ))}
      </TableBody>
    </Table>
  );

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
              {withdrawals.filter(w => w.status === "pending").length}
            </p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 px-4 py-2">
            <p className="text-gray-400 text-sm">Total Amount</p>
            <p className="text-white text-2xl font-bold">
              ${withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0).toFixed(0)}
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
          <Button variant="outline" className="border-slate-700 text-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600">
            Pending ({withdrawals.filter(w => w.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-purple-600">
            Approved ({withdrawals.filter(w => w.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-purple-600">
            Rejected ({withdrawals.filter(w => w.status === "rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderWithdrawalTable(withdrawals.filter(w => w.status === "pending"))}
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderWithdrawalTable(withdrawals.filter(w => w.status === "approved"))}
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderWithdrawalTable(withdrawals.filter(w => w.status === "rejected"))}
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
                    <p className="text-white mt-1">{selectedWithdrawal.member}</p>
                    <p className="text-gray-400 text-sm">{selectedWithdrawal.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">KYC Status</Label>
                    <Badge className={`mt-1 ${
                      selectedWithdrawal.kycStatus === "approved" ? "bg-green-500/20 text-green-400" :
                      selectedWithdrawal.kycStatus === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {selectedWithdrawal.kycStatus}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-400">Withdrawal Amount</Label>
                    <p className="text-white text-xl font-mono mt-1">${selectedWithdrawal.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Processing Fee</Label>
                    <p className="text-orange-400 font-mono mt-1">-${selectedWithdrawal.fee.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-400">Net Payout Amount</Label>
                    <p className="text-green-400 text-2xl font-mono mt-1">${selectedWithdrawal.netAmount.toFixed(2)}</p>
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

              {/* KYC Warning */}
              {selectedWithdrawal.kycStatus !== "approved" && (
                <Card className="bg-yellow-500/10 border-yellow-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <Label className="text-yellow-400">KYC Not Approved</Label>
                      <p className="text-gray-300 text-sm mt-1">
                        This member's KYC verification is {selectedWithdrawal.kycStatus}. 
                        Consider reviewing their KYC before approving withdrawal.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Actions for Pending */}
              {selectedWithdrawal.status === "pending" && (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Rejection Reason (if rejecting)</Label>
                    <Select value={rejectionReason} onValueChange={setRejectionReason}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {rejectionReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {rejectionReason === "Other (specify below)" && (
                    <div>
                      <Label className="mb-2 block">Custom Reason</Label>
                      <Textarea
                        placeholder="Explain the rejection reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Process
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleReject}
                      disabled={!rejectionReason}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                </div>
              )}

              {/* Mark as Paid for Approved */}
              {selectedWithdrawal.status === "approved" && (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Proof of Payment (Transaction ID or Reference)</Label>
                    <Input
                      type="text"
                      placeholder="Enter transaction reference..."
                      value={proofOfPayment}
                      onChange={(e) => setProofOfPayment(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleMarkAsPaid}
                  >
                    Mark as Paid
                  </Button>
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
