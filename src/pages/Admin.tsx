import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Shield, Users, BarChart3, Zap, TrendingUp,
  ArrowUpRight, ArrowDownRight, UserCheck,
} from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "trades" | "signals">("overview");

  // Redirect non-admin users
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Shield className="w-16 h-16 mb-4" style={{ color: "var(--navy-highlight)" }} />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-sm" style={{ color: "var(--grey-dim)" }}>You need admin privileges to access this page.</p>
          <button onClick={() => navigate("/dashboard")} className="btn-lime mt-4 text-sm">Back to Dashboard</button>
        </div>
      </DashboardLayout>
    );
  }

  const { data: stats } = trpc.admin.getStats.useQuery();

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "trades" as const, label: "Trades", icon: TrendingUp },
    { id: "signals" as const, label: "Signals", icon: Zap },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--lime-primary)" }}>
              <Shield className="w-5 h-5" style={{ color: "var(--navy-base)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm" style={{ color: "var(--grey-dim)" }}>Platform management and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}>
            <div className="w-2 h-2 rounded-full status-dot active" />
            Admin: {user.name}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats?.users.total ?? 0, icon: Users, change: `+${stats?.users.active24h ?? 0} active 24h` },
            { label: "Premium Users", value: stats?.users.premium ?? 0, icon: UserCheck, change: "Subscribed" },
            { label: "Active Strategies", value: stats?.strategies.active ?? 0, icon: Zap, change: `${stats?.strategies.total ?? 0} total` },
            { label: "Total P&L", value: `$${Number(stats?.trades.totalPnl ?? 0).toFixed(0)}`, icon: TrendingUp, change: "All time" },
          ].map((item) => (
            <div key={item.label} className="card-surface p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>{item.label}</span>
                <item.icon className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
              </div>
              <div className="text-2xl font-bold font-mono-data text-white">{typeof item.value === "number" ? item.value.toLocaleString() : item.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--lime-primary)" }}>{item.change}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 pb-2" style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "" : ""}`}
              style={{
                background: activeTab === tab.id ? "var(--navy-highlight)" : "transparent",
                color: activeTab === tab.id ? "var(--lime-primary)" : "var(--grey-dim)",
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signal Distribution */}
            <div className="card-surface p-6">
              <h3 className="text-lg font-semibold text-white mb-4">24h Signal Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm flex items-center gap-2" style={{ color: "var(--lime-primary)" }}>
                      <ArrowUpRight className="w-4 h-4" /> Buy Signals
                    </span>
                    <span className="text-sm font-mono-data font-medium text-white">{stats?.signals.buySignals ?? 0}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--navy-highlight)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${stats?.signals.total24h ? (stats.signals.buySignals / stats.signals.total24h) * 100 : 50}%`, background: "var(--lime-primary)" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm flex items-center gap-2 text-red-400">
                      <ArrowDownRight className="w-4 h-4" /> Sell Signals
                    </span>
                    <span className="text-sm font-mono-data font-medium text-white">{stats?.signals.sellSignals ?? 0}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--navy-highlight)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${stats?.signals.total24h ? (stats.signals.sellSignals / stats.signals.total24h) * 100 : 30}%`, background: "#EF4444" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="card-surface p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats?.recentUsers?.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}>
                      {u.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{u.name ?? "Anonymous"}</div>
                      <div className="text-xs" style={{ color: "var(--grey-dim)" }}>{u.email ?? ""}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: "var(--navy-highlight)", color: u.role === "admin" ? "var(--lime-primary)" : "var(--grey-dim)" }}>
                      {u.role}
                    </span>
                  </div>
                )) ?? (
                  <div className="text-center py-4 text-sm" style={{ color: "var(--grey-dim)" }}>No recent users</div>
                )}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="lg:col-span-2 card-surface p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                      {["ID", "Pair", "Side", "Status", "P&L", "Time"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentTrades?.map((trade) => {
                      const pnlPositive = parseFloat(trade.pnl ?? "0") >= 0;
                      return (
                        <tr key={trade.id} style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                          <td className="px-4 py-3 text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>#{trade.id}</td>
                          <td className="px-4 py-3 text-sm font-mono-data text-white">{trade.tradingPair}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${trade.side === "buy" ? "" : "text-red-400"}`} style={trade.side === "buy" ? { background: "rgba(16, 185, 129, 0.2)", color: "#10B981" } : { background: "rgba(239, 68, 68, 0.2)" }}>
                              {trade.side}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase capitalize" style={{ background: "var(--navy-highlight)", color: trade.status === "open" ? "var(--lime-primary)" : "var(--grey-dim)" }}>
                              {trade.status}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-mono-data font-medium ${pnlPositive ? "" : "text-red-400"}`} style={pnlPositive ? { color: "var(--lime-primary)" } : {}}>
                            {pnlPositive ? "+" : ""}{trade.pnl}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--grey-dim)" }}>
                            {new Date(trade.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    }) ?? (
                      <tr><td colSpan={6} className="text-center py-4 text-sm" style={{ color: "var(--grey-dim)" }}>No recent trades</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Management</h3>
            <div className="space-y-3">
              {stats?.recentUsers?.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}>
                      {u.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{u.name ?? "Anonymous"}</div>
                      <div className="text-xs" style={{ color: "var(--grey-dim)" }}>{u.email ?? ""}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: u.subscriptionTier === "premium" ? "rgba(210, 249, 0, 0.1)" : "var(--navy-highlight)", color: u.subscriptionTier === "premium" ? "var(--lime-primary)" : "var(--grey-dim)" }}>
                      {u.subscriptionTier}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: "var(--navy-highlight)", color: u.role === "admin" ? "var(--lime-primary)" : "var(--grey-dim)" }}>
                      {u.role}
                    </span>
                    <span className="text-xs" style={{ color: "var(--grey-dim)" }}>
                      {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                </div>
              )) ?? (
                <div className="text-center py-8 text-sm" style={{ color: "var(--grey-dim)" }}>No users found</div>
              )}
            </div>
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === "trades" && (
          <div className="card-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Trade History</h3>
              <div className="flex items-center gap-4 text-sm">
                <span style={{ color: "var(--grey-dim)" }}>Total: <span className="text-white font-mono-data">{stats?.trades.total ?? 0}</span></span>
                <span style={{ color: "var(--grey-dim)" }}>Open: <span className="font-mono-data" style={{ color: "var(--lime-primary)" }}>{stats?.trades.open ?? 0}</span></span>
                <span style={{ color: "var(--grey-dim)" }}>Avg P&L: <span className="font-mono-data" style={{ color: "var(--lime-primary)" }}>${Number(stats?.trades.avgPnl ?? 0).toFixed(2)}</span></span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                    {["ID", "Pair", "Side", "Status", "P&L", "Date"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentTrades?.map((trade) => (
                    <tr key={trade.id} style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                      <td className="px-4 py-3 text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>#{trade.id}</td>
                      <td className="px-4 py-3 text-sm font-mono-data text-white">{trade.tradingPair}</td>
                      <td className="px-4 py-3 text-sm capitalize" style={{ color: trade.side === "buy" ? "#10B981" : "#EF4444" }}>{trade.side}</td>
                      <td className="px-4 py-3 text-sm capitalize" style={{ color: "var(--grey-dim)" }}>{trade.status}</td>
                      <td className="px-4 py-3 text-sm font-mono-data font-medium" style={{ color: parseFloat(trade.pnl ?? "0") >= 0 ? "var(--lime-primary)" : "#EF4444" }}>
                        {parseFloat(trade.pnl ?? "0") >= 0 ? "+" : ""}{trade.pnl}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--grey-dim)" }}>{new Date(trade.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )) ?? (
                    <tr><td colSpan={6} className="text-center py-4 text-sm" style={{ color: "var(--grey-dim)" }}>No trades</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signals Tab */}
        {activeTab === "signals" && (
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Signal Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)" }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--grey-dim)" }}>24h Signals</div>
                <div className="text-3xl font-bold font-mono-data text-white">{stats?.signals.total24h ?? 0}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "var(--navy-base)", border: "1px solid var(--lime-primary)30" }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--lime-primary)" }}>Buy Signals</div>
                <div className="text-3xl font-bold font-mono-data" style={{ color: "var(--lime-primary)" }}>{stats?.signals.buySignals ?? 0}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "var(--navy-base)", border: "1px solid #EF444430" }}>
                <div className="text-xs uppercase tracking-wider mb-1 text-red-400">Sell Signals</div>
                <div className="text-3xl font-bold font-mono-data text-red-400">{stats?.signals.sellSignals ?? 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
