import { Router } from "express";
import { asyncHandler } from "../asyncHandler";
import { pool } from "../db";
import { ApiError } from "../errors";
import { requireAdmin } from "../middleware/requireAdmin";
import { BOOKING_STATUSES, type BookingStatus } from "../types";

const router = Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const WHATSAPP_RE = /^\d{10,}$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidStatus(value: unknown): value is BookingStatus {
  return (
    typeof value === "string" &&
    (BOOKING_STATUSES as readonly string[]).includes(value)
  );
}

function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// POST /api/bookings
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const { customer_name, whatsapp, booking_date, booking_time, party_size, notes } =
      body;

    const errors: string[] = [];

    if (!isNonEmptyString(customer_name)) {
      errors.push("customer_name wajib diisi");
    }

    if (!isNonEmptyString(whatsapp)) {
      errors.push("whatsapp wajib diisi");
    } else if (!WHATSAPP_RE.test(whatsapp.trim())) {
      errors.push("whatsapp harus angka saja, minimal 10 digit");
    }

    if (!isNonEmptyString(booking_date) || !DATE_RE.test(booking_date)) {
      errors.push("booking_date wajib diisi dengan format YYYY-MM-DD");
    } else if (booking_date < todayDateString()) {
      errors.push("booking_date tidak boleh tanggal yang sudah lewat");
    }

    if (!isNonEmptyString(booking_time) || !TIME_RE.test(booking_time)) {
      errors.push("booking_time wajib diisi dengan format HH:mm, mis. 19:00");
    }

    const partySizeNum = Number(party_size);
    if (
      party_size === undefined ||
      party_size === null ||
      party_size === "" ||
      !Number.isInteger(partySizeNum) ||
      partySizeNum < 1 ||
      partySizeNum > 8
    ) {
      errors.push("party_size wajib diisi, bilangan bulat antara 1 sampai 8");
    }

    if (notes !== undefined && notes !== null && typeof notes !== "string") {
      errors.push("notes harus berupa teks");
    }

    if (errors.length > 0) throw new ApiError(400, errors.join("; "));

    const result = await pool.query(
      `INSERT INTO bookings (customer_name, whatsapp, booking_date, booking_time, party_size, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        (customer_name as string).trim(),
        (whatsapp as string).trim(),
        booking_date,
        booking_time,
        partySizeNum,
        isNonEmptyString(notes) ? notes.trim() : null,
      ],
    );

    res.status(201).json(result.rows[0]);
  }),
);

// GET /api/bookings — admin only, urut dari tanggal+jam terdekat
router.get(
  "/",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const result = await pool.query(
      "SELECT * FROM bookings ORDER BY booking_date ASC, booking_time ASC",
    );
    res.json(result.rows);
  }),
);

// PATCH /api/bookings/:id — admin only, ubah status saja
router.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "id tidak valid");

    const { status } = req.body ?? {};
    if (!isValidStatus(status)) {
      throw new ApiError(
        400,
        `status harus salah satu dari: ${BOOKING_STATUSES.join(", ")}`,
      );
    }

    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, `Booking dengan id ${id} tidak ditemukan`);
    }

    res.json(result.rows[0]);
  }),
);

export default router;
