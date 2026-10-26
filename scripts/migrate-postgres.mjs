// Apply the Postgres schema to DATABASE_URL.
// Usage: DATABASE_URL="postgres://...?sslmode=require" npm run db:migrate
// (or put DATABASE_URL in .env.local first). Idempotent: CREATE TABLE IF
// NOT EXISTS. Never prints the connection string or any secret.
import { readFileSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();
const url = process.env.DATABASE_URL;
if (!url || !url.startsWith("postgres")) {
  console.error("DATABASE_URL is not set to a postgres:// URL. Aborting.");
  process.exit(1);
}
const ssl = url.includes("sslmode=require") || new URL(url).hostname.endsWith(".neon.tech")
  ? { rejectUnauthorized: true }
  : false;
const client = new Client({ connectionString: url, ssl });
try {
  await client.connect();
  const sql = readFileSync(
    path.join(process.cwd(), "db", "migrations", "001_contact_messages.postgres.sql"),
    "utf8",
  );
  await client.query(sql);
  console.log("Postgres schema applied: contact_messages table + indexes ready.");
} catch (err) {
  console.error("Schema migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
