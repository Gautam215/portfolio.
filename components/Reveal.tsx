"use client";

import { useEffect, useRef, useState } from "react";

// Scroll reveal, no new dependency: a small IntersectionObserver
// wrapper. Sections fade and rise 12px over 600ms, once, and only
// when they enter the viewport. Under reduced-motion the CSS in
// globals.css renders the content statically, and if
// IntersectionObserver is unavailable the content is shown.
// Scripting-off safety: the hidden state lives under a .js class
// (see globals.css), added here on mount — with scripting off
// there is no .js class, so server-rendered content stays visible.
export default function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("js");
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Fallback runs as a callback, not a synchronous effect-body
      // setState (which the lint rule forbids): show the content.
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={visible ? "reveal reveal-visible" : "reveal"}>
      {children}
    </div>
  );
}
