# Kopi Kita — Backend

## Database

Skema dan data awal ada di `db/schema.sql` dan `db/seed.sql`. Keduanya dijalankan
terhadap PostgreSQL yang sudah jalan lewat `docker-compose.yml` di root proyek
(service `db`, database `kopikita`).

### 1. Pastikan container database jalan

```bash
cd ~/latihan-module
docker compose up -d
docker compose ps   # pastikan status "healthy"
```

### 2. Jalankan schema.sql (buat tabel)

```bash
docker compose exec -T db psql -U kopikita -d kopikita < api/db/schema.sql
```

### 3. Jalankan seed.sql (isi data awal)

```bash
docker compose exec -T db psql -U kopikita -d kopikita < api/db/seed.sql
```

Kedua file aman dijalankan berkali-kali (`CREATE TABLE IF NOT EXISTS` dan
`ON CONFLICT ... DO NOTHING`) — tidak akan duplikat data atau error kalau
diulang.

### 4. Verifikasi jumlah baris

```bash
docker compose exec -T db psql -U kopikita -d kopikita -c \
  "SELECT 'products' AS table_name, COUNT(*) FROM products
   UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
   UNION ALL SELECT 'admins', COUNT(*) FROM admins;"
```

Hasil yang diharapkan: `products = 8`, `bookings = 0` (belum ada booking
masuk), `admins = 1`.

## Login admin default

- Email: `admin@kopikita.id`
- Password: `kopikita-admin`

Password disimpan ter-hash (bcrypt via `pgcrypto`), bukan plain text. Untuk
memverifikasi login nanti di kode backend, gunakan `crypt(input_password,
password_hash) = password_hash`, atau bandingkan dengan library bcrypt
(`bcrypt.compare`) di sisi aplikasi — hash yang dihasilkan `pgcrypto`
(format `$2a$...`) kompatibel dengan library bcrypt standar.
