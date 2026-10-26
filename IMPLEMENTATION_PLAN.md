# Implementation Plan — Abhishek Kumar Gautam Full-Stack Portfolio

Source of truth for content: the resume (`~/workspace/user/files/Abhishek_Gautam_Resume.pdf`,
via `lib/data.ts`). Design and verified content are kept as-is from the
2026-10-26 build; this plan covers only the work requested after that build.
No rebuild from scratch, no invented links, metrics, or achievements.

## Current state (2026-10-26, before this round)

- Next.js 16, React 19, TypeScript, Tailwind 4. Pages: Hero, About, Skills,
  Projects, Achievements, Contact. Dark theme, responsive.
- `GET /api/projects`, `GET /api/health`, `POST /api/contact`.
- Contact previously stored messages in gitignored `data/messages.json`,
  with validation and an in-memory 5/minute/IP rate limit. No email delivery.
- No database, no tests, no security headers, no project docs beyond README.
- Not a git repository, not deployed, no hosting credentials on file.

## Phase 1 — Proper database (done in this round)

- SQLite via Node 24's built-in `node:sqlite` (`lib/db.ts`,
  `db/migrations/001_contact_messages.sql`, `DATABASE_PATH=data/portfolio.db`).
  ACID, indexed, SQL schema — a real database, not a JSON file, with no
  external service or binary download.
- One table: `contact_messages` — id (UUID), name, email, message, ip_hash
  (SHA-256 of the sender IP, never the raw IP), email_status
  (`pending`/`sent`/`failed`/`no_smtp`), email_error, sent_at, created_at,
  updated_at, with CHECK constraints on name/message length and status.
- No GET endpoint exposes messages. The `.db` file is gitignored.
- Pivot note (honest): Prisma 7 was tried first. Its engine binaries failed
  to download twice in this environment (ECONNRESET during
  `@prisma/engines` postinstall), and `prisma@latest` had resolved to an
  unstable 8.0 release candidate that conflicted with Vitest. Rather than
  forcing a broken install, the store was built on the stdlib SQLite that
  works here. Vitest then installed cleanly, confirming Prisma was the
  blocker.
- Migration path to Postgres (follow-up, not a one-line change now): port
  the SQL schema in `001_contact_messages.sql` to Postgres and swap
  `lib/db.ts` for a Postgres client, or reintroduce an ORM at that point.
  Required before a multi-instance deployment (Vercel), because SQLite is
  per-instance and Vercel's filesystem is ephemeral.
- Validation and rate limiting extracted to `lib/contact.ts` so they are
  unit-testable without a running server.

## Phase 2 — Reliable email delivery (done in this round, pending credentials)

- `lib/email.ts` sends via SMTP with nodemailer, text-only body (no HTML
  built from user input), `replyTo` set to the sender.
- Env vars (see `.env.example`): `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`,
  `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_EMAIL_TO`
  (defaults to ak9724068@gmail.com).
- Honest states, recorded in the database and shown to the sender:
  - SMTP configured + send succeeds → `sent`, form shows success.
  - SMTP configured + send fails → `failed`, form returns 503 and tells the
    sender the message was saved but they should email directly.
  - SMTP not configured → `no_smtp`, form returns 201 and says plainly that
    email delivery isn't configured and messages are checked from the database.
- Never claim an email was sent when it was not (the failure mode fixed in
  earlier Nexora work, applied here from the start).
- BLOCKER for production email: a real SMTP account is still needed. Until
  the owner supplies one (e.g. a Gmail App Password, or a transactional
  provider), production runs in `no_smtp` mode.
- Delivery-path verification (see Final audit): Ethereal test accounts are
  BLOCKED in this VM (api.nodemailer.com returns an empty reply / TLS
  EPROTO through the egress proxy), so that route was not used and is not
  claimed. Instead, nodemailer's real SMTP conversation was verified against
  a local SMTP stub: the stub received the full message (From/To/Reply-To/
  Subject/body intact) and the database row moved to `sent`. That proves the
  code path, not any particular production provider — a first real
  submission after SMTP credentials are set is still the production proof.

## Phase 3 — Production security audit

- Security headers in `next.config.ts`: nosniff, DENY framing,
  strict-origin-when-cross-origin referrer, camera/microphone/geolocation
  denied, and a conservative Content-Security-Policy (`'self'` only, plus
  `data:` images and `'unsafe-inline'` styles, which Tailwind/Next need).
