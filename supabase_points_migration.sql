-- ============================================================
-- SUPABASE MIGRATION - Member Points & Membership System
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add points columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS total_poin INTEGER DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Bronze';

-- 2. Create point_transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poin INTEGER NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('earn', 'redeem')),
  sumber TEXT NOT NULL,
  -- sumber examples: 'transaksi', 'bonus_registrasi', 'referral', 'ulang_tahun', 'redeem'
  keterangan TEXT,
  transaksi_id UUID, -- optional link to related transaction
  nominal_transaksi NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on point_transactions
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Allow select for owner or admin" ON public.point_transactions;
CREATE POLICY "Allow select for owner or admin" ON public.point_transactions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Allow insert for system" ON public.point_transactions;
CREATE POLICY "Allow insert for system" ON public.point_transactions
  FOR INSERT WITH CHECK (true);

-- 5. Create function to auto-add points on transaction completion
CREATE OR REPLACE FUNCTION public.add_points_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_poin INTEGER;
BEGIN
  -- Calculate points: Rp10.000 = 1 poin
  v_poin := FLOOR(NEW.amount / 10000)::INTEGER;
  
  -- Only add points if transaction is completed/lunas
  IF NEW.status = 'Lunas' OR NEW.status = 'Selesai' THEN
    -- Add points to user's profile
    UPDATE public.profiles
    SET total_poin = COALESCE(total_poin, 0) + v_poin
    WHERE user_id = NEW.member_id;
    
    -- Record point transaction
    INSERT INTO public.point_transactions (user_id, poin, jenis, sumber, keterangan, transaksi_id, nominal_transaksi)
    VALUES (NEW.member_id, v_poin, 'earn', 'transaksi', 
            CONCAT('Mendapatkan ', v_poin, ' poin dari transaksi ', NEW.invoice_no, ' sebesar Rp', NEW.amount),
            NEW.id, NEW.amount);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger on bills table
DROP TRIGGER IF EXISTS on_bill_completed ON public.bills;
CREATE TRIGGER on_bill_completed
  AFTER INSERT OR UPDATE OF status ON public.bills
  FOR EACH ROW
  WHEN (NEW.status = 'Lunas' OR NEW.status = 'Selesai')
  EXECUTE FUNCTION public.add_points_on_transaction();

-- 7. Update existing profiles with default values
UPDATE public.profiles SET total_poin = 0 WHERE total_poin IS NULL;
UPDATE public.profiles SET tier = 'Bronze' WHERE tier IS NULL;

-- 8. Enable Realtime for point_transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.point_transactions;

-- 9. Bonus: Create function to get member tier based on points
CREATE OR REPLACE FUNCTION public.get_member_tier(p_poin INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_poin >= 1000 THEN RETURN 'Gold';
  ELSIF p_poin >= 500 THEN RETURN 'Silver';
  ELSE RETURN 'Bronze';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
