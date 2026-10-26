export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  ipHash: string;
  emailStatus: string;
  emailError: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type EmailStatus = "sent" | "failed" | "no_smtp";

export interface ContactStore {
  kind: "sqlite" | "postgres";
  insert(input: {
    id: string;
    name: string;
    email: string;
    message: string;
    ipHash: string;
  }): Promise<ContactMessageRow>;
  get(id: string): Promise<ContactMessageRow | null>;
  /** All rows, oldest first — used only by the one-off SQLite→Postgres migration script. */
  listAll(): Promise<ContactMessageRow[]>;
  updateStatus(id: string, status: EmailStatus, emailError?: string): Promise<void>;
  healthCheck(): Promise<boolean>;
}
