import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CheckCircle, XCircle, Clock, FileText, AlertCircle, Download, Upload, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { uploadFileToS3, getImageUrl } from "../../services/uploadFile";
import api from "../../services/axios";
import { CreateContractDialog } from "./CreateContractDialog";

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
  status: "ממתין" | "מאושר" | "נדחה" | "פג";
  notesFromClient: string;
  basicEventSummary: string;
  createdAt: string;
  hasContract?: boolean;
}

interface SupplierContract {
  _id: string;
  eventId: {
    _id: string;
    name: string;
    date: string;
  };
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  s3Key?: string;
  paymentPlan: Array<{
    dueDate: string;
    amount: number;
    note: string;
  }>;
  createdAt: string;
}

export default function SupplierDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState<SupplierRequest[]>([]);
  const [contracts, setContracts] = useState<SupplierContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingContractId, setUploadingContractId] = useState<string | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [showCreateContractDialog, setShowCreateContractDialog] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const requestsResponse = await api.get("/requests/supplier/requests");
      setRequests(requestsResponse.data.requests || requestsResponse.data);

      const contractsResponse = await api.get("/contracts/supplier");
      setContracts(contractsResponse.data.contracts || contractsResponse.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user?._id, fetchData]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      await api.post(`/requests/${requestId}/approve`, {});
      setRequests(
        requests.map((r) =>
          r._id === requestId ? { ...r, status: "מאושר" } : r
        )
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "שגיאה באישור הבקשה");
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await api.post(`/requests/${requestId}/decline`, {});
      setRequests(
        requests.map((r) =>
          r._id === requestId ? { ...r, status: "נדחה" } : r
        )
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "שגיאה בדחיית הבקשה");
    }
  };

  const handleUploadContract = async (id: string, file: File) => {
    try {
      setUploadingContractId(id);
      const s3Key = await uploadFileToS3(file);
      
      // Check if this is a request or a contract
      const isRequest = requests.some(r => r._id === id);
      
      if (isRequest) {
        // If it's a request, create a new contract
        const request = requests.find(r => r._id === id);
        if (!request) throw new Error('Request not found');
        
        await api.post('/contracts', {
          eventId: request.eventId._id,
          clientId: request.clientId._id,
          s3Key
        });
        
        // Update the request to show it has a contract
        setRequests(requests.map(r => r._id === id ? { ...r, hasContract: true } : r));
      } else {
        // If it's a contract, update it
        await api.put(`/contracts/${id}`, { s3Key });
        setContracts(contracts.map(c => c._id === id ? { ...c, s3Key } : c));
      }
      
      setShowContractModal(false);
      alert("החוזה הועלה בהצלחה!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "שגיאה בהעלאת החוזה");
    } finally {
      setUploadingContractId(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ממתין":
        return "bg-yellow-100 text-yellow-800";
      case "מאושר":
        return "bg-green-100 text-green-800";
      case "נדחה":
        return "bg-red-100 text-red-800";
      case "פג":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ממתין":
        return <Clock className="w-4 h-4" />;
      case "מאושר":
        return <CheckCircle className="w-4 h-4" />;
      case "נדחה":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          שלום, {user?.name || "ספק"}
        </h1>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">בקשות ממתינות</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter((r) => r.status === "ממתין").length}
            </div>
            <p className="text-sm text-muted-foreground">בקשות שצריכות מענה</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">בקשות מאושרות</CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter((r) => r.status === "מאושר").length}
            </div>
            <p className="text-sm text-muted-foreground">בקשות מאושרות</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">חוזים פעילים</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contracts.length}</div>
            <p className="text-sm text-muted-foreground">חוזים פעילים</p>
          </CardContent>
        </Card>
      </div>

      {/* טאבים */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => {
            setActiveTab("requests");
            fetchData();
          }}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "requests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          בקשות ({requests.filter((r) => r.status === "ממתין").length})
        </button>
        <button
          onClick={() => {
            setActiveTab("contracts");
            fetchData();
          }}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "contracts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          חוזים ({contracts.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-8">טוען נתונים...</div>
      ) : activeTab === "requests" ? (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">אין בקשות</div>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* כותרת */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {request.eventId.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          מ: {request.clientId.name} ({request.clientId.email})
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(request.status)} flex gap-1`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                    </div>

                    {/* פרטי אירוע */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">תאריך:</span>{" "}
                        {new Date(request.eventId.date).toLocaleDateString("he-IL")}
                      </p>
                     
                      {request.basicEventSummary && (
                        <p className="text-sm whitespace-pre-wrap">
                          {request.basicEventSummary}
                        </p>
                      )}
                    </div>

                    {/* הערות */}
                    {request.notesFromClient && (
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm font-semibold">הערות מהלקוח:</p>
                        <p className="text-sm text-muted-foreground">{request.notesFromClient}</p>
                      </div>
                    )}

                    {/* כפתורים */}
                    {request.status === "ממתין" && (
                      <div className="flex gap-2 justify-end pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineRequest(request._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          דחה
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />
                          אשר
                        </Button>
                      </div>
                    )}

                    {request.status === "מאושר" && (
                      <div className="flex gap-2 justify-end pt-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedContractId(request._id);
                            setShowContractModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Upload className="w-4 h-4 ml-2" />
                          צרף חוזה
                        </Button>
                      </div>
                    )}

                    {/* תאריך יצירה */}
                    <p className="text-xs text-muted-foreground">
                      נוצרה: {new Date(request.createdAt).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={() => setShowCreateContractDialog(true)}
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            <Plus className="w-4 h-4 ml-2" />
            יצירת חוזה חדש
          </Button>
          {contracts.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">אין חוזים</div>
              </CardContent>
            </Card>
          ) : (
            contracts.map((contract) => (
              <Card key={contract._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* כותרת */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          {contract.eventId.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          עם: {contract.clientId.name}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </Badge>
                    </div>

                    {/* תאריך אירוע */}
                    <p className="text-sm">
                      <span className="font-semibold">תאריך אירוע:</span>{" "}
                      {new Date(contract.eventId.date).toLocaleDateString("he-IL")}
                    </p>

                    {/* תוכנית תשלומים */}
                    {contract.paymentPlan && contract.paymentPlan.length > 0 && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-3">תוכנית תשלומים</h4>
                        <div className="space-y-2">
                          {contract.paymentPlan.map((payment, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <div>
                                <p className="text-sm">
                                  {new Date(payment.dueDate).toLocaleDateString("he-IL")}
                                </p>
                                {payment.note && (
                                  <p className="text-xs text-muted-foreground">{payment.note}</p>
                                )}
                              </div>
                              <p className="text-sm font-semibold">₪{payment.amount?.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* תאריך יצירה */}
                    <p className="text-xs text-muted-foreground">
                      נוצר: {new Date(contract.createdAt).toLocaleDateString("he-IL")}
                    </p>

                    {/* כפתורים */}
                    <div className="flex gap-2 justify-end pt-4">
                      {contract.s3Key ? (
                        <Button
                          size="sm"
                          onClick={() => handleDownloadContract(contract._id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 ml-2" />
                          הורדה
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedContractId(contract._id);
                            setShowContractModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Upload className="w-4 h-4 ml-2" />
                          העלאת חוזה
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal להעלאת חוזה */}
      {showContractModal && selectedContractId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>העלאת חוזה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                id="contractFile"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleUploadContract(selectedContractId, e.target.files[0]);
                  }
                }}
              />
              <Button
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={uploadingContractId === selectedContractId}
              >
                <label htmlFor="contractFile" className="cursor-pointer flex items-center justify-center">
                  <Upload className="w-4 h-4 ml-2" />
                  {uploadingContractId === selectedContractId ? "טוען..." : "בחר קובץ"}
                </label>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowContractModal(false);
                  setSelectedContractId(null);
                }}
                className="w-full"
              >
                סגור
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <CreateContractDialog
        open={showCreateContractDialog}
        onOpenChange={setShowCreateContractDialog}
        requests={requests}
        onContractCreated={fetchData}
      />
    </div>
  );
}
