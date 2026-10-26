# ARCHITECTURE.md — Abhishek Kumar Gautam Portfolio

How this product is built, and why. Source of truth: the PRD
(`~/workspace/user/files/prd.pdf`), DESIGN.md, and the code as it
actually exists in `portfolio-fullstack/`. Where this document and
the code disagree, the code is wrong and this document is the fix
target — except for the explicitly marked future items in §12.

## 1. Recommended tech stack, with reasoning

| Choice | Reasoning |
|---|---|
| Next.js 16, App Router | PRD §5 requirement; server components for the page, route handlers for the API, one framework for both. |
| React 19, TypeScript (strict) | PRD §5; strict mode catches the `node:sqlite` / `pg` type issues that previously hid behind piped output. |
| Tailwind CSS 4 (via Turbopack) | PRD §5; the design tokens in DESIGN.md map directly to Tailwind classes. |
| Node 24 built-in `node:sqlite` (local only) | Zero-dependency local database. Prisma was tried and abandoned for a verified reason (unstable 8.0 RC + engine download failures in this VM); reintroducing an ORM is not justified for one table. |
| `pg` 8 (production) | The standard Postgres driver; pooled connections suit serverless. |
| nodemailer 10 (SMTP) | Text-only contact email; no other mail provider is needed. |
| Vitest 3 (tests) | Unit + emulator tests without a live database. |
| ESLint (next config), `tsc --noEmit` | Lint and type gates run before every build in CI-less local flow. |

Not used, deliberately: Framer Motion / Lucide (animations and icons
done natively — see DESIGN.md), any ORM, any auth library, any CMS,
any analytics/error-tracker (owner account choice, see §12), Redis
(shared rate limiting is a future item, not an MVP need).

`package.json` declares `"engines": {"node": ">=24"}` because
`lib/db.ts` statically imports the SQLite store, which imports
`node:sqlite`; that builtin needs Node 24 for stable support, and the
import runs even when Postgres is selected. Vercel must therefore run
Node 24 for this app.

## 2. Frontend / backend architecture

Single Next.js application, no separate backend service:

- **Frontend:** one server-rendered page (`app/page.tsx`) composed of
  sections, plus three client components (`SiteHeader`, `BackToTop`,
  `ContactForm` — client only where interactivity
  requires it: scroll observation, drawer state, form state, mount
  timing). All other rendering is server components.
- **Backend:** three route handlers under `app/api/` (see API.md).
  No other server code, no middleware, no edge functions.
- **Content:** `lib/data.ts` is the single source of truth for all
  page content. It is imported by the page and by `/api/projects`.
  Nothing else holds a copy of resume content.
- **State:** no global store, no context provider, no client cache.
  Form state lives in `ContactForm`; nav state lives in
  `SiteHeader`; everything else is props and server data.

## 3. Data flow

### Page load
Browser → Next.js server → `app/page.tsx` reads `lib/data.ts` →
static HTML (page is prerendered) → client hydrates only the four
client components. No API call is needed to render the page.

### Contact submission (the only write)
```
ContactForm (client)
  → POST /api/contact { name, email, message }
    → rate limit (5/min/IP, in-memory, per instance)
    → body-size guard (32 KB)
    → validate (name 2–100, email format, message 10–2000)
    → insert into contact_messages as email_status = 'pending'
    → if SMTP not configured: update to 'no_smtp', return 201
    → if SMTP configured: send via nodemailer
        → success: update to 'sent', return 201
        → failure: update to 'failed' + error text, return 503
          with a direct-email fallback message
```
The message is never lost on an email failure: it is already saved
before any send is attempted, and the failure is recorded in the row.

### Health check
Browser/monitor → `GET /api/health` → `await connection()` (forces
request-time rendering under cacheComponents) → database
`SELECT 1` → 200 `ok` or 503 `degraded`, with `databaseKind` and
`emailConfigured`. No message data, no counts, no secrets.

## 4. Folder structure

