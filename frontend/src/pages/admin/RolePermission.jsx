import React, { useState, useEffect } from "react";
import { UserCheck, Shield, Save, RefreshCw, Plus, Trash2, Edit, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

const defaultPermissions = {
  // User Management
  manage_users: false,
  manage_admins: false,
  manage_roles: false,
  
  // Campaign Management
  create_campaigns: false,
  edit_campaigns: false,
  delete_campaigns: false,
  approve_campaigns: false,
  
  // Content Management
  manage_content: false,
  ai_assistant: false,
  
  // Communication
  send_notifications: false,
  manage_feedback: false,
  
  // Analytics & Reports
  view_analytics: false,
  generate_reports: false,
  
  // System Settings
  system_settings: false,
  security_settings: false,
  database_management: false,
  
  // Audit & Monitoring
  view_audit_logs: false,
  system_monitoring: false,
};

export default function RolePermission() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: { ...defaultPermissions },
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from database first
      const { data: dbRoles, error: dbError } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!dbError && dbRoles && dbRoles.length > 0) {
        // Use database roles
        setRoles(dbRoles);
      } else {
        // Fallback to hardcoded roles if table doesn't exist or is empty
        console.log('Using hardcoded roles (database table may not exist)');
        const hardcodedRoles = [
          {
            id: 'super_admin',
            name: 'Super Admin',
            description: 'Full system access with all permissions',
            permissions: Object.keys(defaultPermissions).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
            is_system: true,
          },
          {
            id: 'admin',
            name: 'Admin',
            description: 'Administrative access for campaign and user management',
            permissions: {
              ...defaultPermissions,
              manage_users: true,
              create_campaigns: true,
              edit_campaigns: true,
              approve_campaigns: true,
              manage_content: true,
              ai_assistant: true,
              send_notifications: true,
              manage_feedback: true,
              view_analytics: true,
              generate_reports: true,
            },
            is_system: true,
          },
          {
            id: 'staff',
            name: 'Staff',
            description: 'Limited access for content creation and campaign management',
            permissions: {
              ...defaultPermissions,
              create_campaigns: true,
              edit_campaigns: true,
              manage_content: true,
              ai_assistant: true,
              send_notifications: true,
              manage_feedback: true,
            },
            is_system: true,
          },
          {
            id: 'citizen',
            name: 'Citizen',
            description: 'Basic access for viewing campaigns and providing feedback',
            permissions: {
              ...defaultPermissions,
              manage_feedback: true,
            },
            is_system: true,
          },
        ];
        
        setRoles(hardcodedRoles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Fallback to hardcoded roles on error
      const hardcodedRoles = [
        {
          id: 'super_admin',
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          permissions: Object.keys(defaultPermissions).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
          is_system: true,
        },
        {
          id: 'admin',
          name: 'Admin',
          description: 'Administrative access for campaign and user management',
          permissions: {
            ...defaultPermissions,
            manage_users: true,
            create_campaigns: true,
            edit_campaigns: true,
            approve_campaigns: true,
            manage_content: true,
            ai_assistant: true,
            send_notifications: true,
            manage_feedback: true,
            view_analytics: true,
            generate_reports: true,
          },
          is_system: true,
        },
        {
          id: 'staff',
          name: 'Staff',
          description: 'Limited access for content creation and campaign management',
          permissions: {
            ...defaultPermissions,
            create_campaigns: true,
            edit_campaigns: true,
            manage_content: true,
            ai_assistant: true,
            send_notifications: true,
            manage_feedback: true,
          },
          is_system: true,
        },
        {
          id: 'citizen',
          name: 'Citizen',
          description: 'Basic access for viewing campaigns and providing feedback',
          permissions: {
            ...defaultPermissions,
            manage_feedback: true,
          },
          is_system: true,
        },
      ];
      
      setRoles(hardcodedRoles);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRoles();
    setRefreshing(false);
  };

  const handleAddRole = async () => {
    try {
      // Try to save to database first
      try {
        const { data, error } = await supabase
          .from('roles')
          .insert({
            name: newRole.name,
            description: newRole.description,
            permissions: newRole.permissions,
            is_system: false,
          })
          .select()
          .single();

        if (error) throw error;
        
        setRoles([...roles, data]);
        setShowAddDialog(false);
        setNewRole({
          name: '',
          description: '',
          permissions: { ...defaultPermissions },
        });
        alert('Role added successfully!');
      } catch (dbError) {
        console.log('Database save failed, using local state:', dbError);
        // Fallback to local state if table doesn't exist
        const newRoleData = {
          id: `custom_${Date.now()}`,
          ...newRole,
          is_system: false,
        };
        
        setRoles([...roles, newRoleData]);
        setShowAddDialog(false);
        setNewRole({
          name: '',
          description: '',
          permissions: { ...defaultPermissions },
        });
        alert('Role added locally (database table may not exist)');
      }
    } catch (error) {
      console.error('Error adding role:', error);
      alert('Error adding role: ' + error.message);
    }
  };

  const handleUpdateRole = async () => {
    try {
      // Try to update in database first
      try {
        const { error } = await supabase
          .from('roles')
          .update({
            name: selectedRole.name,
            description: selectedRole.description,
            permissions: selectedRole.permissions,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedRole.id);

        if (error) throw error;
        
        setRoles(roles.map(role => 
          role.id === selectedRole.id ? selectedRole : role
        ));
        
        setShowEditDialog(false);
        setSelectedRole(null);
        alert('Role updated successfully!');
      } catch (dbError) {
        console.log('Database update failed, using local state:', dbError);
        // Fallback to local state if table doesn't exist
        setRoles(roles.map(role => 
          role.id === selectedRole.id ? selectedRole : role
        ));
        
        setShowEditDialog(false);
        setSelectedRole(null);
        alert('Role updated locally (database table may not exist)');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating role: ' + error.message);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      // Try to delete from database first
      try {
        const { error } = await supabase
          .from('roles')
          .delete()
          .eq('id', roleId);

        if (error) throw error;
        
        setRoles(roles.filter(role => role.id !== roleId));
        alert('Role deleted successfully!');
      } catch (dbError) {
        console.log('Database delete failed, using local state:', dbError);
        // Fallback to local state if table doesn't exist
        setRoles(roles.filter(role => role.id !== roleId));
        alert('Role deleted locally (database table may not exist)');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Error deleting role: ' + error.message);
    }
  };

  const togglePermission = (role, permission) => {
    const updatedPermissions = {
      ...role.permissions,
      [permission]: !role.permissions[permission],
    };
    
    if (selectedRole && selectedRole.id === role.id) {
      setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
    }
    
    setRoles(roles.map(r => 
      r.id === role.id ? { ...r, permissions: updatedPermissions } : r
    ));
  };

  const getPermissionCount = (permissions) => {
    return Object.values(permissions).filter(Boolean).length;
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
          <h1 className="text-xl sm:text-2xl font-bold font-display">Role & Permission Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage user roles and access permissions</p>
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
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="Enter role name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Enter role description"
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Permissions</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.entries(defaultPermissions).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        <Switch
                          checked={newRole.permissions[key]}
                          onCheckedChange={(checked) => 
                            setNewRole({
                              ...newRole,
                              permissions: { ...newRole.permissions, [key]: checked }
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddRole}>Add Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    {role.name}
                    {role.is_system && (
                      <Badge variant="outline" className="text-xs">System</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{role.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getPermissionCount(role.permissions)}/{Object.keys(defaultPermissions).length}
                  </Badge>
                  {!role.is_system && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedRole(role);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Active Permissions</span>
                  <span className="text-muted-foreground">{getPermissionCount(role.permissions)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(role.permissions)
                    .filter(([_, enabled]) => enabled)
                    .slice(0, 6)
                    .map(([key]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  {getPermissionCount(role.permissions) > 6 && (
                    <div className="text-xs text-muted-foreground">
                      +{getPermissionCount(role.permissions) - 6} more
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                  disabled={selectedRole.is_system}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                  rows={3}
                  disabled={selectedRole.is_system}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Permissions</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(defaultPermissions).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      <Switch
                        checked={selectedRole.permissions[key]}
                        onCheckedChange={(checked) => 
                          setSelectedRole({
                            ...selectedRole,
                            permissions: { ...selectedRole.permissions, [key]: checked }
                          })
                        }
                        disabled={selectedRole.is_system}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateRole} disabled={selectedRole?.is_system}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}