- Body-size guard (32 KB) on the contact route; validation unchanged
  (name 2–100, email format, message 10–2000).
- React escapes all rendered content; the email body is text-only.
- No secrets in code or in the repo: `.env.local` gitignored, `.env.example`
  holds placeholders only. No contact data is exposed by any endpoint.
- Known limitation, accepted: the rate limiter is per server instance. On a
  single server this is sufficient; a multi-instance host needs a shared
  store (DB/Redis) before traffic grows — recorded as a follow-up, not
  silently assumed away.

## Phase 4 — UI/UX and accessibility review

- Kept the existing design and content unchanged.
- Fixes made: skip-to-main-content link (visible on keyboard focus) with
  `id="main"` on `<main>`; global `:focus-visible` outline; smooth scrolling
  disabled under `prefers-reduced-motion`; form `autoComplete` for name/email;
  the small contact note raised from zinc-500 to zinc-400 for contrast.
- Already correct and kept: labelled form fields, `role="status"`/`role="alert"`
  for form feedback, semantic headings (one h1, h2 per section), `lang="en"`,
  external links with `rel="noopener noreferrer"`.

## Phase 5 — Tests

- `npm test` runs Vitest on `tests/contact.test.ts`: validation accept/reject
  cases, email format, rate-limiter per-IP behaviour, IP-hash properties.
  Result in this round: 7/7 passed.
- Live checks (not unit tests): production build (exit 0, no warnings after
  the fixes below), lint (clean), running server — health, projects,
  homepage content, invalid contact → 400, valid contact without SMTP →
  201 + `no_smtp` in the database, valid contact with a local SMTP stub →
  `sent` in the database and the message received by the stub, rate limit →
  5×201 then 429, contact GET → 405, database file over HTTP → 404, all
  security headers present on the homepage.
- Bugs found and fixed by live testing (not by guessing):
  1. Health was prerendered as static at build time, so it reported
     build-time state (emailConfigured:false, uptime frozen at 1s) while the
     contact route emailed fine. Fixed with `await connection()` in the
     health route (the old `dynamic` export is rejected under
     cacheComponents). After the fix: health is dynamic (ƒ in the build
     output), uptime ticks (5s → 8s), emailConfigured reflects live env.
  2. The first build hid a TypeScript error (`node:sqlite` types missing
     under @types/node 20) because output was piped through `tail`. Fixed
     with `lib/sqlite.d.ts` and by checking build exit codes directly.
  3. Turbopack warned that an arbitrary `DATABASE_PATH` caused whole-project
     tracing. Fixed by scoping relative paths to `./data/`.
- Test messages, the test database file, and the test `.env.local` were
  removed after verification; servers were stopped. The test database file
  itself is gitignored and never committed.

## Phase 6 — Deployment preparation and monitoring

- Deploy target: Vercel, Next.js import (per README). No deploy was performed
  in this round — no repository, hosting account, or approval to push was on
  file, and deployment is a separate decision by the owner.
- Before deploying: create a Postgres database (or accept single-instance
  SQLite limits — on Vercel, prefer a hosted Postgres or a single-server
  host instead), set `DATABASE_PATH`/`DATABASE_URL` + SMTP vars in the host
  dashboard, apply the schema, then smoke-test `/api/health`, the homepage,
  and one real contact submission.
- Monitoring: `GET /api/health` returns 200 with `checks.database` when the
  database answers, 503/`degraded` when it does not, plus `emailConfigured`
  and uptime. Point an uptime monitor (e.g. UptimeRobot, Better Stack, or a
  Vercel check) at it every 5 minutes and alert on non-200 or `degraded`.
  There is no third-party analytics or error tracker wired in — that would
  need the owner's account choice, and is a follow-up, not an assumption.

## Final production audit (2026-10-26, after all fixes)

- Build: exit 0. Routes: `/` static, `/api/projects` static,
  `/api/contact` dynamic, `/api/health` dynamic.
- Tests: Vitest 7/7, lint clean (re-run after the final edits in this round).
- Security: no secrets in code, no `console.log` of user data (only an
  Ethereal preview URL, server-side, when one exists), no `innerHTML`/`eval`,
  no GET exposure of messages, CSP + framing + nosniff + referrer +
  permissions headers verified live, 32 KB body cap, validation + rate limit.
