import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle,
  AlertCircle, Zap, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";

type StatusFilter = "all" | "open" | "pending" | "closed" | "cancelled";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Pending", value: "pending" },
  { label: "Closed", value: "closed" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_STYLES: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  open:      { color: "#D2F900", bg: "rgba(210,249,0,0.1)",   icon: TrendingUp },
  pending:   { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  icon: Clock },
  closed:    { color: "#6B7280", bg: "rgba(107,114,128,0.1)", icon: CheckCircle2 },
  cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   icon: XCircle },
};

const LIMIT = 20;

export default function TradeHistory() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const { data: stats } = trpc.trading.getStats.useQuery();
  const { data, isLoading, refetch } = trpc.trading.getTrades.useQuery(
    { status, limit: LIMIT, offset: page * LIMIT },
    { keepPreviousData: true } as any
  );
  const { data: exchangeKeys } = trpc.exchangeKey.list.useQuery();

  const closeTrade = trpc.autoTrade.closeTrade.useMutation({
    onSuccess: () => {
      showToast("success", "Trade closed successfully.");
      setClosingId(null);
      refetch();
    },
    onError: (e) => {
      showToast("error", e.message);
      setClosingId(null);
    },
  });

  const handleClose = (tradeId: number) => {
    const key = exchangeKeys?.[0];
    if (!key) { showToast("error", "No exchange key found to close trade."); return; }
    setClosingId(tradeId);
    closeTrade.mutate({ tradeId, exchangeKeyId: key.id });
  };

  const trades = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const pnlNum = parseFloat(stats?.totalPnl ?? "0");

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
            style={{ background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "#10B981" : "#EF4444"}`, color: toast.type === "success" ? "#10B981" : "#EF4444" }}>
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Trade History</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--grey-dim)" }}>All manual and auto-executed trades</p>
          </div>
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:text-white"
            style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "var(--grey-dim)" }}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Trades", value: stats?.totalTrades ?? 0, sub: "all time" },
            { label: "Open Trades", value: stats?.openTrades ?? 0, sub: "active now", highlight: true },
            { label: "Win Rate", value: `${stats?.winRate ?? 0}%`, sub: "profitable" },
            {
              label: "Total P&L",
              value: `${pnlNum >= 0 ? "+" : ""}${pnlNum.toFixed(2)}`,
              sub: "realized",
              color: pnlNum >= 0 ? "#D2F900" : "#EF4444",
            },
          ].map((card) => (
            <div key={card.label} className="card-surface p-4">
              <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-dim)" }}>{card.label}</p>
              <p className="text-2xl font-bold font-mono-data" style={{ color: card.color ?? (card.highlight ? "var(--lime-primary)" : "white") }}>
                {card.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--grey-dim)" }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card-surface overflow-hidden">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-4 pb-0" style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
            {STATUS_TABS.map((tab) => (
              <button key={tab.value} onClick={() => { setStatus(tab.value); setPage(0); }}
                className="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all"
                style={{
                  background: status === tab.value ? "var(--navy-highlight)" : "transparent",
                  color: status === tab.value ? "var(--lime-primary)" : "var(--grey-dim)",
                  borderBottom: status === tab.value ? "2px solid var(--lime-primary)" : "2px solid transparent",
                }}>
                {tab.label}
              </button>
            ))}
            <span className="ml-auto text-xs font-mono-data px-3 py-1 rounded-full" style={{ background: "var(--navy-highlight)", color: "var(--grey-dim)" }}>
              {total} trades
            </span>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--lime-primary)", borderTopColor: "transparent" }} />
              </div>
            ) : trades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <TrendingUp className="w-10 h-10" style={{ color: "var(--grey-dim)" }} />
                <p className="text-sm" style={{ color: "var(--grey-dim)" }}>No trades found</p>
                <a href="/trading" className="text-xs underline" style={{ color: "var(--lime-primary)" }}>Place your first trade →</a>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                    {["ID", "Pair", "Side", "Type", "Qty", "Entry Price", "SL / TP", "P&L", "Status", "Date", "Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade: any) => {
                    const style = STATUS_STYLES[trade.status] ?? STATUS_STYLES.closed;
                    const Icon = style.icon;
                    const pnl = trade.pnl ? parseFloat(trade.pnl) : null;
                    const isAutoTrade = trade.metadata?.monitorActive !== undefined;

                    return (
                      <tr key={trade.id} className="transition-colors hover:bg-white/[0.02]"
                        style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                        <td className="px-4 py-3 font-mono-data text-xs" style={{ color: "var(--grey-dim)" }}>
                          #{trade.id}
                          {isAutoTrade && <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(210,249,0,0.1)", color: "var(--lime-primary)" }}><Zap className="w-2.5 h-2.5" />Auto</span>}
                        </td>
                        <td className="px-4 py-3 font-mono-data font-semibold text-white">{trade.tradingPair}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
                            style={{ background: trade.side === "buy" ? "rgba(210,249,0,0.1)" : "rgba(239,68,68,0.1)", color: trade.side === "buy" ? "#D2F900" : "#EF4444" }}>
                            {trade.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs uppercase font-mono-data" style={{ color: "var(--grey-dim)" }}>{trade.type}</td>
                        <td className="px-4 py-3 font-mono-data text-white">{trade.quantity}</td>
                        <td className="px-4 py-3 font-mono-data text-white">{trade.entryPrice ?? "—"}</td>
                        <td className="px-4 py-3 font-mono-data text-xs">
                          <span style={{ color: "#EF4444" }}>{trade.stopLoss ?? "—"}</span>
                          <span style={{ color: "var(--grey-dim)" }}> / </span>
                          <span style={{ color: "#D2F900" }}>{trade.takeProfit ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3 font-mono-data font-semibold"
                          style={{ color: pnl === null ? "var(--grey-dim)" : pnl >= 0 ? "#D2F900" : "#EF4444" }}>
                          {pnl === null ? "—" : `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ background: style.bg, color: style.color }}>
                            <Icon className="w-3 h-3" />
                            {trade.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono-data" style={{ color: "var(--grey-dim)" }}>
                          {new Date(trade.createdAt).toLocaleDateString()}<br />
                          <span className="text-[10px]">{new Date(trade.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                        <td className="px-4 py-3">
                          {trade.status === "open" && (
                            <button
                              onClick={() => handleClose(trade.id)}
                              disabled={closingId === trade.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                              style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                              {closingId === trade.id ? "Closing..." : "Close"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--navy-highlight)" }}>
              <p className="text-xs" style={{ color: "var(--grey-dim)" }}>
                Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-1.5 rounded-lg disabled:opacity-30 transition-colors hover:text-white"
                  style={{ color: "var(--grey-dim)", background: "var(--navy-highlight)" }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono-data" style={{ color: "var(--grey-dim)" }}>{page + 1} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg disabled:opacity-30 transition-colors hover:text-white"
                  style={{ color: "var(--grey-dim)", background: "var(--navy-highlight)" }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
