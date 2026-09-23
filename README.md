# Barangay 178 Safety Campaign Management System

## 🏘️ System Overview

The Barangay 178 Safety Campaign Management System is a comprehensive digital platform designed to modernize public safety communication for Barangay 178, Camarin, North Caloocan City. This system integrates artificial intelligence, cloud-based text-to-speech technology, and real-time notification systems to enhance community safety and emergency response.

### 🎯 Core Purpose

**Accessibility & Inclusion**: Convert written public safety announcements into spoken audio using Google Cloud Text-to-Speech, making information accessible to senior citizens, visually impaired residents, and individuals who prefer listening over reading.

**Emergency Communication**: Support voice announcements during emergencies and community events for immediate dissemination of critical information.

**AI-Powered Assistance**: Provide residents with an AI Safety Assistant (Chatbot) for quick access to safety tips, emergency procedures, and guidance on submitting concerns to the barangay.

**Streamlined Management**: Enable barangay officials to efficiently create, approve, distribute, and monitor safety campaigns through a centralized dashboard.

## 🛠️ Technology Stack

|| Layer | Technology | Purpose |
||---|---|---|
|| **Frontend** | React + Vite, Tailwind CSS, shadcn/ui | Modern, responsive user interface |
|| **Backend** | Laravel (PHP 8.3) + Apache | RESTful API and business logic |
|| **Database** | Supabase (PostgreSQL) | Secure data storage and real-time sync |
|| **Authentication** | Supabase Auth + Laravel Sanctum | Secure user authentication with OTP |
|| **Real-time** | Supabase Realtime | Live updates and notifications |
|| **AI Services** | Google Cloud Text-to-Speech | Voice generation for campaigns |
|| **Email Service** | EmailJS | OTP and notification delivery |
|| **Deployment** | Render (Backend) + Vercel (Frontend) | Cloud hosting and CI/CD |
|| **Version Control** | Git + GitHub | Code management and collaboration |

## 🌐 Deployment Architecture

### Production Environment
- **Frontend**: https://barangay178-safety-campaign.vercel.app
- **Backend API**: https://barangay178-backend.onrender.com/api
- **Database**: Supabase PostgreSQL (zuuwqrxmkeryzbcrlrai.supabase.co)
- **Authentication**: Supabase Auth with email OTP

### Development Workflow
1. **Frontend Development**: Local React development with Vite
2. **Backend Development**: Local Laravel development with PHP 8.3
3. **Database Management**: Supabase Dashboard for direct database operations
4. **Deployment**: Git push triggers automatic deployments on Render and Vercel
5. **Monitoring**: Render logs and Vercel analytics for system health

## 👥 User Roles & Permissions

### 1. Super Admin
- **Full System Control**: Complete access to all modules and settings
- **User Management**: Create, edit, delete all user accounts
- **System Configuration**: Manage authentication, security, and AI/TTS settings
- **Audit Oversight**: Monitor all system activities and security events
- **Database Management**: Direct database access and maintenance

### 2. Admin
- **User Management**: Create and manage staff and resident accounts
- **Campaign Oversight**: Approve/reject campaign submissions
- **Content Management**: Manage system content and resources
- **Analytics & Reports**: View comprehensive system analytics
- **Notification Control**: Manage system-wide notifications
- **System Settings**: Configure basic system parameters

### 3. Staff
- **Campaign Creation**: Draft and submit safety campaigns
- **AI Assistance**: Use AI assistant for content generation
- **Content Submission**: Submit campaigns for admin approval
- **Monitoring**: Track notification delivery and feedback
- **Limited Reports**: Access basic reporting features

### 4. Public User (Resident)
- **Campaign Viewing**: Access approved safety campaigns
- **Voice Announcements**: Listen to AI-generated voice content
- **Notifications**: Receive safety alerts and updates
- **Feedback**: Submit concerns, surveys, and feedback
- **Emergency Info**: Access emergency procedures and contacts

## 🔐 Security & Authentication

### Multi-Factor Authentication
- **Admin Users**: Direct login with email and password
- **Staff & Residents**: Two-factor authentication with email OTP
- **OTP System**: 3-minute validity with automatic cleanup
- **Bypass Feature**: 3-minute grace period after accidental logout

### Session Management
- **Automatic Timeout**: Session expiration after inactivity
- **Secure Logout**: Complete session cleanup on logout
- **Audit Trail**: Comprehensive logging of all authentication events
- **Theme Security**: System resets to secure default theme on logout

### Data Protection
- **Secure Storage**: Encrypted password storage in Supabase Auth
- **Role-Based Access**: Strict permission controls per user role
- **Audit Logging**: Complete activity tracking for security compliance
- **Secure Deletion**: Proper data cleanup when users are removed
- **Row-Level Security**: PostgreSQL RLS policies for data access control

