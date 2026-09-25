-- Fix RLS policies for survey_responses to allow staff to view all responses
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- Drop all existing select policies first
DROP POLICY IF EXISTS "Users can view own survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Admins can view all survey responses" ON public.survey_responses;

-- Recreate policies
-- Users can view their own survey responses
CREATE POLICY "Users can view own survey responses" ON public.survey_responses
  FOR SELECT USING (user_id = auth.uid());

-- Admins and staff can view all survey responses
CREATE POLICY "Admins can view all survey responses" ON public.survey_responses
  FOR SELECT USING (public.is_admin_or_staff());
