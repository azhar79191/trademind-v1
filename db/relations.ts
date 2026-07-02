import { relations } from "drizzle-orm";
import {
  users,
  exchangeKeys,
  strategies,
  trades,
  orders,
  positions,
  portfolioSnapshots,
  chatConversations,
  chatMessages,
  notifications,
  auditLogs,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  exchangeKeys: many(exchangeKeys),
  strategies: many(strategies),
  trades: many(trades),
  orders: many(orders),
  positions: many(positions),
  portfolioSnapshots: many(portfolioSnapshots),
  chatConversations: many(chatConversations),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}));

export const exchangeKeysRelations = relations(exchangeKeys, ({ one }) => ({
  user: one(users, { fields: [exchangeKeys.userId], references: [users.id] }),
}));

export const strategiesRelations = relations(strategies, ({ one, many }) => ({
  user: one(users, { fields: [strategies.userId], references: [users.id] }),
  trades: many(trades),
  positions: many(positions),
}));

export const tradesRelations = relations(trades, ({ one, many }) => ({
  user: one(users, { fields: [trades.userId], references: [users.id] }),
  strategy: one(strategies, { fields: [trades.strategyId], references: [strategies.id] }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  trade: one(trades, { fields: [orders.tradeId], references: [trades.id] }),
}));

export const positionsRelations = relations(positions, ({ one }) => ({
  user: one(users, { fields: [positions.userId], references: [users.id] }),
  strategy: one(strategies, { fields: [positions.strategyId], references: [strategies.id] }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, { fields: [chatConversations.userId], references: [users.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, { fields: [chatMessages.conversationId], references: [chatConversations.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));
