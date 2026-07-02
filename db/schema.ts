import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  bigint,
  boolean,
  json,
  index,
} from "drizzle-orm/mysql-core";

// ─── Users & Authentication ──────────────────────────────────────────

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  passwordHash: varchar("password_hash", { length: 255 }), // For email/password auth
  authProvider: mysqlEnum("auth_provider", ["email", "google", "oauth"]).default("email"), // Track auth method
  role: mysqlEnum("role", ["user", "admin", "super_admin"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscription_tier", ["free", "premium", "enterprise"]).default("free").notNull(),
  subscriptionStatus: mysqlEnum("subscription_status", ["active", "cancelled", "expired", "trial"]).default("trial").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  preferences: json("preferences").$type<UserPreferences>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

interface UserPreferences {
  defaultExchange?: string;
  defaultPair?: string;
  riskLevel?: "low" | "medium" | "high";
  notificationsEnabled?: boolean;
  theme?: "dark" | "light";
  timezone?: string;
  language?: string;
}

// ─── Exchange API Keys (Encrypted) ───────────────────────────────────

export const exchangeKeys = mysqlTable("exchange_keys", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  apiKeyLabel: varchar("api_key_label", { length: 100 }).notNull(),
  apiKeyEncrypted: text("api_key_encrypted").notNull(),
  apiSecretEncrypted: text("api_secret_encrypted").notNull(),
  passphraseEncrypted: text("passphrase_encrypted"),
  isTestnet: boolean("is_testnet").default(false),
  isActive: boolean("is_active").default(true),
  permissions: json("permissions").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ExchangeKey = typeof exchangeKeys.$inferSelect;

// ─── Trading Strategies ──────────────────────────────────────────────

export const strategies = mysqlTable("strategies", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", [
    "trend_following",
    "mean_reversion",
    "breakout",
    "scalping",
    "grid",
    "dca",
    "arbitrage",
    "custom",
  ]).notNull(),
  status: mysqlEnum("status", ["active", "paused", "draft", "archived"]).default("draft").notNull(),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  tradingPair: varchar("trading_pair", { length: 50 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull(),
  config: json("config").$type<StrategyConfig>().notNull(),
  riskSettings: json("risk_settings").$type<RiskSettings>(),
  performance: json("performance").$type<StrategyPerformance>(),
  isPublic: boolean("is_public").default(false),
  cloneCount: int("clone_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Strategy = typeof strategies.$inferSelect;

interface StrategyConfig {
  indicators: IndicatorConfig[];
  entryConditions: Condition[];
  exitConditions: Condition[];
  positionSizing: "fixed" | "percent" | "kelly";
  positionSizeValue: number;
}

interface IndicatorConfig {
  name: string;
  parameters: Record<string, number>;
}

interface Condition {
  indicator: string;
  operator: "gt" | "lt" | "eq" | "crosses_above" | "crosses_below";
  value: number;
}

interface RiskSettings {
  maxDailyLoss: number;
  maxWeeklyLoss: number;
  maxDrawdown: number;
  maxPositionSize: number;
  maxLeverage: number;
  maxOpenTrades: number;
  riskPerTrade: number;
  useTrailingStop: boolean;
  trailingStopPercent: number;
}

interface StrategyPerformance {
  totalReturn?: number;
  winRate?: number;
  profitFactor?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  averageTrade?: number;
  lastBacktested?: Date;
}

// ─── Trades ──────────────────────────────────────────────────────────

export const trades = mysqlTable("trades", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  strategyId: bigint("strategy_id", { mode: "number", unsigned: true }),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  tradingPair: varchar("trading_pair", { length: 50 }).notNull(),
  side: mysqlEnum("side", ["buy", "sell"]).notNull(),
  type: mysqlEnum("type", ["market", "limit", "stop", "oco", "trailing_stop"]).notNull(),
  status: mysqlEnum("status", ["open", "closed", "cancelled", "pending"]).default("pending").notNull(),
  entryPrice: decimal("entry_price", { precision: 18, scale: 8 }),
  exitPrice: decimal("exit_price", { precision: 18, scale: 8 }),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 18, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 18, scale: 8 }),
  pnl: decimal("pnl", { precision: 18, scale: 8 }),
  pnlPercent: decimal("pnl_percent", { precision: 10, scale: 4 }),
  fees: decimal("fees", { precision: 18, scale: 8 }).default("0"),
  leverage: int("leverage").default(1),
  duration: int("duration"),
  metadata: json("metadata").$type<TradeMetadata>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  closedAt: timestamp("closed_at"),
}, (table) => [
  index("trades_user_idx").on(table.userId),
  index("trades_strategy_idx").on(table.strategyId),
  index("trades_status_idx").on(table.status),
]);

export type Trade = typeof trades.$inferSelect;

interface TradeMetadata {
  aiConfidence?: number;
  aiReasoning?: string;
  indicators?: Record<string, number>;
  signalId?: string;
}

// ─── Orders ──────────────────────────────────────────────────────────

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  tradeId: bigint("trade_id", { mode: "number", unsigned: true }),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  tradingPair: varchar("trading_pair", { length: 50 }).notNull(),
  exchangeOrderId: varchar("exchange_order_id", { length: 255 }),
  side: mysqlEnum("side", ["buy", "sell"]).notNull(),
  type: mysqlEnum("type", ["market", "limit", "stop", "oco", "trailing_stop"]).notNull(),
  status: mysqlEnum("status", ["pending", "filled", "partially_filled", "cancelled", "rejected", "expired"]).default("pending").notNull(),
  price: decimal("price", { precision: 18, scale: 8 }),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  filledQuantity: decimal("filled_quantity", { precision: 18, scale: 8 }).default("0"),
  remainingQuantity: decimal("remaining_quantity", { precision: 18, scale: 8 }),
  averageFillPrice: decimal("average_fill_price", { precision: 18, scale: 8 }),
  fees: decimal("fees", { precision: 18, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;

// ─── Positions ───────────────────────────────────────────────────────

export const positions = mysqlTable("positions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  strategyId: bigint("strategy_id", { mode: "number", unsigned: true }),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  tradingPair: varchar("trading_pair", { length: 50 }).notNull(),
  side: mysqlEnum("side", ["long", "short"]).notNull(),
  status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
  entryPrice: decimal("entry_price", { precision: 18, scale: 8 }).notNull(),
  currentPrice: decimal("current_price", { precision: 18, scale: 8 }),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  leverage: int("leverage").default(1),
  unrealizedPnl: decimal("unrealized_pnl", { precision: 18, scale: 8 }),
  unrealizedPnlPercent: decimal("unrealized_pnl_percent", { precision: 10, scale: 4 }),
  stopLoss: decimal("stop_loss", { precision: 18, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 18, scale: 8 }),
  liquidationPrice: decimal("liquidation_price", { precision: 18, scale: 8 }),
  margin: decimal("margin", { precision: 18, scale: 8 }),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  closedAt: timestamp("closed_at"),
}, (table) => [
  index("positions_user_idx").on(table.userId),
  index("positions_status_idx").on(table.status),
]);

export type Position = typeof positions.$inferSelect;

// ─── AI Signals ──────────────────────────────────────────────────────

export const aiSignals = mysqlTable("ai_signals", {
  id: serial("id").primaryKey(),
  tradingPair: varchar("trading_pair", { length: 50 }).notNull(),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  action: mysqlEnum("action", ["buy", "sell", "hold", "strong_buy", "strong_sell"]).notNull(),
  confidence: int("confidence").notNull(),
  entryPrice: decimal("entry_price", { precision: 18, scale: 8 }),
  stopLoss: decimal("stop_loss", { precision: 18, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 18, scale: 8 }),
  riskLevel: mysqlEnum("risk_level", ["low", "medium", "high", "extreme"]).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull(),
  indicators: json("indicators").$type<SignalIndicators>(),
  reasoning: text("reasoning"),
  alternativeScenarios: json("alternative_scenarios").$type<string[]>(),
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }),
  marketStructure: varchar("market_structure", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
}, (table) => [
  index("signals_pair_idx").on(table.tradingPair),
  index("signals_action_idx").on(table.action),
  index("signals_created_idx").on(table.createdAt),
]);

export type AISignal = typeof aiSignals.$inferSelect;

interface SignalIndicators {
  rsi?: number;
  macd?: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  vwap?: number;
  atr?: number;
  adx?: number;
  volume?: number;
  bbUpper?: number;
  bbLower?: number;
  stochastic?: number;
}

// ─── Market Data (OHLCV) ─────────────────────────────────────────────

export const marketData = mysqlTable("market_data", {
  id: serial("id").primaryKey(),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  tradingPair: varchar("trading_pair", { length: 50 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull(),
  open: decimal("open", { precision: 18, scale: 8 }).notNull(),
  high: decimal("high", { precision: 18, scale: 8 }).notNull(),
  low: decimal("low", { precision: 18, scale: 8 }).notNull(),
  close: decimal("close", { precision: 18, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 24, scale: 8 }).notNull(),
  quoteVolume: decimal("quote_volume", { precision: 24, scale: 8 }),
  trades: int("trades"),
  timestamp: timestamp("timestamp").notNull(),
}, (table) => [
  index("md_pair_tf_idx").on(table.tradingPair, table.timeframe),
  index("md_timestamp_idx").on(table.timestamp),
]);

export type MarketData = typeof marketData.$inferSelect;

// ─── Portfolio Snapshots ─────────────────────────────────────────────

export const portfolioSnapshots = mysqlTable("portfolio_snapshots", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  totalBalance: decimal("total_balance", { precision: 18, scale: 8 }).notNull(),
  availableBalance: decimal("available_balance", { precision: 18, scale: 8 }).notNull(),
  allocatedBalance: decimal("allocated_balance", { precision: 18, scale: 8 }).notNull(),
  unrealizedPnl: decimal("unrealized_pnl", { precision: 18, scale: 8 }),
  realizedPnl24h: decimal("realized_pnl_24h", { precision: 18, scale: 8 }),
  realizedPnl7d: decimal("realized_pnl_7d", { precision: 18, scale: 8 }),
  realizedPnl30d: decimal("realized_pnl_30d", { precision: 18, scale: 8 }),
  drawdown: decimal("drawdown", { precision: 10, scale: 4 }),
  sharpeRatio: decimal("sharpe_ratio", { precision: 10, scale: 4 }),
  assetAllocation: json("asset_allocation").$type<AssetAllocation[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;

interface AssetAllocation {
  asset: string;
  percentage: number;
  value: number;
}

// ─── Chat Conversations ──────────────────────────────────────────────

export const chatConversations = mysqlTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).default("New Conversation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ChatConversation = typeof chatConversations.$inferSelect;

export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversation_id", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata").$type<ChatMessageMetadata>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

interface ChatMessageMetadata {
  signalId?: number;
  pair?: string;
  indicators?: Record<string, number>;
  confidence?: number;
}

// ─── Notifications ───────────────────────────────────────────────────

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["signal", "trade", "price_alert", "system", "risk_warning"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: json("data"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── Audit Logs ──────────────────────────────────────────────────────

export const auditLogs = mysqlTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("audit_user_idx").on(table.userId),
  index("audit_action_idx").on(table.action),
]);

export type AuditLog = typeof auditLogs.$inferSelect;

// ─── News & Sentiment ────────────────────────────────────────────────

export const newsArticles = mysqlTable("news_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary"),
  source: varchar("source", { length: 100 }).notNull(),
  url: text("url"),
  category: varchar("category", { length: 50 }),
  sentiment: mysqlEnum("sentiment", ["positive", "negative", "neutral"]).default("neutral"),
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }),
  relatedAssets: json("related_assets").$type<string[]>(),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewsArticle = typeof newsArticles.$inferSelect;
