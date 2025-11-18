import { useState, useMemo } from "react";
import { useUser, useEntityGetAll, useEntityCreate, useEntityUpdate, useExecuteAction } from "@blockscom/blocks-client-sdk/reactSdk";
import {
  ContractsEntity,
  PaymentsEntity,
  EventsEntity,
  SupplierRequestsEntity,
  SuppliersEntity,
  GenerateContractSummaryAction,
  AnalyzePaymentStatusAction,
} from "@/product-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, DollarSign, Plus, CheckCircle, AlertCircle, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { CreateContractDialog } from "@/components/CreateContractDialog";
import { CreatePaymentDialog } from "@/components/CreatePaymentDialog";
import { MarkPaymentPaidDialog } from "@/components/MarkPaymentPaidDialog";
import { formatEventDate, isPaymentOverdue } from "@/utils/DateUtils";
import { getPaymentStatusVariant } from "@/utils/PaymentUtils";

export default function ContractsPayments() {
  const user = useUser();
  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [analyzingEventId, setAnalyzingEventId] = useState<string | null>(null);

  const { data: contracts } = useEntityGetAll(ContractsEntity, {
    clientEmail: user.email,
  });

  const { data: payments } = useEntityGetAll(PaymentsEntity);
  const { data: events } = useEntityGetAll(EventsEntity, { clientEmail: user.email });
  const { data: requests } = useEntityGetAll(SupplierRequestsEntity, {
    clientEmail: user.email,
  });
  const { data: suppliers } = useEntityGetAll(SuppliersEntity);

  const { executeFunction: analyzePayments, result: analysisResult, isLoading: isAnalyzing } =
    useExecuteAction(AnalyzePaymentStatusAction);

  const eventsMap = useMemo(() => {
    if (!events) return new Map();
    return new Map(events.map((e) => [e.id, e]));
  }, [events]);

  const suppliersMap = useMemo(() => {
    if (!suppliers) return new Map();
    return new Map(suppliers.map((s) => [s.id, s]));
  }, [suppliers]);

  const enrichedContracts = useMemo(() => {
    if (!contracts) return [];
    return contracts.map((contract) => ({
      ...contract,
      event: eventsMap.get(contract.eventId || ""),
      supplier: suppliersMap.get(contract.supplierId || ""),
    }));
  }, [contracts, eventsMap, suppliersMap]);

  const paymentsByEvent = useMemo(() => {
    if (!payments || !events) return new Map();

    const grouped = new Map<string, any[]>();
    payments.forEach((payment) => {
      if (payment.eventId) {
        const existing = grouped.get(payment.eventId) || [];
        grouped.set(payment.eventId, [...existing, payment]);
      }
    });

    return grouped;
  }, [payments, events]);

  const eventPaymentSummaries = useMemo(() => {
    if (!events || !contracts) return [];

    return events.map((event) => {
      const eventPayments = paymentsByEvent.get(event.id) || [];
      const eventContracts = contracts.filter((c) => c.eventId === event.id);
      const totalContract = eventContracts.reduce(
        (sum, c) => sum + (c.totalAmount || 0),
        0
      );
      const totalPaid = eventPayments
        .filter((p) => p.status === "שולם")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const remaining = totalContract - totalPaid;
      const progress = totalContract > 0 ? (totalPaid / totalContract) * 100 : 0;

      return {
        event,
        totalContract,
        totalPaid,
        remaining,
        progress,
        paymentsCount: eventPayments.length,
      };
    });
  }, [events, contracts, paymentsByEvent]);

  const allPayments = useMemo(() => {
    if (!payments) return [];
    return payments
      .map((payment) => ({
        ...payment,
        event: eventsMap.get(payment.eventId || ""),
        contract: contracts?.find((c) => c.id === payment.contractId),
      }))
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [payments, eventsMap, contracts]);

  const handleAnalyzePayments = async (eventId: string) => {
    setAnalyzingEventId(eventId);
    try {
      await analyzePayments({ eventId });
      toast.success("ניתוח תשלומים הושלם");
    } catch (error) {
      toast.error("שגיאה בניתוח תשלומים");
    }
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div>
        <h1 className="text-3xl font-bold">חוזים ותשלומים</h1>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">החוזים שלי</h2>
          <Button onClick={() => setIsCreateContractOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            צור חוזה חדש
          </Button>
        </div>

        {enrichedContracts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedContracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {contract.event?.eventName} - {contract.supplier?.supplierName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">סכום החוזה:</span>
                    <span className="font-medium">
                      ₪{contract.totalAmount?.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {contract.clientSigned ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">לקוח חתם</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract.supplierSigned ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">ספק חתם</span>
                    </div>
                  </div>

                  {contract.clientSigned && contract.supplierSigned && (
                    <Badge className="w-full justify-center">חוזה מאושר</Badge>
                  )}

                  <div className="flex gap-2">
                    {contract.contractFileUrl && (
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a
                          href={contract.contractFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="ml-2 h-4 w-4" />
                          הורד PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">אין חוזים עדיין</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">התשלומים שלי</h2>
          <Button onClick={() => setIsCreatePaymentOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            הוסף תשלום
          </Button>
        </div>

        {eventPaymentSummaries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventPaymentSummaries.map((summary) => (
              <Card key={summary.event.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{summary.event.eventName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">סה"כ חוזה:</span>
                      <span>₪{summary.totalContract.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">שולם:</span>
                      <span className="text-green-600">
                        ₪{summary.totalPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">יתרה:</span>
                      <span>₪{summary.remaining.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>התקדמות</span>
                      <span>{Math.round(summary.progress)}%</span>
                    </div>
                    <Progress value={summary.progress} className="h-2" />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAnalyzePayments(summary.event.id)}
                    disabled={isAnalyzing && analyzingEventId === summary.event.id}
                  >
                    נתח תשלומים
                  </Button>

                  {analyzingEventId === summary.event.id && analysisResult && (
                    <div className="text-xs space-y-1 pt-2 border-t">
                      {analysisResult.alerts?.map((alert: string, idx: number) => (
                        <p key={idx} className="text-destructive">
                          • {alert}
                        </p>
                      ))}
                      {analysisResult.recommendations?.map(
                        (rec: string, idx: number) => (
                          <p key={idx} className="text-muted-foreground">
                            • {rec}
                          </p>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {allPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>כל התשלומים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-2">אירוע</th>
                      <th className="text-right p-2">סכום</th>
                      <th className="text-right p-2">תאריך פירעון</th>
                      <th className="text-right p-2">סטטוס</th>
                      <th className="text-right p-2">תאריך תשלום</th>
                      <th className="text-right p-2">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayments.map((payment) => {
                      const overdue = isPaymentOverdue(
                        payment.dueDate,
                        payment.status
                      );
                      return (
                        <tr key={payment.id} className="border-b">
                          <td className="p-2">{payment.event?.eventName}</td>
                          <td className="p-2">₪{payment.amount?.toLocaleString()}</td>
                          <td className="p-2">
                            {formatEventDate(payment.dueDate)}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={getPaymentStatusVariant(
                                payment.status,
                                overdue
                              )}
                            >
                              {overdue ? "באיחור" : payment.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {payment.paidDate
                              ? formatEventDate(payment.paidDate)
                              : "-"}
                          </td>
                          <td className="p-2">
                            {payment.status === "ממתין" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                סמן כשולם
                              </Button>
                            )}
                            {payment.receiptUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={payment.receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateContractDialog
        open={isCreateContractOpen}
        onOpenChange={setIsCreateContractOpen}
        requests={requests?.filter((r) => r.status === "אושר") || []}
        suppliers={suppliers || []}
        events={events || []}
      />

      <CreatePaymentDialog
        open={isCreatePaymentOpen}
        onOpenChange={setIsCreatePaymentOpen}
        contracts={contracts || []}
        events={events || []}
      />

      {selectedPayment && (
        <MarkPaymentPaidDialog
          payment={selectedPayment}
          open={!!selectedPayment}
          onOpenChange={(open) => !open && setSelectedPayment(null)}
        />
      )}
    </div>
  );
}