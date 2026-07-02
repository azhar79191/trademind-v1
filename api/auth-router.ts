import * as cookie from "cookie";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";

export const authRouter = createRouter({
  // ─── Email/Password Signup ─────────────────────────────────────────
  signup: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Email already registered");
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user
      const result = await db.insert(users).values({
        unionId: `email_${input.email}_${Date.now()}`,
        name: input.name,
        email: input.email,
        passwordHash,
        authProvider: "email",
        role: "user",
        subscriptionTier: "free",
        subscriptionStatus: "trial",
      } as any);

      const userId = Number(result[0].insertId);

      // Fetch the created user
      const newUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((rows) => rows[0]);

      // Create session token with correct format (unionId + clientId)
      const sessionToken = await signSessionToken({
        unionId: newUser.unionId,
        clientId: env.appId,
      });

      // Set cookie
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, sessionToken, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000, // 1 year to match token expiration
        })
      );

      return {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      };
    }),

  // ─── Email/Password Login ──────────────────────────────────────────
  login: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Find user by email
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check if user has password (email auth)
      if (!user.passwordHash) {
        throw new Error("Please use Google Sign In for this account");
      }

      // Verify password
      const isValid = await bcrypt.compare(input.password, user.passwordHash);

      if (!isValid) {
        throw new Error("Invalid email or password");
      }

      // Update last sign in
      await db
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      // Create session token with correct format (unionId + clientId)
      const sessionToken = await signSessionToken({
        unionId: user.unionId,
        clientId: env.appId,
      });

      // Set cookie
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, sessionToken, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000, // 1 year to match token expiration
        })
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
        },
      };
    }),

  // ─── Get Current User ──────────────────────────────────────────────
  me: authedQuery.query((opts) => opts.ctx.user),

  // ─── Update Profile / Preferences ─────────────────────────────────
  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().min(1).optional(),
        preferences: z
          .object({
            defaultExchange: z.string().optional(),
            defaultPair: z.string().optional(),
            riskLevel: z.enum(["low", "medium", "high"]).optional(),
            notificationsEnabled: z.boolean().optional(),
            theme: z.enum(["dark", "light"]).optional(),
            timezone: z.string().optional(),
            language: z.string().optional(),
          })
          .optional(),
        twoFactorEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = input.twoFactorEnabled;
      if (input.preferences !== undefined) {
        const raw = ctx.user.preferences;
        const existing = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
        updateData.preferences = { ...existing, ...input.preferences };
      }
      await db.update(users).set(updateData as any).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  // ─── Logout ────────────────────────────────────────────────────────
  // Use publicQuery to allow logout even if token is invalid/expired
  logout: publicQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      })
    );
    return { success: true };
  }),

  // ─── Google OAuth ──────────────────────────────────────────────────
  // Returns only the client ID — the frontend builds the full OAuth URL itself
  googleAuth: publicQuery.query(() => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new Error("Google OAuth not configured. Please set GOOGLE_CLIENT_ID in .env file.");
    }
    return { clientId: googleClientId };
  }),

  googleCallback: publicQuery
    .input(z.object({ code: z.string(), redirectUri: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!googleClientId || !googleClientSecret) {
        throw new Error("Google OAuth not configured properly. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env");
      }

      const redirectUri = input.redirectUri;

      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: input.code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        throw new Error(`Google token exchange failed: ${error}`);
      }

      const tokens = await tokenResponse.json();

      // Get user info from Google
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get user info from Google");
      }

      const googleUser = await userResponse.json();

      // Find or create user in database
      const db = getDb();
      let user = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) {
        // Create new user with Google auth
        const result = await db.insert(users).values({
          unionId: `google_${googleUser.id}`,
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture,
          authProvider: "google",
          role: "user",
          subscriptionTier: "free",
          subscriptionStatus: "trial",
        } as any);

        const userId = Number(result[0].insertId);
        user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
          .then((rows) => rows[0]);
      } else if (user.authProvider === "email" && !user.passwordHash) {
        // Link Google account to existing user without password
        await db
          .update(users)
          .set({ 
            authProvider: "google", 
            avatar: googleUser.picture,
            unionId: `google_${googleUser.id}`
          })
          .where(eq(users.id, user.id));
      }

      // Update last sign in
      await db
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      // Create session token
      const sessionToken = await signSessionToken({
        unionId: user.unionId,
        clientId: env.appId,
      });

      // Set cookie
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, sessionToken, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        })
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      };
    }),
});
