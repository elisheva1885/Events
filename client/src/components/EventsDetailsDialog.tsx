import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import  Button  from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useExecuteAction, useEntityGetAll } from "@blockscom/blocks-client-sdk/reactSdk";
import {
  GetSupplierRecommendationsAction,
  SupplierRequestsEntity,
  ContractsEntity,
  PaymentsEntity,
} from "../Utils/DataUtils";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { formatEventDate } from "../Utils/DataUtils";

interface EventDetailsDialogProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailsDialog = ({
  event,
  open,
  onOpenChange,
}: EventDetailsDialogProps) => {
  const [showRecommendations, setShowRecommendations] = useState(false);

  const { executeFunction, result, isLoading } = useExecuteAction(
    GetSupplierRecommendationsAction
  );

  const { data: requests } = useEntityGetAll(SupplierRequestsEntity, {
    eventId: event.id,
  });

  const { data: contracts } = useEntityGetAll(ContractsEntity, {
    eventId: event.id,
  });

  const { data: payments } = useEntityGetAll(PaymentsEntity, {
    eventId: event.id,
  });

  const handleGetRecommendations = async () => {
    if (!event.eventType || !event.location || !event.budget || !event.guestCount) {
      toast.error("נא למלא את כל פרטי האירוע לקבלת המלצות");
      return;
    }

    try {
      await executeFunction({
        eventType: event.eventType,
        location: event.location,
        budget: event.budget,
        guestCount: event.guestCount,
        eventDate: event.eventDate,
      });
      setShowRecommendations(true);
      toast.success("המלצות נוצרו בהצלחה");
    } catch (error) {
      toast.error("שגיאה בקבלת המלצות");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>{event.eventName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>פרטי האירוע</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">סוג אירוע:</span>
                  <p className="font-medium">{event.eventType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">תאריך:</span>
                  <p className="font-medium">{formatEventDate(event.eventDate)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">מיקום:</span>
                  <p className="font-medium">{event.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">מספר אורחים:</span>
                  <p className="font-medium">{event.guestCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">תקציב:</span>
                  <p className="font-medium">₪{event.budget?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">סטטוס:</span>
                  <Badge>{event.status}</Badge>
                </div>
              </div>
              {event.notes && (
                <div>
                  <span className="text-muted-foreground">הערות:</span>
                  <p className="mt-1">{event.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <Button
              onClick={handleGetRecommendations}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  מייצר המלצות...
                </>
              ) : (
                <>
                  <Sparkles className="ml-2 h-4 w-4" />
                  קבל המלצות ספקים
                </>
              )}
            </Button>
          </div>

          {showRecommendations && result?.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>המלצות ספקים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.recommendations.map((rec: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{rec.supplierName}</p>
                          <p className="text-sm text-muted-foreground">
                            {rec.category}
                          </p>
                        </div>
                        <Badge variant="outline">
                          התאמה: {rec.matchScore}%
                        </Badge>
                      </div>
                      <p className="text-sm">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {requests && requests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>בקשות שנשלחו</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {requests.length} בקשות נשלחו לספקים
                </p>
              </CardContent>
            </Card>
          )}

          {contracts && contracts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>חוזים</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {contracts.length} חוזים פעילים
                </p>
              </CardContent>
            </Card>
          )}

          {payments && payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>תשלומים</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {payments.length} תשלומים רשומים
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};