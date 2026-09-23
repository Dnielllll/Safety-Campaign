-- Fix: Add RLS policy to allow admins to update any campaign
-- This fixes the "Server Error" when approving campaigns

DROP POLICY IF EXISTS "Admins can update any campaign" ON public.campaigns;
CREATE POLICY "Admins can update any campaign" ON public.campaigns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')
    )
  );
