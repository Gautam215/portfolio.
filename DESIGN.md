# DESIGN.md — Abhishek Kumar Gautam Portfolio

Single source of truth for this application's visual design and UX.
Source of truth for content: the PRD (`~/workspace/user/files/prd.pdf`)
and the resume (`~/workspace/user/files/Abhishek_Gautam_Resume.pdf`).
This document describes the design as actually built in
`portfolio-fullstack/` — it does not invent a new design system, and it
does not describe features that do not exist.

## Visual direction and design principles

- Dark premium theme only. Apple-inspired minimalism: deep black and
  charcoal surfaces, restrained glassmorphism in the header only, subtle
  borders, soft shadows, controlled gradients.
- Professional, not flashy: no gaming-style glow, no decorative
  illustration, no custom cursor (PRD marks it optional; it was skipped
  for accessibility, as in the static site).
- Usability over decoration: every control does a real thing, every
  link goes to a real destination, no placeholder interaction.
- Consistency over novelty: one card style, one chip style, one button
  hierarchy, reused everywhere. No one-off styling per section.
- Content is the design: grouped skill chips (never proficiency bars —
  the PRD allows bars only with a verified basis, which does not exist),
  project details shown inline, verified links only.

## Colors

All colors are Tailwind zinc/indigo tokens, as used in the code:

