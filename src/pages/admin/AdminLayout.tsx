import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Building2, List, Settings, Wrench, FileText, LogOut, LayoutDashboard } from "lucide-react";

const NAV = [
  { to: "/admin", label: "Annonces", icon: List },
  { to: "/admin/batiments", label: "Bâtiments", icon: Building2 },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/a-propos", label: "Page À propos", icon: FileText },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary min-h-screen flex flex-col shrink-0 hidden lg:flex">
        <div className="p-6">
          <Link to="/" className="font-heading text-xl font-bold text-primary-foreground flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-gold" />
            BelAirCamp
          </Link>
          <p className="text-lavender text-xs mt-1">Administration</p>
        </div>
        <nav className="flex-1 px-3">
          {NAV.map((n) => {
            const isActive = n.to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-gold font-medium"
                    : "text-lavender hover:text-primary-foreground hover:bg-sidebar-accent"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-sm text-lavender hover:text-primary-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary z-50 px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="font-heading text-lg font-bold text-primary-foreground">Admin</Link>
        <div className="flex items-center gap-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`p-2 rounded-lg ${
                (n.to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(n.to))
                  ? "bg-sidebar-accent text-gold"
                  : "text-lavender"
              }`}
            >
              <n.icon className="h-4 w-4" />
            </Link>
          ))}
          <button onClick={signOut} className="p-2 text-lavender"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 bg-light-section min-h-screen lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
