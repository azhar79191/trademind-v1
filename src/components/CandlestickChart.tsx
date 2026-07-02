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
  coin,
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

  // Calculate price range
  const priceRange = data.length > 0 ? {
    min: Math.min(...data.map(d => d.low)),
    max: Math.max(...data.map(d => d.high)),
  } : { min: 0, max: 100 };

  const volumeRange = data.length > 0 ? {
    max: Math.max(...data.map(d => d.volume)),
  } : { max: 1000000 };

  // Detect chart patterns (simplified head and shoulders detection)
  useEffect(() => {
    if (data.length < 20 || !showPatterns) return;

    const detectedPatterns: any[] = [];
    
    // Simple head and shoulders detection
    for (let i = 10; i < data.length - 10; i++) {
      const leftShoulder = data[i - 10];
      const head = data[i];
      const rightShoulder = data[i + 10];
      
      // Check if head is higher than shoulders
      if (
        head.high > leftShoulder.high &&
        head.high > rightShoulder.high &&
        Math.abs(leftShoulder.high - rightShoulder.high) < leftShoulder.high * 0.05 // shoulders similar height
      ) {
        detectedPatterns.push({
          type: "head-and-shoulders",
          leftShoulderIndex: i - 10,
          headIndex: i,
          rightShoulderIndex: i + 10,
          neckline: (leftShoulder.low + rightShoulder.low) / 2,
        });
      }
    }

    setPatterns(detectedPatterns);
  }, [data, showPatterns]);

  // Draw the chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = showVolume ? height * 0.7 : height;
    const volumeHeight = showVolume ? height * 0.25 : 0;
    const padding = 50;

    // Clear canvas
    ctx.fillStyle = "#0B1222";
    ctx.fillRect(0, 0, width, height);

    // Calculate dimensions
    const chartWidth = width - padding * 2;
    const candleWidth = (chartWidth / data.length) * zoom;
    const candleSpacing = candleWidth * 0.2;
    const actualCandleWidth = candleWidth - candleSpacing;

    // Price scale
    const priceScale = (chartHeight - padding * 2) / (priceRange.max - priceRange.min);
    const volumeScale = volumeHeight / volumeRange.max;

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = padding + (chartHeight - padding * 2) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Price labels
      const price = priceRange.max - (priceRange.max - priceRange.min) * (i / 4);
      ctx.fillStyle = "#808D99";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 4);
    }

    // Draw pattern annotations
    if (showPatterns && patterns.length > 0) {
      patterns.forEach((pattern) => {
        if (pattern.type === "head-and-shoulders") {
          const leftShoulderX = padding + pattern.leftShoulderIndex * candleWidth + candleWidth / 2;
          const headX = padding + pattern.headIndex * candleWidth + candleWidth / 2;
          const rightShoulderX = padding + pattern.rightShoulderIndex * candleWidth + candleWidth / 2;
          
          const leftShoulderY = padding + (priceRange.max - data[pattern.leftShoulderIndex].high) * priceScale;
          const headY = padding + (priceRange.max - data[pattern.headIndex].high) * priceScale;
          const rightShoulderY = padding + (priceRange.max - data[pattern.rightShoulderIndex].high) * priceScale;
          const necklineY = padding + (priceRange.max - pattern.neckline) * priceScale;

          // Draw pattern lines
          ctx.strokeStyle = "rgba(210, 249, 0, 0.5)";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          // Left shoulder to head
          ctx.beginPath();
          ctx.moveTo(leftShoulderX, leftShoulderY);
          ctx.lineTo(headX, headY);
          ctx.stroke();
          
          // Head to right shoulder
          ctx.beginPath();
          ctx.moveTo(headX, headY);
          ctx.lineTo(rightShoulderX, rightShoulderY);
          ctx.stroke();

          // Neckline
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
          ctx.beginPath();
          ctx.moveTo(leftShoulderX - 20, necklineY);
          ctx.lineTo(rightShoulderX + 20, necklineY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Labels
          ctx.fillStyle = "#808D99";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Left Shoulder", leftShoulderX, leftShoulderY - 10);
          ctx.fillText("Head", headX, headY - 10);
          ctx.fillText("Right Shoulder", rightShoulderX, rightShoulderY - 10);
          
          ctx.fillStyle = "#EF4444";
          ctx.fillText("Neckline", (leftShoulderX + rightShoulderX) / 2, necklineY + 15);
        }
      });
    }

    // Draw candlesticks
    data.forEach((candle, index) => {
      const x = padding + index * candleWidth + candleSpacing / 2;
      const openY = padding + (priceRange.max - candle.open) * priceScale;
      const closeY = padding + (priceRange.max - candle.close) * priceScale;
      const highY = padding + (priceRange.max - candle.high) * priceScale;
      const lowY = padding + (priceRange.max - candle.low) * priceScale;

      const isGreen = candle.close > candle.open;
      const color = isGreen ? "#00E676" : "#FF5252";

      // Draw wick (high-low line)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + actualCandleWidth / 2, highY);
      ctx.lineTo(x + actualCandleWidth / 2, lowY);
      ctx.stroke();

      // Draw body (open-close rectangle)
      ctx.fillStyle = color;
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x, bodyY, actualCandleWidth, Math.max(bodyHeight, 1));

      // Draw volume bars
      if (showVolume) {
        const volumeY = chartHeight + 10;
        const volumeBarHeight = candle.volume * volumeScale;
        ctx.fillStyle = isGreen ? "rgba(0, 230, 118, 0.3)" : "rgba(255, 82, 82, 0.3)";
        ctx.fillRect(x, volumeY + volumeHeight - volumeBarHeight, actualCandleWidth, volumeBarHeight);
      }
    });

    // Draw crosshair on hover
    if (hoveredCandle) {
      const index = data.indexOf(hoveredCandle);
      const x = padding + index * candleWidth + candleWidth / 2;
      const priceY = padding + (priceRange.max - hoveredCandle.close) * priceScale;

      // Vertical line
      ctx.strokeStyle = "rgba(210, 249, 0, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padding, priceY);
      ctx.lineTo(width - padding, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label
      ctx.fillStyle = "#D2F900";
      ctx.fillRect(width - padding - 70, priceY - 12, 65, 24);
      ctx.fillStyle = "#0B1222";
      ctx.font = "12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`$${hoveredCandle.close.toFixed(2)}`, width - padding - 65, priceY + 4);
    }

  }, [data, zoom, hoveredCandle, showVolume, patterns, showPatterns]);

  // Handle mouse move for tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    const padding = 50;
    const chartWidth = rect.width - padding * 2;
    const candleWidth = (chartWidth / data.length) * zoom;
    
    const index = Math.floor((x - padding) / candleWidth);
    if (index >= 0 && index < data.length) {
      setHoveredCandle(data[index]);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
  };

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="p-2 rounded-lg transition-colors"
          style={{ background: "rgba(11, 18, 34, 0.8)", color: "var(--grey-dim)" }}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="p-2 rounded-lg transition-colors"
          style={{ background: "rgba(11, 18, 34, 0.8)", color: "var(--grey-dim)" }}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="px-3 py-1.5 rounded-lg text-xs font-mono-data" style={{ background: "rgba(11, 18, 34, 0.8)", color: "var(--lime-primary)" }}>
          {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: "100%", height: `${height}px`, cursor: "crosshair" }}
        className="rounded-lg"
      />

      {/* Tooltip */}
      {hoveredCandle && (
        <div
          className="fixed z-50 card-surface p-3 shadow-xl pointer-events-none"
          style={{
            left: mousePos.x + 15,
            top: mousePos.y + 15,
            minWidth: "200px",
          }}
        >
          <div className="text-xs mb-2" style={{ color: "var(--grey-dim)" }}>
            {new Date(hoveredCandle.time).toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span style={{ color: "var(--grey-dim)" }}>Open:</span>
              <span className="ml-2 font-mono-data text-white">${hoveredCandle.open.toFixed(2)}</span>
            </div>
            <div>
              <span style={{ color: "var(--grey-dim)" }}>High:</span>
              <span className="ml-2 font-mono-data" style={{ color: "#00E676" }}>${hoveredCandle.high.toFixed(2)}</span>
            </div>
            <div>
              <span style={{ color: "var(--grey-dim)" }}>Low:</span>
              <span className="ml-2 font-mono-data" style={{ color: "#FF5252" }}>${hoveredCandle.low.toFixed(2)}</span>
            </div>
            <div>
              <span style={{ color: "var(--grey-dim)" }}>Close:</span>
              <span className="ml-2 font-mono-data text-white font-bold">${hoveredCandle.close.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 text-xs" style={{ borderTop: "1px solid var(--navy-highlight)" }}>
            <span style={{ color: "var(--grey-dim)" }}>Volume:</span>
            <span className="ml-2 font-mono-data text-white">{(hoveredCandle.volume / 1000000).toFixed(2)}M</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {hoveredCandle.close > hoveredCandle.open ? (
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

      {/* Pattern detection info */}
      {showPatterns && patterns.length > 0 && (
        <div className="mt-4 p-4 rounded-lg" style={{ background: "rgba(210, 249, 0, 0.05)", border: "1px solid rgba(210, 249, 0, 0.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
            <span className="text-sm font-semibold text-white">Pattern Detected</span>
          </div>
          {patterns.map((pattern, i) => (
            <div key={i} className="text-xs" style={{ color: "var(--grey-dim)" }}>
              <strong className="text-white">Head and Shoulders:</strong> A bearish reversal pattern has formed. 
              Price may decline towards the neckline support level at ${pattern.neckline.toFixed(2)}.
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
