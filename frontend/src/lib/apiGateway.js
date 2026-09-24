/**
 * apiGateway.js
 * 
 * Thin HTTP client pointing at the Nginx API Gateway.
 * 
 * The gateway routes requests to the correct microservice:
 *   /api/auth/*          → auth-service       (Laravel Sanctum)
 *   /api/campaigns/*     → campaign-service   (Laravel)
 *   /api/contents/*      → content-service    (Laravel)
 *   /api/workflow/*      → workflow-service   (Laravel)
 *   /api/notifications/* → notification-service (Node.js)
 * 
 * Usage:
 *   import { apiGateway } from '@/lib/apiGateway';
 *   const campaigns = await apiGateway.get('/api/campaigns');
 *   const result    = await apiGateway.post('/api/notifications/sms/bulk', payload);
 */

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'https://barangay178-backend.onrender.com';

// In dev mode the notification-service runs on port 3001 directly.
// In production it is accessed via the Nginx gateway on GATEWAY_URL.
const NOTIFICATION_URL = import.meta.env.VITE_NOTIFICATION_URL || 'https://barangay178-notifications.onrender.com';

// Vercel serverless API base URL — handles email via Gmail (no SMTP port restrictions)
const VERCEL_API_URL = import.meta.env.VITE_VERCEL_URL
  ? `https://${import.meta.env.VITE_VERCEL_URL}`
  : (typeof window !== 'undefined' ? window.location.origin : '');

/**
 * Get the current Sanctum bearer token from localStorage (set after login).
 */
function getToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Build default headers for every request.
 */
function buildHeaders(extra = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extra,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Core fetch wrapper with unified error handling.
 * @param {string} path - e.g. '/api/campaigns'
 * @param {RequestInit} options - native fetch options
 * @returns {Promise<any>} parsed JSON response
 */
async function request(path, options = {}) {
  const url = `${GATEWAY_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  // 204 No Content — return null
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}`;
    throw Object.assign(new Error(message), { status: response.status, data });
  }

  return data;
}

/**
 * Direct request to notification-service (bypasses gateway in dev mode).
 */
async function notificationRequest(path, options = {}) {
  const url = `${NOTIFICATION_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}`;
    throw Object.assign(new Error(message), { status: response.status, data });
  }

  return data;
}

export const apiGateway = {
  /** GET /api/<path> */
  get: (path, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`${path}${qs ? `?${qs}` : ''}`);
  },

  /** POST /api/<path> */
  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),

  /** PUT /api/<path> */
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),

  /** PATCH /api/<path> */
  patch: (path, body) =>
    request(path, { method: 'PATCH', body: JSON.stringify(body) }),

  /** DELETE /api/<path> */
  delete: (path) =>
    request(path, { method: 'DELETE' }),

  /** Store token after login */
  setToken: (token) => localStorage.setItem('auth_token', token),

  /** Clear token on logout */
  clearToken: () => localStorage.removeItem('auth_token'),
};

// ─── Convenience service modules ─────────────────────────────────────────────

/** Auth via microservice (Sanctum). Use supabase.js for Supabase-native auth. */
export const authApi = {
  login:    (credentials)   => apiGateway.post('/api/auth/login', credentials),
  register: (userData)      => apiGateway.post('/api/auth/register', userData),
  me:       ()              => apiGateway.get('/api/auth/me'),
  logout:   ()              => apiGateway.post('/api/auth/logout', {}),
};

/** Campaign microservice */
export const campaignApi = {
  list:           (params)    => apiGateway.get('/api/campaigns', params),
  getApproved:    ()          => apiGateway.get('/api/campaigns/approved'),
  getPhoneNumbers:()          => apiGateway.get('/api/campaigns/resident-phone-numbers'),
  get:            (id)        => apiGateway.get(`/api/campaigns/${id}`),
  create:         (data)      => apiGateway.post('/api/campaigns', data),
  update:         (id, data)  => apiGateway.put(`/api/campaigns/${id}`, data),
  delete:         (id)        => apiGateway.delete(`/api/campaigns/${id}`),
};

/** Content microservice */
export const contentApi = {
  list:           (params)    => apiGateway.get('/api/contents', params),
  byCampaign:     (cId)       => apiGateway.get(`/api/campaigns/${cId}/contents`),
  get:            (id)        => apiGateway.get(`/api/contents/${id}`),
  create:         (data)      => apiGateway.post('/api/contents', data),
  update:         (id, data)  => apiGateway.put(`/api/contents/${id}`, data),
  delete:         (id)        => apiGateway.delete(`/api/contents/${id}`),
};

/** Workflow / Process Monitoring microservice */
export const workflowApi = {
  getMetrics:       ()      => apiGateway.get('/api/workflow/metrics'),
  runEscalation:    ()      => apiGateway.post('/api/workflow/escalation-check', {}),
};

/** Notification (SMS + Email) microservice — calls port 3001 directly in dev */
export const notificationApi = {
  sendSMS:           (data) => notificationRequest('/sms/send',           { method: 'POST', body: JSON.stringify(data) }),
  bulkSMS:           (data) => notificationRequest('/sms/bulk',           { method: 'POST', body: JSON.stringify(data) }),
  balance:           ()     => notificationRequest('/sms/balance',        { method: 'GET' }),

  // Email routes now handled by Vercel Serverless Functions (bypasses Render's SMTP block)
  // We use relative paths here so that the browser automatically uses the current domain, preventing CORS errors.
  sendOTP: (data) => fetch(`/api/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),

  sendWelcome: (data) => notificationRequest('/mail/send-welcome', { method: 'POST', body: JSON.stringify(data) }),

  sendCampaignEmail: (data) => fetch(`/api/send-notification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
};
