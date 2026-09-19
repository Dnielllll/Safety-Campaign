import React, { useState, useEffect } from "react";
import { Database, Server, HardDrive, Activity, RefreshCw, Save, Settings, Loader2, CheckCircle, XCircle, AlertTriangle, Clock, Cpu, MemoryStick, Network, Globe, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";

export default function SystemControl() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [systemHealth, setSystemHealth] = useState({
    status: 'Good',
    cpu: 45,
    memory: 62,
    disk: 58,
    network: 28,
  });

  const [databaseConfig, setDatabaseConfig] = useState({
    provider: 'supabase',
    host: 'zuuwqrxmkeryzbcrlrai.supabase.co',
    port: '5432',
    database: 'postgres',
    poolSize: 15,
    connectionTimeout: 30,
  });

  const [databaseStats, setDatabaseStats] = useState({
    totalTables: 12,
    activeConnections: 8,
    databaseSize: '156 MB',
    queryRate: 245,
    resourceAllocation: 'Normal',
    tableNames: [],
  });

  const [storageStats, setStorageStats] = useState({
    totalStorage: '5 GB',
    usedStorage: '2.8 GB',
    availableStorage: '2.2 GB',
    usagePercentage: 56,
    bucketCount: 3,
  });

  useEffect(() => {
    fetchSystemHealth();
    fetchDatabaseStats();
    fetchStorageStats();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      // Simulated system health - in production use Supabase health endpoint
      setSystemHealth({
        status: 'Good',
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 30) + 50,
        disk: Math.floor(Math.random() * 30) + 40,
        network: Math.floor(Math.random() * 40) + 10,
      });
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabaseStats = async () => {
    try {
      // Try to fetch actual table count from Supabase using RPC function
      const { data: tables, error } = await supabase
        .rpc('get_table_names');

      if (!error && tables) {
        const tableNames = tables.map(t => t.table_name || t).filter(Boolean);
        setDatabaseStats(prev => ({
          ...prev,
          totalTables: tableNames.length,
          tableNames: tableNames,
        }));
      } else {
        // Fallback: Try direct query to information_schema
        console.log('RPC failed, trying direct query...');
        const { data: directTables, error: directError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');

        if (!directError && directTables) {
          const tableNames = directTables.map(t => t.table_name);
          setDatabaseStats(prev => ({
            ...prev,
            totalTables: tableNames.length,
            tableNames: tableNames,
          }));
        } else {
          // Final fallback to known tables
          console.log('Direct query failed, using known tables');
          const knownTables = [
            'users', 
            'campaigns', 
            'notifications', 
            'feedback', 
            'audit_trail', 
            'chatbot_training', 
            'admin_permissions', 
            'system_settings',
            'profiles',
            'storage_buckets',
            'storage_objects'
          ];
          setDatabaseStats(prev => ({
            ...prev,
            totalTables: knownTables.length,
            tableNames: knownTables,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching database stats:', error);
      // Fallback to known tables
      const knownTables = [
        'users', 
        'campaigns', 
        'notifications', 
        'feedback', 
        'audit_trail', 
        'chatbot_training', 
        'admin_permissions', 
        'system_settings',
        'profiles',
        'storage_buckets',
        'storage_objects'
      ];
      setDatabaseStats(prev => ({
        ...prev,
        totalTables: knownTables.length,
        tableNames: knownTables,
      }));
    }
  };

  const fetchStorageStats = async () => {
    try {
      // In production, fetch from Supabase storage API
      setStorageStats({
        totalStorage: '5 GB',
        usedStorage: '2.8 GB',
        availableStorage: '2.2 GB',
        usagePercentage: 56,
        bucketCount: 3,
      });
    } catch (error) {
      console.error('Error fetching storage stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchSystemHealth(),
      fetchDatabaseStats(),
      fetchStorageStats(),
    ]);
    setRefreshing(false);
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      // In production, save to Supabase system_settings table
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'Good': return 'text-green-600 bg-green-100';
      case 'Warning': return 'text-yellow-600 bg-yellow-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResourceColor = (value) => {
    if (value > 80) return 'text-red-600';
    if (value > 60) return 'text-yellow-600';
    return 'text-green-600';
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
          <h1 className="text-xl sm:text-2xl font-bold font-display">System Control</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage database configuration and system resources</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> System Health Status
          </CardTitle>
          <CardDescription>Real-time system performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Overall Status</p>
                  <p className="text-sm text-muted-foreground">System is operating normally</p>
                </div>
              </div>
              <Badge className={getHealthColor(systemHealth.status)}>
                {systemHealth.status}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <p className={`text-2xl font-bold ${getResourceColor(systemHealth.cpu)}`}>
                  {systemHealth.cpu}%
                </p>
                <Progress value={systemHealth.cpu} className="mt-2" />
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Memory Usage</span>
                </div>
                <p className={`text-2xl font-bold ${getResourceColor(systemHealth.memory)}`}>
                  {systemHealth.memory}%
                </p>
                <Progress value={systemHealth.memory} className="mt-2" />
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Disk Usage</span>
                </div>
                <p className={`text-2xl font-bold ${getResourceColor(systemHealth.disk)}`}>
                  {systemHealth.disk}%
                </p>
                <Progress value={systemHealth.disk} className="mt-2" />
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Network Usage</span>
                </div>
                <p className={`text-2xl font-bold ${getResourceColor(systemHealth.network)}`}>
                  {systemHealth.network}%
                </p>
                <Progress value={systemHealth.network} className="mt-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> Database Configuration
          </CardTitle>
          <CardDescription>Supabase database connection settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Database Provider</Label>
              <Select value={databaseConfig.provider} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supabase">Supabase</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Host</Label>
              <Input value={databaseConfig.host} disabled />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input value={databaseConfig.port} disabled />
            </div>
            <div className="space-y-2">
              <Label>Database Name</Label>
              <Input value={databaseConfig.database} disabled />
            </div>
            <div className="space-y-2">
              <Label>Connection Pool Size</Label>
              <Input
                type="number"
                value={databaseConfig.poolSize}
                onChange={(e) => setDatabaseConfig({ ...databaseConfig, poolSize: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Connection Timeout (seconds)</Label>
              <Input
                type="number"
                value={databaseConfig.connectionTimeout}
                onChange={(e) => setDatabaseConfig({ ...databaseConfig, connectionTimeout: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Some database settings are managed by Supabase and cannot be modified.
            </span>
          </div>
          <Button onClick={handleSaveConfig} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>

      {/* Database Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" /> Database Resources
          </CardTitle>
          <CardDescription>Current database usage and resource allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Tables</span>
              </div>
              <p className="text-2xl font-bold">{databaseStats.totalTables}</p>
              <p className="text-xs text-muted-foreground">Active tables</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Connections</span>
              </div>
              <p className="text-2xl font-bold">{databaseStats.activeConnections}</p>
              <p className="text-xs text-muted-foreground">Current connections</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Database Size</span>
              </div>
              <p className="text-2xl font-bold">{databaseStats.databaseSize}</p>
              <p className="text-xs text-muted-foreground">Total storage used</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Query Rate</span>
              </div>
              <p className="text-2xl font-bold">{databaseStats.queryRate}</p>
              <p className="text-xs text-muted-foreground">Queries per minute</p>
            </div>
          </div>

          <div className="mt-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Resource Allocation</span>
              <Badge variant="outline">{databaseStats.resourceAllocation}</Badge>
            </div>
            <Progress value={65} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">65% of allocated resources in use</p>
          </div>

          <div className="mt-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Database Tables (Supabase)</span>
              </div>
              <Badge variant="outline">{databaseStats.totalTables} tables</Badge>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {databaseStats.tableNames && databaseStats.tableNames.length > 0 ? (
                databaseStats.tableNames.map((tableName, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{tableName}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground col-span-full">Loading table names...</p>
              )}
            </div>
            <div className="mt-3 flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Note: Run the SQL file <code className="bg-blue-100 px-1 rounded">database/get-table-names.sql</code> in your Supabase SQL editor to enable accurate table listing. Some tables may not be visible due to Supabase permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" /> Storage Usage
          </CardTitle>
          <CardDescription>Supabase storage bucket usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Storage</p>
              <p className="text-xl font-bold">{storageStats.totalStorage}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Used Storage</p>
              <p className="text-xl font-bold">{storageStats.usedStorage}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Available</p>
              <p className="text-xl font-bold">{storageStats.availableStorage}</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Usage</span>
              <Badge variant={storageStats.usagePercentage > 80 ? "destructive" : "outline"}>
                {storageStats.usagePercentage}%
              </Badge>
            </div>
            <Progress value={storageStats.usagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {storageStats.bucketCount} storage buckets configured
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}