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
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden md:block border-r bg-muted/40">
        <Sidebar links={links} userRole={user?.role || ""} />
      </aside>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header user={user} onLogout={handleLogout} links={links} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
