import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { chatConversations, chatMessages } from "@db/schema";

// ─── AI Agent Integration ────────────────────────────────────────────
const AI_AGENT_URL = process.env.AI_AGENT_API_URL || "http://localhost:8000";

// Call AI agent for intelligent responses
async function callAIAgent(query: string, pair?: string): Promise<{ answer: string; suggestion?: string | null; [key: string]: any } | null> {
  try {
    console.log(`🤖 Calling AI Agent: ${AI_AGENT_URL}/chat/query`);
    console.log(`📝 Query: "${query.substring(0, 50)}..."`);
    
    const response = await fetch(`${AI_AGENT_URL}/chat/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, pair: pair || "BTC/USDT" }),
      signal: AbortSignal.timeout(15000),
    });

    console.log(`📡 AI Agent response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ AI Agent error response: ${errorText}`);
      throw new Error(`AI Agent returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ AI Agent response received: ${data.answer ? 'SUCCESS' : 'EMPTY'}`);
    return data;
  } catch (error) {
    console.error("❌ AI Agent call error:", error instanceof Error ? error.message : error);
    return null;
  }
}


export const chatRouter = createRouter({
  // ─── Conversations ─────────────────────────────────────────────────

  listConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(chatConversations)
      .where(eq(chatConversations.userId, ctx.user.id))
      .orderBy(desc(chatConversations.updatedAt));
  }),

  createConversation: authedMutation
    .input(z.object({ title: z.string().optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(chatConversations).values({
        userId: ctx.user.id,
        title: input?.title ?? "New Conversation",
      } as any);
      return { id: Number(result[0]?.insertId ?? 0) };
    }),

  deleteConversation: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(chatMessages).where(eq(chatMessages.conversationId, input.id));
      await db.delete(chatConversations).where(
        and(eq(chatConversations.id, input.id), eq(chatConversations.userId, ctx.user.id))
      );
      return { success: true };
    }),

  // ─── Messages ──────────────────────────────────────────────────────

  getMessages: authedQuery
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conv = await db.select().from(chatConversations).where(
        and(eq(chatConversations.id, input.conversationId), eq(chatConversations.userId, ctx.user.id))
      ).limit(1);

      if (!conv[0]) return [];

      return db.select().from(chatMessages)
        .where(eq(chatMessages.conversationId, input.conversationId))
        .orderBy(chatMessages.createdAt);
    }),

  sendMessage: authedMutation
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const conv = await db.select().from(chatConversations).where(
        and(eq(chatConversations.id, input.conversationId), eq(chatConversations.userId, ctx.user.id))
      ).limit(1);

      if (!conv[0]) throw new Error("Conversation not found");

      await db.insert(chatMessages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.content,
      });

      // Use async AI response (tries AI agent first, then fallback)
      const aiResponse = await generateAIResponseAsync(input.content);

      await db.insert(chatMessages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: aiResponse.content,
        metadata: aiResponse.metadata,
      });

      await db.update(chatConversations)
        .set({ updatedAt: new Date() })
        .where(eq(chatConversations.id, input.conversationId));

      return { success: true };
    }),

  quickAnalyze: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return await generateAIResponseAsync(input.query);
    }),
});

interface AIResponse {
  content: string;
  metadata?: Record<string, any>;
}

const TRADING_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "DOGE/USDT", "ADA/USDT"];

function extractPair(text: string): string | null {
  const pairs = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX", "LINK", "DOT"];
  for (const pair of pairs) {
    if (text.toUpperCase().includes(pair)) return pair;
  }
  return null;
}

async function fetchLiveMarketData(coin: string) {
  try {
    const symbol = `${coin}USDT`;
    const [tickerRes, klinesRes] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, { signal: AbortSignal.timeout(5000) }),
      fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=50`, { signal: AbortSignal.timeout(5000) }),
    ]);
    if (!tickerRes.ok || !klinesRes.ok) return null;
    const ticker = await tickerRes.json();
    const klines: any[][] = await klinesRes.json();
    const closes = klines.map((k: any[]) => parseFloat(k[4]));

    // RSI-14
    let rsi: number | null = null;
    if (closes.length >= 15) {
      const diffs = closes.slice(-15).map((c, i, a) => i === 0 ? 0 : c - a[i - 1]).slice(1);
      const gains = diffs.map(d => d > 0 ? d : 0);
      const losses = diffs.map(d => d < 0 ? -d : 0);
      const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
      const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
      rsi = avgLoss === 0 ? 100 : Math.round(100 - 100 / (1 + avgGain / avgLoss));
    }

    // EMA helper
    const ema = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      return data.reduce((prev, cur) => cur * k + prev * (1 - k));
    };

    const macdLine = closes.length >= 26 ? ema(closes.slice(-26), 12) - ema(closes.slice(-26), 26) : 0;
    const macdSignal = macdLine > 0 ? "Bullish" : "Bearish";
    const ema20 = closes.length >= 20 ? ema(closes.slice(-20), 20) : closes[closes.length - 1];
    const price = parseFloat(ticker.lastPrice);
    const trend = price > ema20 ? "Uptrend" : "Downtrend";

    return {
      price,
      change24h: parseFloat(ticker.priceChangePercent),
      high: parseFloat(ticker.highPrice),
      low: parseFloat(ticker.lowPrice),
      volume: parseFloat(ticker.quoteVolume),
      rsi,
      macdSignal,
      trend,
    };
  } catch {
    return null;
  }
}