## 📢 Core Features

### 1. Campaign Management
- **Creation**: Draft safety campaigns with rich text content
- **AI Integration**: Generate campaign content using AI assistance
- **Approval Workflow**: Staff submission → Admin review → Publication
- **Multi-format Support**: Text, images, and voice announcements
- **Scheduling**: Schedule campaigns for future deployment
- **Status Tracking**: Draft → Submitted → Pending Approval → Published/Rejected

### 2. Voice Automation
- **Text-to-Speech**: Convert campaign text to natural voice audio
- **Multiple Voices**: Support for different voice profiles and languages
- **Quality Control**: Adjustable speech rate and voice parameters
- **Cloud Processing**: Leverage Google Cloud TTS for high-quality audio
- **Accessibility**: Make content accessible to visually impaired residents

### 3. Notification System
- **Multi-Channel**: Email, in-app, and voice notifications
- **Targeted Delivery**: Send to specific user groups or areas
- **Real-time Updates**: Instant notification delivery via Supabase Realtime
- **Delivery Tracking**: Monitor notification status and engagement
- **Emergency Alerts**: Priority routing for urgent communications

### 4. AI Safety Assistant
- **24/7 Availability**: Always-on chatbot for resident assistance
- **Safety Tips**: Provide instant safety guidance and procedures
- **Emergency Guidance**: Step-by-step emergency instructions
- **Concern Submission**: Guide residents through reporting processes
- **Natural Language**: Conversational interface for easy interaction

### 5. Analytics & Reporting
- **Campaign Performance**: Track reach, engagement, and effectiveness
- **User Analytics**: Monitor user activity and system usage
- **Feedback Analysis**: Analyze resident feedback and survey responses
- **Audit Reports**: Generate compliance and security reports
- **Custom Dashboards**: Role-specific analytics views

### 6. User Management
- **Account Creation**: Secure user registration and onboarding
- **Role Assignment**: Assign appropriate permissions and access levels
- **Module Control**: Grant access to specific system modules
- **Activity Monitoring**: Track user actions and system usage
- **Bulk Operations**: Manage multiple users efficiently

## 🏗️ System Architecture

### Frontend Structure
```
frontend/
├── src/
│   ├── components/          Reusable UI components
│   │   ├── ui/             shadcn/ui component library
│   │   └── AIChatbot.jsx   AI assistant interface
│   ├── layouts/            Page layout templates
│   │   ├── DashboardLayout.jsx
│   │   └── PublicLayout.jsx
│   ├── pages/              Route-based page components
│   │   ├── admin/          Admin dashboard and management
│   │   ├── staff/          Staff workflow pages
│   │   ├── public/         Resident-facing pages
│   │   └── Login.jsx       Authentication pages
│   ├── hooks/              Custom React hooks
│   │   └── useAuth.jsx     Authentication management
│   ├── lib/                Utility libraries
│   │   ├── supabase.js     Database client
│   │   └── ai.js          AI service integration
│   └── routes/             Navigation guards
│       └── RequireRole.jsx  Role-based access control
```

