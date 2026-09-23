import { Router } from "express";
import { asyncHandler } from "../asyncHandler";
import { pool } from "../db";
import { ApiError } from "../errors";
import { requireAdmin } from "../middleware/requireAdmin";
import { PRODUCT_CATEGORIES, type ProductCategory } from "../types";

const router = Router();

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    (PRODUCT_CATEGORIES as readonly string[]).includes(value)
  );
}

function isPositivePrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

// GET /api/products?category=kopi|non-kopi|pastry
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category } = req.query;

    if (category !== undefined && !isValidCategory(category)) {
      throw new ApiError(
        400,
        `category harus salah satu dari: ${PRODUCT_CATEGORIES.join(", ")}`,
      );
    }

    const result = category
      ? await pool.query("SELECT * FROM products WHERE category = $1 ORDER BY id", [
          category,
        ])
      : await pool.query("SELECT * FROM products ORDER BY id");

    res.json(result.rows);
  }),
);

// POST /api/products — admin only
router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const { name, description, price, category, image_url, available } = body;

    const errors: string[] = [];
    if (!isNonEmptyString(name)) errors.push("name wajib diisi");
    if (!isNonEmptyString(description)) errors.push("description wajib diisi");
    if (!isPositivePrice(price)) errors.push("price wajib diisi, angka lebih dari 0");
    if (!isValidCategory(category)) {
      errors.push(`category wajib salah satu dari: ${PRODUCT_CATEGORIES.join(", ")}`);
    }
    if (!isNonEmptyString(image_url)) errors.push("image_url wajib diisi");
    if (available !== undefined && typeof available !== "boolean") {
      errors.push("available harus boolean");
    }

    if (errors.length > 0) throw new ApiError(400, errors.join("; "));

    const result = await pool.query(
      `INSERT INTO products (name, description, price, category, image_url, available)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, true))
       RETURNING *`,
      [name, description, price, category, image_url, available ?? null],
    );

    res.status(201).json(result.rows[0]);
  }),
);

// PUT /api/products/:id — admin only, update field yang dikirim saja
router.put(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "id tidak valid");

    const body = req.body ?? {};
    const { name, description, price, category, image_url, available } = body;

    const errors: string[] = [];
    if (name !== undefined && !isNonEmptyString(name)) {
      errors.push("name tidak boleh kosong");
    }
    if (description !== undefined && !isNonEmptyString(description)) {
      errors.push("description tidak boleh kosong");
    }
    if (price !== undefined && !isPositivePrice(price)) {
      errors.push("price harus angka lebih dari 0");
    }
    if (category !== undefined && !isValidCategory(category)) {
      errors.push(`category harus salah satu dari: ${PRODUCT_CATEGORIES.join(", ")}`);
    }
    if (image_url !== undefined && !isNonEmptyString(image_url)) {
      errors.push("image_url tidak boleh kosong");
    }
    if (available !== undefined && typeof available !== "boolean") {
      errors.push("available harus boolean");
    }
    if (errors.length > 0) throw new ApiError(400, errors.join("; "));

    const fields: Record<string, unknown> = {
      name,
      description,
      price,
      category,
      image_url,
      available,
    };
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        setClauses.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
    }
    if (setClauses.length === 0) {
      throw new ApiError(400, "Tidak ada field untuk diupdate");
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${setClauses.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, `Produk dengan id ${id} tidak ditemukan`);
    }

    res.json(result.rows[0]);
  }),
);

// DELETE /api/products/:id — admin only
router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, "id tidak valid");

    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new ApiError(404, `Produk dengan id ${id} tidak ditemukan`);
    }

    res.status(204).send();
  }),
);

export default router;
