"use client";

import { useEffect, useState } from "react";

// Light Apple-style header: floating, fixed, frosted glass.
// backdrop-filter blur(20px) over a translucent white background,
// a 1px semi-transparent border, centred nav with consistent
// spacing, and a black pill for the active section. No new
// dependency: plain React + Tailwind classes. The active-section
// observer and mobile drawer behaviour are unchanged.
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
  }, [open]);

  return (
    <header className="fixed inset-x-3 top-3 z-20 sm:inset-x-6 sm:top-4">
      <div className="mx-auto max-w-5xl rounded-full border border-border bg-page/72 shadow-sm backdrop-blur-[20px]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-3 py-2 sm:px-4">
          <a href="#home" className="flex items-center gap-2 font-semibold text-ink" onClick={() => setOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-surface">AG</span>
            <span className="hidden sm:inline">Abhishek Kumar Gautam</span>
            <span className="sm:hidden">AG</span>
          </a>
          <nav aria-label="Primary" className="hidden items-center justify-center gap-1 text-sm text-secondary md:flex">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                aria-current={active === l.id ? "true" : undefined}
                className={
                  active === l.id
                    ? "rounded-full bg-ink px-4 py-2 font-medium text-surface transition-colors duration-200"
                    : "rounded-full px-4 py-2 transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
                }
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-2">
            <a
              href="/Abhishek-Gautam-Resume.pdf"
              download
              className="hidden rounded-full bg-ink px-4 py-2 text-sm text-surface transition-colors duration-200 hover:bg-ink/80 sm:inline-block"
            >
              Resume
            </a>
            <button
              type="button"
              className="rounded-full bg-ink px-4 py-2 text-sm text-surface transition-colors duration-200 hover:bg-ink/80 md:hidden"
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
            className="border-t border-border px-4 py-3 md:hidden"
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
                        ? "block rounded-full bg-ink px-4 py-3 font-medium text-surface"
                        : "block rounded-full px-4 py-3 text-secondary transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
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
                  className="block rounded-full bg-ink px-4 py-3 text-center font-medium text-surface transition-colors duration-200 hover:bg-ink/80"
                >
                  Download Resume
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