### Backend Structure
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php       Authentication endpoints
│   │   │       ├── CampaignController.php  Campaign management
│   │   │       ├── ContentController.php   Content operations
│   │   │       ├── WorkflowController.php  Approval workflow
│   │   │       └── AIController.php        AI services
│   │   └── Middleware/
│   ├── Models/              Eloquent models
│   └── Services/            Business logic services
├── routes/
│   ├── api.php              API routes
│   └── web.php              Web routes
├── database/
│   └── migrations/          Database schema migrations
└── config/                  Application configuration
```

### Database Schema
- **Users**: User accounts, roles, and permissions
- **Campaigns**: Safety campaign content and metadata
- **Content**: Campaign content (text, images, audio)
- **Notifications**: Notification history and delivery status
- **Feedback**: Resident feedback and survey responses
- **Audit Trail**: System activity and security logs
- **System Settings**: Configuration parameters and preferences
- **Voice Announcements**: TTS audio files and metadata

### Security Layers
1. **Authentication Layer**: Supabase Auth with OTP verification
2. **Authorization Layer**: Role-based access control (RBAC)
3. **Data Layer**: Row-level security policies in PostgreSQL
4. **Network Layer**: HTTPS encryption and secure API calls
5. **Application Layer**: Client-side validation and sanitization
6. **API Layer**: Laravel Sanctum for API authentication

## 🚀 Key Capabilities

### Real-Time Operations
- **Live Updates**: Instant data synchronization across all users
- **Real-time Notifications**: Immediate alert delivery
- **Collaborative Editing**: Multiple users can work simultaneously
- **Status Tracking**: Live monitoring of campaign and notification status

### AI Integration
- **Content Generation**: AI-assisted campaign creation
- **Voice Synthesis**: Natural-sounding text-to-speech conversion
- **Smart Recommendations**: AI-powered safety suggestions
- **Natural Language Processing**: Conversational chatbot interface

### Scalability
- **Cloud Infrastructure**: Built on scalable cloud services
- **Database Optimization**: Efficient queries and indexing
- **Load Balancing**: Supabase automatic scaling
- **Performance Monitoring**: Built-in analytics and performance tracking

### Accessibility
- **Voice Support**: Audio content for visually impaired users
- **Responsive Design**: Mobile-friendly interface
- **Multi-language Ready**: Architecture supports multiple languages
- **Keyboard Navigation**: Full keyboard accessibility support

## 📊 System Modules

### Admin Modules
1. **User Management**: Complete user account administration
2. **Campaign Management**: Campaign oversight and approval
3. **Campaign Approval**: Review and approve submitted campaigns
4. **Content Management**: System content and resources
5. **Analytics & Reports**: Comprehensive system analytics
6. **Notification Management**: System-wide notification control
7. **Feedback Management**: Resident feedback analysis
8. **System Settings**: Configuration and preferences
9. **Audit Trail**: Security and activity monitoring
10. **Security Center**: Advanced security management
11. **Database Management**: Direct database operations

### Staff Modules
1. **Campaign Creation**: Draft and submit safety campaigns
2. **Campaign Submission**: Submit campaigns for admin approval
3. **AI Assistant**: AI-powered content generation
4. **Content Management**: Basic content operations
5. **Notification Monitoring**: Track notification delivery
6. **Feedback Management**: Handle resident feedback
7. **Basic Reports**: Access to essential analytics

### Public Modules
1. **Public Dashboard**: Resident landing page
2. **Safety Campaigns**: View approved campaigns
3. **Voice Announcements**: Listen to audio content
4. **Notifications**: Receive safety alerts
5. **Feedback**: Submit concerns and surveys
6. **Emergency Info**: Access emergency procedures
7. **Profile**: Personal account management

## 🔧 Technical Implementation

### Authentication Flow
1. **Email Entry**: User enters email address
2. **Role Detection**: System checks user role in database
3. **OTP Generation**: For staff/residents, generate 6-digit OTP
4. **Email Delivery**: Send OTP via EmailJS service
5. **OTP Verification**: User enters OTP within 3-minute window
6. **Password Authentication**: User enters password for final verification
7. **Session Creation**: Establish secure session with appropriate permissions
8. **Bypass Activation**: Store verification timestamp for 3-minute grace period

### Campaign Creation Process
1. **Content Drafting**: Staff creates campaign content
2. **AI Enhancement**: Optional AI assistance for content improvement
3. **Voice Generation**: Convert text to speech using Google Cloud TTS
4. **Submission**: Submit campaign for admin review
5. **Review Process**: Admin reviews and approves/rejects campaign
6. **Scheduling**: Set deployment date and time
7. **Distribution**: Send notifications to target audience
8. **Monitoring**: Track engagement and delivery status
9. **Analytics**: Generate performance reports

### Campaign Approval Workflow
1. **Submission**: Staff submits campaign with status "submitted"
2. **Pending Review**: Campaign moves to "pending_approval" status
3. **Admin Review**: Admin reviews campaign content and details
4. **Decision**: Admin can approve, reject, or request revision
5. **Approval**: Campaign status changes to "published"
6. **Notification**: Users are notified of new published campaign
7. **Revision**: If changes needed, status becomes "needs_revision"
8. **Resubmission**: Staff can revise and resubmit campaign

### Notification Delivery
1. **Target Selection**: Define recipient groups (residents, areas, roles)
2. **Content Preparation**: Format message for each channel
3. **Multi-Channel Delivery**: Send via email, in-app, and voice
4. **Real-time Tracking**: Monitor delivery status and engagement
5. **Feedback Collection**: Gather responses and interactions
6. **Analytics Generation**: Create delivery and engagement reports

## 📈 System Benefits

### For Barangay Officials
- **Efficiency**: Streamlined campaign creation and distribution
- **Reach**: Wider audience through multiple communication channels
- **Analytics**: Data-driven decision making with comprehensive reports
- **Control**: Centralized management of all safety communications
- **Compliance**: Audit trail for regulatory requirements
- **Modernization**: Digital transformation of barangay services

### For Residents
- **Accessibility**: Voice content for visually impaired users
- **Timeliness**: Real-time emergency alerts and safety updates
- **Convenience**: 24/7 AI assistance for safety information
- **Engagement**: Easy feedback submission and concern reporting
- **Awareness**: Comprehensive access to safety campaigns
- **Inclusion**: Multi-format content for different needs

### For the Community
- **Safety**: Improved emergency response and preparedness
- **Inclusion**: Accessible information for all residents
- **Communication**: Transparent and timely barangay updates
- **Engagement**: Increased resident participation in safety initiatives
- **Modernization**: Digital transformation of barangay services

## 🛠️ Setup & Installation

### Prerequisites
- Node.js and npm
- PHP 8.3 and Composer
- Supabase account and project
- Google Cloud Text-to-Speech API credentials
- EmailJS account for email services
- Render account for backend deployment
- Vercel account for frontend deployment

### Quick Start
1. **Clone Repository**: `git clone https://github.com/Dnielllll/Safety-Campaign.git`
2. **Install Frontend Dependencies**: `cd frontend && npm install`
3. **Install Backend Dependencies**: `cd backend && composer install`
4. **Configure Environment**: Set up `.env.local` (frontend) and `.env` (backend) with API keys
5. **Database Setup**: Run SQL scripts in Supabase SQL Editor
6. **Start Frontend Development**: `cd frontend && npm run dev`
7. **Start Backend Development**: `cd backend && php artisan serve`
8. **Access System**: Open http://localhost:5173

