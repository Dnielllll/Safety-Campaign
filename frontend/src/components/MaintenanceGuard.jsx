import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Maintenance from "@/pages/Maintenance";

export default function MaintenanceGuard({ children }) {
  const location = useLocation();
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Get user role from localStorage directly to avoid auth context dependency
  const getUserRole = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.role;
      }
    } catch (e) {
      console.warn('Could not parse user from localStorage:', e);
    }
    return null;
  };

  const checkMaintenanceStatus = (currentUserRole) => {
    console.log("=== MaintenanceGuard Check ===");

    // Check localStorage directly as primary source (more reliable)
    const localMaintenance = localStorage.getItem('maintenance_mode') === 'true';

    console.log("localStorage values:", {
      maintenance_mode: localStorage.getItem('maintenance_mode'),
      parsed: { maintenance: localMaintenance }
    });

    // Use localStorage values as primary (more reliable than context)
    const effectiveMaintenance = localMaintenance;
    
    // Don't show maintenance page for public routes, login/register
    const publicPaths = [
      '/login', '/register', '/maintenance', '/unauthorized',
      '/', '/campaigns', '/emergency', '/about', '/voice-announcements', '/notifications'
    ];
    
    const isPublicRoute = publicPaths.includes(location.pathname) || 
                          location.pathname.startsWith('/campaigns/');
                          
    if (isPublicRoute) {
      console.log("MaintenanceGuard: Public route, skipping check:", location.pathname);
      setShowMaintenance(false);
      setLoading(false);
      return;
    }

    // Check for maintenance mode (blocks everyone except super_admin)
    if (effectiveMaintenance) {
      const roleToCheck = currentUserRole !== undefined ? currentUserRole : userRole;
      if (!roleToCheck || (roleToCheck !== 'super_admin' && roleToCheck !== 'superadmin')) {
        console.log("MaintenanceGuard: SHOWING maintenance page for:", roleToCheck || 'no user');
        setShowMaintenance(true);
      } else {
        console.log("MaintenanceGuard: Allowing access for super admin during maintenance:", roleToCheck);
        setShowMaintenance(false);
      }
    } else {
      console.log("MaintenanceGuard: Normal operation, no restrictions");
      setShowMaintenance(false);
    }
    
    setLoading(false);
    console.log("=== MaintenanceGuard Decision ===");
    console.log("showMaintenance:", showMaintenance);
  };

  useEffect(() => {
    const updateUserRoleAndCheck = () => {
      const newRole = getUserRole();
      setUserRole(newRole);
      checkMaintenanceStatus(newRole);
    };

    updateUserRoleAndCheck();

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'maintenance_mode' || e.key === 'user') {
        console.log("localStorage changed, rechecking maintenance status");
        updateUserRoleAndCheck();
      }
    };

    // Listen for custom events from SystemSettings
    const handleCustomEvent = (e) => {
      console.log("Custom maintenance event received:", e.detail);
      checkMaintenanceStatus();
    };

    // Listen for auth state changes from AuthProvider
    const handleAuthChange = (e) => {
      console.log("Auth state changed:", e.detail);
      if (e.detail?.user) {
        setUserRole(e.detail.user.role);
      } else {
        setUserRole(null);
      }
      checkMaintenanceStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('maintenanceModeChanged', handleCustomEvent);
    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('maintenanceModeChanged', handleCustomEvent);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [location.pathname]);

  // Check for maintenance message from login
  useEffect(() => {
    const maintenanceMessage = localStorage.getItem("maintenance_message");
    if (maintenanceMessage) {
      alert(maintenanceMessage);
      localStorage.removeItem("maintenance_message");
    }
  }, []);

  // Show loading state while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showMaintenance) {
    return <Maintenance />;
  }

  return <>{children}</>;
}