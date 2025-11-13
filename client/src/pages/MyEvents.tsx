import { useState, useMemo } from "react";
import { useUser, useEntityGetAll, useEntityCreate, useEntityUpdate, useEntityDelete, useExecuteAction } from "@blockscom/blocks-client-sdk/reactSdk";
// import { Event, GetSupplierRecommendationsAction } from "../types/type";
import { Event} from "../types/type";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import  Button  from "../components/ui/button";
// import { Badge } from "../components/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatEventDate, getEventStatusProgress } from "../utils/DataUtils";
import { EventFormDialog } from "../components/EventFormDialog";
import { EventDetailsDialog } from "../components/EventsDetailsDialog";

export default function MyEvents() {
  const user = useUser();
  const [selectedTab, setSelectedTab] = useState("הכל");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [viewingEvent, setViewingEvent] = useState<any>(null);

  const { data: events, isLoading } = useEntityGetAll(Event, {
    clientEmail: user.email,
  });

  const { createFunction, isLoading: isCreating } = useEntityCreate(Event);
  const { updateFunction, isLoading: isUpdating } = useEntityUpdate(Event);
  const { deleteFunction, isLoading: isDeleting } = useEntityDelete(Event);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (selectedTab === "הכל") return events;
    return events.filter((e) => e.status === selectedTab);
  }, [events, selectedTab]);

  const handleCreateEvent = async (data: any) => {
    try {
      await createFunction({
        data: {
          ...data,
          clientEmail: user.email,
          status: "תכנון",
        },
      });
      toast.success("האירוע נוצר בהצלחה");
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error("שגיאה ביצירת האירוע");
    }
  };

  const handleUpdateEvent = async (data: any) => {
    if (!editingEvent) return;
    try {
      await updateFunction({
        id: editingEvent.id,
        data,
      });
      toast.success("האירוע עודכן בהצלחה");
      setEditingEvent(null);
    } catch (error) {
      toast.error("שגיאה בעדכון האירוע");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את האירוע?")) return;
    try {
      await deleteFunction({ id: eventId });
      toast.success("האירוע נמחק בהצלחה");
    } catch (error) {
      toast.error("שגיאה במחיקת האירוע");
    }
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">האירועים שלי</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          צור אירוע חדש
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="תכנון">תכנון</TabsTrigger>
          <TabsTrigger value="פעיל">פעיל</TabsTrigger>
          <TabsTrigger value="הושלם">הושלם</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => {
                const progress = getEventStatusProgress(event.status);
                return (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{event.eventName}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.eventType}
                          </p>
                        </div>
                        {/* <Badge
                          variant={
                            event.status === "הושלם"
                              ? "secondary"
                              : event.status === "פעיל"
                              ? "default"
                              : "outline"
                          }
                        >
                          {event.status}
                        </Badge> */}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">תאריך:</span>
                          <span>{formatEventDate(event.eventDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">מיקום:</span>
                          <span>{event.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">אורחים:</span>
                          <span>{event.guestCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">תקציב:</span>
                          <span>₪{event.budget?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>התקדמות</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setViewingEvent(event)}
                        >
                          <Eye className="ml-2 h-4 w-4" />
                          צפה בפרטים
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEvent(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">אין אירועים להצגה</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  צור אירוע ראשון
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <EventFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateEvent}
        isLoading={isCreating}
      />

      {editingEvent && (
        <EventFormDialog
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          onSubmit={handleUpdateEvent}
          isLoading={isUpdating}
          initialData={editingEvent}
        />
      )}

      {viewingEvent && (
        <EventDetailsDialog
          event={viewingEvent}
          open={!!viewingEvent}
          onOpenChange={(open) => !open && setViewingEvent(null)}
        />
      )}
    </div>
  );
}