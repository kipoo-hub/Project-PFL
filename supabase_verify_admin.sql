-- ============================================================
-- VERIFIKASI — Cek role admin@gmail.com di database
-- ============================================================
-- Jalankan query ini satu per satu di Supabase SQL Editor

-- 1. Cek profile admin@gmail.com
SELECT user_id, email, name, role, created_at
FROM public.profiles
WHERE email = 'admin@gmail.com';

-- 2. Cek apakah ada BARIS DUPLIKAT (user_id berbeda untuk email yang sama)
SELECT user_id, email, name, role, created_at
FROM public.profiles
WHERE email LIKE '%admin%'
ORDER BY created_at DESC;

-- 3. Cek metadata auth user
SELECT id, email, raw_user_meta_data->>'role' as metadata_role
FROM auth.users
WHERE email = 'admin@gmail.com';

-- 4. Cek semua user dan role-nya (untuk lihat kalau ada akun lain dengan email mirip)
SELECT p.email, p.name, p.role, p.user_id, u.id as auth_user_id
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at DESC;
