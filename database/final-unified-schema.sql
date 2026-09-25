im out you cant fix my problem issue for my render always error for the campaign an approved  this error still the same already 1 hr but you cant fix it {
    "message": "Server Error"
}last time if you cant fix im out ==> Cloning from [https://github.com/Dnielllll/Safety-Campaign](https://github.com/Dnielllll/Safety-Campaign)
==> Checking out commit 4df4285cbea2c93d140817b74bae241c17da1d4f in branch main
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 3.75kB done
#1 DONE 0.0s
#2 [internal] load metadata for docker.io/library/composer:latest
#2 ...
#3 [auth] library/php:pull render-prod/docker-mirror-repository/library/php:pull token for us-west1-docker.pkg.dev
#3 DONE 0.0s
#4 [auth] library/composer:pull render-prod/docker-mirror-repository/library/composer:pull token for us-west1-docker.pkg.dev
#4 DONE 0.0s
#5 [internal] load metadata for docker.io/library/php:8.3-apache
#5 ...
#2 [internal] load metadata for docker.io/library/composer:latest
#2 DONE 1.8s
#5 [internal] load metadata for docker.io/library/php:8.3-apache
#5 DONE 1.9s
#6 [internal] load .dockerignore
#6 transferring context: 2B done
#6 DONE 0.0s
#7 [internal] load build context
#7 DONE 0.0s
#8 [stage-0 1/11] FROM docker.io/library/php:8.3-apache@sha256:257dcf070787a1ffc782d90bd589297b63a007064d024cdfb6d30464836ded56
#8 resolve docker.io/library/php:8.3-apache@sha256:257dcf070787a1ffc782d90bd589297b63a007064d024cdfb6d30464836ded56 done
#8 DONE 0.0s
#9 FROM docker.io/library/composer:latest@sha256:a5f59b9fd2faf31218632be4809dc6491761085e8064c31dc3b84378c48c248b
#9 resolve docker.io/library/composer:latest@sha256:a5f59b9fd2faf31218632be4809dc6491761085e8064c31dc3b84378c48c248b done
#9 DONE 0.0s
#10 importing cache manifest
#10 inferred cache manifest type: application/vnd.oci.image.manifest.v1+json done
#10 DONE 0.1s
#7 [internal] load build context
#7 transferring context: 517.83kB 0.0s done
#7 DONE 0.0s
#11 [stage-0 2/11] RUN apt-get update && apt-get install -y git curl libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev libicu-dev libzip-dev && rm -rf /var/lib/apt/lists/*
#11 CACHED
#12 [stage-0 4/11] COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
#12 CACHED
#13 [stage-0 5/11] RUN a2enmod rewrite
#13 CACHED
#14 [stage-0 6/11] WORKDIR /var/www/html
#14 CACHED
#15 [stage-0 8/11] RUN composer install --optimize-autoloader --no-dev --no-interaction
#15 CACHED
#16 [stage-0 9/11] RUN echo '#!/bin/bash\ncat > .env << EOF\nAPP_ENV=${APP_ENV:-production}\nAPP_DEBUG=${APP_DEBUG:-false}\nAPP_URL=${APP_URL:-http://localhost}\nAPP_KEY=${APP_KEY}\nAPP_LOCALE=${APP_LOCALE:-en}\nAPP_FALLBACK_LOCALE=${APP_FALLBACK_LOCALE:-en}\nAPP_FAKER_LOCALE=en_US\nAPP_MAINTENANCE_DRIVER=file\nBCRYPT_ROUNDS=12\nLOG_CHANNEL=${LOG_CHANNEL:-stack}\nLOG_STACK=${LOG_STACK:-single}\nLOG_DEPRECATIONS_CHANNEL=null\nLOG_LEVEL=${LOG_LEVEL:-debug}\nDB_CONNECTION=${DB_CONNECTION:-pgsql}\nDB_HOST=${DB_HOST}\nDB_PORT=${DB_PORT:-5432}\nDB_DATABASE=${DB_DATABASE:-postgres}\nDB_USERNAME=${DB_USERNAME}\nDB_PASSWORD=${DB_PASSWORD}\nDB_SSLMODE=${DB_SSLMODE:-require}\nSESSION_DRIVER=${SESSION_DRIVER:-cookie}\nSESSION_LIFETIME=120\nSESSION_ENCRYPT=false\nSESSION_PATH=/\nSESSION_DOMAIN=\nBROADCAST_CONNECTION=log\nFILESYSTEM_DISK=local\nQUEUE_CONNECTION=${QUEUE_CONNECTION:-sync}\nCACHE_DRIVER=${CACHE_DRIVER:-file}\nMEMCACHED_HOST=127.0.0.1\nREDIS_CLIENT=phpredis\nREDIS_HOST=127.0.0.1\nREDIS_PASSWORD=null\nREDIS_PORT=6379\nMAIL_MAILER=log\nMAIL_SCHEME=null\nMAIL_HOST=127.0.0.1\nMAIL_PORT=2525\nMAIL_USERNAME=null\nMAIL_PASSWORD=null\nMAIL_FROM_ADDRESS=hello@example.com\nMAIL_FROM_NAME="Barangay 178 SSMS"\nAWS_ACCESS_KEY_ID=\nAWS_SECRET_ACCESS_KEY=\nAWS_DEFAULT_REGION=us-east-1\nAWS_BUCKET=\nAWS_USE_PATH_STYLE_ENDPOINT=false\nVITE_APP_NAME="Barangay 178 SSMS"\nFRONTEND_URL=${FRONTEND_URL}\nSANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS}\nSUPABASE_URL=${SUPABASE_URL}\nSUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}\nSEMAPHORE_API_KEY=\nGOOGLE_CLOUD_API_KEY=\nEOF\n\necho "=== .env file contents ===" >&2\ncat .env >&2\necho "=== End .env file contents ===" >&2\n\napache2-foreground' > /start.sh && chmod +x /start.sh
#16 CACHED
#17 [stage-0 3/11] RUN docker-php-ext-configure pgsql --with-pgsql=/usr/local/pgsql && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd zip intl
#17 CACHED
#18 [stage-0 7/11] COPY backend/ .
#18 CACHED
#19 [stage-0 10/11] RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html/storage && chmod -R 755 /var/www/html/bootstrap/cache && chmod -R 755 /var/www/html/public
#19 CACHED
#20 [stage-0 11/11] RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf && sed -i 's|<Directory /var/www/html>|<Directory /var/www/html/public>|g' /etc/apache2/sites-available/000-default.conf && sed -i 's|AllowOverride None|AllowOverride All|g' /etc/apache2/sites-available/000-default.conf
#20 CACHED
#21 exporting cache to registry
#21 sending cache export
#21 ...
#22 exporting to image
#22 exporting layers done
#22 pushing layers 0.3s done
#22 DONE 0.3s
#21 exporting cache to registry
#21 sending cache export 0.4s done
#21 DONE 0.5s
==> Deploying...
==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
=== .env file contents ===
APP_ENV=production
APP_DEBUG=false
APP_URL=https://barangay178-backend.onrender.com
APP_KEY=base64:6vlhnwZG2q6KBSXBSdD02PrxpAV8FNMyqNcnPJGAfn0=
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US
APP_MAINTENANCE_DRIVER=file
BCRYPT_ROUNDS=12
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug
DB_CONNECTION=pgsql
DB_HOST=zuuwqrxmkeryzbcrlrai.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=superteamdaniel12345
DB_SSLMODE=require
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_DRIVER=file
MEMCACHED_HOST=127.0.0.1
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME="Barangay 178 SSMS"
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false
VITE_APP_NAME="Barangay 178 SSMS"
FRONTEND_URL=https://barangay178-safety-campaign.vercel.app
SANCTUM_STATEFUL_DOMAINS=barangay178-safety-campaign.vercel.app
SUPABASE_URL=https://zuuwqrxmkeryzbcrlrai.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dXdxcnhta2VyeXpiY3JscmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDcxMzAsImV4cCI6MjEwMDI4MzEzMH0.CR289UHP5bxEavCMW1Z0h19Jrf6mm5YFC7NQ8RWkkm0
SEMAPHORE_API_KEY=
GOOGLE_CLOUD_API_KEY=
=== End .env file contents ===
AH00558: apache2: Could not reliably determine the server's fully qualified domain name, using 10.30.112.23. Set the 'ServerName' directive globally to suppress this message
AH00558: apache2: Could not reliably determine the server's fully qualified domain name, using 10.30.112.23. Set the 'ServerName' directive globally to suppress this message
[Wed Sep 23 21:00:05.136571 2026] [mpm_prefork:notice] [pid 9:tid 9] AH00163: Apache/2.4.68 (Debian) PHP/8.3.33 configured -- resuming normal operations
[Wed Sep 23 21:00:05.136620 2026] [core:notice] [pid 9:tid 9] AH00094: Command line: 'apache2 -D FOREGROUND'
::1 - - [23/Sep/2026:21:00:08 +0000] "HEAD / HTTP/1.1" 200 1746 "-" "Go-http-client/1.1"
::1 - - [23/Sep/2026:21:00:12 +0000] "GET / HTTP/1.1" 200 16887 "-" "Go-http-client/2.0"
==> Your service is live 🎉
==>
==> ///////////////////////////////////////////////////////////
==>
==> Available at your primary URL [https://barangay178-backend.onrender.com](https://barangay178-backend.onrender.com/)
==>
==> ///////////////////////////////////////////////////////////-- ============================================================================
-- UNIFIED DATABASE SCHEMA FOR BARANGAY 178 SAFETY CAMPAIGN MANAGEMENT SYSTEM
-- ============================================================================
-- This file contains the complete database structure, RLS policies, functions,
-- indexes, and essential seed data for the entire system.
-- 
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'public', 'citizen', 'super_admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  preferred_language TEXT DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  CONSTRAINT valid_user_language CHECK (preferred_language IN ('en', 'tl'))
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_en TEXT,
  title_tl TEXT,
  description TEXT,
  description_en TEXT,
  description_tl TEXT,
  objectives TEXT,
  objectives_en TEXT,
  objectives_tl TEXT,
  campaign_type TEXT DEFAULT 'community' CHECK (campaign_type IN ('safety', 'health', 'environment', 'emergency', 'community')),
  category TEXT DEFAULT 'community',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'submitted', 'needs_revision', 'approved', 'published', 'rejected', 'archived')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  target_audience TEXT,
  keywords TEXT,
  voice_enabled BOOLEAN DEFAULT false,
  voice_text TEXT,
  voice_language TEXT DEFAULT 'en-US',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Content Table
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('announcement', 'poster', 'infographic', 'video', 'advisory', 'voice_script', 'document', 'image', 'audio', 'text')),
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
  activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Voice Announcements Table
