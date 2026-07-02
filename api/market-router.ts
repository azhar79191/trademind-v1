import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { marketData, newsArticles } from "@db/schema";

const BINANCE_API = "https://api.binance.com/api/v3";

const TRACKED_PAIRS = [
  { pair: "BTC/USDT", symbol: "BTCUSDT" },
  { pair: "ETH/USDT", symbol: "ETHUSDT" },
  { pair: "SOL/USDT", symbol: "SOLUSDT" },
  { pair: "BNB/USDT", symbol: "BNBUSDT" },
  { pair: "XRP/USDT", symbol: "XRPUSDT" },
  { pair: "DOGE/USDT", symbol: "DOGEUSDT" },
  { pair: "ADA/USDT", symbol: "ADAUSDT" },
  { pair: "AVAX/USDT", symbol: "AVAXUSDT" },
  { pair: "LINK/USDT", symbol: "LINKUSDT" },
  { pair: "DOT/USDT", symbol: "DOTUSDT" },
  { pair: "MATIC/USDT", symbol: "MATICUSDT" },
  { pair: "UNI/USDT", symbol: "UNIUSDT" },
];

function formatVolume(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  return v.toFixed(0);
}

async function fetchLiveTickers() {
  try {
    const symbols = JSON.stringify(TRACKED_PAIRS.map((p) => p.symbol));
    const res = await fetch(`${BINANCE_API}/ticker/24hr?symbols=${encodeURIComponent(symbols)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("Binance error");
    const data: any[] = await res.json();
    return data.map((d) => {
      const meta = TRACKED_PAIRS.find((p) => p.symbol === d.symbol);
      const change = parseFloat(d.priceChangePercent);
      return {
        pair: meta?.pair ?? d.symbol,
        price: parseFloat(d.lastPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 }),
        change24h: (change >= 0 ? "+" : "") + change.toFixed(2) + "%",
        volume24h: formatVolume(parseFloat(d.quoteVolume)),
        high: parseFloat(d.highPrice).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        low: parseFloat(d.lowPrice).toLocaleString("en-US", { minimumFractionDigits: 2 }),
      };
    });
  } catch {
    return null;
  }
}

async function fetchLiveOrderBook(symbol: string, depth: number) {
  try {
    const res = await fetch(`${BINANCE_API}/depth?symbol=${symbol}&limit=${depth}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json() as { bids: string[][]; asks: string[][] };
    const bids = data.bids.map(([price, qty]) => ({
      price, quantity: qty,
      total: (parseFloat(price) * parseFloat(qty)).toFixed(2),
    }));
    const asks = data.asks.map(([price, qty]) => ({
      price, quantity: qty,
      total: (parseFloat(price) * parseFloat(qty)).toFixed(2),
    }));
    const spread = asks[0] && bids[0]
      ? (parseFloat(asks[0].price) - parseFloat(bids[0].price)).toFixed(2)
      : "0";
    return { bids, asks, spread };
  } catch {
    return null;
  }
}

async function fetchFearGreed() {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const entry = data.data?.[0];
    return { value: parseInt(entry?.value ?? "72"), label: entry?.value_classification ?? "Greed" };
  } catch {
    return { value: 72, label: "Greed" };
  }
}

function generateSimulatedCandles(pair: string, timeframe: string, limit: number) {
  const hash = pair.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const basePrice = pair.includes("BTC") ? 108000 : pair.includes("ETH") ? 4100 : 100 + (hash * 50);
  const candles = [];
  let currentPrice = basePrice;
  const now = new Date();
  const intervalMs = timeframe === "1m" ? 60000 : timeframe === "5m" ? 300000 :
    timeframe === "15m" ? 900000 : timeframe === "1h" ? 3600000 :
    timeframe === "4h" ? 14400000 : timeframe === "1d" ? 86400000 : 3600000;

  for (let i = limit; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    const volatility = basePrice * 0.002;
    const open = currentPrice;
    const close = currentPrice + Math.sin(i * 0.1) * volatility + (Math.random() - 0.5) * volatility * 2;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = 100 + Math.random() * 900;
    candles.push({
      id: i, exchange: "binance", tradingPair: pair, timeframe,
      open: open.toFixed(2), high: high.toFixed(2), low: low.toFixed(2),
      close: close.toFixed(2), volume: volume.toFixed(4),
      quoteVolume: (volume * close).toFixed(2),
      trades: Math.floor(1000 + Math.random() * 5000), timestamp,
    });
    currentPrice = close;
  }
  return candles;
}

