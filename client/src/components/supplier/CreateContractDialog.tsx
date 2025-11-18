import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import api from "../../services/axios";
import { uploadFileToS3 } from "../../services/uploadFile";

interface SupplierRequest {
  _id: string;
  eventId: {
    _id: string;
    name: string;
    date: string;
    budget: number;
  };
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  notesFromClient: string;
  basicEventSummary: string;
  createdAt: string;
}

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: SupplierRequest[];
  onContractCreated: () => void;
}

export const CreateContractDialog = ({
  open,
  onOpenChange,
  requests,
  onContractCreated,
}: CreateContractDialogProps) => {
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [specialTerms, setSpecialTerms] = useState("");
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const selectedRequest = requests.find((r) => r._id === selectedRequestId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedRequest || !totalAmount) {
      toast.error("נא למלא את כל השדות הנדרשים");
      return;
    }

    try {
      setIsUploading(true);
      let s3Key = "";

      if (contractFile) {
        s3Key = await uploadFileToS3(contractFile);
      }

      setIsCreating(true);
      await api.post("/contracts", {
        eventId: selectedRequest.eventId._id,
        clientId: selectedRequest.clientId._id,
        s3Key,
        paymentPlan: [],
        totalAmount: parseFloat(totalAmount),
        terms: specialTerms || serviceDescription,
      });

      toast.success("החוזה נוצר בהצלחה");
      onOpenChange(false);
      setSelectedRequestId("");
      setTotalAmount("");
      setServiceDescription("");
      setSpecialTerms("");
      setContractFile(null);
      onContractCreated();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "שגיאה ביצירת החוזה");
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  const approvedRequests = requests.filter((r) => r.status === "מאושר");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>יצירת חוזה חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request">בחר בקשה מאושרת</Label>
            <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
              <SelectTrigger>
                <SelectValue placeholder="בחר בקשה" />
              </SelectTrigger>
              <SelectContent>
                {approvedRequests.map((request) => (
                  <SelectItem key={request._id} value={request._id}>
                    {request.eventId.name} - {request.clientId.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRequest && (
            <Card>
              <CardContent className="pt-4 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">אירוע: </span>
                  {selectedRequest.eventId.name}
                </p>
                <p>
                  <span className="text-muted-foreground">תאריך: </span>
                  {new Date(selectedRequest.eventId.date).toLocaleDateString("he-IL")}
                </p>
                <p>
                  <span className="text-muted-foreground">בתקציב: </span>
                  ₪{selectedRequest.eventId.budget}
                </p>
                <p>
                  <span className="text-muted-foreground">קליינט: </span>
                  {selectedRequest.clientId.name} ({selectedRequest.clientId.email})
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">תיאור השירותים</Label>
            <Textarea
              id="description"
              value={serviceDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setServiceDescription(e.target.value)}
              rows={3}
              required
              placeholder="תאר את השירותים שתספק"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">סכום החוזה (₪)</Label>
            <Input
              id="amount"
              type="number"
              value={totalAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalAmount(e.target.value)}
              required
              placeholder="הכנס סכום"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">תנאים מיוחדים (אופציונלי)</Label>
            <Textarea
              id="terms"
              value={specialTerms}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSpecialTerms(e.target.value)}
              rows={2}
              placeholder="תנאים נוספים אם יש"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">העלאת קובץ חוזה (PDF)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContractFile(e.target.files?.[0] || null)}
              />
              {contractFile && <span className="text-sm text-muted-foreground">{contractFile.name}</span>}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={isCreating || isUploading || !selectedRequestId}>
              {isCreating || isUploading ? "יוצר..." : "צור חוזה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
