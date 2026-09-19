-- Surveys Database Schema
-- This file contains tables, indexes, and RLS policies for the survey functionality

-- Surveys Table (created by staff, approved/published by admin)
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  questions JSONB DEFAULT '[]'::jsonb,
  admin_notes TEXT,
  CONSTRAINT valid_survey_status CHECK (status IN ('draft', 'pending_approval', 'published', 'rejected', 'archived'))
);

-- Survey Responses Table (responses from residents)
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  responses JSONB DEFAULT '{}'::jsonb,
  score INTEGER,
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys indexes
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_campaign_id ON public.surveys(campaign_id);

-- Survey responses indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON public.survey_responses(user_id);

-- Enable Row Level Security
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Surveys RLS Policies
DROP POLICY IF EXISTS "Public can view published surveys" ON public.surveys;
CREATE POLICY "Public can view published surveys" ON public.surveys FOR SELECT
  TO authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Staff can create surveys" ON public.surveys;
CREATE POLICY "Staff can create surveys" ON public.surveys FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('staff', 'admin', 'super_admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Staff can view own surveys" ON public.surveys;
CREATE POLICY "Staff can view own surveys" ON public.surveys FOR SELECT
  TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Staff can update own draft surveys" ON public.surveys;
CREATE POLICY "Staff can update own draft surveys" ON public.surveys FOR UPDATE
  TO authenticated USING (
    created_by = auth.uid() 
    AND status IN ('draft', 'pending_approval')
  );

DROP POLICY IF EXISTS "Admins can view all surveys" ON public.surveys;
CREATE POLICY "Admins can view all surveys" ON public.surveys FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can approve and publish surveys" ON public.surveys;
CREATE POLICY "Admins can approve and publish surveys" ON public.surveys FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete surveys" ON public.surveys;
CREATE POLICY "Admins can delete surveys" ON public.surveys FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Survey Responses RLS Policies
DROP POLICY IF EXISTS "Users can view own survey responses" ON public.survey_responses;
CREATE POLICY "Users can view own survey responses" ON public.survey_responses FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create survey responses" ON public.survey_responses;
CREATE POLICY "Users can create survey responses" ON public.survey_responses FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can view all survey responses" ON public.survey_responses;
CREATE POLICY "Staff can view all survey responses" ON public.survey_responses FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin', 'super_admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can manage survey responses" ON public.survey_responses;
CREATE POLICY "Admins can manage survey responses" ON public.survey_responses FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );
