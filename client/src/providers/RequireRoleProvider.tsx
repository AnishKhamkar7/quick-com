import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

interface RequireRoleProps {
  allowedRoles: ["CUSTOMER" | "DELIVERY_PARTNER" | "ADMIN"];
  redirectTo?: string;
}

export default function RequireRole({
  allowedRoles,
  redirectTo = "/login",
}: RequireRoleProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