```
app/
  layout.tsx            Root layout: fonts, metadata, header, footer
  page.tsx              Single page: all 9 PRD sections
  globals.css           Tailwind + focus + animated background
  api/
    contact/route.ts    POST only (no GET — messages never listed)
    health/route.ts     GET, dynamic
    projects/route.ts   GET, returns lib/data projects
components/
  SiteHeader.tsx        Sticky nav, active indicator, mobile drawer
  BackToTop.tsx         Scroll-triggered back-to-top button
  ContactForm.tsx       Contact form + states
lib/
  data.ts               Resume content, single source of truth
  db.ts                 Provider selector (Postgres vs SQLite)
  db-postgres.ts        pg store + schema auto-apply
  db-sqlite.ts          node:sqlite store
  db-types.ts           Shared ContactMessageRow / ContactStore
  contact.ts            Validation, IP hashing, rate limiter
  email.ts              SMTP config + send (text-only)
  sqlite.d.ts           node:sqlite type shim
db/migrations/
  001_contact_messages.sql           SQLite schema
  001_contact_messages.postgres.sql  Postgres schema (same shape)
scripts/
  migrate-postgres.mjs        Apply Postgres schema
  migrate-sqlite-to-postgres.mjs  Copy SQLite rows → Postgres
  env.mjs                     Minimal .env.local loader (never prints values)
tests/
  contact.test.ts       Validation, rate limit, IP hash
  database.test.ts      Provider selection
  postgres.test.ts      Real schema + store SQL against pg-mem
public/
  Abhishek-Gautam-Resume.pdf  Downloadable resume
  og-cover.svg                Open Graph image
```

Rules: new code goes in the folder its kind already lives in; do not
create a second place for the same kind of thing (no second `lib/`,
no second data source, no second contact implementation).

## 5. Database interaction

See DATABASE.md for the full model. Interaction rules:

- All database access goes through the `ContactStore` interface
  (`kind`, `insert`, `get`, `listAll`, `updateStatus`, `healthCheck`).
  Routes never import `pg` or `node:sqlite` directly.
- Provider selection is the single decision point in `lib/db.ts`:
  `DATABASE_URL` starting with `postgres://`/`postgresql://` →
  Postgres; otherwise SQLite. There is no third provider and no
  runtime switching after first use.
- Postgres store auto-applies its schema file on first use
  (`ensureSchema`, once per process, `CREATE TABLE IF NOT EXISTS` +
  `CREATE INDEX IF NOT EXISTS`). The same file was also applied
  manually in Neon via the dashboard SQL Editor; the two are the
  same SQL, not two schemas.
- SQLite store applies its schema on first open, scoped to
  `./data/` for relative paths (this scoping fixed a Turbopack
  whole-project tracing warning).
- Pool (Postgres): max 5 connections, idle timeout 30s, connection
  timeout 5s (15s for `.neon.tech` hosts, for scale-to-zero wake-ups),
  SSL honoured from `sslmode=require` or a `.neon.tech` host
  (`rejectUnauthorized: true`).
- Queries are parameterised (`$1…` / `?`) everywhere. No string-built
  SQL from user input exists in the codebase.
- `listAll` exists only for the one-off SQLite→Postgres migration
  script. No route calls it, and no endpoint lists messages.

## 6. Authentication / authorization

**There is none, by design, and that is correct for this product.**

- The portfolio site has no users, no sign-in, no sign-up, no roles,
  and no protected pages. The PRD defines no authentication for the
  portfolio site itself.
- Authentication mentioned in project descriptions (email/password
  sign-in and cookie sessions in Music & Movies Show; JWT/RBAC in
  the skill set) describes *other* projects and the author's skills.
  It is not a requirement to build auth into this portfolio, and
  building a login system here would be inventing scope — the
  Devfolio admin/blog/auth scope was explicitly not adopted for this
  app.
- Authorization model for the only write: anyone may submit a
  contact message, subject to validation, body-size cap, and the
  per-IP rate limit. Messages are readable only by the owner, directly
  from the database — never through an API endpoint.
- If a future admin view of messages is ever requested, it must be
  designed and approved separately (auth approach, session handling,
  and owner identity are all undecided) — it is not a small addition
  to the current contact route.

## 7. API architecture

See API.md for the full contract. Principles:

- REST-style route handlers, JSON in/out, no GraphQL, no RPC layer.
- One handler per resource concern: projects (read), contact
  (write), health (monitor). No versioning (three endpoints, one
  consumer — the site itself — plus the monitor).
- Errors use HTTP status + a short `{ error }` body; success uses
  `{ ok: true, id, message }` for contact and plain JSON for the
  others. No error body ever contains a secret, a stack trace, or
  message contents beyond what the sender just submitted.
- Authorization is server-side by construction: there is no
  client-side permission to trust, because the only write is public
  and rate-limited, and the only read of messages is direct database
  access by the owner.
- External calls (SMTP only) are made server-side, with timeouts
  from the mail library defaults and failures recorded honestly —
  never swallowed, never claimed as success.

## 8. External services

