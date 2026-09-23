#!/usr/bin/env bash
# Reset database Kopi Kita dari nol: drop semua tabel, jalankan ulang
# schema.sql lalu seed.sql, ke Postgres yang jalan lewat docker-compose.yml
# di root proyek (service "db", database "kopikita").
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Memastikan container database jalan..."
docker compose up -d db

echo "==> Menunggu database siap..."
until docker compose exec -T db pg_isready -U kopikita -d kopikita >/dev/null 2>&1; do
  sleep 1
done

echo "==> Drop tabel lama (kalau ada)..."
docker compose exec -T db psql -U kopikita -d kopikita -c \
  "DROP TABLE IF EXISTS bookings, products, admins CASCADE;"

echo "==> Menjalankan schema.sql..."
docker compose exec -T db psql -U kopikita -d kopikita < server/db/schema.sql

echo "==> Menjalankan seed.sql..."
docker compose exec -T db psql -U kopikita -d kopikita < server/db/seed.sql

echo "==> Selesai. Jumlah baris:"
docker compose exec -T db psql -U kopikita -d kopikita -c \
  "SELECT 'products' AS table_name, COUNT(*) FROM products
   UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
   UNION ALL SELECT 'admins', COUNT(*) FROM admins;"
