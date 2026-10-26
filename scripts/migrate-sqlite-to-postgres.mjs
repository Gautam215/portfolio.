// One-off SQLite -> Postgres data preservation.
// Copies every row from the SQLite file (DATABASE_PATH, default
// data/portfolio.db) into Postgres (DATABASE_URL), preserving id, fields,
// status, error, and timestamps. Rows already present in Postgres (same id)
// are left untouched (ON CONFLICT DO NOTHING), so re-running is safe.
// Usage: npm run db:migrate-sqlite   (with DATABASE_URL in env/.env.local)
// Never prints message contents, emails, or connection strings — only counts.
import { existsSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Client } from "pg";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();
const url = process.env.DATABASE_URL;
if (!url || !url.startsWith("postgres")) {
  console.error("DATABASE_URL is not set to a postgres:// URL. Aborting.");
  process.exit(1);
}
const configured = process.env.DATABASE_PATH;
const sqliteFile = configured && path.isAbsolute(configured)
  ? configured
  : path.join(process.cwd(), "data", configured ? path.basename(configured) : "portfolio.db");
if (!existsSync(sqliteFile)) {
  console.log("No SQLite file found — nothing to migrate (0 rows).");
  process.exit(0);
}
const sqlite = new DatabaseSync(sqliteFile, { readOnly: true });
const rows = sqlite.prepare("SELECT * FROM contact_messages ORDER BY created_at ASC").all();
console.log(`Found ${rows.length} row(s) in SQLite.`);
if (rows.length === 0) {
  sqlite.close();
  process.exit(0);
}
const ssl = url.includes("sslmode=require") || new URL(url).hostname.endsWith(".neon.tech")
  ? { rejectUnauthorized: true }
  : false;
const client = new Client({ connectionString: url, ssl });
try {
  await client.connect();
  let inserted = 0;
  let skipped = 0;
  for (const r of rows) {
    const res = await client.query(
      `INSERT INTO contact_messages
        (id, name, email, message, ip_hash, email_status, email_error, sent_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.name, r.email, r.message, r.ip_hash, r.email_status, r.email_error, r.sent_at, r.created_at, r.updated_at],
    );
    if (res.rowCount === 1) inserted += 1; else skipped += 1;
  }
  console.log(`Migration complete: ${inserted} inserted, ${skipped} already present, ${rows.length} total.`);
} catch (err) {
  console.error("Data migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
  sqlite.close();
}