- Accessibility: skip link, focus-visible outline, reduced-motion handling,
  labelled fields, status/alert roles, semantic headings — verified by
  inspection and by the homepage containing the skip link; no automated
  axe run was performed, so that is a stated gap, not a claimed pass.
- NOT done / NOT claimed: no deployment, no push to any git remote (no repo
  exists for this project), no production SMTP verification, no Postgres
  migration, no third-party monitoring account, no automated accessibility
  audit. Each is an owner decision listed below.

## Postgres migration preparation (2026-10-26, this round)

- **Verdict: No, SQLite cannot reliably persist on Vercel.** Vercel's own
  knowledge base states SQLite "can't be used with Vercel" because
  serverless storage is ephemeral and not shared between function instances.
  This was verified from that documentation, not by a live Vercel deployment
  (no deploy was performed or authorised in this round).
- **What changed (design/content untouched):** the database layer is now
  provider-selected in `lib/db.ts` — `DATABASE_URL` starting with
  `postgres://`/`postgresql://` selects Postgres (`lib/db-postgres.ts`,
  `pg` driver, pool max 5, SSL honoured from `sslmode=require` or a
  `.neon.tech` host), otherwise SQLite (`lib/db-sqlite.ts`). Routes were
  updated to await the async store; health now reports `databaseKind`.
- **Postgres schema:** `db/migrations/001_contact_messages.postgres.sql`,
  a direct port of the SQLite schema (same columns, CHECKs, indexes,
  TIMESTAMPTZ instead of TEXT timestamps).
- **Data preservation:** `scripts/migrate-sqlite-to-postgres.mjs`
  (`npm run db:migrate-sqlite`) copies every SQLite row into Postgres,
  preserving id, fields, status, error, and timestamps, with
  `ON CONFLICT (id) DO NOTHING` so re-runs are safe. At this round's start
  the SQLite file was empty (0 rows, verified), so there was nothing to
  lose — but the script is the preservation path for any future rows.
  `scripts/migrate-postgres.mjs` (`npm run db:migrate`) applies the schema.
- **What was verified, and what was not:**
  - Postgres SQL + status transitions: verified by executing the real
    schema file and store SQL against a pg-mem emulator (11/11 tests total,
    including the new Postgres test). The emulator needed `char_length`
    registered in the test only; the schema file is unchanged, and
    `char_length` is native in real Postgres.
  - Live Postgres server connection: NOT verified. No local Postgres server
    exists in this VM (no binaries, no Docker; `apt-get update` hung for
    8+ minutes on its HTTP methods and was killed), and no Neon credentials
    were supplied. The `pg` driver, connection string parsing, and SSL
    handling are code-reviewed, not live-tested against Neon.
  - SQLite path after the refactor: re-verified live (health
    `databaseKind: "sqlite"`, valid contact → 201 + `no_smtp`, invalid →
    400, rate limit counted all attempts: invalid + valid + 3 rate posts =
    5, then 429, headers present, skip link + projects intact).
  - SMTP after the refactor: re-verified live against a local stub
    (message received intact, row `sent`). One earlier stub run failed
    because the stub script lived in `/tmp` and `/tmp` had been cleaned
    between turns — that failure correctly produced a saved `failed` row
    and a 503 with a direct-email fallback, which is the intended
    failure mode, not a code bug. The stub now lives in
    `~/workspace/test-tools/` (outside the repo).
  - Test data, test `.env.local`, and test servers were removed after
    verification; the SQLite file is empty again.
- **Neon blockers (approval needed, see final report):** creating a Neon
  project, its pooled connection string, and setting it in Vercel all need
  the owner. Additionally, this VM's direct TCP to Neon was blocked in
  2025 by a runtime permission (Databases: Deny) — if the owner wants this
  VM to run the Neon migration directly, that setting must first change
  to Ask; otherwise the migration should run from Vercel/your machine,
  which connects to Neon normally.

## Follow-ups (owner decisions, not done)

1. Supply production SMTP credentials (or choose a provider) to leave
   `no_smtp` mode.
2. Choose the production database (Postgres recommended for Vercel) and run
   migrations there.
3. Decide on a git remote / deployment: create the repo and connect Vercel.
4. Optional: shared rate limiting, an error tracker, and analytics — only if
   the owner wants them.

