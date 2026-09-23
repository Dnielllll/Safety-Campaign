# Microservices — Barangay 178 Safety Campaign System

This directory contains independent microservices for the Barangay 178 Safety Campaign Management System. **Note: The current production deployment uses a monolithic Laravel backend. The microservices architecture is an alternative deployment pattern for scalability and modularity.**

## Current Architecture Status

### Production Deployment (Active)
- **Architecture**: Monolithic Laravel Backend
- **Backend**: https://barangay178-backend.onrender.com/api
- **Frontend**: https://barangay178-safety-campaign.vercel.app
- **Database**: Supabase PostgreSQL
- **Status**: ✅ Production Ready

### Microservices Architecture (Alternative)
- **Architecture**: Distributed microservices with API Gateway
- **Status**: 🚧 Development/Testing Phase
- **Use Case**: For enhanced scalability and service isolation

## Microservices Architecture Overview

```
Internet
    │
    ▼
┌─────────────────────────────────┐
│     Nginx API Gateway :8080     │  routes by path prefix
└──┬──────┬──────┬──────┬────────┘
   │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼
auth   campaign content workflow notification
svc     svc      svc     svc      svc
:8001  :8002    :8003   :8004    :3001
(PHP)  (PHP)    (PHP)   (PHP)   (Node)
   │      │      │      │
   └──────┴──────┴──┬───┘
                    │
              ┌─────▼──────┐
              │  PostgreSQL │  (shared Supabase DB)
              │   :5432     │
              └─────────────┘
```

## Services

|| Directory | Port | Tech | Domain | Status |
||---|---|---|---|---|
|| [`api-gateway/`](api-gateway/) | 8080 | Nginx | Reverse proxy / routing | 🚧 Development |
|| [`auth-service/`](auth-service/) | 8001 | Laravel + Sanctum | Auth: login, register, me, logout | 🚧 Development |
|| [`campaign-service/`](campaign-service/) | 8002 | Laravel | Campaign CRUD + approval workflow | 🚧 Development |
|| [`content-service/`](content-service/) | 8003 | Laravel | Content CRUD per campaign | 🚧 Development |
|| [`workflow-service/`](workflow-service/) | 8004 | Laravel | SLA metrics + escalation checks | 🚧 Development |
|| [`notification-service/`](notification-service/) | 3001 | Node.js + Express | Async bulk SMS (iProg + Semaphore) | 🚧 Development |
|| [`shared/`](shared/) | — | — | Shared nginx config | 🚧 Development |

## Service Responsibilities

### Auth Service (Port 8001)
- User authentication and authorization
- JWT token management
- User registration and profile management
- Session management
- OTP verification for staff/residents

### Campaign Service (Port 8002)
- Campaign CRUD operations
- Campaign approval workflow
- Campaign status management
- Campaign search and filtering
- Campaign analytics

### Content Service (Port 8003)
- Content CRUD operations per campaign
- Media file management
- Content versioning
- Content approval workflow
- Multi-format content support

### Workflow Service (Port 8004)
- SLA monitoring and metrics
- Escalation checks and alerts
- Process monitoring
- Performance analytics
- Timeout detection

### Notification Service (Port 3001)
- SMS distribution via iProg
- Bulk SMS operations
- Email notifications
- Push notifications
- Notification delivery tracking

### API Gateway (Port 8080)
- Request routing and load balancing
- Authentication middleware
- Rate limiting
- Request/response logging
- API versioning

## Running Microservices (Development Only)

### With Docker Compose (recommended for microservices testing)

```bash
# From the repo root
cp .env.example .env
# Edit .env with your secrets

docker compose up --build
```

Services will be available at:
- **API Gateway**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Individual service development

Each service can run standalone:

```bash
# Auth Service
cd services/auth-service
cp .env.example .env
composer install
php artisan key:generate
php artisan serve --port=8001

# Campaign Service
cd services/campaign-service
cp .env.example .env
composer install
php artisan key:generate
php artisan serve --port=8002

# Notification Service
cd services/notification-service
cp .env.example .env
npm install
npm run dev
```

## API Routes (via Gateway)

All requests go to `http://localhost:8080`:

