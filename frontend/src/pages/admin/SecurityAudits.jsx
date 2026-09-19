import React, { useState, useEffect } from "react";
import { ShieldAlert, Search, Filter, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Loader2, Eye, Download, Calendar, MapPin, User, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import ExportPasswordDialog from "@/components/ExportPasswordDialog";

export default function SecurityAudits() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateRange: '7d',
  });

  const [logStats, setLogStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    warnings: 0,
  });

  useEffect(() => {
    fetchAuditLogs();
    fetchSecurityAlerts();
    // Temporarily disabled realtime subscription to avoid conflicts
    // setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    // In production, subscribe to audit_logs table
    const channel = supabase
      .channel('audit-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_trail' }, (payload) => {
        setAuditLogs(prev => [payload.new, ...prev]);
        updateLogStats([payload.new, ...auditLogs]);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to audit changes');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      // In production, fetch from audit_logs table in Supabase
      // For now, we'll use simulated data
      const simulatedLogs = [
        {
          id: 1,
          action: 'User Login',
          user_email: 'admin@barangay178.com',
          user_name: 'Admin User',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          ip_address: '192.168.1.100',
          status: 'successful',
          type: 'authentication',
        },
        {
          id: 2,
          action: 'Failed Login Attempt',
          user_email: 'unknown@malicious.com',
          user_name: 'Unknown',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          ip_address: '45.33.32.156',
          status: 'failed',
          type: 'authentication',
        },
        {
          id: 3,
          action: 'Campaign Created',
          user_email: 'staff@barangay178.com',
          user_name: 'Staff User',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          ip_address: '192.168.1.105',
          status: 'successful',
          type: 'content',
        },
        {
          id: 4,
          action: 'Permission Changed',
          user_email: 'admin@barangay178.com',
          user_name: 'Admin User',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          ip_address: '192.168.1.100',
          status: 'successful',
          type: 'authorization',
        },
        {
          id: 5,
          action: 'Database Backup',
          user_email: 'system@barangay178.com',
          user_name: 'System',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          ip_address: '127.0.0.1',
          status: 'successful',
          type: 'system',
        },
        {
          id: 6,
          action: 'Rate Limit Exceeded',
          user_email: 'user@example.com',
          user_name: 'Regular User',
          timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
          ip_address: '10.0.0.50',
          status: 'warning',
          type: 'security',
        },
      ];

      setAuditLogs(simulatedLogs);
      updateLogStats(simulatedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      // In production, fetch from security_alerts table
      const simulatedAlerts = [
        {
          id: 1,
          severity: 'high',
          title: 'Multiple Failed Login Attempts',
          description: '10 failed login attempts detected from IP 45.33.32.156',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          status: 'active',
        },
        {
          id: 2,
          severity: 'medium',
          title: 'Unusual API Usage Pattern',
          description: 'API usage increased by 300% in the last hour',
          timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
          status: 'investigating',
        },
        {
          id: 3,
          severity: 'low',
          title: 'SSL Certificate Expiring Soon',
          description: 'SSL certificate will expire in 30 days',
          timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
          status: 'resolved',
        },
      ];

      setSecurityAlerts(simulatedAlerts);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
    }
  };

  const updateLogStats = (logs) => {
    setLogStats({
      total: logs.length,
      successful: logs.filter(l => l.status === 'successful').length,
      failed: logs.filter(l => l.status === 'failed').length,
      warnings: logs.filter(l => l.status === 'warning').length,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAuditLogs(),
      fetchSecurityAlerts(),
    ]);
    setRefreshing(false);
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Action', 'User Email', 'User Name', 'Timestamp', 'IP Address', 'Status', 'Type'].join(','),
      ...filteredLogs.map(log => [
        log.action,
        log.user_email,
        log.user_name,
        new Date(log.timestamp).toLocaleString(),
        log.ip_address,
        log.status,
        log.type,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      (log.action?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
      (log.user_email?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
      (log.ip_address || '').includes(filters.search);
    const matchesType = filters.type === 'all' || log.type === filters.type;
    const matchesStatus = filters.status === 'all' || log.status === filters.status;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      successful: 'bg-green-600 text-white',
      failed: 'bg-red-600 text-white',
      warning: 'bg-yellow-600 text-white',
    };
    const icons = {
      successful: <CheckCircle className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
      warning: <AlertTriangle className="h-3 w-3" />,
    };
    return (
      <Badge className={colors[status] || 'bg-gray-600 text-white'} className="gap-1">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      high: 'bg-red-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-blue-600 text-white',
    };
    return <Badge className={colors[severity] || 'bg-gray-600 text-white'}>{severity}</Badge>;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display">Security & Audits</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitor system security and audit logs</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setShowExportDialog(true)} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Log Statistics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <Badge variant="outline">Total</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{logStats.total}</p>
            <p className="text-sm text-muted-foreground">Total Logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <Badge variant="success">Success</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{logStats.successful}</p>
            <p className="text-sm text-muted-foreground">Successful</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <XCircle className="h-5 w-5" />
              </div>
              <Badge variant="destructive">Failed</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{logStats.failed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <Badge variant="outline">Warning</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{logStats.warnings}</p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" /> Recent Security Events
          </CardTitle>
          <CardDescription>Important security alerts and incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No security alerts</p>
            ) : (
              securityAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    alert.severity === 'high' ? 'bg-red-100' :
                    alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{alert.title}</span>
                      {getSeverityBadge(alert.severity)}
                      <Badge variant="outline">{alert.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Audit Logs
          </CardTitle>
          <CardDescription>Complete system activity and security events</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by action, email, or IP..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="authorization">Authorization</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm">{log.user_name}</p>
                            <p className="text-xs text-muted-foreground">{log.user_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{log.ip_address}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{log.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowLogDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Action</p>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p>{getStatusBadge(selectedLog.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User Email</p>
                  <p className="font-medium">{selectedLog.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User Name</p>
                  <p className="font-medium">{selectedLog.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{selectedLog.ip_address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedLog.type}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ExportPasswordDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={handleExportLogs}
        title="Export Security Logs"
      />
    </div>
  );
}