"use client";

import { useEffect, useState } from "react";

// PRD §A: glassmorphism sticky header, logo -> Home, links for
// Home/About/Skills/Projects/Achievements/Contact, active-section
// indicator (scroll-aware via IntersectionObserver), mobile drawer,
// Resume download button. No new dependency: plain React + CSS classes.
const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
] as const;

const SECTION_IDS = [
  "home",
  "about",
  "skills",
  "projects",
  "engineering",
  "achievements",
  "contact",
];

export default function SiteHeader() {
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the intersecting section closest to the top of the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href="#home" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold">AG</span>
          <span className="hidden sm:inline">Abhishek Kumar Gautam</span>
          <span className="sm:hidden">AG</span>
        </a>
        <nav aria-label="Primary" className="hidden flex-wrap gap-4 text-sm text-zinc-300 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              aria-current={active === l.id ? "true" : undefined}
              className={
                active === l.id
                  ? "font-medium text-white underline decoration-indigo-400 underline-offset-4"
                  : "hover:text-white"
              }
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/Abhishek-Gautam-Resume.pdf"
            download
            className="hidden rounded-lg bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700 sm:inline-block"
          >
            Resume
          </a>
          <button
            type="button"
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-drawer"
          aria-label="Mobile"
          className="border-t border-zinc-800 px-4 py-3 md:hidden"
        >
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={active === l.id ? "true" : undefined}
                  className={
                    active === l.id
                      ? "block rounded-lg bg-zinc-900 px-3 py-2 font-medium text-white"
                      : "block rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/Abhishek-Gautam-Resume.pdf"
                download
                className="block rounded-lg bg-indigo-500 px-3 py-2 text-center font-medium text-white hover:bg-indigo-400"
              >
                Download Resume
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
