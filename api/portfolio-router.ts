import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { portfolioSnapshots, positions, trades } from "@db/schema";

export const portfolioRouter = createRouter({
  getSnapshot: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const [latestSnapshot, openPos, tradeMetrics] = await Promise.all([
      db.select().from(portfolioSnapshots)
        .where(eq(portfolioSnapshots.userId, ctx.user.id))
        .orderBy(desc(portfolioSnapshots.createdAt))
        .limit(1),

      db.select().from(positions)
        .where(eq(positions.userId, ctx.user.id))
        .orderBy(desc(positions.openedAt)),

      db.select({
        totalTrades: sql<number>`count(*)`,
        winCount: sql<number>`sum(case when ${trades.pnl} > 0 then 1 else 0 end)`,
        totalPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        avgTrade: sql<string>`coalesce(avg(${trades.pnl}), 0)`,
        bestTrade: sql<string>`coalesce(max(${trades.pnl}), 0)`,
        worstTrade: sql<string>`coalesce(min(${trades.pnl}), 0)`,
      }).from(trades).where(eq(trades.userId, ctx.user.id)),
    ]);

    const metrics = tradeMetrics[0];
    const totalTrades = metrics?.totalTrades ?? 0;
    const winRate = totalTrades > 0
      ? Math.round(((metrics?.winCount ?? 0) / totalTrades) * 100)
      : 0;

    // Generate asset allocation from open positions
    const assetMap = new Map<string, { value: number; qty: number }>();
    let totalPositionValue = 0;

    for (const pos of openPos) {
      const asset = pos.tradingPair.split("/")[0] ?? pos.tradingPair;
      const currentPrice = parseFloat(pos.currentPrice ?? pos.entryPrice);
      const qty = parseFloat(pos.quantity);
      const value = currentPrice * qty;
      totalPositionValue += value;

      const existing = assetMap.get(asset);
      if (existing) {
        existing.value += value;
        existing.qty += qty;
      } else {
        assetMap.set(asset, { value, qty });
      }
    }

    const allocation = Array.from(assetMap.entries()).map(([asset, data]) => ({
      asset,
      value: data.value,
      percentage: totalPositionValue > 0 ? Math.round((data.value / totalPositionValue) * 100) : 0,
      qty: data.qty,
    })).sort((a, b) => b.value - a.value);

    return {
      balance: {
        total: latestSnapshot[0]?.totalBalance ?? "0.00",
        available: latestSnapshot[0]?.availableBalance ?? "0.00",
        allocated: latestSnapshot[0]?.allocatedBalance ?? "0.00",
        unrealizedPnl: latestSnapshot[0]?.unrealizedPnl ?? "0.00",
      },
      performance: {
        totalTrades,
        winRate,
        totalPnl: metrics?.totalPnl ?? "0",
        avgTrade: metrics?.avgTrade ?? "0",
        bestTrade: metrics?.bestTrade ?? "0",
        worstTrade: metrics?.worstTrade ?? "0",
        dailyPnl: latestSnapshot[0]?.realizedPnl24h ?? "0.00",
        weeklyPnl: latestSnapshot[0]?.realizedPnl7d ?? "0.00",
        monthlyPnl: latestSnapshot[0]?.realizedPnl30d ?? "0.00",
      },
      positions: openPos,
      allocation,
    };
  }),

  getHistory: authedQuery
    .input(
      z.object({
        days: z.number().min(1).max(365).optional().default(30),
      }).optional()
    )
    .query(async ({ input }) => {
      const days = input?.days ?? 30;

      const db = getDb();
      const snapshots = await db
        .select()
        .from(portfolioSnapshots)
        .where(eq(portfolioSnapshots.userId, ctx.user.id))
        .orderBy(desc(portfolioSnapshots.createdAt))
        .limit(days + 1);

      if (snapshots.length === 0) return [];

      return snapshots.reverse().map((s) => {
        const value = parseFloat(s.totalBalance ?? "0");
        const pnl = parseFloat(s.realizedPnl24h ?? "0");
        return {
          date: new Date(s.createdAt!).toISOString().split("T")[0],
          value: value.toFixed(2),
          pnl: pnl.toFixed(2),
          pnlPercent: value > 0 ? ((pnl / value) * 100).toFixed(2) : "0.00",
        };
      });
    }),
});