async function generateMarketAnalysis(message: string): Promise<AIResponse> {
  const coin = extractPair(message) ?? "BTC";
  const data = await fetchLiveMarketData(coin);

  if (!data) return generateEducationalContent(message);

  const { price, change24h, high, low, volume, rsi, macdSignal, trend } = data;
  const changeSign = change24h >= 0 ? "+" : "";
  const volFmt = volume >= 1e9 ? (volume / 1e9).toFixed(1) + "B" : (volume / 1e6).toFixed(0) + "M";
  const rsiLabel = rsi === null ? "N/A" : rsi < 30 ? `${rsi} (Oversold)` : rsi > 70 ? `${rsi} (Overbought)` : `${rsi} (Neutral)`;
  const rsiSignal = rsi !== null && rsi < 30 ? "Buy" : rsi !== null && rsi > 70 ? "Sell" : "Neutral";
  const signal = rsi !== null && rsi < 35 ? "BUY — oversold conditions" : rsi !== null && rsi > 65 ? "SELL — overbought conditions" : "HOLD — no strong signal";

  return {
    content: `# Live Market Analysis: ${coin}/USDT\n\n## Current Price\n**$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (${changeSign}${change24h.toFixed(2)}% 24h)\n\n## 24h Stats\n| Metric | Value |\n|--------|-------|\n| High | $${high.toLocaleString("en-US", { minimumFractionDigits: 2 })} |\n| Low | $${low.toLocaleString("en-US", { minimumFractionDigits: 2 })} |\n| Volume | $${volFmt} |\n| Trend | ${trend} |\n\n## Technical Indicators\n| Indicator | Value | Signal |\n|-----------|-------|--------|\n| RSI (14) | ${rsiLabel} | ${rsiSignal} |\n| MACD | ${macdSignal} | ${macdSignal === "Bullish" ? "Buy" : "Sell"} |\n| EMA-20 Trend | ${trend} | ${trend === "Uptrend" ? "Bullish" : "Bearish"} |\n\n## Signal\n${signal}\n\n> Live data from Binance. Always do your own research before trading.`,
    metadata: { source: "live_binance", pair: `${coin}/USDT`, timestamp: new Date().toISOString() }
  };
}

