# Abhishek Kumar Gautam — Full-Stack Portfolio

A professional portfolio web application built with Next.js 16, React 19,
TypeScript, and Tailwind CSS 4. Content comes from the resume in
`~/workspace/user/files/Abhishek_Gautam_Resume.pdf` — see `lib/data.ts`,
the single source of truth. No invented metrics, URLs, or achievements.
Design and verified content are unchanged from the 2026-10-26 build; this
round replaced the backend storage and added email, security, tests, and
deployment preparation. See `IMPLEMENTATION_PLAN.md` for the full plan.

## What makes it full-stack

- **Frontend:** App Router pages for Hero, About, Skills, Projects,
  Achievements & Certifications, and Contact — dark premium theme, responsive,
  with a skip-to-content link, visible keyboard focus, and reduced-motion support.
- **Backend API routes:**
  - `GET /api/projects` — returns the 3 resume projects as JSON.
  - `POST /api/contact` — validates name (2–100 chars), email, and message
    (10–2000 chars), rate-limits to 5/minute per IP, rejects bodies over
    32 KB, and saves the message to the configured database (see below).
    There is no GET endpoint that exposes messages, and the SQLite
    database file is gitignored.
  - `GET /api/health` — dynamic monitoring endpoint: 200 with
    `checks.database` when the database answers, 503/`degraded` when it does
    not, plus `emailConfigured` and live uptime.
- **Email delivery:** `lib/email.ts` sends contact messages via SMTP
  (nodemailer, text-only body, `replyTo` set to the sender). Configure it in
  `.env.local` or your host dashboard — see `.env.example`. If SMTP is not
  configured, messages are saved with status `no_smtp` and the form says so
  honestly; if sending fails, the row is marked `failed` and the form returns
  503 with a direct-email fallback. It never claims an email was sent when
  it was not.
- **Resume download:** `public/Abhishek-Gautam-Resume.pdf`, linked from the
  nav, hero, and About sections.

## Database: SQLite locally, Postgres on Vercel

- **Local / single server:** SQLite via Node's built-in `node:sqlite`
  (`DATABASE_PATH`, default `data/portfolio.db`).
- **Vercel production:** set `DATABASE_URL` to a Postgres URL and the app
  switches automatically (`lib/db.ts`). SQLite does **not** reliably persist
  on Vercel — Vercel's own knowledge base says SQLite "can't be used with
  Vercel" because serverless storage is ephemeral and not shared between
  function instances. This was verified from that documentation, not by a
  live Vercel deployment (no deploy was performed or authorised).
- **Neon (free tier, recommended):** create a free Neon project, use its
  **pooled** connection string with `sslmode=require`, set it as
  `DATABASE_URL` in Vercel, then run `npm run db:migrate` (applies the
  Postgres schema) and `npm run db:migrate-sqlite` (copies any existing
  SQLite rows, preserving ids and timestamps; re-runs are safe). The Neon
  project itself still needs to be created by the owner — no Neon account,
  credentials, or paid service were created in this round.
- **Existing data at migration time:** the SQLite file was empty (0 rows),
  verified before this round, so there is currently nothing to lose — but
  the migration script above is the preservation path for any future rows.

## Honest limitations

- Only Music & Movies Show has verified public source/demo links
  (github.com/Gautam215/Music-and-Movies-show,
  music-and-movies-show.vercel.app). Campus Connect Portal and Smart Chatbot
  carry no links, rather than placeholders.
- Production email still needs a real SMTP account (see `.env.example`).
  Until one is set, the site runs in honest `no_smtp` mode.
- The rate limiter is per server instance; see `IMPLEMENTATION_PLAN.md`.

## Run locally

```bash
cd ~/workspace/portfolio-fullstack
npm install
cp .env.example .env.local   # fill in SMTP only if you want email delivery
npm run dev      # http://localhost:3000
npm test         # Vitest: validation, rate limiting, IP hashing
npm run lint
npm run build    # production build (verified)
npm run start    # serve the production build
```

## Deploy (Vercel) — preparation, not yet deployed

Push this folder to a GitHub repository, then in Vercel: Add New → Project →
Import the repo. Framework preset: Next.js. Before going live:

1. Create a Neon free-tier project (owner step, needs your approval) and
   set its pooled `DATABASE_URL` (with `sslmode=require`) plus the SMTP
   variables in Vercel → Settings → Environment Variables.
2. Run `npm run db:migrate`, then `npm run db:migrate-sqlite` if any
   SQLite rows exist.
3. Smoke-test `/api/health` (expect 200, `database: "ok"`), the homepage,
   and one real contact submission, then check its database row.
4. Point an uptime monitor at `GET /api/health` every 5 minutes and alert
   on non-200 or `degraded`.

No repository, hosting account, or push approval was on file for this
round, so nothing was pushed or deployed — that is an owner decision.
