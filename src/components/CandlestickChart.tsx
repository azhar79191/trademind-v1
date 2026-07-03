import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Activity, ZoomIn, ZoomOut } from "lucide-react";

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  coin: string;
  data: CandleData[];
  height?: number;
  showVolume?: boolean;
  showPatterns?: boolean;
}

export default function CandlestickChart({
  data,
  height = 500,
  showVolume = true,
  showPatterns = true,
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [patterns, setPatterns] = useState<any[]>([]);

  // Detect head-and-shoulders patterns
  useEffect(() => {
    if (data.length < 20 || !showPatterns) { setPatterns([]); return; }
    const detected: any[] = [];
    for (let i = 10; i < data.length - 10; i++) {
      const ls = data[i - 10], head = data[i], rs = data[i + 10];
      if (
        head.high > ls.high &&
        head.high > rs.high &&
        Math.abs(ls.high - rs.high) < ls.high * 0.05
      ) {
        detected.push({
          type: "head-and-shoulders",
          leftShoulderIndex: i - 10,
          headIndex: i,
          rightShoulderIndex: i + 10,
          neckline: (ls.low + rs.low) / 2,
        });
      }
    }
    setPatterns(detected);
  }, [data, showPatterns]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    // Layout
    const PAD_LEFT = 70;   // price axis
    const PAD_RIGHT = 10;
    const PAD_TOP = 20;
    const PAD_BOTTOM = 30; // time axis
    const VOLUME_H = showVolume ? Math.floor(H * 0.18) : 0;
    const VOLUME_GAP = showVolume ? 8 : 0;

    const chartTop = PAD_TOP;
    const chartBottom = H - PAD_BOTTOM - VOLUME_H - VOLUME_GAP;
    const chartH = chartBottom - chartTop;
    const chartW = W - PAD_LEFT - PAD_RIGHT;

    // Background
    ctx.fillStyle = "#0B1222";
    ctx.fillRect(0, 0, W, H);

    // Visible candles based on zoom
    const visibleCount = Math.max(10, Math.floor(data.length / zoom));
    const startIdx = Math.max(0, data.length - visibleCount);
    const visible = data.slice(startIdx);

    // Price range with 5% padding
    const rawMin = Math.min(...visible.map(d => d.low));
    const rawMax = Math.max(...visible.map(d => d.high));
    const rangePad = (rawMax - rawMin) * 0.05 || rawMax * 0.01;
    const priceMin = rawMin - rangePad;
    const priceMax = rawMax + rangePad;
    const priceRange = priceMax - priceMin;

    // Helpers
    const toY = (price: number) =>
      chartTop + chartH - ((price - priceMin) / priceRange) * chartH;

    const candleW = chartW / visible.length;
    const bodyW = Math.max(1, candleW * 0.6);
    const toX = (i: number) => PAD_LEFT + i * candleW + candleW / 2;

    // Grid lines + price labels (5 levels)
    const gridLevels = 6;
    for (let i = 0; i <= gridLevels; i++) {
      const price = priceMin + (priceRange * i) / gridLevels;
      const y = toY(price);

      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, y);
      ctx.lineTo(W - PAD_RIGHT, y);
      ctx.stroke();

      ctx.fillStyle = "#808D99";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        price >= 1000
          ? price.toLocaleString(undefined, { maximumFractionDigits: 0 })
          : price.toFixed(2),
        PAD_LEFT - 6,
        y + 4
      );
    }

    // Time labels (every ~20 candles)
    const labelStep = Math.max(1, Math.floor(visible.length / 6));
    ctx.fillStyle = "#808D99";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    visible.forEach((c, i) => {
      if (i % labelStep === 0) {
        const d = new Date(c.time);
        const label = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
        ctx.fillText(label, toX(i), H - PAD_BOTTOM + 14);
      }
    });

    // Pattern annotations
    if (showPatterns && patterns.length > 0) {
      patterns.forEach((p) => {
        const lsI = p.leftShoulderIndex - startIdx;
        const hI = p.headIndex - startIdx;
        const rsI = p.rightShoulderIndex - startIdx;
        if (lsI < 0 || rsI >= visible.length) return;

        const lsX = toX(lsI), lsY = toY(visible[lsI]?.high ?? 0);
        const hX = toX(hI), hY = toY(visible[hI]?.high ?? 0);
        const rsX = toX(rsI), rsY = toY(visible[rsI]?.high ?? 0);
        const neckY = toY(p.neckline);

        ctx.strokeStyle = "rgba(210,249,0,0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(lsX, lsY); ctx.lineTo(hX, hY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hX, hY); ctx.lineTo(rsX, rsY); ctx.stroke();

        ctx.strokeStyle = "rgba(239,68,68,0.5)";
        ctx.beginPath(); ctx.moveTo(lsX - 10, neckY); ctx.lineTo(rsX + 10, neckY); ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#808D99";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("LS", lsX, lsY - 8);
        ctx.fillText("Head", hX, hY - 8);
        ctx.fillText("RS", rsX, rsY - 8);
      });
    }

    // Candlesticks
    visible.forEach((candle, i) => {
      const x = toX(i);
      const openY = toY(candle.open);
      const closeY = toY(candle.close);
      const highY = toY(candle.high);
      const lowY = toY(candle.low);
      const isGreen = candle.close >= candle.open;
      const color = isGreen ? "#00E676" : "#FF5252";

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(1, Math.abs(closeY - openY));
      ctx.fillStyle = color;
      ctx.fillRect(x - bodyW / 2, bodyTop, bodyW, bodyH);
    });

    // Volume bars
    if (showVolume) {
      const volTop = chartBottom + VOLUME_GAP;
      const volBottom = H - PAD_BOTTOM;
      const volH = volBottom - volTop;
      const maxVol = Math.max(...visible.map(d => d.volume)) || 1;

      visible.forEach((candle, i) => {
        const x = toX(i);
        const isGreen = candle.close >= candle.open;
        const barH = (candle.volume / maxVol) * volH;
        ctx.fillStyle = isGreen ? "rgba(0,230,118,0.35)" : "rgba(255,82,82,0.35)";
        ctx.fillRect(x - bodyW / 2, volBottom - barH, bodyW, barH);
      });

      // Volume separator line
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, volTop);
      ctx.lineTo(W - PAD_RIGHT, volTop);
      ctx.stroke();
    }

    // Crosshair
    if (hoveredCandle) {
      const idx = visible.indexOf(hoveredCandle);
      if (idx >= 0) {
        const x = toX(idx);
        const y = toY(hoveredCandle.close);

        ctx.strokeStyle = "rgba(210,249,0,0.4)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(x, chartTop); ctx.lineTo(x, chartBottom); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(PAD_LEFT, y); ctx.lineTo(W - PAD_RIGHT, y); ctx.stroke();
        ctx.setLineDash([]);

        // Price tag on Y axis
        ctx.fillStyle = "#D2F900";
        ctx.fillRect(0, y - 10, PAD_LEFT - 4, 20);
        ctx.fillStyle = "#0B1222";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(
          hoveredCandle.close >= 1000
            ? hoveredCandle.close.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : hoveredCandle.close.toFixed(2),
          PAD_LEFT - 6,
          y + 4
        );
      }
    }
  }, [data, zoom, hoveredCandle, showVolume, patterns, showPatterns]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setMousePos({ x: e.clientX, y: e.clientY });

    const PAD_LEFT = 70;
    const PAD_RIGHT = 10;
    const chartW = rect.width - PAD_LEFT - PAD_RIGHT;
    const visibleCount = Math.max(10, Math.floor(data.length / zoom));
    const startIdx = Math.max(0, data.length - visibleCount);
    const visible = data.slice(startIdx);
    const candleW = chartW / visible.length;
    const idx = Math.floor((x - PAD_LEFT) / candleW);
    setHoveredCandle(idx >= 0 && idx < visible.length ? visible[idx] : null);
  };

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
          className="p-2 rounded-lg"
          style={{ background: "rgba(11,18,34,0.85)", color: "var(--grey-dim)" }}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.min(5, +(z + 0.25).toFixed(2)))}
          className="p-2 rounded-lg"
          style={{ background: "rgba(11,18,34,0.85)", color: "var(--grey-dim)" }}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="px-3 py-1.5 rounded-lg text-xs font-mono-data" style={{ background: "rgba(11,18,34,0.85)", color: "var(--lime-primary)" }}>
          {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCandle(null)}
        style={{ width: "100%", height: `${height}px`, cursor: "crosshair", display: "block" }}
        className="rounded-lg"
      />

      {/* Tooltip */}
      {hoveredCandle && (
        <div
          className="fixed z-50 card-surface p-3 shadow-xl pointer-events-none"
          style={{ left: mousePos.x + 16, top: mousePos.y + 16, minWidth: 200 }}
        >
          <div className="text-xs mb-2" style={{ color: "var(--grey-dim)" }}>
            {new Date(hoveredCandle.time).toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "Open", val: hoveredCandle.open, color: "white" },
              { label: "High", val: hoveredCandle.high, color: "#00E676" },
              { label: "Low",  val: hoveredCandle.low,  color: "#FF5252" },
              { label: "Close",val: hoveredCandle.close,color: "white" },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <span style={{ color: "var(--grey-dim)" }}>{label}:</span>
                <span className="ml-1 font-mono-data font-bold" style={{ color }}>
                  ${val >= 1000 ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : val.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 text-xs" style={{ borderTop: "1px solid var(--navy-highlight)" }}>
            <span style={{ color: "var(--grey-dim)" }}>Volume:</span>
            <span className="ml-2 font-mono-data text-white">
              {hoveredCandle.volume >= 1e6
                ? `${(hoveredCandle.volume / 1e6).toFixed(2)}M`
                : hoveredCandle.volume >= 1e3
                ? `${(hoveredCandle.volume / 1e3).toFixed(2)}K`
                : hoveredCandle.volume.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {hoveredCandle.close >= hoveredCandle.open ? (
              <>
                <TrendingUp className="w-3 h-3" style={{ color: "#00E676" }} />
                <span className="text-xs font-medium" style={{ color: "#00E676" }}>
                  +{((hoveredCandle.close - hoveredCandle.open) / hoveredCandle.open * 100).toFixed(2)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3" style={{ color: "#FF5252" }} />
                <span className="text-xs font-medium" style={{ color: "#FF5252" }}>
                  {((hoveredCandle.close - hoveredCandle.open) / hoveredCandle.open * 100).toFixed(2)}%
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Pattern info */}
      {showPatterns && patterns.length > 0 && (
        <div className="mt-4 p-4 rounded-lg" style={{ background: "rgba(210,249,0,0.05)", border: "1px solid rgba(210,249,0,0.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
            <span className="text-sm font-semibold text-white">Pattern Detected</span>
          </div>
          {patterns.map((p, i) => (
            <div key={i} className="text-xs" style={{ color: "var(--grey-dim)" }}>
              <strong className="text-white">Head & Shoulders:</strong> Bearish reversal pattern. Neckline at ${p.neckline.toFixed(2)}.
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