function generateEducationalContent(message: string): AIResponse {
  const lowerMsg = message.toLowerCase();
  
  // Check for professional/automation queries FIRST
  const professionalKeywords = ["automate", "automation", "business", "institutional", "professional", "market making", "arbitrage", "scale", "profit"];
  const hasProfessionalKeyword = professionalKeywords.some(keyword => lowerMsg.includes(keyword));
  
  if (hasProfessionalKeyword) {
    // Return professional content even without AI Agent
    return {
      content: `
# 💼 Trading Business Automation

## 🤖 How to Automate Your Trading Business

Automating your trading business can scale your operations from $5k to $50k+ per month. Here's a professional roadmap:

### 1. Foundation Setup
**Requirements:**
- Capital: $10,000 - $50,000 minimum
- Technical Skills: Python/JavaScript programming
- Trading Experience: 1+ years consistently profitable
- Time: 3-6 months for full automation

### 2. Technology Stack
**Trading Infrastructure:**
- **Exchange APIs:** Binance, Coinbase Pro, Kraken
- **Programming:** Python (preferred) or JavaScript/Node.js
- **Libraries:** CCXT (multi-exchange), Pandas (data analysis)
- **Database:** PostgreSQL or MySQL for storing data
- **Server:** AWS, Google Cloud, or VPS for 24/7 operation

### 3. Automation Strategies

**A. Market Making** ($10k-$50k/month)
- Provide liquidity on exchanges
- Profit from bid-ask spreads
- Capital: $50k-$500k
- Risk: Medium

**B. Statistical Arbitrage** (15-25% annual)
- Exploit price differences across exchanges
- High-frequency execution
- Capital: $20k-$100k
- Risk: Low-Medium

**C. Momentum Following** (20-40% annual)
- Automated trend detection
- Entry/exit signals based on indicators
- Capital: $10k-$50k
- Risk: Medium-High

**D. Grid Trading** (10-15% annual)
- Buy low, sell high in range-bound markets
- Fully automated
- Capital: $5k-$25k
- Risk: Medium

### 4. Revenue Models

**Model 1: Signal Service** ($5k-$20k/month)
- Build profitable strategies
- Sell signals to subscribers
- Low capital requirement
- Revenue: Subscription fees

**Model 2: Managed Accounts** ($10k-$50k/month)
- Trade client accounts
- Charge performance fees (20-30%)
- Requires track record
- Revenue: % of profits

**Model 3: Proprietary Trading** ($20k-$100k+/month)
- Trade your own capital
- Keep 100% of profits
- Highest capital requirement
- Revenue: Trading profits

### 5. Scaling Path

**Stage 1: Manual Trading** ($5k-$10k/month)
- Develop and test strategies
- Build track record
- Learn market behavior

**Stage 2: Semi-Automated** ($10k-$25k/month)
- Automate entry/exit signals
- Manual position management
- Reduce screen time 50%

**Stage 3: Fully Automated** ($25k-$50k/month)
- Complete automation
- 24/7 operation
- Monitor only 1-2 hours/day

**Stage 4: Multi-Strategy** ($50k-$100k+/month)
- Multiple strategies running
- Diversified risk
- Multiple exchanges
- Team expansion

### 6. Risk Management

**Essential Rules:**
- **Position Sizing:** Never risk more than 1-2% per trade
- **Daily Loss Limit:** Stop if lose 5% in a day
- **Max Drawdown:** Reduce position size if down 10%
- **Diversification:** Multiple strategies, multiple markets
- **Kill Switch:** Automatic shutdown on abnormal activity

### 7. Common Mistakes to Avoid

❌ **Over-optimization:** Strategy works on historical data but fails live
❌ **Under-capitalization:** Not enough capital for drawdowns
❌ **No backup plan:** Single point of failure
❌ **Ignoring costs:** Fees and slippage eat profits
❌ **Emotional interference:** Manually overriding the system

### 8. Success Timeline

**Month 1-3:** Strategy development and backtesting
**Month 4-6:** Paper trading and refinement
**Month 7-9:** Small live capital testing
**Month 10-12:** Scaling to full capital
**Year 2:** Expansion and optimization

### 9. Professional Tools

**Backtesting:**
- Backtrader (Python)
- TradingView Pine Script
- QuantConnect

**Live Trading:**
- CCXT Library
- Custom Python bots
- Commercial platforms (3Commas, Cryptohopper)

**Monitoring:**
- Grafana dashboards
- Telegram alerts
- Email notifications
- SMS for critical errors

### 10. Legal & Compliance

- Register business entity (LLC recommended)
- Separate business and personal finances
- Track all trades for taxes
- Consider trading regulations in your country
- Insurance for larger operations

## 💰 Realistic Profit Expectations

**Year 1:** $5k-$15k/month (learning phase)
**Year 2:** $15k-$40k/month (scaling phase)
**Year 3+:** $40k-$100k+/month (established business)

**Success Rate:** Only 10-15% of traders successfully automate and scale

## 🎯 Your Action Plan

1. **Learn programming** (Python recommended)
2. **Develop 1-2 profitable strategies** manually first
3. **Backtest thoroughly** (minimum 2 years of data)
4. **Paper trade** for 3 months
5. **Start with small capital** ($1k-$5k)
6. **Scale gradually** as you prove profitability
7. **Document everything** for continuous improvement

## ⚠️ Important Disclaimer

Automated trading is NOT passive income. It requires:
- Constant monitoring
- Regular optimization
- Risk management
- Technical maintenance
- Market adaptation

**Success is not guaranteed. Most automated traders fail due to:**
- Poor strategy development
- Insufficient capital
- Lack of risk management
- Over-leverage
- Emotional decision making

---

**Ready to automate?** Start with education, build solid strategies, and scale systematically! 🚀

*This is professional institutional-grade knowledge. Start small, learn continuously, and scale responsibly.*
      `.trim()
    };
  }
  
  const educationalTopics: Record<string, string> = {
    "rsi": `
# RSI (Relative Strength Index) Explained

## What is RSI?
RSI is a momentum oscillator that measures the speed and magnitude of recent price changes. It oscillates between 0 and 100.

## Key Levels
| RSI Range | Condition | Signal |
|-----------|-----------|--------|
| 0-30 | Oversold | Potential Buy |
| 30-70 | Neutral | Wait and see |
| 70-100 | Overbought | Potential Sell |
| 50 | Midpoint | Support/Resistance |

## How to Trade with RSI
1. **Divergences**: Price makes new high but RSI doesn't → Bearish Divergence
2. **Midline Cross**: RSI crosses above 50 → Bullish, below 50 → Bearish
3. **Failure Swings**: RSI fails to exceed prior high/low → Early reversal
4. **Overbought/Oversold**: Not always signals, combine with other tools!

## Pro Tips
- Combine RSI with volume analysis for stronger confirmation
- Use 14-period RSI as standard
- RSI can stay overbought/oversold in strong trends!
- Use 9-period RSI for more sensitivity, 21-period for smoother signals!
    `.trim(),
    "macd": `
# MACD (Moving Average Convergence Divergence) Explained

## Components
1. **MACD Line**: 12 EMA - 26 EMA (Fast)
2. **Signal Line**: 9 EMA of MACD Line (Slow)
3. **Histogram**: MACD Line - Signal Line

## Trading Signals
| Event | Action |
|-------|--------|
| MACD crosses above Signal Line | Buy (Bullish Crossover) |
| MACD crosses below Signal Line | Sell (Bearish Crossover) |
| MACD crosses above Zero | Strong Bullish Momentum |
| MACD crosses below Zero | Strong Bearish Momentum |

## Best Practices
- Works best in trending markets
- Avoid in choppy/sideways conditions
- Check higher timeframe first for trend direction
- Combine with RSI or Volume!
    `.trim(),
    "portfolio": `
# Portfolio Performance & Management

## Best Practices
1. **Risk Management**: Never risk >1-2% per trade
2. **Diversification**: Spread risk across uncorrelated assets
3. **Stop Losses**: Always define your exit BEFORE entering
4. **Journaling**: Log every trade with lessons learned!

## Key Metrics to Track
- Total ROI / P&L
- Win Rate %
- Profit Factor (Gross Profits / Gross Losses)
- Sharpe Ratio (Risk-Adjusted Return)
- Max Drawdown %
- Average Win / Average Loss
    `.trim(),
    "stop loss": `
# Stop Loss Explained

## What is a Stop Loss?
A stop loss is an order to buy or sell a security when it reaches a certain price, designed to limit an investor's loss on a position.

## Types of Stop Losses
1. **Fixed Stop Loss**: Set at a specific price level
2. **Trailing Stop Loss**: Adjusts as the price moves (locks in profits)
3. **Volatility-Based Stop Loss**: Uses ATR (Average True Range) to set distance

## How to Set a Stop Loss
- **Technical Levels**: Below support or above resistance
- **Percentage**: X% below/above entry price (1-3% recommended)
- **ATR**: 1-2x ATR from entry price
    `.trim(),
    "trailing stop": `
# Trailing Stop Loss Explained

## What is a Trailing Stop?
A trailing stop moves as the price moves, locking in profits while still allowing for upside.

## How It Works
- For a long position: Stop price trails below the current price by a set amount
- For a short position: Stop price trails above the current price
- When price reverses by the trailing amount, the stop is triggered

## Tips
- Set the trailing distance appropriately (too tight and you get stopped out too early, too wide and you give back too much profit)
- Use volatility (ATR) to adjust the trailing distance
    `.trim(),
    "take profit": `
# Take Profit Explained

## What is a Take Profit?
A take profit is an order to close a position at a specific price to lock in profits.

## How to Set Take Profit
1. **Risk-Reward Ratio**: Aim for at least 1:1.5 or 1:2 (for every dollar risked, you aim to make $1.50 or $2)
2. **Technical Levels**: At resistance (for longs) or support (for shorts)
3. **Fibonacci Levels**: Common levels like 1.272, 1.618 extensions
    `.trim(),
    "risk management": `
# Risk Management Guide

## Core Principles
1. **Never risk more than 1-2% of your trading capital per trade**
2. **Always use a stop loss**
3. **Diversify your portfolio** across different assets and asset classes
4. **Don't overleverage**
5. **Keep emotions out of trading**

## Calculating Position Size
Position Size = (Risk Amount) / (Entry Price - Stop Loss Price)

## Tips
- Calculate your position size BEFORE entering the trade
- Don't increase position size after a losing streak (avoid revenge trading)
- Don't risk more than you're willing to lose
    `.trim(),
    "leverage": `
# Leverage Explained

## What is Leverage?
Leverage is using borrowed capital to increase your position size beyond what your available capital would allow.

## Pros and Cons
- **Pros**: Amplifies potential profits
- **Cons**: Amplifies potential losses (can lose more than your initial deposit!)

## Tips for Using Leverage
- Start small (1x - 5x) until you're experienced
- Always use stop losses
- Don't overleverage
- Understand liquidation risks
    `.trim(),
    "ema": `
# Exponential Moving Average (EMA) Explained

## What is EMA?
EMA is a moving average that gives more weight to recent price data, reacting faster to price changes than simple moving averages (SMA).

## Common EMA Periods
- 9 EMA: Very fast
- 20 EMA: Short-term trend
- 50 EMA: Medium-term trend
- 100 EMA: Longer-term trend
- 200 EMA: Long-term trend, major support/resistance
    `.trim(),
    "sma": `
# Simple Moving Average (SMA) Explained

## What is SMA?
SMA calculates the average price of an asset over a specific time period, giving equal weight to each data point.

## Common SMA Periods
- 20 SMA: Short-term
- 50 SMA: Medium-term
- 100 SMA: Longer-term
- 200 SMA: Long-term, major support/resistance
    `.trim(),
    "support": `
# Support Levels Explained

## What is Support?
Support is a price level where demand is strong enough to prevent further price decline.

## How to Identify Support
1. Swing lows on chart
2. Moving averages
3. Trendlines
4. Fibonacci retracement levels
5. Previous areas of consolidation
    `.trim(),
    "resistance": `
# Resistance Levels Explained

## What is Resistance?
Resistance is a price level where selling pressure is strong enough to prevent further price increase.

## How to Identify Resistance
1. Swing highs on chart
2. Moving averages
3. Trendlines
4. Fibonacci extension levels
5. Previous areas of consolidation
    `.trim(),
    "fibonacci": `
# Fibonacci Trading Explained

## What are Fibonacci Levels?
Fibonacci retracement and extension levels are used to identify potential support, resistance, and price targets based on the Fibonacci sequence.

## Common Retracement Levels
- 23.6%
- 38.2% (key level)
- 50% (psychological level)
- 61.8% (key level)
- 78.6%

## Common Extension Levels
- 1.0
- 1.272
- 1.618 (important)
- 2.0
    `.trim(),
    "atr": `
# Average True Range (ATR) Explained

## What is ATR?
ATR measures market volatility by looking at the full range of price movement for a given period.

## How to Use ATR
1. **Set Stop Losses**: Use 1-2x ATR from entry price
2. **Position Sizing**: Adjust position size based on volatility
3. **Gauge Trend Strength**: Increasing ATR = increasing volatility/strength
    `.trim(),
    "volume": `
# Volume Analysis Explained

## What is Volume?
Volume is the number of shares/contracts traded in a given period.

## How to Use Volume
1. **Confirm Trend**: Volume should increase in the direction of the trend
2. **Spot Reversals**: Divergences between price and volume can signal reversals
3. **Confirm Breakouts**: A breakout on high volume is more likely to be sustained
    `.trim(),
    "trendline": `
# Trendlines Explained

## What is a Trendline?
A trendline is a line drawn on a chart to connect price points and show the direction of the trend.

## Types of Trendlines
- **Uptrend Line**: Connects higher lows
- **Downtrend Line**: Connects lower highs
- **Horizontal Trendline**: Connects equal highs or lows (support/resistance)

## How to Use
- Trendlines can act as support/resistance
- Break of trendline can signal potential trend change
- Draw trendlines across at least 2 points, more points = stronger
    `.trim(),
    "candlestick": `
# Candlestick Patterns

## What is a Candlestick?
A candlestick shows the open, high, low, and close for a specific time period.

## Common Bullish Patterns
- Hammer
- Bullish Engulfing
- Morning Star
- Piercing Pattern

## Common Bearish Patterns
- Hanging Man
- Bearish Engulfing
- Evening Star
- Dark Cloud Cover
    `.trim(),
    "scalping": `
# Scalping Strategy Explained

## What is Scalping?
Scalping is a trading style that focuses on making small profits on small price changes, often holding positions for seconds to minutes.

## Pros
- Many trading opportunities
- Lower risk per trade
- Quick feedback

## Cons
- High transaction costs
- Requires a lot of screen time
- Can be stressful
- Requires fast execution
    `.trim(),
    "day trading": `
# Day Trading Strategy Explained

## What is Day Trading?
Day trading is buying and selling assets within the same day, closing all positions before the market closes.

## Key Points
- No overnight risk
- Focus on intraday price movements
- Requires good market understanding and discipline
- Risk management is crucial
    `.trim(),
    "swing trading": `
# Swing Trading Strategy Explained

## What is Swing Trading?
Swing trading is holding positions for a few days to weeks to catch medium-term trends.

## Pros
- Less time commitment than day trading
- Can capture bigger moves than scalping/day trading
- Less transaction costs

## Cons
- Overnight risk
- Needs patience
    `.trim(),
    "position sizing": `
# Position Sizing Guide

## What is Position Sizing?
Position sizing is determining how many units of an asset to buy or sell.

## Calculating Position Size
Position Size = (Total Capital × Risk %) / (Entry Price - Stop Loss Price)

## Key Rules
1. Never risk more than 1-2% of your capital per trade
2. Adjust for volatility (ATR)
3. Don't oversize your positions
    `.trim(),
    "liquidation": `
# Liquidation Explained

## What is Liquidation?
Liquidation is when your position is forcefully closed by the exchange because your margin has dropped below the required maintenance level.

## How to Avoid Liquidation
1. Use lower leverage
2. Always use stop losses
3. Don't overleverage
4. Monitor your margin ratio
5. Maintain enough collateral
    `.trim(),
    "funding rate": `
# Funding Rate Explained

## What is Funding Rate?
Funding rate is the fee paid between traders on perpetual futures contracts to keep the contract price aligned with the spot price.

## How It Works
- **Positive funding rate**: Longs pay shorts
- **Negative funding rate**: Shorts pay longs

## How to Use
- High positive funding can signal greed (overheated market)
- High negative funding can signal fear
- Can be used as a contrarian indicator
    `.trim(),
    "margin": `
# Margin Trading Explained

## What is Margin Trading?
Margin trading is trading with borrowed funds, using your existing assets as collateral.

## Key Terms
- **Initial Margin**: The amount you need to open a position
- **Maintenance Margin**: The minimum amount you need to keep your position open
- **Margin Ratio**: Your account equity / margin used

## Risks
- Amplified losses
- Liquidation risk
- Interest costs
    `.trim()
  };
  
  for (const keyword in educationalTopics) {
    if (lowerMsg.includes(keyword)) {
      return { content: educationalTopics[keyword] };
    }
  }
  
  // Check for cryptocurrency specific questions BEFORE general "what is"
  const cryptoKeywords = ["bitcoin", "btc", "ethereum", "eth", "blockchain", "crypto", "cryptocurrency", "defi", "nft", "altcoin", "mining", "wallet", "staking"];
  const hasCryptoKeyword = cryptoKeywords.some(keyword => lowerMsg.includes(keyword));
  
  // If question is about crypto fundamentals, return detailed crypto info
  if (hasCryptoKeyword && (lowerMsg.includes("what is") || lowerMsg.includes("explain") || lowerMsg.includes("tell me about"))) {
    // Check specific crypto topics
    if (lowerMsg.includes("bitcoin") || lowerMsg.includes("btc")) {
      return {
        content: `
# Bitcoin (BTC)

## What is Bitcoin?
Bitcoin is the first and most valuable cryptocurrency, created in 2009 by an anonymous person (or group) known as Satoshi Nakamoto.

## Key Facts:
🪙 **Maximum Supply:** 21 million coins
⛏️ **Mining:** New coins created through 'mining' process using Proof of Work
💰 **Use Case:** Digital gold, store of value, peer-to-peer payment system
📈 **Market Cap:** Largest cryptocurrency by market capitalization
🔐 **Security:** Uses blockchain technology for secure, immutable transactions
⏰ **Block Time:** Approximately 10 minutes per block
🔄 **Halving:** Occurs every 4 years, reducing mining rewards by 50%

## Why People Invest:
Many investors see Bitcoin as 'digital gold' - a hedge against inflation and store of value. It's decentralized (no government control), has a limited supply (deflationary), and can be sent anywhere in the world instantly.

## How It Works:
- **Blockchain:** All transactions recorded on public ledger
- **Decentralized:** No single authority controls it
- **Peer-to-Peer:** Send directly without intermediaries
- **Transparent:** All transactions are public and verifiable

## Advantages:
✅ Limited supply - only 21 million will ever exist
✅ Decentralized - no government or bank control
✅ Secure - never been successfully hacked
✅ Portable - can transfer globally in minutes
✅ Transparent - all transactions public

## Risks to Consider:
⚠️ High volatility - price can swing 10-20% in a day
⚠️ Regulatory uncertainty
⚠️ Irreversible transactions
⚠️ Learning curve for beginners
⚠️ Environmental concerns (energy usage)

## Current Status:
Bitcoin is widely adopted by institutions, available on major exchanges, and recognized as legal tender in some countries (e.g., El Salvador).
        `.trim()
      };
    }
    
    if (lowerMsg.includes("ethereum") || lowerMsg.includes("eth")) {
      return {
        content: `
# Ethereum (ETH)

## What is Ethereum?
Ethereum is a blockchain platform that enables smart contracts and decentralized applications (dApps), created by Vitalik Buterin in 2015.

## Key Features:
💻 **Smart Contracts:** Self-executing contracts with terms directly written in code
🎨 **NFTs:** Platform for non-fungible tokens (digital art, collectibles)
🏦 **DeFi:** Powers decentralized finance applications
⚡ **Ethereum 2.0:** Upgraded to Proof of Stake in September 2022 (The Merge)
🔧 **Programmable:** Turing-complete programming language (Solidity)
💰 **Gas Fees:** Transaction fees paid in ETH

## Why It's Important:
Ethereum powers most of the crypto ecosystem including DeFi (lending, borrowing), NFTs, DAOs, and thousands of dApps. It's the foundation for Web3.

## The Merge (Ethereum 2.0):
- **Date:** September 15, 2022
- **Change:** Switched from Proof of Work to Proof of Stake
- **Impact:** 99.95% reduction in energy consumption
- **Benefits:** More sustainable, lower inflation, foundation for future scaling

## Use Cases:
- DeFi protocols (Uniswap, Aave, Compound)
- NFT marketplaces (OpenSea)
- Gaming and Metaverse
- Stablecoins (USDC, DAI)
- DAOs (Decentralized Autonomous Organizations)

## Advantages:
✅ Most active developer community
✅ Largest ecosystem of dApps
✅ First-mover advantage in smart contracts
✅ Network effects and composability
✅ Continuous innovation and upgrades

## Compared to Bitcoin:
- **Bitcoin:** Digital gold, store of value
- **Ethereum:** Programmable money, application platform

## Investment Considerations:
Ethereum is seen as the backbone of decentralized finance and Web3. Its value comes from the utility of its network and the applications built on it.
        `.trim()
      };
    }
    
    if (lowerMsg.includes("blockchain")) {
      return {
        content: `
# Blockchain Technology

## What is Blockchain?
A blockchain is a distributed, immutable ledger that records transactions across many computers. Think of it as a digital ledger that everyone can see but no one can alter.

## Key Components:
📚 **Blocks:** Groups of transactions bundled together
🔗 **Chain:** Blocks linked together in chronological order
💻 **Nodes:** Computers that maintain copies of the blockchain
🤝 **Consensus:** Agreement mechanism to validate transactions (PoW, PoS)

## How It Works:
1. **Transaction Initiated:** Someone sends crypto or data
2. **Broadcast to Network:** Transaction sent to all nodes
3. **Validation:** Nodes verify the transaction is legitimate
4. **Block Creation:** Valid transactions grouped into a block
5. **Block Added to Chain:** Block permanently added
6. **Transaction Complete:** Irreversible and public

## Key Characteristics:
🔒 **Immutable:** Once recorded, cannot be changed
🌐 **Decentralized:** No single point of control
👁️ **Transparent:** All transactions are visible
🔐 **Secure:** Protected by cryptography
🤝 **Trustless:** No need to trust intermediaries

## Types of Blockchains:
- **Public:** Open to anyone (Bitcoin, Ethereum)
- **Private:** Restricted access (enterprise use)
- **Consortium:** Controlled by group of organizations

## Use Cases Beyond Crypto:
✅ Supply chain tracking
✅ Healthcare records
✅ Voting systems
✅ Digital identity
✅ Real estate transactions
✅ Intellectual property rights

## Analogy:
Imagine a notebook that everyone in a room has a copy of. When something new is written, everyone checks it's correct, then everyone updates their copy. No one can secretly erase or change what's written because everyone else has the same record.

## Why It Matters:
Blockchain enables trust in a trustless environment - you don't need banks, governments, or companies to verify transactions. The network itself provides verification.
        `.trim()
      };
    }
  }
  
  // Catch-all for general trade questions - return structured suggestions
  if (lowerMsg.includes("how to") || lowerMsg.includes("what is") || lowerMsg.includes("explain") || lowerMsg.includes("help") || lowerMsg.includes("learn")) {
    return {
      content: "I can help you with many trading topics! Please select a question below to learn more.",
      metadata: {
        type: "suggestions",
        suggestions: [
          { question: "Explain RSI", label: "RSI", category: "📈 Indicators" },
          { question: "What is MACD?", label: "MACD", category: "📈 Indicators" },
          { question: "How to use Fibonacci?", label: "Fibonacci", category: "📈 Indicators" },
          { question: "How to manage risk?", label: "Risk Management", category: "🛡️ Risk Management" },
          { question: "What is a stop loss?", label: "Stop Loss", category: "🛡️ Risk Management" },
          { question: "What is position sizing?", label: "Position Sizing", category: "🛡️ Risk Management" },
          { question: "What is scalping?", label: "Scalping", category: "📚 Strategies" },
          { question: "Explain swing trading", label: "Swing Trading", category: "📚 Strategies" },
          { question: "What is support and resistance?", label: "Support & Resistance", category: "🔬 Technical Analysis" },
          { question: "Tell me about candlesticks", label: "Candlesticks", category: "🔬 Technical Analysis" },
        ]
      }
    };
  }
  
  return {
    content: "I apologize, but I couldn't find a specific answer to your question. 😊 Try asking something specific about trading!",
    metadata: {
      type: "suggestions",
      suggestions: [
        { question: "What is RSI?", label: "RSI", category: "Quick Questions" },
        { question: "How to manage risk?", label: "Risk Management", category: "Quick Questions" },
        { question: "What is Bitcoin?", label: "Bitcoin", category: "Quick Questions" },
        { question: "Explain swing trading", label: "Swing Trading", category: "Quick Questions" },
      ]
    }
  };
}

