// layouts/DashboardLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { getRoleBasedLinks } from "@/config/navigation";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const links = getRoleBasedLinks(user?.role);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <Sidebar links={links} userRole={user?.role || ""} />
      </div>

      <div className="flex flex-col">
        <Header user={user} onLogout={handleLogout} links={links} />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
