"use client";

import { useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; text: string }
  | { kind: "error"; text: string };

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: "error", text: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      setStatus({ kind: "success", text: data.message ?? "Message received." });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus({ kind: "error", text: "Could not reach the server. Please try again, or email directly." });
    }
  }

  const sending = status.kind === "sending";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-zinc-300">Name</label>
        <input
          id="contact-name" required minLength={2} maxLength={100} autoComplete="name" value={name}
          onChange={(e) => setName(e.target.value)} placeholder="Your name"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-zinc-300">Email</label>
        <input
          id="contact-email" required type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-zinc-300">Message</label>
        <textarea
          id="contact-message" required minLength={10} maxLength={2000} rows={5} value={message}
          onChange={(e) => setMessage(e.target.value)} placeholder="Hi Abhishek, I'd like to talk about…"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none"
        />
      </div>
      <button
        type="submit" disabled={sending}
        className="rounded-lg bg-indigo-500 px-5 py-2.5 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
      >
        {sending ? "Sending…" : "Send message"}
      </button>
      {status.kind === "success" && (
        <p role="status" className="rounded-lg border border-emerald-700 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">{status.text}</p>
      )}
      {status.kind === "error" && (
        <p role="alert" className="rounded-lg border border-red-700 bg-red-950 px-3 py-2 text-sm text-red-300">{status.text}</p>
      )}
      <p className="text-xs text-zinc-400">
        Messages are saved to the site&apos;s database and emailed to me when email delivery is
        configured. For a faster reply, email directly.
      </p>
    </form>
  );
}
