-- Fix RLS policy for survey_questions table to allow residents to read questions for published surveys
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- Add a policy that allows anyone to read survey questions for published surveys
DROP POLICY IF EXISTS "Public can read survey questions for published surveys" ON public.survey_questions;
CREATE POLICY "Public can read survey questions for published surveys" ON public.survey_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND surveys.status = 'published'
    )
  );