const STATIC_TICKERS = [
  { pair: "BTC/USDT", price: "108,250.00", change24h: "+2.34%", volume24h: "32.4B", high: "109,800.00", low: "105,200.00" },
  { pair: "ETH/USDT", price: "4,125.50", change24h: "+1.87%", volume24h: "18.2B", high: "4,200.00", low: "3,980.00" },
  { pair: "SOL/USDT", price: "148.32", change24h: "+12.40%", volume24h: "4.8B", high: "152.00", low: "131.50" },
  { pair: "BNB/USDT", price: "712.45", change24h: "+0.56%", volume24h: "1.9B", high: "720.00", low: "698.00" },
  { pair: "XRP/USDT", price: "2.45", change24h: "-1.50%", volume24h: "3.1B", high: "2.52", low: "2.38" },
  { pair: "DOGE/USDT", price: "0.168", change24h: "-3.20%", volume24h: "2.4B", high: "0.175", low: "0.162" },
  { pair: "ADA/USDT", price: "1.12", change24h: "+0.89%", volume24h: "890M", high: "1.15", low: "1.09" },
  { pair: "AVAX/USDT", price: "42.18", change24h: "+8.70%", volume24h: "1.2B", high: "44.00", low: "38.50" },
  { pair: "LINK/USDT", price: "18.95", change24h: "+6.20%", volume24h: "780M", high: "19.50", low: "17.80" },
  { pair: "DOT/USDT", price: "8.74", change24h: "+5.10%", volume24h: "450M", high: "9.10", low: "8.25" },
  { pair: "MATIC/USDT", price: "0.58", change24h: "+3.40%", volume24h: "320M", high: "0.60", low: "0.55" },
  { pair: "UNI/USDT", price: "9.85", change24h: "+2.10%", volume24h: "280M", high: "10.20", low: "9.50" },
];

