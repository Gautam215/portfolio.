# DESIGN.md — Abhishek Kumar Gautam Portfolio

Single source of truth for this application's visual design and UX.
Source of truth for content: the PRD (`~/workspace/user/files/prd.pdf`)
and the resume (`~/workspace/user/files/Abhishek_Gautam_Resume.pdf`).
This document describes the design as actually built in
`portfolio-fullstack/` — it does not invent a new design system, and it
does not describe features that do not exist.

## Visual direction and design principles

- Dark premium theme only. Apple-inspired minimalism (redesign
  2026-10-26): pure black page, large tight type, generous whitespace,
  pill buttons, large-radius cards, frosted header, whitespace instead
  of divider rules between sections. No new dependency was added for
  this redesign; it is Tailwind classes on the existing components.
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
| Page background | black (#000000) | Body; header backdrop base is `black/70` |
| Primary text | `#f5f5f7` (Apple light grey on black) via globals.css; `zinc-100` in Tailwind classes | Body and headings |
| Card background | `zinc-900` | Project, skill, education, achievement cards |
| Borders | `zinc-800` | Card borders, footer top border |
| Card hover / button surface | `zinc-800` → `zinc-700` | Secondary buttons, drawer items, card border on hover |
| Primary action | `indigo-500` → `indigo-400` on hover | Explore Projects, Live demo, back-to-top, drawer CTA |
| Secondary text | `zinc-300` | Sub-headings, links, labels |
| Tertiary text | `zinc-400` | Descriptions, dates, notes (raised from zinc-500 for contrast) |
| Muted text | `zinc-500` | Only the "no links listed" note on link-free projects |
| Accent text | `indigo-400` / `indigo-300` | Eyebrow line, email link; active nav uses a `bg-white/10` pill, not an underline |
| Success | `emerald-300` on `emerald-950`, `emerald-700` border | Contact success state |
| Error | `red-300` on `red-950`, `red-700` border | Contact error state |
| Focus | `#818cf8` (indigo-400) 2px outline, 2px offset | Global `:focus-visible` |

No other palette is used. Do not introduce new brand colors without
updating this table and every component that uses the old token.

## Typography

- Font: Geist Sans (`--font-geist-sans`) via `next/font/google`, with
  system-ui fallback; Geist Mono is loaded for the mono token but is not
  used for body copy.
- Poster hero headline: Archivo Black stack (`"Archivo Black",
  "Arial Black", …`) via the component's own CSS, uppercase,
  tight leading — Archivo Black itself is NOT loaded by next/font
  in this app, so browsers fall back to Arial Black where Archivo
  Black is absent; that fallback is the poster look as shipped, not
  a measured font match.
- Page title (h1, hero name) in the old dark hero was `text-5xl
  sm:text-7xl`, bold, `tracking-tight`, centred. That hero no
  longer exists; the poster h1's accessible name is "2026 AG
  Portfolio Developer Works" and the full name appears in the
  header, footer, contact section, and page metadata.
- Section headings (h2): `text-4xl sm:text-5xl`, bold, `tracking-tight`.
- Project featured title: `text-3xl`; other project titles: `text-2xl`.
- Card headings (h3): `text-xl` (leadership) / `text-2xl` (projects) /
  default semibold (skills, engineering).
- Body: default size, `leading-relaxed`, zinc-400 for secondary copy.
- Eyebrow/labels: `text-sm`, medium, uppercase, tracking-widest,
  indigo-400 (hero eyebrow only).
- No custom font sizes outside these patterns; use Tailwind scale steps.

## Spacing and layout system

- Content width: `max-w-6xl`, centered (`mx-auto`), horizontal padding
  `px-4 sm:px-6`.
- Section padding: `py-20 sm:py-24` (content sections), hero
  `py-24 sm:py-32`.
- Section separation: whitespace only — no `border-t` rules between
  sections (the footer keeps its top border).
- Gaps: `gap-3` (buttons/links), `gap-6` (grids/cards),
  `gap-10` (contact two-column), `space-y-4` / `space-y-6` (stacks).
- Cards: `rounded-[28px]`, `border border-zinc-800`, `bg-zinc-900`,
  `p-6 sm:p-8`, hover `border-zinc-700` over 200ms. The shared `Card`
  helper in `app/page.tsx` is the single card pattern; education and
  leadership use the same radius/border/background directly.
- Chips: `rounded-full`, `border border-zinc-700`, `bg-zinc-800`,
  `px-4 py-1.5`, `text-sm`, `text-zinc-200`.
- Buttons: `rounded-full` everywhere — `px-7 py-3` (hero CTAs),
  `px-5 py-2.5` (project links), `px-6 py-3` (contact submit),
  `px-4 py-2` (header Resume). Minimum touch height is ~44px for
  primary CTAs and drawer links (`py-3`).
- No arbitrary spacing values outside this system without justification.

## Reusable components

- `SiteHeader` (`components/SiteHeader.tsx`, client): sticky header,
  `bg-black/70 backdrop-blur-xl`, white-on-black circular "AG" mark +
  name, pill desktop nav, Resume button, mobile drawer. See Navigation below.
- `BackToTop` (`components/BackToTop.tsx`, client): fixed
  `bottom-6 right-6`, indigo, appears only after 600px of scroll.
- `MascotPortfolioHero` (`components/MascotPortfolioHero.tsx`,
  client, supplied by the owner 2026-10-26, details changed to the
  resume): full-viewport light poster hero — one-point-perspective
  grid room, huge display headline, green seeking pill, services
  row, and an interactive SVG mascot (gaze parallax, blink, click
  greetings). It replaces the previous dark Apple hero and the
  HeroAccent component (deleted with this change). The rest of the
  page stays dark; the poster is deliberately the light first
  section. See Interactions below for the resume mapping.
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
  weight, and a `bg-white/10` pill background (no underline).
  Implemented with
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
- Field style: full width, `rounded-xl`, `border-zinc-800`,
  `bg-black`, `px-4 py-3`, white text, zinc-500 placeholder,
  indigo-400 border on focus. The form sits in a `rounded-[28px]`
  `bg-zinc-900` card so fields read as inset on the card.
- Submit: indigo pill button (`rounded-full px-6 py-3`), disabled with 50% opacity and label
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
- Animated background: a fixed, non-interactive layer with one radial
  indigo gradient at 7% opacity at the top, drifting slowly
  (`background-drift`, 28s, alternate). It sits behind content
  (`z-0`; header, main, and footer are `relative z-[1]` / `z-10`).
- Hover: primary buttons indigo-500 → indigo-400; secondary buttons
  zinc-800 → zinc-700; cards zinc-800 → zinc-700 border; links
  zinc-300 → white; nav pills gain `bg-white/5` (active: `bg-white/10`).
  All hovers are `transition-colors duration-200` (UI/UX Pro Max
  minimalism: 200–250ms). Nothing else animates on hover.
- Poster hero interactions (supplied component, resume details):
  pointer gaze parallax (features move further than the skull,
  nose furthest, ears opposite), blink (150ms, occasional double
  blink), idle look-around after 3.5s without pointer movement,
  click on the character cycles greetings and triggers a happy
  state (closed happy eyes, wider blush, tag wiggle) for 2.2s,
  headline letters lift/rotate and turn green on hover, swash and
  curl lines draw on mount, flower spins (22s) and scales on hover.
  Reduced-motion CSS disables animations/transitions; the JS
  gaze still follows the pointer (small, user-initiated) and the
  idle animation and blink are gated off — that gap is stated
  here, not hidden.
- Hero accent (Hero Minimalism pattern, adapted, not vendored)
  — REMOVED with the poster hero; HeroAccent.tsx was deleted:
  a canvas of small white particles rising and fading (density
  area/7000, `mix-blend-screen`, opacity 0.6, pointer-events none)
  plus 3 horizontal + 3 vertical hairlines drawing in on mount
  (800–900ms, cubic-bezier(.22,.61,.36,1), staggered 150–760ms,
  one-pass shimmer), confined to the hero section. Rejected from
  that component: its fixed full-screen root, its own header, the
  Dali Agents brand/CTA/bottom content, and its Hubot Sans external
  font import — none of those appear here, and no new dependency
  was added (registry dependencies were empty).
- No reveal-on-scroll animations, no custom cursor, no parallax. The
  static site had reveal classes; the full-stack app deliberately
  does not reintroduce them (they add motion without function).
- Reduced motion: `prefers-reduced-motion: reduce` disables smooth
  scrolling and the background animation, and back-to-top scrolls
  instantly. The animated background is also fully static in that mode.
  The hero accent follows the same rule: the particle canvas does
  not animate and the hairlines render statically (the retrieved
  component animated regardless — that was changed here).

## Responsive behavior

- Breakpoints are Tailwind defaults: `sm` (640px), `md` (768px),
  `lg` (1024px).
- Header: full name hidden below `sm` (shows "AG"); desktop nav
  hidden below `md` (drawer instead); Resume button hidden below
  `sm` in the header (present in the drawer and hero instead).
- Hero heading: `text-5xl` → `sm:text-7xl`, centred.
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
2. Hero (`#home`): MascotPortfolioHero poster (light paper, full
   viewport) — top rule (AG/01, Full-Stack Development, full name,
   {Featured/Projects}, Portfolio @ 2026), headline "2026 AG
   PORTFOLIO DEVELOPER WORKS" with Hire me badge, Seeking*
   Full-Stack / MERN pill linking to #contact, services row, and
   the interactive mascot. The old dark hero's summary, Explore
   Projects / Download Resume / Contact Me buttons, and GitHub +
   LinkedIn links are NOT in the poster; name and links remain in
   the header, footer, and contact section, and Resume is in the
   header.
3. About (`#about`): intro, Education, Languages
4. Technical Skills (`#skills`): grouped cards, no proficiency bars
5. Featured Projects (`#projects`): bento layout — Music & Movies Show
   full-width first and most prominent, then Campus Connect Portal
   and Smart Chatbot side by side in a 2-column grid (21st.dev
   bento-grid metadata pattern; no screenshots exist, so cards are
   text-only as before)
6. Engineering Mindset (`#engineering`): six practice cards
7. Achievements & Certifications (`#achievements`): leadership
   spotlight, then certification rows with dates
8. Contact (`#contact`): info column (seeking text, email, GitHub,
   LinkedIn) + form column
9. Footer: copyright year, GitHub / LinkedIn / Email links
10. Back-to-top button (fixed, appears on scroll)

New sections go after Projects and before Achievements only if they
are PRD sections; marketing or decorative sections do not belong here.


## Light Apple-style redesign (2026-10-26)

- Page: #fbfbfd background, #1d1d1f text, #6e6e73 secondary,
  black/10 borders, white cards (rounded-3xl, hover border-black/25).
  No dark cards, no indigo. Strict monochrome except the mascot
  poster, which keeps its own paper/ink/green artwork.
- Header: fixed, floating (inset-x-3/top-3, sm:inset-x-6/top-4),
  max-w-5xl, rounded-full, 1px black/10 border, rgba(251,251,253,
  0.72) background, backdrop-filter blur(20px), centred nav
  (grid 1fr/auto/1fr, px-4/py-2 links), black pill for the active
  section, mobile drawer below the pill.
- Type: system font stack (San Francisco / Inter / Segoe UI, no
  webfont download); body line-height 1.75, letter-spacing 0.01em;
  headings semibold, near-tight; sections max-w-5xl, py-24 /
  sm:py-32, one responsive type scale.
- Sections: About/Education/Certifications as minimal divider
  rows; Skills and project stacks as text tags separated by
  vertical dividers; Projects as a large-type minimalist grid
  (featured full-width, others 2-column) with no imagery, because
  no verified project screenshots exist.
- Motion: scroll reveals via components/Reveal.tsx
  (IntersectionObserver, 600ms, 12px rise, once, reduced-motion
  static, no Framer Motion); all hovers 200ms and gentle.
- Contact form: floating labels, thin black/20 borders turning
  black on focus, white fields, black pill submit.
- Footer: centred, simple text social links, copyright below.
- Known trade-off: the fixed floating header can overlap the
  mascot poster's top rule on small screens; the site name is
  also in the header, so nothing is lost.
