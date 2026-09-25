-- Fix RLS policy for survey_questions table to allow INSERT operations
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

DROP POLICY IF EXISTS "Staff can manage survey questions" ON public.survey_questions;
CREATE POLICY "Staff can manage survey questions" ON public.survey_questions
  FOR ALL USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());