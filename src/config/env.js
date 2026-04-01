import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),

  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

  MAIL_FROM: z.string().min(1).default("noreply@finance-dashboard.dev"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("[env] Invalid or missing environment variables:");
  for (const issue of parsed.error.issues) {
    const path = issue.path.length ? issue.path.join(".") : "(root)";
    console.error(`  ${path}: ${issue.message}`);
  }
  process.exit(1);
}

const e = parsed.data;

const env = {
  port: e.PORT,
  mongoUri: e.MONGODB_URI,
  accessTokenSecret: e.ACCESS_TOKEN_SECRET,
  accessTokenExpiry: e.ACCESS_TOKEN_EXPIRY,
  refreshTokenSecret: e.REFRESH_TOKEN_SECRET,
  refreshTokenExpiry: e.REFRESH_TOKEN_EXPIRY,
  mailFrom: e.MAIL_FROM,
  nodeEnv: e.NODE_ENV,
};

export default env;
