import type { ContactStore } from "./db-types";
import { sqliteStore } from "./db-sqlite";
import { postgresStore } from "./db-postgres";

export type { ContactMessageRow, ContactStore, EmailStatus } from "./db-types";

// Database selection — the single decision point for the whole app.
//
//  DATABASE_URL starts with postgres:// or postgresql://  -> Postgres
//    (the Vercel production store, including Neon; see lib/db-postgres.ts)
//  otherwise                                              -> SQLite
//    (local / single-server use only; see lib/db-sqlite.ts)
//
// Why two stores: Vercel's own knowledge base states SQLite "can't be used
// with Vercel" because serverless storage is ephemeral and not shared
// between function instances. So SQLite cannot reliably persist contact
// messages on Vercel across deployments or instances, and production must
// use a managed Postgres database. There is no GET endpoint that exposes
// either store's messages.
export function getStore(): ContactStore {
  const url = process.env.DATABASE_URL ?? "";
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return postgresStore;
  }
  return sqliteStore;
}

export function databaseKind(): "sqlite" | "postgres" {
  return getStore().kind;
}

export async function insertContactMessage(input: {
  id: string;
  name: string;
  email: string;
  message: string;
  ipHash: string;
}) {
  return getStore().insert(input);
}

export async function getContactMessage(id: string) {
  return getStore().get(id);
}

export async function updateContactMessageStatus(
  id: string,
  status: "sent" | "failed" | "no_smtp",
  emailError?: string,
) {
  return getStore().updateStatus(id, status, emailError);
}

export async function dbHealthCheck(): Promise<boolean> {
  return getStore().healthCheck();
}