export const marketRouter = createRouter({
  getCandles: publicQuery
    .input(z.object({
      pair: z.string(),
      exchange: z.string().optional().default("binance"),
      timeframe: z.string().optional().default("1h"),
      limit: z.number().min(1).max(500).optional().default(100),
    }))
    .query(async ({ input }) => {
      try {
        const symbol = input.pair.replace("/", "").toUpperCase();
        const res = await fetch(
          `${BINANCE_API}/klines?symbol=${symbol}&interval=${input.timeframe}&limit=${input.limit}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (res.ok) {
          const raw: any[][] = await res.json();
          return raw.map((k, i) => ({
            id: i, exchange: "binance", tradingPair: input.pair, timeframe: input.timeframe,
            open: k[1], high: k[2], low: k[3], close: k[4], volume: k[5],
            quoteVolume: k[7], trades: k[8], timestamp: new Date(k[0]),
          }));
        }
      } catch { /* fall through */ }

      const db = getDb();
      const result = await db.select().from(marketData)
        .where(and(eq(marketData.tradingPair, input.pair), eq(marketData.timeframe, input.timeframe)))
        .orderBy(desc(marketData.timestamp)).limit(input.limit);
      if (result.length > 0) return result.reverse();
      return generateSimulatedCandles(input.pair, input.timeframe, input.limit);
    }),

  getTickers: publicQuery
    .input(z.object({ exchange: z.string().optional() }).optional())
    .query(async () => (await fetchLiveTickers()) ?? STATIC_TICKERS),

  getTicker: publicQuery
    .input(z.object({ pair: z.string() }))
    .query(async ({ input }) => {
      const tickers = (await fetchLiveTickers()) ?? STATIC_TICKERS;
      return tickers.find((t) => t.pair === input.pair.toUpperCase()) ?? null;
    }),

  getOrderBook: publicQuery
    .input(z.object({
      pair: z.string(),
      depth: z.number().min(1).max(100).optional().default(20),
    }))
    .query(async ({ input }) => {
      const symbol = input.pair.replace("/", "").toUpperCase();
      const live = await fetchLiveOrderBook(symbol, input.depth ?? 20);
      if (live) return live;

      const hash = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const basePrice = symbol.startsWith("BTC") ? 108250 : symbol.startsWith("ETH") ? 4125 : 100 + (hash % 1000);
      const bids: Array<{ price: string; quantity: string; total: string }> = [];
      const asks: Array<{ price: string; quantity: string; total: string }> = [];
      for (let i = 0; i < (input.depth ?? 20); i++) {
        const bp = (basePrice * (1 - i * 0.0001 * (1 + Math.random() * 0.5))).toFixed(2);
        const ap = (basePrice * (1 + i * 0.0001 * (1 + Math.random() * 0.5))).toFixed(2);
        const bq = (0.1 + Math.random() * 5).toFixed(4);
        const aq = (0.1 + Math.random() * 5).toFixed(4);
        bids.push({ price: bp, quantity: bq, total: (parseFloat(bp) * parseFloat(bq)).toFixed(2) });
        asks.push({ price: ap, quantity: aq, total: (parseFloat(ap) * parseFloat(aq)).toFixed(2) });
      }
      return { bids, asks, spread: (basePrice * 0.0002).toFixed(2) };
    }),

  getNews: publicQuery
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().min(1).max(50).optional().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const where = input?.category ? eq(newsArticles.category, input.category) : undefined;
      const result = await db.select().from(newsArticles)
        .where(where).orderBy(desc(newsArticles.publishedAt)).limit(input?.limit ?? 20);
      if (result.length > 0) return result;
      return [
        { id: 1, title: "Bitcoin ETFs See Record $2.4B Inflows as Institutions Accumulate", summary: "Institutional investors continue to pour capital into Bitcoin ETFs, setting a new daily inflow record.", source: "CoinDesk", category: "institutional", sentiment: "positive" as const, sentimentScore: "0.85", relatedAssets: ["BTC"], publishedAt: new Date(Date.now() - 3600000), createdAt: new Date(), url: "https://www.coindesk.com/" },
        { id: 2, title: "Solana Network Processes 65M Daily Transactions, New All-Time High", summary: "Solana's throughput continues to impress, hitting a new daily transaction record as DeFi and NFT activity surges.", source: "The Block", category: "technology", sentiment: "positive" as const, sentimentScore: "0.78", relatedAssets: ["SOL"], publishedAt: new Date(Date.now() - 7200000), createdAt: new Date(), url: "https://www.theblock.co/" },
        { id: 3, title: "Federal Reserve Signals Potential Rate Cut in Q2 2025", summary: "Fed officials hint at possible monetary policy easing, which could provide tailwinds for risk assets.", source: "Reuters", category: "macro", sentiment: "positive" as const, sentimentScore: "0.72", relatedAssets: ["BTC", "ETH"], publishedAt: new Date(Date.now() - 10800000), createdAt: new Date(), url: "https://www.reuters.com/" },
        { id: 4, title: "Major DeFi Protocol Announces V4 Upgrade with Cross-Chain Support", summary: "A leading DeFi protocol reveals plans for a major upgrade with seamless cross-chain functionality.", source: "Decrypt", category: "defi", sentiment: "positive" as const, sentimentScore: "0.68", relatedAssets: ["ETH"], publishedAt: new Date(Date.now() - 14400000), createdAt: new Date(), url: "https://decrypt.co/" },
        { id: 5, title: "Ethereum Layer 2 Solutions See 340% TVL Growth This Quarter", summary: "Layer 2 scaling solutions on Ethereum have seen massive growth in total value locked.", source: "CryptoSlate", category: "defi", sentiment: "positive" as const, sentimentScore: "0.80", relatedAssets: ["ETH"], publishedAt: new Date(Date.now() - 18000000), createdAt: new Date(), url: "https://cryptoslate.com/" },
        { id: 6, title: "Regulatory Concerns Rise as SEC Expands Crypto Enforcement Actions", summary: "The SEC has announced a new round of enforcement actions targeting major crypto platforms.", source: "Bloomberg", category: "regulation", sentiment: "negative" as const, sentimentScore: "-0.45", relatedAssets: ["BTC", "ETH"], publishedAt: new Date(Date.now() - 21600000), createdAt: new Date(), url: "https://www.bloomberg.com/" },
        { id: 7, title: "Binance Launches New AI-Powered Trading Assistant Feature", summary: "The world's largest crypto exchange rolls out a new AI assistant to help traders analyze markets.", source: "Cointelegraph", category: "exchange", sentiment: "positive" as const, sentimentScore: "0.60", relatedAssets: ["BNB"], publishedAt: new Date(Date.now() - 25200000), createdAt: new Date(), url: "https://cointelegraph.com/" },
        { id: 8, title: "Crypto Market Volatility Index Reaches Monthly Low", summary: "Market volatility has dropped significantly this week, signaling a period of consolidation.", source: "CoinDesk", category: "market", sentiment: "neutral" as const, sentimentScore: "0.10", relatedAssets: ["BTC"], publishedAt: new Date(Date.now() - 28800000), createdAt: new Date(), url: "https://www.coindesk.com/" },
      ];
    }),
});
