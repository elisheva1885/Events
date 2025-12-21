import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSuppliers,
  fetchSupplierById,
  clearSelectedSupplier,
} from "../store/suppliersSlice";
import { fetchRegions } from "../store/regionsSlice";
import type { RootState, AppDispatch } from "../store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { MapPin, Search, Send } from "lucide-react";
import { SupplierDetailsDialog } from "../components/supplier/SupplierDetailsDialog";
import type { Supplier } from "../types/Supplier";
import { getImageUrl } from "../services/uploadFile";
import { createSupplierRequest } from "../store/supplierRequestsSlice";
import { Badge } from "../components/ui/badge";
import { SendRequestDialog } from "../components/Request/SendRequestDialog";
import { toast } from "sonner";
import { getErrorMessage } from "@/Utils/error";

export default function Suppliers() {
  const dispatch: AppDispatch = useDispatch();
  const { suppliersList, selectedSupplier, page: serverPage, pages: totalPages, total } = useSelector((state: RootState) => state.suppliers);
  const regions = useSelector((state: RootState) => state.regions?.list || []);
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(9); // Set to 9 per page (change this number as needed)
  const [regionFilter, setRegionFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewingSupplier, setViewingSupplier] = useState(false);
  const [sendRequest, setSendRequest] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [suppliersWithUrls, setSuppliersWithUrls] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<{ _id: string; label: string }[]>([]); // Update the categories state type to match the expected structure

  // דיבאונס לחיפוש
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // טוען ספקים עם פילטרים
  useEffect(() => {
    const filters: Record<string, string | number> = {};
    if (selectedCategory !== "הכל") filters.category = selectedCategory;
    if (regionFilter && regionFilter !== "all") filters.region = regionFilter;
    if (debouncedSearch) filters.q = debouncedSearch;
    if (budgetFilter !== null) filters.maxBudget = budgetFilter;
    filters.page = page;
    filters.limit = limit;
    dispatch(fetchSuppliers(filters));
  }, [dispatch, selectedCategory, regionFilter, debouncedSearch, page, limit, budgetFilter]);

  useEffect(() => {
    const loadUrls = async () => {
      if (!suppliersList) return;

      const updated = await Promise.all(
        suppliersList.map(async (s) => {
          if (s.profileImage?.key) {
            const key = await getImageUrl(s.profileImage.key);
            return { ...s, profileImage: { ...s.profileImage, key } };
          }
          return s;
        })
      );
      setSuppliersWithUrls(updated);
    };
    loadUrls();
  }, [suppliersList]);

  // Sync page with server response (if server returns a different page)
  useEffect(() => {
    if (serverPage && serverPage !== page) {
      setPage(serverPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPage]);

  // Fetch categories from the server
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories'); 
        const data = await response.json();

        if (Array.isArray(data) && data.every(item => '_id' in item && 'label' in item)) {
          setCategories(data);
        } else {
          console.error('Invalid categories data structure:', data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch regions on component mount
  useEffect(() => {
    dispatch(fetchRegions());
  }, [dispatch]);

  const handleSelectSupplier = (id: string) => {
    dispatch(fetchSupplierById(id));
  };

  const handleSendRequest = async ({
    eventId,
    requestMessage,
    supplierId,
  }: {
    eventId: string;
    requestMessage: string;
    supplierId: string;
  }) => {
    try {
      setIsSending(true);

       await dispatch(
        createSupplierRequest({
          eventId,
          notesFromClient: requestMessage,
          supplierId: supplierId,
        })
      ).unwrap();


      toast.success("הבקשה נשלחה בהצלחה");
      dispatch(clearSelectedSupplier());
      setSendRequest(false);
    } catch (err: unknown) {
      console.error("❌ Error sending request:", err);
      toast.error(getErrorMessage(err, "שגיאה בשליחת הבקשה"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <h1 className="text-3xl font-bold">קטלוג ספקים</h1>

      {/* פילטרים */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">קטגוריה</label>
              <Select
                value={selectedCategory}
                onValueChange={(v) => { setSelectedCategory(v); setPage(1); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="הכל">הכל</SelectItem>

                  {categories.map((category) => (
                    <SelectItem
                      key={category._id}
                      value={category._id}
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">אזור</label>
              <Select
                value={regionFilter}
                onValueChange={(v) => { setRegionFilter(v); setPage(1); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר אזור" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל האזורים</SelectItem>
                  {(regions && Array.isArray(regions) ? regions : []).map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">תקציב מקסימלי (₪)</label>
              <Input
                type="number"
                placeholder="הזן תקציב"
                value={budgetFilter ?? ''}
                onChange={(e) => { setBudgetFilter(e.target.value ? Number(e.target.value) : null); setPage(1); }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">חיפוש</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חפש ספק..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pr-10"
                />
              </div>
            </div>


          </div>
        </CardContent>
      </Card>

      {/* רשימת ספקים */}
      {suppliersWithUrls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliersWithUrls.map((s) => (
            <Card
              key={s._id}
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => {
                handleSelectSupplier(s._id);
                setViewingSupplier(true);
              }}
            >
              <CardHeader>
                {s.profileImage?.key ? (
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-4">
                    <img
                      src={s.profileImage.key}
                      alt={s.profileImage.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center">
                    אין תמונה
                  </div>
                )}
                <CardTitle className="text-lg">{s.user?.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {s.category && (
                  <Badge className="text-sm">{s.category.label}</Badge>
                )}

                {typeof s.baseBudget !== 'undefined' && (
                  <div className="text-sm">
                    <strong>מחיר בסיסי: </strong>₪{s.baseBudget}
                  </div>
                )}

                {/* אזורים */}
                {s.regions && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{s.regions}</span>
                  </div>
                )}

                {/* סטטוס */}
                {s.status && (
                  <div className="text-sm">
                    <strong>סטטוס: </strong>
                    {s.status}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSendRequest(true);
                    handleSelectSupplier(s._id);
                  }}
                >
                  <Send className="ml-2 h-4 w-4" /> שלח בקשה
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              לא נמצאו ספקים התואמים את החיפוש
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination controls */}
      {totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            סה"כ {total} ספקים • עמוד {page} מתוך {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              הקודם
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              הבא
            </Button>
          </div>
        </div>
      )}

      {/* דיאלוגים */}
      {selectedSupplier &&
        (sendRequest ? (
          <SendRequestDialog
            supplier={selectedSupplier}
            open={sendRequest}
            onOpenChange={(open) => {
              if (!open) {
                setSendRequest(false);
                dispatch(clearSelectedSupplier()); 
              }
            }}
            onSubmit={handleSendRequest}
            isLoading={false}
            isSending={isSending}
          />

        ) : (
          <SupplierDetailsDialog
            key={selectedSupplier?._id}
            supplier={selectedSupplier}
            open={viewingSupplier}
            onOpenChange={(open) => {
              if (!open) {
                setViewingSupplier(false);
                dispatch(clearSelectedSupplier()); 
              }
            }}
            onSendRequest={() => {
              setViewingSupplier(false);
              setSendRequest(true);
            }}
            isSending={isSending}
          />
        ))}
    </div>
  );
}