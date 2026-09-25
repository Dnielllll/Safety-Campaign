-- Fix RLS policies for survey_responses table to allow residents to submit survey responses
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- Drop all existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Admins can view all survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Users can submit survey responses" ON public.survey_responses;

-- Recreate policies without duplicates
-- Users can view their own survey responses
CREATE POLICY "Users can view own survey responses" ON public.survey_responses
  FOR SELECT USING (user_id = auth.uid());

-- Admins and staff can view all survey responses
CREATE POLICY "Admins can view all survey responses" ON public.survey_responses
  FOR SELECT USING (public.is_admin_or_staff());

-- Users can submit survey responses (any authenticated user)
CREATE POLICY "Users can submit survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
