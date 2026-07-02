import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Wallet, TrendingUp, Target, BarChart3, PieChartIcon, ArrowUpRight, Clock, DollarSign, Percent, Award, AlertTriangle,
} from "lucide-react";

export default function Portfolio() {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "365">("30");

  const { data: snapshot } = trpc.portfolio.getSnapshot.useQuery(undefined, { retry: false });
  const { data: history } = trpc.portfolio.getHistory.useQuery({ days: parseInt(timeRange) }, { retry: false });

  const allocationColors = ["#D2F900", "#00E5FF", "#9945FF", "#808D99", "#FF6B35", "#162032", "#10B981", "#EF4444"];

  const allocationData = snapshot?.allocation?.map((a, i) => ({
    name: a.asset,
    value: a.percentage,
    color: allocationColors[i % allocationColors.length],
  })) ?? [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-dim)" }}>Track your assets, performance, and risk metrics</p>
          </div>
          <div className="flex items-center gap-2">
            {(["7", "30", "90", "365"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-data font-medium transition-all ${timeRange === range ? "" : ""}`}
                style={{
                  background: timeRange === range ? "var(--navy-highlight)" : "transparent",
                  color: timeRange === range ? "var(--lime-primary)" : "var(--grey-dim)",
                  border: timeRange === range ? "1px solid var(--lime-primary)" : "1px solid var(--navy-highlight)",
                }}
              >
                {range}D
              </button>
            ))}
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Balance", value: `$${Number(snapshot?.balance.total ?? 100000).toLocaleString()}`, icon: Wallet, change: "+1.2%" },
            { label: "Available", value: `$${Number(snapshot?.balance.available ?? 85000).toLocaleString()}`, icon: DollarSign, change: "Available" },
            { label: "Allocated", value: `$${Number(snapshot?.balance.allocated ?? 15000).toLocaleString()}`, icon: Target, change: "In positions" },
            { label: "Unrealized P&L", value: `+$${Number(snapshot?.balance.unrealizedPnl ?? 1250).toLocaleString()}`, icon: TrendingUp, change: "+5.2%" },
          ].map((item) => (
            <div key={item.label} className="card-surface p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>{item.label}</span>
                <item.icon className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
              </div>
              <div className="text-xl font-bold font-mono-data text-white">{item.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--lime-primary)" }}>{item.change}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              Performance History
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={history ?? []}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D2F900" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D2F900" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--grey-dim)" fontSize={11} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="var(--grey-dim)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", borderRadius: "8px", color: "#fff" }} />
                <Area type="monotone" dataKey="value" stroke="#D2F900" fill="url(#perfGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation */}
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              Asset Allocation
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                  {allocationData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {allocationData.map((a) => (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                    <span className="text-sm text-white">{a.name}</span>
                  </div>
                  <span className="text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>{a.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Trades", value: snapshot?.performance.totalTrades?.toString() ?? "142", icon: BarChart3 },
            { label: "Win Rate", value: `${snapshot?.performance.winRate ?? 68}%`, icon: Percent },
            { label: "Total P&L", value: `+$${Number(snapshot?.performance.totalPnl ?? 5230).toLocaleString()}`, icon: TrendingUp },
            { label: "Best Trade", value: `+$${Number(snapshot?.performance.bestTrade ?? 850).toLocaleString()}`, icon: Award },
            { label: "Daily P&L", value: `+$${Number(snapshot?.performance.dailyPnl ?? 320).toLocaleString()}`, icon: Clock },
            { label: "Weekly P&L", value: `+$${Number(snapshot?.performance.weeklyPnl ?? 1450).toLocaleString()}`, icon: TrendingUp },
            { label: "Monthly P&L", value: `+$${Number(snapshot?.performance.monthlyPnl ?? 5230).toLocaleString()}`, icon: ArrowUpRight },
            { label: "Worst Trade", value: `-$${Math.abs(Number(snapshot?.performance.worstTrade ?? -120)).toLocaleString()}`, icon: AlertTriangle, negative: true },
          ].map((metric) => (
            <div key={metric.label} className="card-surface p-4">
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
                <span className="text-xs" style={{ color: "var(--grey-dim)" }}>{metric.label}</span>
              </div>
              <div className={`text-lg font-bold font-mono-data ${"negative" in metric && metric.negative ? "text-red-400" : ""}`} style={!(("negative" in metric) && metric.negative) ? { color: "var(--lime-primary)" } : {}}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Active Positions */}
        {snapshot?.positions && snapshot.positions.length > 0 && (
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Active Positions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                    {["Pair", "Side", "Entry", "Current", "Size", "P&L", "Leverage"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--navy-highlight)" }}>
                  {snapshot.positions.map((pos) => {
                    const pnlPositive = parseFloat(pos.unrealizedPnl ?? "0") >= 0;
                    return (
                      <tr key={pos.id}>
                        <td className="px-4 py-3 text-sm font-mono-data text-white">{pos.tradingPair}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${pos.side === "long" ? "" : "text-red-400"}`} style={pos.side === "long" ? { background: "rgba(16, 185, 129, 0.2)", color: "#10B981" } : { background: "rgba(239, 68, 68, 0.2)" }}>
                            {pos.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>{pos.entryPrice}</td>
                        <td className="px-4 py-3 text-sm font-mono-data text-white">{pos.currentPrice}</td>
                        <td className="px-4 py-3 text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>{pos.quantity}</td>
                        <td className={`px-4 py-3 text-sm font-mono-data font-medium ${pnlPositive ? "" : "text-red-400"}`} style={pnlPositive ? { color: "var(--lime-primary)" } : {}}>
                          {pnlPositive ? "+" : ""}{pos.unrealizedPnl}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>{pos.leverage}x</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