CREATE TABLE IF NOT EXISTS public.voice_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
  voice_name TEXT NOT NULL,
  voice_language TEXT DEFAULT 'fil-PH',
  audio_url TEXT,
  duration INTEGER, -- in seconds
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  title_tl TEXT,
  message TEXT NOT NULL,
  message_en TEXT,
  message_tl TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'campaign', 'emergency')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  channels TEXT[] DEFAULT ARRAY['push'], -- push, email, sms
  recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT,
  responded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'new',
  form_labels_en JSONB DEFAULT '{}'::jsonb,
  form_labels_tl JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Surveys Table
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_en TEXT,
  title_tl TEXT,
  description TEXT,
  description_en TEXT,
  description_tl TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'published', 'rejected', 'archived', 'active', 'closed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  questions JSONB DEFAULT '[]'::jsonb,
  admin_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Survey Questions Table
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('text', 'multiple_choice', 'rating', 'yes_no')),
  options TEXT[], -- for multiple choice questions
  order_index INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Survey Responses Table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  responses JSONB DEFAULT '{}'::jsonb,
  response_data JSONB NOT NULL,
  score INTEGER,
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chatbot Training Table
CREATE TABLE IF NOT EXISTS public.chatbot_training (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
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

-- Audit Logs Table (alternative structure)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Emergency Info Table
CREATE TABLE IF NOT EXISTS public.emergency_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  emergency_type TEXT CHECK (emergency_type IN ('flood', 'fire', 'health', 'crime', 'weather', 'other')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT,
  contact_numbers TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Settings Table (key-value structure)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- BPM Engagement Tracking Module
CREATE TABLE IF NOT EXISTS public.engagement_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL CHECK (action IN (
    'viewed','shared','feedback_submitted','survey_completed',
    'notification_opened','volunteer_registered'
  )),
  channel     TEXT CHECK (channel IN ('web','sms','email','push','in_person')),
  metadata    JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- BPM Campaign Impact Evaluation Module
CREATE TABLE IF NOT EXISTS public.campaign_evaluations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id           UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  evaluator_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  total_reach           INTEGER DEFAULT 0,
  engagement_count      INTEGER DEFAULT 0,
  feedback_count        INTEGER DEFAULT 0,
  average_rating        DECIMAL(3,2),
  effectiveness_score   DECIMAL(5,2),
  accomplishment_report TEXT,
  recommendations       TEXT,
  status                TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','finalized')),
  submitted_at          TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- BPM Volunteer/Community Engagement
CREATE TABLE IF NOT EXISTS public.volunteers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id    UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  volunteer_type TEXT CHECK (volunteer_type IN ('community_volunteer','barangay_tanod','staff')),
  status         TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  registered_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes          TEXT
);

-- Test Table
CREATE TABLE IF NOT EXISTS public.test (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
CREATE INDEX IF NOT EXISTS idx_campaigns_priority ON public.campaigns(priority);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_content_campaign_id ON public.content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(content_type);

-- Voice announcements indexes
CREATE INDEX IF NOT EXISTS idx_voice_announcements_campaign_id ON public.voice_announcements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_voice_announcements_status ON public.voice_announcements(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_campaign_id ON public.notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_campaign_id ON public.feedback(campaign_id);

-- Surveys indexes
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_campaign_id ON public.surveys(campaign_id);

-- Survey questions indexes
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);

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

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- Emergency info indexes
CREATE INDEX IF NOT EXISTS idx_emergency_info_type ON public.emergency_info(emergency_type);
CREATE INDEX IF NOT EXISTS idx_emergency_info_severity ON public.emergency_info(severity);
CREATE INDEX IF NOT EXISTS idx_emergency_info_status ON public.emergency_info(status);

-- Engagement logs indexes
CREATE INDEX IF NOT EXISTS idx_engagement_logs_campaign ON public.engagement_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_user ON public.engagement_logs(user_id);

-- Campaign evaluations indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_campaign ON public.campaign_evaluations(campaign_id);

-- Volunteers indexes
CREATE INDEX IF NOT EXISTS idx_volunteers_user ON public.volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_campaign ON public.volunteers(campaign_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY DEFINER FUNCTIONS (for RLS)
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')
  );
$$;

-- Function to check if user is staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'staff'
  );
$$;

-- Function to check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'staff', 'super_admin', 'superadmin')
  );
