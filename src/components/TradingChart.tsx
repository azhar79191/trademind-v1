import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, BarChart3, Maximize2 } from "lucide-react";
import { useActivePair } from "@/providers/TradingPairContext";

interface TradingChartProps {
  defaultCoin?: string;
  showCoinSelector?: boolean;
  height?: number;
  onCoinChange?: (coin: string) => void;
}

const COINS = [
  { symbol: "BTC", name: "Bitcoin", color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", color: "#627EEA" },
  { symbol: "SOL", name: "Solana", color: "#9945FF" },
  { symbol: "BNB", name: "Binance Coin", color: "#F3BA2F" },
  { symbol: "XRP", name: "Ripple", color: "#23292F" },
  { symbol: "ADA", name: "Cardano", color: "#0033AD" },
  { symbol: "DOGE", name: "Dogecoin", color: "#C2A633" },
  { symbol: "AVAX", name: "Avalanche", color: "#E84142" },
];

const TIMEFRAMES = [
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
];

const CHART_TYPES = [
  { label: "Line", value: "line", icon: Activity },
  { label: "Area", value: "area", icon: TrendingUp },
  { label: "Candles", value: "candle", icon: BarChart3 },
];

// Generate realistic price data with volatility
function generatePriceData(basePrices: Record<string, number>, coin: string, points: number = 100) {
  const basePrice = basePrices[coin] || 100;
  const data = [];
  let price = basePrice;
  const now = Date.now();
  const interval = 3600000; // 1 hour in ms

  for (let i = points; i >= 0; i--) {
    const time = new Date(now - i * interval);
    const volatility = 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * 2 * volatility * price;
    price = Math.max(price + change, basePrice * 0.8); // Don't go below 80% of base
    
    // For candlestick
    const open = price;
    const high = price * (1 + Math.random() * 0.01);
    const low = price * (1 - Math.random() * 0.01);
    const close = low + Math.random() * (high - low);
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    data.push({
      time: time.getTime(),
      timeStr: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      dateStr: time.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(2)),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
  }

  return data;
}

const BASE_PRICES: Record<string, number> = {
  BTC: 108250,
  ETH: 4125,
  SOL: 210,
  BNB: 680,
  XRP: 0.62,
  DOGE: 0.15,
  ADA: 0.85,
  AVAX: 42,
};

export default function TradingChart({
  defaultCoin,
  showCoinSelector = true,
  height = 400,
  onCoinChange,
}: TradingChartProps) {
  const { activePair } = useActivePair();
  // activePair is like "BTC/USDT" — extract the base symbol
  const contextCoin = activePair.split("/")[0] ?? "BTC";
  const [selectedCoin, setSelectedCoin] = useState(defaultCoin ?? contextCoin);

  // When activePair changes globally (e.g. Settings save), sync the chart
  useEffect(() => {
    if (!defaultCoin) setSelectedCoin(contextCoin);
  }, [contextCoin, defaultCoin]);
  const [timeframe, setTimeframe] = useState("1d");
  const [chartType, setChartType] = useState<"line" | "area" | "candle">("area");
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Generate initial data
  useEffect(() => {
    const data = generatePriceData(BASE_PRICES, selectedCoin);
    setChartData(data);
    
    if (data.length > 0) {
      const latest = data[data.length - 1];
      const previous = data[0];
      setCurrentPrice(latest.price);
      setPriceChange(latest.price - previous.price);
      setPriceChangePercent(((latest.price - previous.price) / previous.price) * 100);
    }
  }, [selectedCoin, timeframe]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      
      setChartData((prevData) => {
        if (prevData.length === 0) return prevData;
        
        const newData = [...prevData];
        const lastPoint = newData[newData.length - 1];
        const volatility = 0.002; // 0.2% per update
        const change = (Math.random() - 0.5) * 2 * volatility * lastPoint.price;
        const newPrice = Math.max(lastPoint.price + change, BASE_PRICES[selectedCoin] * 0.8);
        
        const now = new Date();
        const newPoint = {
          time: now.getTime(),
          timeStr: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          dateStr: now.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          price: parseFloat(newPrice.toFixed(2)),
          open: lastPoint.close,
          high: Math.max(newPrice, lastPoint.close) * (1 + Math.random() * 0.005),
          low: Math.min(newPrice, lastPoint.close) * (1 - Math.random() * 0.005),
          close: parseFloat(newPrice.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000) + 500000,
        };

        // Keep last 100 points
        const updatedData = [...newData.slice(-99), newPoint];
        
        // Update current price
        setCurrentPrice(newPrice);
        const firstPrice = updatedData[0].price;
        setPriceChange(newPrice - firstPrice);
        setPriceChangePercent(((newPrice - firstPrice) / firstPrice) * 100);
        
        setTimeout(() => setIsUpdating(false), 300);
        
        return updatedData;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [selectedCoin]);

  const handleCoinChange = (coin: string) => {
    setSelectedCoin(coin);
    if (onCoinChange) onCoinChange(coin);
  };

  const isPositive = priceChange >= 0;
  const coinData = COINS.find((c) => c.symbol === selectedCoin);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    
    return (
      <div className="card-surface p-3 shadow-lg">
        <p className="text-xs mb-2" style={{ color: "var(--grey-dim)" }}>
          {data.dateStr} {data.timeStr}
        </p>
        {chartType === "candle" ? (
          <div className="space-y-1">
            <div className="flex justify-between gap-4 text-xs">
              <span style={{ color: "var(--grey-dim)" }}>Open:</span>
              <span className="font-mono-data text-white">${data.open.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span style={{ color: "var(--grey-dim)" }}>High:</span>
              <span className="font-mono-data" style={{ color: "var(--lime-primary)" }}>${data.high.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span style={{ color: "var(--grey-dim)" }}>Low:</span>
              <span className="font-mono-data text-red-400">${data.low.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span style={{ color: "var(--grey-dim)" }}>Close:</span>
              <span className="font-mono-data text-white font-bold">${data.close.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4 text-xs pt-1" style={{ borderTop: "1px solid var(--navy-highlight)" }}>
              <span style={{ color: "var(--grey-dim)" }}>Volume:</span>
              <span className="font-mono-data text-white">{(data.volume / 1000000).toFixed(2)}M</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between gap-4">
            <span className="text-xs" style={{ color: "var(--grey-dim)" }}>Price:</span>
            <span className="text-sm font-mono-data font-bold text-white">
              ${data.price.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card-surface p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">
              {coinData?.name} ({selectedCoin}/USDT)
            </h3>
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${isUpdating ? "animate-pulse" : ""}`}
              style={{ background: isPositive ? "rgba(210, 249, 0, 0.1)" : "rgba(239, 68, 68, 0.1)" }}>
              <Activity className="w-3 h-3" style={{ color: isPositive ? "var(--lime-primary)" : "#EF4444" }} />
              <span style={{ color: isPositive ? "var(--lime-primary)" : "#EF4444" }}>LIVE</span>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold font-mono-data text-white">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${isPositive ? "text-lime-primary" : "text-red-400"}`} style={{ color: isPositive ? "var(--lime-primary)" : "#EF4444" }}>
                {isPositive ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg transition-colors hover:bg-navy-highlight" style={{ color: "var(--grey-dim)" }}>
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Coin Selector */}
      {showCoinSelector && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
          {COINS.map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => handleCoinChange(coin.symbol)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCoin === coin.symbol ? "" : ""
              }`}
              style={{
                background: selectedCoin === coin.symbol ? "var(--navy-highlight)" : "transparent",
                color: selectedCoin === coin.symbol ? "var(--lime-primary)" : "var(--grey-dim)",
                border: `1px solid ${selectedCoin === coin.symbol ? "var(--lime-primary)" : "var(--navy-highlight)"}`,
              }}
            >
              {coin.symbol}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Timeframe */}
        <div className="flex items-center gap-2">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                timeframe === tf.value ? "" : ""
              }`}
              style={{
                background: timeframe === tf.value ? "var(--lime-primary)" : "var(--navy-highlight)",
                color: timeframe === tf.value ? "var(--navy-base)" : "var(--grey-dim)",
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart Type */}
        <div className="flex items-center gap-2">
          {CHART_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setChartType(type.value as any)}
              className={`p-2 rounded-lg transition-all ${
                chartType === type.value ? "" : ""
              }`}
              style={{
                background: chartType === type.value ? "var(--navy-highlight)" : "transparent",
                color: chartType === type.value ? "var(--lime-primary)" : "var(--grey-dim)",
              }}
              title={type.label}
            >
              <type.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="timeStr"
                stroke="var(--grey-dim)"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--grey-dim)"
                fontSize={11}
                tickLine={false}
                domain={["dataMin - 50", "dataMax + 50"]}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={coinData?.color || "var(--lime-primary)"}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          ) : chartType === "area" ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${selectedCoin}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={coinData?.color || "var(--lime-primary)"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={coinData?.color || "var(--lime-primary)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="timeStr"
                stroke="var(--grey-dim)"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--grey-dim)"
                fontSize={11}
                tickLine={false}
                domain={["dataMin - 50", "dataMax + 50"]}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={coinData?.color || "var(--lime-primary)"}
                fill={`url(#gradient-${selectedCoin})`}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            // Candlestick simulation using Line chart (for simplicity)
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="timeStr"
                stroke="var(--grey-dim)"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--grey-dim)"
                fontSize={11}
                tickLine={false}
                domain={["dataMin - 50", "dataMax + 50"]}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="high" stroke="var(--lime-primary)" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="low" stroke="#EF4444" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="close" stroke={coinData?.color || "var(--lime-primary)"} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6" style={{ borderTop: "1px solid var(--navy-highlight)" }}>
        {[
          { label: "24h High", value: `$${Math.max(...chartData.map((d) => d.price)).toLocaleString()}` },
          { label: "24h Low", value: `$${Math.min(...chartData.map((d) => d.price)).toLocaleString()}` },
          { label: "24h Volume", value: `${(chartData.reduce((sum, d) => sum + d.volume, 0) / 1000000000).toFixed(2)}B` },
          { label: "Market Cap", value: `$${(BASE_PRICES[selectedCoin] * 19500000 / 1000000000).toFixed(2)}B` },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-xs mb-1" style={{ color: "var(--grey-dim)" }}>{stat.label}</div>
            <div className="text-sm font-mono-data font-semibold text-white">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
