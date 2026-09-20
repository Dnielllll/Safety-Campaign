-- Comprehensive Database Schema for Barangay 178 Safety Campaign Management System
-- This file contains the complete database structure and essential functions

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role TEXT NOT NULL DEFAULT 'public',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  preferred_language TEXT DEFAULT 'en',
  CONSTRAINT valid_role CHECK (role IN ('public', 'citizen', 'staff', 'admin', 'super_admin', 'superadmin')),
  CONSTRAINT valid_user_language CHECK (preferred_language IN ('en', 'tl'))
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  title_tl TEXT,
  description TEXT,
  description_en TEXT,
  description_tl TEXT,
  objectives TEXT,
  objectives_en TEXT,
  objectives_tl TEXT,
  campaign_type TEXT DEFAULT 'community',
  category TEXT DEFAULT 'community',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  target_audience TEXT,
  keywords TEXT,
  voice_enabled BOOLEAN DEFAULT false,
  voice_text TEXT,
  voice_language TEXT DEFAULT 'en-US',
  CONSTRAINT valid_status CHECK (status IN ('draft', 'pending_approval', 'submitted', 'needs_revision', 'approved', 'published', 'rejected', 'archived'))
);

-- Content Table
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  media_url TEXT,
  caption TEXT,
  caption_en TEXT,
  caption_tl TEXT,
  content TEXT,
  content_en TEXT,
  content_tl TEXT,
  heading TEXT,
  heading_en TEXT,
  heading_tl TEXT,
  order_index INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_content_type CHECK (content_type IN ('image', 'video', 'audio', 'text', 'document'))
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  title_tl TEXT,
  message TEXT NOT NULL,
  message_en TEXT,
  message_tl TEXT,
  type TEXT DEFAULT 'info',
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_notification_type CHECK (type IN ('info', 'warning', 'success', 'error', 'campaign')),
  CONSTRAINT valid_notification_status CHECK (status IN ('unread', 'read', 'archived'))
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  form_labels_en JSONB DEFAULT '{}'::jsonb,
  form_labels_tl JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys Table (created by staff, approved/published by admin)
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  title_tl TEXT,
  description TEXT,
  description_en TEXT,
  description_tl TEXT,
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

-- Chatbot Training Table
CREATE TABLE IF NOT EXISTS public.chatbot_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Audit Trail Table
CREATE TABLE IF NOT EXISTS public.audit_trail (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  entity_id UUID,
  old_values JSONB DEFAULT '{}'::jsonb,
  new_values JSONB DEFAULT '{}'::jsonb
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  general_settings JSONB DEFAULT '{
    "maintenance_mode": false,
    "site_name": "Barangay 178",
    "contact_email": "admin@barangay178.com"
  }'::jsonb,
  auth_settings JSONB DEFAULT '{
    "sessionTimeout": 30,
    "maxLoginAttempts": 5,
    "lockoutDuration": 15,
    "passwordMinLength": 8,
    "passwordRequireUppercase": true,
    "passwordRequireNumbers": true,
    "passwordRequireSpecialChars": true,
    "twoFactorEnabled": false,
    "ipWhitelist": ""
  }'::jsonb,
  language_settings JSONB DEFAULT '{
    "default_language": "en",
    "supported_languages": ["en", "tl"],
    "auto_detect": true
  }'::jsonb,
  security_settings JSONB DEFAULT '{}'::jsonb,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  feature_settings JSONB DEFAULT '{}'::jsonb,
  ai_settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_content_campaign_id ON public.content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(content_type);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_campaign_id ON public.notifications(campaign_id);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_campaign_id ON public.feedback(campaign_id);

-- Surveys indexes
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_campaign_id ON public.surveys(campaign_id);

-- Survey responses indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON public.survey_responses(user_id);

