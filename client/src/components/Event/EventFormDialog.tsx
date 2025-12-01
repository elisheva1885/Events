import { useEffect, useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../ui/select";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";

import { useDispatch, useSelector } from "react-redux";
import { createEvent, updateEvent } from "../../store/eventsSlice";
import type { AppDispatch, RootState } from "../../store";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/utils";

// רשימת ערים
import { useCitiesList } from "../../hooks/useCitiesList";

const GoldInput = (props: any) => (
    <Input
        {...props}
        className={`border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 ${props.className || ""}`}
    />
);

interface EventFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
}

export const EventFormDialog = ({ open, onOpenChange, initialData }: EventFormDialogProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { types: eventTypes, loadingList, loadingOne } = useSelector(
        (state: RootState) => state.events
    );

    const cities = useCitiesList(); // ← רשימת ערים ממשרד הפנים

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cityOpen, setCityOpen] = useState(false);
    const [citySearch, setCitySearch] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        type: "",
        date: "",
        locationRegion: "",
        budget: "",
        estimatedGuests: "",
    });

    // סינון ערים לפי חיפוש
    const filteredCities = useMemo(() => {
        if (!citySearch) return cities.slice(0, 50); // מראה רק 50 ערים בהתחלה
        return cities.filter(city => 
            city.includes(citySearch)
        ).slice(0, 50);
    }, [cities, citySearch]);

    // מילוי נתונים בעת עריכה
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                type: initialData.type || "",
                date: initialData.date ? initialData.date.split("T")[0] : "",
                locationRegion: initialData.locationRegion || "",
                budget: initialData.budget?.toString() || "",
                estimatedGuests: initialData.estimatedGuests?.toString() || "",
            });
        } else {
            setFormData({
                name: "",
                type: "",
                date: "",
                locationRegion: "",
                budget: "",
                estimatedGuests: "",
            });
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Only send fields required for creation (exclude _id, ownerId, status, createdAt, updatedAt)
        const createPayload = {
            name: formData.name,
            type: formData.type,
            date: formData.date,
            locationRegion: formData.locationRegion,
            budget: formData.budget ? parseFloat(formData.budget) : undefined,
            estimatedGuests: formData.estimatedGuests ? parseInt(formData.estimatedGuests) : undefined,
        };

        try {
            if (initialData?._id) {
                await dispatch(updateEvent({ id: initialData._id, data: createPayload }));
            } else {
                // @ts-expect-error: createEvent expects a full Event, but backend will fill missing fields
                await dispatch(createEvent(createPayload));
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving event:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = isSubmitting || loadingList || loadingOne;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800" style={{ direction: "rtl" }}>
                <DialogHeader>
                    <DialogTitle>{initialData ? "עריכת אירוע" : "יצירת אירוע חדש"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* שם האירוע */}
                    <div className="space-y-2">
                        <Label>שם האירוע</Label>
                        <GoldInput
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* סוג אירוע */}
                    <div className="space-y-2">
                        <Label>סוג אירוע</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) =>
                                setFormData({ ...formData, type: value })
                            }
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="בחר סוג אירוע" />
                            </SelectTrigger>

                            <SelectContent>
                                {loadingList ? (
                                    <SelectItem value="none">טוען...</SelectItem>
                                ) : (
                                    eventTypes?.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* תאריך */}
                    <div className="space-y-2">
                        <Label>תאריך האירוע</Label>
                        <GoldInput
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({ ...formData, date: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* מספר אורחים + תקציב */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>מספר אורחים</Label>
                            <GoldInput
                                type="number"
                                value={formData.estimatedGuests}
                                onChange={(e) =>
                                    setFormData({ ...formData, estimatedGuests: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>תקציב (₪)</Label>
                            <GoldInput
                                type="number"
                                value={formData.budget}
                                onChange={(e) =>
                                    setFormData({ ...formData, budget: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* ★ מיקום — רשימת ערים של ישראל עם חיפוש */}
                    <div className="space-y-2">
                        <Label>מיקום (עיר)</Label>

                        <Popover open={cityOpen} onOpenChange={setCityOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={cityOpen}
                                    className="w-full justify-between border-gray-300 hover:border-yellow-500"
                                >
                                    {formData.locationRegion || "בחר עיר..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput 
                                        placeholder="חפש עיר..." 
                                        value={citySearch}
                                        onValueChange={setCitySearch}
                                        className="h-9"
                                    />
                                    <CommandList className="max-h-[300px]">
                                        <CommandEmpty>
                                            {cities.length === 0 ? "טוען ערים..." : "לא נמצאה עיר"}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {filteredCities.map((city) => (
                                                <CommandItem
                                                    key={city}
                                                    value={city}
                                                    onSelect={(currentValue) => {
                                                        setFormData({ ...formData, locationRegion: currentValue });
                                                        setCityOpen(false);
                                                        setCitySearch("");
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.locationRegion === city ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {city}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* כפתור שמירה */}
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
