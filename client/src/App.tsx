import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import DashboardLayout from "@/layout/DashboardLayout";
import DeliveryPartnerDashboard from "@/pages/delivery/DeliveryDashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthLayout from "./layout/AuthLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import NotFound from "./components/NotFound";
import HomePage from "./pages/customer/HomePage";
import MyOrders from "./pages/customer/MyOrders";
import CartPage from "./pages/customer/Cart";
import CustomerProfile from "./pages/customer/CustomerProfile";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { CartProvider } from "./providers/CartProvider";
import ProductsPage from "./pages/customer/ProductsPage";
import { Toaster } from "./components/ui/sonner";
import { WebSocketProvider } from "./providers/SocketProvider";
import AvailableOrdersPage from "./pages/delivery/AvailableOrder";
import DeliveryProfile from "./pages/delivery/DeliveryProfile";
import RequireAuth from "./providers/RequireAuthProvider";
import RequireRole from "./providers/RequireRoleProvider";
import DeliveryHistory from "./pages/delivery/HistoryOrders";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster />
        <ThemeProvider>
          <AuthProvider>
            <WebSocketProvider>
              <CartProvider>
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Route>
                  <Route element={<RequireAuth />}>
                    <Route element={<DashboardLayout />}>
                      <Route
                        element={<RequireRole allowedRoles={["CUSTOMER"]} />}
                      >
                        <Route path="/customer/home" element={<HomePage />} />
                        <Route path="/customer/orders" element={<MyOrders />} />
                        <Route path="/customer/cart" element={<CartPage />} />
                        <Route
                          path="/customer/category/:category"
                          element={<ProductsPage />}
                        />
                        <Route
                          path="/customer/profile"
                          element={<CustomerProfile />}
                        />
                      </Route>
                      <Route
                        element={
                          <RequireRole allowedRoles={["DELIVERY_PARTNER"]} />
                        }
                      >
                        <Route
                          path="/delivery/dashboard"
                          element={<DeliveryPartnerDashboard />}
                        />
                        <Route
                          path="/delivery/orders"
                          element={<AvailableOrdersPage />}
                        />
                        <Route
                          path="/delivery/profile"
                          element={<DeliveryProfile />}
                        />
                        <Route
                          path="/delivery/history"
                          element={<DeliveryHistory />}
                        />
                      </Route>
                    </Route>
                  </Route>

                  {/* <Route
                    path="/"
                    element={<Navigate to="/customer/home" replace />}
                  /> */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CartProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
