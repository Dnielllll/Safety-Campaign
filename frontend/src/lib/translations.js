// Language translations for the Barangay 178 Safety Campaign System
export const translations = {
  en: {
    // Navigation
    home: "Home",
    safetyCampaigns: "Safety Campaigns",
    aiVoice: "AI Voice",
    notifications: "Notifications",
    feedback: "Feedback",
    surveys: "Surveys",
    emergencyInfo: "Emergency Info",
    aboutBarangay: "About Barangay",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    
    // Page titles
    publicDashboard: "Barangay 178 Safety Campaign System",
    safetyCampaigns: "Safety Campaigns",
    quickAccess: "Quick Access",
    priorityAlerts: "Priority Alerts",
    latestCampaigns: "Latest Campaigns",
    
    // Card descriptions
    totalEngagements: "Total engagements per campaign",
    campaignEngagementDetails: "Detailed breakdown of engagement metrics",
    
    // Welcome message
    welcome: "Stay Informed. Stay Safe.",
    welcomeDescription: "Get the latest public safety announcements, emergency alerts, and community campaigns — available in text and AI-generated voice for all residents.",
    
    // Quick access
    browseCampaigns: "Browse Campaigns",
    voiceAnnouncement: "Voice Announcement",
    submitFeedback: "Submit Feedback",
    safetyCampaigns: "Safety Campaigns",
    aiVoice: "AI Voice",
    emergencyInfo: "Emergency Info",
    notifications: "Notifications",
    surveys: "Surveys",
    aboutBarangay: "About Barangay",
    
    // Performance labels
    high: "High",
    good: "Good",
    moderate: "Moderate",
    low: "Low",
    
    // Button text
    refresh: "Refresh",
    readMore: "Read more",
    listen: "Listen",
    playing: "Playing…",
    viewAll: "View all →",
  },
  tl: {
    // Navigation
    home: "Home",
    safetyCampaigns: "Mga Kampanya sa Kaligtasan",
    aiVoice: "AI Boses",
    notifications: "Mga Pabatid",
    feedback: "Mga Feedback",
    surveys: "Mga Survey",
    emergencyInfo: "Impormasyon sa Emergency",
    aboutBarangay: "Tungkol sa Barangay",
    login: "Mag-log in",
    signup: "Mag-sign up",
    logout: "Mag-log out",
    
    // Page titles
    publicDashboard: "Sistema ng Kampanya sa Kaligtasan ng Barangay 178",
    safetyCampaigns: "Mga Kampanya sa Kaligtasan",
    quickAccess: "Mabilisang Pag-access",
    priorityAlerts: "Mga Alert na Prioridad",
    latestCampaigns: "Mga Bagong Kampanya",
    
    // Card descriptions
    totalEngagements: "Kabuuan ng engagement bawat kampanya",
    campaignEngagementDetails: "Detalyadong breakdown ng metrics ng engagement",
    
    // Welcome message
    welcome: "Maging Lalo, Maging Ligtas.",
    welcomeDescription: "Makakuha ng pinakabagong mga anunsyo sa kaligtasan, alert sa emergency, at mga kampanya ng komunidad — available sa teksto at AI-generated na boses para sa lahat ng residente.",
    
    // Quick access
    browseCampaigns: "Basahin ang mga Kampanya",
    voiceAnnouncement: "Boses ng Anunsyo",
    submitFeedback: "Magsumit ng Feedback",
    safetyCampaigns: "Mga Kampanya sa Kaligtasan",
    aiVoice: "AI Boses",
    emergencyInfo: "Impormasyon sa Emergency",
    notifications: "Mga Pabatid",
    surveys: "Mga Survey",
    aboutBarangay: "Tungkol sa Barangay",
    
    // Performance labels
    high: "Mataas",
    good: "Mabuti",
    moderate: "Katamtaman",
    low: "Mababa",
    
    // Button text
    refresh: "I-refresh",
    readMore: "Basahin pa",
    listen: "Makinig",
    playing: "Nagpapatak…",
    viewAll: "Tingnan lahat →",
  }
};

export function t(key) {
  const language = localStorage.getItem('language') || 'en';
  return translations[language]?.[key] || translations.en[key] || key;
}