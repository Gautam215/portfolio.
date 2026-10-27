"use client";

import { useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; text: string }
  | { kind: "error"; text: string };

// Floating labels, minimalist borders: a single thin border that
// turns black on focus, no filled dark fields. The label sits
// inside the field and floats above it on focus or when the field
// has a value (peer + placeholder-shown trick, so it also works
// with autofill and with values restored by the browser). The
// float uses transform + scale only — never transition-all, never
// top/left animation. The submit flow, validation, and honest
// status messages are unchanged.
const fieldClass =
  "peer w-full rounded-xl border border-border-strong bg-surface px-4 pb-3 pt-6 text-ink placeholder-transparent outline-none transition-colors duration-200 focus:border-ink";
const labelClass =
  "pointer-events-none absolute left-4 top-4 origin-left text-sm text-secondary transition-transform transition-colors duration-200 peer-focus:-translate-x-1 peer-focus:-translate-y-6 peer-focus:scale-[0.8] peer-focus:bg-surface peer-focus:px-1 peer-focus:text-ink peer-not-placeholder-shown:-translate-x-1 peer-not-placeholder-shown:-translate-y-6 peer-not-placeholder-shown:scale-[0.8] peer-not-placeholder-shown:bg-surface peer-not-placeholder-shown:px-1";

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
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="relative">
        <input
          id="contact-name" required minLength={2} maxLength={100} autoComplete="name" value={name}
          onChange={(e) => setName(e.target.value)} placeholder="Your name"
          className={fieldClass}
        />
        <label htmlFor="contact-name" className={labelClass}>Name</label>
      </div>
      <div className="relative">
        <input
          id="contact-email" required type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          className={fieldClass}
        />
        <label htmlFor="contact-email" className={labelClass}>Email</label>
      </div>
      <div className="relative">
        <textarea
          id="contact-message" required minLength={10} maxLength={2000} rows={5} value={message}
          onChange={(e) => setMessage(e.target.value)} placeholder="Hi Abhishek, I'd like to talk about…"
          className={fieldClass}
        />
        <label htmlFor="contact-message" className={labelClass}>Message</label>
      </div>
      <button
        type="submit" disabled={sending}
        className="rounded-full bg-ink px-6 py-3 font-medium text-surface transition-colors duration-200 hover:bg-ink/80 disabled:opacity-50"
      >
        {sending ? "Sending…" : "Send message"}
      </button>
      {status.kind === "success" && (
        <p role="status" className="rounded-xl border border-border bg-[#f5f5f7] px-4 py-3 text-sm text-ink">{status.text}</p>
      )}
      {status.kind === "error" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{status.text}</p>
      )}
      <p className="text-xs leading-relaxed text-secondary">
        Messages are saved to the site&apos;s database and emailed to me when email delivery is
        configured. For a faster reply, email directly.
      </p>
    </form>
  );
}
