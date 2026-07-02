import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, authedMutation, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { exchangeKeys, trades, positions } from "@db/schema";
import { getEnv } from "./lib/env";

const AI_AGENT_URL = process.env.AI_AGENT_API_URL ?? "http://localhost:8000";

async function getDecryptedKey(userId: number, keyId: number) {
  const db = getDb();
  const result = await db.select().from(exchangeKeys).where(
    and(eq(exchangeKeys.id, keyId), eq(exchangeKeys.userId, userId))
  ).limit(1);
  if (!result[0]) throw new Error("Exchange key not found");

  // Import decrypt inline to avoid circular deps
  const crypto = await import("crypto");
  const ENCRYPTION_KEY = (process.env.APP_SECRET?.slice(0, 32) ?? "trademind_default_key_32chars!!!").padEnd(32, "0");

  function decrypt(text: string): string {
    const [ivHex, encHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]);
    return decrypted.toString();
  }

  const key = result[0];
  return {
    exchange: key.exchange,
    api_key: decrypt(key.apiKeyEncrypted),
    api_secret: decrypt(key.apiSecretEncrypted),
    passphrase: key.passphraseEncrypted ? decrypt(key.passphraseEncrypted) : "",
    testnet: key.isTestnet ?? false,
  };
}

export const autoTradeRouter = createRouter({
  // Execute a trade via AI agent → exchange
  execute: authedMutation
    .input(z.object({
      exchangeKeyId: z.number(),
      symbol: z.string(),
      side: z.enum(["buy", "sell"]),
      orderType: z.enum(["market", "limit"]),
      quantity: z.number().positive(),
      price: z.number().optional(),
      stopLoss: z.number().optional(),
      takeProfit: z.number().optional(),
      strategyId: z.number().optional(),
      autoMonitor: z.boolean().optional().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const creds = await getDecryptedKey(ctx.user.id, input.exchangeKeyId);

      const payload = {
        exchange: creds.exchange,
        api_key: creds.api_key,
        api_secret: creds.api_secret,
        passphrase: creds.passphrase,
        testnet: creds.testnet,
        symbol: input.symbol,
        side: input.side,
        order_type: input.orderType,
        quantity: input.quantity,
        price: input.price ?? null,
        stop_loss: input.stopLoss ?? null,
        take_profit: input.takeProfit ?? null,
        auto_monitor: input.autoMonitor,
      };

      const res = await fetch(`${AI_AGENT_URL}/trade/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`AI agent error: ${err}`);
      }

      const agentResult = await res.json();

      // Record trade in DB
      const db = getDb();
      const tradeResult = await db.insert(trades).values({
        userId: ctx.user.id,
        strategyId: input.strategyId ?? null,
        exchange: creds.exchange,
        tradingPair: input.symbol,
        side: input.side,
        type: input.orderType,
        quantity: String(input.quantity),
        entryPrice: input.price ? String(input.price) : null,
        stopLoss: input.stopLoss ? String(input.stopLoss) : null,
        takeProfit: input.takeProfit ? String(input.takeProfit) : null,
        status: "open",
        metadata: {
          aiConfidence: agentResult.order_result?.confidence,
          aiReasoning: "Auto-executed via TradeMind AI",
          monitorActive: agentResult.monitor_active,
        },
      } as any);

      return {
        tradeId: Number(tradeResult[0]?.insertId ?? 0),
        agentResult,
      };
    }),

  // Get monitored symbols for user's API key
  getMonitored: authedQuery
    .input(z.object({ exchangeKeyId: z.number() }))
    .query(async ({ ctx, input }) => {
      const creds = await getDecryptedKey(ctx.user.id, input.exchangeKeyId);
      const prefix = creds.api_key.slice(0, 8);
      const res = await fetch(`${AI_AGENT_URL}/trade/monitored/${prefix}`);
      if (!res.ok) return { symbols: [] };
      return res.json();
    }),

  // Cancel monitoring for a symbol
  cancelMonitor: authedMutation
    .input(z.object({ exchangeKeyId: z.number(), symbol: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const creds = await getDecryptedKey(ctx.user.id, input.exchangeKeyId);
      const res = await fetch(`${AI_AGENT_URL}/trade/cancel-monitor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: creds.api_key, symbol: input.symbol }),
      });
      return res.json();
    }),

  // Close a trade manually
  closeTrade: authedMutation
    .input(z.object({
      tradeId: z.number(),
      exchangeKeyId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const tradeResult = await db.select().from(trades).where(
        and(eq(trades.id, input.tradeId), eq(trades.userId, ctx.user.id))
      ).limit(1);

      if (!tradeResult[0]) throw new Error("Trade not found");
      const trade = tradeResult[0];

      const creds = await getDecryptedKey(ctx.user.id, input.exchangeKeyId);
      const closeSide = trade.side === "buy" ? "sell" : "buy";

      const payload = {
        exchange: creds.exchange,
        api_key: creds.api_key,
        api_secret: creds.api_secret,
        passphrase: creds.passphrase,
        testnet: creds.testnet,
        symbol: trade.tradingPair,
        side: closeSide,
        order_type: "market",
        quantity: parseFloat(trade.quantity),
        auto_monitor: false,
      };

      const res = await fetch(`${AI_AGENT_URL}/trade/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to close trade on exchange");

      await db.update(trades)
        .set({ status: "closed", closedAt: new Date() } as any)
        .where(eq(trades.id, input.tradeId));

      return { success: true };
    }),
});
