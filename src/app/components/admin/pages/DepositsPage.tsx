import { useState, useEffect } from "react";
import { ArrowDownToLine, CheckCircle, XCircle, Clock, DollarSign, Eye } from "lucide-react";
import { projectId } from "../../../../../utils/supabase/info";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { makeAuthenticatedRequest } from "../../../lib/authHelpers";

interface Deposit {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: string;
  proofImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface DepositsPageProps {
  accessToken: string; // Not used anymore but kept for compatibility
}

export function DepositsPage({ accessToken }: DepositsPageProps) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/deposits`
      );

      if (response.ok) {
        const data = await response.json();
        setDeposits(data.deposits || []);
      } else {
        toast.error("Failed to fetch deposits");
      }
    } catch (error: any) {
      console.error("Error fetching deposits:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error loading deposits");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (depositId: string) => {
    try {
      setProcessingId(depositId);
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/deposits/approve`,
        {
          method: "POST",
          body: JSON.stringify({ depositId })
        }
      );

      if (response.ok) {
        toast.success("Deposit approved successfully!");
        fetchDeposits();
        setShowDetailModal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to approve deposit");
      }
    } catch (error: any) {
      console.error("Error approving deposit:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error approving deposit");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (depositId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessingId(depositId);
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/deposits/reject`,
        {
          method: "POST",
          body: JSON.stringify({ 
            depositId,
            reason: rejectReason 
          })
        }
      );

      if (response.ok) {
        toast.success("Deposit rejected");
        fetchDeposits();
        setShowDetailModal(false);
        setRejectReason("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to reject deposit");
      }
    } catch (error: any) {
      console.error("Error rejecting deposit:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error rejecting deposit");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const openDetailModal = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setShowDetailModal(true);
    setRejectReason("");
  };

  const filteredDeposits = deposits.filter(d => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const stats = {
    total: deposits.length,
    pending: deposits.filter(d => d.status === 'pending').length,
    approved: deposits.filter(d => d.status === 'approved').length,
    rejected: deposits.filter(d => d.status === 'rejected').length,
    totalAmount: deposits.reduce((sum, d) => sum + d.amount, 0),
    pendingAmount: deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Deposits Management</h1>
          <p className="text-gray-400">Review and approve member deposit requests</p>
        </div>
        <Button onClick={fetchDeposits} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-none">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <ArrowDownToLine className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Deposits</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending Amount</p>
              <p className="text-2xl font-bold text-white">${stats.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Deposits Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading deposits...</div>
        ) : filteredDeposits.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ArrowDownToLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No deposits found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{deposit.userName}</p>
                        <p className="text-sm text-gray-400">{deposit.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 font-semibold">${deposit.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300">{deposit.method}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-sm">
                        {new Date(deposit.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(deposit.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDetailModal(deposit)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {deposit.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(deposit.id)}
                              disabled={processingId === deposit.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
          </DialogHeader>
          
          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">User Name</Label>
                  <p className="text-white font-medium">{selectedDeposit.userName}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white">{selectedDeposit.userEmail}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Amount</Label>
                  <p className="text-green-400 font-bold text-xl">${selectedDeposit.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Method</Label>
                  <p className="text-white">{selectedDeposit.method}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <div>{getStatusBadge(selectedDeposit.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-400">Created At</Label>
                  <p className="text-white text-sm">{new Date(selectedDeposit.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedDeposit.proofImage && (
                <div>
                  <Label className="text-gray-400 mb-2 block">Payment Proof</Label>
                  <img 
                    src={selectedDeposit.proofImage} 
                    alt="Payment proof" 
                    className="max-w-full rounded-lg border border-slate-700"
                    loading="lazy"
                  />
                </div>
              )}

              {selectedDeposit.status === 'rejected' && selectedDeposit.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <Label className="text-red-400">Rejection Reason</Label>
                  <p className="text-white mt-1">{selectedDeposit.rejectionReason}</p>
                </div>
              )}

              {selectedDeposit.status === 'pending' && (
                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <div>
                    <Label className="text-gray-400 mb-2 block">Rejection Reason (optional)</Label>
                    <Input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => handleReject(selectedDeposit.id)}
                      disabled={processingId === selectedDeposit.id}
                      variant="outline"
                      className="bg-red-600 hover:bg-red-700 text-white border-none"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedDeposit.id)}
                      disabled={processingId === selectedDeposit.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}