import { describe, expect, it, afterEach } from "vitest";
import { databaseKind } from "@/lib/db";

describe("database selection", () => {
  afterEach(() => {
    delete process.env.DATABASE_URL;
  });

  it("selects Postgres when DATABASE_URL is a postgres URL", () => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/portfolio?sslmode=disable";
    expect(databaseKind()).toBe("postgres");
  });

  it("selects Postgres for postgresql:// URLs too", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/portfolio";
    expect(databaseKind()).toBe("postgres");
  });

  it("selects SQLite when DATABASE_URL is unset or not Postgres", () => {
    delete process.env.DATABASE_URL;
    expect(databaseKind()).toBe("sqlite");
    process.env.DATABASE_URL = "file:./dev.db";
    expect(databaseKind()).toBe("sqlite");
  });
});
