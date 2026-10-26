# API.md — Abhishek Kumar Gautam Portfolio

How this application communicates internally and with external
services. Source of truth: the PRD, ARCHITECTURE.md, DATABASE.md,
and the route handlers actually in `app/api/`. Only the APIs below
exist. Do not document — or build — an endpoint that is not listed
here without updating this document first.

## Endpoints

### `GET /api/projects`

- **Purpose:** return the featured projects as JSON.
- **Auth:** none (public read of public resume content).
- **Request:** no body, no query parameters (parameters are ignored;
  there is no pagination or filtering — there are 3 projects).
- **Response (200):** `{ "projects": [ … ] }`, where each project is
  the `Project` object from `lib/data.ts`: `slug`, `title`, `period`,
  `stack[]`, `description`, `points[]`, `source` (URL or `null`),
  `demo` (URL or `null`). Projects without a verified public link
  return `null` for that field — never a placeholder URL.
- **Notes:** the homepage does not call this endpoint; it renders
  `lib/data.ts` directly at build time. The endpoint exists for
  programmatic consumers and as a checkable contract for the same data.

### `POST /api/contact`

- **Purpose:** the only write in the application. Saves a contact
  message and, when SMTP is configured, emails it to the owner.
- **Auth:** none (public submission), protected by validation,
  body-size cap, and rate limiting (see below). There is no user
  account to authenticate.
- **Request:** JSON body, `Content-Type: application/json`:
  ```json
  { "name": "Jane Doe", "email": "jane@example.com", "message": "Hello, I'd like to talk about…" }
  ```
- **Validation (all server-side, re-checked regardless of browser
  validation):** `name` trimmed, 2–100 chars; `email` trimmed,
  matching `^[^\s@]+@[^\s@]+\.[^\s@]+$`; `message` trimmed,
  10–2000 chars; body `Content-Length` ≤ 32 KB.
- **Rate limiting:** 5 POSTs per minute per IP (first value of
  `x-forwarded-for`, else `"unknown"`), in-memory, per server
  instance. Exceeding it returns 429 and the attempt is counted
  before validation (so invalid attempts also consume quota).
- **Flow:** insert as `email_status = 'pending'` → if SMTP not
  configured, update to `no_smtp` and return 201 → if configured,
  attempt send → success updates to `sent` (201), failure updates
  to `failed` with a short error (503).
- **Responses:**
  - `201` — `{ "ok": true, "id": "<uuid>", "message": "…" }`.
    With SMTP: "Message received and emailed. Thank you — I'll
    reply by email." Without SMTP: "Message saved. Email delivery
    isn't configured on this site yet, so I'll check saved
    messages — or email me directly for a faster reply."
  - `400` — `{ "error": "…" }` (validation or invalid JSON).
  - `413` — `{ "error": "Message is too large." }`.
  - `429` — `{ "error": "Too many messages. Please try again in a minute." }`.
  - `500` — `{ "error": "Message could not be saved. Please email directly instead." }` (database insert failed).
  - `503` — `{ "error": "Your message was saved, but email delivery failed — please email me directly at ak9724068@gmail.com so I don't miss it." }` (saved, send failed).
- **Deliberately absent:** there is no `GET /api/contact`, no list,
  no delete, and no admin endpoint. Messages are read by the owner
  directly from the database. Adding a listing endpoint would be a
  new, security-sensitive feature requiring its own auth design.

### `GET /api/health`

- **Purpose:** liveness / monitoring endpoint for uptime monitors.
- **Auth:** none (it reveals no sensitive data).
- **Behaviour:** forced dynamic (`await connection()` under
  cacheComponents — a prerendered health check would report
  build-time state and a frozen uptime). Runs a database
  `SELECT 1` check.
- **Response (200, database answers):**
  ```json
  { "status": "ok", "service": "portfolio-fullstack",
    "checks": { "database": "ok", "databaseKind": "sqlite" | "postgres",
                "emailConfigured": true | false },
    "uptimeSeconds": 123 }
  ```
- **Response (503, database check fails):** same shape with
  `status: "degraded"`, `checks.database: "error"`.
- **Never included:** secrets, message contents, message counts,
  sender data, or database connection details.
- **Monitoring guidance:** point an uptime monitor at this endpoint
  every 5 minutes; alert on non-200 or `degraded`. It also serves
  as the free-tier Neon keep-warm ping (see ARCHITECTURE.md §5).

## Authentication / authorization (API level)

- No endpoint requires a token, session, cookie, or API key.
- No endpoint trusts the client for authorization, because there is
  no per-user resource to authorize: reads are public resume data,
  the write is public and rate-limited, and message reads do not
  exist as endpoints.
- All validation and all permission decisions (in practice: rate
  limit, body cap, validation) are enforced server-side in the
  route handlers, never in `ContactForm` alone. Browser validation
  (`required`, `minLength`, `maxLength`, `type="email"`) is a
  convenience only and is re-checked on the server.

## Request / response formats

- JSON only. Requests: JSON bodies for POST; no form-encoded or
  multipart handling (there are no file uploads).
- Responses: JSON objects, never bare strings, except that error
  bodies are always `{ "error": "…" }` and contact success is
  always `{ "ok": true, "id, message }`.
