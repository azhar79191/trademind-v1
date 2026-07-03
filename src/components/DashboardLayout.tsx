import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  LayoutDashboard,
  LineChart,
  TrendingUp,
  Bot,
  Newspaper,
  Radar,
  Wallet,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles,
  Zap,
  BarChart3,
  History,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Markets", icon: LineChart, path: "/markets" },
  { label: "Charts", icon: BarChart3, path: "/charts" },
  { label: "Trading", icon: TrendingUp, path: "/trading" },
  { label: "Trade History", icon: History, path: "/trades" },
  { label: "AI Signals", icon: Radar, path: "/signals" },
  { label: "Portfolio", icon: Wallet, path: "/portfolio" },
  { label: "Strategies", icon: Zap, path: "/strategies" },
  { label: "AI Chat", icon: Bot, path: "/chat" },
  { label: "News", icon: Newspaper, path: "/news" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000,
    retry: false,
    throwOnError: false,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="min-h-screen flex" style={{ background: "var(--navy-base)" }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 flex flex-col h-screen transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--navy-surface)", borderRight: "1px solid var(--navy-highlight)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--lime-primary)" }}>
            <Sparkles className="w-5 h-5" style={{ color: "var(--navy-base)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">TradeMind</h1>
            <p className="text-[10px] font-mono-data tracking-widest uppercase" style={{ color: "var(--lime-primary)" }}>AI Trading</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" style={{ color: "var(--grey-dim)" }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? "text-white" : "hover:text-white transition-colors"
                }`}
                style={{
                  background: isActive ? "var(--navy-highlight)" : "transparent",
                  color: isActive ? "var(--lime-primary)" : "var(--grey-dim)",
                }}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--lime-primary)" }} />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mt-4 ${
                location.pathname === "/admin" ? "text-white" : "hover:text-white transition-colors"
              }`}
              style={{
                background: location.pathname === "/admin" ? "var(--navy-highlight)" : "transparent",
                color: location.pathname === "/admin" ? "var(--lime-primary)" : "var(--grey-dim)",
              }}
            >
              <Shield className="w-[18px] h-[18px]" />
              Admin Panel
              {location.pathname === "/admin" && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--lime-primary)" }} />
              )}
            </Link>
          )}
        </nav>

        {/* User Section */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid var(--navy-highlight)" }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}>
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name ?? "User"}</p>
              <p className="text-xs truncate" style={{ color: "var(--grey-dim)" }}>{user?.email ?? ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 mt-2 text-sm rounded-lg w-full transition-colors hover:text-white"
            style={{ color: "var(--grey-dim)" }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? "liquid-glass-strong" : ""}`}
          style={{
            borderBottom: scrolled ? "1px solid var(--navy-highlight)" : "1px solid transparent",
            background: scrolled ? undefined : "transparent",
          }}
        >
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg"
                style={{ color: "var(--grey-dim)" }}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-white hidden sm:block">
                {navItems.find((n) => location.pathname === n.path || location.pathname.startsWith(n.path + "/"))?.label ?? "TradeMind"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/chat")}
                className="relative p-2 rounded-lg transition-colors hover:text-white"
                style={{ color: "var(--grey-dim)" }}
              >
                <Bot className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="relative p-2 rounded-lg transition-colors hover:text-white"
                style={{ color: "var(--grey-dim)" }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount && unreadCount.count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--lime-primary)", color: "var(--navy-base)" }}>
                    {unreadCount.count}
                  </span>
                )}
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono-data" style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}>
                <div className="w-2 h-2 rounded-full status-dot active" />
                Live
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
