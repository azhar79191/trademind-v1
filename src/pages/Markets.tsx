import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, ArrowUpRight, ArrowDownRight, Star, Activity } from "lucide-react";

export default function Markets() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [watchlistOnly, setWatchlistOnly] = useState(false);

  const { data: tickers, isLoading } = trpc.market.getTickers.useQuery();

  const filtered = tickers?.filter((t) => {
    const matchSearch = t.pair.toLowerCase().includes(search.toLowerCase());
    const matchWatchlist = !watchlistOnly || ["BTC/USDT", "ETH/USDT", "SOL/USDT"].includes(t.pair);
    return matchSearch && matchWatchlist;
  }) ?? [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Markets</h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-dim)" }}>Real-time market data across all supported exchanges</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--grey-dim)" }} />
              <input
                type="text"
                placeholder="Search pairs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg text-sm w-48 outline-none focus:ring-1"
                style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "white" }}
              />
            </div>
            <button
              onClick={() => setWatchlistOnly(!watchlistOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${watchlistOnly ? "" : ""}`}
              style={{
                background: watchlistOnly ? "var(--lime-primary)" : "var(--navy-surface)",
                color: watchlistOnly ? "var(--navy-base)" : "var(--grey-dim)",
                border: "1px solid var(--navy-highlight)",
              }}
            >
              <Star className="w-4 h-4" />
              Watchlist
            </button>
          </div>
        </div>

        {/* Market Table */}
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                  {["Pair", "Price", "24h Change", "24h High", "24h Low", "Volume", "Action"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--navy-highlight)" }}>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 rounded animate-pulse" style={{ background: "var(--navy-highlight)", width: `${60 + Math.random() * 40}%` }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.map((ticker) => {
                  const isPositive = ticker.change24h.startsWith("+");
                  return (
                    <tr
                      key={ticker.pair}
                      className="transition-colors cursor-pointer hover:bg-white/[0.02]"
                      onClick={() => navigate(`/trading/${encodeURIComponent(ticker.pair)}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}>
                            {ticker.pair.split("/")[0]?.charAt(0)}
                          </div>
                          <span className="text-sm font-mono-data font-medium text-white">{ticker.pair}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono-data text-white">{ticker.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-sm font-mono-data ${isPositive ? "" : "text-red-400"}`} style={isPositive ? { color: "var(--lime-primary)" } : {}}>
                          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {ticker.change24h}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>{ticker.high}</td>
                      <td className="px-6 py-4 text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>{ticker.low}</td>
                      <td className="px-6 py-4 text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>{ticker.volume24h}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/trading/${encodeURIComponent(ticker.pair)}`); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                          style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}
                        >
                          <Activity className="w-3 h-3" />
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
