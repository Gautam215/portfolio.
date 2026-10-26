import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "fs";
import path from "path";
import type { ContactMessageRow, ContactStore } from "./db-types";

// SQLite store — for local / single-server use only. See lib/db.ts for why
// this is NOT the Vercel production store (Vercel serverless storage is
// ephemeral and not shared between instances).

function dbPath(): string {
  const configured = process.env.DATABASE_PATH;
  if (configured && path.isAbsolute(configured)) return configured;
  const name = configured ? path.basename(configured) : "portfolio.db";
  return path.join(process.cwd(), "data", name);
}

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;
  const file = dbPath();
  mkdirSync(path.dirname(file), { recursive: true });
  db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(
    readFileSync(
      path.join(process.cwd(), "db", "migrations", "001_contact_messages.sql"),
      "utf8",
    ),
  );
  return db;
}

function mapRow(row: Record<string, string | null>): ContactMessageRow {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    message: row.message as string,
    ipHash: row.ip_hash as string,
    emailStatus: row.email_status as string,
    emailError: row.email_error,
    sentAt: row.sent_at,
    createdAt: row.created_at as string,
  };
}

export const sqliteStore: ContactStore = {
  kind: "sqlite",
  async insert(input) {
    const database = getDb();
    database
      .prepare(
        "INSERT INTO contact_messages (id, name, email, message, ip_hash, email_status) VALUES (?, ?, ?, ?, ?, 'pending')",
      )
      .run(input.id, input.name, input.email, input.message, input.ipHash);
    return (await this.get(input.id)) as ContactMessageRow;
  },
  async get(id) {
    const row = getDb()
      .prepare("SELECT * FROM contact_messages WHERE id = ?")
      .get(id) as Record<string, string | null> | undefined;
    return row ? mapRow(row) : null;
  },
  async listAll() {
    const rows = getDb()
      .prepare("SELECT * FROM contact_messages ORDER BY created_at ASC")
      .all() as Record<string, string | null>[];
    return rows.map(mapRow);
  },
  async updateStatus(id, status, emailError) {
    const database = getDb();
    if (status === "sent") {
      database
        .prepare(
          "UPDATE contact_messages SET email_status = 'sent', sent_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        )
        .run(id);
    } else {
      database
        .prepare(
          "UPDATE contact_messages SET email_status = ?, email_error = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        )
        .run(status, emailError ?? null, id);
    }
  },
  async healthCheck() {
    try {
      getDb().prepare("SELECT 1 AS ok").get();
      return true;
    } catch {
      return false;
    }
  },
};
