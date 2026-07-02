-- ============================================================
-- SUPABASE MIGRATION — Set admin@gmail.com sebagai Admin
-- ============================================================
-- CARA PAKAI:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Copy seluruh script ini
-- 3. Jalankan (Ctrl+Enter / Cmd+Enter)
-- 4. Login dengan email: admin@gmail.com dan password yang sudah didaftarkan
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_profile_exists BOOLEAN;
BEGIN
  -- 1. Cari user di auth.users berdasarkan email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'admin@gmail.com';

  -- 2. Jika user tidak ditemukan, tampilkan pesan error
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User dengan email admin@gmail.com belum terdaftar.';
    RAISE NOTICE 'Silakan daftarkan akun admin@gmail.com terlebih dahulu melalui halaman Register,';
    RAISE NOTICE 'setelah itu jalankan script ini lagi.';
    RETURN;
  END IF;

  -- 3. Cek apakah profile sudah ada
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = v_user_id) INTO v_profile_exists;

  -- 4. Update atau insert profile dengan role = 'admin'
  IF v_profile_exists THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE user_id = v_user_id;

    RAISE NOTICE '✅ Role admin@gmail.com berhasil diupdate menjadi admin!';
  ELSE
    INSERT INTO public.profiles (user_id, email, name, role, created_at)
    VALUES (v_user_id, 'admin@gmail.com', 'Admin', 'admin', NOW());

    RAISE NOTICE '✅ Profil admin@gmail.com berhasil dibuat dengan role admin!';
  END IF;

  -- 5. Tampilkan informasi user
  RAISE NOTICE '──────────────────────────────────────';
  RAISE NOTICE 'User ID : %', v_user_id;
  RAISE NOTICE 'Email   : admin@gmail.com';
  RAISE NOTICE 'Role    : admin';
  RAISE NOTICE '──────────────────────────────────────';
  RAISE NOTICE 'Silakan login dengan email & password admin@gmail.com';
  RAISE NOTICE 'Anda akan diarahkan ke /dashboard.';
END;
$$;
