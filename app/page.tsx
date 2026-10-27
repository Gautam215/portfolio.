import ContactForm from "@/components/ContactForm";
import MascotPortfolioHero from "@/components/MascotPortfolioHero";
import Reveal from "@/components/Reveal";
import {
  profile, education, skillGroups, projects, certifications, leadership, languages,
} from "@/lib/data";

// Light Apple-style redesign (2026-10-26): strict monochrome
// palette — page, ink, secondary tokens (globals.css @theme),
// border token, surface cards — generous whitespace, one card
// style, one tag style, and consistent responsive scaling.
// Content, order, and every link are unchanged from before.
// The mascot poster hero is untouched: it keeps its own paper
// (#ebebea), ink, and green accent as supplied artwork.

// One light card style, used by Skills, Projects, and Engineering.
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <article className={`rounded-3xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-border-strong sm:p-8 ${className}`}>
      {children}
    </article>
  );
}

// Grouped text tags separated by thin vertical dividers — no
// badges, no dark chips. Used for skill groups and project stacks.
function TagList({ items }: { items: string[] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden="true" className="h-4 w-px bg-ink/15" />}
          <span>{item}</span>
        </span>
      ))}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-4xl font-semibold tracking-[0.005em] sm:text-5xl">{children}</h2>;
}

