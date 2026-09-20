import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";
import { logAuditEvent } from "@/lib/auditLogger.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [error, setError] = useState(null);
  const loginInProgress = useRef(false); // guard against race with onAuthStateChange

  const ensureProfile = async (authUser) => {
    if (!authUser) return null;

    // Build fallback profile from auth metadata (always available)
    const meta = authUser.user_metadata || {};
    const fallbackProfile = {
      id: authUser.id,
      email: authUser.email,
      name: meta.name || authUser.email?.split("@")[0] || "User",
      role: meta.role || "public",
      phone: meta.phone || null,
      address: meta.address || null,
      is_active: true,
      _fromMetadata: true, // flag to know this came from fallback
    };

    // Normalise role: treat 'superadmin' (DB value) as 'super_admin' (frontend value)
    const normaliseRole = (profile) => {
      if (!profile) return profile;
      if (profile.role === "superadmin") return { ...profile, role: "super_admin" };
      return profile;
    };

    try {
      // Try to fetch existing profile
      const { data: profile, error } = await supabaseHelpers.getUserById(authUser.id);
      if (profile) return normaliseRole(profile);

      // Profile missing — auto-create from auth user metadata
      console.warn("public.users profile missing for", authUser.id, "— auto-creating from auth metadata");
      console.log("Auth user metadata:", JSON.stringify(meta));

      const { data: created, error: createErr } = await supabaseHelpers.createUser({
        id: authUser.id,
        email: authUser.email,
        name: fallbackProfile.name,
        role: fallbackProfile.role,
        phone: fallbackProfile.phone,
        address: fallbackProfile.address,
        is_active: true,
      });

      if (createErr) {
        console.error("Failed to auto-create user profile:", createErr);
        // Return fallback from auth metadata so login still works
        return normaliseRole(fallbackProfile);
      }

      return normaliseRole(created || fallbackProfile);
    } catch (err) {
      console.error("ensureProfile error:", err);
      // Always return something usable — never block login
      return normaliseRole(fallbackProfile);
    }
  };

  useEffect(() => {
    // On mount: check existing Supabase session
    const initSession = async () => {
      try {
        // If offline, skip session check — let public pages load from cache
        if (!navigator.onLine) {
          console.log("AuthProvider: offline — skipping session init");
          setUser(null);
          // Still load local settings
          const localMaintenance = localStorage.getItem('maintenance_mode') === 'true';
          setMaintenanceMode(localMaintenance);
          setLoading(false);
          return;
        }

        const { session } = await supabaseHelpers.getSession();
        if (session?.user) {
          const profile = await ensureProfile(session.user);
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
          // Dispatch event for MaintenanceGuard
          window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: profile } }));
        } else {
          setUser(null);
          localStorage.removeItem('user');
          // Dispatch event for MaintenanceGuard
          window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null } }));
        }
        
        // Load system settings for maintenance mode and auth settings
        try {
          // Clean up any NaN values in auth_settings
          cleanupAuthSettings();
          
          // First try localStorage for immediate response
          const localMaintenance = localStorage.getItem('maintenance_mode') === 'true';
          
          console.log("=== Auth Context Loading ===");
          console.log("Local storage settings:", { maintenance: localMaintenance });
          console.log("Raw localStorage values:", { 
            maintenance_mode: localStorage.getItem('maintenance_mode'),
            auth_settings: localStorage.getItem('auth_settings')
          });
          
          setMaintenanceMode(localMaintenance);
          
          console.log("State set from localStorage:", { maintenanceMode: localMaintenance });
          
          // Then try database for authoritative settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('system_settings')
            .select('general_settings, auth_settings')
            .maybeSingle();
          
          console.log("Database query result:", { settingsData, settingsError });
          
          if (!settingsError && settingsData) {
            // Load maintenance mode
            if (settingsData.general_settings) {
              const dbMaintenance = settingsData.general_settings.maintenance_mode || false;
              
              console.log("Database maintenance settings:", { maintenance: dbMaintenance });
              
              // Use database settings as authoritative
              setMaintenanceMode(dbMaintenance);
              
              // Update localStorage to match database
              localStorage.setItem('maintenance_mode', dbMaintenance.toString());
              
              console.log("Updated localStorage from database");
            }
            
            // Load auth settings
            if (settingsData.auth_settings) {
              console.log("Database auth_settings:", settingsData.auth_settings);
              
              // Ensure numeric values are safe
              const safeAuthSettings = {
                sessionTimeout: typeof settingsData.auth_settings.sessionTimeout === 'number' && !isNaN(settingsData.auth_settings.sessionTimeout) && settingsData.auth_settings.sessionTimeout > 0
                  ? settingsData.auth_settings.sessionTimeout : 30,
                maxLoginAttempts: typeof settingsData.auth_settings.maxLoginAttempts === 'number' && !isNaN(settingsData.auth_settings.maxLoginAttempts) && settingsData.auth_settings.maxLoginAttempts > 0 
                  ? settingsData.auth_settings.maxLoginAttempts : 5,
                lockoutDuration: typeof settingsData.auth_settings.lockoutDuration === 'number' && !isNaN(settingsData.auth_settings.lockoutDuration) && settingsData.auth_settings.lockoutDuration > 0 
                  ? settingsData.auth_settings.lockoutDuration : 15,
                passwordMinLength: typeof settingsData.auth_settings.passwordMinLength === 'number' && !isNaN(settingsData.auth_settings.passwordMinLength) && settingsData.auth_settings.passwordMinLength > 0 
                  ? settingsData.auth_settings.passwordMinLength : 8,
                passwordRequireUppercase: settingsData.auth_settings.passwordRequireUppercase !== undefined ? settingsData.auth_settings.passwordRequireUppercase : true,
                passwordRequireNumbers: settingsData.auth_settings.passwordRequireNumbers !== undefined ? settingsData.auth_settings.passwordRequireNumbers : true,
                passwordRequireSpecialChars: settingsData.auth_settings.passwordRequireSpecialChars !== undefined ? settingsData.auth_settings.passwordRequireSpecialChars : true,
                twoFactorEnabled: settingsData.auth_settings.twoFactorEnabled !== undefined ? settingsData.auth_settings.twoFactorEnabled : false,
                ipWhitelist: settingsData.auth_settings.ipWhitelist || '',
              };
              
              console.log("Safe auth_settings to save to localStorage:", safeAuthSettings);
              
              // Update localStorage with database auth settings
              localStorage.setItem('auth_settings', JSON.stringify(safeAuthSettings));
              
              console.log("Updated auth_settings in localStorage from database");
            }
          } else {
            console.warn("Failed to load system settings from database, using localStorage values");
          }
          
          console.log("=== Final Auth Context State ===");
          console.log("Maintenance mode:", localMaintenance);
          console.log("Auth settings in localStorage:", localStorage.getItem('auth_settings'));
        } catch (settingsErr) {
          console.error("Error loading system settings:", settingsErr);
          // Fallback to localStorage if everything fails
          const localMaintenance = localStorage.getItem('maintenance_mode') === 'true';
          setMaintenanceMode(localMaintenance);
        }
      } catch (err) {
        console.error("AuthProvider: session init failed:", err);
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      if (event === "SIGNED_IN" && session?.user) {
        // Skip — login() already handles profile fetch & setUser to avoid race condition
        if (loginInProgress.current) return;
        const profile = await ensureProfile(session.user);
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
        // Dispatch event for MaintenanceGuard
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: profile } }));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem('user');
        // Dispatch event for MaintenanceGuard
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null } }));
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // keep current user, just refresh token silently
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Clean up NaN values from localStorage auth_settings
  const cleanupAuthSettings = () => {
    try {
      const stored = localStorage.getItem('auth_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleaned = {
          ...parsed,
          sessionTimeout: (parsed.sessionTimeout && !isNaN(parsed.sessionTimeout) && parsed.sessionTimeout > 0) ? parsed.sessionTimeout : 30,
          maxLoginAttempts: (parsed.maxLoginAttempts && !isNaN(parsed.maxLoginAttempts) && parsed.maxLoginAttempts > 0) ? parsed.maxLoginAttempts : 5,
          lockoutDuration: (parsed.lockoutDuration && !isNaN(parsed.lockoutDuration) && parsed.lockoutDuration > 0) ? parsed.lockoutDuration : 15,
          passwordMinLength: (parsed.passwordMinLength && !isNaN(parsed.passwordMinLength) && parsed.passwordMinLength > 0) ? parsed.passwordMinLength : 8,
        };
        localStorage.setItem('auth_settings', JSON.stringify(cleaned));
        console.log('Cleaned up auth_settings:', cleaned);
      }
    } catch (e) {
      console.warn('Could not clean up auth_settings:', e);
    }
  };

  // Reload system settings function
  const reloadSystemSettings = async () => {
    try {
      console.log("Reloading system settings...");
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('general_settings, auth_settings')
        .maybeSingle();
      
      console.log("Reload system settings result:", { settingsData, settingsError });
      
      if (!settingsError && settingsData) {
        // Reload maintenance mode
        if (settingsData.general_settings) {
          const newMaintenanceMode = settingsData.general_settings.maintenance_mode || false;
          
          console.log("Updating maintenance mode:", { 
            from: { maintenanceMode },
            to: { maintenanceMode: newMaintenanceMode }
          });
          
          setMaintenanceMode(newMaintenanceMode);
          
          // Update localStorage for immediate effect
          localStorage.setItem('maintenance_mode', newMaintenanceMode.toString());
        }
        
        // Reload auth settings
        if (settingsData.auth_settings) {
          console.log("Reloading auth_settings from database:", settingsData.auth_settings);
          
          // Ensure numeric values are safe
          const safeAuthSettings = {
            sessionTimeout: typeof settingsData.auth_settings.sessionTimeout === 'number' && !isNaN(settingsData.auth_settings.sessionTimeout) && settingsData.auth_settings.sessionTimeout > 0
              ? settingsData.auth_settings.sessionTimeout : 30,
            maxLoginAttempts: typeof settingsData.auth_settings.maxLoginAttempts === 'number' && !isNaN(settingsData.auth_settings.maxLoginAttempts) && settingsData.auth_settings.maxLoginAttempts > 0 
              ? settingsData.auth_settings.maxLoginAttempts : 5,
            lockoutDuration: typeof settingsData.auth_settings.lockoutDuration === 'number' && !isNaN(settingsData.auth_settings.lockoutDuration) && settingsData.auth_settings.lockoutDuration > 0 
              ? settingsData.auth_settings.lockoutDuration : 15,
            passwordMinLength: typeof settingsData.auth_settings.passwordMinLength === 'number' && !isNaN(settingsData.auth_settings.passwordMinLength) && settingsData.auth_settings.passwordMinLength > 0 
              ? settingsData.auth_settings.passwordMinLength : 8,
            passwordRequireUppercase: settingsData.auth_settings.passwordRequireUppercase !== undefined ? settingsData.auth_settings.passwordRequireUppercase : true,
            passwordRequireNumbers: settingsData.auth_settings.passwordRequireNumbers !== undefined ? settingsData.auth_settings.passwordRequireNumbers : true,
            passwordRequireSpecialChars: settingsData.auth_settings.passwordRequireSpecialChars !== undefined ? settingsData.auth_settings.passwordRequireSpecialChars : true,
            twoFactorEnabled: settingsData.auth_settings.twoFactorEnabled !== undefined ? settingsData.auth_settings.twoFactorEnabled : false,
            ipWhitelist: settingsData.auth_settings.ipWhitelist || '',
          };
          
          console.log("Safe auth_settings to save to localStorage:", safeAuthSettings);
          
          // Update localStorage with database auth settings
          localStorage.setItem('auth_settings', JSON.stringify(safeAuthSettings));
          
          console.log("Updated auth_settings in localStorage from database");
        }
      } else {
        console.warn("Failed to reload system settings, keeping current values");
      }
    } catch (err) {
      console.error("Error reloading system settings:", err);
    }
  };

  // Password validation function — reads from admin-configured auth_settings in localStorage
  const validatePassword = (password) => {
    let minLength = 8;
    let requireUppercase = true;
    let requireNumbers = true;
    let requireSpecialChars = true;

    try {
      const stored = localStorage.getItem('auth_settings');
      console.log('Loading auth_settings for password validation:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed auth_settings:', parsed);
        // Handle NaN/invalid values by falling back to defaults
        if (parsed.passwordMinLength && !isNaN(parsed.passwordMinLength) && parsed.passwordMinLength > 0) {
          minLength = parsed.passwordMinLength;
        }
        if (parsed.passwordRequireUppercase !== undefined) requireUppercase = parsed.passwordRequireUppercase;
        if (parsed.passwordRequireNumbers !== undefined) requireNumbers = parsed.passwordRequireNumbers;
        if (parsed.passwordRequireSpecialChars !== undefined) requireSpecialChars = parsed.passwordRequireSpecialChars;
      }
    } catch (e) {
      console.warn('Could not parse auth_settings for password validation:', e);
    }

    console.log('Password validation settings:', { minLength, requireUppercase, requireNumbers, requireSpecialChars });

    const errors = [];

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Session timeout logic — reads from admin-configured auth_settings in localStorage
  const timeoutRef = useRef(null);

  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!user) return;

      // Read timeout from admin settings; default is 4 minutes
      let timeoutMinutes = 4;
      try {
        const stored = localStorage.getItem('auth_settings');
        console.log('=== Loading auth_settings for session timeout ===');
        console.log('Raw localStorage auth_settings:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Parsed auth_settings:', parsed);
          // Handle NaN/invalid values by falling back to defaults
          if (parsed.sessionTimeout && !isNaN(parsed.sessionTimeout) && parsed.sessionTimeout > 0) {
            timeoutMinutes = parsed.sessionTimeout;
          }
        }
        console.log('Session timeout minutes:', timeoutMinutes);
      } catch (e) {
        console.warn('Could not parse auth_settings from localStorage:', e);
      }

      const timeoutMs = timeoutMinutes * 60 * 1000;

      // Set automatic logout on timeout
      timeoutRef.current = setTimeout(() => {
        // Inactivity timeout reached - automatic logout
        localStorage.setItem("logout_message", "Your session has expired due to inactivity. Please log in again.");
        logout();
      }, timeoutMs);
    };

    const handleActivity = () => {
      resetTimeout();
    };

    const events = ["mousemove", "keydown", "scroll", "click"];

    if (user) {
      events.forEach((event) => window.addEventListener(event, handleActivity));
      resetTimeout();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user]);

  // Presence Tracking (Global)
  useEffect(() => {
    if (!user) {
      setOnlineUsers(new Set());
      return;
    }

    // Clean up any existing channels with the same name to prevent duplicates
    const existingChannels = supabase.getChannels().filter(c => c.topic === 'realtime:staff_presence');
    existingChannels.forEach(c => supabase.removeChannel(c));

    const channel = supabase.channel('staff_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const onlineIds = new Set();
        Object.values(newState).forEach(presences => {
          presences.forEach(p => {
            if (p.user_id) onlineIds.add(p.user_id);
          });
        });
        setOnlineUsers(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            role: user.role,
            name: user.name,
            online_at: new Date().toISOString(),
          });
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Presence channel error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Login using Supabase Auth
  const login = async (credentials) => {
    loginInProgress.current = true;
    try {
      // Check auth settings for max attempts and lockout duration
      let maxAttempts = 5;
      let lockoutDuration = 15;
      try {
        const stored = localStorage.getItem('auth_settings');
        console.log('=== Loading auth_settings for login ===');
        console.log('Raw localStorage auth_settings:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Parsed auth_settings:', parsed);
          // Handle NaN/invalid values by falling back to defaults
          if (parsed.maxLoginAttempts && !isNaN(parsed.maxLoginAttempts) && parsed.maxLoginAttempts > 0) {
            maxAttempts = parsed.maxLoginAttempts;
          }
          if (parsed.lockoutDuration && !isNaN(parsed.lockoutDuration) && parsed.lockoutDuration > 0) {
            lockoutDuration = parsed.lockoutDuration;
          }
        }
        console.log('Final settings used:', { maxAttempts, lockoutDuration });
      } catch (e) {
        console.warn('Could not parse auth_settings:', e);
      }

      // Get user by email to check lockout status before attempting login
      let userByEmail = null;
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, locked_until, failed_login_attempts')
          .eq('email', credentials.email)
          .maybeSingle();

        if (!userError && userData) {
          userByEmail = userData;
        }
      } catch (queryError) {
        console.warn('Could not query user for lockout check (columns may not exist yet):', queryError);
      }

      // Check if account is locked
      if (userByEmail && userByEmail.locked_until && new Date(userByEmail.locked_until) > new Date()) {
        const lockTime = new Date(userByEmail.locked_until);
        const remainingTime = Math.ceil((lockTime - new Date()) / 60000); // minutes
        throw new Error(`Account is locked. Please try again in ${remainingTime} minutes.`);
      }

      const { data, error } = await supabaseHelpers.signIn(credentials.email, credentials.password);

      if (error) {
        // Increment failed login attempts if user exists in database
        if (userByEmail) {
          try {
            const { data: lockResult, error: lockError } = await supabase.rpc('increment_failed_attempts', {
              user_id: userByEmail.id,
              max_attempts: maxAttempts,
              lockout_minutes: lockoutDuration
            });

            if (!lockError && lockResult) {
              throw new Error(`Account locked due to too many failed attempts. Please try again in ${lockoutDuration} minutes.`);
            } else if (!lockError && !lockResult) {
              const remainingAttempts = maxAttempts - (userByEmail.failed_login_attempts || 0) - 1;
              throw new Error(`Invalid email or password. ${remainingAttempts} attempts remaining.`);
            }
          } catch (rpcError) {
            console.error('Failed to track login attempts (RPC function may not exist):', rpcError);
            // If RPC function doesn't exist, just show standard error message
            // This allows login to work even if the tracking functions aren't set up
          }
        }

        // Friendly error messages
        if (error.message?.toLowerCase().includes("invalid login credentials")) {
          throw new Error("Invalid email or password. Please try again.");
        }
        throw new Error(error.message || "Login failed. Please try again.");
      }

      if (!data?.user) {
        throw new Error("Login failed. Please try again.");
      }

      // Fetch or auto-create user profile from public.users
      // ensureProfile ALWAYS returns a profile (falls back to auth metadata)
      const profile = await ensureProfile(data.user);

      if (profile && !profile.is_active) {
        await supabaseHelpers.signOut();
        throw new Error("Your account has been deactivated. Please contact the administrator.");
      }

      // Reset failed login attempts on successful login
      try {
        await supabase.rpc('reset_login_attempts', { user_id: profile.id });
      } catch (resetError) {
        console.warn('Failed to reset login attempts (RPC function may not exist):', resetError);
        // Don't block login if reset function doesn't exist
      }

      // Log login event to audit trail using centralized logging
      try {
        await logAuditEvent('user.login', 'System Login', profile.id, {
          email: profile.email,
          role: profile.role
        });
      } catch (auditError) {
        console.error("Failed to log login event:", auditError);
        // Don't block login if audit logging fails
      }

      // Store login time for session duration calculation
      localStorage.setItem('login_time', new Date().toISOString());

      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
      // Dispatch event for MaintenanceGuard
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: profile } }));
      return profile;
    } finally {
      loginInProgress.current = false;
    }
  };

  // Logout using Supabase Auth
  const logout = async () => {
    // Log logout event to audit trail before signing out using centralized logging
    if (user) {
      try {
        // Calculate session duration (simplified - in production you'd track actual login time)
        const loginTime = localStorage.getItem('login_time') || new Date().toISOString();
        const sessionDuration = Math.round((new Date() - new Date(loginTime)) / 1000 / 60); // in minutes
        
        await logAuditEvent('user.logout', 'System Logout', user.id, {
          session_duration: `${sessionDuration} minutes`
        });
      } catch (auditError) {
        console.error("Failed to log logout event:", auditError);
        // Don't block logout if audit logging fails
      }
    }

    await supabaseHelpers.signOut();
    
    // Clear all authentication-related localStorage items
    const keysToRemove = [
      "logged_out",
      "logout_message",
      "auth_settings",
      "maintenance_mode",
      "maintenance_message",
      "login_time",
      "user",
      // Clear all OTP-related data
      ...Object.keys(localStorage).filter(key => key.startsWith('otp_')),
      ...Object.keys(localStorage).filter(key => key.startsWith('otp_verified_at_')),
      // Clear any auto-saved form data
      ...Object.keys(localStorage).filter(key => key.includes('draft') || key.includes('form')),
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key}:`, e);
      }
    });

    // Clear session storage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn("Failed to clear session storage:", e);
    }

    // Force light mode on logout so public view is always light
    localStorage.setItem("vite-ui-theme", "light");
    
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    
    setUser(null);
    localStorage.removeItem('user');
    // Dispatch event for MaintenanceGuard
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null } }));
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        onlineUsers,
        maintenanceMode,
        reloadSystemSettings,
        cleanupAuthSettings,
        login,
        logout,
        validatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.error("useAuth must be used within AuthProvider");
    // Return a safe fallback to prevent app crash
    return {
      user: null,
      setUser: () => {},
      loading: true,
      onlineUsers: new Set(),
      maintenanceMode: false,
      reloadSystemSettings: () => {},
      cleanupAuthSettings: () => {},
      login: async () => ({ error: new Error("Auth context not available") }),
      logout: async () => {},
      validatePassword: () => ({ valid: false, errors: [] }),
    };
  }
  return ctx;
}
