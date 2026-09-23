import axios from 'axios';

// API Gateway — routes all requests to the correct microservice via Nginx
// /api/auth/*          → auth-service       (Laravel Sanctum)
// /api/campaigns/*     → campaign-service   (Laravel)
// /api/contents/*      → content-service    (Laravel)
// /api/workflow/*      → workflow-service   (Laravel)
// /api/notifications/* → notification-service (Node.js)
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'https://barangay178-backend.onrender.com';
const API_URL = `${GATEWAY_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------------------------ */
/* Auth (Using Laravel Sanctum)                                        */
/* ------------------------------------------------------------------ */
export const AuthAPI = {
  login: async (payload) => {
    const response = await api.post('/login', payload);
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return { data: { user: response.data.user } };
  },
  logout: async () => {
    await api.post('/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
  me: async () => {
    const response = await api.get('/me');
    return { data: response.data };
  },
  register: async (payload) => {
    const response = await api.post('/register', payload);
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return { data: response.data };
  },
};

/* ------------------------------------------------------------------ */
/* Users (Admin — 1.2) - Using Laravel API                             */
/* ------------------------------------------------------------------ */
export const UsersAPI = {
  list: async (params) => {
    const response = await api.get('/users', { params });
    return { data: response.data };
  },
  create: async (payload) => {
    const response = await api.post('/users', payload);
    return { data: response.data };
  },
  update: async (id, payload) => {
    const response = await api.put(`/users/${id}`, payload);
    return { data: response.data };
  },
  activate: async (id) => {
    const response = await api.patch(`/users/${id}`, { is_active: true });
    return { data: response.data };
  },
  deactivate: async (id) => {
    const response = await api.patch(`/users/${id}`, { is_active: false });
    return { data: response.data };
  },
  remove: async (id) => {
    await api.delete(`/users/${id}`);
    return { data: null };
  },
};

/* ------------------------------------------------------------------ */
/* Campaigns (Process 2 — 1.3 / 2.2) - Using Laravel API                */
/* ------------------------------------------------------------------ */
export const CampaignsAPI = {
  list: async (params) => {
    const response = await api.get('/campaigns', { params });
    return { data: response.data };
  },
  get: async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return { data: response.data };
  },
  create: async (payload) => {
    const response = await api.post('/campaigns', payload);
    return { data: response.data };
  },
  update: async (id, payload) => {
    const response = await api.put(`/campaigns/${id}`, payload);
    return { data: response.data };
  },
  archive: async (id) => {
    const response = await api.put(`/campaigns/${id}`, { status: 'cancelled' });
    return { data: response.data };
  },
  remove: async (id) => {
    await api.delete(`/campaigns/${id}`);
    return { data: null };
  },
  submit: async (id) => {
    const response = await api.put(`/campaigns/${id}`, { status: 'active' });
    return { data: response.data };
  },
  approve: async (id, payload) => {
    const response = await api.put(`/campaigns/${id}`, { status: 'active' });
    return { data: response.data };
  },
  reject: async (id, payload) => {
    const response = await api.put(`/campaigns/${id}`, { status: 'draft' });
    return { data: response.data };
  },
  publish: async (id, payload) => {
    const response = await api.put(`/campaigns/${id}`, { status: 'completed' });
    return { data: response.data };
  },
  getApproved: async () => {
    const response = await api.get('/campaigns/approved');
    return { data: response.data };
  },
  distributeSMS: async (campaignData, phoneNumbers) => {
    // Routed to notification-service via gateway: /api/notifications/sms/bulk
    const response = await axios.post(`${GATEWAY_URL}/api/notifications/sms/bulk`, {
      phone_numbers: phoneNumbers,
      campaign_title: campaignData.title,
      campaign_description: campaignData.description,
      provider: 'iprog',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
    });
    return { data: response.data };
  },
  getResidentPhoneNumbers: async () => {
    const response = await api.get('/campaigns/resident-phone-numbers');
    return { data: response.data };
  },
};

/* ------------------------------------------------------------------ */
/* Content + AI Assistant / TTS (Process 3 — 1.4/1.5, 2.3/2.4) - Laravel API */
/* ------------------------------------------------------------------ */
export const ContentAPI = {
  list: async (campaignId) => {
    const response = await api.get('/contents', { params: { campaign_id: campaignId } });
    return { data: response.data };
  },
  create: async (campaignId, payload) => {
    const response = await api.post('/contents', {
      ...payload,
      campaign_id: campaignId
    });
    return { data: response.data };
  },
  update: async (id, payload) => {
    const response = await api.put(`/contents/${id}`, payload);
    return { data: response.data };
  },
  remove: async (id) => {
    await api.delete(`/contents/${id}`);
    return { data: null };
  },
};

/* ------------------------------------------------------------------ */
/* AI API (Process 3) - Google Cloud TTS Integration                   */
/* ------------------------------------------------------------------ */
export const AIAPI = {
  generateText: async (payload) => {
    const response = await api.post('/ai/generate-text', payload);
    return { data: response.data };
  },
  rewrite: async (payload) => {
    const response = await api.post('/ai/rewrite', payload);
    return { data: response.data };
  },
  textToSpeech: async (payload) => {
    const response = await api.post('/ai/text-to-speech', payload);
    return { data: response.data };
  },
  getVoiceAnnouncement: async (campaignId) => {
    // This would fetch a previously generated voice announcement
    // For now, we'll generate it on-demand
    throw new Error('Voice announcement fetch not implemented');
  },
};

/* ------------------------------------------------------------------ */
/* Notifications (Process 6) - Using Laravel API                        */
/* ------------------------------------------------------------------ */
export const NotificationsAPI = {
  list: async (filters) => {
    const response = await api.get('/notifications', { params: filters });
    return { data: response.data };
  },
  send: async (payload) => {
    const response = await api.post('/notifications', payload);
    return { data: response.data };
  },
  resend: async (id) => {
    const response = await api.post(`/notifications/${id}/resend`);
    return { data: response.data };
  },
  markRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return { data: response.data };
  },
};

/* ------------------------------------------------------------------ */
/* Engagement (Process 7) - Using Laravel API                          */
/* ------------------------------------------------------------------ */
export const EngagementAPI = {
  log: async (campaignId, payload) => {
    const response = await api.post('/engagement-logs', {
      campaign_id: campaignId,
      ...payload
    });
    return { data: response.data };
  },
  summary: async (campaignId) => {
    const response = await api.get('/engagement-logs', { params: { campaign_id: campaignId } });
    return { data: response.data };
  },
};

/* ------------------------------------------------------------------ */
/* Feedback & Surveys (Process 8) - Using Laravel API                   */
/* ------------------------------------------------------------------ */
export const FeedbackAPI = {
  submit: async (payload) => {
    const response = await api.post('/feedback', payload);
    return { data: response.data };
  },
  list: async (params) => {
    const response = await api.get('/feedback', { params });
    return { data: response.data };
  },
  respond: async (id, payload) => {
    const response = await api.post(`/feedback/${id}/respond`, payload);
    return { data: response.data };
  },
};

export const SurveysAPI = {
  list: async () => {
    const response = await api.get('/surveys');
    return { data: response.data };
  },
  create: async (payload) => {
    const response = await api.post('/surveys', payload);
    return { data: response.data };
  },
  respond: async (id, payload) => {
    const response = await api.post(`/surveys/${id}/respond`, payload);
    return { data: response.data };
  },
};

/* ------------------------------------------------------------------ */
/* Reports (Process 9 & 10) - Using Laravel API                         */
/* ------------------------------------------------------------------ */
export const ReportsAPI = {
  overview: async () => {
    const response = await api.get('/reports/overview');
    return { data: response.data };
  },
  campaign: async (id) => {
    const response = await api.get(`/reports/campaign/${id}`);
    return { data: response.data };
  },
  export: async (params) => {
    const response = await api.get('/reports/export', { params });
    return { data: response.data };
  },
};

/* ------------------------------------------------------------------ */
/* Audit Trail (Process 11) - Using Laravel API                        */
/* ------------------------------------------------------------------ */
export const AuditAPI = {
  list: async (params) => {
    const response = await api.get('/audit-logs', { params });
    return { data: response.data };
  },
};

/* ------------------------------------------------------------------ */
/* Settings (1.12) - Using Laravel API                                 */
/* ------------------------------------------------------------------ */
export const SettingsAPI = {
  get: async () => {
    const response = await api.get('/settings');
    return { data: response.data };
  },
  update: async (payload) => {
    const response = await api.put('/settings', payload);
    return { data: response.data };
  },
};

/* ------------------------------------------------------------------ */
/* Emergency Info (3.7) - Using Laravel API                           */
/* ------------------------------------------------------------------ */
export const EmergencyAPI = {
  get: async () => {
    const response = await api.get('/emergency-info');
    return { data: response.data };
  },
};
