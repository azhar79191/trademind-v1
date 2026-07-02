import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import TradingChart from "@/components/TradingChart";
import {
  TrendingUp,
  Activity,
  Wallet,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Zap,
  Globe,
  ChevronRight,
  BotMessageSquare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── AI Typewriter Effect ────────────────────────────────────────────

const SIGNAL_DATA = [
  {
    id: "SIG-2847",
    pair: "BTC/USDT",
    action: "BUY",
    confidence: "89%",
    reasoning: "EMA200 support held, MACD bullish crossover, RSI 61, volume surge +45%",
  },
  {
    id: "SIG-2846",
    pair: "SOL/USDT",
    action: "BUY",
    confidence: "92%",
    reasoning: "Breakout above $145 resistance, funding rate positive, whale accumulation detected",
  },
  {
    id: "SIG-2845",
    pair: "ETH/USDT",
    action: "HOLD",
    confidence: "74%",
    reasoning: "Consolidating between $4050-$4200, wait for decisive breakout",
  },
  {
    id: "SIG-2844",
    pair: "DOGE/USDT",
    action: "SELL",
    confidence: "81%",
    reasoning: "Bearish divergence on RSI, declining volume, losing 0.17 support",
  },
  {
    id: "SIG-2843",
    pair: "AVAX/USDT",
    action: "BUY",
    confidence: "87%",
    reasoning: "Strong bounce from $38 support, ADX rising, momentum building",
  },
];

function AITypewriter() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "waiting" | "deleting">("typing");

  const signal = SIGNAL_DATA[currentIndex];
  const lines = [
    { text: `SIGNAL ID: ${signal.id}`, className: "ai-color-lime" },
    { text: `PAIR:    ${signal.pair}`, className: "" },
    { text: `ACTION:  ${signal.action}`, className: signal.action === "BUY" ? "ai-color-lime" : signal.action === "SELL" ? "ai-color-red" : "" },
    { text: `CONF:    ${signal.confidence}`, className: "" },
    { text: "", className: "" },
    { text: "REASONING:", className: "" },
    { text: `> ${signal.reasoning}`, className: "" },
    { text: "", className: "" },
  ];

  useEffect(() => {
    if (phase === "typing") {
      const currentLineData = lines[displayedLines.length];
      if (!currentLineData) {
        setPhase("waiting");
        return;
      }

      const timer = setTimeout(() => {
        if (charIndex < currentLineData.text.length) {
          setCurrentLine(currentLineData.text.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        } else {
          setDisplayedLines((prev) => [...prev, currentLineData.className]);
          setCurrentLine("");
          setCharIndex(0);
        }
      }, 30);

      return () => clearTimeout(timer);
    }

    if (phase === "waiting") {
      const timer = setTimeout(() => {
        setPhase("deleting");
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (phase === "deleting") {
      const timer = setTimeout(() => {
        setDisplayedLines([]);
        setCurrentLine("");
        setCharIndex(0);
        setCurrentIndex((prev) => (prev + 1) % SIGNAL_DATA.length);
        setPhase("typing");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, charIndex, displayedLines.length, currentIndex]);

  const currentLineData = lines[displayedLines.length];

  return (
    <div className="ai-terminal">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--lime-primary)" }}>Live Signal Stream</span>
      </div>
      <div ref={terminalRef} className="space-y-0.5">
        {displayedLines.map((className, i) => (
          <span key={i} className={`ai-line ${className}`}>
            {lines[i].text}
          </span>
        ))}
        {currentLineData && phase === "typing" && (
          <span className={`ai-line ${currentLineData.className}`}>
            {currentLine}
            <span className="ai-typewriter-cursor" />
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats } = trpc.trading.getStats.useQuery(undefined, { retry: false });
  const { data: sentiment } = trpc.signal.getSentiment.useQuery();
  const { data: tickers } = trpc.market.getTickers.useQuery();
  const { data: portfolioSnapshot } = trpc.portfolio.getSnapshot.useQuery(undefined, { retry: false });
  const { data: portfolioHistoryData } = trpc.portfolio.getHistory.useQuery({ days: 7 }, { retry: false });

  const portfolioHistory = portfolioHistoryData?.map((h) => ({
    day: new Date(h.date).toLocaleDateString("en-US", { weekday: "short" }),
    value: parseFloat(h.value),
  })) ?? [];

  const allocationColors = ["#D2F900", "#00E5FF", "#9945FF", "#808D99", "#162032"];
  const allocation = portfolioSnapshot?.allocation?.length
    ? portfolioSnapshot.allocation.slice(0, 5).map((a, i) => ({
        name: a.asset, value: a.percentage, color: allocationColors[i % allocationColors.length],
      }))
    : [
        { name: "BTC", value: 35, color: "#D2F900" }, { name: "ETH", value: 25, color: "#00E5FF" },
        { name: "SOL", value: 20, color: "#9945FF" }, { name: "Stable", value: 15, color: "#808D99" },
        { name: "Other", value: 5, color: "#162032" },
      ];

  const topGainers = tickers?.filter((t) => t.change24h.startsWith("+")).slice(0, 4) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-dim)" }}>
              AI-powered market intelligence at your fingertips
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}
            >
              <BotMessageSquare className="w-4 h-4" />
              AI Assistant
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total P&L", value: `+$${Number(stats?.totalPnl ?? 0).toFixed(2)}`, change: "+5.2%", icon: TrendingUp, up: true },
            { label: "Open Positions", value: stats?.openPositions?.toString() ?? "0", change: "Active", icon: Target, up: true },
            { label: "Win Rate", value: `${stats?.winRate ?? 0}%`, change: "Last 30 days", icon: Activity, up: true },
            { label: "Portfolio Value", value: `$${Number(portfolioSnapshot?.balance?.total ?? 0).toLocaleString()}`, change: "+1.2% today", icon: Wallet, up: true },
          ].map((metric) => (
            <div key={metric.label} className="card-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>{metric.label}</span>
                <metric.icon className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
              </div>
              <div className="text-2xl font-bold font-mono-data text-white">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {metric.up ? <ArrowUpRight className="w-3 h-3" style={{ color: "var(--lime-primary)" }} /> : <ArrowDownRight className="w-3 h-3 text-red-400" />}
                <span className="text-xs" style={{ color: metric.up ? "var(--lime-primary)" : "#EF4444" }}>{metric.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Trading Chart - Full Width */}
          <div className="lg:col-span-12">
            <TradingChart defaultCoin="BTC" showCoinSelector={true} height={400} />
          </div>

          {/* Portfolio Chart */}
          <div className="lg:col-span-8 card-surface p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
                Portfolio Performance
              </h3>
              <button onClick={() => navigate("/portfolio")} className="text-xs flex items-center gap-1 transition-colors hover:text-white" style={{ color: "var(--grey-dim)" }}>
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={portfolioHistory}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D2F900" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D2F900" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--grey-dim)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--grey-dim)" fontSize={12} tickLine={false} domain={["dataMin - 500", "dataMax + 500"]} />
                <Tooltip
                  contentStyle={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "var(--lime-primary)" }}
                />
                <Area type="monotone" dataKey="value" stroke="#D2F900" fill="url(#portfolioGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Asset Allocation */}
          <div className="lg:col-span-4 card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              Allocation
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={allocation} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                  {allocation.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {allocation.map((a) => (
                <div key={a.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                  <span className="text-xs" style={{ color: "var(--grey-dim)" }}>{a.name}</span>
                  <span className="text-xs font-mono-data text-white">{a.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Signal Terminal */}
          <div className="lg:col-span-4">
            <AITypewriter />
          </div>

          {/* Top Opportunities */}
          <div className="lg:col-span-4 card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              Top Performers
            </h3>
            <div className="space-y-3">
              {topGainers.map((ticker, i) => (
                <div key={ticker.pair} className="flex items-center justify-between py-2" style={{ borderBottom: i < topGainers.length - 1 ? "1px solid var(--navy-highlight)" : "none" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}>
                      {ticker.pair.split("/")[0]?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-mono-data font-medium text-white">{ticker.pair}</div>
                      <div className="text-xs" style={{ color: "var(--grey-dim)" }}>Vol: {ticker.volume24h}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono-data text-white">{ticker.price}</div>
                    <div className="text-xs flex items-center gap-1" style={{ color: "var(--lime-primary)" }}>
                      <TrendingUp className="w-3 h-3" />{ticker.change24h}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="lg:col-span-4 card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              Market Sentiment
            </h3>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--navy-highlight)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="var(--lime-primary)"
                    strokeWidth="8"
                    strokeDasharray={`${(sentiment?.fearGreedIndex ?? 72) * 2.64} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono-data text-white">{sentiment?.fearGreedIndex ?? 72}</span>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--lime-primary)" }}>{sentiment?.fearGreedLabel ?? "Greed"}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--grey-dim)" }}>Volatility</span>
                <span className="text-white capitalize">{sentiment?.volatility ?? "Medium"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--grey-dim)" }}>Market Mood</span>
                <span className="text-white capitalize">{sentiment?.marketMood ?? "Optimistic"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
