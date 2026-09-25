-- Add missing score column to survey_responses table
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- Add the score column if it doesn't exist
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS score INTEGER;

-- Also ensure other required columns exist
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS comments TEXT;

ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