| Service | Purpose | Required? | Status |
|---|---|---|---|
| Neon Postgres (free tier) | Production database for contact messages | Yes, for Vercel | Project `portfolio` exists (Singapore, `neondb`, production branch); schema applied; pooled URL with `sslmode=require` |
| SMTP provider (owner's choice) | Contact email delivery | Yes, for email (not for saving) | Not yet configured — site runs in honest `no_smtp` mode until credentials are supplied |
| Vercel | Hosting | Yes, for production | Not yet deployed (owner approval required) |
| GitHub | Source hosting | Yes, for Vercel import | No repository exists yet (owner decision) |

No other external service is used. No analytics, no error tracker,
no CDN beyond Vercel's own, no third-party font or script host
(Geist is served via `next/font`, self-hosted by Next.js).

## 9. AI architecture

None. The PRD defines no AI feature for this portfolio site, and
none is built. AI mentioned in project descriptions (Smart Chatbot)
describes another project. Do not add an AI feature, model call, or
AI SDK without a new PRD-level requirement.

## 10. Environment configuration

All configuration is environment variables; nothing is hardcoded
except safe defaults (see API.md §9 for the full list):

- `DATABASE_URL` — Postgres URL; unset → SQLite. Pooled Neon URL
  with `sslmode=require` in production.
- `DATABASE_PATH` — SQLite file; default `data/portfolio.db`;
  relative paths scoped to `./data/`.
- `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_SECURE`
  (`"true"` only), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- `CONTACT_EMAIL_TO` — defaults to ak9724068@gmail.com if unset.
- `.env.example` documents all of the above with placeholders only.
  Real `.env.local` files are gitignored (`.env*` in `.gitignore`)
  and must never be committed. No secret appears in code, docs, or
  build output.

## 11. Error handling

- Validation errors → 400 with the specific field message.
- Oversize body → 413. Rate-limited → 429. Unparseable JSON → 400.
- Database insert failure → 500 with a direct-email fallback
  ("Message could not be saved. Please email directly instead.").
- Email send failure → message already saved, row marked `failed`,
  503 with a direct-email fallback. Email-not-configured → row
  marked `no_smtp`, 201 with an honest message.
- Health database failure → 503 `degraded`, not a crash.
- Unknown errors: Next.js default handling; no stack traces are
  sent to clients, and server logs contain only error names/messages
  (the email path logs only an Ethereal preview URL, server-side,
  when one exists — never message content or credentials).
- Client form: network failure → generic error box with a
  direct-email suggestion; non-JSON response → generic fallback.

## 12. Security boundaries

- **Server-only:** database credentials, SMTP credentials, database
  files, and message contents. None of these reach the browser:
  no `NEXT_PUBLIC_` variable exists in the codebase, and no route
  returns messages.
- **Browser:** only public page content, the contact form inputs,
  and the response message/id for the sender's own submission.
- **Network:** security headers on every response (CSP `'self'`,
  frame DENY, nosniff, strict referrer, restricted permissions
  policy); all external links `rel="noopener noreferrer"`.
- **Trust:** the browser is never trusted for authorization (there
  is nothing to authorize) or for validation (server re-validates
  everything, including lengths the browser also enforces).
- **Future items (not MVP, not built):** shared rate limiting,
  error tracker, analytics, admin message view, `metadataBase`
  (needs the real deployed URL — must not be invented).

## 13. Testing and deployment approach

- **Unit tests (Vitest):** validation accept/reject, email format,
  rate-limiter per-IP behaviour, IP-hash properties, provider
  selection, and the real Postgres schema + store SQL against a
  pg-mem emulator (with `char_length` registered in the test only —
  it is native in real Postgres).
- **Live checks (production build, local server):** health,
  projects, homepage content, valid/invalid contact, rate limit,
  contact GET (405), database file over HTTP (404), security
  headers, and — in this round — the new nav/engineering/OG checks.
  Test data is removed after every live check; the local SQLite
  file is left empty.
- **Not claimed:** live Neon connectivity, live production SMTP,
  automated axe audit, Lighthouse scores. Each needs its real
  environment or tool, and none is reported as passed without it.
- **Deployment (owner approval required):** push to a GitHub repo,
  import in Vercel with the Next.js preset and Node 24, set
  `DATABASE_URL` + SMTP variables in Vercel, deploy, then
  smoke-test `/api/health` (expect `databaseKind: "postgres"`),
  the homepage, and one real contact submission, checking its
  Neon row. Point an uptime monitor at `/api/health` every
  5 minutes. No deployment, push, or paid change happens without
  explicit owner approval.
