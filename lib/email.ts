import nodemailer from "nodemailer";

export type EmailConfig = {
  configured: boolean;
  to: string;
  from: string;
};

export function emailConfig(): EmailConfig {
  const to = process.env.CONTACT_EMAIL_TO ?? "ak9724068@gmail.com";
  const from = process.env.SMTP_FROM ?? "portfolio@localhost";
  const configured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
  return { configured, to, from };
}

/**
 * Send a contact message by email. Text-only body (no HTML built from user
 * input, so a message cannot inject markup into the owner's inbox).
 * Returns { sent: false, error } instead of throwing, so the caller can
 * record the failure honestly in the database.
 */
export async function sendContactEmail(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ sent: boolean; error?: string; previewUrl?: string }> {
  const cfg = emailConfig();
  if (!cfg.configured) {
    return { sent: false, error: "SMTP is not configured." };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const info = await transporter.sendMail({
      from: cfg.from,
      to: cfg.to,
      replyTo: input.email,
      subject: `Portfolio contact from ${input.name}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        ``,
        input.message,
      ].join("\n"),
    });
    // Ethereal (test) accounts return a preview URL; real providers return none.
    // Logged server-side only (never sent to the client) so a test delivery
    // can be opened and verified; it contains no message content.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[email] test preview: ${previewUrl}`);
    return { sent: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    // Never leak SMTP credentials or full transporter errors to the client;
    // the caller stores only a short, safe message.
    const message = err instanceof Error ? err.message : "Unknown email error";
    return { sent: false, error: message.slice(0, 200) };
  }
}
