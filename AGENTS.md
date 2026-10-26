<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- Project rules (portfolio-fullstack). The Next.js block above is
     auto-generated and must be preserved; the rules below are the
     project's own coding rules, per PRD.md, DESIGN.md, ARCHITECTURE.md,
     DATABASE.md, and API.md. -->

# Project coding rules — portfolio-fullstack

## Inspect before changing
- Read the relevant existing code, DESIGN.md, ARCHITECTURE.md,
  DATABASE.md, and API.md before changing anything. Do not rewrite
  from training-data assumptions about Next.js — this is Next.js 16
  with cacheComponents, and its rules (e.g. `await connection()`
  instead of the old `dynamic` export, no `new Date()` during
  prerendering) have already bitten this project twice.
- Follow the project documents over generic advice. Where code and
  docs disagree, fix the code and update the doc in the same change.

## Code quality and naming
- TypeScript strict, no `any` for new code, no unused imports or
  variables (lint enforces this). Prefer the existing patterns:
  server components by default, client components only for
  interactivity, `lib/` for shared logic, route handlers for APIs.
- Names describe what a thing is, not what it was called elsewhere:
  `ContactStore`, `insertContactMessage`, `emailStatus` — not
  generic `data`, `handle`, or `process`.

## Project / folder structure
- See ARCHITECTURE.md §4. New code goes where its kind already
  lives. Do not create a second data source, a second contact
  implementation, or a second place for the same kind of file.
- `lib/data.ts` is the single source of truth for page content.
  Never duplicate resume content in a component or a route.

## Component reuse
- Reuse `Chip`, the card pattern, the button patterns, and the
  header/footer components in DESIGN.md. Do not invent a second
  card, button, or chip style for one section.
- Client components stay small and single-purpose (`SiteHeader`,
  `BackToTop`, `FooterYear`, `ContactForm`). Do not turn the page
  into a client component to avoid a server-component rule.

## Dependency management
- No new dependency without a real, stated need that existing code
  cannot meet. Framer Motion, Lucide, ORMs, auth libraries, and
  analytics SDKs were all considered and deliberately not adopted
  (see ARCHITECTURE.md §1). Adding one reopens that decision and
  must be justified in the change, not assumed.
- Pin the runtime: `package.json` declares Node >= 24 (see
  ARCHITECTURE.md §1). Do not loosen it without checking that
  `node:sqlite` still imports on the target runtime.

## Type safety
- Run `npm run typecheck` before claiming a change is complete.
  A build that was piped through `tail` once hid a real type error
  in this project — always check the exit code directly, never
  through a pipe that masks it.

## Error handling
- Never swallow an error, never claim success on failure, never
  weaken validation or remove a test to make a check pass.
- Server errors return generic, actionable messages (see API.md);
  never a stack trace, never a secret, never database internals.
- The contact flow is the model: save first, then attempt the
  fallible step (email), and record the outcome honestly.

## Security and secrets
- No secret in code, docs, logs, build output, or error messages.
  No `NEXT_PUBLIC_` variable. Secrets live only in environment
  variables (Vercel dashboard in production, gitignored `.env.local`
  locally). `.env.example` holds placeholders only.
- Never expose messages, emails, or raw IPs through an endpoint.
  IP addresses are stored only as SHA-256 hashes.
- All user input is validated server-side and rendered through
  React (escaped) or sent as text-only email. No `innerHTML`,
  no `eval`, no string-built SQL — queries are parameterised.

## Database / API access
- All database access goes through the `ContactStore` interface.
  Routes never import `pg` or `node:sqlite` directly.
- Schema changes need a new migration file (never an in-place edit
  to `001_*`), plus updates to both schema files, `db-types.ts`,
  both stores, DATABASE.md, and API.md if the contract changes.
- Never add a listing endpoint for messages without a separate,
  approved auth design. Never modify production data (Neon) except
  through an approved migration; the dashboard SQL Editor path is
  for schema only, not for editing rows.

## Testing
- Add or update a test with every behaviour change: Vitest for
  validation, rate limiting, provider selection, and store SQL
  (pg-mem for Postgres). Live production-build checks (health,
  contact valid/invalid, contact GET, headers, homepage content)
  are the verification for UI/route changes — run them at
  milestones and at the end, not after every tiny change, and
  remove test data afterwards.
- Do not mark a requirement complete unless its implementation is
  actually present and verified by a test, a build, or a live check.
  A plan, a summary, or code that merely exists is not verification.

## Documentation
- Keep DESIGN.md, ARCHITECTURE.md, DATABASE.md, API.md, README.md,
  IMPLEMENTATION_PLAN.md, and IMPLEMENTATION_CHECKLIST.md in sync
  with the code in the same change. A doc that describes a feature
  that was removed, or omits one that was added, is a bug.
- Honest limitations are documentation, not embarrassment: state
  what is not verified, not built, or blocked, plainly, with the
  next step — never claim a pass that was not measured.

## Git / change discipline
- This project is not currently a git repository. Do not push,
  deploy, or make a paid change without the owner's explicit
  approval for that exact action.
- Keep changes focused: one task, one set of files, no unrelated
  refactors, no drive-by rewrites of working code for style.
  Preserve existing design, resume content, verified links, and
  working features in every change.