| Role | Token | Use |
|---|---|---|
| Page background | `zinc-950` (#09090b) | Body, header backdrop base |
| Card background | `zinc-900` | Project, skill, education, achievement cards |
| Borders | `zinc-800` | Section dividers, card borders |
| Card hover / button surface | `zinc-800` → `zinc-700` | Secondary buttons, drawer items |
| Primary action | `indigo-500` → `indigo-400` on hover | Explore Projects, Live demo, back-to-top, drawer CTA |
| Primary text | `zinc-100` | Headings, body |
| Secondary text | `zinc-300` | Sub-headings, links, labels |
| Tertiary text | `zinc-400` | Descriptions, dates, notes (raised from zinc-500 for contrast) |
| Muted text | `zinc-500` | Only the "no links listed" note on link-free projects |
| Accent text | `indigo-400` / `indigo-300` | Eyebrow line, email link, active nav underline |
| Success | `emerald-300` on `emerald-950`, `emerald-700` border | Contact success state |
| Error | `red-300` on `red-950`, `red-700` border | Contact error state |
| Focus | `#818cf8` (indigo-400) 2px outline, 2px offset | Global `:focus-visible` |

No other palette is used. Do not introduce new brand colors without
updating this table and every component that uses the old token.

## Typography

- Font: Geist Sans (`--font-geist-sans`) via `next/font/google`, with
  system-ui fallback; Geist Mono is loaded for the mono token but is not
  used for body copy.
- Page title (h1, hero name): `text-4xl sm:text-6xl`, bold,
  `tracking-tight`.
- Section headings (h2): `text-3xl`, bold.
- Card headings (h3): `text-xl` (leadership) / `text-2xl` (projects) /
  default semibold (skills, engineering).
- Body: default size, `leading-relaxed`, zinc-400 for secondary copy.
- Eyebrow/labels: `text-sm`, medium, uppercase, tracking-widest,
  indigo-400 (hero eyebrow only).
- No custom font sizes outside these patterns; use Tailwind scale steps.

## Spacing and layout system

- Content width: `max-w-5xl`, centered (`mx-auto`), horizontal padding
  `px-4`.
- Section padding: `py-14` (content sections), hero `py-16 sm:py-24`.
- Section separation: `border-t border-zinc-800` between sections.
- Gaps: `gap-3` (buttons/links), `gap-4` (grids/cards),
  `gap-10` (contact two-column), `space-y-4` / `space-y-6` (stacks).
- Cards: `rounded-xl`, `border border-zinc-800`, `bg-zinc-900`,
  `p-4` (education) / `p-5` (skills, engineering) / `p-6` (projects,
  leadership).
- Chips: `rounded-full`, `border border-zinc-700`, `bg-zinc-900`,
  `px-3 py-1`, `text-sm`, `text-zinc-200`.
- Buttons: `rounded-lg`, `px-5 py-2.5` (primary actions),
  `px-4 py-2` (project links), `px-3 py-1.5` (header Resume).
- No arbitrary spacing values outside this system without justification.

## Reusable components

- `SiteHeader` (`components/SiteHeader.tsx`, client): sticky header,
  `bg-zinc-950/90 backdrop-blur`, logo mark "AG" + name, desktop nav,
  Resume button, mobile drawer. See Navigation below.
- `BackToTop` (`components/BackToTop.tsx`, client): fixed
  `bottom-6 right-6`, indigo, appears only after 600px of scroll.
- Footer copyright year is the literal current year in the layout
  (2026). A dynamic `new Date()` year was tried and reverted: it
  breaks prerendering under cacheComponents and trips the
  react-hooks/set-state-in-effect lint rule, and the year is not
  worth either failure. Update the literal when the year changes.
- `ContactForm` (`components/ContactForm.tsx`, client): labelled name /
  email / message fields, submit button, status/error boxes, honest
  footnote. See Forms below.
- `Chip` (local to `app/page.tsx`): skill/stack chip, as specified above.
- Project card, skill card, engineering card, education card, and
  certification row are all the same card pattern with different content
  — do not invent a second card style.

## Navigation and forms

### Navigation

- Desktop: Home, About, Skills, Projects, Achievements, Contact
  (the PRD §A list, in that order). The Engineering Mindset section
  exists on the page but is deliberately not a nav link, matching the
  static site and the PRD nav list.
- Logo / name click goes to `#home`. Resume button downloads
  `/Abhishek-Gautam-Resume.pdf`.
- Active-section indicator: the nav link for the section nearest the
  top of the viewport gets `aria-current="true"`, white text, medium
  weight, and an indigo underline. Implemented with
  IntersectionObserver (`rootMargin: "-40% 0px -55% 0px"`); the
  Engineering section is observed too, so scrolling through it does not
  leave a stale active link.
- Mobile (below `md`): a Menu button (`aria-expanded`,
  `aria-controls="mobile-drawer"`, label "Open menu"/"Close menu") opens
  a drawer with the same six links plus a Download Resume CTA. Escape
  closes it; choosing a link closes it.
- All nav links are plain anchors to section ids (`#home`, `#about`,
  `#skills`, `#projects`, `#engineering`, `#achievements`, `#contact`).
  Every id exists on the page; there are no dead anchors.

### Forms

- One form only: the contact form. Fields: Name (required, 2–100
  chars), Email (required, `type="email"`), Message (required, 10–2000
  chars, 5 rows). `autoComplete="name"` / `"email"`; labels are
  associated by `htmlFor`/`id`.
- Field style: full width, `rounded-lg`, `border-zinc-700`,
  `bg-zinc-900`, `px-3 py-2`, white text, zinc-500 placeholder,
  indigo-400 border on focus.
- Submit: indigo button, disabled with 50% opacity and label
  "Sending…" while a request is in flight. Duplicate submits are
  therefore not possible from the button.
- Success: emerald box, `role="status"`, with the server's message
  verbatim; fields are cleared only on success.
- Error: red box, `role="alert"`, with the server's error verbatim
  (or a generic fallback if the response is not JSON / unreachable).
- Footnote (zinc-400, `text-xs`): messages are saved to the database
  and emailed when delivery is configured; direct email is faster.
  The form never claims an email was sent when it was not.

## Loading, empty, and error states

- Contact form: sending (disabled button), success, error — see Forms.
- Projects, skills, achievements, certifications: rendered from
  `lib/data.ts` at build time, so there is no loading or empty state
  to show; they are never empty in practice (3 projects, 6
  certifications, 7 skill groups are all present in the data).
- Link-free projects (Campus Connect Portal, Smart Chatbot): the card
  shows the sentence "Live demo and public repository links aren't
  listed for this project." instead of a dead button. This is an
  honest empty state, not a placeholder link.
- Health endpoint: `ok` vs `degraded` (see API.md). The page itself
  has no health-dependent UI, so a database outage surfaces only as a
  contact-form error (500/503 with a direct-email fallback), never as
  a broken page.
- No spinners, skeletons, or toasts exist anywhere else. Do not add
  them without a real asynchronous UI that needs one.

## Interactions and animations

- Smooth scrolling (`scroll-behavior: smooth`) for anchor navigation.
- Animated background: a fixed, non-interactive layer with two radial
  indigo gradients at 8–9% opacity, drifting slowly
  (`background-drift`, 28s, alternate). It sits behind content
  (`z-0`; header, main, and footer are `relative z-[1]` / `z-10`).
- Hover: primary buttons indigo-500 → indigo-400; secondary buttons
  zinc-800 → zinc-700; links zinc-300 → white; project links follow
  the same two patterns. Nothing else animates on hover.
- No reveal-on-scroll animations, no custom cursor, no parallax. The
  static site had reveal classes; the full-stack app deliberately
  does not reintroduce them (they add motion without function).
- Reduced motion: `prefers-reduced-motion: reduce` disables smooth
  scrolling and the background animation, and back-to-top scrolls
  instantly. The animated background is also fully static in that mode.

## Responsive behavior

- Breakpoints are Tailwind defaults: `sm` (640px), `md` (768px),
  `lg` (1024px).
- Header: full name hidden below `sm` (shows "AG"); desktop nav
  hidden below `md` (drawer instead); Resume button hidden below
  `sm` in the header (present in the drawer and hero instead).
- Hero heading: `text-4xl` → `sm:text-6xl`.
- Skill/engineering grids: 1 column → `sm:grid-cols-2` →
  `lg:grid-cols-3`.
- Contact: 1 column → `md:grid-cols-2` (info + form).
- Footer: wraps (`flex-wrap`) with name and links stacking on narrow
  screens.
- No horizontal scrolling at 390px (mobile drawer width) or at desktop
  widths; cards and chips wrap (`flex-wrap`).

## Accessibility requirements

- Skip link: "Skip to main content", visually hidden until keyboard
  focus, targets `#main`.
- One h1 (hero name); h2 per section; h3 per card. No skipped levels.
- Global `:focus-visible` outline (2px indigo-400, 2px offset) on
  every focusable element, not just form fields.
- Icon-only / compact controls carry accessible names: Menu button
  ("Open menu"/"Close menu"), back-to-top ("Back to top"), drawer
  (`aria-label="Mobile"`), nav (`aria-label="Primary"`).
- Active nav link uses `aria-current="true"`; drawer open state uses
  `aria-expanded` + `aria-controls`.
- Form fields are labelled; feedback uses `role="status"` (success)
  and `role="alert"` (error).
- External links use `rel="noopener noreferrer"` and `target="_blank"`.
- Contrast: secondary text is zinc-400 minimum for body copy; the
  contact footnote is zinc-400, `text-xs`, and is informational only.
- Reduced motion: see Interactions above.
- Automated axe audit: not yet run — a stated verification gap, never
  claimed as passed (see IMPLEMENTATION_CHECKLIST.md).

## Page-level layout guidance

Order on the single page, top to bottom (do not reorder without a
PRD-level reason):

1. Header (sticky, SiteHeader)
2. Hero (`#home`): eyebrow (role + location), h1 name, PRD headline,
   summary, Explore Projects / Download Resume / Contact Me, GitHub +
   LinkedIn links
3. About (`#about`): intro, Education, Languages
4. Technical Skills (`#skills`): grouped cards, no proficiency bars
5. Featured Projects (`#projects`): Music & Movies Show first and
   most prominent, then Campus Connect Portal, then Smart Chatbot
6. Engineering Mindset (`#engineering`): six practice cards
7. Achievements & Certifications (`#achievements`): leadership
   spotlight, then certification rows with dates
8. Contact (`#contact`): info column (seeking text, email, GitHub,
   LinkedIn) + form column
9. Footer: copyright year, GitHub / LinkedIn / Email links
10. Back-to-top button (fixed, appears on scroll)

New sections go after Projects and before Achievements only if they
are PRD sections; marketing or decorative sections do not belong here.
