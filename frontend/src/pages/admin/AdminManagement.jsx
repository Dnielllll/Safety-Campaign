import React, { useState, useEffect } from "react";
import { Shield, Plus, RefreshCw, Search, Edit, Trash2, Mail, CheckCircle, XCircle, Clock, Loader2, MoreVertical, Key, Lock, Megaphone, FileText, BarChart3, Settings as SettingsIcon, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";

const availableModules = [
  { id: 'user_management', name: 'User Management', icon: Users },
  { id: 'campaign_management', name: 'Campaign Management', icon: Megaphone },
  { id: 'content_management', name: 'Content Management', icon: FileText },
  { id: 'analytics_reports', name: 'Analytics & Reports', icon: BarChart3 },
  { id: 'notifications', name: 'Notifications', icon: Mail },
  { id: 'feedback_management', name: 'Feedback Management', icon: SettingsIcon },
  { id: 'system_settings', name: 'System Settings', icon: SettingsIcon },
  { id: 'audit_trail', name: 'Audit Trail', icon: Key },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [onlineAdmins, setOnlineAdmins] = useState(new Set());

  // New admin form state
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'admin',
    password: '',
    allowed_modules: [],
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdmins();
    setRefreshing(false);
  };

  const handleAddAdmin = async () => {
    try {
      // Validate that password is provided
      if (!newAdmin.password) {
        alert('Please enter a password for the admin.');
        return;
      }
      
      // Try to use the RPC function first, fall back to direct auth signup
      let userId;
      
      try {
        const { data, error } = await supabase.rpc('create_user_by_admin', {
          p_email: newAdmin.email,
          p_password: newAdmin.password,
          p_name: newAdmin.name,
          p_role: newAdmin.role,
          p_phone: newAdmin.phone,
          p_address: newAdmin.address,
          p_allowed_modules: newAdmin.allowed_modules
        });

        if (error) throw error;
        userId = data;
      } catch (rpcError) {
        console.log('RPC function not available, using fallback method');
        // Fallback: Create user via auth then update public.users table
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newAdmin.email,
          password: newAdmin.password,
          options: {
            data: {
              name: newAdmin.name,
              phone: newAdmin.phone,
              address: newAdmin.address,
              role: newAdmin.role,
              allowed_modules: newAdmin.allowed_modules,
            },
            emailRedirectTo: undefined, // Disable email confirmation
          },
        });

        if (authError) throw authError;
        userId = authData.user?.id;
      }

      if (userId) {
        // Update the users table with additional info
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: newAdmin.name,
            phone: newAdmin.phone,
            address: newAdmin.address,
            role: newAdmin.role,
            allowed_modules: newAdmin.allowed_modules,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.warn('Could not update user table:', updateError);
        }
      }
      
      setShowAddDialog(false);
      setNewAdmin({ name: '', email: '', phone: '', address: '', role: 'admin', password: '', allowed_modules: [] });
      await fetchAdmins();
      alert('Admin added successfully!');
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Error adding admin: ' + error.message);
    }
  };

  const handleUpdateAdmin = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: selectedAdmin.name,
          phone: selectedAdmin.phone,
          address: selectedAdmin.address,
          role: selectedAdmin.role,
          allowed_modules: selectedAdmin.allowed_modules,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedAdmin.id);

      if (error) throw error;
      
      setShowEditDialog(false);
      setSelectedAdmin(null);
      await fetchAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Error updating admin: ' + error.message);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', adminId);

      if (error) throw error;
      await fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error deleting admin: ' + error.message);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      (admin.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (admin.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-purple-600 text-white',
      admin: 'bg-blue-600 text-white',
    };
    return <Badge className={colors[role] || 'bg-gray-600 text-white'}>{role || 'admin'}</Badge>;
  };

  const isOnline = (adminId) => {
    return onlineAdmins.has(adminId);
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
          <h1 className="text-xl sm:text-2xl font-bold font-display">Admin Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage system administrators and their permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    placeholder="Enter admin name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newAdmin.phone}
                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={newAdmin.address}
                    onChange={(e) => setNewAdmin({ ...newAdmin, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      placeholder="Enter password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newAdmin.role} onValueChange={(v) => setNewAdmin({ ...newAdmin, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Allowed Modules</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableModules.map((module) => {
                      const Icon = module.icon;
                      return (
                        <div key={module.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`module-${module.id}`}
                            checked={newAdmin.allowed_modules?.includes(module.id)}
                            onCheckedChange={(checked) => {
                              const newModules = checked
                                ? [...(newAdmin.allowed_modules || []), module.id]
                                : (newAdmin.allowed_modules || []).filter(m => m !== module.id);
                              setNewAdmin({ ...newAdmin, allowed_modules: newModules });
                            }}
                          />
                          <label
                            htmlFor={`module-${module.id}`}
                            className="text-sm flex items-center gap-2 cursor-pointer"
                          >
                            <Icon className="h-4 w-4" />
                            {module.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setNewAdmin({ name: '', email: '', phone: '', address: '', role: 'admin', password: '', allowed_modules: [] });
                  setShowAddDialog(false);
                }}>Cancel</Button>
                <Button onClick={handleAddAdmin}>Add Admin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <Badge variant="outline">Total</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{admins.length}</p>
            <p className="text-sm text-muted-foreground">Total Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <Badge variant="outline">Admin</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{admins.filter(a => a.role === 'admin').length}</p>
            <p className="text-sm text-muted-foreground">Regular Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <Badge variant="outline">Super</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{admins.filter(a => a.role === 'super_admin').length}</p>
            <p className="text-sm text-muted-foreground">Super Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admins by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Admins ({filteredAdmins.length})</CardTitle>
          <CardDescription>Manage administrator accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Online</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No admins found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{admin.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{admin.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{admin.email || 'No email'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {admin.allowed_modules?.length > 0 ? (
                            admin.allowed_modules.slice(0, 3).map((moduleId) => {
                              const module = availableModules.find(m => m.id === moduleId);
                              return module ? (
                                <Badge key={moduleId} variant="outline" className="text-xs">
                                  {module.name}
                                </Badge>
                              ) : null;
                            })
                          ) : (
                            <Badge variant="outline" className="text-xs">All Modules</Badge>
                          )}
                          {admin.allowed_modules?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{admin.allowed_modules.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">Active</Badge>
                      </TableCell>
                      <TableCell>
                        {isOnline(admin.id) ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Online
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Offline
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            disabled={admin.role === 'super_admin'} // Prevent deleting super admins
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Admin Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={selectedAdmin.name || ''}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={selectedAdmin.phone || ''}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={selectedAdmin.address || ''}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={selectedAdmin.role || 'admin'}
                  onValueChange={(v) => setSelectedAdmin({ ...selectedAdmin, role: v })}
                  disabled={selectedAdmin.role === 'super_admin'} // Prevent changing super admin role
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Allowed Modules</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableModules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <div key={module.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-module-${module.id}`}
                          checked={selectedAdmin.allowed_modules?.includes(module.id)}
                          onCheckedChange={(checked) => {
                            const newModules = checked
                              ? [...(selectedAdmin.allowed_modules || []), module.id]
                              : (selectedAdmin.allowed_modules || []).filter(m => m !== module.id);
                            setSelectedAdmin({ ...selectedAdmin, allowed_modules: newModules });
                          }}
                        />
                        <label
                          htmlFor={`edit-module-${module.id}`}
                          className="text-sm flex items-center gap-2 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          {module.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateAdmin}>Update Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}