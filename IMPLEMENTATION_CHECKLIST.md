# Implementation Checklist — Portfolio (single source)

Source documents read in full for this checklist (the spec set actually
present in this workspace — see the note at the end about the document count):
1. `~/workspace/user/files/prd.pdf` — Portfolio PRD (the authoritative spec)
2. `~/workspace/user/files/Abhishek_Gautam_Resume.pdf` — content source of truth
3. `~/workspace/portfolio/REQUIREMENTS.md` — PRD checklist for the static site
4. `~/workspace/portfolio/README.md` — static site docs + honest limitations
5. `~/workspace/portfolio-fullstack/README.md` — full-stack app docs
6. `~/workspace/portfolio-fullstack/IMPLEMENTATION_PLAN.md` — phases, fixes, follow-ups

Status key: DONE = implemented in `portfolio-fullstack/` and verified by a
test, a build, or a live server check in this round. PARTIAL = present but
with a documented gap. TODO = not yet implemented. BLOCKED = needs an owner
decision, credential, or external approval — never silently worked around.
No requirement is marked DONE on the basis of a plan or a summary alone.

## PRD §3 — Sections
- [x] A. Navigation — glassmorphism sticky header, logo → Home, links
  Home/About/Skills/Projects/Achievements/Contact, active-section indicator
  (IntersectionObserver), mobile drawer, Resume download button.
  Implemented in `components/SiteHeader.tsx`.
- [x] B. Hero — name, PRD headline verbatim, full-stack intro, buttons
  Explore Projects / Download Resume / Contact Me, GitHub + LinkedIn links.
- [x] C. About Me — CS graduate intro, full-stack/API/database focus,
  education, languages, all from the resume.
- [x] D. Technical Skills — grouped categories, no proficiency bars
  (PRD: bars only with a verified basis, which does not exist).
- [x] E. Featured Projects — Music & Movies Show prominent with verified
  source + live demo links; Campus Connect Portal and Smart Chatbot with no
  links (none publicly verified — placeholders forbidden). Project details
  are shown inline on each card, plus working source/demo links where they
  exist. No screenshots and no architecture diagram: none verified, so none
  invented (documented limitation from the static site, carried over).
- [x] F. Engineering Mindset — dedicated section with six practices, each
  tied to real project work: component architecture, API integrations +
  error handling, authentication + sessions, database design, testing +
  CI/CD, performance + accessibility. Implemented in `app/page.tsx`
  (`#engineering`), wording grounded in the resume and the static site's
  verified section.
- [x] G. Achievements & Certifications — Tryst '23 IIT Delhi Campus
  Ambassador, Rank #1 nationwide, plus all 6 resume certifications with dates.
- [x] H. Contact — email link, GitHub link, LinkedIn link, plus a real
  contact form (PRD allows it when backend + validation are secure):
  validation, rate limit, body cap, database persistence, honest email
  statuses. See Backend below.
- [x] I. Footer — name + copyright year (literal current year; a dynamic year was tried and reverted — see verification log), GitHub +
  LinkedIn + email links, working back-to-top button
  (`components/BackToTop.tsx`).

## PRD §2 + §4 — Design and UI features
- [x] Dark premium theme only, Apple-inspired minimalism, restrained
  glassmorphism, deep charcoal, subtle borders/gradients, whitespace.
- [x] Subtle animated background gradient (low opacity, fixed layer,
  disabled under `prefers-reduced-motion`).
- [x] Restrained hover effects.
- [ ] Custom cursor — NOT implemented, deliberately: PRD marks it optional
  and only with accessibility care; skipped, as in the static site.
- [x] Scroll-aware navigation (active indicator, see §A).
- [x] Smooth section transitions (smooth scrolling, disabled under
  reduced-motion).
- [x] Reduced-motion support (scroll, animated background).
- [x] Loading and error states where needed: contact form sending /
  success / error states with `role="status"` / `role="alert"`.

## PRD §5 — Tech stack
- [x] Next.js 16, React 19, TypeScript, Tailwind CSS 4.
- [ ] Framer Motion / Lucide React — NOT adopted as dependencies. The
  recommended animations and icons are done natively (CSS + React) with no
  new dependency, per the no-unnecessary-dependencies preference. This is a
  deliberate deviation from a recommendation, not from a requirement.
- [ ] Vercel deployment + GitHub repository — BLOCKED (owner approval).

## PRD §6 — Performance, SEO, accessibility
- [x] Semantic HTML, one h1, h2 per section, `lang="en"`.
- [x] Optimized fonts via `next/font` (Geist).
- [x] SEO metadata + Open Graph tags, including the OG cover image
  (`public/og-cover.svg`, carried over from the static site).
- [x] Keyboard navigation, visible `:focus-visible` outline, skip link,
  accessible names on icon-only controls.
- [x] Readable contrast (contact note raised to zinc-400 in an earlier round).
- [x] Production build + TypeScript checks (run at milestones, see below).
- [ ] Measured Lighthouse/performance results — NOT claimed. PRD says show
  them only when measured; no measurement tool was run, so none is reported.

## PRD §7 — Acceptance criteria
- [x] Every button/link performs its real action; no dead buttons, fake
  links, or placeholder interactions (verified by live server checks).
- [x] Resume download works (bundled PDF, linked from nav, hero, and
  contact area via nav/hero).
- [x] GitHub, LinkedIn, email, and verified project links go to their
  real destinations (`target="_blank"`, `rel="noopener noreferrer"`).
- [x] Responsive layouts (Tailwind breakpoints; mobile drawer at small widths).
- [x] Keyboard navigation + reduced-motion preferences respected.
- [x] Production build + relevant tests pass (see verification log below).
- [ ] Live-site verification after deployment — BLOCKED (no deployment yet).

