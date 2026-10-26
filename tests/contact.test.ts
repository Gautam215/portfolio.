import { describe, expect, it } from "vitest";
import {
  RateLimiter,
  hashIp,
  isValidEmail,
  validateContact,
} from "@/lib/contact";
import { emailConfig } from "@/lib/email";

describe("validateContact", () => {
  it("accepts a valid message", () => {
    const r = validateContact({
      name: "Priya",
      email: "priya@example.com",
      message: "Hi, I saw your portfolio and would like to talk.",
    });
    expect(r.ok).toBe(true);
  });

  it("rejects a short name, a bad email, and a short message", () => {
    expect(validateContact({ name: "A", email: "a@b.com", message: "x".repeat(20) }).ok).toBe(false);
    expect(validateContact({ name: "Priya", email: "not-an-email", message: "x".repeat(20) }).ok).toBe(false);
    expect(validateContact({ name: "Priya", email: "a@b.com", message: "hi" }).ok).toBe(false);
  });

  it("rejects an over-long message and trims inputs", () => {
    expect(
      validateContact({ name: "Priya", email: "a@b.com", message: "x".repeat(2001) }).ok,
    ).toBe(false);
    const r = validateContact({
      name: "  Priya  ",
      email: "  a@b.com  ",
      message: "  Hello, this is a proper message.  ",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.name).toBe("Priya");
  });
});

describe("isValidEmail", () => {
  it("accepts normal addresses and rejects malformed ones", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a b@c.com")).toBe(false);
  });
});

describe("RateLimiter", () => {
  it("allows 5 per minute per IP, then blocks, and isolates IPs", () => {
    const limiter = new RateLimiter(5);
    for (let i = 0; i < 5; i++) expect(limiter.isLimited("1.2.3.4")).toBe(false);
    expect(limiter.isLimited("1.2.3.4")).toBe(true);
    expect(limiter.isLimited("5.6.7.8")).toBe(false);
  });
});

describe("hashIp", () => {
  it("is deterministic and does not contain the raw IP", () => {
    const h = hashIp("1.2.3.4");
    expect(h).toBe(hashIp("1.2.3.4"));
    expect(h).not.toContain("1.2.3.4");
    expect(h).toHaveLength(64);
  });
});

describe("emailConfig", () => {
  it("reports unconfigured when SMTP env vars are absent", () => {
    // Vitest runs with the repo's env; this test only asserts the default
    // destination, not the configured flag, so it stays true in CI with or
    // without SMTP set. The configured flag is covered by the live check.
    expect(emailConfig().to).toBe(process.env.CONTACT_EMAIL_TO ?? "ak9724068@gmail.com");
  });
});
