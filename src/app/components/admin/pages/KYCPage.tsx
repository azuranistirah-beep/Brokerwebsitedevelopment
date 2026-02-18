import { useState, useEffect } from "react";
import { FileCheck, X, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
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

interface KYC {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  country: string;
  docType: string;
  idFront: string;
  idBack: string;
  selfie: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export function KYCPage() {
  const [loading, setLoading] = useState(true);
  const [kycSubmissions, setKycSubmissions] = useState<KYC[]>([]);
  const [selectedKYC, setSelectedKYC] = useState<KYC | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchKYC();
  }, []);

  const fetchKYC = async () => {
    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/kyc`
      );

      if (response.ok) {
        const data = await response.json();
        setKycSubmissions(data.kyc || []);
      } else {
        toast.error("Failed to fetch KYC submissions");
      }
    } catch (error: any) {
      console.error("Error fetching KYC:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error loading KYC submissions");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedKYC) return;

    try {
      setProcessingId(selectedKYC.id);
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/kyc/approve`,
        {
          method: "POST",
          body: JSON.stringify({ kycId: selectedKYC.id })
        }
      );

      if (response.ok) {
        toast.success("KYC approved successfully!");
        fetchKYC();
        setShowReviewDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to approve KYC");
      }
    } catch (error: any) {
      console.error("Error approving KYC:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error approving KYC");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedKYC || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setProcessingId(selectedKYC.id);
      
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/admin/kyc/reject`,
        {
          method: "POST",
          body: JSON.stringify({ 
            kycId: selectedKYC.id,
            reason: rejectionReason 
          })
        }
      );

      if (response.ok) {
        toast.success("KYC rejected");
        fetchKYC();
        setShowReviewDialog(false);
        setRejectionReason("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to reject KYC");
      }
    } catch (error: any) {
      console.error("Error rejecting KYC:", error);
      if (!error.message.includes("Authentication failed")) {
        toast.error("Error rejecting KYC");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReview = (kyc: KYC) => {
    setSelectedKYC(kyc);
    setShowReviewDialog(true);
    setRejectionReason("");
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageDialog(true);
  };

  const pendingKYC = kycSubmissions.filter(k => k.status === "pending");
  const approvedKYC = kycSubmissions.filter(k => k.status === "approved");
  const rejectedKYC = kycSubmissions.filter(k => k.status === "rejected");

  const renderKYCTable = (submissions: KYC[]) => (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-800 hover:bg-slate-800/50">
          <TableHead className="text-gray-400">Member</TableHead>
          <TableHead className="text-gray-400">Country</TableHead>
          <TableHead className="text-gray-400">Document Type</TableHead>
          <TableHead className="text-gray-400">Submitted</TableHead>
          <TableHead className="text-gray-400">Status</TableHead>
          <TableHead className="text-gray-400">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-400 py-8">
              No KYC submissions found
            </TableCell>
          </TableRow>
        ) : (
          submissions.map((kyc) => (
            <TableRow key={kyc.id} className="border-slate-800 hover:bg-slate-800/50">
              <TableCell>
                <div>
                  <p className="text-white font-medium">{kyc.userName}</p>
                  <p className="text-gray-400 text-sm">{kyc.userEmail}</p>
                </div>
              </TableCell>
              <TableCell className="text-gray-300">{kyc.country}</TableCell>
              <TableCell className="text-gray-300">{kyc.docType}</TableCell>
              <TableCell className="text-gray-400">
                {new Date(kyc.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge className={
                  kyc.status === "approved" ? "bg-green-500/20 text-green-400" :
                  kyc.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }>
                  {kyc.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => handleReview(kyc)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <FileCheck className="h-4 w-4 mr-1" />
                  Review
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
        <div className="text-white text-xl">Loading KYC submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">KYC Verification</h2>
          <p className="text-gray-400 mt-1">Review and verify member identity documents</p>
        </div>
        <div className="flex gap-3">
          <Card className="bg-slate-900 border-slate-800 px-4 py-2">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-white text-2xl font-bold">{pendingKYC.length}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 px-4 py-2">
            <p className="text-gray-400 text-sm">Approved</p>
            <p className="text-white text-2xl font-bold">{approvedKYC.length}</p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600">
            Pending ({pendingKYC.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-purple-600">
            Approved ({approvedKYC.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-purple-600">
            Rejected ({rejectedKYC.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderKYCTable(pendingKYC)}
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderKYCTable(approvedKYC)}
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderKYCTable(rejectedKYC)}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Review</DialogTitle>
            <DialogDescription className="text-gray-400">
              Verify member identity documents
            </DialogDescription>
          </DialogHeader>

          {selectedKYC && (
            <div className="space-y-4">
              {/* Member Info */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Name</Label>
                    <p className="text-white mt-1">{selectedKYC.userName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Email</Label>
                    <p className="text-white mt-1">{selectedKYC.userEmail}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Country</Label>
                    <p className="text-white mt-1">{selectedKYC.country}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Document Type</Label>
                    <p className="text-white mt-1">{selectedKYC.docType}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Status</Label>
                    <Badge className={`mt-1 ${
                      selectedKYC.status === "approved" ? "bg-green-500/20 text-green-400" :
                      selectedKYC.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {selectedKYC.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-400">Submitted</Label>
                    <p className="text-white mt-1">
                      {new Date(selectedKYC.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Documents */}
              <div className="space-y-3">
                <Label className="text-lg">Submitted Documents</Label>
                
                <div className="grid grid-cols-3 gap-4">
                  {/* ID Front */}
                  <div>
                    <Label className="text-gray-400 text-sm">ID Front</Label>
                    {selectedKYC.idFront && (
                      <div
                        onClick={() => handleViewImage(selectedKYC.idFront)}
                        className="mt-2 cursor-pointer relative group aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500 transition-colors"
                      >
                        <img
                          src={selectedKYC.idFront}
                          alt="ID Front"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ID Back */}
                  <div>
                    <Label className="text-gray-400 mb-2 block">ID Card (Back)</Label>
                    {selectedKYC.idBack && (
                      <div
                        onClick={() => handleViewImage(selectedKYC.idBack)}
                        className="mt-2 cursor-pointer relative group aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500 transition-colors"
                      >
                        <img
                          src={selectedKYC.idBack}
                          alt="ID Back"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selfie */}
                  <div>
                    <Label className="text-gray-400 mb-2 block">Selfie with ID</Label>
                    {selectedKYC.selfie && (
                      <div
                        onClick={() => handleViewImage(selectedKYC.selfie)}
                        className="mt-2 cursor-pointer relative group aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500 transition-colors"
                      >
                        <img
                          src={selectedKYC.selfie}
                          alt="Selfie"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection reason if rejected */}
              {selectedKYC.status === "rejected" && selectedKYC.rejectionReason && (
                <Card className="bg-red-500/10 border-red-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <Label className="text-red-400">Rejection Reason</Label>
                      <p className="text-white mt-1">{selectedKYC.rejectionReason}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Actions for Pending */}
              {selectedKYC.status === "pending" && (
                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <div>
                    <Label className="mb-2 block">Rejection Reason (if rejecting)</Label>
                    <Textarea
                      placeholder="Explain why this KYC is being rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleReject}
                      disabled={!rejectionReason.trim() || processingId === selectedKYC.id}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={processingId === selectedKYC.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <img
              src={selectedImage}
              alt="Document preview"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}