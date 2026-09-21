import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Key, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth.jsx";
import LoginOverlay from "@/components/LoginOverlay.jsx";
import emailjs from '@emailjs/browser';
import { supabase } from "@/lib/supabase.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [pendingDest, setPendingDest] = useState("/");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [otpTimer, setOtpTimer] = useState(180);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [isSessionTimeout, setIsSessionTimeout] = useState(false);
  const [showOtpBypassNotice, setShowOtpBypassNotice] = useState(false);
  const [bypassTimeRemaining, setBypassTimeRemaining] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  React.useEffect(() => {
    const logoutMsg = localStorage.getItem("logout_message");
    if (logoutMsg) {
      setError(logoutMsg);
      localStorage.removeItem("logout_message");
      setIsSessionTimeout(true); // Mark as session timeout
      // Clear form fields on session timeout
      setForm({ email: "", password: "", otp: "" });
      setShowPassword(false);
      
      // Show additional session timeout information
      setSuccessMsg("Session Timeout: Your previous session has expired due to inactivity. Please log in again to continue.");
    } else if (localStorage.getItem("logged_out") === "true") {
      setSuccessMsg("Logged out successfully.");
      localStorage.removeItem("logged_out");
      // Clear form fields on logout to prevent auto-fill
      setForm({ email: "", password: "", otp: "" });
      setShowPassword(false);
    }
    
    // Always clear form fields on component mount to prevent saved credentials
    setForm({ email: "", password: "", otp: "" });
    setShowPassword(false);
    
    // Clear browser autocomplete on mount
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';

    // Handle OAuth callback from Google Sign-In
    const handleOAuthCallback = async () => {
      console.log("=== OAuth Callback Started ===");
      console.log("Current URL:", window.location.href);

      try {
        // Use Supabase's built-in OAuth session handling
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setError('Authentication failed. Please try again.');
          return;
        }

        if (!session) {
          console.error("No session found, trying to get session from URL");
          // Try to get session from URL parameters
          const { data: { session: urlSession }, error: urlError } = await supabase.auth.getSessionFromUrl();

          if (urlError || !urlSession) {
            console.error("Failed to get session from URL:", urlError);
            setError('Authentication failed. Please try again.');
            return;
          }

          if (!urlSession) {
            console.error("Still no session after URL processing");
            setError('Authentication failed. No session established.');
            return;
          }

          console.log("Session from URL found for:", urlSession.user.email);
        } else {
          console.log("Session found for:", session.user.email);
        }

        // Get the actual session (either from getSession or getSessionFromUrl)
        const actualSession = session || (await supabase.auth.getSessionFromUrl()).data.session;

        if (!actualSession) {
          console.error("No actual session available");
          setError('Authentication failed. Please try again.');
          return;
        }

        // Check if user exists in database
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', actualSession.user.id)
          .maybeSingle();

        if (userError) {
          console.error("User lookup error:", userError);
        }

        if (!existingUser) {
          console.log("Creating new user profile");
          // Create user profile from Google OAuth data - ONLY for residents (public role)
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: actualSession.user.id,
              email: actualSession.user.email,
              name: actualSession.user.user_metadata?.full_name || actualSession.user.email?.split('@')[0] || 'User',
              role: 'public', // Google Sign-In only for residents
              is_active: true,
            });

          if (insertError) {
            console.error('Error creating user profile:', insertError);
          } else {
            console.log("User profile created successfully");
          }
        } else {
          console.log("Existing user found:", existingUser.email, "Role:", existingUser.role);
          // Check if existing user has restricted role (staff, admin, super_admin)
          if (existingUser.role === 'staff' || existingUser.role === 'admin' || existingUser.role === 'super_admin') {
            // Sign out restricted users from Google Sign-In
            await supabase.auth.signOut();
            setError('Google Sign-In is only available for residents. Staff and admin accounts must use email/password login.');
            return;
          }
        }

        // Clear URL parameters to prevent re-processing
        window.history.replaceState({}, document.title, window.location.pathname);

        console.log("Redirecting to resident dashboard...");
        // Always redirect to resident dashboard for Google Sign-In users (residents only)
        window.location.href = '/';
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Authentication failed. Please try again.');
      }
    };

    // Check for OAuth callback on mount
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (urlParams.has('access_token') || urlParams.has('code') || hashParams.has('access_token') || hashParams.has('code')) {
      console.log("OAuth callback detected in URL");
      handleOAuthCallback();
    }
  }, []);

  // Check for recent OTP verification when email changes
  React.useEffect(() => {
    if (form.email) {
      const recentVerification = localStorage.getItem(`otp_verified_at_${form.email}`);
      const isWithin3Minutes = recentVerification && (Date.now() - parseInt(recentVerification)) < 3 * 60 * 1000;
      setShowOtpBypassNotice(isWithin3Minutes);
      
      if (isWithin3Minutes && recentVerification) {
        const elapsed = Date.now() - parseInt(recentVerification);
        const remaining = 3 * 60 * 1000 - elapsed;
        setBypassTimeRemaining(Math.max(0, Math.floor(remaining / 1000)));
      } else {
        setBypassTimeRemaining(0);
      }
      
      // Clean up expired OTP verification timestamps
      if (recentVerification && !isWithin3Minutes) {
        localStorage.removeItem(`otp_verified_at_${form.email}`);
      }
    } else {
      setShowOtpBypassNotice(false);
      setBypassTimeRemaining(0);
    }
  }, [form.email]);

  // Bypass timer countdown
  React.useEffect(() => {
    let interval;
    if (showOtpBypassNotice && bypassTimeRemaining > 0) {
      interval = setInterval(() => {
        setBypassTimeRemaining((prev) => {
          const newTime = prev - 1;
          if (newTime === 0) {
            setShowOtpBypassNotice(false);
            // Clean up expired timestamp
            if (form.email) {
              localStorage.removeItem(`otp_verified_at_${form.email}`);
            }
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtpBypassNotice, bypassTimeRemaining, form.email]);

  // OTP Timer countdown
  React.useEffect(() => {
    let interval;
    if (showOTP && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setShowOTP(false);
      setError("OTP expired. Please try again.");
      setForm({ ...form, otp: "" });
    }
    return () => clearInterval(interval);
  }, [showOTP, otpTimer, form]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Check if account is locked based on auth settings
  const isAccountLocked = (email) => {
    try {
      const authSettings = JSON.parse(localStorage.getItem('auth_settings') || '{}');
      const maxAttempts = authSettings.maxLoginAttempts || 5;
      const lockoutDuration = authSettings.lockoutDuration || 15;
      
      const loginAttempts = JSON.parse(localStorage.getItem(`login_attempts_${email}`) || '{}');
      const { attempts, lastAttemptTime } = loginAttempts;
      
      if (attempts >= maxAttempts && lastAttemptTime) {
        const lockoutEndTime = new Date(lastAttemptTime).getTime() + (lockoutDuration * 60 * 1000);
        const currentTime = new Date().getTime();
        
        if (currentTime < lockoutEndTime) {
          const remainingMinutes = Math.ceil((lockoutEndTime - currentTime) / (60 * 1000));
          return { locked: true, remainingMinutes };
        } else {
          // Lockout period expired, reset attempts
          localStorage.removeItem(`login_attempts_${email}`);
          return { locked: false };
        }
      }
      
      return { locked: false };
    } catch (e) {
      console.warn('Error checking account lock status:', e);
      return { locked: false };
    }
  };

  // Record failed login attempt
  const recordFailedAttempt = (email) => {
    try {
      const authSettings = JSON.parse(localStorage.getItem('auth_settings') || '{}');
      const maxAttempts = authSettings.maxLoginAttempts || 5;
      
      const loginAttempts = JSON.parse(localStorage.getItem(`login_attempts_${email}`) || '{}');
      const newAttempts = (loginAttempts.attempts || 0) + 1;
      
      localStorage.setItem(`login_attempts_${email}`, JSON.stringify({
        attempts: newAttempts,
        lastAttemptTime: new Date().toISOString()
      }));
      
      if (newAttempts >= maxAttempts) {
        const lockoutDuration = authSettings.lockoutDuration || 15;
        return { locked: true, lockoutDuration };
      }
      
      return { locked: false, attemptsRemaining: maxAttempts - newAttempts };
    } catch (e) {
      console.warn('Error recording failed attempt:', e);
      return { locked: false };
    }
  };

  // Clear login attempts on successful login
  const clearLoginAttempts = (email) => {
    localStorage.removeItem(`login_attempts_${email}`);
  };

  const handleEmailSubmit = async (e) => {
    if (e) e.preventDefault();
    console.log("=== FORM SUBMITTED ===");
    console.log("Current form state:", form);
    console.log("Show OTP:", showOTP);
    console.log("Show Forgot Password:", showForgotPassword);
    
    // Validate that both email and password are provided
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }
    
    // Validate password minimum length from auth settings
    try {
      const authSettings = JSON.parse(localStorage.getItem('auth_settings') || '{}');
      const minLength = authSettings.passwordMinLength || 8;
      if (form.password.length < minLength) {
        setError(`Password must be at least ${minLength} characters long.`);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Error validating password length:', e);
    }
    
    // Check if account is locked
    const lockStatus = isAccountLocked(form.email);
    if (lockStatus.locked) {
      setError(`Account locked due to too many failed attempts. Please try again in ${lockStatus.remainingMinutes} minutes.`);
      setLoading(false);
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      console.log("=== DEBUG: Validating credentials first ===");
      console.log("Email being checked:", form.email);
      
      // First check if user exists and their role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, email')
        .eq('email', form.email)
        .maybeSingle();

      console.log("User data from database:", userData);
      console.log("User error:", userError);

      if (userError || !userData) {
        console.log("User not found or error occurred");
        setError("User not found");
        setLoading(false);
        return;
      }

      console.log("User role detected:", userData.role);
      
      // Now validate the password using Supabase Auth
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });

        if (authError) {
          console.log("Password validation failed:", authError);
          
          // Record failed login attempt
          const attemptResult = recordFailedAttempt(form.email);
          if (attemptResult.locked) {
            setError(`Account locked due to too many failed attempts. Please try again in ${attemptResult.lockoutDuration} minutes.`);
          } else {
            setError(`Invalid email or password. ${attemptResult.attemptsRemaining} attempts remaining.`);
          }
          
          setLoading(false);
          return;
        }

        console.log("Password validated successfully");
        
        // Clear login attempts on successful password validation
        clearLoginAttempts(form.email);
        
        // Sign out immediately since we just wanted to validate
        await supabase.auth.signOut();
      } catch (authErr) {
        console.log("Password validation error:", authErr);
        
        // Record failed login attempt for auth errors
        const attemptResult = recordFailedAttempt(form.email);
        if (attemptResult.locked) {
          setError(`Account locked due to too many failed attempts. Please try again in ${attemptResult.lockoutDuration} minutes.`);
        } else {
          setError(`Invalid email or password. ${attemptResult.attemptsRemaining} attempts remaining.`);
        }
        
        setLoading(false);
        return;
      }

      // Password is correct, now check OTP requirements
      console.log("Role requires OTP check:", userData.role === 'public' || userData.role === 'citizen' || userData.role === 'staff');

      // Check if user was recently verified within 3 minutes (bypass OTP) - applies to staff and residents
      const recentVerification = localStorage.getItem(`otp_verified_at_${form.email}`);
      const isWithin3Minutes = recentVerification && (Date.now() - parseInt(recentVerification)) < 3 * 60 * 1000;

      // Require OTP for residents (public/citizen) and staff, unless recently verified within 3 minutes
      if ((userData.role === 'public' || userData.role === 'citizen' || userData.role === 'staff') && !isWithin3Minutes) {
        console.log("=== Sending OTP ===");
        // Generate OTP
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes expiry to match bypass period
        setOtpExpiry(expiry);
        setOtpTimer(180);

        console.log("Generated OTP:", otp);
        console.log("OTP expiry:", expiry);

        // Store OTP in localStorage
        localStorage.setItem(`otp_${form.email}`, JSON.stringify({ otp, expiry: expiry.toISOString() }));

        // Send OTP via EmailJS with hardcoded credentials
        const templateParams = {
          to_email: form.email,
          to_name: form.email.split('@')[0],
          otp_code: otp,
          expiry_minutes: 3,
          logo_url: 'https://i.imgur.com/bphZEMi.png',
        };

        console.log("EmailJS template params:", templateParams);

        try {
          const emailResult = await emailjs.send(
            'service_crxpuvk',
            'template_mvs8aeu',
            templateParams,
            'R556DquxALj-fCV2G'
          );
          console.log("EmailJS result:", emailResult);
        } catch (emailError) {
          console.error("EmailJS error:", emailError);
          throw emailError;
        }

        setShowOTP(true);
        setSuccessMsg("OTP sent to your email. Valid for 3 minutes.");
        console.log("=== OTP sent successfully ===");
      } else {
        // Skip OTP for admins or recently verified users (within 3 minutes) - includes staff and residents
        if (isWithin3Minutes) {
          console.log("=== Bypassing OTP - recently verified within 3 minutes ===");
          const elapsed = Date.now() - parseInt(recentVerification);
          const remaining = 3 * 60 * 1000 - elapsed;
          setBypassTimeRemaining(Math.max(0, Math.floor(remaining / 1000)));
          setSuccessMsg("Recently verified. No OTP required.");
          setShowOtpBypassNotice(true);
        } else {
          console.log("=== No OTP required for role:", userData.role, "===");
        }
        
        // Proceed directly to login (no OTP needed)
        try {
          const user = await login({ email: form.email, password: form.password });

          // Validate user role before navigation
          if (!user || !user.role) {
            setError("Invalid user account. Please contact administrator.");
            setLoading(false);
            return;
          }

          let dest = "/";
          if (user.role === "super_admin") {
            dest = "/super-admin";
          } else if (user.role === "admin") {
            dest = "/admin";
          } else if (user.role === "staff") {
            dest = "/staff";
          } else if (user.role === "public" || user.role === "citizen") {
            dest = "/";
          } else {
            setError("Invalid user role. Please contact administrator.");
            setLoading(false);
            return;
          }

          setLoggedInUser(user);
          setPendingDest(dest);
          setLoggingIn(true);
        } catch (loginErr) {
          setError(loginErr.message || "Invalid email or password. Please try again.");
        }
      }
    } catch (err) {
      // Clear the stored OTP if email sending failed
      localStorage.removeItem(`otp_${form.email}`);
      console.error("General error in handleEmailSubmit:", err);
      setError("Failed to process login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate OTP
      const stored = localStorage.getItem(`otp_${form.email}`);
      if (!stored) {
        setError("OTP expired or invalid. Please request a new OTP.");
        setLoading(false);
        return;
      }

      const { otp, expiry } = JSON.parse(stored);
      const now = new Date();
      const expiryDate = new Date(expiry);

      if (now > expiryDate) {
        localStorage.removeItem(`otp_${form.email}`);
        setError("OTP expired. Please request a new OTP.");
        setLoading(false);
        return;
      }

      if (form.otp !== otp) {
        setError("Invalid OTP. Please try again.");
        setLoading(false);
        return;
      }

      // OTP is valid, proceed with password login
      handlePasswordLogin();
    } catch (err) {
      setError("Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!form.password) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const user = await login({ email: form.email, password: form.password });

      // Validate user role before navigation
      if (!user || !user.role) {
        setError("Invalid user account. Please contact administrator.");
        return;
      }

      // Clear OTP after successful login
      localStorage.removeItem(`otp_${form.email}`);
      
      // Clear login attempts on successful login
      clearLoginAttempts(form.email);
      
      // Save verification timestamp for 30-minute bypass
      localStorage.setItem(`otp_verified_at_${form.email}`, Date.now().toString());

      // Determine destination based on role
      let dest = "/";
      if (user.role === "super_admin") {
        dest = "/super-admin";
      } else if (user.role === "admin") {
        dest = "/admin";
      } else if (user.role === "staff") {
        dest = "/staff";
      } else if (user.role === "public" || user.role === "citizen") {
        dest = "/"; // Resident dashboard homepage
      } else {
        setError("Invalid user role. Please contact administrator.");
        return;
      }

      // Show animated overlay before navigating
      setLoggedInUser(user);
      setPendingDest(dest);
      setLoggingIn(true);
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      });

      if (error) throw error;

      // The OAuth flow will redirect, so we don't need to handle navigation here
      // The redirect will handle the authentication
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed. Please try again or use email login.");
    } finally {
      setGoogleLoading(false);
    }
  };




  const doNavigate = () => {
    navigate(pendingDest, { replace: true });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setResetLoading(true);

    try {
      // Generate reset token (simplified - in production, use proper backend)
      const resetToken = Math.random().toString(36).substring(2, 15);
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
      
      // Store token temporarily (in production, store in database)
      localStorage.setItem(`reset_token_${resetEmail}`, JSON.stringify({ 
        token: resetToken, 
        expiry: new Date(Date.now() + 30 * 60 * 1000).toISOString() 
      }));

      // Send reset email via EmailJS with hardcoded credentials
      const templateParams = {
        to_email: resetEmail,
        to_name: resetEmail.split('@')[0],
        reset_link: resetLink,
        expiry_minutes: 30,
        logo_url: 'https://i.imgur.com/bphZEMi.png',
      };

      await emailjs.send(
        'service_crxpuvk',
        'template_mvs8aeu',
        templateParams,
        'R556DquxALj-fCV2G'
      );

      setSuccessMsg("Password reset link sent to your email. Valid for 30 minutes.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (err) {
      setError("Failed to send reset email. Please check your email address or try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-barangay">
      {loggingIn && <LoginOverlay userName={loggedInUser?.name} onDone={doNavigate} />}
      {/* Left overlay panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-black/70 via-black/50 to-primary/30 text-white">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Barangay 178 Seal" className="h-14 w-14 rounded-full object-contain bg-white/10 p-1" />
            <div className="text-left">
              <p className="font-display font-bold text-lg leading-tight text-white">Barangay 178</p>
              <p className="text-xs text-white/70">Camarin, North Caloocan City</p>
            </div>
          </Link>
        </div>
        <div>
          <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
            Safety Campaign<br />Management System
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm">
            Empowering Barangay 178 officials and residents with AI-powered public safety campaigns, emergency alerts, and voice announcements powered by Google Cloud Text-to-Speech.
          </p>
          <div className="flex gap-2 mt-6 flex-wrap">
            {["Faith", "Love", "Service"].map((v) => (
              <span key={v} className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm border border-white/20">{v}</span>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Barangay 178 · AI Voice by Google Cloud TTS</p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white/90 backdrop-blur-md lg:bg-white/95 relative">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-6 text-center">
            <Link to="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Barangay 178 Seal" className="h-16 w-16 rounded-full object-contain mb-3 shadow-lg" />
              <h1 className="font-display text-xl font-bold text-foreground">Barangay 178</h1>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">Safety Campaign Management System</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{showForgotPassword ? "Reset Password" : (showOTP ? "Enter OTP" : "Log in")}</CardTitle>
              <CardDescription>
                {showForgotPassword ? "Enter your email to receive a password reset link." : 
                 (showOTP ? `Enter the 6-digit code sent to your email. Expires in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` : 
                 (showOtpBypassNotice ? `No OTP required - recently verified (bypass expires in ${Math.floor(bypassTimeRemaining / 60)}:${(bypassTimeRemaining % 60).toString().padStart(2, '0')})` : "Enter your credentials to continue"))}
              </CardDescription>
            </CardHeader>
            <form onSubmit={showForgotPassword ? handleForgotPassword : (showOTP ? handleOTPSubmit : handleEmailSubmit)} autoComplete="off" noValidate>
              <CardContent className="space-y-4">
                {showForgotPassword ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={isSessionTimeout ? "reset-email-timeout" : "reset-email"}
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          autoComplete="off"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmail("");
                        setError("");
                      }}
                      className="w-full"
                    >
                      Back to login
                    </Button>
                  </>
                ) : !showOTP && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={isSessionTimeout ? "email-timeout" : "email"}
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          autoComplete="off"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={isSessionTimeout ? "password-timeout" : "password"}
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          autoComplete="off"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs"
                      >
                        Forgot password?
                      </Button>
                    </div>
                  </>
                )}

                {showOTP && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">One-Time Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          required
                          placeholder="123456"
                          maxLength={6}
                          value={form.otp}
                          onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                          autoComplete="off"
                          className="pl-10 text-center text-2xl tracking-widest"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowOTP(false);
                        setForm({ ...form, otp: "" });
                        setError("");
                        setSuccessMsg("");
                      }}
                      className="w-full"
                    >
                      Back to email
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowOTP(false);
                        setForm({ ...form, otp: "" });
                        setError("");
                        // Resend OTP by submitting the form again
                        handleEmailSubmit();
                      }}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Resending..." : "Resend OTP"}
                    </Button>
                  </>
                )}

                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
                {successMsg && (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    {successMsg}
                  </p>
                )}
                {isSessionTimeout && (
                  <div className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                    <p className="text-sm text-orange-800 font-medium">⏰ Session Timeout Notice</p>
                    <p className="text-xs text-orange-700 mt-1">Your previous session expired due to inactivity. Please log in again to continue.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading || resetLoading}>
                  {resetLoading ? "Sending…" : loading ? "Processing…" : showForgotPassword ? "Send Reset Link" : showOTP ? "Verify & Sign in" : "Login"}
                </Button>

                {!showForgotPassword && !showOTP && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">or</span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                    >
                      {googleLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Connecting to Google...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-.25 0-1.93-.67-2.67-1.84l-2.77 2.77h-8.8v4.25H12z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.98 1 4.63 3.6 2.18 7.07l3.66 2.84c.87-2.6 3.3-5.53 3.3-5.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Sign in with Google
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center w-full">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-primary font-medium hover:underline">
                        Register here
                      </Link>
                    </p>
                  </>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
