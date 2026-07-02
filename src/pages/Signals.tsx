import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useActivePair, AVAILABLE_PAIRS } from "@/providers/TradingPairContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Radar, TrendingUp, AlertTriangle, Target, Shield, ChevronRight, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";

const PAIRS = AVAILABLE_PAIRS;

export default function Signals() {
  const navigate = useNavigate();
  const { activePair } = useActivePair();
  const [selectedPair, setSelectedPair] = useState(() => activePair);

  const { data: analysis, isLoading: analysisLoading } = trpc.signal.analyze.useQuery(
    { pair: selectedPair },
    { enabled: !!selectedPair }
  );

  const { data: sentiment } = trpc.signal.getSentiment.useQuery();

  const riskColor = (level: string) => {
    switch (level) {
      case "low": return "#10B981";
      case "medium": return "var(--lime-primary)";
      case "high": return "#F59E0B";
      case "extreme": return "#EF4444";
      default: return "var(--lime-primary)";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Radar className="w-6 h-6" style={{ color: "var(--lime-primary)" }} />
              AI Signals
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-dim)" }}>AI-generated trading signals with technical analysis</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PAIRS.map((pair) => (
              <button
                key={pair}
                onClick={() => setSelectedPair(pair)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-data font-medium transition-all ${selectedPair === pair ? "" : ""}`}
                style={{
                  background: selectedPair === pair ? "var(--navy-highlight)" : "transparent",
                  color: selectedPair === pair ? "var(--lime-primary)" : "var(--grey-dim)",
                  border: selectedPair === pair ? "1px solid var(--lime-primary)" : "1px solid var(--navy-highlight)",
                }}
              >
                {pair}
              </button>
            ))}
          </div>
        </div>

        {/* Main Signal Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-surface p-6">
            {analysisLoading ? (
              <div className="space-y-4">
                <div className="h-6 rounded animate-pulse" style={{ background: "var(--navy-highlight)", width: "40%" }} />
                <div className="h-4 rounded animate-pulse" style={{ background: "var(--navy-highlight)", width: "70%" }} />
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 rounded animate-pulse" style={{ background: "var(--navy-highlight)" }} />
                  ))}
                </div>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-mono-data text-white">{analysis.pair}/USDT</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          background: analysis.trend === "Bullish" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          color: analysis.trend === "Bullish" ? "#10B981" : "#EF4444",
                        }}
                      >
                        {analysis.trend}
                      </span>
                      <span className="text-sm font-mono-data" style={{ color: "var(--grey-dim)" }}>Confidence: {analysis.confidence}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold font-mono-data text-white">${analysis.entryPrice}</div>
                    <div className="text-xs" style={{ color: "var(--grey-dim)" }}>Current Price</div>
                  </div>
                </div>

                {/* Key Levels */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
                      <span className="text-xs" style={{ color: "var(--grey-dim)" }}>Entry</span>
                    </div>
                    <div className="text-lg font-bold font-mono-data text-white">${analysis.entryPrice}</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "var(--navy-base)", border: "1px solid #EF444430" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="text-xs" style={{ color: "var(--grey-dim)" }}>Stop Loss</span>
                    </div>
                    <div className="text-lg font-bold font-mono-data text-red-400">${analysis.stopLoss}</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "var(--navy-base)", border: "1px solid var(--lime-primary)30" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
                      <span className="text-xs" style={{ color: "var(--grey-dim)" }}>Take Profit</span>
                    </div>
                    <div className="text-lg font-bold font-mono-data" style={{ color: "var(--lime-primary)" }}>${analysis.takeProfit}</div>
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Risk Assessment</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" style={{ color: riskColor(analysis.riskLevel) }} />
                        <span className="text-sm capitalize" style={{ color: riskColor(analysis.riskLevel) }}>{analysis.riskLevel} Risk</span>
                      </div>
                      <div className="text-sm" style={{ color: "var(--grey-dim)" }}>Position Size: {analysis.positionSize}</div>
                      <div className="text-sm" style={{ color: "var(--grey-dim)" }}>R:R {analysis.riskReward}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Key Indicators</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(analysis.indicators).map(([name, value]) => (
                        <div key={name} className="p-2 rounded-lg" style={{ background: "var(--navy-base)" }}>
                          <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>{name}</div>
                          <div className="text-sm font-mono-data font-medium text-white">
                            {typeof value === "number" ? value.toFixed(2) : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Reasoning</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--grey-dim)" }}>{analysis.reasoning}</p>
                  </div>

                  {analysis.alternativeScenarios && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Alternative Scenarios</h4>
                      <ul className="space-y-1">
                        {analysis.alternativeScenarios.map((scenario, i) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--grey-dim)" }}>
                            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--lime-primary)" }} />
                            {scenario}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate("/chat")}
                  className="btn-lime flex items-center gap-2 text-sm"
                >
                  <Zap className="w-4 h-4" />
                  Ask AI for Detailed Analysis
                </button>
              </div>
            ) : null}
          </div>

          {/* Market Sentiment Sidebar */}
          <div className="space-y-4">
            <div className="card-surface p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Global Sentiment</h3>
              <div className="flex items-center justify-center py-2">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--navy-highlight)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--lime-primary)" strokeWidth="8"
                      strokeDasharray={`${(sentiment?.fearGreedIndex ?? 72) * 2.64} 264`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-mono-data text-white">{sentiment?.fearGreedIndex ?? 72}</span>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--lime-primary)" }}>{sentiment?.fearGreedLabel ?? "Greed"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-surface p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Top Gainers</h3>
              <div className="space-y-2">
                {sentiment?.topGainers?.map((g) => (
                  <div key={g.pair} className="flex items-center justify-between py-1.5">
                    <span className="text-xs font-mono-data text-white">{g.pair}</span>
                    <span className="text-xs font-mono-data flex items-center gap-1" style={{ color: "var(--lime-primary)" }}>
                      <ArrowUpRight className="w-3 h-3" />{g.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-surface p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Top Losers</h3>
              <div className="space-y-2">
                {sentiment?.topLosers?.map((l) => (
                  <div key={l.pair} className="flex items-center justify-between py-1.5">
                    <span className="text-xs font-mono-data text-white">{l.pair}</span>
                    <span className="text-xs font-mono-data flex items-center gap-1 text-red-400">
                      <ArrowDownRight className="w-3 h-3" />{l.change}
                    </span>
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
