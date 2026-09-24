-- Skema database Kopi Kita

-- pgcrypto dipakai untuk hashing password admin (crypt/gen_salt) di seed.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabel products: sumber data halaman menu, dikelola dari CMS
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,                            -- nomor unik otomatis
  name         VARCHAR NOT NULL,                               -- nama produk
  description  TEXT NOT NULL,                                  -- deskripsi singkat
  price        INTEGER NOT NULL CHECK (price > 0),             -- harga dalam Rupiah, tanpa desimal
  category     VARCHAR NOT NULL CHECK (category IN ('kopi', 'non-kopi', 'pastry')),
  image_url    TEXT NOT NULL,                                  -- alamat gambar
  available    BOOLEAN NOT NULL DEFAULT true,                  -- masih dijual atau tidak
  created_at   TIMESTAMP NOT NULL DEFAULT now()                -- kapan dibuat
);

-- Tabel bookings: hasil form booking
CREATE TABLE IF NOT EXISTS bookings (
  id             SERIAL PRIMARY KEY,
  customer_name  VARCHAR NOT NULL,
  whatsapp       VARCHAR NOT NULL,
  booking_date   DATE NOT NULL,
  booking_time   VARCHAR NOT NULL,                             -- contoh "19:00"
  party_size     INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 8),  -- jumlah orang
  notes          TEXT,                                         -- opsional
  status         VARCHAR NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'done', 'cancelled')),
  created_at     TIMESTAMP NOT NULL DEFAULT now()
);

-- Tabel admins: akun pengelola CMS
CREATE TABLE IF NOT EXISTS admins (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR NOT NULL UNIQUE,
  password_hash  VARCHAR NOT NULL                              -- hasil hash, BUKAN password asli
);

-- Tabel sessions: session login admin (menggantikan Map di memori, supaya
-- awet di lingkungan serverless). Satu baris per login aktif; logout
-- menghapus barisnya, dan baris kadaluarsa ditolak oleh requireAdmin.
CREATE TABLE IF NOT EXISTS sessions (
  id          VARCHAR PRIMARY KEY,                             -- session id acak
  admin_id    INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);
