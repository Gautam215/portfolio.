import type { Metadata } from "next";
import "./globals.css";
import { profile } from "@/lib/data";
import SiteHeader from "@/components/SiteHeader";
import BackToTop from "@/components/BackToTop";

// Clean system font stack, no webfont download: San Francisco on
// Apple devices, Inter where installed, then Segoe UI / Helvetica /
// Arial. See globals.css @theme for the same stack.


export const metadata: Metadata = {
  title: "Abhishek Kumar Gautam — Full-Stack Developer",
  description:
    "Portfolio of Abhishek Kumar Gautam, a Computer Science graduate and full-stack developer building responsive web applications with JavaScript, TypeScript, React, Next.js, Node.js and MongoDB.",
  openGraph: {
    title: "Abhishek Kumar Gautam — Full-Stack Developer",
    description: "Building Thoughtful Digital Experiences Through Code and Design.",
    type: "website",
    images: [{ url: "/og-cover.svg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-page text-ink">
        <div aria-hidden="true" className="animated-background" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="relative z-[1] flex-1">{children}</main>
        <footer className="relative z-[1] border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6">
            <div className="flex items-center justify-center gap-6 text-sm">
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-secondary transition-colors duration-200 hover:text-ink">GitHub</a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-secondary transition-colors duration-200 hover:text-ink">LinkedIn</a>
              <a href={`mailto:${profile.email}`} className="text-secondary transition-colors duration-200 hover:text-ink">Email</a>
            </div>
            <p className="mt-4 text-sm text-secondary">© 2026 {profile.name}. All rights reserved.</p>
          </div>
        </footer>
        <BackToTop />
      </body>
    </html>
  );
}
