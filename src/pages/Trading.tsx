import { useState } from "react";
import { useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useActivePair } from "@/providers/TradingPairContext";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Layers, Zap, CheckCircle2, AlertCircle, Bot } from "lucide-react";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];
const ORDER_TYPES = ["market", "limit", "stop", "oco"];

export default function Trading() {
  const { pair } = useParams<{ pair?: string }>();
  const { activePair } = useActivePair();
  const selectedPair = pair ? decodeURIComponent(pair) : activePair;

  const [timeframe, setTimeframe] = useState("1h");
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Auto trade state
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [autoSide, setAutoSide] = useState<"buy" | "sell">("buy");
  const [autoQty, setAutoQty] = useState("");
  const [autoSL, setAutoSL] = useState("");
  const [autoTP, setAutoTP] = useState("");

  const { data: candles } = trpc.market.getCandles.useQuery({ pair: selectedPair, timeframe, limit: 100 });
  const { data: orderBook } = trpc.market.getOrderBook.useQuery({ pair: selectedPair, depth: 15 });
  const { data: exchangeKeys } = trpc.exchangeKey.list.useQuery();

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Manual trade ──────────────────────────────────────────────────
  const createTrade = trpc.trading.createTrade.useMutation({
    onSuccess: () => {
      showToast("success", `${side === "buy" ? "Buy" : "Sell"} order placed successfully!`);
      setAmount("");
      setPrice("");
    },
    onError: (e) => showToast("error", e.message),
  });

  const handlePlaceOrder = () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast("error", "Please enter a valid amount.");
      return;
    }
    createTrade.mutate({
      exchange: "binance",
      tradingPair: selectedPair,
      side,
      type: orderType as any,
      quantity: amount,
      price: orderType !== "market" ? price : undefined,
    });
  };

  // ── Auto trade ────────────────────────────────────────────────────
  const autoExecute = trpc.autoTrade.execute.useMutation({
    onSuccess: (data) => {
      showToast("success", `Auto trade executed! Trade ID: ${data.tradeId}`);
      setAutoQty("");
      setAutoSL("");
      setAutoTP("");
    },
    onError: (e) => showToast("error", e.message),
  });

  const handleAutoTrade = () => {
    if (!selectedKeyId) { showToast("error", "Select an exchange API key first."); return; }
    if (!autoQty || parseFloat(autoQty) <= 0) { showToast("error", "Enter a valid quantity."); return; }
    autoExecute.mutate({
      exchangeKeyId: selectedKeyId,
      symbol: selectedPair,
      side: autoSide,
      orderType: "market",
      quantity: parseFloat(autoQty),
      stopLoss: autoSL ? parseFloat(autoSL) : undefined,
      takeProfit: autoTP ? parseFloat(autoTP) : undefined,
      autoMonitor: true,
    });
  };

  const chartData = candles?.map((c) => ({
    time: new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    close: parseFloat(c.close as string),
    volume: parseFloat(c.volume as string),
  })) ?? [];

  const isPositive = chartData.length > 1 && chartData[chartData.length - 1].close >= chartData[0].close;
  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
            style={{ background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "#10B981" : "#EF4444"}`, color: toast.type === "success" ? "#10B981" : "#EF4444" }}>
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-mono-data text-white">{selectedPair}</h1>
              <span className="text-sm font-mono-data flex items-center gap-1" style={{ color: isPositive ? "var(--lime-primary)" : "#EF4444" }}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {isPositive ? "+2.34%" : "-1.20%"}
              </span>
            </div>
            <p className="text-lg font-mono-data font-semibold text-white mt-1">
              {currentPrice > 0 ? currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "—"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {TIMEFRAMES.map((tf) => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono-data font-medium transition-all"
                style={{ background: timeframe === tf ? "var(--navy-highlight)" : "transparent", color: timeframe === tf ? "var(--lime-primary)" : "var(--grey-dim)", border: timeframe === tf ? "1px solid var(--navy-highlight)" : "1px solid transparent" }}>
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 card-surface p-4">
            <ResponsiveContainer width="100%" height={420}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tradeChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "#D2F900" : "#EF4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? "#D2F900" : "#EF4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--grey-dim)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--grey-dim)" fontSize={11} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", borderRadius: "8px", color: "#fff" }} itemStyle={{ color: "var(--lime-primary)" }} />
                <Area type="monotone" dataKey="close" stroke={isPositive ? "#D2F900" : "#EF4444"} fill="url(#tradeChartGrad)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={chartData}>
                <Bar dataKey="volume" fill="var(--navy-highlight)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Panel */}
          <div className="space-y-4">

            {/* Mode Toggle */}
            <div className="card-surface p-1 flex gap-1">
              <button onClick={() => setMode("manual")}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{ background: mode === "manual" ? "var(--navy-highlight)" : "transparent", color: mode === "manual" ? "var(--lime-primary)" : "var(--grey-dim)" }}>
                Manual
              </button>
              <button onClick={() => setMode("auto")}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{ background: mode === "auto" ? "var(--navy-highlight)" : "transparent", color: mode === "auto" ? "var(--lime-primary)" : "var(--grey-dim)" }}>
                <Bot className="w-3.5 h-3.5" /> Automate
              </button>
            </div>

            {/* ── MANUAL ORDER FORM ── */}
            {mode === "manual" && (
              <div className="card-surface p-5">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setSide("buy")}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: side === "buy" ? "var(--lime-primary)" : "var(--navy-highlight)", color: side === "buy" ? "var(--navy-base)" : "var(--grey-dim)" }}>
                    Buy
                  </button>
                  <button onClick={() => setSide("sell")}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: side === "sell" ? "#EF4444" : "var(--navy-highlight)", color: side === "sell" ? "white" : "var(--grey-dim)" }}>
                    Sell
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Order Type</label>
                    <div className="grid grid-cols-4 gap-1">
                      {ORDER_TYPES.map((ot) => (
                        <button key={ot} onClick={() => setOrderType(ot)}
                          className="py-1.5 rounded text-[10px] font-medium uppercase transition-all"
                          style={{ background: orderType === ot ? "var(--navy-highlight)" : "transparent", color: orderType === ot ? "var(--lime-primary)" : "var(--grey-dim)", border: orderType === ot ? "1px solid var(--lime-primary)" : "1px solid var(--navy-highlight)" }}>
                          {ot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {orderType !== "market" && (
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Price</label>
                      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
                        className="w-full px-3 py-2.5 rounded-lg text-sm font-mono-data outline-none"
                        style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }} />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Amount</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-mono-data outline-none"
                      style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }} />
                  </div>

                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <button key={pct}
                        onClick={() => {
                          if (currentPrice > 0) setAmount(((pct / 100) * 1000 / currentPrice).toFixed(6));
                        }}
                        className="flex-1 py-1.5 rounded text-[10px] font-medium transition-colors hover:text-white"
                        style={{ background: "var(--navy-highlight)", color: "var(--grey-dim)" }}>
                        {pct}%
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={createTrade.isPending || !amount}
                    className="w-full py-3 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: side === "buy" ? "var(--lime-primary)" : "#EF4444", color: side === "buy" ? "var(--navy-base)" : "white" }}>
                    {createTrade.isPending ? "Placing..." : `${side === "buy" ? "Buy" : "Sell"} ${selectedPair.split("/")[0]}`}
                  </button>
                </div>
              </div>
            )}

            {/* ── AUTO TRADE FORM ── */}
            {mode === "auto" && (
              <div className="card-surface p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
                  <span className="text-sm font-semibold text-white">Auto Execute Trade</span>
                </div>
                <p className="text-xs" style={{ color: "var(--grey-dim)" }}>
                  Executes directly on your exchange via API key. Requires a connected exchange key in Settings.
                </p>

                {/* Exchange Key Selector */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Exchange API Key</label>
                  {!exchangeKeys || exchangeKeys.length === 0 ? (
                    <div className="p-3 rounded-lg text-xs text-center" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "var(--grey-dim)" }}>
                      No API keys found. Add one in <a href="/settings" className="underline" style={{ color: "var(--lime-primary)" }}>Settings → Security</a>.
                    </div>
                  ) : (
                    <select value={selectedKeyId ?? ""} onChange={(e) => setSelectedKeyId(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }}>
                      <option value="">Select key...</option>
                      {exchangeKeys.map((k) => (
                        <option key={k.id} value={k.id}>{k.exchange} — {k.apiKeyLabel}{k.isTestnet ? " (Testnet)" : ""}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Side */}
                <div className="flex gap-2">
                  <button onClick={() => setAutoSide("buy")}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: autoSide === "buy" ? "var(--lime-primary)" : "var(--navy-highlight)", color: autoSide === "buy" ? "var(--navy-base)" : "var(--grey-dim)" }}>
                    Buy
                  </button>
                  <button onClick={() => setAutoSide("sell")}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: autoSide === "sell" ? "#EF4444" : "var(--navy-highlight)", color: autoSide === "sell" ? "white" : "var(--grey-dim)" }}>
                    Sell
                  </button>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Quantity</label>
                  <input type="number" value={autoQty} onChange={(e) => setAutoQty(e.target.value)} placeholder="e.g. 0.001"
                    className="w-full px-3 py-2.5 rounded-lg text-sm font-mono-data outline-none"
                    style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }} />
                </div>

                {/* Stop Loss / Take Profit */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Stop Loss</label>
                    <input type="number" value={autoSL} onChange={(e) => setAutoSL(e.target.value)} placeholder="Optional"
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-mono-data outline-none"
                      style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Take Profit</label>
                    <input type="number" value={autoTP} onChange={(e) => setAutoTP(e.target.value)} placeholder="Optional"
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-mono-data outline-none"
                      style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }} />
                  </div>
                </div>

                <button
                  onClick={handleAutoTrade}
                  disabled={autoExecute.isPending || !selectedKeyId || !autoQty}
                  className="w-full py-3 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: autoSide === "buy" ? "var(--lime-primary)" : "#EF4444", color: autoSide === "buy" ? "var(--navy-base)" : "white" }}>
                  <Zap className="w-4 h-4" />
                  {autoExecute.isPending ? "Executing..." : `Auto ${autoSide === "buy" ? "Buy" : "Sell"} ${selectedPair.split("/")[0]}`}
                </button>

                <p className="text-[10px] text-center" style={{ color: "var(--grey-dim)" }}>
                  ⚠️ This executes a real trade on your exchange. Use testnet keys for testing.
                </p>
              </div>
            )}

            {/* Order Book */}
            <div className="card-surface p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
                Order Book
              </h3>
              <div className="grid grid-cols-3 gap-1 text-[10px] uppercase tracking-wider mb-2" style={{ color: "var(--grey-dim)" }}>
                <span>Price</span><span className="text-right">Size</span><span className="text-right">Total</span>
              </div>
              <div className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin">
                {orderBook?.asks.slice().reverse().map((ask, i) => (
                  <div key={`ask-${i}`} className="grid grid-cols-3 gap-1 text-xs font-mono-data py-0.5">
                    <span className="text-red-400">{ask.price}</span>
                    <span className="text-right" style={{ color: "var(--grey-dim)" }}>{ask.quantity}</span>
                    <span className="text-right" style={{ color: "var(--grey-dim)" }}>{ask.total}</span>
                  </div>
                ))}
              </div>
              <div className="py-2 text-center text-xs font-mono-data font-medium" style={{ color: "var(--lime-primary)", borderTop: "1px solid var(--navy-highlight)", borderBottom: "1px solid var(--navy-highlight)" }}>
                Spread: {orderBook?.spread}
              </div>
              <div className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin mt-0.5">
                {orderBook?.bids.map((bid, i) => (
                  <div key={`bid-${i}`} className="grid grid-cols-3 gap-1 text-xs font-mono-data py-0.5">
                    <span style={{ color: "var(--lime-primary)" }}>{bid.price}</span>
                    <span className="text-right" style={{ color: "var(--grey-dim)" }}>{bid.quantity}</span>
                    <span className="text-right" style={{ color: "var(--grey-dim)" }}>{bid.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
