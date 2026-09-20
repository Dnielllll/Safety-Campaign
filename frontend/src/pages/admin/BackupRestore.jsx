import React, { useState, useEffect } from "react";
import { Database, Download, Upload, RefreshCw, Trash2, Calendar, Clock, HardDrive, Plus, Loader2, CheckCircle, XCircle, AlertTriangle, Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";

export default function BackupRestore() {
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [deletingBackup, setDeletingBackup] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [backups, setBackups] = useState([]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordAction, setPasswordAction] = useState(null); // 'download' or 'restore'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const [backupStats, setBackupStats] = useState({
    totalBackups: 0,
    latestBackup: null,
    backupType: 'automated',
    lastBackupTime: null,
  });

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      // In production, fetch from backups table in Supabase
      // For now, we'll use simulated data
      const simulatedBackups = [
        {
          id: 1,
          name: 'Full Database Backup',
          type: 'full',
          size: '156 MB',
          created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
          status: 'completed',
          description: 'Complete database backup including all tables',
        },
        {
          id: 2,
          name: 'Incremental Backup',
          type: 'incremental',
          size: '12 MB',
          created_at: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
          status: 'completed',
          description: 'Incremental backup since last full backup',
        },
        {
          id: 3,
          name: 'Full Database Backup',
          type: 'full',
          size: '145 MB',
          created_at: new Date(Date.now() - 48 * 60 * 60000).toISOString(),
          status: 'completed',
          description: 'Complete database backup',
        },
        {
          id: 4,
          name: 'Manual Backup',
          type: 'manual',
          size: '158 MB',
          created_at: new Date(Date.now() - 72 * 60 * 60000).toISOString(),
          status: 'completed',
          description: 'Manual backup created by admin',
        },
      ];

      setBackups(simulatedBackups);
      setBackupStats({
        totalBackups: simulatedBackups.length,
        latestBackup: simulatedBackups[0],
        backupType: 'automated',
        lastBackupTime: simulatedBackups[0]?.created_at,
      });
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async (type = 'full') => {
    setCreatingBackup(true);
    setBackupProgress(0);

    try {
      // Simulate backup creation progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setBackupProgress(i);
      }

      // In production, create actual backup via Supabase
      const newBackup = {
        id: Date.now(),
        name: `${type === 'full' ? 'Full' : 'Incremental'} Database Backup`,
        type,
        size: `${Math.floor(Math.random() * 50) + 100} MB`,
        created_at: new Date().toISOString(),
        status: 'completed',
        description: `${type === 'full' ? 'Complete' : 'Incremental'} database backup`,
      };

      setBackups([newBackup, ...backups]);
      setBackupStats({
        ...backupStats,
        totalBackups: backups.length + 1,
        latestBackup: newBackup,
        lastBackupTime: newBackup.created_at,
      });

      alert('Backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup');
    } finally {
      setCreatingBackup(false);
      setBackupProgress(0);
    }
  };



  const handleDeleteBackup = async (backupId) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) return;

    setDeletingBackup(true);
    try {
      // In production, delete from Supabase storage
      setBackups(backups.filter(b => b.id !== backupId));
      setBackupStats({
        ...backupStats,
        totalBackups: backups.length - 1,
      });
      alert('Backup deleted successfully');
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Error deleting backup');
    } finally {
      setDeletingBackup(false);
    }
  };

  const handleDownloadBackup = async (backup) => {
    setSelectedBackup(backup);
    setPasswordAction('download');
    setPassword('');
    setPasswordError('');
    setShowPasswordDialog(true);
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    setRestoringBackup(true);
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, restore from Supabase
      alert('Backup restored successfully');
      setShowRestoreDialog(false);
      setShowPasswordDialog(false);
      setSelectedBackup(null);
      setPassword('');
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Error restoring backup');
    } finally {
      setRestoringBackup(false);
    }
  };

  const verifyPassword = async () => {
    if (!password) {
      setPasswordError('Please enter your password');
      return;
    }

    setVerifyingPassword(true);
    setPasswordError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPasswordError('User not authenticated');
        return;
      }

      // Verify password by attempting to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (error) {
        setPasswordError('Invalid password');
        return;
      }

      // Password verified, proceed with action
      if (passwordAction === 'download') {
        alert(`Downloading backup: ${selectedBackup.name}`);
        setShowPasswordDialog(false);
        setPassword('');
      } else if (passwordAction === 'restore') {
        setShowPasswordDialog(false);
        setShowRestoreDialog(true);
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setPasswordError('Password verification failed');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBackups();
    setRefreshing(false);
  };

  const getTypeBadge = (type) => {
    const colors = {
      full: 'bg-blue-600 text-white',
      incremental: 'bg-green-600 text-white',
      manual: 'bg-purple-600 text-white',
    };
    return <Badge className={colors[type] || 'bg-gray-600 text-white'}>{type}</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-600 text-white',
      in_progress: 'bg-yellow-600 text-white',
      failed: 'bg-red-600 text-white',
    };
    return <Badge className={colors[status] || 'bg-gray-600 text-white'}>{status}</Badge>;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Backup & Restore</h1>
          <p className="text-sm text-muted-foreground">Manage system backups and database recovery</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Backup Statistics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <Badge variant="outline">Total</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{backupStats.totalBackups}</p>
            <p className="text-sm text-muted-foreground">Total Backups</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <Badge variant="success">Latest</Badge>
            </div>
            <p className="text-lg font-bold font-display truncate">
              {backupStats.latestBackup?.name || 'No backup'}
            </p>
            <p className="text-sm text-muted-foreground">Latest Backup</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <Badge variant="outline">Type</Badge>
            </div>
            <p className="text-2xl font-bold font-display capitalize">
              {backupStats.backupType}
            </p>
            <p className="text-sm text-muted-foreground">Backup Type</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <Badge variant="outline">Last</Badge>
            </div>
            <p className="text-lg font-bold font-display">
              {backupStats.lastBackupTime 
                ? new Date(backupStats.lastBackupTime).toLocaleDateString()
                : 'Never'}
            </p>
            <p className="text-sm text-muted-foreground">Last Backup</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> Create Backup
          </CardTitle>
          <CardDescription>Manually create a new system backup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {creatingBackup && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Creating backup...</span>
                  <span className="text-sm text-muted-foreground">{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleCreateBackup('full')}
                disabled={creatingBackup}
                className="flex-1"
              >
                <Database className="h-4 w-4 mr-2" />
                Create Full Backup
              </Button>
              <Button
                onClick={() => handleCreateBackup('incremental')}
                disabled={creatingBackup}
                variant="outline"
                className="flex-1"
              >
                <Database className="h-4 w-4 mr-2" />
                Create Incremental Backup
              </Button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Full backups include all data. Incremental backups only include changes since the last backup.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" /> Available Backups
          </CardTitle>
          <CardDescription>View and manage all system backups. Download and restore require password verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No backups available</p>
            ) : (
              backups.map((backup) => (
                <div key={backup.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{backup.name}</h3>
                        {getTypeBadge(backup.type)}
                        {getStatusBadge(backup.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{backup.description}</p>
                    </div>
                    <Badge variant="outline">{backup.size}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(backup.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(backup.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadBackup(backup)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBackup(backup);
                        setPasswordAction('restore');
                        setPassword('');
                        setPasswordError('');
                        setShowPasswordDialog(true);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteBackup(backup.id)}
                      disabled={deletingBackup}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Verification Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Password Verification Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Security Verification</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {passwordAction === 'download' 
                      ? 'Downloading backups requires password verification to prevent unauthorized access.'
                      : 'Restoring backups requires password verification to prevent unauthorized data restoration.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-password">Enter your password</Label>
              <div className="relative">
                <Input
                  id="backup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>

            {selectedBackup && (
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Action: {passwordAction === 'download' ? 'Download' : 'Restore'}</p>
                <p className="text-sm text-muted-foreground">Backup: {selectedBackup.name}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={verifyPassword} disabled={verifyingPassword}>
              {verifyingPassword ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restore</DialogTitle>
          </DialogHeader>
          {selectedBackup && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Warning: Data Loss Risk</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Restoring from a backup will replace all current data. This action cannot be undone.
                      Make sure you have a recent backup before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Backup to restore:</p>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">{selectedBackup.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBackup.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(selectedBackup.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestoreBackup} disabled={restoringBackup}>
              {restoringBackup ? 'Restoring...' : 'Confirm Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}