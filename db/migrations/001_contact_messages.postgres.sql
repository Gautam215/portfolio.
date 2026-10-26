-- 001 (Postgres port of 001_contact_messages.sql) — contact messages.
-- Applied idempotently on first Postgres use (CREATE TABLE IF NOT EXISTS).
-- Same columns, checks, and indexes as the SQLite schema, in Postgres types.
-- Run manually before first production use with:
--   psql "$DATABASE_URL" -f db/migrations/001_contact_messages.postgres.sql
-- or let the app apply it on first request (see lib/db-postgres.ts).
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  ip_hash TEXT NOT NULL,
  email_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'failed', 'no_smtp')),
  email_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages (created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email_status
  ON contact_messages (email_status);
