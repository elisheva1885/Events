
import { Routes, Route } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import MyEvents from "./pages/MyEvents";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
      <Route path="/my-events"
        element={
          <AppLayout>
            <MyEvents />
          </AppLayout>
        }
      />
    </Routes >
  );
}