- No envelope, no version field, no pagination wrapper: three
  endpoints, one consumer (the site) plus the monitor, do not need
  them. If a fourth consumer appears, versioning must be designed
  then, not retrofitted by renaming.

## Validation and error conventions

- Field errors name the field rule in plain language
  ("Please enter your name (2–100 characters).",
  "Please enter a valid email address.",
  "Please write a message between 10 and 2000 characters.").
- System errors are generic and actionable (direct-email fallback),
  never stack traces, never SMTP/database internals, never secrets.
- Status codes follow HTTP semantics: 400 validation, 413 size,
  429 rate, 500 save failure, 503 email failure (after save) and
  health degradation. A 503 from `/api/contact` still means the
  message was saved — the client copy must say so (and does).
- Unknown methods on a route return 405 (Next.js default for a
  route handler without that method — verified: `GET /api/contact`
  returns 405).

## Pagination / filtering

None. `/api/projects` returns all 3 projects; `/api/health` is a
single object; `/api/contact` accepts one message. No `page`,
`limit`, `filter`, or `sort` parameters exist, and adding one
without a listing endpoint to paginate would be meaningless.

## External APIs and integrations

### SMTP (nodemailer) — the only external integration

- **Purpose:** email contact messages to the owner.
- **Configuration:** `SMTP_HOST`, `SMTP_PORT` (default 587),
  `SMTP_SECURE` (`"true"` only), `SMTP_USER`, `SMTP_PASS`,
  `SMTP_FROM`, `CONTACT_EMAIL_TO` (default ak9724068@gmail.com).
  For Gmail, an App Password (not the account password) with
  `smtp.gmail.com:587`, `SMTP_SECURE=false`.
- **Operation:** one `sendMail` per contact submission, only when
  all of host/user/pass are set. Text-only body (no HTML built from
  user input, so a message cannot inject markup into the inbox):
  `Name: …`, `Email: …`, blank line, message. `from` = `SMTP_FROM`,
  `to` = `CONTACT_EMAIL_TO`, `replyTo` = sender's email,
  `subject` = `Portfolio contact from <name>`.
- **Failure handling:** send errors are caught, capped at 200
  characters for the database `email_error` field, and never sent
  to the client (the client gets the generic 503 fallback). The
  message row is already saved before sending, so a mail failure
  never loses a message.
- **Verification status:** the SMTP conversation was verified
  against a local stub (full message received intact, row → `sent`).
  No production provider has been verified — a first real
  submission after credentials are set is still the production proof.
- **No other external API is called by this app.** TMDB, Spotify,
  OMDb, and YouTube are integrations of the Music & Movies Show
  project, not of this portfolio, and must not be listed as
  portfolio integrations.

### Neon Postgres — database, not an API integration

- Accessed via the `pg` driver over the pooled connection string
  with `sslmode=require` (see DATABASE.md). No Neon API calls, no
  Neon dashboard automation, and no Neon API key are used by the
  app at runtime. The dashboard SQL Editor was used once, manually,
  to apply the schema.

## Webhooks and verification

None. No webhook endpoint exists, no signature verification is
needed, and no provider posts to this app. Do not add a webhook
without a provider requirement and a verification design.

## Rate limiting

- Contact POST: 5/minute/IP, in-memory, per instance (see above).
  Limitation, stated plainly: on a multi-instance host (Vercel
  with several function instances), the limit is per instance, not
  global. A shared store (database/Redis) is the documented
  follow-up if traffic ever requires it; the PRD does not require it.
- No rate limit on `GET /api/projects` or `GET /api/health`:
  they serve static content and a cheap `SELECT 1`, and the health
  endpoint is intentionally pinged every 5 minutes by monitors.
  Adding a limit to health would break its monitoring purpose.

## Required environment variables

| Variable | Required? | Default | Used by |
|---|---|---|---|
| `DATABASE_URL` | No (production: yes) | — (unset → SQLite) | `lib/db.ts`, migration scripts |
| `DATABASE_PATH` | No | `data/portfolio.db` | `lib/db-sqlite.ts`, migration script |
| `SMTP_HOST` | For email | — (unset → `no_smtp`) | `lib/email.ts` |
| `SMTP_PORT` | No | `587` | `lib/email.ts` |
| `SMTP_SECURE` | No | `"false"` | `lib/email.ts` |
| `SMTP_USER` | For email | — | `lib/email.ts` |
| `SMTP_PASS` | For email | — | `lib/email.ts` |
| `SMTP_FROM` | For email | `portfolio@localhost` (must be replaced with a real verified sender in production) | `lib/email.ts` |
| `CONTACT_EMAIL_TO` | No | `ak9724068@gmail.com` | `lib/email.ts` |

No other variable is read by the app. In particular, no
`NEXT_PUBLIC_` variable exists, and no secret is ever exposed to
the browser bundle.

## Data privacy and failure handling

- Personal data (name, email, message) is stored only in the
  database, never returned by an endpoint, never logged, and never
  included in health or error output.
- IP addresses are stored only as SHA-256 hashes.
- Database failure on insert → 500, message not saved, sender told
  to email directly. Database failure on health → 503 `degraded`.
- SMTP failure → message saved, row `failed`, sender told to email
  directly. SMTP unconfigured → message saved, row `no_smtp`,
  sender told plainly that email is not configured.
- In every failure mode, the sender is told what actually happened
  to their message. No failure mode claims success.
