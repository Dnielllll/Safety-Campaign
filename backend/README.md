<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Deployment Notes

### Production Deployment
- **Render Service**: https://barangay178-backend.onrender.com
- **API Base URL**: https://barangay178-backend.onrender.com/api
- **Environment**: Production
- **PHP Version**: 8.3
- **Web Server**: Apache

### API Endpoints

#### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/me` - Get current user (protected)
- `POST /api/logout` - User logout (protected)

#### Campaigns
- `GET /api/campaigns` - List all campaigns (protected)
- `POST /api/campaigns` - Create campaign (protected)
- `GET /api/campaigns/{id}` - Get specific campaign (protected)
- `PUT /api/campaigns/{id}` - Update campaign (protected)
- `DELETE /api/campaigns/{id}` - Delete campaign (protected)
- `GET /api/campaigns/approved` - Get approved campaigns (protected)
- `GET /api/campaigns/resident-phone-numbers` - Get resident phone numbers (protected)
- `POST /api/campaigns/{id}/approve` - Approve campaign (protected)
- `POST /api/campaigns/{id}/reject` - Reject campaign (protected)
- `POST /api/campaigns/{id}/request-revision` - Request campaign revision (protected)
- `POST /api/campaigns/distribute-sms` - Distribute campaign via SMS (public)

#### Content
- `GET /api/contents` - List all content (protected)
- `POST /api/contents` - Create content (protected)
- `GET /api/contents/{id}` - Get specific content (protected)
- `PUT /api/contents/{id}` - Update content (protected)
- `DELETE /api/contents/{id}` - Delete content (protected)
- `GET /api/campaigns/{campaignId}/contents` - Get campaign content (protected)

#### AI Services
- `POST /api/ai/text-to-speech` - Convert text to speech (protected)
- `POST /api/ai/generate-text` - Generate AI text (protected)
- `POST /api/ai/rewrite` - Rewrite text with AI (protected)

#### Workflow
- `GET /api/workflow/metrics` - Get workflow metrics (public)
- `POST /api/workflow/escalation-check` - Run escalation check (public)

#### Health
- `GET /api/health` - Health check endpoint (public)

### Recent Updates
- Added campaign approval API endpoints (approve, reject, request-revision)
- Enhanced logging for campaign operations
- Fixed RLS policy issues for admin campaign updates
- Added workflow metrics and escalation check endpoints
- Integrated Supabase REST API for data operations

### Environment Configuration
The backend uses environment variables for configuration:
- Database: Supabase PostgreSQL
- Authentication: Laravel Sanctum + Supabase Auth
- File Storage: Local filesystem
- Cache: File-based cache
- Queue: Database queue
- Session: Cookie-based sessions

### Deployment Process
1. Code is pushed to GitHub main branch
2. Render automatically detects the push
3. Build process runs: `composer install --optimize-autoloader --no-dev`
4. Docker image is built and deployed
5. Environment variables are injected from Render dashboard
6. Apache server starts with the application
