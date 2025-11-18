import { useSelector } from "react-redux";
import type { RootState } from "../store";
import Dashboard from "./Dashboard";
import SupplierDashboard from "./supplier/SupplierDashboard";

export default function DashboardRouter() {
  const user = useSelector((state: RootState) => state.auth.user);

  // אם המשתמש הוא ספק, הציג דשבורד ספק
  if (user?.role === "supplier") {
    return <SupplierDashboard />;
  }

  // אחרת הציג דשבורד לקוח
  return <Dashboard />;
}