### Environment Variables

#### Frontend (.env.local)
```env
VITE_API_URL=https://barangay178-backend.onrender.com/api
VITE_SUPABASE_URL=https://zuuwqrxmkeryzbcrlrai.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
```

#### Backend (.env)
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://barangay178-backend.onrender.com
APP_KEY=your_laravel_app_key
DB_CONNECTION=pgsql
DB_HOST=zuuwqrxmkeryzbcrlrai.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_supabase_password
SUPABASE_URL=https://zuuwqrxmkeryzbcrlrai.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=https://barangay178-safety-campaign.vercel.app
SANCTUM_STATEFUL_DOMAINS=barangay178-safety-campaign.vercel.app
```

## 🔄 Maintenance & Updates

### Regular Maintenance
- **Database Backups**: Automated daily backups via Supabase
- **Security Updates**: Regular dependency updates and security patches
- **Performance Monitoring**: Track system performance and optimize
- **User Support**: Address user issues and feature requests
- **Content Updates**: Regular safety campaign updates

### System Monitoring
- **Uptime Tracking**: Monitor system availability via Render dashboard
- **Error Logging**: Comprehensive error tracking via Laravel logs
- **Performance Metrics**: Track response times and user experience
- **Security Audits**: Regular security reviews and penetration testing
- **Usage Analytics**: Monitor system adoption and engagement

### Deployment Process
1. **Development**: Make changes in respective branches
2. **Testing**: Test changes locally and in staging
3. **Commit**: Commit changes with descriptive messages
4. **Push**: Push to GitHub main branch
5. **Auto-Deploy**: Render and Vercel automatically deploy
6. **Monitor**: Check deployment logs and system health
7. **Verify**: Test new features in production

## 🐛 Troubleshooting

### Common Issues

#### Campaign Approval Server Error
**Problem**: "Server Error" when approving campaigns
**Solution**: 
1. Ensure RLS policy is applied in Supabase
2. Run SQL: `DROP POLICY IF EXISTS "Admins can update any campaign" ON public.campaigns; CREATE POLICY "Admins can update any campaign" ON public.campaigns FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')));`
3. Redeploy backend on Render

#### Authentication Issues
**Problem**: OTP not receiving or expiring
**Solution**:
1. Check EmailJS configuration
2. Verify email delivery settings
3. Check OTP validity period (3 minutes)
4. Ensure database user roles are correct

#### Database Connection Issues
**Problem**: Unable to connect to Supabase
**Solution**:
1. Verify Supabase credentials in .env files
2. Check database connection settings
3. Ensure RLS policies allow necessary operations
4. Verify network connectivity

## 📞 Support & Documentation

### Technical Support
- **Database Issues**: Refer to troubleshooting section or check Supabase logs
- **Authentication Problems**: Check OTP and email configuration
- **Performance Issues**: Review system metrics and optimize database queries
- **Feature Requests**: Submit through project issue tracker on GitHub

### Documentation
- **API Documentation**: Backend API endpoints and usage
- **Database Schema**: Complete database structure and relationships
- **User Guides**: Role-specific user manuals
- **Admin Documentation**: System administration procedures
- **Developer Guide**: Code structure and contribution guidelines

### Contact Information
- **GitHub Repository**: https://github.com/Dnielllll/Safety-Campaign
- **Frontend URL**: https://barangay178-safety-campaign.vercel.app
- **Backend API**: https://barangay178-backend.onrender.com/api
- **Support Email**: admin@barangay178.com

---

**Version**: 2.0.0  
**Last Updated**: 2026-09-24  
**Maintained By**: Barangay 178 IT Team  
**License**: Proprietary - Barangay 178 Use Only  
**Deployment Status**: Production (Render + Vercel + Supabase)