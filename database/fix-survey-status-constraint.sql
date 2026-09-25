-- Fix the surveys status check constraint to include pending_approval
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- Drop the existing check constraint
ALTER TABLE public.surveys DROP CONSTRAINT IF EXISTS surveys_status_check;

-- Add the correct check constraint with all valid statuses
ALTER TABLE public.surveys 
ADD CONSTRAINT surveys_status_check 
CHECK (status IN ('draft', 'pending_approval', 'published', 'rejected', 'archived', 'active', 'closed'));
