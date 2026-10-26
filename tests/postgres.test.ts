import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { newDb, DataType } from "pg-mem";
import { createPostgresStore } from "@/lib/db-postgres";

// Verifies the REAL Postgres schema file and the REAL store SQL against a
// Postgres emulator (pg-mem). This proves the SQL executes and the status
// transitions work. It does NOT prove a live Neon/Postgres connection —
// that still needs DATABASE_URL + a real server (see IMPLEMENTATION_PLAN.md).
describe("postgres store (pg-mem emulator)", () => {
  it("applies the schema, inserts as pending, and transitions to sent", async () => {
    const schemaSql = readFileSync(
      path.join(process.cwd(), "db", "migrations", "001_contact_messages.postgres.sql"),
      "utf8",
    );
    const mem = newDb();
    // pg-mem does not ship char_length, which is native in real Postgres.
    // Register it in the emulator only; the schema file is unchanged.
    mem.public.registerFunction({
      name: "char_length",
      args: [DataType.text],
      returns: DataType.integer,
      implementation: (x: string) => x.length,
    });
    const { Pool } = mem.adapters.createPg();
    const pool = new Pool();
    const store = createPostgresStore(
      {
        query: async (text: string, params?: unknown[]) => {
          const result = await pool.query(text, params);
          return { rows: result.rows, rowCount: result.rowCount };
        },
      },
      schemaSql,
    );

    expect(await store.healthCheck()).toBe(true);
    const inserted = await store.insert({
      id: "00000000-0000-4000-8000-000000000001",
      name: "Test User",
      email: "test@example.com",
      message: "A proper test message, long enough to pass validation.",
      ipHash: "abc123",
    });
    expect(inserted.emailStatus).toBe("pending");
    expect(inserted.sentAt).toBeNull();

    await store.updateStatus(inserted.id, "sent");
    const after = await store.get(inserted.id);
    expect(after?.emailStatus).toBe("sent");
    expect(after?.sentAt).not.toBeNull();

    expect(await store.get("no-such-id")).toBeNull();
    expect((await store.listAll()).map((r) => r.id)).toContain(inserted.id);
  });
});
