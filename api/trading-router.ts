import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { trades, orders, positions } from "@db/schema";

export const tradingRouter = createRouter({
  // ─── Trades ────────────────────────────────────────────────────────

  getTrades: authedQuery
    .input(
      z.object({
        status: z.enum(["open", "closed", "cancelled", "pending", "all"]).optional().default("all"),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const filterStatus = input?.status ?? "all";
      const where = filterStatus !== "all"
        ? and(eq(trades.userId, ctx.user.id), eq(trades.status, filterStatus))
        : eq(trades.userId, ctx.user.id);

      const [items, countResult] = await Promise.all([
        db.select().from(trades).where(where).orderBy(desc(trades.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0),
        db.select({ count: sql<number>`count(*)` }).from(trades).where(where),
      ]);

      return { items, total: countResult[0]?.count ?? 0 };
    }),

  getTrade: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.select().from(trades).where(
        and(eq(trades.id, input.id), eq(trades.userId, ctx.user.id))
      ).limit(1);
      return result[0] ?? null;
    }),

  createTrade: authedMutation
    .input(
      z.object({
        exchange: z.string().min(1),
        tradingPair: z.string().min(1),
        side: z.enum(["buy", "sell"]),
        type: z.enum(["market", "limit", "stop", "oco", "trailing_stop"]),
        quantity: z.string(),
        price: z.string().optional(),
        stopLoss: z.string().optional(),
        takeProfit: z.string().optional(),
        leverage: z.number().min(1).max(125).optional(),
        strategyId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(trades).values({
        userId: ctx.user.id,
        strategyId: input.strategyId ?? null,
        exchange: input.exchange,
        tradingPair: input.tradingPair,
        side: input.side,
        type: input.type,
        quantity: input.quantity,
        entryPrice: input.price ?? null,
        stopLoss: input.stopLoss ?? null,
        takeProfit: input.takeProfit ?? null,
        leverage: input.leverage ?? 1,
        status: "pending",
      } as any);
      return { id: Number(result[0]?.insertId ?? 0) };
    }),

  // ─── Positions ─────────────────────────────────────────────────────

  getPositions: authedQuery
    .input(
      z.object({
        status: z.enum(["open", "closed", "all"]).optional().default("open"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const filterStatus = input?.status ?? "open";
      const where = filterStatus !== "all"
        ? and(eq(positions.userId, ctx.user.id), eq(positions.status, filterStatus))
        : and(eq(positions.userId, ctx.user.id), eq(positions.status, "open"));

      return db.select().from(positions).where(where).orderBy(desc(positions.openedAt));
    }),

  // ─── Orders ────────────────────────────────────────────────────────

  getOrders: authedQuery
    .input(
      z.object({
        status: z.enum(["pending", "filled", "cancelled", "all"]).optional().default("all"),
        limit: z.number().min(1).max(100).optional().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const filterStatus = input?.status ?? "all";
      const where = filterStatus !== "all"
        ? and(eq(orders.userId, ctx.user.id), eq(orders.status, filterStatus))
        : eq(orders.userId, ctx.user.id);

      return db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(input?.limit ?? 50);
    }),

  // ─── Statistics ────────────────────────────────────────────────────

  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const [tradeStats, positionStats] = await Promise.all([
      db.select({
        totalTrades: sql<number>`count(*)`,
        openTrades: sql<number>`sum(case when ${trades.status} = 'open' then 1 else 0 end)`,
        winCount: sql<number>`sum(case when ${trades.pnl} > 0 then 1 else 0 end)`,
        totalPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        avgPnl: sql<string>`coalesce(avg(${trades.pnl}), 0)`,
      }).from(trades).where(eq(trades.userId, ctx.user.id)),

      db.select({
        openPositions: sql<number>`count(*)`,
        totalUnrealizedPnl: sql<string>`coalesce(sum(${positions.unrealizedPnl}), 0)`,
      }).from(positions).where(and(eq(positions.userId, ctx.user.id), eq(positions.status, "open"))),
    ]);

    const stats = tradeStats[0];
    const totalTrades = stats?.totalTrades ?? 0;
    const winRate = totalTrades > 0
      ? Math.round(((stats?.winCount ?? 0) / totalTrades) * 100)
      : 0;

    return {
      totalTrades: stats?.totalTrades ?? 0,
      openTrades: stats?.openTrades ?? 0,
      winRate,
      totalPnl: stats?.totalPnl ?? "0",
      avgPnl: stats?.avgPnl ?? "0",
      openPositions: positionStats[0]?.openPositions ?? 0,
      totalUnrealizedPnl: positionStats[0]?.totalUnrealizedPnl ?? "0",
    };
  }),
});
