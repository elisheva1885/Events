import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import Button from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  initialData?: any;
}

export const EventFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  initialData,
}: EventFormDialogProps) => {
  const [formData, setFormData] = useState({
    eventName: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    budget: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        eventName: initialData.eventName || "",
        eventType: initialData.eventType || "",
        eventDate: initialData.eventDate || "",
        guestCount: initialData.guestCount?.toString() || "",
        budget: initialData.budget?.toString() || "",
        location: initialData.location || "",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        eventName: "",
        eventType: "",
        eventDate: "",
        guestCount: "",
        budget: "",
        location: "",
        notes: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      eventName: formData.eventName,
      eventType: formData.eventType,
      eventDate: formData.eventDate,
      guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      location: formData.location,
      notes: formData.notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "עריכת אירוע" : "יצירת אירוע חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventName">שם האירוע</Label>
            <Input
              id="eventName"
              value={formData.eventName}
              onChange={(e) =>
                setFormData({ ...formData, eventName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">סוג אירוע</Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) =>
                setFormData({ ...formData, eventType: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג אירוע" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="חתונה">חתונה</SelectItem>
                <SelectItem value="בר מצווה">בר מצווה</SelectItem>
                <SelectItem value="ברית">ברית</SelectItem>
                <SelectItem value="אירוסין">אירוסין</SelectItem>
                <SelectItem value="חינה">חינה</SelectItem>
                <SelectItem value="אחר">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">תאריך האירוע</Label>
            <Input
              id="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={(e) =>
                setFormData({ ...formData, eventDate: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestCount">מספר אורחים</Label>
              <Input
                id="guestCount"
                type="number"
                value={formData.guestCount}
                onChange={(e) =>
                  setFormData({ ...formData, guestCount: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">תקציב (₪)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">מיקום</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "שומר..." : "שמור"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};