function SectionIntro({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 max-w-[70ch] text-lg leading-[1.75] tracking-[0.01em] text-secondary">{children}</p>;
}

export default function Home() {
  const [featured, ...otherProjects] = projects;
  return (
    <div>
      {/* Mascot poster hero, unchanged. The floating header sits
          above it; the poster's own top rule is artwork, and the
          site name also lives in the header, so nothing is lost
          if the header overlaps the poster's top edge on small
          screens. */}
      <section id="home" className="scroll-mt-24">
        <MascotPortfolioHero
          index="AG/01"
          discipline="Full-Stack Development"
          tagline={profile.name}
          collection={["Featured", "Projects"]}
          reel={["Portfolio @ 2026", profile.role]}
          year="2026"
          initials="AG"
          badge="Hire me"
          line2="Portfolio"
          line3="Developer"
          word="Work"
          verticalTag="Code"
          bracketed="S"
          seekingLabel="Seeking*"
          seeking="Full-Stack / MERN"
          href="#contact"
          services={["Web Development", "API Integration", "Database Design", "UI Development"]}
          greetings={["Hi there!", "Let's build something real.", "Open to full-stack roles.", "Thanks for stopping by!"]}
        />
      </section>

      {/* About: minimal dividers instead of cards. */}
      <section id="about" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32">
        <Reveal>
          <SectionHeading>About Me</SectionHeading>
          <p className="mt-6 max-w-[70ch] text-lg leading-[1.75] tracking-[0.01em] text-ink">
            I care about the full lifecycle of a feature: designing API integrations, modelling
            database-backed accounts and booking flows, writing automated tests, and shipping
            through CI/CD. Alongside Agile/Scrum teamwork, I have built foundational cybersecurity
            training, including threat detection, risk analysis, and network security, into how I think
            about software that is functional and hard to break.
          </p>
          <hr className="mt-12 border-border" />
          <h3 className="mt-12 text-xl font-semibold">Education</h3>
          <ul className="mt-6">
            {education.map((e) => (
              <li key={e.school} className="border-t border-border py-6 last:border-b">
                <p className="font-medium">{e.qualification}</p>
                <p className="mt-1 text-sm text-ink">{e.school}</p>
                <p className="text-sm text-secondary">{e.period}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-secondary">
            Languages: {languages.map((l) => `${l.language} (${l.level})`).join(", ")}
          </p>
        </Reveal>
      </section>

      <section id="skills" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32">
        <Reveal>
          <SectionHeading>Technical Skills</SectionHeading>
          <SectionIntro>Grouped by area, exactly as used in project work. No inflated proficiency scores.</SectionIntro>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((g) => (
              <Card key={g.title}>
                <h3 className="font-semibold">{g.title}</h3>
                <div className="mt-4"><TagList items={g.skills} /></div>
              </Card>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Projects: minimalist grid, large type. No project
          screenshots exist, so cards carry text only — no image
          is invented or faked. Featured project full-width first,
          the other two side by side. */}
      <section id="projects" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32">
        <Reveal>
          <SectionHeading>Featured Projects</SectionHeading>
          <SectionIntro>Real projects from my resume. Only Music &amp; Movies Show has verified public links; the others carry none rather than placeholders.</SectionIntro>
          <div className="mt-12">
            <Card>
              <p className="text-sm text-secondary">{featured.period}</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[0.005em] sm:text-4xl">{featured.title}</h3>
              <p className="mt-4 leading-[1.75] tracking-[0.01em] text-ink">{featured.description}</p>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-secondary">
                {featured.points.map((pt) => <li key={pt}>{pt}</li>)}
              </ul>
              <div className="mt-6"><TagList items={featured.stack} /></div>
              <div className="mt-8 flex flex-wrap gap-3">
                {featured.source && <a href={featured.source} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border-strong px-5 py-2.5 text-sm transition-colors duration-200 hover:border-border-strong hover:bg-ink/5">Source code</a>}
                {featured.demo && <a href={featured.demo} target="_blank" rel="noopener noreferrer" className="rounded-full bg-ink px-5 py-2.5 text-sm text-surface transition-colors duration-200 hover:bg-ink/80">Live demo</a>}
              </div>
            </Card>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {otherProjects.map((p) => (
                <Card key={p.slug} className="flex flex-col">
                  <p className="text-sm text-secondary">{p.period}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[0.005em] sm:text-3xl">{p.title}</h3>
                  <p className="mt-4 leading-[1.75] tracking-[0.01em] text-ink">{p.description}</p>
                  <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-secondary">
                    {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                  <div className="mt-6"><TagList items={p.stack} /></div>
                  <div className="mt-auto pt-8">
                    {!p.source && !p.demo && (
                      <p className="text-sm text-secondary">Live demo and public repository links aren&apos;t listed for this project.</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="engineering" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32">
        <Reveal>
          <SectionHeading>Engineering Mindset</SectionHeading>
          <SectionIntro>Practices drawn from real project work: each one tied to something actually built. This portfolio itself applies them: a validated, rate-limited contact form backed by an indexed database with honest delivery states, security headers, and automated tests.</SectionIntro>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <h3 className="font-semibold">Component architecture</h3>
              <p className="mt-2 text-sm leading-[1.75] tracking-[0.01em] text-secondary">Reusable React components for navigation and page transitions in the Campus Connect Portal; modular UI structure carried into the Smart Chatbot.</p>
            </Card>
            <Card>
              <h3 className="font-semibold">API integrations &amp; error handling</h3>
              <p className="mt-2 text-sm leading-[1.75] tracking-[0.01em] text-secondary">TMDB, Spotify (OAuth/API), and OMDb wired into Music &amp; Movies Show with a YouTube fallback so discovery and trailers degrade gracefully. APIs tested with Postman.</p>
            </Card>
            <Card>
              <h3 className="font-semibold">Authentication &amp; sessions</h3>
              <p className="mt-2 text-sm leading-[1.75] tracking-[0.01em] text-secondary">Email/password sign-in with cookie sessions gating booking and the 3D theatre; JWT authentication and role-based access control (RBAC) in the wider skill set.</p>
            </Card>
            <Card>
              <h3 className="font-semibold">Database design</h3>
              <p className="mt-2 text-sm leading-[1.75] tracking-[0.01em] text-secondary">MongoDB models for favorites, viewing history, and confirmed bookings; Oracle SQL and query optimization fundamentals behind the schema choices.</p>
            </Card>
            <Card>
              <h3 className="font-semibold">Testing &amp; CI/CD</h3>
              <p className="mt-2 text-sm leading-[1.75] tracking-[0.01em] text-secondary">GitHub Actions CI checks on the Music &amp; Movies Show repo, Vercel deployments, unit testing and debugging as standard practice, Docker familiarity.</p>
            </Card>
            <Card>
              <h3 className="font-semibold">Performance &amp; accessibility</h3>
              <p className="mt-2 text-sm leading-[1.75] tracking-[0.01em] text-secondary">Responsive layouts across screen sizes, API rate limiting (120 requests / 60s) to protect backends, and semantic, keyboard-navigable interfaces.</p>
            </Card>
          </div>
        </Reveal>
      </section>

      <section id="achievements" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32">
        <Reveal>
          <SectionHeading>Achievements &amp; Certifications</SectionHeading>
          <div className="mt-12">
            <p className="text-sm text-secondary">{leadership.date}</p>
            <p className="text-sm text-ink">{leadership.org}</p>
            <h3 className="mt-2 text-xl font-semibold">{leadership.title}</h3>
            <p className="mt-3 leading-[1.75] tracking-[0.01em] text-ink">{leadership.detail}</p>
          </div>
          <ol className="mt-10">
            {certifications.map((c) => (
              <li key={c.title} className="flex flex-wrap justify-between gap-2 border-t border-border py-5 last:border-b">
                <span><strong>{c.title}</strong> <span className="text-secondary">, {c.issuer}</span></span>
                <span className="text-sm text-secondary">{c.date}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section id="contact" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32">
        <Reveal>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <SectionHeading>Contact</SectionHeading>
              <p className="mt-4 max-w-md text-lg leading-[1.75] tracking-[0.01em] text-secondary">{profile.seeking} The fastest way to reach me is email. I read everything.</p>
              <p className="mt-8">
                <a href={`mailto:${profile.email}`} className="text-ink underline decoration-ink/25 underline-offset-4 transition-colors duration-200 hover:decoration-ink">{profile.email}</a>
              </p>
              <p className="mt-3">
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-ink/25 underline-offset-4 transition-colors duration-200 hover:decoration-ink">{profile.githubLabel}</a>
              </p>
              <p className="mt-3">
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-ink/25 underline-offset-4 transition-colors duration-200 hover:decoration-ink">{profile.linkedinLabel}</a>
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
