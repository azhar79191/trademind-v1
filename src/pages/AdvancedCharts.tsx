import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CandlestickChart from "@/components/CandlestickChart";
import { trpc } from "@/providers/trpc";
import { BarChart3, Activity, TrendingUp, Zap, Target } from "lucide-react";

const COINS = [
  { symbol: "BTC", name: "Bitcoin",      pair: "BTC/USDT", binance: "BTCUSDT", color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum",     pair: "ETH/USDT", binance: "ETHUSDT", color: "#627EEA" },
  { symbol: "SOL", name: "Solana",       pair: "SOL/USDT", binance: "SOLUSDT", color: "#9945FF" },
  { symbol: "BNB", name: "Binance Coin", pair: "BNB/USDT", binance: "BNBUSDT", color: "#F3BA2F" },
];

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function AdvancedCharts() {
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [chartData, setChartData] = useState<Candle[]>([]);
  const [showVolume, setShowVolume] = useState(true);
  const [showPatterns, setShowPatterns] = useState(true);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: candles, isLoading } = trpc.market.getCandles.useQuery(
    { pair: selectedCoin.pair, timeframe: "1h", limit: 150 },
    { refetchOnWindowFocus: false }
  );

  // Load historical candles when pair changes
  useEffect(() => {
    setChartData([]);
  }, [selectedCoin]);

  useEffect(() => {
    if (!candles || candles.length === 0) return;
    setChartData(
      candles.map((c) => ({
        time: new Date(c.timestamp).getTime(),
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
        volume: parseFloat(c.volume),
      }))
    );
  }, [candles]);

  // Live tick: update last candle's close/high/low every 2s from Binance
  useEffect(() => {
    if (tickerRef.current) clearInterval(tickerRef.current);

    tickerRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${selectedCoin.binance}`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (!res.ok) return;
        const { price } = await res.json() as { price: string };
        const livePrice = parseFloat(price);

        setChartData((prev) => {
          if (prev.length === 0) return prev;
          const last = prev[prev.length - 1];
          const now = Date.now();
          const oneHour = 3600000;

          if (now - last.time < oneHour) {
            // Update current candle
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              close: livePrice,
              high: Math.max(last.high, livePrice),
              low: Math.min(last.low, livePrice),
            };
            return updated;
          } else {
            // New candle
            const newCandle: Candle = {
              time: now,
              open: last.close,
              high: Math.max(last.close, livePrice),
              low: Math.min(last.close, livePrice),
              close: livePrice,
              volume: 0,
            };
            return [...prev.slice(-149), newCandle];
          }
        });
      } catch {
        // silently ignore network errors
      }
    }, 2000);

    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [selectedCoin]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  const openPrice = chartData.length > 0 ? chartData[chartData.length - 1].open : currentPrice;
  const priceChange = currentPrice - openPrice;
  const priceChangePercent = openPrice > 0 ? (priceChange / openPrice) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7" style={{ color: "var(--lime-primary)" }} />
              Advanced Candlestick Charts
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-dim)" }}>
              Professional trading charts with pattern recognition
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${showPatterns ? "" : "opacity-50"}`}
            style={{ background: "var(--navy-highlight)", color: showPatterns ? "var(--lime-primary)" : "var(--grey-dim)" }}
          >
            <Activity className="w-4 h-4" />
            Pattern Detection
          </div>
        </div>

        {/* Price Header */}
        <div className="card-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {selectedCoin.name} ({selectedCoin.pair})
                </h2>
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium animate-pulse"
                  style={{ background: "rgba(210, 249, 0, 0.1)", color: "var(--lime-primary)" }}
                >
                  <Activity className="w-3 h-3" />
                  LIVE
                </div>
              </div>
              <div className="flex items-baseline gap-4">
                {isLoading && chartData.length === 0 ? (
                  <span className="text-2xl font-bold font-mono-data" style={{ color: "var(--grey-dim)" }}>
                    Loading...
                  </span>
                ) : (
                  <>
                    <span className="text-4xl font-bold font-mono-data text-white">
                      ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center gap-2">
                      {priceChange >= 0
                        ? <TrendingUp className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
                        : <Activity className="w-5 h-5 text-red-400" />
                      }
                      <span className="text-lg font-medium" style={{ color: priceChange >= 0 ? "var(--lime-primary)" : "#EF4444" }}>
                        {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Coin selector */}
            <div className="flex flex-wrap gap-2">
              {COINS.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: selectedCoin.symbol === coin.symbol ? "var(--navy-highlight)" : "transparent",
                    color: selectedCoin.symbol === coin.symbol ? "var(--lime-primary)" : "var(--grey-dim)",
                    border: `1px solid ${selectedCoin.symbol === coin.symbol ? "var(--lime-primary)" : "var(--navy-highlight)"}`,
                  }}
                >
                  {coin.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="card-surface p-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: "var(--lime-primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--grey-dim)" }}>Show Volume</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPatterns}
                onChange={(e) => setShowPatterns(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: "var(--lime-primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--grey-dim)" }}>Detect Patterns</span>
            </label>
          </div>
        </div>

        {/* Main Chart */}
        <div className="card-surface p-6">
          {isLoading && chartData.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: 600 }}>
              <span style={{ color: "var(--grey-dim)" }}>Loading chart data...</span>
            </div>
          ) : (
            <CandlestickChart
              coin={selectedCoin.symbol}
              data={chartData}
              height={600}
              showVolume={showVolume}
              showPatterns={showPatterns}
            />
          )}
        </div>

        {/* Chart Pattern Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              <h3 className="text-lg font-semibold text-white">Head and Shoulders</h3>
            </div>
            <p className="text-sm mb-3" style={{ color: "var(--grey-dim)" }}>
              A bearish reversal pattern with three peaks: left shoulder, head (highest), and right shoulder.
            </p>
            <div className="text-xs" style={{ color: "var(--grey-dim)" }}>
              <strong className="text-white">Signal:</strong> When price breaks below the neckline, it signals a potential trend reversal from bullish to bearish.
            </div>
          </div>

          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              <h3 className="text-lg font-semibold text-white">How to Read</h3>
            </div>
            <div className="space-y-2 text-xs" style={{ color: "var(--grey-dim)" }}>
              <div><span className="inline-block w-3 h-3 rounded mr-2" style={{ background: "#00E676" }}></span>Green Candle: Close &gt; Open (Bullish)</div>
              <div><span className="inline-block w-3 h-3 rounded mr-2" style={{ background: "#FF5252" }}></span>Red Candle: Close &lt; Open (Bearish)</div>
              <div><span className="inline-block w-12 h-0.5 mr-2" style={{ background: "var(--lime-primary)" }}></span>Pattern Lines: Detected formations</div>
            </div>
          </div>

          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
              <h3 className="text-lg font-semibold text-white">Trading Tips</h3>
            </div>
            <ul className="space-y-2 text-xs" style={{ color: "var(--grey-dim)" }}>
              <li>• Use zoom controls to analyze specific time periods</li>
              <li>• Hover over candles for detailed OHLC data</li>
              <li>• Volume bars indicate trading activity strength</li>
              <li>• Pattern detection helps identify key reversals</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
