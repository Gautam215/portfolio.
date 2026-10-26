"use client";

import { useEffect, useRef } from "react";

// Hero accent, adapted — not copied — from 21st.dev Hero Minimalism
// (lyanchouss, id 6999, retrieved 2026-10-26). Adopted pattern only:
// a slow rising particle field and hairline grid lines that draw in
// on mount, confined to the hero section. Rejected from that component:
// its fixed full-screen root, its own header, the Dali Agents brand /
// CTA / bottom content, and its Hubot Sans external font import.
// Portfolio content, Geist font, and the existing header stay as they
// were. No new dependency. Under prefers-reduced-motion the canvas
// does not animate and the lines render statically (see globals.css).
export default function HeroAccent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Particle = {
      x: number;
      y: number;
      speed: number;
      opacity: number;
      fadeDelay: number;
      fadeStart: number;
      fadingOut: boolean;
    };

    let particles: Particle[] = [];
    let raf = 0;

    const make = (): Particle => {
      const fadeDelay = Math.random() * 600 + 100;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() / 5 + 0.1,
        opacity: 0.7,
        fadeDelay,
        fadeStart: Date.now() + fadeDelay,
        fadingOut: false,
      };
    };

    const reset = (p: Particle) => {
      Object.assign(p, make());
    };

    const init = () => {
      // Size to the hero section, not the window (the original used
      // the full viewport, which would overlay the rest of the page).
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      const count = Math.floor((canvas.width * canvas.height) / 7000);
      particles = Array.from({ length: count }, () => make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < 0) reset(p);
        if (!p.fadingOut && Date.now() > p.fadeStart) p.fadingOut = true;
        if (p.fadingOut) {
          p.opacity -= 0.008;
          if (p.opacity <= 0) reset(p);
        }
        ctx.fillStyle = `rgba(250, 250, 250, ${p.opacity})`;
        ctx.fillRect(p.x, p.y, 0.6, Math.random() * 2 + 1);
      }
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => init();
    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60 mix-blend-screen" />
      <div className="hero-accent-lines absolute inset-0">
        <div className="hero-hline" />
        <div className="hero-hline" />
        <div className="hero-hline" />
        <div className="hero-vline" />
        <div className="hero-vline" />
        <div className="hero-vline" />
      </div>
    </div>
  );
}
