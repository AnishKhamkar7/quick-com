import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import Loading from "@/components/Loading";

export default function RequireAuth() {
  const { user, isLoading, isFetching } = useAuth();

  if (isLoading || isFetching) {
    return <Loading fullScreen text="Checking auth..." size="lg" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
