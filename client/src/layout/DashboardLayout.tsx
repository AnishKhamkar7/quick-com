import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleBasedLinks = () => {
    switch (user?.role) {
      case "ADMIN":
        return (
          <>
            <Link to="/admin/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/admin/users" className="hover:text-blue-600">
              Users
            </Link>
            <Link to="/admin/orders" className="hover:text-blue-600">
              Orders
            </Link>
            <Link to="/admin/products" className="hover:text-blue-600">
              Products
            </Link>
            <Link to="/admin/delivery-partners" className="hover:text-blue-600">
              Delivery Partners
            </Link>
          </>
        );
      case "DELIVERY_PARTNER":
        return (
          <>
            <Link to="/delivery/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/delivery/orders" className="hover:text-blue-600">
              Available Orders
            </Link>
            <Link to="/delivery/my-deliveries" className="hover:text-blue-600">
              My Deliveries
            </Link>
            <Link to="/delivery/profile" className="hover:text-blue-600">
              Profile
            </Link>
          </>
        );
      case "CUSTOMER":
        return (
          <>
            <Link to="/customer/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/customer/products" className="hover:text-blue-600">
              Products
            </Link>
            <Link to="/customer/orders" className="hover:text-blue-600">
              My Orders
            </Link>
            <Link to="/customer/profile" className="hover:text-blue-600">
              Profile
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === "ADMIN" && "Admin Panel"}
                {user?.role === "DELIVERY_PARTNER" && "Delivery Portal"}
                {user?.role === "CUSTOMER" && "Customer Portal"}
              </h1>
              <nav className="hidden md:flex space-x-6">
                {getRoleBasedLinks()}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
