-- ============================================================
-- SQL REFACTOR MIGRATION - Role-Based Auth & Activity Logging
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('guest', 'member', 'admin')),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Modify existing foreign keys to point to auth.users(id)
ALTER TABLE public.pasien DROP CONSTRAINT IF EXISTS pasien_member_id_fkey;
ALTER TABLE public.pasien ADD CONSTRAINT pasien_member_id_fkey FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.jadwal_temu DROP CONSTRAINT IF EXISTS jadwal_temu_member_id_fkey;
ALTER TABLE public.jadwal_temu ADD CONSTRAINT jadwal_temu_member_id_fkey FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.vaksin DROP CONSTRAINT IF EXISTS vaksin_member_id_fkey;
ALTER TABLE public.vaksin ADD CONSTRAINT vaksin_member_id_fkey FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.medical_records DROP CONSTRAINT IF EXISTS medical_records_member_id_fkey;
ALTER TABLE public.medical_records ADD CONSTRAINT medical_records_member_id_fkey FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_member_id_fkey;
ALTER TABLE public.chats ADD CONSTRAINT chats_member_id_fkey FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_member_id_fkey;
ALTER TABLE public.bills ADD CONSTRAINT bills_member_id_fkey FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.pipeline_members DROP CONSTRAINT IF EXISTS pipeline_members_member_id_fkey;
ALTER TABLE public.pipeline_members ADD CONSTRAINT pipeline_members_member_id_fkey FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Set up Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'member'),
    COALESCE(new.raw_user_meta_data->>'name', 'New Member'),
    new.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Policies for profiles
DROP POLICY IF EXISTS "Allow select for owner or admin" ON public.profiles;
CREATE POLICY "Allow select for owner or admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Allow update for owner or admin" ON public.profiles;
CREATE POLICY "Allow update for owner or admin" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Allow public insert for trigger" ON public.profiles;
CREATE POLICY "Allow public insert for trigger" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 7. Setup RLS Policies for activity_logs
DROP POLICY IF EXISTS "Allow insert for all" ON public.activity_logs;
CREATE POLICY "Allow insert for all" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for admin" ON public.activity_logs;
CREATE POLICY "Allow select for admin" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 8. Enable Realtime for activity_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
