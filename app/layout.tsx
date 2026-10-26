import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/data";
import SiteHeader from "@/components/SiteHeader";
import BackToTop from "@/components/BackToTop";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <div aria-hidden="true" className="animated-background" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-500 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="relative z-[1] flex-1">{children}</main>
        <footer className="relative z-[1] border-t border-zinc-800">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-zinc-400">
            <p>© 2026 {profile.name}. All rights reserved.</p>
            <div className="flex gap-4">
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a>
              <a href={`mailto:${profile.email}`} className="hover:text-white">Email</a>
            </div>
          </div>
        </footer>
        <BackToTop />
      </body>
    </html>
  );
}
