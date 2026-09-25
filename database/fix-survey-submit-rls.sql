-- Fix RLS policy for surveys to allow staff to submit draft surveys for review
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- Drop and recreate the staff update policy with proper WITH CHECK
DROP POLICY IF EXISTS "Staff can update own draft surveys" ON public.surveys;
CREATE POLICY "Staff can update own draft surveys" ON public.surveys
  FOR UPDATE USING (
    created_by = auth.uid() 
    AND status IN ('draft', 'pending_approval')
  )
  WITH CHECK (
    created_by = auth.uid() 
    AND status IN ('draft', 'pending_approval')
  );