## Backend / database (IMPLEMENTATION_PLAN phases 1–3, 6)
- [x] Contact persistence in a real database, not a JSON file: SQLite
  locally (`node:sqlite`), Postgres on Vercel when `DATABASE_URL` is set.
- [x] Neon Postgres schema applied (portfolio project, `neondb`,
  production branch) via the dashboard SQL Editor; table, 10 columns, both
  indexes, 0 rows at apply time. CHECK constraints were in the executed
  SQL but not separately listed by the verification output.
- [x] `GET /api/projects`, `POST /api/contact`, `GET /api/health`
  (dynamic, 200/503 with `databaseKind` + `emailConfigured`).
- [x] SMTP via nodemailer, text-only body, reply-to = sender, honest
  `sent` / `failed` / `no_smtp` states recorded in the database.
- [x] Security headers (CSP `'self'`, frame DENY, nosniff, referrer,
  permissions policy), 32 KB body cap, no GET exposure of messages,
  no secrets in code, `.env*` and `*.db` gitignored.
- [ ] Production SMTP credentials — BLOCKED (owner must supply).
- [ ] Shared (multi-instance) rate limiting — TODO, optional follow-up
  only: the per-instance limiter is sufficient for a single server and
  the PRD does not require a shared store. Requires a shared store
  (DB/Redis) if traffic grows; not silently assumed away.
- [ ] Third-party monitoring account / error tracker / analytics —
  TODO, optional, owner account choice only. The health endpoint itself
  is ready to be monitored every 5 minutes.
- [ ] Automated accessibility (axe) audit — TODO, verification gap only,
  not a feature gap; never claimed as passed.

## Verification log (this implementation round, 2026-10-26)
- Tests: 11/11 passed. Lint: exit 0. TypeScript: exit 0.
- Production build: exit 0 after two fixes found by the build itself
  (see below). Routes: `/` static, `/api/contact` + `/api/health`
  dynamic, `/api/projects` static. One non-fatal warning remains:
  `metadataBase` is unset, so OG images resolve against localhost until
  a real deployed URL exists — that value must not be invented, so it is
  left unset until deployment.
- Build failures fixed in the prior round (not hidden): `new Date()` in
  the server layout, and then in a client component, both broke
  prerendering under cacheComponents. The dynamic-year component was
  reverted in this round because it also trips the
  react-hooks/set-state-in-effect lint rule; the footer now uses the
  literal current year (2026), which is build- and lint-safe. A
  lint-disable comment was deliberately NOT used to hide this.
- Live production-build checks (server stopped afterwards): homepage
  contains `#engineering`, Engineering Mindset, all section ids, the
  mobile Menu button, the animated-background layer, and the PRD-exact
  hero headline; OG image returns 200 `image/svg+xml`; health 200 with
  `databaseKind: "sqlite"`; valid contact 201 (`no_smtp`, row verified
  in the local database); invalid contact 400; contact GET 405;
  security headers present. Back-to-top and the active-section
  indicator are client-side (scroll/observer) and were verified by code
  and build, not by the static HTML fetch, which cannot scroll.
- Test data removed afterwards; local SQLite file left empty; no
  `.env.local` created.

## Note on the document count — resolved 2026-10-26
The request described "19 Markdown files plus the PRD (20 documents
total)". The owner then supplied those 19 items: they are prompt
templates numbered 2–20 (DESIGN, ARCHITECTURE, DATABASE, API, AGENTS,
implementation planning, setup, feature development, database/backend,
authentication, MCP, external API, testing/QA, debugging, security
audit, code review, deployment, monitoring, final audit), with the
PRD as item 1. They were not pre-existing files in this workspace.
They were executed as a workflow in this round: DESIGN.md,
ARCHITECTURE.md, DATABASE.md, API.md were created from the actual
implementation, project rules were appended to AGENTS.md, and the
phase prompts were applied with applicability judged against the
PRD — authentication and MCP are NOT APPLICABLE to this app (see
ARCHITECTURE.md §6 and §9), external API means SMTP only, and
deployment/monitoring remain preparation-only pending owner approval.
The six spec documents listed at the top of this checklist remain
the requirements source of truth; the 19 prompts are the process
used to document and verify them, not additional requirements.

## Verification log (documentation workflow round, 2026-10-26)
- Tests: 11/11 passed. Lint: exit 0 (after the footer fix below).
  TypeScript: exit 0. Production build: exit 0; only warning is the
  unset `metadataBase` (needs the real deployed URL, must not be
  invented).
- Security/code-review checks: no `innerHTML`/`eval`/`NEXT_PUBLIC_`,
  no TODO/FIXME, one server-side `console.log` only (Ethereal preview
  URL, no user data); `npm audit` could not run (registry policy
  403 — reported as unverified, not as clean); no auth/upload code in
  the portfolio app itself (cookie/password mentions are descriptive
  text about Music & Movies Show, not code).
- One real fix in this round: lint failed on
  `components/FooterYear.tsx` (`react-hooks/set-state-in-effect`).
  Instead of silencing lint, the dynamic-year component was removed
  and the footer reverted to the literal current year (2026), with
  DESIGN.md, ARCHITECTURE.md, and this checklist updated to match.
  Docs and code are in sync again.
- Live production-build checks after the fix: homepage contains
  `#engineering`, Engineering Mindset, © 2026, and the mobile Menu
  button; health 200 (`databaseKind: "sqlite"`); valid contact 201.
  Server stopped afterwards; test data removed; local SQLite empty.