$$;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Users RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (public.is_admin());

-- Campaigns RLS Policies
DROP POLICY IF EXISTS "Public can view published campaigns" ON public.campaigns;
CREATE POLICY "Public can view published campaigns" ON public.campaigns
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Staff can view own campaigns" ON public.campaigns;
CREATE POLICY "Staff can view own campaigns" ON public.campaigns
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff', 'super_admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Staff can create campaigns" ON public.campaigns;
CREATE POLICY "Staff can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Staff can update own campaigns" ON public.campaigns;
CREATE POLICY "Staff can update own campaigns" ON public.campaigns
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.campaigns;
CREATE POLICY "Admins can delete campaigns" ON public.campaigns
  FOR DELETE USING (public.is_admin());

-- Content RLS Policies
DROP POLICY IF EXISTS "Users can view content from published campaigns" ON public.content;
CREATE POLICY "Users can view content from published campaigns" ON public.content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = content.campaign_id 
      AND campaigns.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Staff can manage content" ON public.content;
CREATE POLICY "Staff can manage content" ON public.content
  FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "content_insert_policy" ON public.content;
CREATE POLICY "content_insert_policy" ON public.content
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "content_update_policy" ON public.content;
CREATE POLICY "content_update_policy" ON public.content
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "content_delete_policy" ON public.content;
CREATE POLICY "content_delete_policy" ON public.content
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "content_select_policy" ON public.content;
CREATE POLICY "content_select_policy" ON public.content
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "content_public_select_policy" ON public.content;
CREATE POLICY "content_public_select_policy" ON public.content
  FOR SELECT TO anon USING (true);

