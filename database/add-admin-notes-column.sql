-- Add admin_notes column to surveys table if it doesn't exist
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'surveys' 
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN admin_notes TEXT;
    END IF;
END $$;
