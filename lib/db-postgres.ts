import { Pool } from "pg";
import { readFileSync } from "fs";
import path from "path";
import type { ContactMessageRow, ContactStore, EmailStatus } from "./db-types";

// Postgres store — the Vercel production store, including Neon.
// Selected when DATABASE_URL starts with postgres:// or postgresql://.
// Neon notes:
//  - Use the pooled connection string for serverless (Neon pooler, -pooler
//    host) to avoid connection exhaustion from many function instances.
//  - Neon requires SSL: pass sslmode=require in the URL (e.g.
//    postgres://user:pass@host/db?sslmode=require). This code honours it:
//    sslmode=require -> verified TLS; sslmode absent -> no TLS (local dev).
//  - Never commit DATABASE_URL; set it in Vercel → Settings → Environment
//    Variables, or in .env.local for local testing only.

export interface PgClientLike {
  query(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: unknown[]; rowCount?: number | null }>;
}

function sslFor(url: string): boolean | { rejectUnauthorized: boolean } {
  try {
    const parsed = new URL(url);
    const mode = parsed.searchParams.get("sslmode");
    if (mode === "require") return { rejectUnauthorized: true };
    if (mode === "prefer" || mode === "allow") return { rejectUnauthorized: false };
    if (parsed.hostname.endsWith(".neon.tech")) return { rejectUnauthorized: true };
    return false;
  } catch {
    return false;
  }
}

function mapRow(row: Record<string, unknown>): ContactMessageRow {
  const asString = (v: unknown): string | null =>
    v instanceof Date ? v.toISOString() : (v as string | null);
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    message: row.message as string,
    ipHash: row.ip_hash as string,
    emailStatus: row.email_status as string,
    emailError: row.email_error as string | null,
    sentAt: asString(row.sent_at),
    createdAt: asString(row.created_at) as string,
  };
}

/** Build a store over any pg-compatible client. Production passes a lazy
 *  Pool wrapper (below); tests pass an emulator client. The SQL and the
 *  schema file are the same in both cases. */
export function createPostgresStore(client: PgClientLike, schemaSql: string): ContactStore {
  let schemaEnsured = false;
  async function ensureSchema(): Promise<void> {
    if (schemaEnsured) return;
    await client.query(schemaSql);
    schemaEnsured = true;
  }
  return {
    kind: "postgres",
    async insert(input) {
      await ensureSchema();
      const result = await client.query(
        "INSERT INTO contact_messages (id, name, email, message, ip_hash, email_status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *",
        [input.id, input.name, input.email, input.message, input.ipHash],
      );
      return mapRow(result.rows[0] as Record<string, unknown>);
    },
    async get(id) {
      await ensureSchema();
      const result = await client.query(
        "SELECT * FROM contact_messages WHERE id = $1",
        [id],
      );
      return result.rows[0] ? mapRow(result.rows[0] as Record<string, unknown>) : null;
    },
    async listAll() {
      await ensureSchema();
      const result = await client.query(
        "SELECT * FROM contact_messages ORDER BY created_at ASC",
      );
      return result.rows.map((r) => mapRow(r as Record<string, unknown>));
    },
    async updateStatus(id: string, status: EmailStatus, emailError?: string) {
      await ensureSchema();
      if (status === "sent") {
        await client.query(
          "UPDATE contact_messages SET email_status = 'sent', sent_at = now(), updated_at = now() WHERE id = $1",
          [id],
        );
      } else {
        await client.query(
          "UPDATE contact_messages SET email_status = $2, email_error = $3, updated_at = now() WHERE id = $1",
          [id, status, emailError ?? null],
        );
      }
    },
    async healthCheck() {
      try {
        await client.query("SELECT 1 AS ok");
        return true;
      } catch {
        return false;
      }
    },
  };
}

let pool: Pool | null = null;

const lazyPoolClient: PgClientLike = {
  async query(text: string, params?: unknown[]) {
    if (!pool) {
      const connectionString = process.env.DATABASE_URL as string;
      // Neon free-tier databases scale to zero after idle, and the first
      // connection after a wake can take longer than a 5s pool timeout
      // (the same pattern that caused intermittent first-request failures
      // in the Nexora investigation). Give Neon hosts 15s; local Postgres
      // keeps 5s. Note: a Vercel Hobby function itself caps at 10s, so on
      // Hobby this only helps up to that cap — the 5-minute health
      // monitor in the README is what keeps a free-tier database warm.
      const isNeon = (() => {
        try {
          return new URL(connectionString).hostname.endsWith(".neon.tech");
        } catch {
          return false;
        }
      })();
      pool = new Pool({
        connectionString,
        ssl: sslFor(connectionString),
        max: 5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: isNeon ? 15_000 : 5_000,
      });
    }
    const result = await pool.query(text, params as never[]);
    return { rows: result.rows, rowCount: result.rowCount };
  },
};

export const postgresStore: ContactStore = createPostgresStore(
  lazyPoolClient,
  readFileSync(
    path.join(process.cwd(), "db", "migrations", "001_contact_messages.postgres.sql"),
    "utf8",
  ),
);
