import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { strategies } from "@db/schema";

export const strategyRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        status: z.enum(["active", "paused", "draft", "archived", "all"]).optional().default("all"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const where = input?.status && input.status !== "all"
        ? and(eq(strategies.userId, ctx.user.id), eq(strategies.status, input.status))
        : eq(strategies.userId, ctx.user.id);

      return db.select().from(strategies).where(where).orderBy(desc(strategies.updatedAt));
    }),

  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.select().from(strategies).where(
        and(eq(strategies.id, input.id), eq(strategies.userId, ctx.user.id))
      ).limit(1);
      return result[0] ?? null;
    }),

  create: authedMutation
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        type: z.enum([
          "trend_following",
          "mean_reversion",
          "breakout",
          "scalping",
          "grid",
          "dca",
          "arbitrage",
          "custom",
        ]),
        exchange: z.string().min(1),
        tradingPair: z.string().min(1),
        timeframe: z.string().min(1),
        config: z.object({
          indicators: z.array(z.object({
            name: z.string(),
            parameters: z.record(z.string(), z.number()),
          })),
          entryConditions: z.array(z.object({
            indicator: z.string(),
            operator: z.enum(["gt", "lt", "eq", "crosses_above", "crosses_below"]),
            value: z.number(),
          })),
          exitConditions: z.array(z.object({
            indicator: z.string(),
            operator: z.enum(["gt", "lt", "eq", "crosses_above", "crosses_below"]),
            value: z.number(),
          })),
          positionSizing: z.enum(["fixed", "percent", "kelly"]),
          positionSizeValue: z.number(),
        }),
        riskSettings: z.object({
          maxDailyLoss: z.number().optional(),
          maxWeeklyLoss: z.number().optional(),
          maxDrawdown: z.number().optional(),
          maxPositionSize: z.number().optional(),
          maxLeverage: z.number().optional(),
          maxOpenTrades: z.number().optional(),
          riskPerTrade: z.number().optional(),
          useTrailingStop: z.boolean().optional(),
          trailingStopPercent: z.number().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(strategies).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description ?? null,
        type: input.type,
        exchange: input.exchange,
        tradingPair: input.tradingPair,
        timeframe: input.timeframe,
        config: input.config,
        riskSettings: input.riskSettings ?? null,
        status: "draft",
      } as any);
      return { id: Number(result[0]?.insertId ?? 0) };
    }),

  update: authedMutation
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(["active", "paused", "draft", "archived"]).optional(),
        config: z.any().optional(),
        riskSettings: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      await db.update(strategies)
        .set(updates)
        .where(and(eq(strategies.id, id), eq(strategies.userId, ctx.user.id)));

      return { success: true };
    }),

  delete: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(strategies).where(
        and(eq(strategies.id, input.id), eq(strategies.userId, ctx.user.id))
      );
      return { success: true };
    }),

  toggleStatus: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.select().from(strategies).where(
        and(eq(strategies.id, input.id), eq(strategies.userId, ctx.user.id))
      ).limit(1);

      if (!result[0]) return { success: false };

      const newStatus = result[0].status === "active" ? "paused" : "active";
      await db.update(strategies)
        .set({ status: newStatus })
        .where(eq(strategies.id, input.id));

      return { success: true, status: newStatus };
    }),
});
