import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import AuthLayout from "./layout/AuthLayout";
import DashboardLayout from "./layout/DashboardLayout";
import RoleBasedRedirect from "./components/RoleRedirect";

// Dashboard Pages
import {
  CustomerDashboard,
  CustomerProducts,
  CustomerOrders,
  CustomerProfile,
  DeliveryPartnerDashboard,
  DeliveryOrders,
  DeliveryMyDeliveries,
  DeliveryProfile,
  AdminDashboard,
  AdminUsers,
  AdminOrders,
  AdminProducts,
  AdminDeliveryPartners,
} from "./pages/dashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Customer Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/products"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <CustomerProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/orders"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <CustomerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />

            {/* Delivery Partner Routes */}
            <Route
              path="/delivery/dashboard"
              element={
                <ProtectedRoute allowedRoles={["DELIVERY_PARTNER"]}>
                  <DeliveryPartnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery/orders"
              element={
                <ProtectedRoute allowedRoles={["DELIVERY_PARTNER"]}>
                  <DeliveryOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery/my-deliveries"
              element={
                <ProtectedRoute allowedRoles={["DELIVERY_PARTNER"]}>
                  <DeliveryMyDeliveries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery/profile"
              element={
                <ProtectedRoute allowedRoles={["DELIVERY_PARTNER"]}>
                  <DeliveryProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/delivery-partners"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDeliveryPartners />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Role-based redirect for root and /dashboard */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* 404 - Redirect to role-based dashboard */}
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
