import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import api from "../services/axios";
import { CheckCircle, AlertCircle, Download, PenTool } from "lucide-react";
import { getImageUrl } from "../services/uploadFile";

interface Contract {
  _id: string;
  eventId: {
    _id: string;
    name: string;
    date: string;
  };
  supplierId: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  };
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  s3Key?: string;
  status: string;
  paymentPlan: Array<{
    dueDate: string;
    amount: number;
    note: string;
  }>;
  supplierSignature?: {
    signatureMeta: any;
    at: string;
  };
  clientSignatures: Array<{
    clientId: string;
    signatureMeta: any;
    at: string;
  }>;
  createdAt: string;
}

export default function ContractsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signingContractId, setSigningContractId] = useState<string | null>(null);

  const fetchContracts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/contracts");
      setContracts(response.data.contracts || response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "שגיאה בטעינת החוזים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchContracts();
    }
  }, [user?._id]);

  const handleSignContract = async (contractId: string) => {
    try {
      setSigningContractId(contractId);
      await api.post(`/contracts/${contractId}/sign`, {
        party: "client",
        signatureMeta: {
          timestamp: new Date().toISOString(),
          userId: user?._id,
        },
      });
      // Refresh contracts after signing
      fetchContracts();
      alert("החוזה חתום בהצלחה!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "שגיאה בחתימת החוזה");
    } finally {
      setSigningContractId(null);
    }
  };

  const handleDownloadContract = async (contractId: string) => {
    try {
      const contract = contracts.find((c) => c._id === contractId);
      if (!contract?.s3Key) {
        alert("אין קובץ חוזה");
        return;
      }
      const url = await getImageUrl(contract.s3Key);
      window.open(url, "_blank");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "שגיאה בהורדת החוזה");
    }
  };

  const isClientSigned = (contract: Contract) => {
    return contract.clientSignatures?.some((sig) => sig.clientId === user?._id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "awaiting_supplier":
        return "bg-yellow-100 text-yellow-800";
      case "awaiting_client":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "טיוטה",
      awaiting_supplier: "ממתין לספק",
      awaiting_client: "ממתין לקליינט",
      active: "פעיל",
      completed: "הושלם",
      cancelled: "בוטל",
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="text-center py-8">טוען חוזים...</div>;
  }

  return (
    <div className="space-y-6 p-6" style={{ direction: "rtl" }}>
      <div>
        <h1 className="text-3xl font-bold">החוזים שלי</h1>
        <p className="text-muted-foreground mt-2">ניהול וחתימה על חוזים</p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">אין חוזים</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map((contract) => {
            const isClientSignedByMe = isClientSigned(contract);
            const isSupplierSigned = !!contract.supplierSignature;
            const bothSigned = isClientSignedByMe && isSupplierSigned;

            return (
              <Card key={contract._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {contract.eventId.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        עם: {contract.supplierId.user.name}
                      </p>
                    </div>
                    <Badge className={getStatusColor(contract.status)}>
                      {getStatusLabel(contract.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    <p>
                      <span className="font-semibold">תאריך אירוע: </span>
                      {new Date(contract.eventId.date).toLocaleDateString(
                        "he-IL"
                      )}
                    </p>
                    <p>
                      <span className="font-semibold">ספק: </span>
                      {contract.supplierId.user.email}
                    </p>
                  </div>

                  {/* Signature Status */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">סטטוס חתימות:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {isSupplierSigned ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        )}
                        <span className="text-sm">ספק חתם</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isClientSignedByMe ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        )}
                        <span className="text-sm">אני חתמתי</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Plan */}
                  {contract.paymentPlan && contract.paymentPlan.length > 0 && (
                    <div className="bg-muted p-3 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">
                        תוכנית תשלומים
                      </h4>
                      <div className="space-y-1 text-sm">
                        {contract.paymentPlan.map((payment, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center"
                          >
                            <span>
                              {new Date(payment.dueDate).toLocaleDateString(
                                "he-IL"
                              )}
                            </span>
                            <span className="font-medium">
                              ₪{payment.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  {bothSigned && (
                    <Badge className="w-full justify-center bg-green-100 text-green-800">
                      החוזה חתום על ידי שני הצדדים ✓
                    </Badge>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {contract.s3Key && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadContract(contract._id)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 ml-2" />
                        הורד חוזה
                      </Button>
                    )}

                    {!isClientSignedByMe && isSupplierSigned && (
                      <Button
                        size="sm"
                        onClick={() => handleSignContract(contract._id)}
                        disabled={signingContractId === contract._id}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <PenTool className="w-4 h-4 ml-2" />
                        {signingContractId === contract._id
                          ? "חותם..."
                          : "חתום על החוזה"}
                      </Button>
                    )}
                  </div>

                  {/* Timestamps */}
                  <p className="text-xs text-muted-foreground">
                    נוצר:{" "}
                    {new Date(contract.createdAt).toLocaleDateString("he-IL")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
