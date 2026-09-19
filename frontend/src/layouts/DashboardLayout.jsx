import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  FileText,
  Sparkles,
  CheckSquare,
  Share2,
  BellRing,
  MessageSquareText,
  BarChart3,
  History,
  Settings,
  LogOut,
  Menu,
  UserCircle,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Activity,
  UserCheck,
  ShieldCheck,
  Database,
  ShieldAlert,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth.jsx";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LogoutOverlay from "@/components/LogoutOverlay.jsx";
import { supabase } from "@/lib/supabase.js";
import { ThemeToggle } from "@/components/ThemeToggle.jsx";

const superAdminNavGroups = [
  {
    title: "Main",
    items: [
      { to: "/super-admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: "User Management",
    items: [
      { to: "/super-admin/users", label: "User Management", icon: Users },
      { to: "/super-admin/admins", label: "Admin Management", icon: ShieldCheck },
      { to: "/super-admin/roles", label: "Role & Permission", icon: UserCheck },
    ],
  },
  {
    title: "System Control",
    items: [
      { to: "/super-admin/system-control", label: "System Control", icon: Database },
      { to: "/super-admin/security-audits", label: "Security & Audits", icon: ShieldAlert },
      { to: "/super-admin/domain-hosting", label: "Domain & Hosting", icon: Globe },
      { to: "/super-admin/backup-restore", label: "Backup & Restore", icon: Database },
    ],
  },
  {
    title: "Performance",
    items: [
      { to: "/super-admin/system-optimization", label: "System Optimization", icon: Activity },
      { to: "/super-admin/monitoring", label: "Monitoring", icon: Activity },
      { to: "/super-admin/reports", label: "Reports", icon: BarChart3 },
      { to: "/super-admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Settings",
    items: [
      { to: "/super-admin/settings", label: "System Settings", icon: Settings },
    ],
  },
];

const adminNavGroups = [
  {
    title: "Main",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: "Campaigns",
    items: [
      { to: "/admin/campaigns", label: "Campaign Management", icon: Megaphone },
      { to: "/admin/ai-assistant", label: "AI Assistant", icon: Sparkles },
      { to: "/admin/content", label: "Content", icon: FileText },
      { to: "/admin/approvals", label: "Approvals", icon: CheckSquare },
      { to: "/admin/distribution", label: "Distribution", icon: Share2 },
    ],
  },
  {
    title: "Communication",
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/notifications", label: "Notifications", icon: BellRing },
      { to: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
    ],
  },
  {
    title: "Analytics",
    items: [
      { to: "/admin/reports", label: "Reports", icon: BarChart3 },
      { to: "/admin/process-monitoring", label: "Monitoring", icon: Activity },
      { to: "/admin/audit-trail", label: "Audit Trail", icon: History },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings },
      { to: "/admin/profile", label: "Profile", icon: UserCircle },
    ],
  },
];

const staffNavGroups = [
  {
    title: "Main",
    items: [
      { to: "/staff", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: "Campaigns",
    items: [
      { to: "/staff/campaigns", label: "My Campaigns", icon: Megaphone },
      { to: "/staff/all-campaigns", label: "All Campaigns", icon: Users },
      { to: "/staff/ai-assistant", label: "AI Assistant", icon: Sparkles },
      { to: "/staff/content", label: "Content", icon: FileText },
      { to: "/staff/submission", label: "Submission", icon: CheckSquare },
    ],
  },
  {
    title: "Communication",
    items: [
      { to: "/staff/notifications", label: "Notifications", icon: BellRing },
      { to: "/staff/feedback", label: "Feedback", icon: MessageSquareText },
    ],
  },
  {
    title: "Reports",
    items: [
      { to: "/staff/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/staff/profile", label: "Profile", icon: UserCircle },
    ],
  },
];

function NavGroup({ group, collapsed, expanded, onToggle }) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors",
          collapsed && "justify-center"
        )}
      >
        {!collapsed && <span>{group.title}</span>}
        {!collapsed && (
          expanded ? (
            <ChevronDown className="ml-auto h-3 w-3" />
          ) : (
            <ChevronRight className="ml-auto h-3 w-3" />
          )
        )}
      </button>
      {!collapsed && expanded && (
        <div className="mt-1 space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ml-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ role }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(
    role === "super_admin"
      ? { Main: true, "User Management": true, "System Control": true, Performance: true, Settings: true }
      : role === "admin"
      ? { Main: true, Campaigns: true, Communication: true, Analytics: true, System: true }
      : { Main: true, Campaigns: true, Communication: true, Reports: true, Account: true }
  );

  const navGroups = role === "super_admin" ? superAdminNavGroups : role === "admin" ? adminNavGroups : staffNavGroups;
  const roleLabel = role === "super_admin" ? "Super Administrator" : role === "admin" ? "Administrator" : "Staff";
  const roleColor = role === "super_admin" ? "bg-purple-600" : role === "admin" ? "bg-primary" : "bg-accent";

  const handleLogout = async () => {
    setLoggingOut(true);
  };

  // Presence tracking is now handled globally in useAuth.jsx

  const doLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleGroup = (title) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="flex min-h-screen bg-background">
      {loggingOut && <LogoutOverlay onDone={doLogout} />}
      
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card transition-all duration-300 h-screen sticky top-0 z-50",
          // Desktop: always visible
          "hidden lg:flex",
          collapsed ? "w-16" : "w-64",
          // Mobile: fixed overlay when open
          mobileOpen && "fixed inset-y-0 left-0 w-64 flex shadow-xl lg:hidden"
        )}
      >
        {/* Sidebar Header with logo */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-3 shrink-0">
          <img
            src="/logo.png"
            alt="Barangay 178"
            className="h-8 w-8 shrink-0 rounded-full object-contain"
          />
          {!collapsed && (
            <div className="leading-tight overflow-hidden flex-1 min-w-0">
              <p className="font-display font-bold text-sm truncate text-primary">Barangay 178</p>
              <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
            </div>
          )}
          {/* Desktop collapse button - hidden on mobile */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:block ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-secondary transition-colors shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          {/* Mobile close button - only shows on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-secondary transition-colors shrink-0"
            title="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {collapsed ? (
            // Collapsed view: show all items without grouping
            <div className="space-y-0.5">
              {navGroups.flatMap((group) => group.items).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={item.label}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </NavLink>
                );
              })}
            </div>
          ) : (
            // Expanded view: show grouped navigation
            <div className="space-y-3">
              {navGroups.map((group) => (
                <NavGroup
                  key={group.title}
                  group={group}
                  collapsed={collapsed}
                  expanded={expandedGroups[group.title]}
                  onToggle={() => toggleGroup(group.title)}
                />
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-border p-2 shrink-0">
          <button
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Log out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 lg:px-6 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-md p-2 text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-medium text-foreground hidden sm:block">Barangay 178 Safety Campaign Management System</p>
              <p className="text-xs text-muted-foreground">Camarin, North Caloocan City</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Badge variant="outline" className="hidden sm:inline-flex border-primary/40 text-primary">
              {roleLabel}
            </Badge>
            <Avatar className="h-8 w-8">
              {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user?.name} />
              ) : (
                <AvatarFallback className={cn("text-white text-xs font-bold", roleColor)}>
                  {user?.name?.[0] ?? (role === "super_admin" ? "SA" : role === "admin" ? "A" : "S")}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-medium">{user?.name ?? (role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin User" : "Staff User")}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? "—"}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
