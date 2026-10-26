import crypto from "crypto";

export const MAX_NAME = 100;
export const MAX_MESSAGE = 2000;
export const MIN_MESSAGE = 10;
export const MAX_BODY_BYTES = 32 * 1024;
export const MAX_PER_MINUTE_PER_IP = 5;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateContact(input: unknown): {
  ok: true;
  value: { name: string; email: string; message: string };
} | { ok: false; error: string } {
  const { name, email, message } = (input ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > MAX_NAME) {
    return { ok: false, error: "Please enter your name (2–100 characters)." };
  }
  if (typeof email !== "string" || !isValidEmail(email.trim())) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (
    typeof message !== "string" ||
    message.trim().length < MIN_MESSAGE ||
    message.trim().length > MAX_MESSAGE
  ) {
    return { ok: false, error: "Please write a message between 10 and 2000 characters." };
  }
  return {
    ok: true,
    value: { name: name.trim(), email: email.trim(), message: message.trim() },
  };
}

/** Hash an IP for storage/abuse review without storing the raw address. */
export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

/** In-memory per-IP rate limiter. Note: it is per server instance, so on a
 *  multi-instance host it limits per instance, not globally. For a single
 *  server / local deployment that is sufficient; see IMPLEMENTATION_PLAN.md
 *  for the Postgres/Redis follow-up if traffic ever requires it. */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  constructor(private maxPerMinute = MAX_PER_MINUTE_PER_IP) {}

  isLimited(ip: string, now = Date.now()): boolean {
    const recent = (this.hits.get(ip) ?? []).filter((t) => now - t < 60_000);
    if (recent.length >= this.maxPerMinute) return true;
    recent.push(now);
    this.hits.set(ip, recent);
    return false;
  }
}

export const contactRateLimiter = new RateLimiter();
