import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import DashboardLayout from "@/layout/DashboardLayout";
import { CustomerDashboard } from "@/pages/dashboard/CustomerDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import DeliveryPartnerDashboard from "@/pages/dashboard/DeliveryDashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthLayout from "./layout/AuthLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import NotFound from "./components/NotFound";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              <Route path="/customer/home" element={<CustomerDashboard />} />

              <Route
                path="/delivery/dashboard"
                element={<DeliveryPartnerDashboard />}
              />
            </Route>

            <Route
              path="/"
              element={<Navigate to="/customer/dashboard" replace />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
