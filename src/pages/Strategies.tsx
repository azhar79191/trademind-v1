import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Zap, Play, Pause, Trash2, Plus, TrendingUp, Shield, Clock, Target, BarChart3,
} from "lucide-react";

const BB_PARAMS = { period: 20, stdDev: 2 };
const ATR_PARAMS = { period: 14, multiplier: 1.5 };
const EMA20_PARAMS = { period: 20 };
const EMA50_PARAMS = { period: 50 };
const RSI_PARAMS = { period: 14, overbought: 70, oversold: 30 };

const PRESETS = [
  {
    name: "EMA Crossover",
    type: "trend_following" as const,
    description: "Classic EMA 20/50 crossover strategy for trending markets",
    timeframe: "1h",
    config: {
      indicators: [{ name: "EMA", parameters: EMA20_PARAMS }, { name: "EMA", parameters: EMA50_PARAMS }],
      entryConditions: [{ indicator: "EMA_20", operator: "crosses_above" as const, value: 0 }],
      exitConditions: [{ indicator: "EMA_20", operator: "crosses_below" as const, value: 0 }],
      positionSizing: "percent" as const,
      positionSizeValue: 2,
    },
  },
  {
    name: "RSI Mean Reversion",
    type: "mean_reversion" as const,
    description: "Buy oversold, sell overbought using RSI oscillator",
    timeframe: "4h",
    config: {
      indicators: [{ name: "RSI", parameters: RSI_PARAMS }],
      entryConditions: [{ indicator: "RSI", operator: "lt" as const, value: 30 }],
      exitConditions: [{ indicator: "RSI", operator: "gt" as const, value: 70 }],
      positionSizing: "percent" as const,
      positionSizeValue: 3,
    },
  },
  {
    name: "Bollinger Squeeze",
    type: "breakout" as const,
    description: "Capture breakouts after Bollinger Bands contraction",
    timeframe: "1h",
    config: {
      indicators: [{ name: "BB", parameters: BB_PARAMS }, { name: "ATR", parameters: ATR_PARAMS }],
      entryConditions: [{ indicator: "BB_WIDTH", operator: "lt" as const, value: 0.05 }],
      exitConditions: [{ indicator: "BB_UPPER", operator: "gt" as const, value: 0 }],
      positionSizing: "fixed" as const,
      positionSizeValue: 100,
    },
  },
];

export default function Strategies() {
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "draft">("all");

  const utils = trpc.useUtils();
  const { data: strategies, isLoading } = trpc.strategy.list.useQuery(
    statusFilter === "all" ? undefined : { status: statusFilter }
  );

  const createMutation = trpc.strategy.create.useMutation({
    onSuccess: () => { utils.strategy.list.invalidate(); setShowCreate(false); },
  });

  const toggleMutation = trpc.strategy.toggleStatus.useMutation({
    onSuccess: () => utils.strategy.list.invalidate(),
  });

  const deleteMutation = trpc.strategy.delete.useMutation({
    onSuccess: () => utils.strategy.list.invalidate(),
  });

  const handleCreate = (preset: typeof PRESETS[0]) => {
    createMutation.mutate({
      name: preset.name,
      description: preset.description,
      type: preset.type,
      exchange: "binance",
      tradingPair: "BTC/USDT",
      timeframe: preset.timeframe,
      config: preset.config,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Strategies</h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-dim)" }}>Create, manage, and deploy automated trading strategies</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "white" }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="btn-lime flex items-center gap-2 text-sm px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              New Strategy
            </button>
          </div>
        </div>

        {/* Strategy Presets */}
        {showCreate && (
          <div className="card-surface p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Start Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleCreate(preset)}
                  disabled={createMutation.isPending}
                  className="text-left p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
                    <span className="text-sm font-semibold text-white">{preset.name}</span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: "var(--grey-dim)" }}>{preset.description}</p>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--lime-primary)" }}>
                    <Clock className="w-3 h-3" />{preset.timeframe}
                    <Target className="w-3 h-3 ml-1" />{preset.type.replace("_", " ")}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Strategies List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-surface p-6">
                <div className="h-4 rounded animate-pulse mb-3" style={{ background: "var(--navy-highlight)", width: "30%" }} />
                <div className="h-3 rounded animate-pulse" style={{ background: "var(--navy-highlight)", width: "60%" }} />
              </div>
            ))
          ) : strategies?.length === 0 ? (
            <div className="card-surface p-12 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--navy-highlight)" }} />
              <h3 className="text-lg font-semibold text-white mb-2">No Strategies Yet</h3>
              <p className="text-sm" style={{ color: "var(--grey-dim)" }}>Create your first automated trading strategy to get started</p>
            </div>
          ) : (
            strategies?.map((strategy) => (
              <div key={strategy.id} className="card-surface p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-white">{strategy.name}</h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: strategy.status === "active" ? "rgba(16, 185, 129, 0.2)" : strategy.status === "paused" ? "rgba(245, 158, 11, 0.2)" : "var(--navy-highlight)",
                          color: strategy.status === "active" ? "#10B981" : strategy.status === "paused" ? "#F59E0B" : "var(--grey-dim)",
                        }}
                      >
                        {strategy.status}
                      </span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: "var(--grey-dim)" }}>{strategy.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--grey-dim)" }}>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" />{strategy.tradingPair}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{strategy.timeframe}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{strategy.type.replace("_", " ")}</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{strategy.exchange}</span>
                      {strategy.performance && (
                        <span className="flex items-center gap-1 font-mono-data" style={{ color: "var(--lime-primary)" }}>
                          <BarChart3 className="w-3 h-3" />
                          WR: {strategy.performance.winRate ?? 0}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleMutation.mutate({ id: strategy.id })}
                      disabled={toggleMutation.isPending}
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: "var(--navy-highlight)" }}
                      title={strategy.status === "active" ? "Pause" : "Activate"}
                    >
                      {strategy.status === "active" ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />}
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this strategy?")) deleteMutation.mutate({ id: strategy.id }); }}
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: "var(--navy-highlight)" }}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