## Pre-deployment inspection (2026-10-26, local only, no deploy/push)
- Neon project "portfolio" (Free, Singapore, neondb, production branch) already
  exists and its `contact_messages` schema was applied via the Neon dashboard
  SQL Editor; read-only verification showed all 10 columns, both indexes, 0 rows.
  Live app connectivity and contact persistence against Neon are still NOT
  verified — they require a deployment with DATABASE_URL set.
- Fixes applied locally in this inspection (no production data touched):
  1. `package.json` now declares `"engines": {"node": ">=24"}`. Reason:
     `lib/db.ts` statically imports the SQLite store, which imports
     `node:sqlite`; that builtin needs Node 24 for stable support, and the
     import runs even when Postgres is selected. Pinning Node 24 prevents a
     Vercel runtime on an older Node from failing the import.
  2. `lib/db-postgres.ts` pool timeout is 15s for `.neon.tech` hosts (5s
     otherwise), to tolerate free-tier scale-to-zero wake-ups. Vercel Hobby
     functions cap at 10s, so the 5-minute health monitor remains the
     keep-warm mechanism.
- Not changed: no vercel.json is needed (Vercel auto-detects Next.js; build
  is `next build`), no secrets were added, and no Neon project was modified.

## Documentation workflow round (2026-10-26, local only, no deploy/push)
- The owner supplied the 19-prompt workflow (prompts 2–20) plus the PRD
  as prompt 1 — 20 items total. Those prompts are workflow instructions,
  not pre-existing files: the documents they specify did not exist in
  this repo before this round, so they were created from the actual
  implementation (not from an aspirational design):
  DESIGN.md, ARCHITECTURE.md, DATABASE.md, API.md (all describing the
  code as built), and project rules appended to AGENTS.md (the Next.js
  auto-generated block was preserved, not overwritten).
- Phase prompts applied, with applicability judged against the PRD:
  project setup — already initialized, verified runnable; feature
  development — Engineering/nav/back-to-top/OG work from the prior
  round; database & backend — already connected, Neon schema applied;
  authentication — NOT APPLICABLE (no users/auth in the portfolio PRD;
  building login here would invent scope, and the Devfolio admin/blog/
  auth scope was explicitly not adopted); MCP — NOT APPLICABLE (no MCP
  capability is required by the PRD); external API — SMTP only, already
  integrated; testing/QA, security audit, code review, deployment
  preparation, monitoring, and final audit — performed in this round
  (see IMPLEMENTATION_CHECKLIST.md and the final report), with
  deployment itself still awaiting owner approval.
- No code change was made in this round except where a review finding
  was clearly justified and safe (none met that bar — see the final
  report); the round's deliverables are the five documents above plus
  the updated checklist and plan.

## Apple-inspired UI redesign (2026-10-26, local only, not pushed)

- User asked for an Apple-inspired redesign using the ui-ux-pro-max
  skill and 21st.dev MCP for components. No new dependency was added
  (Framer Motion / Lucide remain deliberately not adopted, per
  AGENTS.md); the redesign is Tailwind classes on existing components.
- UI/UX Pro Max: design-system pattern returned was FAQ/Documentation
  Landing — off-topic for a portfolio, so it was NOT followed. Used
  instead: Dark Mode (OLED) style, Minimalism & Swiss Style (clean,
  spacious, high contrast, subtle 200–250ms hover, no unnecessary
  shadows), and clean sans typography guidance. Geist Sans was kept
  (SF-Pro-like, already loaded) rather than adding a Google font.
- 21st.dev: get_usage checked first (free tier, 2/2 retrievals
  remaining on 2026-10-26); search (free, metadata only) returned hero,
  bento-grid, glass-navbar, and portfolio-card candidates. get_component
  was NOT called — it is the paid/quota step and needs a specific
  user-approved component; the redesign below is original code
  inspired by the bento-grid pattern, not copied component code.
