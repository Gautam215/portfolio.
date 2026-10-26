"use client";

import { useEffect, useState } from "react";

// PRD §I: back-to-top button. Appears only after scrolling, returns to
// the top on click, and honours reduced-motion (instant scroll then).
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      className="fixed bottom-6 right-6 z-20 rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors duration-200 hover:bg-black/80"
    >
      Back to top
    </button>
  );
}
