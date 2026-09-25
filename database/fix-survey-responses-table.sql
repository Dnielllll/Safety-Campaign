-- Fix survey_responses table to ensure proper constraints and defaults
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- Remove the duplicate 'responses' column and keep only 'response_data'
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS responses;

-- Ensure response_data has a proper default if needed
ALTER TABLE public.survey_responses ALTER COLUMN response_data SET DEFAULT '{}'::jsonb;

-- Ensure survey_id has proper foreign key constraint
ALTER TABLE public.survey_responses 
  ADD CONSTRAINT survey_responses_survey_id_fkey 
  FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;

-- Make user_id nullable for unauthenticated users if needed, but require for authenticated
ALTER TABLE public.survey_responses ALTER COLUMN user_id DROP NOT NULL;

-- Add check constraint to ensure at least user_id or survey_id is provided
ALTER TABLE public.survey_responses 
  ADD CONSTRAINT survey_responses_user_or_survey_check 
  CHECK (user_id IS NOT NULL OR survey_id IS NOT NULL);
