import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { users } from "./schema";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@trademind.ai";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";
const ADMIN_NAME = process.env.ADMIN_NAME || "TradeMind Admin";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // ── Create admin user ──────────────────────────────────────────────
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);

  if (existing.length > 0) {
    // Ensure existing user has admin role
    await db.update(users).set({ role: "admin" }).where(eq(users.email, ADMIN_EMAIL));
    console.log(`✅ Admin role ensured for: ${ADMIN_EMAIL}`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.insert(users).values({
      unionId: `email_${ADMIN_EMAIL}_admin`,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      authProvider: "email",
      role: "admin",
      subscriptionTier: "enterprise",
      subscriptionStatus: "active",
    } as any);
    console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
  }

  console.log("Done.");
  process.exit(0);
}

seed();
