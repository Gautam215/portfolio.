-- 001: contact messages (the only table in the portfolio database).
-- Applied idempotently on every server start (CREATE TABLE IF NOT EXISTS).
-- To move to Postgres later, port this schema — see IMPLEMENTATION_PLAN.md.
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
  email TEXT NOT NULL,
  message TEXT NOT NULL CHECK (length(message) BETWEEN 10 AND 2000),
  ip_hash TEXT NOT NULL,
  email_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'failed', 'no_smtp')),
  email_error TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages (created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email_status
  ON contact_messages (email_status);
