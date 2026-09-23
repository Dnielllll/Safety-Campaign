import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Bell, MessageSquare, Siren, User, Home, Megaphone, Volume2, ClipboardList, LogOut, Menu, X, Building2, AlertTriangle, BookOpen, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useTheme } from "@/components/ThemeProvider.jsx";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle.jsx";
import LogoutOverlay from "@/components/LogoutOverlay.jsx";
import AIChatbot from "@/components/AIChatbot.jsx";


const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/campaigns", label: "Safety Campaigns", icon: Megaphone },
  { to: "/voice-announcements", label: "AI Voice", icon: Volume2 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/surveys", label: "Surveys", icon: ClipboardList },
  { to: "/emergency", label: "Emergency Info", icon: Siren },
  { to: "/about", label: "About Barangay", icon: Building2 },
  { to: "/guides", label: "Guides", icon: BookOpen },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
];

export default function PublicLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, maintenanceMode } = useAuth();
  const { resetTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const isMaintenance = maintenanceMode || localStorage.getItem('maintenance_mode') === 'true';

  // Force light mode for public views (guest users only)
  useEffect(() => {
    if (!user || !user.role) {
      resetTheme();
    }
  }, [user, resetTheme]);

  if (isMaintenance && user?.role !== 'super_admin' && pathname !== '/emergency') {
    return <Navigate to="/maintenance" replace />;
  }

  const handleLogout = () => {
    setLoggingOut(true);
  };

  const doLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Guest view: Top navigation bar
  if (!user || !user.role) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Top navigation bar */}
        <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur shadow-sm">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="Barangay 178 Seal" className="h-10 w-10 rounded-full object-contain" />
              <div className="leading-tight hidden sm:block">
                <p className="font-display font-bold text-sm text-primary">Barangay 178</p>
                <p className="text-xs text-muted-foreground">Safety Campaign System</p>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => {
                // Hide feedback, surveys, and notifications from anonymous users
                if (item.to === "/feedback" || item.to === "/surveys" || item.to === "/notifications") return null;

                const Icon = item.icon;
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Button size="sm" asChild className="hidden sm:flex">
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild variant="outline" className="hidden sm:flex">
                <Link to="/register">Sign up</Link>
              </Button>
              <button
                className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-secondary"
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile navigation drawer */}
          {mobileOpen && (
            <nav className="md:hidden border-t border-border bg-white px-4 pb-4 pt-2 flex flex-col gap-1">
              {navItems.map((item) => {
                // Hide feedback, surveys, and notifications from anonymous users
                if (item.to === "/feedback" || item.to === "/surveys" || item.to === "/notifications") return null;

                const Icon = item.icon;
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
                <Button size="sm" asChild className="w-full">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
                </Button>
                <Button size="sm" asChild variant="outline" className="w-full">
                  <Link to="/register" onClick={() => setMobileOpen(false)}>Sign up</Link>
                </Button>
              </div>
            </nav>
          )}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-border py-8 mt-16 bg-primary text-primary-foreground">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-12">
                {/* Brand & Copyright */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <img src="/logo.png" alt="Barangay 178 Seal" className="h-10 w-10 rounded-full object-contain" />
                    <p className="font-display font-bold text-lg">Barangay 178</p>
                  </div>
                  <p className="text-sm opacity-90 mb-4">
                    © {new Date().getFullYear()} Barangay 178. All rights reserved.
                  </p>
                  <p className="text-sm opacity-75">
                    Public Safety & Transparency Portal for Barangay 178 residents.
                  </p>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold mb-4">Contact Us</h4>
                  <div className="space-y-2 text-sm opacity-90">
                    <p>Camarin Road, Barangay 178,<br />Caloocan, 1400 Metro Manila</p>
                    <p>Phone: <a href="tel:0921-463-6835" className="hover:underline">0921-463-6835</a> / <a href="tel:0928-497-1332" className="hover:underline">0928-497-1332</a></p>
                    <p>Email: <a href="mailto:brgy178caloocan@gmail.com" className="hover:underline">brgy178caloocan@gmail.com</a></p>
                  </div>
                </div>

                {/* Legal & Privacy */}
                <div>
                  <h4 className="font-semibold mb-4">Legal & Privacy</h4>
                  <div className="space-y-2 text-sm">
                    <a href="/terms-of-service" className="block opacity-90 hover:opacity-100 hover:underline transition-opacity">
                      Terms of Service
                    </a>
                    <a href="/privacy-policy" className="block opacity-90 hover:opacity-100 hover:underline transition-opacity">
                      Privacy Policy
                    </a>
                    <a href="/cookie-policy" className="block opacity-90 hover:opacity-100 hover:underline transition-opacity">
                      Cookie Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        <AIChatbot />
      </div>
    );
  }

  // Authenticated resident view: Sidebar navigation (similar to Admin/Staff)
  // Only show sidebar if user has valid 'citizen' or 'public' role
  if (user.role === 'citizen' || user.role === 'public') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {loggingOut && <LogoutOverlay onDone={doLogout} />}
        <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-white sticky top-0 h-[calc(100vh-40px)]">
          {/* Logo section */}
          <div className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Barangay 178 Seal" className="h-10 w-10 rounded-full object-contain" />
              <div className="leading-tight">
                <p className="font-display font-bold text-sm text-primary">Barangay 178</p>
                <p className="text-xs text-muted-foreground">Resident Portal</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
            {navItems.map((item) => {
              // Hide AI Voice from resident accounts
              if (item.to === "/voice-announcements") return null;

              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section at bottom */}
          <div className="p-4 border-t border-border">
            <div className="flex flex-col gap-2">
              <Link to="/profile" className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary transition-colors">
                <Avatar className="h-8 w-8">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user?.name} />
                  ) : (
                    <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm font-medium truncate">{user.name}</span>
              </Link>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-secondary rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
                <div className="flex items-center gap-2">
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile layout */}
        <div className="flex-1 flex flex-col lg:hidden">
          {/* Mobile header */}
          <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur shadow-sm">
            <div className="container flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <img src="/logo.png" alt="Barangay 178 Seal" className="h-10 w-10 rounded-full object-contain" />
                <div className="leading-tight hidden sm:block">
                  <p className="font-display font-bold text-sm text-primary">Barangay 178</p>
                  <p className="text-xs text-muted-foreground">Resident Portal</p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Avatar>
                    {user?.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user?.name} />
                    ) : (
                      <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
                    )}
                  </Avatar>
                </Link>
                <button
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile nav drawer */}
            {mobileOpen && (
              <nav className="border-t border-border bg-white px-4 pb-4 pt-2 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
                {navItems.map((item) => {
                  // Hide AI Voice from resident accounts
                  if (item.to === "/voice-announcements") return null;

                  const Icon = item.icon;
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </nav>
            )}
          </header>

          <main className="flex-1">
            <Outlet />
          </main>

          <footer className="border-t border-border py-8 mt-16 bg-white">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Barangay 178 Seal" className="h-8 w-8 rounded-full object-contain" />
                <p>© {new Date().getFullYear()} Barangay 178, Camarin, North Caloocan City.</p>
              </div>
              <p>Safety Campaign Management System</p>
            </div>
          </footer>
        </div>

        {/* Desktop main content */}
        <div className="hidden lg:flex flex-1 flex-col">
          {/* Desktop header */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 lg:px-6 backdrop-blur shrink-0">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Barangay 178 Resident Portal</p>
                <p className="text-xs text-muted-foreground">Camarin, North Caloocan City</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline-flex border border-border px-2 py-1 rounded">
                Resident
              </span>
              <Avatar className="h-8 w-8">
                {user?.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user?.name} />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-xs font-bold">
                    {user?.name?.[0] ?? "R"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-medium">{user?.name ?? "Resident User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? "—"}</p>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>

          <footer className="border-t border-border py-8 mt-16 bg-white">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Barangay 178 Seal" className="h-8 w-8 rounded-full object-contain" />
                <p>© {new Date().getFullYear()} Barangay 178, Camarin, North Caloocan City.</p>
              </div>
              <p>Safety Campaign Management System</p>
            </div>
          </footer>
        </div>
        </div>
        <AIChatbot />
      </div>
    );
  }

  // For admin/staff/super_admin users, redirect them to their respective dashboards
  // if they land on public routes, rather than returning a blank screen (null)
  if (user.role === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  }
  
  // Don't redirect admin/staff to their dashboards if under maintenance 
  // because MaintenanceGuard will just block them. Let them see the public view.
  if (!isMaintenance) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'staff') {
      return <Navigate to="/staff" replace />;
    }
  }

  // Fallback for any other case
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Barangay 178 Seal" className="h-10 w-10 rounded-full object-contain" />
            <div className="leading-tight hidden sm:block">
              <p className="font-display font-bold text-sm text-primary">Barangay 178</p>
              <p className="text-xs text-muted-foreground">Safety Campaign System</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleLogout}>Log out</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <AIChatbot />
    </div>
  );
}
