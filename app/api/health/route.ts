import { NextResponse, connection } from "next/server";
import { databaseKind, dbHealthCheck } from "@/lib/db";
import { emailConfig } from "@/lib/email";

// Must be dynamic: a prerendered health check would report build-time
// database/email state and a frozen uptime, which is worse than useless
// for monitoring. This was caught in live testing (health said
// emailConfigured:false while the contact route was emailing fine).
// Under cacheComponents, `await connection()` is how a route opts into
// request-time rendering (the old `dynamic` export is rejected).

// Monitoring endpoint: GET /api/health
// Returns 200 when the app is up and the database answers, 503 when the
// database check fails. No secrets, no message contents, no counts.
export async function GET() {
  await connection();
  const databaseOk = await dbHealthCheck();
  return NextResponse.json(
    {
      status: databaseOk ? "ok" : "degraded",
      service: "portfolio-fullstack",
      checks: {
        database: databaseOk ? "ok" : "error",
        databaseKind: databaseKind(),
        emailConfigured: emailConfig().configured,
      },
      uptimeSeconds: Math.round(process.uptime()),
    },
    { status: databaseOk ? 200 : 503 },
  );
}
