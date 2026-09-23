import { Router } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../asyncHandler.js";
import { pool } from "../db.js";
import { ApiError } from "../errors.js";

const router = Router();

const TOKEN_TTL = "8h";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// POST /api/admin/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new ApiError(400, "email dan password wajib diisi");
    }

    const result = await pool.query(
      `SELECT id, email, (crypt($2, password_hash) = password_hash) AS valid
       FROM admins WHERE email = $1`,
      [email.trim().toLowerCase(), password],
    );

    const admin = result.rows[0];
    // Sengaja pakai pesan yang sama untuk "email tidak ada" maupun
    // "password salah" — supaya tidak bocor info akun mana yang terdaftar.
    if (!admin || !admin.valid) {
      throw new ApiError(401, "Email atau password salah");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET belum diset di .env");
    }

    const token = jwt.sign({ sub: admin.id, email: admin.email }, secret, {
      expiresIn: TOKEN_TTL,
    });

    res.json({
      token,
      expiresIn: TOKEN_TTL,
      admin: { id: admin.id, email: admin.email },
    });
  }),
);

export default router;
