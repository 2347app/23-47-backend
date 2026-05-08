import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const isProd = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ...(isProd && { ssl: { rejectUnauthorized: false } }),
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  // @ts-ignore — PrismaPg driver adapter type mismatch; runtime unaffected
  adapter,
  log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
  await pool.end();
});
