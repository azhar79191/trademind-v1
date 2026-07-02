import { useState } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "@/components/DashboardLayout";
import TradingChart from "@/components/TradingChart";
import { BarChart3, TrendingUp, Activity, DollarSign, Zap, ExternalLink } from "lucide-react";

export default function Charts() {
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState("BTC");

  // Mock data for coin stats
  const coinStats = {
    BTC: { marketCap: "$2.1T", volume24h: "$45.2B", circulatingSupply: "19.5M BTC", allTimeHigh: "$108,353" },
    ETH: { marketCap: "$495B", volume24h: "$25.8B", circulatingSupply: "120M ETH", allTimeHigh: "$4,891" },
    SOL: { marketCap: "$95B", volume24h: "$8.5B", circulatingSupply: "452M SOL", allTimeHigh: "$259" },
    BNB: { marketCap: "$98B", volume24h: "$2.1B", circulatingSupply: "144M BNB", allTimeHigh: "$690" },
    XRP: { marketCap: "$145B", volume24h: "$12.3B", circulatingSupply: "54B XRP", allTimeHigh: "$3.84" },
    ADA: { marketCap: "$30B", volume24h: "$1.8B", circulatingSupply: "35B ADA", allTimeHigh: "$3.09" },
    DOGE: { marketCap: "$22B", volume24h: "$2.5B", circulatingSupply: "142B DOGE", allTimeHigh: "$0.73" },
    AVAX: { marketCap: "$15B", volume24h: "$890M", circulatingSupply: "357M AVAX", allTimeHigh: "$144" },
  };

  const currentStats = coinStats[selectedCoin as keyof typeof coinStats] || coinStats.BTC;

  // Technical indicators (mock data)
  const technicalIndicators = [
    { name: "RSI (14)", value: "61.5", status: "Neutral", color: "var(--grey-dim)" },
    { name: "MACD (12,26)", value: "Bullish", status: "Buy Signal", color: "var(--lime-primary)" },
    { name: "EMA 20", value: `$${(108250 * 0.99).toFixed(0)}`, status: "Above", color: "var(--lime-primary)" },
    { name: "EMA 50", value: `$${(108250 * 0.98).toFixed(0)}`, status: "Above", color: "var(--lime-primary)" },
    { name: "EMA 200", value: `$${(108250 * 0.95).toFixed(0)}`, status: "Above", color: "var(--lime-primary)" },
    { name: "BB Upper", value: `$${(108250 * 1.02).toFixed(0)}`, status: "Resistance", color: "#EF4444" },
    { name: "BB Lower", value: `$${(108250 * 0.98).toFixed(0)}`, status: "Support", color: "var(--lime-primary)" },
    { name: "ATR (14)", value: "2,450", status: "High Volatility", color: "var(--grey-dim)" },
  ];

  // Market overview stats
  const marketOverview = [
    { label: "Global Market Cap", value: "$3.8T", change: "+2.4%", isPositive: true },
    { label: "24h Volume", value: "$125B", change: "+8.7%", isPositive: true },
    { label: "BTC Dominance", value: "55.3%", change: "-0.5%", isPositive: false },
    { label: "Active Cryptocurrencies", value: "25,847", change: "+45", isPositive: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7" style={{ color: "var(--lime-primary)" }} />
              Live Trading Charts
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-dim)" }}>
              Real-time market data with advanced charting tools
            </p>
          </div>
          <button
            onClick={() => navigate("/advanced-charts")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "var(--lime-primary)", color: "var(--navy-base)" }}
          >
            <BarChart3 className="w-4 h-4" />
            Advanced Candlestick Charts
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {marketOverview.map((stat) => (
            <div key={stat.label} className="card-surface p-4">
              <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--grey-dim)" }}>
                {stat.label}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono-data text-white">{stat.value}</span>
                <span
                  className={`text-xs font-medium flex items-center gap-1`}
                  style={{ color: stat.isPositive ? "var(--lime-primary)" : "#EF4444" }}
                >
                  {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <TradingChart
          defaultCoin={selectedCoin}
          showCoinSelector={true}
          height={500}
          onCoinChange={setSelectedCoin}
        />

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coin Statistics */}
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              {selectedCoin} Statistics
            </h3>
            <div className="space-y-3">
              {[
                { label: "Market Cap", value: currentStats.marketCap },
                { label: "24h Volume", value: currentStats.volume24h },
                { label: "Circulating Supply", value: currentStats.circulatingSupply },
                { label: "All-Time High", value: currentStats.allTimeHigh },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: i < 3 ? "1px solid var(--navy-highlight)" : "none" }}
                >
                  <span className="text-sm" style={{ color: "var(--grey-dim)" }}>{stat.label}</span>
                  <span className="text-sm font-mono-data font-semibold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              Technical Indicators
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {technicalIndicators.map((indicator) => (
                <div key={indicator.name} className="p-3 rounded-lg" style={{ background: "var(--navy-base)" }}>
                  <div className="text-xs mb-1" style={{ color: "var(--grey-dim)" }}>{indicator.name}</div>
                  <div className="text-sm font-mono-data font-semibold text-white mb-1">{indicator.value}</div>
                  <div className="text-xs font-medium" style={{ color: indicator.color }}>{indicator.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trading Signal Summary */}
        <div className="card-surface p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
            AI Trading Signal Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--grey-dim)" }}>
                Overall Signal
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: "var(--lime-primary)" }}>BUY</div>
              <div className="text-sm" style={{ color: "var(--grey-dim)" }}>Strong bullish momentum</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--grey-dim)" }}>
                Confidence Score
              </div>
              <div className="text-3xl font-bold text-white mb-1">89%</div>
              <div className="text-sm" style={{ color: "var(--grey-dim)" }}>High confidence</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--grey-dim)" }}>
                Risk Level
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: "var(--lime-primary)" }}>MEDIUM</div>
              <div className="text-sm" style={{ color: "var(--grey-dim)" }}>Balanced risk/reward</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg" style={{ background: "rgba(210, 249, 0, 0.05)", border: "1px solid rgba(210, 249, 0, 0.2)" }}>
            <div className="text-sm text-white mb-2">
              <strong>Reasoning:</strong> {selectedCoin}/USDT is showing strong bullish momentum with price above all major EMAs.
              MACD has formed a bullish crossover, RSI is in neutral territory allowing room for upside, and volume is increasing.
              The breakout above key resistance levels suggests continuation of the uptrend.
            </div>
            <div className="text-xs" style={{ color: "var(--grey-dim)" }}>
              <strong>Recommendation:</strong> Entry zone: Current price ± 1%, Stop Loss: 3% below entry, Take Profit: 1:2 risk/reward ratio
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