async function generateAIResponse(userMessage: string): Promise<AIResponse> {
  const lower = userMessage.toLowerCase();
  
  // Handle greetings first (including Islamic greetings)
  const greetings: Record<string, string> = {
    "hello": "Hi! I'm TradeMind AI, your trading assistant. How can I help you today?",
    "hi": "Hello! Ready to help you with crypto trading. What would you like to know?",
    "hey": "Hey there! I'm here to assist with your trading questions. What's on your mind?",
    "good morning": "Good morning! Let's make today a profitable trading day! What can I help with?",
    "good afternoon": "Good afternoon! How can I assist your trading today?",
    "good evening": "Good evening! Ready to analyze markets or answer questions!",
    "how are you": "I'm doing great! Busy analyzing crypto markets. How can I help you?",
    "thanks": "You're welcome! Feel free to ask anything about trading!",
    "thank you": "Happy to help! Don't hesitate to ask more questions!",
    
    // Islamic Greetings
    "assalamu alaikum": "Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?",
    "asalamualaikum": "Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?",
    "aslmualikum": "Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?",
    "aslamualikum": "Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?",
    "asalam alaikum": "Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?",
    "aslam o alikum": "Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?",
    "salam": "Wa Alaikum Assalam! 🌙 How can I help you with your trading journey today?",
    "as-salamu alaykum": "Wa Alaikum Assalam wa Rahmatullahi wa Barakatuh! 🌙 I'm here to help with your crypto trading questions.",
    "salaam": "Wa Alaikum Assalam! 🌙 How can I help you with your trading journey today?",
    "salamu alaikum": "Wa Alaikum Assalam! 🌙 Welcome to TradeMind AI. How can I assist you with your trading today?",
    
    // Urdu/Arabic variations
    "kya hal hai": "Alhamdulillah, I'm doing well! 😊 Ready to help you with crypto trading. What would you like to know?",
    "kaisa hai": "Alhamdulillah, doing great! 💪 How can I assist your trading today?",
    "kaise hain": "Alhamdulillah, everything is good! 🙏 What trading questions do you have?",
    "kaise ho": "Alhamdulillah, I'm fine! 😊 How can I help with your trading?",
  };
  
  for (const greeting in greetings) {
    if (lower.includes(greeting)) {
      return { content: greetings[greeting] };
    }
  }
  
  // Handle trading queries
  if (["buy", "sell", "should i", "analyze", "analysis", "btc", "eth", "sol", "price", "trend", "signal"].some(k => lower.includes(k))) {
    return generateMarketAnalysis(userMessage);
  }
  // unreachable sync path kept for type safety
  
  // Handle educational queries
  return generateEducationalContent(userMessage);
}

// New async version that uses AI agent when available
async function generateAIResponseAsync(userMessage: string): Promise<AIResponse> {
  console.log(`\n🎯 generateAIResponseAsync called for: "${userMessage.substring(0, 50)}..."`);
  // Always try AI agent directly — no cached availability flag
  try {
    console.log(`🚀 Attempting to call AI Agent at ${AI_AGENT_URL}...`);
    const agentData = await callAIAgent(userMessage);
      if (agentData && agentData.answer) {
        console.log(`✅ AI Agent returned response, length: ${agentData.answer.length}`);
        return {
          content: agentData.answer,
          metadata: {
            source: "ai_agent",
            type: agentData.type ?? "answer",
            suggestion: agentData.suggestion ?? null,
            suggestions: agentData.suggestions ?? null,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        console.log(`⚠️ AI Agent returned empty response, falling back...`);
      }
  } catch (error) {
    console.error("❌ AI agent call failed, using fallback:", error);
  }
  
  // Fallback to built-in responses
  console.log(`📚 Using fallback knowledge base...`);
  return await generateAIResponse(userMessage);
}
