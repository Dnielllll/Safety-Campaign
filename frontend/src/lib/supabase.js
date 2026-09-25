import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zuuwqrxmkeryzbcrlrai.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dXdxcnhta2VyeXpiY3JscmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDcxMzAsImV4cCI6MjEwMDI4MzEzMH0.CR289UHP5bxEavCMW1Z0h19Jrf6mm5YFC7NQ8RWkkm0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Auth Helpers using real Supabase Auth
export const supabaseHelpers = {
  // Register via Supabase Auth with email confirmation disabled
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name || '',
          phone: userData.phone || '',
          address: userData.address || '',
          role: userData.role || 'public',
        },
        emailRedirectTo: undefined, // Disable email confirmation
      },
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  // Email OTP functions
  async sendEmailOTP(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create user automatically
      },
    });
    return { data, error };
  },

  async verifyEmailOTP(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data?.session, error };
  },

  async getAuthUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Users table
  async getUserById(id) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    return { data, error };
  },

  async getUsers() {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    return { data, error };
  },

  async createUser(userData) {
    const { data, error } = await supabase.from('users').insert(userData).select().single();
    return { data, error };
  },

  async updateUser(id, userData) {
    const { data, error } = await supabase.from('users').update({ ...userData, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    return { data, error };
  },

  async deleteUser(id) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    return { error };
  },


  // Campaigns
  async getCampaigns(filters = {}) {
    let query = supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.created_by) query = query.eq('created_by', filters.created_by);
    const { data, error } = await query;
    
    // Deduplicate campaigns by title to avoid duplicates in dropdowns
    // Keep the most recent version (first one since ordered by created_at DESC)
    if (data && data.length > 0) {
      const uniqueCampaigns = [];
      const seenTitles = new Set();
      
      for (const campaign of data) {
        const title = campaign.title?.toLowerCase().trim();
        if (title && !seenTitles.has(title)) {
          seenTitles.add(title);
          uniqueCampaigns.push(campaign);
        }
      }
      
      return { data: uniqueCampaigns, error };
    }
    
    return { data, error };
  },

  async getCampaignById(id) {
    const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
    return { data, error };
  },

  async createCampaign(campaignData) {
    console.log("supabaseHelpers - Creating campaign:", campaignData);
    const { data, error } = await supabase.from('campaigns').insert(campaignData).select().single();
    console.log("supabaseHelpers - Campaign creation result:", { data, error });
    return { data, error };
  },

  async updateCampaign(id, campaignData) {
    console.log("supabaseHelpers - Updating campaign:", { id, campaignData });
    const { data, error } = await supabase.from('campaigns').update(campaignData).eq('id', id).select().single();
    console.log("supabaseHelpers - Campaign update result:", { data, error });
    return { data, error };
  },

  async deleteCampaign(id) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    return { error };
  },

  // Content
  async getContentByCampaignId(campaignId) {
    const { data, error } = await supabase.from('content').select('*').eq('campaign_id', campaignId).order('order_index', { ascending: true });
    return { data, error };
  },

  async getAllContent(filters = {}) {
    let query = supabase.from('content').select('*, campaigns(title, created_by)');
    const { data, error } = await query.order('created_at', { ascending: false });
    // If filtering by user is needed, you'd filter after or do a join
    return { data, error };
  },

  async createContent(contentData) {
    const { data, error } = await supabase.from('content').insert(contentData).select().single();
    return { data, error };
  },

  async updateContent(id, contentData) {
    const { data, error } = await supabase.from('content').update(contentData).eq('id', id).select().single();
    return { data, error };
  },

  async deleteContent(id) {
    const { error } = await supabase.from('content').delete().eq('id', id);
    return { error };
  },

  // Notifications
  async getNotifications(filters = {}) {
    let query = supabase.from('notifications').select('*');
    if (filters.recipient_id) query = query.eq('recipient_id', filters.recipient_id);
    if (filters.status) query = query.eq('status', filters.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createNotification(notificationData) {
    const { data, error } = await supabase.from('notifications').insert(notificationData).select().single();
    return { data, error };
  },

  async markNotificationAsRead(id) {
    const { data, error } = await supabase.from('notifications').update({ status: 'read', read_at: new Date().toISOString() }).eq('id', id).select().single();
    return { data, error };
  },

  async updateNotification(id, notificationData) {
    const { data, error } = await supabase.from('notifications').update(notificationData).eq('id', id).select().single();
    return { data, error };
  },

  // Feedback
  async getFeedback(filters = {}) {
    // Removed users and campaigns join because if they are null or RLS blocked, it can cause the whole query to return empty or error.
    let query = supabase.from('feedback').select('*');
    if (filters.campaign_id) query = query.eq('campaign_id', filters.campaign_id);
    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createFeedback(feedbackData) {
    const { data, error } = await supabase.from('feedback').insert(feedbackData).select().single();
    return { data, error };
  },

  async respondToFeedback(id, responseData) {
    const { data, error } = await supabase.from('feedback').update(responseData).eq('id', id).select().single();
    return { data, error };
  },

  async flagFeedback(id, flagged = true) {
    const { data, error } = await supabase.from('feedback').update({ flagged }).eq('id', id).select().single();
    return { data, error };
  },

  // Surveys
  async getSurveys(filters = {}) {
    let query = supabase.from('surveys').select('*');
    if (filters.status) query = query.eq('status', filters.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async getSurveyQuestions(surveyId) {
    const { data, error } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order_index', { ascending: true });
    return { data, error };
  },

  async createSurveyQuestions(questionsData) {
    const { data, error } = await supabase.from('survey_questions').insert(questionsData).select();
    return { data, error };
  },

  async updateSurveyQuestions(surveyId, questionsData) {
    // Delete existing questions
    const { error: deleteError } = await supabase
      .from('survey_questions')
      .delete()
      .eq('survey_id', surveyId);
    
    if (deleteError) return { data: null, error: deleteError };
    
    // Insert new questions
    const { data, error } = await supabase.from('survey_questions').insert(questionsData).select();
    return { data, error };
  },

  async submitSurveyResponse(response) {
    const { data, error } = await supabase.from('survey_responses').insert(response).select().single();
    return { data, error };
  },

  // BPM: Engagement Tracking
  async logEngagement(engagementData) {
    const { data, error } = await supabase.from('engagement_logs').insert(engagementData).select().single();
    return { data, error };
  },

  async getEngagementByCampaign(campaignId) {
    const { data, error } = await supabase.from('engagement_logs').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false });
    return { data, error };
  },

  // BPM: Campaign Impact Evaluation
  async getCampaignEvaluations(campaignId) {
    const { data, error } = await supabase.from('campaign_evaluations').select('*').eq('campaign_id', campaignId);
    return { data, error };
  },

  async createCampaignEvaluation(evalData) {
    const { data, error } = await supabase.from('campaign_evaluations').insert(evalData).select().single();
    return { data, error };
  },

  async updateCampaignEvaluation(id, evalData) {
    const { data, error } = await supabase.from('campaign_evaluations').update({ ...evalData, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    return { data, error };
  },

  // BPM: Volunteers
  async registerVolunteer(volunteerData) {
    const { data, error } = await supabase.from('volunteers').insert(volunteerData).select().single();
    return { data, error };
  },

  async getVolunteersByCampaign(campaignId) {
    const { data, error } = await supabase.from('volunteers').select('*, users(name, email, phone)').eq('campaign_id', campaignId);
    return { data, error };
  },
};
