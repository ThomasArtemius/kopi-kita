import crypto from "node:crypto";
import { pool } from "./db";

export interface SessionData {
  adminId: number;
  email: string;
  expiresAt: Date;
}

export const SESSION_COOKIE_NAME = "kopikita_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam

// Session disimpan di tabel `sessions` (lihat server/db/schema.sql), bukan
// di memori proses, jadi tetap valid walau tiap request dijalankan oleh
// instance serverless yang berbeda atau server di-restart. Semua
// perbandingan waktu memakai now() milik Postgres supaya tidak bergantung
// pada jam/timezone proses Node.

export async function createSession(adminId: number): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex");

  // Sekalian bersihkan baris kadaluarsa supaya tabel tidak menumpuk.
  await pool.query("DELETE FROM sessions WHERE expires_at <= now()");
  await pool.query(
    `INSERT INTO sessions (id, admin_id, expires_at)
     VALUES ($1, $2, now() + make_interval(secs => $3))`,
    [sessionId, adminId, SESSION_TTL_MS / 1000],
  );

  return sessionId;
}

/** Kembalikan data session kalau ada DAN belum kadaluarsa, selain itu undefined. */
export async function getSession(sessionId: string): Promise<SessionData | undefined> {
  const result = await pool.query(
    `SELECT s.admin_id, a.email, s.expires_at
     FROM sessions s
     JOIN admins a ON a.id = s.admin_id
     WHERE s.id = $1 AND s.expires_at > now()`,
    [sessionId],
  );

  const row = result.rows[0];
  if (!row) return undefined;

  return { adminId: row.admin_id, email: row.email, expiresAt: row.expires_at };
}

export async function destroySession(sessionId: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE id = $1", [sessionId]);
}
