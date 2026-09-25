-- Add admin_notes column to surveys and campaigns tables if they don't exist
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- Add admin_notes to surveys table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'surveys' 
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN admin_notes TEXT;
        RAISE NOTICE 'admin_notes column added to surveys table';
    ELSE
        RAISE NOTICE 'admin_notes column already exists in surveys table';
    END IF;
END $$;

-- Add admin_notes to campaigns table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE public.campaigns ADD COLUMN admin_notes TEXT;
        RAISE NOTICE 'admin_notes column added to campaigns table';
    ELSE
        RAISE NOTICE 'admin_notes column already exists in campaigns table';
    END IF;
END $$;

-- Verify the columns were added
SELECT 'surveys' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'surveys' 
AND column_name = 'admin_notes'
UNION ALL
SELECT 'campaigns' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name = 'admin_notes';
