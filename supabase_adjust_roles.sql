-- ============================================================
-- SUPABASE MIGRATION — Atur Role Akun Admin dan Member
-- ============================================================
-- CARA PAKAI:
-- 1. Buka Supabase Dashboard Anda.
-- 2. Masuk ke menu SQL Editor -> New Query.
-- 3. Salin dan tempel (copy-paste) seluruh isi script di bawah ini.
-- 4. Jalankan script (klik Run / tekan Ctrl+Enter).
-- ============================================================

DO $$
DECLARE
  v_admin_email TEXT := 'admin@gmail.com'; -- Ganti dengan email admin Anda
  v_admin_id UUID;
  v_profile_exists BOOLEAN;
BEGIN
  -- 1. Cek apakah user admin terdaftar di auth.users
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = v_admin_email;

  IF v_admin_id IS NULL THEN
    RAISE NOTICE 'Peringatan: Akun dengan email % belum terdaftar di Auth Supabase.', v_admin_email;
    RAISE NOTICE 'Silakan daftarkan akun tersebut terlebih dahulu melalui halaman Register.';
  ELSE
    -- Cek apakah profil untuk admin sudah ada di public.profiles
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = v_admin_id) INTO v_profile_exists;

    -- Jika profil ada, update role menjadi 'admin'
    IF v_profile_exists THEN
      UPDATE public.profiles
      SET role = 'admin', name = 'Admin'
      WHERE user_id = v_admin_id;
    ELSE
      -- Jika profil belum ada, buat baru dengan role 'admin'
      INSERT INTO public.profiles (user_id, email, name, role, created_at, total_poin, tier)
      VALUES (v_admin_id, v_admin_email, 'Admin', 'admin', NOW(), 0, 'Bronze');
    END IF;
    
    RAISE NOTICE '✅ Akun % berhasil disetel sebagai ADMIN.', v_admin_email;
  END IF;

  -- 2. Ubah semua akun lain (selain admin) menjadi role 'member'
  UPDATE public.profiles
  SET role = 'member'
  WHERE email != v_admin_email OR email IS NULL;

  RAISE NOTICE '✅ Semua akun selain % berhasil disetel/diperbarui sebagai MEMBER.', v_admin_email;
END;
$$;

-- ============================================================
-- VERIFIKASI HASIL: Tampilkan seluruh akun beserta role-nya
-- ============================================================
SELECT 
  id,
  user_id,
  email,
  name,
  role,
  created_at
FROM public.profiles
ORDER BY role ASC, created_at DESC;
