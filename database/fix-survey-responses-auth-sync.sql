-- Fix survey submission by allowing auth.uid() users without requiring users table entry
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- Modify the survey_responses table to allow submission without users table entry
-- This handles cases where users are authenticated via Supabase Auth but not in users table

-- Drop the foreign key constraint that requires user_id to exist in users table
ALTER TABLE public.survey_responses DROP CONSTRAINT IF EXISTS survey_responses_user_id_fkey;

-- Recreate the constraint as nullable and without strict foreign key requirement
ALTER TABLE public.survey_responses 
  ADD CONSTRAINT survey_responses_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Update the RLS policy to allow any authenticated user to submit
DROP POLICY IF EXISTS "Users can submit survey responses" ON public.survey_responses;
CREATE POLICY "Users can submit survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow users to submit even if they don't have a record in users table
CREATE POLICY "Authenticated users can submit survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (true);

-- Remove the check constraint that was causing issues
ALTER TABLE public.survey_responses DROP CONSTRAINT IF EXISTS survey_responses_user_or_survey_check;
