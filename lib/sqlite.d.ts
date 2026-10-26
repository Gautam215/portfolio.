// Local types for node:sqlite, which @types/node 20 does not include
// (it was added in later @types/node versions). Only the API surface this
// project uses is declared; the runtime is Node 24's built-in module.
declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(filename: string, options?: { open?: boolean; readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): {
      run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
      get(...params: unknown[]): Record<string, unknown> | undefined;
      all(...params: unknown[]): Record<string, unknown>[];
    };
    close(): void;
  }
}
