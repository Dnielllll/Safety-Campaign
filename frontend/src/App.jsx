import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "@/layouts/PublicLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import RequireRole from "@/routes/RequireRole";
import OfflineIndicator from "@/components/OfflineIndicator";
import MaintenanceGuard from "@/components/MaintenanceGuard.jsx";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import Maintenance from "@/pages/Maintenance";

// Public subsystem (3.1 – 3.8)
import PublicDashboard from "@/pages/public/PublicDashboard";
import SafetyCampaigns from "@/pages/public/SafetyCampaigns";
import VoiceAnnouncements from "@/pages/public/VoiceAnnouncements";
import Notifications from "@/pages/public/Notifications";
import Feedback from "@/pages/public/Feedback";
import EmergencyInfo from "@/pages/public/EmergencyInfo";
import AboutBarangay from "@/pages/public/AboutBarangay";
import Surveys from "@/pages/public/Surveys";
import Guides from "@/pages/public/Guides";
import FAQ from "@/pages/public/FAQ";
import TermsOfService from "@/pages/public/TermsOfService";
import PrivacyPolicy from "@/pages/public/PrivacyPolicy";
import CookiePolicy from "@/pages/public/CookiePolicy";
import Profile from "@/pages/public/Profile";
import AdminProfile from "@/pages/admin/Profile";

// Admin subsystem (1.1 – 1.12)
import AdminDashboard from "@/pages/admin/Dashboard";
import UserManagement from "@/pages/admin/UserManagement";
import CampaignManagement from "@/pages/admin/CampaignManagement";
import AIContentAssistant from "@/pages/admin/AIContentAssistant";
import ContentManagement from "@/pages/admin/ContentManagement";
import CampaignApproval from "@/pages/admin/CampaignApproval";
import Distribution from "@/pages/admin/Distribution";
import NotificationManagement from "@/pages/admin/NotificationManagement";
import FeedbackManagement from "@/pages/admin/FeedbackManagement";
import AnalyticsReports from "@/pages/admin/AnalyticsReports";
import AdminReports from "@/pages/admin/Reports";
import SuperAdminReports from "@/pages/admin/SuperAdminReports";
import ProcessMonitoring from "@/pages/admin/ProcessMonitoring";
import AuditTrail from "@/pages/admin/AuditTrail";
import SystemSettings from "@/pages/admin/SystemSettings";
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";
import AdminManagement from "@/pages/admin/AdminManagement";
import RolePermission from "@/pages/admin/RolePermission";
import DatabaseManagement from "@/pages/admin/DatabaseManagement";
import SecurityCenter from "@/pages/admin/SecurityCenter";
import SystemControl from "@/pages/admin/SystemControl";
import SecurityAudits from "@/pages/admin/SecurityAudits";
import DomainHosting from "@/pages/admin/DomainHosting";
import BackupRestore from "@/pages/admin/BackupRestore";
import SystemOptimization from "@/pages/admin/SystemOptimization";

// Staff subsystem (2.1 – 2.9)
import StaffDashboard from "@/pages/staff/Dashboard";
import StaffCampaigns from "@/pages/staff/Campaigns";
import AllCampaigns from "@/pages/staff/AllCampaigns";
import StaffContent from "@/pages/staff/Content";
import StaffAIAssistant from "@/pages/staff/AIAssistant";
import StaffSubmission from "@/pages/staff/Submission";
import StaffNotifications from "@/pages/staff/Notifications";
import StaffFeedback from "@/pages/staff/Feedback";
import StaffReports from "@/pages/staff/Reports";
import StaffProfile from "@/pages/staff/Profile";
import StaffSurveys from "@/pages/staff/Surveys";

export default function App() {
  return (
    <>
      <OfflineIndicator />
      <MaintenanceGuard>
        <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/maintenance" element={<Maintenance />} />

      {/* Public subsystem — residents (some routes browsable without login) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicDashboard />} />
        <Route path="/campaigns" element={<SafetyCampaigns />} />
        <Route path="/campaigns/:id" element={<SafetyCampaigns />} />
        <Route path="/voice-announcements" element={<VoiceAnnouncements />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/emergency" element={<EmergencyInfo />} />
        <Route path="/about" element={<AboutBarangay />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route
          path="/profile"
          element={
            <RequireRole roles={["citizen", "public", "admin", "staff", "super_admin"]}>
              <Profile />
            </RequireRole>
          }
        />
        <Route
          path="/feedback"
          element={
            <RequireRole roles={["citizen", "public", "admin", "staff", "super_admin"]}>
              <Feedback />
            </RequireRole>
          }
        />
        <Route
          path="/surveys"
          element={
            <RequireRole roles={["citizen", "public", "admin", "staff", "super_admin"]}>
              <Surveys />
            </RequireRole>
          }
        />
      </Route>

      {/* Super Admin subsystem */}
      <Route
        path="/super-admin"
        element={
          <RequireRole roles={["super_admin"]}>
            <DashboardLayout role="super_admin" />
          </RequireRole>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="admins" element={<AdminManagement />} />
        <Route path="roles" element={<RolePermission />} />
        <Route path="database" element={<DatabaseManagement />} />
        <Route path="security" element={<SecurityCenter />} />
        <Route path="system-control" element={<SystemControl />} />
        <Route path="security-audits" element={<SecurityAudits />} />
        <Route path="domain-hosting" element={<DomainHosting />} />
        <Route path="backup-restore" element={<BackupRestore />} />
        <Route path="system-optimization" element={<SystemOptimization />} />
        <Route path="monitoring" element={<ProcessMonitoring />} />
        <Route path="analytics" element={<AnalyticsReports />} />
        <Route path="reports" element={<SuperAdminReports />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Admin subsystem */}
      <Route
        path="/admin"
        element={
          <RequireRole roles={["admin", "super_admin"]}>
            <DashboardLayout role="admin" />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="campaigns" element={<CampaignManagement />} />
        <Route path="ai-assistant" element={<AIContentAssistant />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="approvals" element={<CampaignApproval />} />
        <Route path="distribution" element={<Distribution />} />
        <Route path="notifications" element={<NotificationManagement />} />
        <Route path="feedback" element={<FeedbackManagement />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="analytics-reports" element={<AnalyticsReports />} />
        <Route path="process-monitoring" element={<ProcessMonitoring />} />
        <Route path="audit-trail" element={<AuditTrail />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Staff subsystem */}
      <Route
        path="/staff"
        element={
          <RequireRole roles={["staff", "super_admin"]}>
            <DashboardLayout role="staff" />
          </RequireRole>
        }
      >
        <Route index element={<StaffDashboard />} />
        <Route path="campaigns" element={<StaffCampaigns />} />
        <Route path="all-campaigns" element={<AllCampaigns />} />
        <Route path="content" element={<StaffContent />} />
        <Route path="ai-assistant" element={<StaffAIAssistant />} />
        <Route path="submission" element={<StaffSubmission />} />
        <Route path="notifications" element={<StaffNotifications />} />
        <Route path="feedback" element={<StaffFeedback />} />
        <Route path="surveys" element={<StaffSurveys />} />
        <Route path="reports" element={<StaffReports />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
      </MaintenanceGuard>
    </>
  );
}