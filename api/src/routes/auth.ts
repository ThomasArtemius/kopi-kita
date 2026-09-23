import bcrypt from "bcryptjs";
import { Router, type CookieOptions } from "express";
import { asyncHandler } from "../asyncHandler.js";
import { pool } from "../db.js";
import { ApiError } from "../errors.js";
import { requireAdmin, type AuthedRequest } from "../middleware/requireAdmin.js";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  createSession,
  destroySession,
} from "../sessionStore.js";

const router = Router();

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  // Set true kalau sudah jalan di belakang HTTPS (production).
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_TTL_MS,
  path: "/",
};

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new ApiError(400, "email dan password wajib diisi");
    }

    const result = await pool.query(
      "SELECT id, email, password_hash FROM admins WHERE email = $1",
      [email.trim().toLowerCase()],
    );

    const admin = result.rows[0];
    // Pesan yang sama untuk "email tidak ada" maupun "password salah"
    // supaya tidak bocor info akun mana yang terdaftar.
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      throw new ApiError(401, "Email atau password salah");
    }

    const sessionId = createSession(admin.id, admin.email);
    res.cookie(SESSION_COOKIE_NAME, sessionId, cookieOptions);
    res.json({ admin: { id: admin.id, email: admin.email } });
  }),
);

// POST /api/auth/logout
router.post("/logout", (req: AuthedRequest, res) => {
  const sessionId: string | undefined = req.cookies?.[SESSION_COOKIE_NAME];
  if (sessionId) destroySession(sessionId);
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.status(204).send();
});

// GET /api/auth/me
router.get("/me", requireAdmin, (req: AuthedRequest, res) => {
  res.json({ admin: req.admin });
});

export default router;
