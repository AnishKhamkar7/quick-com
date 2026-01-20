import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import DashboardLayout from "@/layout/DashboardLayout";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import DeliveryPartnerDashboard from "@/pages/dashboard/DeliveryDashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthLayout from "./layout/AuthLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import NotFound from "./components/NotFound";
import HomePage from "./pages/customer/HomePage";
import MyOrders from "./pages/customer/MyOrders";
import CartPage from "./pages/customer/Cart";
import CustomerProfile from "./pages/customer/Profile";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { CartProvider } from "./context/CartProvider";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/customer/home" element={<HomePage />} />
                  <Route path="/customer/orders" element={<MyOrders />} />
                  <Route path="/customer/cart" element={<CartPage />} />
                  <Route
                    path="/customer/profile"
                    element={<CustomerProfile />}
                  />
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
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