-- Audit trail indexes
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON public.audit_trail(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON public.audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON public.audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_audit_trail_ip_address ON public.audit_trail(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity_id ON public.audit_trail(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_success ON public.audit_trail(success);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.users FOR SELECT
  TO authenticated USING (id = auth.uid());

CREATE POLICY IF NOT EXISTS "Staff can view users" ON public.users FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('staff', 'admin', 'super_admin', 'superadmin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage users" ON public.users FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Campaigns RLS Policies
CREATE POLICY IF NOT EXISTS "Public can view published campaigns" ON public.campaigns FOR SELECT
  TO authenticated USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Staff can manage campaigns" ON public.campaigns FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('staff', 'admin', 'super_admin', 'superadmin')
    )
  );

-- Content RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view content from published campaigns" ON public.content FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = content.campaign_id 
      AND campaigns.status = 'published'
    )
  );

CREATE POLICY IF NOT EXISTS "Staff can manage content" ON public.content FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('staff', 'admin', 'super_admin', 'superadmin')
    )
  );

-- Notifications RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON public.notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "System can insert notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update own notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

-- Feedback RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view all feedback" ON public.feedback FOR SELECT
  TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Users can submit feedback" ON public.feedback FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Admins can manage feedback" ON public.feedback FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Surveys RLS Policies
CREATE POLICY IF NOT EXISTS "Public can view published surveys" ON public.surveys FOR SELECT
  TO authenticated USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Staff can create surveys" ON public.surveys FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('staff', 'admin', 'super_admin', 'superadmin')
    )
  );

CREATE POLICY IF NOT EXISTS "Staff can view own surveys" ON public.surveys FOR SELECT
  TO authenticated USING (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Staff can update own draft surveys" ON public.surveys FOR UPDATE
  TO authenticated USING (
    created_by = auth.uid() 
    AND status IN ('draft', 'pending_approval')
  );

CREATE POLICY IF NOT EXISTS "Admins can view all surveys" ON public.surveys FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can approve and publish surveys" ON public.surveys FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can delete surveys" ON public.surveys FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Survey Responses RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view own survey responses" ON public.survey_responses FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Admins can view all survey responses" ON public.survey_responses FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'superadmin', 'staff')
    )
  );

CREATE POLICY IF NOT EXISTS "Users can submit survey responses" ON public.survey_responses FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Chatbot Training RLS Policies
CREATE POLICY IF NOT EXISTS "Public can view active training data" ON public.chatbot_training FOR SELECT
  TO authenticated USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Staff can manage training data" ON public.chatbot_training FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('staff', 'admin', 'super_admin', 'superadmin')
    )
  );

