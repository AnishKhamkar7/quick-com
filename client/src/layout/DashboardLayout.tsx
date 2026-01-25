import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { getRoleBasedLinks } from "@/config/navigation";
import Loading from "@/components/Loading";

export default function DashboardLayout() {
  const { user, logout, isLoading, isFetching } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading || isFetching) {
    console.log("IM HERERE");
    return <Loading fullScreen text="Loading profile..." size="lg" />;
  }

  console.log("USERRRRRRR", user);

  const links = getRoleBasedLinks(user?.role);
  console.log("User role in DashboardLayout:", user);
  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {user && (
        <>
          <aside className="hidden md:block border-r bg-muted/40">
            <Sidebar links={links} userRole={user!.role} />
          </aside>
          <div className="flex flex-col h-screen overflow-hidden">
            <Header user={user} onLogout={handleLogout} links={links} />

            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </>
      )}
    </div>
  );
}
