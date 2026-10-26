import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  insertContactMessage,
  updateContactMessageStatus,
} from "@/lib/db";
import {
  MAX_BODY_BYTES,
  contactRateLimiter,
  hashIp,
  validateContact,
} from "@/lib/contact";
import { emailConfig, sendContactEmail } from "@/lib/email";
import { profile } from "@/lib/data";

// Contact messages live in the configured database (SQLite locally,
// Postgres on Vercel — see lib/db.ts), never in a JSON file and never
// exposed by a GET endpoint. Flow:
//  1. rate-limit, 2. validate, 3. insert as "pending",
//  4. if SMTP is configured, try to email; record sent/failed honestly,
//  5. if SMTP is not configured, record "no_smtp" and say so — never claim
//     an email was sent when it was not.

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (contactRateLimiter.isLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in a minute." },
      { status: 429 },
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Message is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateContact(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { name, email, message } = validated.value;

  let id: string;
  try {
    id = crypto.randomUUID();
    await insertContactMessage({ id, name, email, message, ipHash: hashIp(ip) });
  } catch {
    return NextResponse.json(
      { error: "Message could not be saved. Please email directly instead." },
      { status: 500 },
    );
  }

  const cfg = emailConfig();
  if (!cfg.configured) {
    await updateContactMessageStatus(id, "no_smtp");
    return NextResponse.json(
      {
        ok: true,
        id,
        message:
          "Message saved. Email delivery isn't configured on this site yet, so I'll check saved messages — or email me directly for a faster reply.",
      },
      { status: 201 },
    );
  }

  const sent = await sendContactEmail({ name, email, message });
  if (sent.sent) {
    await updateContactMessageStatus(id, "sent");
    return NextResponse.json(
      {
        ok: true,
        id,
        message: "Message received and emailed. Thank you — I'll reply by email.",
      },
      { status: 201 },
    );
  }

  await updateContactMessageStatus(id, "failed", sent.error ?? "Unknown error");
  return NextResponse.json(
    {
      error: `Your message was saved, but email delivery failed — please email me directly at ${profile.email} so I don't miss it.`,
    },
    { status: 503 },
  );
}

// No GET handler: contact messages are never listed or exposed via the API.
// The owner reads them from the configured database directly.