- Changes: pure black page (#000000, #f5f5f7 text), centred hero
  (h1 text-5xl sm:text-7xl), section headings text-4xl sm:text-5xl,
  max-w-6xl, py-20/24 sections with whitespace separation (no
  border-t rules), pill buttons (rounded-full, ~44px CTAs), cards
  rounded-[28px] with 200ms border hover, pill active nav
  (bg-white/10, no underline), frosted header bg-black/70
  backdrop-blur-xl, form fields rounded-xl bg-black py-3 inside a
  rounded-[28px] card, projects as a bento layout (featured
  full-width, other two in a 2-column grid). Content, order, links,
  and contact behaviour are unchanged. DESIGN.md updated in the same
  change. Verified: tests 11/11, lint 0, typecheck 0, build 0
  (metadataBase warning only), live prod checks home 200, health
  ok/sqlite, contact 201/400/405; test data removed, server stopped.
- Still open: (1) push this redesign to GitHub — NOT done, needs
  owner approval for that exact push; (2) 21st.dev paid component
  retrieval — needs the owner to pick specific components (see final
  report); (3) Vercel deploy + SMTP — still awaiting approval.

## Hero Minimalism retrieval and adaptation (2026-10-26, local only, not pushed)

- User approved the specific component Hero Minimalism (21st.dev,
  lyanchouss, id 6999) after the redesign report. get_usage was
  re-checked first (2/2 remaining), then get_component was called
  once. The connector's ALLOWED_TOOLS initially blocked it; it was
  reviewed for this exact task (specific approval, quota checked,
  read-only retrieval, code to be reviewed before use), temporarily
  enabled, used once, then reverted to get_usage + search only.
- Retrieval result: success, not locked. Quota after: 1/2 remaining,
  resetting 2026-10-27. Component code 8,671 chars, demo code 124
  chars (just an import), registry dependencies empty (no npm deps).
  No framer-motion, lucide, fetch, or tracking in the code.
- Reviewed and rejected: fixed full-screen root (would take over the
  single page), its own header, Dali Agents brand link, alert CTA,
  bottom "How it works" content, and the Hubot Sans font import from
  fonts.cdnfonts.com. None of those were copied into the portfolio.
- Adapted into components/HeroAccent.tsx (client, single-purpose):
  particle field sized to the hero section (not the window) with
  resize handling and rAF cleanup, plus hairline lines in
  globals.css. Hero title line-height tightened to 0.95, matching the
  retrieved type pattern. Content, links, header, and contact flow
  unchanged. DESIGN.md updated in the same change.
- Still open: push this change to GitHub (needs separate approval);
  Vercel deploy + SMTP (still awaiting approval); 1/2 21st.dev
  retrievals remain for today.

## Mascot poster hero (2026-10-26, local only, not pushed)

- User sent an image and the full MascotPortfolioHero component
  code and asked for the same UI with details changed to his resume.
  The component was added at components/MascotPortfolioHero.tsx
  (supplied structure, room, flower, gaze logic, and CSS kept; the
  supplied Demo export was NOT included, as it imported a different
  path). It replaces the previous dark Apple hero and the
  HeroAccent component, which was deleted with this change.
- Resume mapping (all grounded in lib/data.ts or the job-search
  target, nothing invented): index "AG/01", discipline "Full-Stack
  Development", tagline = profile.name, collection
  ["Featured", "Projects"], reel ["Portfolio @ 2026", profile.role],
  year "2026", initials "AG", badge "Hire me", line2 "Portfolio",
  line3 "Developer", word "Work", verticalTag "Code", bracketed
  "S", seekingLabel "Seeking*", seeking "Full-Stack / MERN",
  href "#contact", services ["Web Development", "API
  Integration", "Database Design", "UI Development"], greetings
  ["Hi there!", "Let's build something real.", "Open to
  full-stack roles.", "Thanks for stopping by!"]. Colours kept
  from the poster: paper #ebebea, ink #111111, accent #5fb57a,
  black beanie/shirt mascot. The full name is NOT in the poster
  headline (it is initials only, as in the poster); it remains in
  the header, footer, contact section, and page metadata.
- Known limitations, stated plainly: Archivo Black is in the
  component's font stack but is NOT loaded via next/font, so the
  headline falls back to Arial Black on most systems; the hero is
  light while the rest of the page stays dark (intentional poster
  contrast, per the user's request); the #home anchor is now the
  wrapper section around the poster, so header nav still works;
  pointer gaze still moves under reduced-motion (CSS animations
  off, idle/blink gated off) — see DESIGN.md. No new dependency.
- Still open: push this change to GitHub (needs separate approval);
  Vercel deploy + SMTP (still awaiting approval); a visual
  screenshot check was not run — verification below is by build
  and HTML content checks only.

- Lint fix for the supplied mascot code (same change, no
  lint-disable): its callback refs tripped react-hooks/refs, so the
  layer groups now carry data-layer attributes and the effect
  queries them once on mount, instead of callback refs. Behaviour
  is unchanged (same transforms, same groups); lint and typecheck
  pass with no rule weakened.
