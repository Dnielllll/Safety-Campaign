import React, { useState, useEffect } from "react";
import { Shield, Database, Server, Activity, Users, HardDrive, Globe, AlertTriangle, CheckCircle, Loader2, RefreshCw, TrendingUp, Zap, Cpu, MemoryStick, Network, Clock, Lock, Key, Ban, Settings, Bell, FileText, Download, Play, Pause } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import ExportPasswordDialog from "@/components/ExportPasswordDialog";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSystemControlDialog, setShowSystemControlDialog] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    apiRateLimiting: true,
    maxApiRequests: 1000,
    sessionTimeout: 30, // Already set to 30 minutes - good for development
  });
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    databaseSize: '0 MB',
    apiCalls: 0,
    activeServers: 0,
    systemHealth: 'Good',
    storageUsage: 0,
    databaseProvider: 'Supabase',
  });

  const [serverStatus, setServerStatus] = useState({
    api: { status: 'online', responseTime: '45ms' },
    database: { status: 'online', responseTime: '120ms' },
    storage: { status: 'online', responseTime: '200ms' },
    auth: { status: 'online', responseTime: '80ms' },
  });

  const [systemAlerts, setSystemAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchSystemStats();
    fetchSystemAlerts();
    fetchRecentActivity();

    // Set up real-time subscription for user changes
    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchSystemStats();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to users changes');
        }
      });

    return () => {
      supabase.removeChannel(usersChannel);
    };
  }, []);

  const fetchSystemStats = async () => {
    try {
      // Fetch user counts from Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('role, created_at');

      if (error) throw error;

      if (users) {
        const totalUsers = users.length;
        const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
        
        // Calculate API calls (simulated - in production use Supabase logs)
        const apiCalls = Math.floor(Math.random() * 50000) + 10000;
        
        // Database size (simulated - in production use Supabase metrics)
        const databaseSize = `${Math.floor(Math.random() * 500) + 100} MB`;
        
        // Storage usage (simulated)
        const storageUsage = Math.floor(Math.random() * 80) + 10;

        setSystemStats({
          totalUsers,
          totalAdmins,
          databaseSize,
          apiCalls,
          activeServers: 3,
          systemHealth: 'Good',
          storageUsage,
          databaseProvider: 'Supabase',
        });
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemAlerts = async () => {
    // Simulated alerts - in production fetch from Supabase logs table
    setSystemAlerts([
      { id: 1, type: 'warning', message: 'High memory usage detected (85%)', time: '2 minutes ago' },
      { id: 2, type: 'info', message: 'Database backup completed successfully', time: '1 hour ago' },
      { id: 3, type: 'success', message: 'SSL certificate renewed automatically', time: '3 hours ago' },
    ]);
  };

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent user activity from Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (users) {
        setRecentActivity(users.map(user => ({
          action: 'User Registration',
          user: user.name || user.email,
          email: user.email,
          role: user.role,
          timestamp: new Date(user.created_at).toLocaleString(),
        })));
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchSystemStats(),
      fetchSystemAlerts(),
      fetchRecentActivity(),
    ]);
    setRefreshing(false);
  };

  const handleSystemControl = async (action) => {
    try {
      // For export_data, show password dialog first
      if (action === 'export_data') {
        setShowExportDialog(true);
        return;
      }
      
      // In production, this would call actual system control APIs
      console.log('System control action:', action);
      alert(`System control action "${action}" triggered successfully`);
    } catch (error) {
      console.error('Error executing system control:', error);
      alert('Error executing system control: ' + error.message);
    }
  };

  const handleExportData = async () => {
    try {
      // In production, this would export all system data
      console.log('Exporting all system data');
      alert('System data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting system data');
    }
  };

  const handleBackupCreate = async () => {
    try {
      // In production, this would trigger a real backup
      console.log('Creating system backup...');
      alert('System backup initiated successfully');
      setShowBackupDialog(false);
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup: ' + error.message);
    }
  };

  const handleSecurityUpdate = async () => {
    try {
      // In production, this would update security settings
      console.log('Updating security settings:', systemSettings);
      alert('Security settings updated successfully');
      setShowSecurityDialog(false);
    } catch (error) {
      console.error('Error updating security settings:', error);
      alert('Error updating security settings: ' + error.message);
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'Good': return 'text-green-600 bg-green-100';
      case 'Warning': return 'text-yellow-600 bg-yellow-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    return status === 'online' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl overflow-hidden relative bg-gradient-to-r from-purple-600 to-blue-600 min-h-[120px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative p-6 flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h1 className="font-display text-2xl font-bold">Super Admin Dashboard</h1>
              <p className="text-white/75 text-sm">System Overview & Real-time Monitoring</p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <Badge className={getHealthColor(systemStats.systemHealth)}>
                {systemStats.systemHealth}
              </Badge>
            </div>
            <p className="text-2xl font-bold font-display">{systemStats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{systemStats.totalAdmins}</p>
            <p className="text-sm text-muted-foreground">Total Admins</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <Badge variant="outline">{systemStats.databaseProvider}</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{systemStats.databaseSize}</p>
            <p className="text-sm text-muted-foreground">Database Size</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <Badge variant="success">Today</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{systemStats.apiCalls.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">API Calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                <Server className="h-5 w-5" />
              </div>
              <Badge variant="success">Online</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{systemStats.activeServers}</p>
            <p className="text-sm text-muted-foreground">Active Servers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <HardDrive className="h-5 w-5" />
              </div>
              <Badge variant={systemStats.storageUsage > 80 ? "destructive" : "outline"}>
                {systemStats.storageUsage}%
              </Badge>
            </div>
            <p className="text-2xl font-bold font-display">{systemStats.storageUsage}%</p>
            <p className="text-sm text-muted-foreground">Storage Usage</p>
            <Progress value={systemStats.storageUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <Badge variant="success">Optimal</Badge>
            </div>
            <p className="text-2xl font-bold font-display">99.9%</p>
            <p className="text-sm text-muted-foreground">System Health</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <Globe className="h-5 w-5" />
              </div>
              <Badge variant="success">Secure</Badge>
            </div>
            <p className="text-2xl font-bold font-display">SSL</p>
            <p className="text-sm text-muted-foreground">Connection Status</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status Banner */}
      {systemSettings.maintenanceMode && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Maintenance Mode Active</p>
                <p className="text-sm text-yellow-700">System is currently in maintenance mode. User registration and certain features may be disabled.</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-auto"
                onClick={() => setSystemSettings({ ...systemSettings, maintenanceMode: false })}
              >
                Exit Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Server Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" /> Server Status
          </CardTitle>
          <CardDescription>Real-time status of all system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(serverStatus).map(([key, status]) => (
              <div key={key} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{key}</span>
                  <Badge className={getStatusColor(status.status)}>{status.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Response: {status.responseTime}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" /> System Alerts
          </CardTitle>
          <CardDescription>Important system notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
            ) : (
              systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />}
                  {alert.type === 'info' && <Activity className="h-5 w-5 text-blue-600 shrink-0" />}
                  {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent System Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Recent System Activity
          </CardTitle>
          <CardDescription>Latest system events and user activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} ({activity.email}) - {activity.role}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <p>{activity.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" /> Resource Usage
          </CardTitle>
          <CardDescription>Current system resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <Progress value={45} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">62%</span>
              </div>
              <Progress value={62} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network Bandwidth</span>
                <span className="text-sm text-muted-foreground">28%</span>
              </div>
              <Progress value={28} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Super Admin Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Super Admin Controls
          </CardTitle>
          <CardDescription>Advanced system management controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Dialog open={showSystemControlDialog} onOpenChange={setShowSystemControlDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  System Controls
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>System Controls</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Maintenance Mode</Label>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setSystemSettings({ ...systemSettings, maintenanceMode: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>User Registration</Label>
                    <Switch
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings({ ...systemSettings, registrationEnabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>API Rate Limiting</Label>
                    <Switch
                      checked={systemSettings.apiRateLimiting}
                      onCheckedChange={(checked) => 
                        setSystemSettings({ ...systemSettings, apiRateLimiting: checked })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max API Requests (per minute)</Label>
                    <Input
                      type="number"
                      value={systemSettings.maxApiRequests}
                      onChange={(e) => 
                        setSystemSettings({ ...systemSettings, maxApiRequests: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => 
                        setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSystemControlDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSystemControl('update_settings')}>
                    Apply Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Security Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Password Policy</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (6+ characters)</SelectItem>
                        <SelectItem value="medium">Medium (8+ chars, 1 number)</SelectItem>
                        <SelectItem value="high">High (12+ chars, mixed case, special)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Two-Factor Authentication</Label>
                    <Select defaultValue="optional">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="required">Required for Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Session Security</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="strict">Strict (IP binding)</SelectItem>
                        <SelectItem value="paranoid">Paranoid (device binding)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSecurityDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSecurityUpdate}>
                    Update Security
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Backup & Restore
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Backup & Restore</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Backup Type</Label>
                    <Select defaultValue="full">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full System Backup</SelectItem>
                        <SelectItem value="database">Database Only</SelectItem>
                        <SelectItem value="files">Files & Media Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Backup Schedule</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Only</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Last backup: 2 hours ago</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBackupCreate}>
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full justify-start" onClick={() => handleSystemControl('restart_services')}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Services
            </Button>

            <Button variant="outline" className="w-full justify-start" onClick={() => handleSystemControl('clear_cache')}>
              <HardDrive className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>

            <Button variant="outline" className="w-full justify-start" onClick={() => handleSystemControl('view_logs')}>
              <FileText className="h-4 w-4 mr-2" />
              System Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Quick Actions
          </CardTitle>
          <CardDescription>Frequently used super admin operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => handleSystemControl('broadcast_notification')}>
              <Bell className="h-4 w-4 mr-2" />
              Broadcast Notification
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleSystemControl('emergency_mode')}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Mode
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleSystemControl('generate_report')}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleSystemControl('export_data')}>
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <ExportPasswordDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={handleExportData}
        title="Export All System Data"
      />
    </div>
  );
}