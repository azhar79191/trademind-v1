import "dotenv/config";

function required(name: string, defaultValue: string = ""): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? defaultValue;
}

export const env = {
  appId: required("APP_ID", "trade-mind-test-app"),
  appSecret: required("APP_SECRET", "super-secret-test-key-12345"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL", "mysql://root:password@localhost:3306/trademind"),
  authUrl: required("AUTH_URL", "https://auth.trademind.example"),
  apiUrl: required("API_URL", "https://api.trademind.example"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "test-union-id-123",
};
