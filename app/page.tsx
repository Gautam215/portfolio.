import ContactForm from "@/components/ContactForm";
import HeroAccent from "@/components/HeroAccent";
import {
  profile, education, skillGroups, projects, certifications, leadership, languages,
} from "@/lib/data";

// Apple-inspired redesign: one chip style, one card style, pill
// buttons, large tight type, whitespace instead of divider rules.
// Content, order, and every link are unchanged from the PRD version.
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-sm text-zinc-200">{children}</li>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <article className={`rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 transition-colors duration-200 hover:border-zinc-700 sm:p-8 ${className}`}>
      {children}
    </article>
  );
}

export default function Home() {
  const [featured, ...otherProjects] = projects;
  return (
    <div>
      {/* Hero: centred, Apple product-page style — large type, pill CTAs,
          no decoration beyond the soft background gradient. */}
      <section id="home" className="relative mx-auto max-w-6xl overflow-hidden px-4 py-24 text-center sm:px-6 sm:py-32">
        <HeroAccent />
        <div className="relative">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Full-Stack Developer · {profile.location}
        </p>
        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">{profile.name}</h1>
        <p className="mx-auto mt-6 max-w-3xl text-2xl font-medium tracking-tight text-zinc-300 sm:text-3xl">
          Building Thoughtful Digital Experiences Through Code and Design.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">{profile.summary}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#projects" className="rounded-full bg-indigo-500 px-7 py-3 font-medium text-white transition-colors duration-200 hover:bg-indigo-400">Explore Projects</a>
          <a href="/Abhishek-Gautam-Resume.pdf" download className="rounded-full border border-zinc-700 px-7 py-3 font-medium transition-colors duration-200 hover:bg-zinc-900">Download Resume</a>
          <a href="#contact" className="rounded-full border border-zinc-700 px-7 py-3 font-medium transition-colors duration-200 hover:bg-zinc-900">Contact Me</a>
        </div>
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">{profile.githubLabel}</a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">{profile.linkedinLabel}</a>
        </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">About Me</h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-400">
          I care about the full lifecycle of a feature: designing API integrations, modelling
          database-backed accounts and booking flows, writing automated tests, and shipping
          through CI/CD. Alongside Agile/Scrum teamwork, I have built foundational cybersecurity
          training — threat detection, risk analysis, and network security — into how I think
          about software that is functional and hard to break.
        </p>
        <h3 className="mt-12 text-xl font-semibold">Education</h3>
        <ul className="mt-6 space-y-4">
          {education.map((e) => (
            <li key={e.school} className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 transition-colors duration-200 hover:border-zinc-700">
              <p className="font-medium">{e.qualification}</p>
              <p className="mt-1 text-sm text-zinc-400">{e.school} · {e.period}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-zinc-400">
          Languages: {languages.map((l) => `${l.language} (${l.level})`).join(" · ")}
        </p>
      </section>

      <section id="skills" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Technical Skills</h2>
        <p className="mt-4 max-w-3xl text-lg text-zinc-400">Grouped by area, exactly as used in project work. No inflated proficiency scores.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g) => (
            <Card key={g.title}>
              <h3 className="font-semibold">{g.title}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">{g.skills.map((s) => <Chip key={s}>{s}</Chip>)}</ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Projects: bento layout inspired by 21st.dev bento-grid
          metadata (ids 9594, 9205, 622, 1197) — featured project
          full-width first, the other two side by side. No project
          screenshots exist, so cards carry text only, as before. */}
      <section id="projects" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Featured Projects</h2>
        <p className="mt-4 max-w-3xl text-lg text-zinc-400">Real projects from my resume. Only Music &amp; Movies Show has verified public links; the others carry none rather than placeholders.</p>
        <div className="mt-10">
          <Card>
            <p className="text-sm text-zinc-400">{featured.period} · {featured.stack.join(" · ")}</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight">{featured.title}</h3>
            <p className="mt-3 text-zinc-300">{featured.description}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-400">
              {featured.points.map((pt) => <li key={pt}>{pt}</li>)}
            </ul>
            <ul className="mt-5 flex flex-wrap gap-2">{featured.stack.map((s) => <Chip key={s}>{s}</Chip>)}</ul>
            <div className="mt-6 flex flex-wrap gap-3">
              {featured.source && <a href={featured.source} target="_blank" rel="noopener noreferrer" className="rounded-full bg-zinc-800 px-5 py-2.5 text-sm transition-colors duration-200 hover:bg-zinc-700">Source code</a>}
              {featured.demo && <a href={featured.demo} target="_blank" rel="noopener noreferrer" className="rounded-full bg-indigo-500 px-5 py-2.5 text-sm text-white transition-colors duration-200 hover:bg-indigo-400">Live demo</a>}
            </div>
          </Card>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {otherProjects.map((p) => (
              <Card key={p.slug} className="flex flex-col">
                <p className="text-sm text-zinc-400">{p.period} · {p.stack.join(" · ")}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-3 text-zinc-300">{p.description}</p>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                  {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
                <ul className="mt-5 flex flex-wrap gap-2">{p.stack.map((s) => <Chip key={s}>{s}</Chip>)}</ul>
                <div className="mt-auto pt-6">
                  {!p.source && !p.demo && (
                    <p className="text-sm text-zinc-500">Live demo and public repository links aren&apos;t listed for this project.</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="engineering" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Engineering Mindset</h2>
        <p className="mt-4 max-w-3xl text-lg text-zinc-400">Practices drawn from real project work — each one tied to something actually built. This portfolio itself applies them: a validated, rate-limited contact form backed by an indexed database with honest delivery states, security headers, and automated tests.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <h3 className="font-semibold">Component architecture</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">Reusable React components for navigation and page transitions in the Campus Connect Portal; modular UI structure carried into the Smart Chatbot.</p>
          </Card>
          <Card>
            <h3 className="font-semibold">API integrations &amp; error handling</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">TMDB, Spotify (OAuth/API), and OMDb wired into Music &amp; Movies Show with a YouTube fallback so discovery and trailers degrade gracefully. APIs tested with Postman.</p>
          </Card>
          <Card>
            <h3 className="font-semibold">Authentication &amp; sessions</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">Email/password sign-in with cookie sessions gating booking and the 3D theatre; JWT authentication and role-based access control (RBAC) in the wider skill set.</p>
          </Card>
          <Card>
            <h3 className="font-semibold">Database design</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">MongoDB models for favorites, viewing history, and confirmed bookings; Oracle SQL and query optimization fundamentals behind the schema choices.</p>
          </Card>
          <Card>
            <h3 className="font-semibold">Testing &amp; CI/CD</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">GitHub Actions CI checks on the Music &amp; Movies Show repo, Vercel deployments, unit testing and debugging as standard practice, Docker familiarity.</p>
          </Card>
          <Card>
            <h3 className="font-semibold">Performance &amp; accessibility</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">Responsive layouts across screen sizes, API rate limiting (120 requests / 60s) to protect backends, and semantic, keyboard-navigable interfaces.</p>
          </Card>
        </div>
      </section>

      <section id="achievements" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Achievements &amp; Certifications</h2>
        <article className="mt-10 rounded-[28px] border border-indigo-900 bg-indigo-950/40 p-6 sm:p-8">
          <p className="text-sm text-indigo-300">{leadership.date} · {leadership.org}</p>
          <h3 className="mt-2 text-xl font-semibold">{leadership.title}</h3>
          <p className="mt-3 text-zinc-300">{leadership.detail}</p>
        </article>
        <ol className="mt-6 space-y-3">
          {certifications.map((c) => (
            <li key={c.title} className="flex flex-wrap justify-between gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 transition-colors duration-200 hover:border-zinc-700">
              <span><strong>{c.title}</strong> <span className="text-zinc-400">— {c.issuer}</span></span>
              <span className="text-sm text-zinc-400">{c.date}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact</h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-zinc-400">{profile.seeking} The fastest way to reach me is email — I read everything.</p>
            <p className="mt-8">
              <a href={`mailto:${profile.email}`} className="text-indigo-300 underline hover:text-indigo-200">{profile.email}</a>
            </p>
            <p className="mt-3">
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">{profile.githubLabel}</a>
            </p>
            <p className="mt-3">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">{profile.linkedinLabel}</a>
            </p>
          </div>
          <div className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
