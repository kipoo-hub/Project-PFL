-- ============================================================
-- SUPABASE QUERY — Cek Semua User & Role di Tabel Profiles
-- ============================================================
-- CARA PAKAI:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Copy dan jalankan query di bawah
-- 3. Lihat hasilnya di tab "Results"
-- ============================================================

-- Query 1: Semua user dengan role, lengkap
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.name,
  p.role,
  p.total_poin,
  p.tier,
  p.created_at,
  p.updated_at
FROM public.profiles p
ORDER BY p.role, p.name;

-- Query 2: Ringkasan jumlah per role
SELECT 
  p.role,
  COUNT(*) as jumlah_user
FROM public.profiles p
GROUP BY p.role
ORDER BY p.role;

-- Query 3: Cek user spesifik (ganti email sesuai kebutuhan)
-- SELECT * FROM public.profiles WHERE email = 'admin@gmail.com';

-- Query 4 (Optional): Join dengan auth.users untuk lihat info konfirmasi email
-- SELECT 
--   au.email,
--   au.confirmed_at,
--   au.last_sign_in_at,
--   p.role,
--   p.name
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON p.user_id = au.id
-- ORDER BY au.created_at DESC;
