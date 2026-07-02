import { z } from "zod";
import { eq, desc, sql, count } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, strategies, trades, aiSignals, newsArticles, auditLogs } from "@db/schema";

export const adminRouter = createRouter({
  // ─── Dashboard Stats ───────────────────────────────────────────────

  getStats: adminQuery.query(async () => {
    const db = getDb();

    const [
      userStats,
      strategyStats,
      tradeStats,
      signalStats,
      recentUsers,
      recentTrades,
    ] = await Promise.all([
      // User counts
      db.select({
        total: count(),
        admins: sql<number>`sum(case when ${users.role} = 'admin' then 1 else 0 end)`,
        premium: sql<number>`sum(case when ${users.subscriptionTier} in ('premium', 'enterprise') then 1 else 0 end)`,
        active24h: sql<number>`sum(case when ${users.lastSignInAt} > now() - interval 1 day then 1 else 0 end)`,
      }).from(users),

      // Strategy counts
      db.select({
        total: count(),
        active: sql<number>`sum(case when ${strategies.status} = 'active' then 1 else 0 end)`,
      }).from(strategies),

      // Trade metrics
      db.select({
        total: count(),
        open: sql<number>`sum(case when ${trades.status} = 'open' then 1 else 0 end)`,
        totalPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        avgPnl: sql<string>`coalesce(avg(${trades.pnl}), 0)`,
      }).from(trades),

      // Signal counts
      db.select({
        total24h: count(),
        buySignals: sql<number>`sum(case when ${aiSignals.action} in ('buy', 'strong_buy') then 1 else 0 end)`,
        sellSignals: sql<number>`sum(case when ${aiSignals.action} in ('sell', 'strong_sell') then 1 else 0 end)`,
      }).from(aiSignals)
        .where(sql`${aiSignals.createdAt} > now() - interval 24 hour`),

      // Recent users
      db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        subscriptionTier: users.subscriptionTier,
        createdAt: users.createdAt,
        lastSignInAt: users.lastSignInAt,
      }).from(users)
        .orderBy(desc(users.createdAt))
        .limit(10),

      // Recent trades
      db.select({
        id: trades.id,
        tradingPair: trades.tradingPair,
        side: trades.side,
        status: trades.status,
        pnl: trades.pnl,
        createdAt: trades.createdAt,
      }).from(trades)
        .orderBy(desc(trades.createdAt))
        .limit(10),
    ]);

    const userS = userStats[0];
    const stratS = strategyStats[0];
    const tradeS = tradeStats[0];
    const sigS = signalStats[0];

    return {
      users: {
        total: userS?.total ?? 0,
        admins: userS?.admins ?? 0,
        premium: userS?.premium ?? 0,
        active24h: userS?.active24h ?? 0,
      },
      strategies: {
        total: stratS?.total ?? 0,
        active: stratS?.active ?? 0,
      },
      trades: {
        total: tradeS?.total ?? 0,
        open: tradeS?.open ?? 0,
        totalPnl: tradeS?.totalPnl ?? "0",
        avgPnl: tradeS?.avgPnl ?? "0",
      },
      signals: {
        total24h: sigS?.total24h ?? 0,
        buySignals: sigS?.buySignals ?? 0,
        sellSignals: sigS?.sellSignals ?? 0,
      },
      recentUsers,
      recentTrades,
    };
  }),

  // ─── User Management ───────────────────────────────────────────────

  listUsers: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["user", "admin", "super_admin", "all"]).optional().default("all"),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const where = input?.role && input.role !== "all"
        ? eq(users.role, input.role)
        : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(users)
          .where(where)
          .orderBy(desc(users.createdAt))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0),
        db.select({ count: sql<number>`count(*)` }).from(users).where(where),
      ]);

      return { items, total: countResult[0]?.count ?? 0 };
    }),

  updateUserRole: adminQuery
    .input(z.object({ id: z.number(), role: z.enum(["user", "admin", "super_admin"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
      return { success: true };
    }),

  // ─── Signal Management ─────────────────────────────────────────────

  createSignal: adminQuery
    .input(
      z.object({
        tradingPair: z.string(),
        exchange: z.string(),
        action: z.enum(["buy", "sell", "hold", "strong_buy", "strong_sell"]),
        confidence: z.number().min(0).max(100),
        entryPrice: z.string().optional(),
        stopLoss: z.string().optional(),
        takeProfit: z.string().optional(),
        riskLevel: z.enum(["low", "medium", "high", "extreme"]),
        timeframe: z.string(),
        reasoning: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(aiSignals).values({
        ...input,
        indicators: {},
      } as any);
      return { id: Number(result[0]?.insertId ?? 0) };
    }),

  // ─── News Management ───────────────────────────────────────────────

  createNews: adminQuery
    .input(
      z.object({
        title: z.string(),
        summary: z.string().optional(),
        source: z.string(),
        url: z.string().optional(),
        category: z.string().optional(),
        sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
        sentimentScore: z.string().optional(),
        relatedAssets: z.array(z.string()).optional(),
        publishedAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(newsArticles).values({
        title: input.title,
        summary: input.summary ?? null,
        source: input.source,
        url: input.url ?? null,
        category: input.category ?? null,
        sentiment: input.sentiment ?? "neutral",
        sentimentScore: input.sentimentScore ?? "0",
        relatedAssets: input.relatedAssets ?? [],
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      } as any);
      return { id: Number(result[0]?.insertId ?? 0) };
    }),

  // ─── Audit Logs ────────────────────────────────────────────────────

  getAuditLogs: adminQuery
    .input(
      z.object({
        limit: z.number().min(1).max(200).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const [items, countResult] = await Promise.all([
        db.select().from(auditLogs)
          .orderBy(desc(auditLogs.createdAt))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0),
        db.select({ count: sql<number>`count(*)` }).from(auditLogs),
      ]);

      return { items, total: countResult[0]?.count ?? 0 };
    }),
});
