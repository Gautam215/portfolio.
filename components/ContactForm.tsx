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
// submit flow, validation, and honest status messages are
// unchanged.
const fieldClass =
  "peer w-full rounded-xl border border-black/20 bg-white px-4 pb-3 pt-6 text-[#1d1d1f] placeholder-transparent outline-none transition-colors duration-200 focus:border-black";
const labelClass =
  "pointer-events-none absolute left-4 top-4 text-sm text-[#6e6e73] transition-all duration-200 peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:text-[#1d1d1f] peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1 peer-not-placeholder-shown:text-xs";

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
        className="rounded-full bg-[#1d1d1f] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-black/80 disabled:opacity-50"
      >
        {sending ? "Sending…" : "Send message"}
      </button>
      {status.kind === "success" && (
        <p role="status" className="rounded-xl border border-black/10 bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f]">{status.text}</p>
      )}
      {status.kind === "error" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{status.text}</p>
      )}
      <p className="text-xs leading-relaxed text-[#6e6e73]">
        Messages are saved to the site&apos;s database and emailed to me when email delivery is
        configured. For a faster reply, email directly.
      </p>
    </form>
  );
}
