import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

const roleRedirectMap = {
  ADMIN: "/admin/dashboard",
  CUSTOMER: "/customer/home",
  DELIVERY_PARTNER: "/delivery/dashboard",
};

export default function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={roleRedirectMap[user.role]} replace />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <Outlet />
    </div>
  );
}