```
# Auth
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me                 (Bearer token required)
POST   /api/auth/logout             (Bearer token required)

# Campaigns
GET    /api/campaigns               (Bearer token required)
POST   /api/campaigns               (Bearer token required)
GET    /api/campaigns/{id}          (Bearer token required)
PUT    /api/campaigns/{id}          (Bearer token required)
DELETE /api/campaigns/{id}          (Bearer token required)
GET    /api/campaigns/approved      (Bearer token required)
GET    /api/campaigns/resident-phone-numbers  (Bearer token required)
POST   /api/campaigns/{id}/approve  (Bearer token required)
POST   /api/campaigns/{id}/reject   (Bearer token required)
POST   /api/campaigns/{id}/request-revision (Bearer token required)

# Content
GET    /api/contents                (Bearer token required)
POST   /api/contents                (Bearer token required)
GET    /api/contents/{id}           (Bearer token required)
PUT    /api/contents/{id}           (Bearer token required)
DELETE /api/contents/{id}           (Bearer token required)
GET    /api/campaigns/{id}/contents (Bearer token required)

# Workflow / Process Monitoring
GET    /api/workflow/metrics
POST   /api/workflow/escalation-check

# AI Services
POST   /api/ai/text-to-speech       (Bearer token required)
POST   /api/ai/generate-text       (Bearer token required)
POST   /api/ai/rewrite             (Bearer token required)

# Notifications / SMS
POST   /api/notifications/sms/send
POST   /api/notifications/sms/bulk
GET   /api/notifications/sms/balance
POST   /api/campaigns/distribute-sms

# Health
GET    /api/health
```

## Frontend Integration

### Production Backend (Current)
```js
// Using monolithic backend
const API_BASE = 'https://barangay178-backend.onrender.com/api';

// Campaigns
const campaigns = await fetch(`${API_BASE}/campaigns`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Microservices Gateway (Alternative)
```js
// Using microservices gateway
import { campaignApi, notificationApi, workflowApi } from '@/lib/apiGateway';

// List campaigns
const campaigns = await campaignApi.list({ status: 'published' });

// Bulk SMS
const result = await notificationApi.bulkSMS({
  phone_numbers: ['09171234567', '09281234567'],
  campaign_title: 'Typhoon Safety Reminder',
  campaign_description: 'Please prepare emergency supplies.',
});

// Workflow metrics
const metrics = await workflowApi.getMetrics();
```

## Architecture Comparison

### Monolithic Backend (Current Production)
**Advantages:**
- Simpler deployment and maintenance
- Easier debugging and monitoring
- Lower infrastructure costs
- Faster development for small teams
- Shared database transactions

**Disadvantages:**
- Single point of failure
- Scalability limitations
- Technology lock-in
- Larger deployment units

### Microservices (Alternative)
**Advantages:**
- Independent scaling per service
- Technology diversity per service
- Fault isolation
- Team autonomy
- Better resource utilization

**Disadvantages:**
- Increased complexity
- Distributed system challenges
- Higher infrastructure costs
- More complex monitoring
- Data consistency challenges

## Migration Path

### Phase 1: Preparation
- Complete microservices development
- Set up API gateway infrastructure
- Implement service discovery
- Add monitoring and logging

### Phase 2: Testing
- Deploy microservices to staging
- Test all functionality
- Performance testing
- Security testing

### Phase 3: Migration
- Gradual traffic shift
- Monitor performance
- Rollback capability
- Data migration if needed

### Phase 4: Optimization
- Fine-tune performance
- Optimize resource allocation
- Implement advanced features

## Adding a New Microservice

1. Create `services/<service-name>/` directory
2. Add `routes/api.php`, `app/Http/Controllers/`, `Dockerfile`, `.env.example`
3. Add upstream + location block to `services/api-gateway/nginx.conf`
4. Add service to `docker-compose.yml`
5. Add API module to `frontend/src/lib/apiGateway.js`
6. Update documentation

## Environment Configuration

### Shared Environment Variables
```env
# Database
DB_HOST=zuuwqrxmkeryzbcrlrai.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Supabase
SUPABASE_URL=https://zuuwqrxmkeryzbcrlrai.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Services
AUTH_SERVICE_URL=http://localhost:8001
CAMPAIGN_SERVICE_URL=http://localhost:8002
CONTENT_SERVICE_URL=http://localhost:8003
WORKFLOW_SERVICE_URL=http://localhost:8004
NOTIFICATION_SERVICE_URL=http://localhost:3001
```

## Monitoring and Logging

### Service Health Checks
Each service should implement a `/health` endpoint:
```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8080/health
```

### Centralized Logging
- Structured JSON logging
- Log aggregation (ELK stack or similar)
- Distributed tracing
- Error tracking (Sentry or similar)

## Security Considerations

### Inter-service Communication
- Service-to-service authentication
- TLS encryption
- Rate limiting
- Input validation

### API Gateway Security
- JWT validation
- API key management
- CORS configuration
- DDoS protection

## Deployment Options

### Development
- Docker Compose for local development
- Individual service development
- Hot reload for faster iteration

### Staging
- Kubernetes cluster
- Service mesh (Istio/Linkerd)
- Canary deployments
- Feature flags

### Production
- Cloud platforms (AWS/GCP/Azure)
- Auto-scaling groups
- Load balancers
- CDN integration

---

**Note**: The microservices architecture is currently in development. The production system uses the monolithic Laravel backend for simplicity and reliability. Microservices will be considered for future scaling needs.