-- Voice Announcements RLS Policies
DROP POLICY IF EXISTS "Staff can manage voice announcements" ON public.voice_announcements;
CREATE POLICY "Staff can manage voice announcements" ON public.voice_announcements
  FOR ALL USING (public.is_admin_or_staff());

-- Notifications RLS Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Feedback RLS Policies
DROP POLICY IF EXISTS "Users can view all feedback" ON public.feedback;
CREATE POLICY "Users can view all feedback" ON public.feedback
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can submit feedback" ON public.feedback;
CREATE POLICY "Users can submit feedback" ON public.feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage feedback" ON public.feedback;
CREATE POLICY "Admins can manage feedback" ON public.feedback
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Staff can view all feedback" ON public.feedback;
CREATE POLICY "Staff can view all feedback" ON public.feedback
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can update feedback" ON public.feedback;
CREATE POLICY "Staff can update feedback" ON public.feedback
  FOR UPDATE USING (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON public.feedback;
CREATE POLICY "Authenticated users can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view feedback" ON public.feedback;
CREATE POLICY "Authenticated users can view feedback" ON public.feedback
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update feedback" ON public.feedback;
CREATE POLICY "Authenticated users can update feedback" ON public.feedback
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Surveys RLS Policies
DROP POLICY IF EXISTS "Public can view published surveys" ON public.surveys;
CREATE POLICY "Public can view published surveys" ON public.surveys
  FOR SELECT USING (status IN ('published', 'active'));

DROP POLICY IF EXISTS "Staff can create surveys" ON public.surveys;
CREATE POLICY "Staff can create surveys" ON public.surveys
  FOR INSERT WITH CHECK (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Staff can view own surveys" ON public.surveys;
CREATE POLICY "Staff can view own surveys" ON public.surveys
  FOR SELECT USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Staff can update own draft surveys" ON public.surveys;
CREATE POLICY "Staff can update own draft surveys" ON public.surveys
  FOR UPDATE USING (
    created_by = auth.uid() 
    AND status IN ('draft', 'pending_approval')
  );

DROP POLICY IF EXISTS "Admins can view all surveys" ON public.surveys;
CREATE POLICY "Admins can view all surveys" ON public.surveys
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can approve and publish surveys" ON public.surveys;
CREATE POLICY "Admins can approve and publish surveys" ON public.surveys
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete surveys" ON public.surveys;
CREATE POLICY "Admins can delete surveys" ON public.surveys
  FOR DELETE USING (public.is_admin());

-- Survey Questions RLS Policies
DROP POLICY IF EXISTS "Staff can manage survey questions" ON public.survey_questions;
CREATE POLICY "Staff can manage survey questions" ON public.survey_questions
  FOR ALL USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- Survey Responses RLS Policies
DROP POLICY IF EXISTS "Users can view own survey responses" ON public.survey_responses;
CREATE POLICY "Users can view own survey responses" ON public.survey_responses
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all survey responses" ON public.survey_responses;
CREATE POLICY "Admins can view all survey responses" ON public.survey_responses
  FOR SELECT USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Users can submit survey responses" ON public.survey_responses;
CREATE POLICY "Users can submit survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can submit survey responses" ON public.survey_responses;
CREATE POLICY "Users can submit survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view own survey responses" ON public.survey_responses;
CREATE POLICY "Users can view own survey responses" ON public.survey_responses
  FOR SELECT USING (user_id = auth.uid());

-- Chatbot Training RLS Policies
DROP POLICY IF EXISTS "Public can view active training data" ON public.chatbot_training;
CREATE POLICY "Public can view active training data" ON public.chatbot_training
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Staff can manage training data" ON public.chatbot_training;
CREATE POLICY "Staff can manage training data" ON public.chatbot_training
  FOR ALL USING (public.is_admin_or_staff());

-- Audit Trail RLS Policies
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_trail;
CREATE POLICY "Super admins can view all audit logs" ON public.audit_trail
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_trail;
CREATE POLICY "Admins can view audit logs" ON public.audit_trail
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_trail;
CREATE POLICY "System can insert audit logs" ON public.audit_trail
  FOR INSERT WITH CHECK (true);

-- Audit Logs RLS Policies
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Emergency Info RLS Policies
DROP POLICY IF EXISTS "Public can view active emergency info" ON public.emergency_info;
CREATE POLICY "Public can view active emergency info" ON public.emergency_info
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Staff can manage emergency info" ON public.emergency_info;
CREATE POLICY "Staff can manage emergency info" ON public.emergency_info
  FOR ALL USING (public.is_admin_or_staff());

-- System Settings RLS Policies
DROP POLICY IF EXISTS "Super admins can manage system settings" ON public.system_settings;
CREATE POLICY "Super admins can manage system settings" ON public.system_settings
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view system settings" ON public.system_settings;
CREATE POLICY "Users can view system settings" ON public.system_settings
  FOR SELECT USING (true);

-- Settings RLS Policies
DROP POLICY IF EXISTS "Users can view settings" ON public.settings;
CREATE POLICY "Users can view settings" ON public.settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
CREATE POLICY "Admins can update settings" ON public.settings
  FOR UPDATE USING (public.is_admin());

-- Engagement Logs RLS Policies
DROP POLICY IF EXISTS "Users can log engagement" ON public.engagement_logs;
CREATE POLICY "Users can log engagement" ON public.engagement_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff and admins can view engagement" ON public.engagement_logs;
CREATE POLICY "Staff and admins can view engagement" ON public.engagement_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_staff());

-- Campaign Evaluations RLS Policies
DROP POLICY IF EXISTS "Staff and admins can manage evaluations" ON public.campaign_evaluations;
CREATE POLICY "Staff and admins can manage evaluations" ON public.campaign_evaluations
  FOR ALL USING (public.is_admin_or_staff());

-- Volunteers RLS Policies
DROP POLICY IF EXISTS "Public can register as volunteer" ON public.volunteers;
CREATE POLICY "Public can register as volunteer" ON public.volunteers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users and admins can view volunteers" ON public.volunteers;
CREATE POLICY "Users and admins can view volunteers" ON public.volunteers
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_staff());

