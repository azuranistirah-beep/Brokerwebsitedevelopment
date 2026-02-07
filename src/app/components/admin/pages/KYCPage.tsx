import { useState } from "react";
import { FileCheck, X, CheckCircle, AlertCircle, Image as ImageIcon, User } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";

const kycSubmissions = [
  {
    id: 1,
    name: "Jane Smith",
    email: "jane@example.com",
    country: "UK",
    status: "pending",
    submittedDate: "2024-02-07 10:30",
    docType: "Passport",
    documents: {
      idFront: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500",
      idBack: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500",
      selfie: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500",
    }
  },
  {
    id: 2,
    name: "Tom Brown",
    email: "tom@example.com",
    country: "Canada",
    status: "pending",
    submittedDate: "2024-02-07 09:15",
    docType: "Driver License",
    documents: {
      idFront: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500",
      idBack: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500",
      selfie: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500",
    }
  },
  {
    id: 3,
    name: "Alice Green",
    email: "alice@example.com",
    country: "USA",
    status: "approved",
    submittedDate: "2024-02-06 14:20",
    approvedDate: "2024-02-06 15:30",
    docType: "Passport",
    documents: {
      idFront: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500",
      idBack: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500",
      selfie: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500",
    }
  },
  {
    id: 4,
    name: "Bob White",
    email: "bob@example.com",
    country: "Australia",
    status: "rejected",
    submittedDate: "2024-02-05 11:45",
    rejectedDate: "2024-02-05 16:00",
    rejectionReason: "Document is blurry and unreadable",
    docType: "National ID",
    documents: {
      idFront: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500",
      idBack: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      selfie: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500",
    }
  },
];

const rejectionReasons = [
  "Document is blurry or unreadable",
  "Document has expired",
  "Name doesn't match account name",
  "Suspected fake or edited document",
  "Selfie doesn't match ID photo",
  "Document type not accepted",
  "Other (specify below)",
];

export function KYCPage() {
  const [selectedKYC, setSelectedKYC] = useState<typeof kycSubmissions[0] | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleReview = (kyc: typeof kycSubmissions[0]) => {
    setSelectedKYC(kyc);
    setShowReviewDialog(true);
  };

  const handleApprove = () => {
    console.log("Approve KYC:", selectedKYC?.id);
    setShowReviewDialog(false);
    // TODO: Implement approval logic
  };

  const handleReject = () => {
    console.log("Reject KYC:", selectedKYC?.id, "Reason:", rejectionReason || customReason);
    setShowReviewDialog(false);
    // TODO: Implement rejection logic
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageDialog(true);
  };

  const renderKYCTable = (submissions: typeof kycSubmissions) => (
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
        {submissions.map((kyc) => (
          <TableRow key={kyc.id} className="border-slate-800 hover:bg-slate-800/50">
            <TableCell>
              <div>
                <p className="text-white font-medium">{kyc.name}</p>
                <p className="text-gray-400 text-sm">{kyc.email}</p>
              </div>
            </TableCell>
            <TableCell className="text-gray-300">{kyc.country}</TableCell>
            <TableCell className="text-gray-300">{kyc.docType}</TableCell>
            <TableCell className="text-gray-400">{kyc.submittedDate}</TableCell>
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
                {kyc.status === "pending" ? "Review" : "View Details"}
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
          <h2 className="text-2xl font-bold text-white">KYC Verification</h2>
          <p className="text-gray-400 mt-1">Review and verify member identity documents</p>
        </div>
        <div className="flex gap-3">
          <Card className="bg-slate-900 border-slate-800 px-4 py-2">
            <p className="text-gray-400 text-sm">Pending Review</p>
            <p className="text-white text-2xl font-bold">
              {kycSubmissions.filter(k => k.status === "pending").length}
            </p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600">
            Pending ({kycSubmissions.filter(k => k.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-purple-600">
            Approved ({kycSubmissions.filter(k => k.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-purple-600">
            Rejected ({kycSubmissions.filter(k => k.status === "rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderKYCTable(kycSubmissions.filter(k => k.status === "pending"))}
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderKYCTable(kycSubmissions.filter(k => k.status === "approved"))}
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            {renderKYCTable(kycSubmissions.filter(k => k.status === "rejected"))}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review KYC Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Document Review</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review identity documents for {selectedKYC?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedKYC && (
            <div className="space-y-6">
              {/* Member Info */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Full Name</Label>
                    <p className="text-white mt-1">{selectedKYC.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Email</Label>
                    <p className="text-white mt-1">{selectedKYC.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Country</Label>
                    <p className="text-white mt-1">{selectedKYC.country}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Document Type</Label>
                    <p className="text-white mt-1">{selectedKYC.docType}</p>
                  </div>
                </div>
              </Card>

              {/* Documents Preview */}
              <div>
                <Label className="text-lg mb-4 block">Submitted Documents</Label>
                <div className="grid grid-cols-3 gap-4">
                  {/* ID Front */}
                  <div>
                    <Label className="text-gray-400 mb-2 block">ID Card - Front</Label>
                    <div 
                      className="relative aspect-[3/2] bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                      onClick={() => handleViewImage(selectedKYC.documents.idFront)}
                    >
                      <img 
                        src={selectedKYC.documents.idFront} 
                        alt="ID Front" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* ID Back */}
                  <div>
                    <Label className="text-gray-400 mb-2 block">ID Card - Back</Label>
                    <div 
                      className="relative aspect-[3/2] bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                      onClick={() => handleViewImage(selectedKYC.documents.idBack)}
                    >
                      <img 
                        src={selectedKYC.documents.idBack} 
                        alt="ID Back" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Selfie */}
                  <div>
                    <Label className="text-gray-400 mb-2 block">Selfie with ID</Label>
                    <div 
                      className="relative aspect-[3/2] bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                      onClick={() => handleViewImage(selectedKYC.documents.selfie)}
                    >
                      <img 
                        src={selectedKYC.documents.selfie} 
                        alt="Selfie" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-2">Click on any image to view in full size</p>
              </div>

              {/* Actions for Pending */}
              {selectedKYC.status === "pending" && (
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
                      Approve KYC
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleReject}
                      disabled={!rejectionReason}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject KYC
                    </Button>
                  </div>
                </div>
              )}

              {/* Show rejection reason if already rejected */}
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Image View Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl" aria-describedby="image-dialog-description">
          <span id="image-dialog-description" className="sr-only">Full size document preview</span>
          <img 
            src={selectedImage} 
            alt="Full size document" 
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}