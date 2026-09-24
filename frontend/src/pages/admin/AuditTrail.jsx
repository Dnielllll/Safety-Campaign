import React, { useState, useEffect } from "react";
import { History, Search, User, Megaphone, CheckSquare, Settings, Loader2, RefreshCw, Filter, Download, Calendar, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase.js";
import ExportPasswordDialog from "@/components/ExportPasswordDialog";


const actionIcon = {
  "user.created": User,
  "user.updated": User,
  "user.deleted": User,
  "user.login": User,
  "user.logout": User,
  "campaign.created": Megaphone,
  "campaign.updated": Megaphone,
  "campaign.deleted": Megaphone,
  "campaign.published": Megaphone,
  "content.created": CheckSquare,
  "content.updated": CheckSquare,
  "content.deleted": CheckSquare,
  "settings.": Settings,
  "system.": Settings,
};

const generateLogs = () => {
  const now = new Date();
  
  const formatDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const getPastDate = (daysAgo, hours, minutes) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    if (hours !== undefined && minutes !== undefined) {
      d.setHours(hours, minutes, 0, 0);
    }
    return formatDate(d);
  };

  // Recent logs a few minutes ago
  const min5 = new Date(now.getTime() - 5 * 60000);
  const min9 = new Date(now.getTime() - 9 * 60000);

  return [
    { id: 9, actor: "Admin User", action: "page.created", entity: "Staff Submissions Page", time: getPastDate(7, 11, 0) },
    { id: 10, actor: "Admin User", action: "page.created", entity: "Staff Campaigns Page", time: getPastDate(7, 11, 30) },
  ];
};

function iconFor(action) {
  const key = Object.keys(actionIcon).find((k) => action.startsWith(k));
  return actionIcon[key] || History;
}