-- Test Table RLS Policies
DROP POLICY IF EXISTS "Public can view test data" ON public.test;
CREATE POLICY "Public can view test data" ON public.test
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert test data" ON public.test;
CREATE POLICY "Authenticated users can insert test data" ON public.test
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update test data" ON public.test;
CREATE POLICY "Authenticated users can update test data" ON public.test
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, phone, address, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'public'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = COALESCE(EXCLUDED.name, public.users.name),
    phone      = COALESCE(EXCLUDED.phone, public.users.phone),
    address    = COALESCE(EXCLUDED.address, public.users.address),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_updated_at ON public.content;
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_voice_announcements_updated_at ON public.voice_announcements;
CREATE TRIGGER update_voice_announcements_updated_at BEFORE UPDATE ON public.voice_announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_updated_at ON public.feedback;
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_surveys_updated_at ON public.surveys;
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_emergency_info_updated_at ON public.emergency_info;
CREATE TRIGGER update_emergency_info_updated_at BEFORE UPDATE ON public.emergency_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_updated_at ON public.test;
CREATE TRIGGER update_test_updated_at BEFORE UPDATE ON public.test
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_evaluations_updated_at ON public.campaign_evaluations;
CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON public.campaign_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create User by Admin Function
CREATE OR REPLACE FUNCTION public.create_user_by_admin(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT DEFAULT 'staff',
  p_phone TEXT DEFAULT '',
  p_address TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  result  JSON;
BEGIN

  -- Security check: only active admins or superadmins can call this function
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'super_admin') AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Only active admins can create users';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email address % is already registered', p_email;
  END IF;

  -- Step 1: Create auth.users row (bypasses signup restrictions)
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    new_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('name', p_name, 'role', p_role, 'phone', p_phone, 'address', p_address)::jsonb,
    false,
    NOW(),
    NOW(),
    '', '', '', ''
  );

  -- Step 2: Create public.users profile row
  INSERT INTO public.users (
    id, email, name, role, phone, address, is_active, created_at, updated_at
  ) VALUES (
    new_uid, p_email, p_name, p_role,
    NULLIF(p_phone, ''), NULLIF(p_address, ''),
    true, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role       = p_role,
    name       = p_name,
    phone      = NULLIF(p_phone, ''),
    address    = NULLIF(p_address, ''),
    is_active  = true,
    updated_at = NOW();

  result := json_build_object(
    'id',    new_uid,
    'email', p_email,
    'name',  p_name,
    'role',  p_role
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users (RLS inside function handles admin check)
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO authenticated;

-- Delete User by Admin Function
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(p_user_id UUID)
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
CREATE OR REPLACE FUNCTION public.increment_failed_attempts(
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
CREATE OR REPLACE FUNCTION public.reset_login_attempts(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET failed_login_attempts = 0,
      locked_until = NULL
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Validated User Data
CREATE OR REPLACE FUNCTION public.get_validated_user_data(user_id UUID)
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
CREATE OR REPLACE FUNCTION public.validate_user_role(user_id UUID, required_role TEXT)
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
    RETURN user_role IN ('admin', 'super_admin', 'superadmin');
  ELSIF required_role = 'staff' THEN
    RETURN user_role IN ('staff', 'admin', 'super_admin', 'superadmin');
  ELSE
    RETURN user_role = required_role;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REALTIME ENABLEMENT
-- ============================================================================

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.users;           EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;   EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;       EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.engagement_logs; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.test;            EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
  ('system_name', '"Barangay 178 Safety Campaign System"', 'System display name'),
  ('contact_email', '"info@barangay178.gov.ph"', 'Main contact email'),
  ('contact_phone', '"123-4567"', 'Main contact phone'),
  ('emergency_hotline', '"911"', 'Emergency hotline number')
ON CONFLICT (key) DO NOTHING;

-- Seed published campaigns
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Get the first admin user's ID
  SELECT id INTO admin_id FROM public.users WHERE role IN ('admin', 'super_admin', 'superadmin') LIMIT 1;
  
  -- If no admin found, use any user
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM public.users LIMIT 1;
  END IF;

  -- Insert published campaigns using only ALLOWED campaign_type values:
  -- 'safety', 'health', 'environment', 'emergency', 'community'
  INSERT INTO public.campaigns (title, description, campaign_type, status, created_by, created_at, updated_at)
  VALUES
  (
    'Fire Safety Reminders for the Dry Season',
    E'🔥 FIRE SAFETY ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nFire prevention is everyone''s responsibility. Please observe these safety measures:\n\n• Ensure fire extinguishers are accessible and functional\n• Check electrical wiring and avoid overloading outlets\n• Never leave cooking unattended\n• Properly dispose of cigarette butts and matches\n• Keep flammable materials away from heat sources\n\nIn case of fire:\n1. Call emergency services immediately (Bureau of Fire Protection: 160)\n2. Evacuate using the nearest exit\n3. Assist neighbors who may need help\n\nReport fire hazards to the Barangay Fire Safety Officer.\n\nTogether, we can keep Barangay 178 safe!',
    'safety',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Flood Evacuation Route Advisory',
    E'🌧️ FLOOD EVACUATION ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nDue to the rainy season, please be aware of the following evacuation routes:\n\nEvacuation Centers:\n📍 Barangay 178 Hall — Primary center\n📍 Camarin Elementary School — Secondary center\n\nPrecautions:\n• Monitor weather updates through PAGASA\n• Prepare emergency kits with food, water, and medicine\n• Avoid crossing flooded streets and waterways\n• Secure important documents in waterproof containers\n• Residents in low-lying areas (Puroks 1, 3, 5) should evacuate early\n\nFor emergency assistance:\n📞 Barangay Emergency Hotline: 123-4567\n📍 Barangay Hall: Open 24/7 during emergencies\n\nLet us look out for one another. Stay safe, Barangay 178!',
    'emergency',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Dengue Prevention Campaign',
    E'🏥 DENGUE PREVENTION ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nTo protect our community from dengue fever, please practice the 4S strategy:\n\n✅ Search and Destroy — Remove all mosquito breeding sites\n✅ Self-protection — Use mosquito repellent and wear protective clothing\n✅ Seek early consultation — Visit the health center at the first sign of fever\n✅ Say no to indiscriminate fogging\n\nPrevention Tips:\n• Cover water containers tightly\n• Change water in flower vases every week\n• Properly dispose of old tires, cans, and bottles\n• Keep surroundings clean and clutter-free\n\nHealth Services:\n📍 Barangay 178 Health Center: Mon–Fri, 8AM–5PM\n📞 Health Hotline: 987-6543\n\nFree dengue testing available at the Health Center every Tuesday.\n\nYour health is our priority. Stay healthy, Barangay 178!',
    'health',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Community Clean-Up Drive',
    E'🧹 CLEAN-UP DRIVE ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nLet''s keep our community clean and green! Join our monthly clean-up activities:\n\n📅 Every last Saturday of the month, 7:00 AM\n📍 Meeting Point: Barangay Hall\n\nWhat to bring:\n• Gloves and face masks\n• Rakes and brooms (if available)\n• Reusable bags for waste\n\nGuidelines:\n• Segregate waste properly: biodegradable, non-biodegradable, and recyclable\n• Report illegal dumping sites to the Barangay Environmental Officer\n• Maintain cleanliness in front of your homes daily\n\nA clean environment is a healthy environment. Let''s work together for a greener Barangay 178!',
    'environment',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Anti-Drug Awareness Program',
    E'🚫 ANTI-DRUG AWARENESS ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nOur barangay is committed to being drug-free. Here is what you need to know:\n\nDangers of Drug Abuse:\n• Destroys health and family relationships\n• Leads to criminal behavior and imprisonment\n• Affects the entire community''s safety\n\nWhat You Can Do:\n• Report drug activities anonymously to the Barangay Anti-Drug Abuse Council (BADAC)\n• Support community rehabilitation programs\n• Educate your children about the dangers of drugs\n• Participate in Barangay Drug Clearing activities\n\nSupport Services:\n📍 BADAC Office: Barangay Hall, Room 2\n📞 Anonymous Hotline: 0917-DRUG-FREE\n\nTogether, we build a drug-free Barangay 178. Mabuhay!',
    'community',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Road Safety Awareness Campaign',
    E'🚗 ROAD SAFETY ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nYour safety on the road is our priority. Please observe the following:\n\nFor Drivers:\n• Always wear your seatbelt\n• Never use your phone while driving\n• Observe speed limits in residential areas (30 kph)\n• Do not drink and drive\n• Yield to pedestrians at crosswalks\n\nFor Pedestrians:\n• Use designated crosswalks only\n• Look both ways before crossing\n• Do not jaywalk or cross when the light is red\n• Be visible at night — wear bright clothing\n\nFor Motorcycle Riders:\n• Always wear a helmet (both rider and passenger)\n• Avoid weaving through traffic\n\nReport reckless driving to PNP Traffic: 117\n\nLet''s make our roads safer for everyone in Barangay 178!',
    'safety',
    'published',
    admin_id,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Successfully inserted published campaigns!';
END $$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant basic permissions
GRANT ALL ON content TO authenticated;
GRANT ALL ON content TO anon;
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaigns TO anon;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 'Unified database schema created successfully!' AS status;