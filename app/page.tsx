import ContactForm from "@/components/ContactForm";
import {
  profile, education, skillGroups, projects, certifications, leadership, languages,
} from "@/lib/data";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-200">{children}</li>
  );
}

export default function Home() {
  return (
    <div>
      <section id="home" className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Full-Stack Developer · {profile.location}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">{profile.name}</h1>
        <p className="mt-4 text-xl text-zinc-300 sm:text-2xl">
          Building Thoughtful Digital Experiences Through Code and Design.
        </p>
        <p className="mt-4 max-w-3xl leading-relaxed text-zinc-400">{profile.summary}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#projects" className="rounded-lg bg-indigo-500 px-5 py-2.5 font-medium text-white hover:bg-indigo-400">Explore Projects</a>
          <a href="/Abhishek-Gautam-Resume.pdf" download className="rounded-lg border border-zinc-700 px-5 py-2.5 font-medium hover:bg-zinc-900">Download Resume</a>
          <a href="#contact" className="rounded-lg border border-zinc-700 px-5 py-2.5 font-medium hover:bg-zinc-900">Contact Me</a>
        </div>
        <div className="mt-6 flex gap-4 text-sm">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">{profile.githubLabel}</a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">{profile.linkedinLabel}</a>
        </div>
      </section>

      <section id="about" className="border-t border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-3xl font-bold">About Me</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-zinc-400">
            I care about the full lifecycle of a feature: designing API integrations, modelling
            database-backed accounts and booking flows, writing automated tests, and shipping
            through CI/CD. Alongside Agile/Scrum teamwork, I have built foundational cybersecurity
            training — threat detection, risk analysis, and network security — into how I think
            about software that is functional and hard to break.
          </p>
          <h3 className="mt-10 text-xl font-semibold">Education</h3>
          <ul className="mt-4 space-y-4">
            {education.map((e) => (
              <li key={e.school} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="font-medium">{e.qualification}</p>
                <p className="text-sm text-zinc-400">{e.school} · {e.period}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-zinc-400">
            Languages: {languages.map((l) => `${l.language} (${l.level})`).join(" · ")}
          </p>
        </div>
      </section>

      <section id="skills" className="border-t border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-3xl font-bold">Technical Skills</h2>
          <p className="mt-3 text-zinc-400">Grouped by area, exactly as used in project work. No inflated proficiency scores.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((g) => (
              <article key={g.title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <h3 className="font-semibold">{g.title}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">{g.skills.map((s) => <Chip key={s}>{s}</Chip>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="border-t border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-3xl font-bold">Featured Projects</h2>
          <p className="mt-3 text-zinc-400">Real projects from my resume. Only Music &amp; Movies Show has verified public links; the others carry none rather than placeholders.</p>
          <div className="mt-8 space-y-6">
            {projects.map((p) => (
              <article key={p.slug} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-400">{p.period} · {p.stack.join(" · ")}</p>
                <h3 className="mt-1 text-2xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-zinc-300">{p.description}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                  {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
                <ul className="mt-4 flex flex-wrap gap-2">{p.stack.map((s) => <Chip key={s}>{s}</Chip>)}</ul>
                <div className="mt-5 flex flex-wrap gap-3">
                  {p.source && <a href={p.source} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700">Source code</a>}
                  {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-400">Live demo</a>}
                  {!p.source && !p.demo && (
                    <p className="text-sm text-zinc-500">Live demo and public repository links aren&apos;t listed for this project.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="engineering" className="border-t border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-3xl font-bold">Engineering Mindset</h2>
          <p className="mt-3 text-zinc-400">Practices drawn from real project work — each one tied to something actually built. This portfolio itself applies them: a validated, rate-limited contact form backed by an indexed database with honest delivery states, security headers, and automated tests.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-semibold">Component architecture</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">Reusable React components for navigation and page transitions in the Campus Connect Portal; modular UI structure carried into the Smart Chatbot.</p>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-semibold">API integrations &amp; error handling</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">TMDB, Spotify (OAuth/API), and OMDb wired into Music &amp; Movies Show with a YouTube fallback so discovery and trailers degrade gracefully. APIs tested with Postman.</p>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-semibold">Authentication &amp; sessions</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">Email/password sign-in with cookie sessions gating booking and the 3D theatre; JWT authentication and role-based access control (RBAC) in the wider skill set.</p>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-semibold">Database design</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">MongoDB models for favorites, viewing history, and confirmed bookings; Oracle SQL and query optimization fundamentals behind the schema choices.</p>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-semibold">Testing &amp; CI/CD</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">GitHub Actions CI checks on the Music &amp; Movies Show repo, Vercel deployments, unit testing and debugging as standard practice, Docker familiarity.</p>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-semibold">Performance &amp; accessibility</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">Responsive layouts across screen sizes, API rate limiting (120 requests / 60s) to protect backends, and semantic, keyboard-navigable interfaces.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="achievements" className="border-t border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-3xl font-bold">Achievements &amp; Certifications</h2>
          <article className="mt-8 rounded-xl border border-indigo-900 bg-indigo-950/40 p-6">
            <p className="text-sm text-indigo-300">{leadership.date} · {leadership.org}</p>
            <h3 className="mt-1 text-xl font-semibold">{leadership.title}</h3>
            <p className="mt-2 text-zinc-300">{leadership.detail}</p>
          </article>
          <ol className="mt-6 space-y-3">
            {certifications.map((c) => (
              <li key={c.title} className="flex flex-wrap justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                <span><strong>{c.title}</strong> <span className="text-zinc-400">— {c.issuer}</span></span>
                <span className="text-sm text-zinc-400">{c.date}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="contact" className="border-t border-zinc-800">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Contact</h2>
            <p className="mt-3 leading-relaxed text-zinc-400">{profile.seeking} The fastest way to reach me is email — I read everything.</p>
            <p className="mt-6">
              <a href={`mailto:${profile.email}`} className="text-indigo-300 underline hover:text-indigo-200">{profile.email}</a>
            </p>
            <p className="mt-2">
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">{profile.githubLabel}</a>
            </p>
            <p className="mt-2">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">{profile.linkedinLabel}</a>
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
