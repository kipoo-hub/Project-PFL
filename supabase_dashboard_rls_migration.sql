-- ============================================================
-- SUPABASE MIGRATION — Remove Protection for Dashboard Page
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Drop constraints on public.profiles table to allow 'guest' role in check constraints
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT constraint_name
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'profiles' AND column_name = 'role'
    LOOP
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'member', 'guest'));

-- 2. Drop existing RLS SELECT policies on public.profiles
DROP POLICY IF EXISTS "Allow select for owner or admin" ON public.profiles;

-- 3. Create a new select policy allowing all authenticated users to read all profiles (required for dashboard counts)
CREATE POLICY "Allow select for all authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- 4. Create an update policy allowing owners or admin to update profiles
DROP POLICY IF EXISTS "Allow update for owner or admin" ON public.profiles;
CREATE POLICY "Allow update for owner or admin" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 5. Alternatively, if you want to completely disable RLS on profiles to avoid any policy issues:
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
