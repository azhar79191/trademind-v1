import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, authedMutation, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";

export const notificationRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        unreadOnly: z.boolean().optional().default(false),
        limit: z.number().min(1).max(100).optional().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const unreadOnly = input?.unreadOnly ?? false;
      const where = unreadOnly
        ? and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false))
        : eq(notifications.userId, ctx.user.id);

      return db.select().from(notifications)
        .where(where)
        .orderBy(desc(notifications.createdAt))
        .limit(input?.limit ?? 50);
    }),

  getUnreadCount: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) return { count: 0 };
    const db = getDb();
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false)));

    return { count: result[0]?.count ?? 0 };
  }),

  markRead: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      return { success: true };
    }),

  markAllRead: authedMutation.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, ctx.user.id));
    return { success: true };
  }),

  delete: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(notifications).where(
        and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id))
      );
      return { success: true };
    }),
});
