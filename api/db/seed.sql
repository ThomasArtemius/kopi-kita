-- Data awal Kopi Kita
-- Produk disamakan persis dengan lib/menu-data.ts (frontend mock data)
-- Catatan: field frontend "image" dipetakan ke kolom "image_url" di sini.

INSERT INTO products (id, name, description, price, category, image_url, available) VALUES
  (1, 'Kopi Susu Kita', 'Perpaduan espresso rich dan susu segar dengan gula aren yang manisnya pas di hati.', 22000, 'kopi', '/images/menu/kopi-susu-kita.jpg', true),
  (2, 'Americano', 'Espresso murni dan air panas, sederhana tapi bikin melek dan fokus seharian.', 18000, 'kopi', '/images/menu/americano.jpg', true),
  (3, 'Es Kopi Gula Aren', 'Sensasi dingin, manis karamel gula aren, dan pahit kopi yang klop banget di siang hari.', 20000, 'kopi', '/images/menu/es-kopi-gula-aren.jpg', true),
  (4, 'Matcha Latte', 'Bubuk matcha premium diseduh lembut dengan susu creamy, hijau menyegarkan setiap tegukan.', 25000, 'non-kopi', '/images/menu/matcha-latte.jpg', true),
  (5, 'Coklat Panas', 'Coklat leleh kental yang hangat dan manis, teman sempurna saat hujan atau malam santai.', 23000, 'non-kopi', '/images/menu/coklat-panas.jpg', true),
  (6, 'Croissant', 'Lapisan mentega renyah di luar, lembut mengembang di dalam, wangi banget saat baru dipanggang.', 18000, 'pastry', '/images/menu/croissant.jpg', true),
  (7, 'Roti Bakar Keju', 'Roti panggang keju leleh melimpah, gurih meleleh di setiap gigitan yang bikin nagih.', 17000, 'pastry', '/images/menu/roti-bakar-keju.jpg', true),
  (8, 'Banana Bread', 'Roti pisang lembut dan harum, manis alami yang cocok jadi teman ngopi santai.', 19000, 'pastry', '/images/menu/banana-bread.jpg', false)
ON CONFLICT (id) DO NOTHING;

-- Samakan sequence id dengan data yang baru di-insert manual di atas,
-- supaya INSERT berikutnya (tanpa id eksplisit) tidak bentrok.
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products));

-- Admin default. Password "kopikita-admin" di-hash pakai bcrypt (pgcrypto),
-- bukan disimpan plain text.
INSERT INTO admins (email, password_hash) VALUES
  ('admin@kopikita.id', crypt('kopikita-admin', gen_salt('bf', 10)))
ON CONFLICT (email) DO NOTHING;
