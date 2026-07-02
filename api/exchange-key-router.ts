import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { exchangeKeys } from "@db/schema";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.APP_SECRET?.slice(0, 32).padEnd(32, "0") ?? "trademind_default_key_32chars!!!";
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
  const [ivHex, encHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]);
  return decrypted.toString();
}

export const exchangeKeyRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const keys = await db.select({
      id: exchangeKeys.id,
      exchange: exchangeKeys.exchange,
      apiKeyLabel: exchangeKeys.apiKeyLabel,
      isTestnet: exchangeKeys.isTestnet,
      isActive: exchangeKeys.isActive,
      permissions: exchangeKeys.permissions,
      createdAt: exchangeKeys.createdAt,
    }).from(exchangeKeys).where(eq(exchangeKeys.userId, ctx.user.id));
    return keys;
  }),

  add: authedMutation
    .input(z.object({
      exchange: z.enum(["binance", "okx", "bybit", "coinbase", "kraken"]),
      label: z.string().min(1).max(100),
      apiKey: z.string().min(1),
      apiSecret: z.string().min(1),
      passphrase: z.string().optional(),
      isTestnet: z.boolean().optional().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(exchangeKeys).values({
        userId: ctx.user.id,
        exchange: input.exchange,
        apiKeyLabel: input.label,
        apiKeyEncrypted: encrypt(input.apiKey),
        apiSecretEncrypted: encrypt(input.apiSecret),
        passphraseEncrypted: input.passphrase ? encrypt(input.passphrase) : null,
        isTestnet: input.isTestnet,
        isActive: true,
        permissions: ["read", "trade"],
      } as any);
      return { id: Number(result[0]?.insertId ?? 0) };
    }),

  remove: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(exchangeKeys).where(
        and(eq(exchangeKeys.id, input.id), eq(exchangeKeys.userId, ctx.user.id))
      );
      return { success: true };
    }),

  // Returns decrypted keys for use in trade execution (server-side only)
  getDecrypted: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.select().from(exchangeKeys).where(
        and(eq(exchangeKeys.id, input.id), eq(exchangeKeys.userId, ctx.user.id))
      ).limit(1);
      if (!result[0]) return null;
      const key = result[0];
      return {
        exchange: key.exchange,
        apiKey: decrypt(key.apiKeyEncrypted),
        apiSecret: decrypt(key.apiSecretEncrypted),
        passphrase: key.passphraseEncrypted ? decrypt(key.passphraseEncrypted) : "",
        isTestnet: key.isTestnet,
      };
    }),
});
