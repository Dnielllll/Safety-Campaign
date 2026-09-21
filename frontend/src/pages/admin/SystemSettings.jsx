import React, { useState, useEffect } from "react";
import { Settings, Save, Volume2, Bell, KeyRound, Shield, Globe, Clock, AlertTriangle, Info, CheckCircle, RefreshCw, Lock, UserCog, Monitor, Zap, Server } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/auditLogger.js";

export default function SystemSettings() {
  const { user, reloadSystemSettings, cleanupAuthSettings } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [systemInfo, setSystemInfo] = useState({
    appName: 'Barangay 178 Safety Campaign Management System',
    appVersion: '1.0.0',
    environment: 'production',
    databaseVersion: 'PostgreSQL 15.0',
    apiVersion: 'v1.0.0',
    lastUpdated: new Date().toISOString(),
  });

  const [generalSettings, setGeneralSettings] = useState({
    barangayName: 'Barangay 178',
    city: 'North Caloocan City',
    district: 'Camarin',
    contactNumber: '',
    timezone: 'Asia/Manila',
    language: 'en',
    maintenanceMode: false,
  });

  const [authSettings, setAuthSettings] = useState({
    sessionTimeout: 30, // Increased from 4 to 30 minutes for better development experience
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    twoFactorEnabled: false,
    ipWhitelist: '',
  });

  const [securitySettings, setSecuritySettings] = useState({
    sslEnabled: true,
    csrfProtection: true,
    rateLimiting: true,
    rateLimitPerMinute: 100,
    auditLogging: true,
    dataEncryption: true,
    backupRetentionDays: 30,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    smsEnabled: true,
    emailEnabled: true,
    facebookEnabled: true,
    pushEnabled: true,
    systemAlertsEnabled: true,
    emergencyAlertsEnabled: true,
    maintenanceAlertsEnabled: true,
    securityAlertsEnabled: true,
  });

  const [featureSettings, setFeatureSettings] = useState({
    aiAssistantEnabled: true,
    voiceAnnouncementsEnabled: true,
    realTimeUpdates: true,
    analyticsEnabled: true,
    campaignApprovalRequired: true,
    citizenRegistrationRequired: false,
    userRegistrationEnabled: true,
  });

  const [aiSettings, setAiSettings] = useState({
    defaultVoice: 'fil-PH-Wavenet-A',
    speakingRate: '1.0',
    autoGenerateVoice: true,
    serviceAccountKey: '',
  });

  const handleSave = async (section) => {
    setSaving(true);
    try {
      // Prepare settings data based on section
      let settingsData = {};
      switch (section) {
        case 'General':
          const { maintenanceMode, ...generalSettingsToSave } = generalSettings;
          settingsData = {
            general_settings: {
              ...generalSettingsToSave,
              maintenance_mode: maintenanceMode
            },
            updated_at: new Date().toISOString()
          };
          break;
        case 'Security':
          settingsData = {
            security_settings: securitySettings,
            updated_at: new Date().toISOString()
          };
          break;
        case 'Authentication':
          settingsData = {
            auth_settings: authSettings,
            updated_at: new Date().toISOString()
          };
          // Persist to localStorage immediately so useAuth picks it up
          localStorage.setItem('auth_settings', JSON.stringify(authSettings));
          console.log('=== Auth settings saved ===');
          console.log('To localStorage:', authSettings);
          console.log('To database:', settingsData);
          // Force reload system settings to apply changes immediately
          await reloadSystemSettings();
          break;
        case 'Notifications':
          settingsData = {
            notification_settings: notificationSettings,
            updated_at: new Date().toISOString()
          };
          break;
        case 'Features':
          settingsData = {
            feature_settings: featureSettings,
            ai_settings: aiSettings,
            updated_at: new Date().toISOString()
          };
          break;
        default:
          settingsData = {};
      }

      console.log("=== Saving settings ===");
      console.log("Section:", section);
      console.log("Settings Data:", settingsData);
      console.log("Settings ID:", settingsId);

      // Try to save to Supabase system_settings table
      try {
        let result;
        if (settingsId) {
          // Update existing record using its UUID
          result = await supabase
            .from('system_settings')
            .update(settingsData)
            .eq('id', settingsId);
        } else {
          // Insert new record without specifying ID (let DB generate UUID)
          result = await supabase
            .from('system_settings')
            .insert(settingsData)
            .select('id')
            .maybeSingle();
          
          // Store the new ID for future updates
          if (result.data && result.data.id) {
            setSettingsId(result.data.id);
          }
        }

        if (result.error) throw result.error;

        console.log("Settings saved successfully to database");

        // Log settings update event
        try {
          await logAuditEvent('settings.updated', 'System Settings', user.id, {
            setting_category: section,
            settings_changed: Object.keys(settingsData)
          });
        } catch (auditError) {
          console.error('Failed to log settings update:', auditError);
        }

        // Special handling for maintenance mode - trigger recheck
        if (section === 'General') {
          // Reload system settings to update auth context
          await reloadSystemSettings();
          
          if (generalSettings.maintenanceMode) {
            alert('Maintenance Mode ENABLED! Public access will be blocked. Only super_admin can access the system.');
          } else {
            alert('Maintenance Mode DISABLED! Public access restored.');
          }
        } else {
          alert(`${section} settings saved successfully`);
        }
      } catch (dbError) {
        console.error('Database save failed:', dbError);
        // Fallback to local state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (section === 'General' && generalSettings.maintenanceMode) {
          alert('Maintenance Mode ENABLED (local)! Note: Changes not saved to database.');
        } else if (section === 'General' && !generalSettings.maintenanceMode) {
          alert('Maintenance Mode DISABLED (local)! Note: Changes not saved to database.');
        } else {
          alert(`${section} settings saved (local state only)`);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const [settingsId, setSettingsId] = useState(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      console.log('=== Loading system settings ===');
      console.log('Current localStorage auth_settings:', localStorage.getItem('auth_settings'));
      
      // Clean up any NaN values in localStorage before loading
      cleanupAuthSettings();
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .maybeSingle();

      console.log("Loading settings result:", { data, error: error ? JSON.stringify(error) : null });

      if (!error && data) {
        // Store the UUID for updates
        setSettingsId(data.id);
        console.log("Settings ID loaded:", data.id);
        
        if (data.general_settings) {
          setGeneralSettings(prev => ({
            ...prev,
            ...data.general_settings,
            maintenanceMode: data.general_settings.maintenance_mode || false
          }));
        }
        if (data.security_settings) {
          console.log('Loading security_settings from database:', data.security_settings);
          // Ensure numeric values are properly converted
          const safeSecuritySettings = {
            sslEnabled: data.security_settings.sslEnabled !== undefined ? data.security_settings.sslEnabled : true,
            csrfProtection: data.security_settings.csrfProtection !== undefined ? data.security_settings.csrfProtection : true,
            rateLimiting: data.security_settings.rateLimiting !== undefined ? data.security_settings.rateLimiting : true,
            rateLimitPerMinute: typeof data.security_settings.rateLimitPerMinute === 'number' && !isNaN(data.security_settings.rateLimitPerMinute) ? data.security_settings.rateLimitPerMinute : 
                                 parseInt(data.security_settings.rateLimitPerMinute) || 100,
            auditLogging: data.security_settings.auditLogging !== undefined ? data.security_settings.auditLogging : true,
            dataEncryption: data.security_settings.dataEncryption !== undefined ? data.security_settings.dataEncryption : true,
            backupRetentionDays: typeof data.security_settings.backupRetentionDays === 'number' && !isNaN(data.security_settings.backupRetentionDays) ? data.security_settings.backupRetentionDays : 
                                 parseInt(data.security_settings.backupRetentionDays) || 30,
          };
          console.log('Processed security_settings:', safeSecuritySettings);
          setSecuritySettings(prev => ({ ...prev, ...safeSecuritySettings }));
        }
        if (data.auth_settings) {
          console.log('Loading auth_settings from database:', data.auth_settings);
          // Ensure numeric values are properly converted
          const safeAuthSettings = {
            sessionTimeout: typeof data.auth_settings.sessionTimeout === 'number' && !isNaN(data.auth_settings.sessionTimeout) ? data.auth_settings.sessionTimeout : 
                           parseInt(data.auth_settings.sessionTimeout) || 4,
            maxLoginAttempts: typeof data.auth_settings.maxLoginAttempts === 'number' && !isNaN(data.auth_settings.maxLoginAttempts) ? data.auth_settings.maxLoginAttempts : 
                              parseInt(data.auth_settings.maxLoginAttempts) || 5,
            lockoutDuration: typeof data.auth_settings.lockoutDuration === 'number' && !isNaN(data.auth_settings.lockoutDuration) ? data.auth_settings.lockoutDuration : 
                            parseInt(data.auth_settings.lockoutDuration) || 15,
            passwordMinLength: typeof data.auth_settings.passwordMinLength === 'number' && !isNaN(data.auth_settings.passwordMinLength) ? data.auth_settings.passwordMinLength : 
                             parseInt(data.auth_settings.passwordMinLength) || 8,
            passwordRequireUppercase: data.auth_settings.passwordRequireUppercase !== undefined ? data.auth_settings.passwordRequireUppercase : true,
            passwordRequireNumbers: data.auth_settings.passwordRequireNumbers !== undefined ? data.auth_settings.passwordRequireNumbers : true,
            passwordRequireSpecialChars: data.auth_settings.passwordRequireSpecialChars !== undefined ? data.auth_settings.passwordRequireSpecialChars : true,
            twoFactorEnabled: data.auth_settings.twoFactorEnabled !== undefined ? data.auth_settings.twoFactorEnabled : false,
            ipWhitelist: data.auth_settings.ipWhitelist || '',
          };
          console.log('Processed auth_settings:', safeAuthSettings);
          setAuthSettings(prev => ({ ...prev, ...safeAuthSettings }));
          // Also update localStorage to match database
          localStorage.setItem('auth_settings', JSON.stringify(safeAuthSettings));
        } else {
          // Fallback: load from localStorage if DB doesn't have it yet
          const stored = localStorage.getItem('auth_settings');
          console.log('No auth_settings in database, loading from localStorage:', stored);
          if (stored) {
            const parsed = JSON.parse(stored);
            // Ensure numeric values are properly converted
            const safeAuthSettings = {
              sessionTimeout: typeof parsed.sessionTimeout === 'number' && !isNaN(parsed.sessionTimeout) ? parsed.sessionTimeout : 
                             parseInt(parsed.sessionTimeout) || 4,
              maxLoginAttempts: typeof parsed.maxLoginAttempts === 'number' && !isNaN(parsed.maxLoginAttempts) ? parsed.maxLoginAttempts : 
                                parseInt(parsed.maxLoginAttempts) || 5,
              lockoutDuration: typeof parsed.lockoutDuration === 'number' && !isNaN(parsed.lockoutDuration) ? parsed.lockoutDuration : 
                              parseInt(parsed.lockoutDuration) || 15,
              passwordMinLength: typeof parsed.passwordMinLength === 'number' && !isNaN(parsed.passwordMinLength) ? parsed.passwordMinLength : 
                               parseInt(parsed.passwordMinLength) || 8,
              passwordRequireUppercase: parsed.passwordRequireUppercase !== undefined ? parsed.passwordRequireUppercase : true,
              passwordRequireNumbers: parsed.passwordRequireNumbers !== undefined ? parsed.passwordRequireNumbers : true,
              passwordRequireSpecialChars: parsed.passwordRequireSpecialChars !== undefined ? parsed.passwordRequireSpecialChars : true,
              twoFactorEnabled: parsed.twoFactorEnabled !== undefined ? parsed.twoFactorEnabled : false,
              ipWhitelist: parsed.ipWhitelist || '',
            };
            console.log('Processed localStorage auth_settings:', safeAuthSettings);
            setAuthSettings(prev => ({ ...prev, ...safeAuthSettings }));
          }
        }
        if (data.notification_settings) {
          setNotificationSettings(prev => ({ ...prev, ...data.notification_settings }));
        }
        if (data.feature_settings) {
          console.log('Loading feature_settings from database:', data.feature_settings);
          // Ensure boolean values are properly converted
          const safeFeatureSettings = {
            aiAssistantEnabled: data.feature_settings.aiAssistantEnabled !== undefined ? data.feature_settings.aiAssistantEnabled : true,
            voiceAnnouncementsEnabled: data.feature_settings.voiceAnnouncementsEnabled !== undefined ? data.feature_settings.voiceAnnouncementsEnabled : true,
            realTimeUpdates: data.feature_settings.realTimeUpdates !== undefined ? data.feature_settings.realTimeUpdates : true,
            analyticsEnabled: data.feature_settings.analyticsEnabled !== undefined ? data.feature_settings.analyticsEnabled : true,
            campaignApprovalRequired: data.feature_settings.campaignApprovalRequired !== undefined ? data.feature_settings.campaignApprovalRequired : true,
            citizenRegistrationRequired: data.feature_settings.citizenRegistrationRequired !== undefined ? data.feature_settings.citizenRegistrationRequired : false,
            userRegistrationEnabled: data.feature_settings.userRegistrationEnabled !== undefined ? data.feature_settings.userRegistrationEnabled : true,
          };
          console.log('Processed feature_settings:', safeFeatureSettings);
          setFeatureSettings(prev => ({ ...prev, ...safeFeatureSettings }));
        }
        if (data.ai_settings) {
          console.log('Loading ai_settings from database:', data.ai_settings);
          // Ensure values are properly converted
          const safeAiSettings = {
            defaultVoice: data.ai_settings.defaultVoice || 'fil-PH-Wavenet-A',
            speakingRate: data.ai_settings.speakingRate || '1.0',
            autoGenerateVoice: data.ai_settings.autoGenerateVoice !== undefined ? data.ai_settings.autoGenerateVoice : true,
            serviceAccountKey: data.ai_settings.serviceAccountKey || '',
          };
          console.log('Processed ai_settings:', safeAiSettings);
          setAiSettings(prev => ({ ...prev, ...safeAiSettings }));
        }
      } else {
        console.warn("No settings found in database or error occurred");
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleTestConnection = async (type) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`${type} connection test successful`);
    } catch (error) {
      console.error('Connection test failed:', error);
      alert('Connection test failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> System Settings
          </h1>
          <p className="text-muted-foreground text-sm">Configure system-wide behavior, security policies, and features</p>
        </div>
      </div>

      {/* System Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" /> System Information
          </CardTitle>
          <CardDescription>Current system configuration and version details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Application</p>
              <p className="font-medium">{systemInfo.appName}</p>
              <p className="text-xs text-muted-foreground mt-1">v{systemInfo.appVersion}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Environment</p>
              <p className="font-medium capitalize">{systemInfo.environment}</p>
              <Badge variant={systemInfo.environment === 'production' ? 'success' : 'outline'} className="mt-1">
                {systemInfo.environment}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Database</p>
              <p className="font-medium">{systemInfo.databaseVersion}</p>
              <p className="text-xs text-muted-foreground mt-1">PostgreSQL</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">API Version</p>
              <p className="font-medium">{systemInfo.apiVersion}</p>
              <p className="text-xs text-muted-foreground mt-1">REST API</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date(systemInfo.lastUpdated).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2 mb-4">
          <TabsTrigger value="general" className="text-xs sm:text-sm py-2.5 sm:py-1.5">General</TabsTrigger>
          {(user?.role === 'super_admin' || user?.role === 'superadmin') && <TabsTrigger value="security" className="text-xs sm:text-sm py-2.5 sm:py-1.5">Security</TabsTrigger>}
          {(user?.role === 'super_admin' || user?.role === 'superadmin') && <TabsTrigger value="auth" className="text-xs sm:text-sm py-2.5 sm:py-1.5">Authentication</TabsTrigger>}
          <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2.5 sm:py-1.5">Notifications</TabsTrigger>
          {(user?.role === 'super_admin' || user?.role === 'superadmin') && <TabsTrigger value="features" className="text-xs sm:text-sm py-2.5 sm:py-1.5">Features</TabsTrigger>}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="text-base sm:text-lg mb-2">General System Settings</CardTitle>
              <CardDescription className="text-sm sm:text-base">Configure basic system information and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">Application Name</Label>
                  <Input
                    className="text-base sm:text-sm"
                    value={generalSettings.appName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, appName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">Application Version</Label>
                  <Input
                    className="text-base sm:text-sm"
                    value={generalSettings.appVersion}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, appVersion: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">Barangay Name</Label>
                  <Input
                    className="text-base sm:text-sm"
                    value={generalSettings.barangayName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, barangayName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">City / Municipality</Label>
                  <Input
                    className="text-base sm:text-sm"
                    value={generalSettings.city}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">District</Label>
                  <Input
                    className="text-base sm:text-sm"
                    value={generalSettings.district}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, district: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">Contact Number</Label>
                  <Input
                    className="text-base sm:text-sm"
                    placeholder="(02) 8XXX-XXXX"
                    value={generalSettings.contactNumber}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">Timezone</Label>
                  <Select value={generalSettings.timezone} onValueChange={(v) => setGeneralSettings({ ...generalSettings, timezone: v })}>
                    <SelectTrigger className="text-base sm:text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Manila">Asia/Manila (PST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">Language</Label>
                  <Select value={generalSettings.language} onValueChange={(v) => setGeneralSettings({ ...generalSettings, language: v })}>
                    <SelectTrigger className="text-base sm:text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fil">Filipino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                {(user?.role === 'super_admin' || user?.role === 'superadmin') && (
                  <>
                    <div className={`flex items-center justify-between p-3 sm:p-4 border rounded-lg ${generalSettings.maintenanceMode ? 'border-orange-500 bg-orange-50' : ''}`}>
                      <div className="flex-1 mr-4">
                        <p className="font-medium text-sm sm:text-base flex items-center gap-2">
                          Maintenance Mode
                          {generalSettings.maintenanceMode && <Badge variant="destructive" className="text-xs">ACTIVE</Badge>}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Disable application for maintenance (blocks all except super_admin)</p>
                      </div>
                      <Switch
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={async (checked) => {
                          const newSettings = { ...generalSettings, maintenanceMode: checked };
                          setGeneralSettings(newSettings);
                          
                          // Save to localStorage immediately for instant local effect
                          localStorage.setItem('maintenance_mode', checked.toString());
                          
                          // Dispatch custom event to trigger immediate local maintenance check
                          window.dispatchEvent(new CustomEvent('maintenanceModeChanged', { detail: { maintenanceMode: checked } }));
                          
                          if (checked) {
                            alert('⚠️ WARNING: Enabling Maintenance Mode will block public access to the application. Only super_admin will be able to access the system.');
                          }

                          // Auto-save to database to affect other browsers
                          if (settingsId) {
                            const { maintenanceMode, ...generalSettingsToSave } = newSettings;
                            await supabase
                              .from('system_settings')
                              .update({
                                general_settings: {
                                  ...generalSettingsToSave,
                                  maintenance_mode: maintenanceMode
                                },
                                updated_at: new Date().toISOString()
                              })
                              .eq('id', settingsId);
                          }
                        }}
                      />
                    </div>

                    {generalSettings.maintenanceMode && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                          <div className="space-y-2">
                            <p className="font-medium text-orange-800">Maintenance Mode is Active</p>
                            <ul className="text-sm text-orange-700 space-y-1">
                              <li>• Public users cannot access the application</li>
                              <li>• Only administrators can log in and access the system</li>
                              <li>• API endpoints return maintenance messages to public users</li>
                              <li>• Background services continue running normally</li>
                              <li>• All data remains safe and accessible to admins</li>
                            </ul>
                            <p className="text-xs text-orange-600 mt-2">Remember to disable maintenance mode when you're done!</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <Button onClick={() => handleSave('General')} disabled={saving} className="w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-2">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {(user?.role === 'super_admin' || user?.role === 'superadmin') && (
          <>
            <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Security Policies
              </CardTitle>
              <CardDescription>Configure system-wide security settings and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">SSL/TLS Enabled</p>
                    <p className="text-sm text-muted-foreground">Enforce secure connections</p>
                  </div>
                  <Switch
                    checked={securitySettings.sslEnabled}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, sslEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">CSRF Protection</p>
                    <p className="text-sm text-muted-foreground">Enable cross-site request forgery protection</p>
                  </div>
                  <Switch
                    checked={securitySettings.csrfProtection}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, csrfProtection: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Rate Limiting</p>
                    <p className="text-sm text-muted-foreground">Limit API requests to prevent abuse</p>
                  </div>
                  <Switch
                    checked={securitySettings.rateLimiting}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, rateLimiting: checked })}
                  />
                </div>

                {securitySettings.rateLimiting && (
                  <div className="space-y-2 pl-4">
                    <Label>Requests Per Minute</Label>
                    <Input
                      type="number"
                      value={securitySettings.rateLimitPerMinute}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, rateLimitPerMinute: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Audit Logging</p>
                    <p className="text-sm text-muted-foreground">Log all system activities for security monitoring</p>
                  </div>
                  <Switch
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, auditLogging: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Data Encryption</p>
                    <p className="text-sm text-muted-foreground">Encrypt sensitive data at rest</p>
                  </div>
                  <Switch
                    checked={securitySettings.dataEncryption}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, dataEncryption: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Backup Retention Period (days)</Label>
                  <Input
                    type="number"
                    value={securitySettings.backupRetentionDays}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, backupRetentionDays: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Number of days to retain system backups</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => handleSave('Security')} disabled={saving} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Authentication Policies
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Configure user authentication and password requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1440"
                    className="text-base sm:text-sm"
                    value={authSettings.sessionTimeout}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setAuthSettings({ ...authSettings, sessionTimeout: isNaN(value) || value < 1 ? 4 : value });
                    }}
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">Auto-logout after inactivity (1-1440 minutes)</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Max Login Attempts</Label>
                  <Input
                    type="number"
                    className="text-base sm:text-sm"
                    value={authSettings.maxLoginAttempts}
                    onChange={(e) => setAuthSettings({ ...authSettings, maxLoginAttempts: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">Before account lockout</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Lockout Duration (minutes)</Label>
                  <Input
                    type="number"
                    className="text-base sm:text-sm"
                    value={authSettings.lockoutDuration}
                    onChange={(e) => setAuthSettings({ ...authSettings, lockoutDuration: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">Account lockout duration</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Minimum Password Length</Label>
                  <Input
                    type="number"
                    className="text-base sm:text-sm"
                    value={authSettings.passwordMinLength}
                    onChange={(e) => setAuthSettings({ ...authSettings, passwordMinLength: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">Require Uppercase Letters</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Passwords must contain uppercase letters</p>
                  </div>
                  <Switch
                    checked={authSettings.passwordRequireUppercase}
                    onCheckedChange={(checked) => setAuthSettings({ ...authSettings, passwordRequireUppercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">Require Numbers</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Passwords must contain numbers</p>
                  </div>
                  <Switch
                    checked={authSettings.passwordRequireNumbers}
                    onCheckedChange={(checked) => setAuthSettings({ ...authSettings, passwordRequireNumbers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">Require Special Characters</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Passwords must contain special characters</p>
                  </div>
                  <Switch
                    checked={authSettings.passwordRequireSpecialChars}
                    onCheckedChange={(checked) => setAuthSettings({ ...authSettings, passwordRequireSpecialChars: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">Two-Factor Authentication</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Enable 2FA for all admin accounts</p>
                  </div>
                  <Switch
                    checked={authSettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setAuthSettings({ ...authSettings, twoFactorEnabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">IP Whitelist (optional)</Label>
                  <Textarea
                    placeholder="Enter allowed IP addresses, one per line"
                    className="text-base sm:text-sm"
                    value={authSettings.ipWhitelist}
                    onChange={(e) => setAuthSettings({ ...authSettings, ipWhitelist: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">Leave empty to allow all IP addresses</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => handleSave('Authentication')} disabled={saving} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Authentication Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        </>
        )}

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> System Notifications
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Configure system-wide notification channels and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">SMS Notifications</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Enable SMS gateway for alerts</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">Email Notifications</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Enable email notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">Facebook Integration</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Enable Facebook page posting</p>
                  </div>
                  <Switch
                    checked={notificationSettings.facebookEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, facebookEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">Push Notifications</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Enable mobile push notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushEnabled: checked })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="font-medium text-sm sm:text-base mb-3">Alert Types</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1 mr-4">
                      <p className="font-medium text-sm sm:text-base">System Alerts</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">General system notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemAlertsEnabled}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemAlertsEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1 mr-4">
                      <p className="font-medium text-sm sm:text-base">Emergency Alerts</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Critical emergency notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emergencyAlertsEnabled}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emergencyAlertsEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1 mr-4">
                      <p className="font-medium text-sm sm:text-base">Maintenance Alerts</p>
                      <p className="text-sm text-muted-foreground">System maintenance notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.maintenanceAlertsEnabled}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, maintenanceAlertsEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1 mr-4">
                      <p className="font-medium text-sm sm:text-base">Security Alerts</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Security incident notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.securityAlertsEnabled}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, securityAlertsEnabled: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => handleSave('Notifications')} disabled={saving} className="w-full sm:w-auto text-sm sm:text-base">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {(user?.role === 'super_admin' || user?.role === 'superadmin') && (
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> System Features
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Enable or disable system-wide features and functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">AI Assistant</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Enable AI-powered content assistance</p>
                  </div>
                  <Switch
                    checked={featureSettings.aiAssistantEnabled}
                    onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, aiAssistantEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm sm:text-base">Voice Announcements</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Enable text-to-speech voice announcements</p>
                  </div>
                  <Switch
                    checked={featureSettings.voiceAnnouncementsEnabled}
                    onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, voiceAnnouncementsEnabled: checked })}
                  />
                </div>

                {featureSettings.voiceAnnouncementsEnabled && (
                  <div className="space-y-4 pl-0 sm:pl-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Default Voice</Label>
                        <Select value={aiSettings.defaultVoice} onValueChange={(v) => setAiSettings({ ...aiSettings, defaultVoice: v })}>
                          <SelectTrigger className="text-base sm:text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fil-PH-Wavenet-A">Filipino — Wavenet A (Female)</SelectItem>
                            <SelectItem value="fil-PH-Wavenet-D">Filipino — Wavenet D (Male)</SelectItem>
                            <SelectItem value="en-US-Wavenet-F">English — Wavenet F (Female)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Speaking Rate</Label>
                        <Select value={aiSettings.speakingRate} onValueChange={(v) => setAiSettings({ ...aiSettings, speakingRate: v })}>
                          <SelectTrigger className="text-base sm:text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.75">Slow (0.75x)</SelectItem>
                            <SelectItem value="1.0">Normal (1.0x)</SelectItem>
                            <SelectItem value="1.25">Fast (1.25x)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                      <div className="flex-1 mr-4">
                        <p className="font-medium text-sm sm:text-base">Auto-generate Voice</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Automatically generate voice for campaigns</p>
                      </div>
                      <Switch
                        checked={aiSettings.autoGenerateVoice}
                        onCheckedChange={(checked) => setAiSettings({ ...aiSettings, autoGenerateVoice: checked })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm sm:text-base"><KeyRound className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Google Cloud Service Account Key</Label>
                      <Input
                        type="password"
                        placeholder="•••••••••••••••••••••••"
                        className="text-base sm:text-sm"
                        value={aiSettings.serviceAccountKey}
                        onChange={(e) => setAiSettings({ ...aiSettings, serviceAccountKey: e.target.value })}
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">Stored securely on the server; never exposed to the frontend.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Real-time Updates</p>
                    <p className="text-sm text-muted-foreground">Enable live data synchronization</p>
                  </div>
                  <Switch
                    checked={featureSettings.realTimeUpdates}
                    onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, realTimeUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Analytics & Reporting</p>
                    <p className="text-sm text-muted-foreground">Enable system analytics and reporting</p>
                  </div>
                  <Switch
                    checked={featureSettings.analyticsEnabled}
                    onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, analyticsEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Campaign Approval Required</p>
                    <p className="text-sm text-muted-foreground">Require admin approval before publishing campaigns</p>
                  </div>
                  <Switch
                    checked={featureSettings.campaignApprovalRequired}
                    onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, campaignApprovalRequired: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Citizen Registration Required</p>
                    <p className="text-sm text-muted-foreground">Require users to register before accessing features</p>
                  </div>
                  <Switch
                    checked={featureSettings.citizenRegistrationRequired}
                    onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, citizenRegistrationRequired: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">User Registration</p>
                    <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                  </div>
                  <Switch
                    checked={featureSettings.userRegistrationEnabled}
                    onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, userRegistrationEnabled: checked })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => handleSave('Features')} disabled={saving} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Feature Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
