import { authRouter } from "./auth-router";
import { tradingRouter } from "./trading-router";
import { strategyRouter } from "./strategy-router";
import { signalRouter } from "./signal-router";
import { portfolioRouter } from "./portfolio-router";
import { marketRouter } from "./market-router";
import { chatRouter } from "./chat-router";
import { notificationRouter } from "./notification-router";
import { adminRouter } from "./admin-router";
import { exchangeKeyRouter } from "./exchange-key-router";
import { autoTradeRouter } from "./auto-trade-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  trading: tradingRouter,
  strategy: strategyRouter,
  signal: signalRouter,
  portfolio: portfolioRouter,
  market: marketRouter,
  chat: chatRouter,
  notification: notificationRouter,
  admin: adminRouter,
  exchangeKey: exchangeKeyRouter,
  autoTrade: autoTradeRouter,
});

export type AppRouter = typeof appRouter;
