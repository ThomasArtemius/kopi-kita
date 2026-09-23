import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors.js";
import { getSession, SESSION_COOKIE_NAME } from "../sessionStore.js";

export interface AuthedRequest extends Request {
  admin?: { id: number; email: string };
}

/**
 * Gerbang untuk endpoint admin-only. Baca cookie session (di-set oleh
 * POST /api/auth/login), cari di session store, tempel data admin ke
 * req.admin kalau valid.
 */
export function requireAdmin(req: AuthedRequest, _res: Response, next: NextFunction) {
  const sessionId: string | undefined = req.cookies?.[SESSION_COOKIE_NAME];

  if (!sessionId) {
    throw new ApiError(401, "Belum login sebagai admin");
  }

  const session = getSession(sessionId);
  if (!session) {
    throw new ApiError(401, "Sesi tidak valid atau sudah kedaluwarsa, silakan login lagi");
  }

  req.admin = { id: session.adminId, email: session.email };
  next();
}