export default function AuditTrail() {
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
    fetchAuditStatistics();

    // Set up real-time subscription for audit trail changes
    const channel = supabase
      .channel('audit-trail-changes', {
        config: {
          broadcast: { self: true }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_trail' }, (payload) => {
        console.log('New audit log received:', payload.new);
        // Add new log to the beginning of the array
        const newLog = {
          id: payload.new.id,
          actor: payload.new.actor || 'Unknown',
          action: payload.new.action || 'unknown',
          entity: payload.new.entity || 'unknown',
          time: payload.new.timestamp ? new Date(payload.new.timestamp).toLocaleString() : 'Unknown',
          timestamp: payload.new.timestamp,
          metadata: payload.new.metadata || {},
          success: payload.new.success !== false,
          error_message: payload.new.error_message,
          user_id: payload.new.user_id,
          entity_id: payload.new.entity_id,
          old_values: payload.new.old_values || {},
          new_values: payload.new.new_values || {},
          ip_address: payload.new.ip_address || 'Unknown',
          user_agent: payload.new.user_agent || 'Unknown'
        };
        setLogs(prev => [newLog, ...prev]);
        setLastUpdateTime(new Date());
        // Refresh statistics when new logs arrive
        fetchAuditStatistics();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'audit_trail' }, (payload) => {
        console.log('Audit log updated:', payload.new);
        // Update existing log in the array
        setLogs(prev => prev.map(log => 
          log.id === payload.new.id 
            ? {
                ...log,
                actor: payload.new.actor || log.actor,
                action: payload.new.action || log.action,
                entity: payload.new.entity || log.entity,
                time: payload.new.timestamp ? new Date(payload.new.timestamp).toLocaleString() : log.time,
                timestamp: payload.new.timestamp,
                metadata: payload.new.metadata || log.metadata,
                success: payload.new.success !== false,
                error_message: payload.new.error_message,
                user_id: payload.new.user_id,
                entity_id: payload.new.entity_id,
                old_values: payload.new.old_values || log.old_values,
                new_values: payload.new.new_values || log.new_values,
                ip_address: payload.new.ip_address || log.ip_address,
                user_agent: payload.new.user_agent || log.user_agent
              }
            : log
        ));
        setLastUpdateTime(new Date());
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'audit_trail' }, (payload) => {
        console.log('Audit log deleted:', payload.old);
        // Remove deleted log from the array
        setLogs(prev => prev.filter(log => log.id !== payload.old.id));
        setLastUpdateTime(new Date());
        // Refresh statistics when logs are deleted
        fetchAuditStatistics();
      })
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsRealTimeActive(true);
          console.log('Real-time audit trail subscription active');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsRealTimeActive(false);
          console.log('Real-time subscription closed or error');
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      setIsRealTimeActive(false);
    };
  }, []);

  const fetchAuditLogs = async () => {
    try {
      // Fetch ALL logs — no artificial limit so counts are always accurate
      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Format the data for display with proper handling of null values
      const formattedLogs = (data || []).map(log => ({
        id: log.id,
        actor: log.actor || 'Unknown',
        action: log.action || 'unknown',
        entity: log.entity || 'unknown',
        time: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown',
        timestamp: log.timestamp,
        metadata: log.metadata || {},
        success: log.success !== false,
        error_message: log.error_message,
        user_id: log.user_id,
        entity_id: log.entity_id,
        old_values: log.old_values || {},
        new_values: log.new_values || {},
        ip_address: log.ip_address,
        user_agent: log.user_agent
      }));

      setLogs(formattedLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setLogs(generateLogs());
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics in real-time from the last 30 days of logs
  useEffect(() => {
    if (!logs || logs.length === 0) {
      setStatistics({
        total_logs: 0,
        successful_logs: 0,
        failed_logs: 0,
        success_rate: 0,
        unique_users: 0,
        actions_by_count: [],
        entities_by_count: []
      });
      return;
    }

    // Filter to last 30 days for the stats cards
    const cutoff30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const logs30d = logs.filter(l => l.timestamp && new Date(l.timestamp) >= cutoff30d);

    const total_logs = logs30d.length;
    const successful_logs = logs30d.filter(l => l.success !== false).length;
    const failed_logs = logs30d.filter(l => l.success === false).length;
    const success_rate = total_logs > 0 ? (successful_logs / total_logs) * 100 : 0;

    // Unique users in the last 30 days
    const uniqueActors = new Set(logs30d.filter(l => l.actor && l.actor !== 'Unknown').map(l => l.actor));
    const unique_users = uniqueActors.size;

    // Top actions across ALL time (for the breakdown card)
    const actionCounts = {};
    logs.forEach(l => {
      const action = l.action || 'unknown';
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });
    const actions_by_count = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    setStatistics({
      total_logs,       // 30-day count
      successful_logs,  // 30-day
      failed_logs,      // 30-day
      success_rate,     // 30-day
      unique_users,     // 30-day
      actions_by_count, // all-time top actions
      entities_by_count: []
    });
  }, [logs]);

  // Keep this as a no-op or remove its calls later, but we'll leave the signature
  // so that handleRefresh and useEffect don't crash.
  const fetchAuditStatistics = async () => {
    // Stats are now computed in real-time via the useEffect above
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchAuditLogs(), fetchAuditStatistics()]);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error refreshing audit logs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Actor', 'Action', 'Entity', 'Timestamp', 'Success', 'Error Message'].join(','),
      ...filteredLogs.map(log => [
        log.actor || '',
        log.action || '',
        log.entity || '',
        log.time || '',
        log.success ? 'Yes' : 'No',
        log.error_message || ''
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


  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.actor?.toLowerCase() || '').includes(query.toLowerCase()) || 
      (log.action?.toLowerCase() || '').includes(query.toLowerCase()) || 
      (log.entity?.toLowerCase() || '').includes(query.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const daysAgo = parseInt(dateFilter);
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      matchesDate = logDate >= cutoffDate;
    }
    
    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueEntities = [...new Set(logs.map(log => log.entity))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" /> Audit Trail
          </h1>
          <p className="text-muted-foreground text-sm">Comprehensive system activity logging and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <div className={`h-2 w-2 rounded-full ${isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {isRealTimeActive ? 'Live' : 'Offline'}
            </span>
            {lastUpdateTime && (
              <span className="text-xs text-muted-foreground">
                Last update: {lastUpdateTime.toLocaleTimeString()}
              </span>
            )}
          </div>
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <History className="h-5 w-5" />
                </div>
                <Badge variant="outline">30 Days</Badge>
              </div>
              <p className="text-2xl font-bold font-display">{statistics.total_logs || 0}</p>
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
              <p className="text-2xl font-bold font-display">{statistics.success_rate?.toFixed(1) || 0}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <p className="text-2xl font-bold font-display">{statistics.unique_users || 0}</p>
              <p className="text-sm text-muted-foreground">Unique Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="h-9 w-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <Badge variant="outline">Failed</Badge>
              </div>
              <p className="text-2xl font-bold font-display">
                {statistics.failed_logs || 0}
              </p>
              <p className="text-sm text-muted-foreground">Failed Actions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Breakdown */}
      {statistics && statistics.actions_by_count && statistics.actions_by_count.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Actions</CardTitle>
            <CardDescription>Most frequent actions in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.actions_by_count.slice(0, 5).map((item, index) => {
                const Icon = iconFor(item.action);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.action}</span>
                    </div>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by actor, action, or entity..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {uniqueEntities.map(entity => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1">Last 24 Hours</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Audit Logs ({filteredLogs.length}{filteredLogs.length !== logs.length ? ` of ${logs.length}` : ''})
            </CardTitle>
            <CardDescription>System activity and user actions — all time</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const Icon = iconFor(log.action);
                    return (
                      <TableRow key={log.id} className="hover:bg-secondary/40">
                        <TableCell className="font-medium">{log.actor}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Icon className="h-3 w-3" /> {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{log.entity}</TableCell>
                        <TableCell className="text-muted-foreground">{log.time}</TableCell>
                        <TableCell>
                          {log.success === false ? (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          ) : (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Success
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedLog(log);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Filter className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actor</p>
                  <p className="text-sm">{selectedLog.actor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <p className="text-sm">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entity</p>
                  <p className="text-sm">{selectedLog.entity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                  <p className="text-sm">{selectedLog.time}</p>
                </div>
                {selectedLog.user_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="text-sm font-mono">{selectedLog.user_id}</p>
                  </div>
                )}
                {selectedLog.entity_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entity ID</p>
                    <p className="text-sm font-mono">{selectedLog.entity_id}</p>
                  </div>
                )}
                {selectedLog.ip_address && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                    <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                  </div>
                )}
                {selectedLog.user_agent && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                    <p className="text-sm truncate">{selectedLog.user_agent}</p>
                  </div>
                )}
              </div>

              {selectedLog.error_message && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Error Message</p>
                  <p className="text-sm text-destructive">{selectedLog.error_message}</p>
                </div>
              )}

              {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Old Values</p>
                  <pre className="text-xs bg-secondary p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Values</p>
                  <pre className="text-xs bg-secondary p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Metadata</p>
                  <pre className="text-xs bg-secondary p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ExportPasswordDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={handleExportLogs}
        title="Export Audit Logs"
      />
    </div>
  );
}
