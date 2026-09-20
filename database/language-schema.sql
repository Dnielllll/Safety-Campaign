-- Language Support Schema
-- This file contains schema changes to support English (EN) and Tagalog (TL) language switching
-- across the entire Barangay 178 Safety Campaign System

-- ============================================
-- CAMPAIGNS TABLE LANGUAGE FIELDS
-- ============================================

-- Add language-specific fields to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_tl TEXT,
ADD COLUMN IF NOT EXISTS objectives_en TEXT,
ADD COLUMN IF NOT EXISTS objectives_tl TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_tl TEXT;

-- ============================================
-- CONTENT TABLE LANGUAGE FIELDS
-- ============================================

-- Add language-specific fields to content table
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS content_en TEXT,
ADD COLUMN IF NOT EXISTS content_tl TEXT,
ADD COLUMN IF NOT EXISTS heading_en TEXT,
ADD COLUMN IF NOT EXISTS heading_tl TEXT;

-- ============================================
-- NOTIFICATIONS TABLE LANGUAGE FIELDS
-- ============================================

-- Add language-specific fields to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_tl TEXT,
ADD COLUMN IF NOT EXISTS message_en TEXT,
ADD COLUMN IF NOT EXISTS message_tl TEXT;

-- ============================================
-- EMERGENCY INFO TABLE LANGUAGE FIELDS
-- ============================================

-- Add language-specific fields to emergency info (if table exists)
-- Note: You may need to create this table if it doesn't exist yet
-- ALTER TABLE public.emergency_info 
-- ADD COLUMN IF NOT EXISTS info_en TEXT,
-- ADD COLUMN IF NOT EXISTS info_tl TEXT;

-- ============================================
-- FEEDBACK TEMPLATE LANGUAGE FIELDS
-- ============================================

-- Add language-specific fields to feedback (for form labels/messages)
ALTER TABLE public.feedback 
ADD COLUMN IF NOT EXISTS form_labels_en JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS form_labels_tl JSONB DEFAULT '{}'::jsonb;

-- ============================================
-- SURVEYS TABLE LANGUAGE FIELDS
-- ============================================

-- Add language-specific fields to surveys table
ALTER TABLE public.surveys 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_tl TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_tl TEXT;

-- ============================================
-- SYSTEM SETTINGS LANGUAGE PREFERENCES
-- ============================================

-- Add language settings to system_settings
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS language_settings JSONB DEFAULT 
  '{"default_language": "en", "supported_languages": ["en", "tl"], "auto_detect": true}'::jsonb;

-- ============================================
-- USER LANGUAGE PREFERENCES
-- ============================================

-- Add language preference to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
ADD CONSTRAINT valid_user_language CHECK (preferred_language IN ('en', 'tl'));

-- ============================================
-- INDEXES FOR LANGUAGE FIELDS
-- ============================================

-- Create indexes for frequently queried language fields
CREATE INDEX IF NOT EXISTS idx_campaigns_title_en ON public.campaigns(title_en);
CREATE INDEX IF NOT EXISTS idx_campaigns_title_tl ON public.campaigns(title_tl);
CREATE INDEX IF NOT EXISTS idx_content_content_en ON public.content(content_en);
CREATE INDEX IF NOT EXISTS idx_content_content_tl ON public.content(content_tl);
CREATE INDEX IF NOT EXISTS idx_notifications_title_en ON public.notifications(title_en);
CREATE INDEX IF NOT EXISTS idx_notifications_title_tl ON public.notifications(title_tl);

-- ============================================
-- MIGRATION DATA POPULATION
-- ============================================

-- Minimal migration - just set English fields to existing values where safe
-- Skip complex migrations to avoid errors

-- Campaigns - migrate title and description only (skip objectives for now)
UPDATE public.campaigns 
SET 
    title_en = COALESCE(title_en, title),
    description_en = COALESCE(description_en, description)
WHERE title_en IS NULL OR description_en IS NULL;

UPDATE public.campaigns 
SET 
    title_tl = COALESCE(title_tl, title),
    description_tl = COALESCE(description_tl, description)
WHERE title_tl IS NULL OR description_tl IS NULL;

-- Notifications - migrate title and message
UPDATE public.notifications 
SET 
    title_en = COALESCE(title_en, title),
    message_en = COALESCE(message_en, message)
WHERE title_en IS NULL OR message_en IS NULL;

UPDATE public.notifications 
SET 
    title_tl = COALESCE(title_tl, title),
    message_tl = COALESCE(message_tl, message)
WHERE title_tl IS NULL OR message_tl IS NULL;

-- Surveys - migrate title and description
UPDATE public.surveys 
SET 
    title_en = COALESCE(title_en, title),
    description_en = COALESCE(description_en, description)
WHERE title_en IS NULL OR description_en IS NULL;

UPDATE public.surveys 
SET 
    title_tl = COALESCE(title_tl, title),
    description_tl = COALESCE(description_tl, description)
WHERE title_tl IS NULL OR description_tl IS NULL;

-- Content table and feedback table - skip data migration
-- You can manually populate these fields as needed

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Ensure RLS policies still work with new language fields
-- Existing policies should still work since we only added optional fields

-- ============================================
-- SAMPLE TRANSLATIONS (UPDATE WITH REAL TRANSLATIONS)
-- ============================================

-- Example: Update sample campaign with real Tagalog translation
-- UPDATE public.campaigns 
-- SET title_tl = 'Mga Tip sa Kaligtasan ng Sunog',
--     description_tl = 'Mahalagang impormasyon tungkol sa kaligtasan ng sunog para sa mga residente.'
-- WHERE title_en = 'Fire Safety Tips';

-- ============================================
-- VIEWS FOR LANGUAGE-QUERIES
-- ============================================

-- Create view for English campaigns
CREATE OR REPLACE VIEW public.campaigns_en AS
SELECT 
  id,
  title_en as title,
  objectives_en as objectives,
  description_en as description,
  category,
  status,
  created_by,
  created_at,
  updated_at
FROM public.campaigns
WHERE title_en IS NOT NULL;

-- Create view for Tagalog campaigns
CREATE OR REPLACE VIEW public.campaigns_tl AS
SELECT 
  id,
  title_tl as title,
  objectives_tl as objectives,
  description_tl as description,
  category,
  status,
  created_by,
  created_at,
  updated_at
FROM public.campaigns
WHERE title_tl IS NOT NULL;

-- ============================================
-- TRIGGERS FOR AUTOMATIC TRANSLATION
-- ============================================

-- (Optional) Create trigger to auto-populate English fields when content is added
-- This is a placeholder - you may want to implement actual translation service integration

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Function to clean up language data if needed
CREATE OR REPLACE FUNCTION public.cleanup_language_data()
RETURNS void AS $$
BEGIN
  -- Remove duplicate or empty language entries
  -- Add cleanup logic as needed
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTES FOR IMPLEMENTATION
-- ============================================

-- 1. After running this schema, you need to:
--    - Add actual Tagalog translations to the _tl fields
--    - Update frontend to use language-specific fields
--    - Implement language toggle in UI
--    - Update voice synthesis to use correct language

-- 2. Default behavior:
--    - If Tagalog translation is missing, fall back to English
--    - User language preference stored in users.preferred_language
--    - Global default language in system_settings.language_settings

-- 3. Voice synthesis considerations:
--    - English: 'en-US' or 'en-GB'
--    - Tagalog: 'fil-PH' (if available) or fallback to English
--    - Check browser support for Tagalog voices

-- 4. Testing:
--    - Test language switching across all pages
--    - Test voice announcements in both languages
--    - Test fallback behavior when translations are missing
--    - Test user preference persistence