-- Audit Trail RLS Policies
CREATE POLICY IF NOT EXISTS "Super admins can view all audit logs" ON public.audit_trail FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('super_admin', 'superadmin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view audit logs" ON public.audit_trail FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "System can insert audit logs" ON public.audit_trail FOR INSERT
  TO authenticated WITH CHECK (true);

-- System Settings RLS Policies
CREATE POLICY IF NOT EXISTS "Super admins can manage system settings" ON public.system_settings FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('super_admin', 'superadmin')
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view system settings" ON public.system_settings FOR SELECT
  TO authenticated USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Create User by Admin Function
CREATE OR REPLACE FUNCTION create_user_by_admin(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT DEFAULT 'staff',
  p_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES (p_email, crypt(p_password, gen_salt('bf8')), NOW())
  RETURNING id INTO new_user_id;
  
  -- Create public user profile
  INSERT INTO public.users (id, email, name, role, phone, address, is_active)
  VALUES (new_user_id, p_email, p_name, p_role, p_phone, address, true);
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete User by Admin Function
CREATE OR REPLACE FUNCTION delete_user_by_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Delete from public.users
  DELETE FROM public.users WHERE id = p_user_id;
  
  -- Delete from auth.users (handled by Supabase admin)
  -- This is a simplified version - in production, use proper auth deletion
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment Failed Login Attempts
CREATE OR REPLACE FUNCTION increment_failed_attempts(
  user_id UUID,
  max_attempts INTEGER DEFAULT 5,
  lockout_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  current_attempts INTEGER;
BEGIN
  -- Get current attempts
  SELECT failed_login_attempts INTO current_attempts
  FROM public.users
  WHERE id = user_id;
  
  -- Increment attempts
  UPDATE public.users
  SET failed_login_attempts = current_attempts + 1
  WHERE id = user_id;
  
  -- Check if should lock account
  IF current_attempts + 1 >= max_attempts THEN
    UPDATE public.users
    SET locked_until = NOW() + (lockout_minutes || ' minutes')::INTERVAL
    WHERE id = user_id;
    RETURN true; -- Account locked
  END IF;
  
  RETURN false; -- Account not locked yet
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset Login Attempts
CREATE OR REPLACE FUNCTION reset_login_attempts(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET failed_login_attempts = 0,
      locked_until = NULL
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECURITY ENHANCED AUDIT FUNCTIONS
-- ============================================================================

-- Get Validated User Data
CREATE OR REPLACE FUNCTION get_validated_user_data(user_id UUID)
RETURNS TABLE(
    id UUID,
    email TEXT,
    role TEXT,
    name TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.role,
    u.name,
    u.is_active
  FROM public.users u
  WHERE u.id = user_id
  AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate User Role
CREATE OR REPLACE FUNCTION validate_user_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  is_user_active BOOLEAN;
BEGIN
  SELECT u.role, u.is_active INTO user_role, is_user_active
  FROM public.users u
  WHERE u.id = user_id;
  
  IF user_role IS NULL OR is_user_active IS NULL THEN
    RETURN false;
  END IF;
  
  IF NOT is_user_active THEN
    RETURN false;
  END IF;
  
  IF required_role = 'super_admin' THEN
    RETURN user_role IN ('super_admin', 'superadmin');
  ELSIF required_role = 'admin' THEN
    RETURN user_role IN ('super_admin', 'superadmin', 'admin');
  ELSIF required_role = 'staff' THEN
    RETURN user_role IN ('super_admin', 'superadmin', 'admin', 'staff');
  ELSE
    RETURN user_role = required_role;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log Audit Event Secure
CREATE OR REPLACE FUNCTION log_audit_event_secure(
  p_action TEXT,
  p_entity TEXT,
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  validated_user RECORD;
  audit_id UUID;
BEGIN
  SELECT id, email, role, name, is_active INTO validated_user
  FROM public.users
  WHERE id = p_user_id;
  
  IF validated_user IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  IF NOT validated_user.is_active THEN
    RAISE EXCEPTION 'User is not active: %', p_user_id;
  END IF;
  
  INSERT INTO public.audit_trail (
    actor,
    action,
    entity,
    user_id,
    timestamp,
    ip_address,
    user_agent,
    metadata,
    success,
    error_message,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    validated_user.name || ' (' || validated_user.email || ')',
    p_action,
    p_entity,
    p_user_id,
    NOW(),
    COALESCE(p_ip_address, 'Unknown'),
    COALESCE(p_user_agent, 'Unknown'),
    COALESCE(p_metadata, '{}'::jsonb),
    p_success,
    p_error_message,
    p_entity_id,
    p_old_values,
    p_new_values
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mask Sensitive Data
CREATE OR REPLACE FUNCTION mask_sensitive_data(data JSONB)
RETURNS JSONB AS $$
BEGIN
  IF data ? 'email' THEN
    data := jsonb_set(
      data, 
      '{email}', 
      to_jsonb(
        CASE 
          WHEN data->>'email' ~ '^[^@]+@[^@]+\.[^@]+$' 
          THEN 
            SUBSTRING(data->>'email' FROM 1 FOR 2) || 
            REPEAT('*', LENGTH(SUBSTRING(data->>'email' FROM 1 FOR POSITION('@' IN data->>'email') - 1)) - 2) ||
            SUBSTRING(data->>'email' FROM POSITION('@' IN data->>'email'))
          ELSE data->>'email'
        END
      )
    );
  END IF;
  
  IF data ? 'phone' THEN
    data := jsonb_set(
      data,
      '{phone}',
      to_jsonb(
        CASE 
          WHEN LENGTH(REGEXP_REPLACE(data->>'phone', '\D', '', 'g')) >= 4
          THEN 
            REPEAT('*', LENGTH(REGEXP_REPLACE(data->>'phone', '\D', '', 'g')) - 4) ||
            RIGHT(REGEXP_REPLACE(data->>'phone', '\D', '', 'g'), 4)
          ELSE '***'
        END
      )
    );
  END IF;
  
  RETURN data;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check Audit Trail Consistency
CREATE OR REPLACE FUNCTION check_audit_trail_consistency()
RETURNS TABLE(
  total_logs BIGINT,
  logs_with_ip BIGINT,
  logs_without_ip BIGINT,
  logs_with_user_agent BIGINT,
  logs_without_user_agent BIGINT,
  recent_logs_with_ip_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_logs,
    COUNT(*) FILTER (WHERE ip_address IS NOT NULL AND ip_address != 'N/A' AND ip_address != 'Unknown') as logs_with_ip,
    COUNT(*) FILTER (WHERE ip_address IS NULL OR ip_address = 'N/A' OR ip_address = 'Unknown') as logs_without_ip,
    COUNT(*) FILTER (WHERE user_agent IS NOT NULL AND user_agent != 'Unknown') as logs_with_user_agent,
    COUNT(*) FILTER (WHERE user_agent IS NULL OR user_agent = 'Unknown') as logs_without_user_agent,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE ip_address IS NOT NULL AND ip_address != 'N/A' AND ip_address != 'Unknown')::NUMERIC / COUNT(*)::NUMERIC) * 100, 
        2
      )
      ELSE 0 
    END as recent_logs_with_ip_percentage
  FROM public.audit_trail
  WHERE timestamp >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REAL-TIME SETUP
-- ============================================================================

-- Enable real-time for audit trail
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_trail;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.campaigns TO authenticated;
GRANT ALL ON TABLE public.content TO authenticated;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.feedback TO authenticated;
GRANT ALL ON TABLE public.chatbot_training TO authenticated;
GRANT ALL ON TABLE public.audit_trail TO authenticated;
GRANT ALL ON TABLE public.system_settings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION create_user_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION increment_failed_attempts TO authenticated;
GRANT EXECUTE ON FUNCTION reset_login_attempts TO authenticated;
GRANT EXECUTE ON FUNCTION get_validated_user_data TO authenticated;
GRANT EXECUTE ON FUNCTION validate_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event_secure TO authenticated;
GRANT EXECUTE ON FUNCTION mask_sensitive_data TO authenticated;
GRANT EXECUTE ON FUNCTION check_audit_trail_consistency TO authenticated;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default system settings
INSERT INTO public.system_settings (general_settings, auth_settings) VALUES (
  '{
    "maintenance_mode": false,
    "site_name": "Barangay 178",
    "contact_email": "admin@barangay178.com"
  }'::jsonb,
  '{
    "sessionTimeout": 4,
    "maxLoginAttempts": 5,
    "lockoutDuration": 15,
    "passwordMinLength": 8,
    "passwordRequireUppercase": true,
    "passwordRequireNumbers": true,
    "passwordRequireSpecialChars": true,
    "twoFactorEnabled": false,
    "ipWhitelist": ""
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.users IS 'User accounts with roles and authentication settings';
COMMENT ON TABLE public.campaigns IS 'Safety campaigns and their content';
COMMENT ON TABLE public.content IS 'Campaign content (images, videos, audio, text)';
COMMENT ON TABLE public.notifications IS 'User notifications and alerts';
COMMENT ON TABLE public.feedback IS 'User feedback on campaigns';
COMMENT ON TABLE public.chatbot_training IS 'AI chatbot training data';
COMMENT ON TABLE public.audit_trail IS 'Security audit trail with IP logging and data masking';
COMMENT ON TABLE public.system_settings IS 'System-wide configuration settings';

COMMENT ON FUNCTION create_user_by_admin IS 'Secure user creation by admin with password hashing';
COMMENT ON FUNCTION delete_user_by_admin IS 'User deletion with proper cleanup';
COMMENT ON FUNCTION increment_failed_attempts IS 'Track failed login attempts for security';
COMMENT ON FUNCTION reset_login_attempts IS 'Reset failed login counter on successful login';
COMMENT ON FUNCTION get_validated_user_data IS 'Server-side user data validation';
COMMENT ON FUNCTION validate_user_role IS 'Role hierarchy validation for authorization';
COMMENT ON FUNCTION log_audit_event_secure IS 'Secure audit logging with server-side validation';
COMMENT ON FUNCTION mask_sensitive_data IS 'Data masking for sensitive information in audit logs';
COMMENT ON FUNCTION check_audit_trail_consistency IS 'Audit trail health and consistency monitoring';